import React, { useEffect, useState } from 'react';
import './ProfileConfig.css';
/*	Components	*/
import Input from '../../../Login/Components/Auth/Input/Input';
import Carousel from '../../../Login/Components/Auth/Carousel/Carousel';
import Button from '../../../Login/Components/Auth/Button/Button';
/*	Functions	*/
import { generateAvatars } from '../../../Login/Components/Auth/Carousel/genAvatars';
/*	Ressources	*/
import close from './Ressources/close.svg';
import id from './Ressources/id.svg';
import refresh from './Ressources/refresh.svg';

interface PopUpProps {
	trigger: boolean;
	children: any;
}

interface ProfileConfigProps {
	handleTrigger: () => void;
}

export const PopUp = ({ trigger, children }: PopUpProps) => {
	return trigger ? <div className="popup">{children}</div> : <div></div>;
};

export const ProfileConfig = ({ handleTrigger }: ProfileConfigProps) => {
	const [currentIndex, setCurrentIndex] = useState(0);
	const [avatar, setAvatar] = useState(generateAvatars(12));
	const me = document.getElementsByClassName('popup');

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
			/>
			<Carousel
				currentIndex={currentIndex}
				setCurrentIndex={setCurrentIndex}
				avatar={avatar}
				setAvatar={setAvatar}
				refresh={refresh}
			/>
			<Button content="Save" bottom={true} href="" absolut={true} />
		</div>
	);
};
