import React from 'react';
import { useState } from 'react';
import './SimpleToggle.css';
import { SimpleToggleProps } from '../types';

export const SimpleToggle = ({ toggled, onClick }: SimpleToggleProps) => {
	const [isToggled, toggle] = useState(toggled);

	const callback = () => {
		toggle(!isToggled);
		onClick(!isToggled);
	};

	return (
		<label className="simpletoggle-wrapper">
			<input
				type="checkbox"
				defaultChecked={isToggled}
				onClick={callback}
			/>
			<span />
		</label>
	);
};
