import React from 'react';
import './Button.css';

interface ButtonProps {
	content: string;
	bottom: string;
}

export default function Button({content, bottom} : ButtonProps) {
	return (
		<div 
			className={bottom === 'true' ? 'button_wrapper bottom' : 'button_wrapper'}>
			<button>{content}</button>
		</div>
	);
}