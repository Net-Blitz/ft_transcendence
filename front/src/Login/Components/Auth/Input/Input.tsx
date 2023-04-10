import React from 'react';
import './Input.css';
/*	RESSOURCES	*/
import Padlock from './Ressources/padlock_white.png';
import IdCard from './Ressources/id_card_white.png';

interface InputProps {
	input_title: string;
	placeholder: string;
	icon: string;
	error?: string;
}

const Input = ({ input_title, placeholder, icon, error }: InputProps) => {
	return (
		<div className="input-wrapper">
			<div className='input-box'>
				<div className="logo-input-wrapper">
					<img
						src={icon === 'id_card' ? IdCard : Padlock}
						alt="cadenas"
					/>
				</div>
				<div>
					<p>{input_title}</p>
					<input type="text" placeholder={placeholder} />
				</div>
			</div>
			{error && <p className="error">{error}</p>}
		</div>
	);
};
export default Input;
