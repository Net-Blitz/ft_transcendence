import React, { useState } from 'react';
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

export const PopUp = (props: any) => {
	return props.trigger ? (
		<div className="popup">
			<div className="popup-inner">{props.children}</div>
		</div>
	) : (
		<div></div>
	);
};

export const ProfileConfig = (props: any) => {
	const [currentIndex, setCurrentIndex] = useState(0);
	const [avatar, setAvatar] = useState(generateAvatars(12));

	return (
		<div className="profileconfig-wrapper">
			<img src={close} alt="close-button" />
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
