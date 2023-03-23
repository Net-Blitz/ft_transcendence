import React from 'react';
import './Button.css';

interface ButtonProps {
	content: string;
	bottom: string;
	href: string;
}

const Button = ({ content, bottom, href }: ButtonProps) => {
	return (
		<div
			className={
				bottom === 'true' ? 'button-wrapper bottom' : 'button-wrapper'
			}
		>
			<a href={href}>
				<button>{content}</button>
			</a>
		</div>
	);
};

export default Button;
