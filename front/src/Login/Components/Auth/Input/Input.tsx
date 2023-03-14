import React from 'react';
import './Input.css';
import Padlock from './padlock.jpg'

interface InputProps {
	input_title: string;
	placeholder: string;
}

export default function Input({input_title, placeholder} : InputProps) {
	return (
		<div className='input_wrapper'>
			<div><img src={Padlock} alt='cadenas' /></div>
			<div>
				<p>{input_title}</p>
				<input type='text' placeholder={placeholder}/>
			</div>
		</div>
	);
}