import React from 'react';
import './MiddleInfo.css';
import { BasicFrameProps } from '../../types';
import { DonutLevel } from './Components/DonutLevel/DonutLevel';
import { Achievements } from './Components/Achievements/Achievements';

export const BasicFrame = ({
	height,
	width,
	title,
	children,
}: BasicFrameProps) => {
	return (
		<div className="basic-frame" style={{ height: height, width: width }}>
			<div className="title-wrapper">
				<h3>{title}</h3>
			</div>
			<div className="content-wrapper">{children}</div>
		</div>
	);
};

export const MiddleInfo = () => {
	return (
		<div className="middleinfo-wrapper">
			<Achievements />
			<DonutLevel />
		</div>
	);
};
