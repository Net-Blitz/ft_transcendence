import React from 'react';
import Input from '../../../Login/Components/Auth/Input/Input';
import './ProfileConfig.css';
/*	Ressources	*/
import close from './Ressources/close.svg';
import id from './Ressources/id.svg';

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
	return (
		<div className="profileconfig-wrapper">
			<img src={close} alt="close-button" />
			<h2>My profile</h2>
			<Input
				input_title="Pseudo"
				placeholder="Enter your pseudo"
				icon={id}
			/>
		</div>
	);
};
