import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useStore } from 'react-redux';
import './ProfileConfig.css';
/*	Components	*/
import Input from '../../../Login/Components/Auth/Input/Input';
import Carousel from '../../../Login/Components/Auth/Carousel/Carousel';
import Button from '../../../Login/Components/Auth/Button/Button';
/*	Functions	*/
import { generateAvatars } from '../../../Login/Components/Auth/Carousel/genAvatars';
import { inputProtectionPseudo } from '../../../Login/Components/Auth/Input/inputProtection';
import { fetchOrUpdateUser } from '../../../utils/redux/user';
/*	Ressources	*/
import close from './Ressources/close.svg';
import id from './Ressources/id.svg';
import refresh from './Ressources/refresh.svg';

interface ProfileConfigProps {
	handleTrigger: () => void;
}

export const ProfileConfig = ({ handleTrigger }: ProfileConfigProps) => {
	const [currentIndex, setCurrentIndex] = useState(0);
	const [avatar, setAvatar] = useState(generateAvatars(12));
	const [usernames, setUsernames] = useState<string[]>([]);
	const [inputError, setInputError] = useState('');
	const me = document.getElementsByClassName('popup');
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
				'.profileconfig-wrapper .input-wrapper input'
			)?.value;
		if (inputPseudo) {
			const error: string = inputProtectionPseudo(inputPseudo, usernames);
			if (error === '') {
				const formData = new FormData();
				formData.append('username', inputPseudo);
				formData.append('file', avatar[currentIndex].file);
				try {
					await axios.post(
						'http://localhost:3333/users/updateconfig',
						formData,
						{
							withCredentials: true,
						}
					);
					await fetchOrUpdateUser(store);
					window.location.reload();
				} catch (error) {
					console.error(error);
					window.location.reload();
				}
			} else setInputError(error);
		} else setInputError('Please enter a pseudo');
	}, [avatar, currentIndex, usernames, store]);

	useEffect(() => {
		window.onclick = (event: any) => {
			if (event.target === me[0]) {
				handleTrigger();
			}
		};
	}, [me, handleTrigger]);

	return (
		<div className="profileconfig-wrapper">
			<img src={close} alt="close-button" onClick={handleTrigger} />
			<h2>My profile</h2>
			<Input
				input_title="Pseudo"
				placeholder="Enter your pseudo"
				icon={id}
				error={inputError}
			/>
			<Carousel
				currentIndex={currentIndex}
				setCurrentIndex={setCurrentIndex}
				avatar={avatar}
				setAvatar={setAvatar}
				refresh={refresh}
			/>
			<Button
				content="Save"
				bottom={true}
				href=""
				absolut={true}
				onClick={handleClick}
			/>
		</div>
	);
};
