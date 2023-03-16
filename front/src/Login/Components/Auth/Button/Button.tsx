import React from 'react';
import './Button.css';

interface ButtonProps {
	content: string;
	bottom: string;
}

const Button = ({content, bottom} : ButtonProps) => {
	return (
		<div 
			className={bottom === 'true' ? 'button-wrapper bottom' : 'button-wrapper'}>
			<button>{content}</button>
		</div>
	);
}

export default Button;