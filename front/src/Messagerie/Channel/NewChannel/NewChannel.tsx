import React, { useState, useEffect } from 'react';
import './NewChannel.css';
// import axios from 'axios';
/* Types */
import { userInfoDto } from '../ChannelElement';
/* Ressources */
import close from '../../../Profile/Components/MainInfo/Ressources/close.svg';
import axios from 'axios';
// import search from '../../Ressources/search.svg';

const InputChannel = ({
	title,
	content,
	typeChannel,
	setContent,
}: {
	title: string;
	content: string;
	typeChannel?: string;
	setContent?: any;
}) => {
	const [input, setInput] = useState('');

	useEffect(() => {
		setContent(input);
	}, [input, setContent]);

	return (
		<>
			<div
				className="input-channel"
				style={{
					display:
						typeChannel === 'private' || typeChannel === 'public'
							? 'none'
							: 'block',
				}}>
				<h4>{title}</h4>
				<span>
					<input
						type="text"
						placeholder={content}
						onChange={(e) => setInput(e.target.value)}
					/>
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
	const [name, setName] = useState('');
	const [password, setPassword] = useState('');

	useEffect(() => {
		window.onclick = (event: any) => {
			if (event.target === me[0]) {
				handleNewDmTrigger();
			}
		};
	}, [me, handleNewDmTrigger]);

	const handleCreateChannel = async () => {
		try {
			let state = 'PUBLIC';
			switch (typeChannel) {
				case 'PUBLIC':
					state = 'PUBLIC';
					break;
				case 'PROTECTED':
					state = 'PROTECTED';
					break;
				case 'PRIVATE':
					state = 'PRIVATE';
					break;
			}
			await axios.post(
				'http://localhost:3333/chat/create/' + name,
				{ state, password },
				{ withCredentials: true }
			);
			setName('');
			setPassword('');
			handleNewDmTrigger();
		} catch (error) {
			console.log(error);
		}
	};

	return (
		<div
			className="new-dm"
			style={{
				height:
					typeChannel === 'private' || typeChannel === 'public'
						? '280px'
						: '321px',
			}}>
			<img src={close} alt="close-button" onClick={handleNewDmTrigger} />
			<h3 style={{ height: '24px' }}>Create Channel</h3>
			<InputChannel
				title="Name"
				content="enter the channel name"
				setContent={setName}
			/>
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
			<InputChannel
				title="Password"
				content="enter the new password"
				typeChannel={typeChannel}
				setContent={setPassword}
			/>
			<div className="new-dm-buttons">
				<button onClick={handleCreateChannel}>Create</button>
				<button onClick={handleNewDmTrigger}>Cancel</button>
			</div>
		</div>
	);
};
