import React from 'react';
import './Input.css';
/*	RESSOURCES	*/
import Padlock from './Ressources/padlock.jpg'
import IdCard from './Ressources/id_card.jpg'

interface InputProps {
	input_title: string;
	placeholder: string;
	icon: string;
}

const Input = ({input_title, placeholder, icon} : InputProps) => {
	return (
		<div className='input-wrapper'>
			<div><img 
					src={icon === 'id_card' ? IdCard : Padlock} 
					alt='cadenas' />
			</div>
			<div>
				<p>{input_title}</p>
				<input type='text' placeholder={placeholder}/>
			</div>
		</div>
	);
}
export default Input;