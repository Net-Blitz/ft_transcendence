import React, { useState, useCallback } from 'react';
import './DmElement.css';
/*	Components	*/
import { PopUp } from '../../Profile/Components/MainInfo/MainInfo';
/*	Ressources	*/
import close from '../../Profile/Components/MainInfo/Ressources/close.svg';

const NewDm = () => {
	return (
		<div className="new-dm">
			<img src={close} alt="close-button" />
			<h3>NewDM</h3>
		</div>
	);
};

const Aside = ({ buttonContent }: { buttonContent: string }) => {
	const [newDmTrigger, setNewDmTrigger] = useState(true);

	const handleNewDmTrigger = useCallback(() => {
		setNewDmTrigger(!newDmTrigger);
	}, [newDmTrigger, setNewDmTrigger]);

	return (
		<div className="dm-aside">
			<button className="new-input">{buttonContent}</button>
			<PopUp trigger={newDmTrigger}>
				<NewDm />
			</PopUp>
		</div>
	);
};

export const DmElement = () => {
	return (
		<div className="dm-element">
			<Aside buttonContent="New DM" />
			<div className="dm-chat"></div>
		</div>
	);
};
