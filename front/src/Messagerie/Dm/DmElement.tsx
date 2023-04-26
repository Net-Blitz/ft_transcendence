import React, { useState, useCallback, useEffect } from 'react';
import './DmElement.css';
/*	Components	*/
import { PopUp } from '../../Profile/Components/MainInfo/MainInfo';
/*	Ressources	*/
import close from '../../Profile/Components/MainInfo/Ressources/close.svg';
import search from './Ressources/search.svg';

const InputFlat = ({ icon, content }: { icon: string; content: string }) => {
	return (
		<div className="input-flat">
			<img src={icon} alt="search icon" />
			<input type="text" placeholder={content} />
		</div>
	);
};

const NewDm = ({ handleNewDmTrigger }: { handleNewDmTrigger: () => void }) => {
	const me = document.getElementsByClassName('popup');

	useEffect(() => {
		window.onclick = (event: any) => {
			if (event.target === me[0]) {
				handleNewDmTrigger();
			}
		};
	}, [me, handleNewDmTrigger]);

	return (
		<div className="new-dm">
			<img src={close} alt="close-button" onClick={handleNewDmTrigger} />
			<h3>New DM</h3>
			<InputFlat icon={search} content="Search a user" />
			<div className="new-dm-buttons">
				<button>Create</button>
				<button onClick={handleNewDmTrigger}>Cancel</button>
			</div>
		</div>
	);
};

const Aside = ({ buttonContent }: { buttonContent: string }) => {
	const [newDmTrigger, setNewDmTrigger] = useState(false);

	const handleNewDmTrigger = useCallback(() => {
		setNewDmTrigger(!newDmTrigger);
	}, [newDmTrigger, setNewDmTrigger]);

	return (
		<div className="dm-aside">
			<button className="new-input" onClick={handleNewDmTrigger}>
				{buttonContent}
			</button>
			<PopUp trigger={newDmTrigger}>
				<NewDm handleNewDmTrigger={handleNewDmTrigger} />
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
