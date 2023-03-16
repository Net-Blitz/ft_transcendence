import React from 'react';
import './Input.css';
import Padlock from './padlock.jpg'
import IdCard from './id_card.jpg'

interface InputProps {
	input_title: string;
	placeholder: string;
	icon: string;
}

export default function Input({input_title, placeholder, icon} : InputProps) {
	return (
		<div className='input_wrapper'>
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