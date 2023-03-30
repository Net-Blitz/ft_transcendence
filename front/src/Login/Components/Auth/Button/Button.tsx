import React from 'react';
import { Link } from 'react-router-dom';
import './Button.css';

interface ButtonProps {
	content: string;
	bottom: boolean;
	href: string;
	absolut: boolean;
	state?: string;
}

const Button = ({ content, bottom, href, absolut, state }: ButtonProps) => {
	return (
		<div
			className={
				bottom === true ? 'button-wrapper bottom' : 'button-wrapper'
			}
		>
			<Link
				to={href} 
				relative={absolut === true ? 'path' : undefined}
				state={state ? {prec: state} : undefined}
			>
				<button>{content}</button>
			</Link>
		</div>
	);
};

export default Button;
