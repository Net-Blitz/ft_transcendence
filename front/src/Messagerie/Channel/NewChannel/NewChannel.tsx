import React, { useState, useEffect } from 'react';
import './NewChannel.css';
import axios from 'axios';
/* Types */
import { userInfoDto } from '../ChannelElement';
/* Ressources */
import close from '../../../Profile/Components/MainInfo/Ressources/close.svg';
import search from '../../Ressources/search.svg';

const InputChannel = ({
	title,
	content,
}: {
	title: string;
	content: string;
}) => {
	return (
		<>
			<div className="input-channel">
				<h4>{title}</h4>
				<span>
					<input type="text" placeholder={content} />
				</span>
			</div>
		</>
	);
};

export const NewChannel = ({
	handleNewDmTrigger,
	userInfo,
}: {
	handleNewDmTrigger: () => void;
	userInfo: userInfoDto | undefined;
}) => {
	const me = document.getElementsByClassName('popup');
	const [typeChannel, setTypeChannel] = useState('private');

	useEffect(() => {
		window.onclick = (event: any) => {
			if (event.target === me[0]) {
				handleNewDmTrigger();
			}
		};
	}, [me, handleNewDmTrigger]);

	return (
		<div className="new-dm" style={{ height: '321px' }}>
			<img src={close} alt="close-button" onClick={handleNewDmTrigger} />
			<h3 style={{ height: '24px' }}>Create Channel</h3>
			<InputChannel title="Name" content="enter the channel name" />
			<div className="channel-select-buttons">
				<button
					className={typeChannel === 'private' ? 'active' : undefined}
					onClick={() => setTypeChannel('private')}>
					Private
				</button>
				<button
					className={typeChannel === 'public' ? 'active' : undefined}
					onClick={() => setTypeChannel('public')}>
					Public
				</button>
				<button
					className={
						typeChannel === 'protected' ? 'active' : undefined
					}
					onClick={() => setTypeChannel('protected')}>
					Protected
				</button>
			</div>
			<InputChannel title="Password" content="enter the new password" />
			<div className="new-dm-buttons">
				<button>Create</button>
				<button onClick={handleNewDmTrigger}>Cancel</button>
			</div>
		</div>
	);
};
