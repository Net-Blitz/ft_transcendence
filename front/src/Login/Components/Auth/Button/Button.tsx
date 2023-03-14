import React from 'react';
import './Button.css';

interface ButtonProps {
	content: string;
}

export default function Button({content} : ButtonProps) {
	return (
		<div className='button_wrapper'>
			<button>{content}</button>
		</div>
	);
}