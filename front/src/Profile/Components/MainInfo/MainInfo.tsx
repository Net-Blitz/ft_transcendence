import React from 'react';
import './MainInfo.css';
import { InfoElementProps } from './types';

const InfoElement = ({
	title,
	content,
	isToggle,
	border,
}: InfoElementProps) => {
	return (
		<div className={border ? 'info-element border' : 'info-element'}>
			<h3>{title}</h3>
			{isToggle ? <button>Toggle</button> : <p>{content}</p>}
		</div>
	);
};

export const MainInfo = () => {
	return (
		<div className="maininfo-wrapper">
			<InfoElement title="Status" content="Online" border={true} />
			<InfoElement title="Total game" content="1976" border={true} />
			<InfoElement title="Win" content="68%" />
		</div>
	);
};
