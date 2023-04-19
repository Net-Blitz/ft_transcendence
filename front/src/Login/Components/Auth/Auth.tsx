import React, { useCallback, useEffect, useState } from 'react';
import {
	Navigate,
	useLocation,
	useNavigate,
	useParams,
} from 'react-router-dom';
import { generateAvatars } from './Carousel/genAvatars';
import axios from 'axios';
import Cookies from 'js-cookie';
import './Auth.css';
/*	COMPONENTS	*/
import Input from './Input/Input';
import Title from './Title/Title';
import Button from './Button/Button';
import Carousel from './Carousel/Carousel';
import Toggle from './Toggle/Toggle';
import QRCode from './QRCode/QrCode';
/*	SELECTORS	*/
import { useSelector, useStore } from 'react-redux';
import { selectUserData, selectUserAuth } from '../../../utils/redux/selectors';
/*	FUNCTIONS	*/
import {
	inputProtectionPseudo,
	inputProtectionQR,
} from './Input/inputProtection';
import { fetchOrUpdateUser } from '../../../utils/redux/user';
/* RESSOURCES */
import Padlock from './Input/Ressources/padlock_white.png';
import IdCard from './Input/Ressources/id_card_white.png';
import refresh from './Carousel/Ressources/refresh.png';

export const AuthStart = () => {
	const isAuth = useSelector(selectUserAuth);

	if (isAuth) return <Navigate to="/" />;

	return (
		<div className="authstart-wrapper">
			<Title title="Welcome" subtitle="" />
			<Button
				content="Login with 42"
				bottom={false}
				href="https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-f157f9462f604eede6bbea3f75533e279c51636777b283bfe57dfcb391784532&redirect_uri=http%3A%2F%2Flocalhost%3A3333%2Fauth%2Fcallback&response_type=code"
				absolut={true}
			/>
		</div>
	);
};

export const Auth2fa = () => {
	const [inputError, setInputError] = useState('');
	const { login } = useParams();
	const navigate = useNavigate();
	const store = useStore();
	const isAuth = useSelector(selectUserAuth);

	const handleClick2fa = useCallback(async () => {
		const inputKey: string | undefined =
			document.querySelector<HTMLInputElement>(
				'.input-wrapper input'
			)?.value;
		if (inputKey) {
			const error: string = inputProtectionQR(inputKey);
			if (error === '') {
				try {
					const response = await axios.post(
						'http://localhost:3333/auth/2fa/verifylogin',
						{ inputKey, login },
						{
							withCredentials: true,
						}
					);
					Cookies.set('jwt', response.data.token);
					await fetchOrUpdateUser(store);
					navigate('/');
				} catch (error) {
					setInputError('Invalid key');
				}
			} else setInputError(error);
		} else setInputError('Please enter a key');
	}, [navigate, login, store]);

	if (isAuth) return <Navigate to="/" />;

	return (
		<div className="auth2fa-wrapper">
			<Title title="Welcome" subtitle="" />
			<Input
				input_title="Generated code"
				placeholder="enter the generated code"
				icon={Padlock}
				error={inputError}
			/>
			<Button
				onClick={handleClick2fa}
				content="Login with 42"
				bottom={false}
				absolut={true}
				href=""
			/>
		</div>
	);
};

export const AuthConfig = () => {
	const isConfig = useSelector(selectUserData).config;
	const [inputError, setInputError] = useState('');
	const [usernames, setUsernames] = useState<string[]>([]);
	const [currentIndex, setCurrentIndex] = useState(0);
	const [avatar, setAvatar] = useState(generateAvatars(12));
	const navigate = useNavigate();
	const store = useStore();

	useEffect(() => {
		async function fetchData() {
			try {
				const response = await axios.get(
					'http://localhost:3333/users/all/pseudo',
					{
						withCredentials: true,
					}
				);
				const usernames = response.data;
				setUsernames(usernames);
			} catch (error) {
				console.error(error);
			}
		}
		fetchData();
	}, []);

	const handleClick = useCallback(async () => {
		const inputPseudo: string | undefined =
			document.querySelector<HTMLInputElement>(
				'.input-wrapper input'
			)?.value;
		if (inputPseudo) {
			const error: string = inputProtectionPseudo(inputPseudo, usernames);
			if (error === '') {
				const formData = new FormData();
				formData.append('username', inputPseudo);
				formData.append('file', avatar[currentIndex].file);
				try {
					await axios.post(
						'http://localhost:3333/users/config',
						formData,
						{
							withCredentials: true,
						}
					);
					await fetchOrUpdateUser(store);
					navigate('/login/2faconfig', { state: { prec: true } });
				} catch (error) {
					navigate('/login/config');
				}
			} else setInputError(error);
		} else setInputError('Please enter a pseudo');
	}, [usernames, currentIndex, avatar, navigate, store]);

	if (isConfig === true) return <Navigate to="/" replace />;

	return (
		<div className="authnameavatar-wrapper">
			<Title
				title="Welcome"
				subtitle="please enter your pseudo and choose your avatar"
			/>
			<Input
				input_title="Pseudo"
				placeholder="enter your pseudo"
				icon={IdCard}
				error={inputError}
			/>
			<Carousel
				avatar={avatar}
				currentIndex={currentIndex}
				setCurrentIndex={setCurrentIndex}
				setAvatar={setAvatar}
				refresh={refresh}
			/>
			<Button
				onClick={handleClick}
				content="Continue"
				bottom={true}
				href=""
				absolut={false}
				state="config"
			/>
		</div>
	);
};

export const Auth2faConfig = () => {
	const [statusState, setStatusState] = useState(false);
	const { state } = useLocation();
	const navigate = useNavigate();
	const [inputError, setInputError] = useState('');
	const store = useStore();
	const twoFactor = useSelector(selectUserData).twoFactor;

	const handleClick2fa = useCallback(async () => {
		const inputKey: string | undefined =
			document.querySelector<HTMLInputElement>(
				'.input-wrapper input'
			)?.value;
		if (inputKey) {
			const error: string = inputProtectionQR(inputKey);
			if (error === '') {
				try {
					await axios.post(
						'http://localhost:3333/auth/2fa/verify',
						{ inputKey },
						{
							withCredentials: true,
						}
					);
					await fetchOrUpdateUser(store);
					navigate('/');
				} catch (error) {
					setInputError('Invalid key');
				}
			} else setInputError(error);
		} else setInputError('Please enter a key');
	}, [navigate, store]);

	if ((!state && inputError === '') || twoFactor === true) {
		return <Navigate to="/" replace />;
	}

	return (
		<div
			className={
				statusState === false
					? 'auth2faconfig-no-wrapper'
					: 'auth2faconfig-yes-wrapper'
			}>
			<Title title="Welcome" subtitle="Do you want to configure 2FA ?" />
			<Toggle statusState={statusState} setStatusState={setStatusState} />
			{statusState && (
				<div
					style={{
						width: '100%',
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
					}}>
					<QRCode />
					<Input
						input_title="Generate code"
						placeholder="enter the generated code"
						icon={Padlock}
						error={inputError}
					/>
				</div>
			)}
			<Button
				onClick={statusState ? handleClick2fa : undefined}
				content="Login with 42"
				bottom={statusState ? false : true}
				href={!statusState ? '/' : ''}
				absolut={true}
			/>
		</div>
	);
};