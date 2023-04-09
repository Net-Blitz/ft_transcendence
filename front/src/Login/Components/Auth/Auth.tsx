import React, { useCallback, useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { generateAvatars } from './Carousel/genAvatars';
import axios from 'axios';
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
import { selectUserData } from '../../../utils/redux/selectors';
/*	FUNCTIONS	*/
import {
	inputProtectionPseudo,
	inputProtectionQR,
} from './Input/inputProtection';
import { fetchOrUpdateUser } from '../../../utils/redux/user';

export const AuthStart = () => {
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
	const twoFactor = useSelector(selectUserData).twoFactor;
	const avatar_url = useSelector(selectUserData).avatar;

	if (avatar_url === null)
		return <Navigate to="/login/name&avatar" replace />;
	if (twoFactor === false) return <Navigate to="/" replace />;
	return (
		<div className="auth2fa-wrapper">
			<Title title="Welcome" subtitle="" />
			<Input
				input_title="Generated code"
				placeholder="enter the generated code"
				icon="padlock"
			/>
			<Button
				content="Login with 42"
				bottom={false}
				href=""
				absolut={true}
			/>
		</div>
	);
};

export const AuthNameAvatar = () => {
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
				icon="id_card"
				error={inputError}
			/>
			<Carousel
				avatar={avatar}
				currentIndex={currentIndex}
				setCurrentIndex={setCurrentIndex}
				setAvatar={setAvatar}
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

	if (!state && inputError === '') {
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
						icon="padlock"
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
