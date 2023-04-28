import React, { useState, useEffect } from 'react';
import './NewChannel.css';
import axios from 'axios';
/* Types */
import { ChannelDto } from '../ChannelsUtils';
/* Ressources */
import close from '../../../Profile/Components/MainInfo/Ressources/close.svg';
// import search from '../../Ressources/search.svg';

export const InputChannel = ({
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
		console.log(content);
		setInput(content);
	}, [content, setInput]);

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
				<h4 className="header-input-channel">{title}</h4>
				<span>
					<input
						type="text"
						placeholder={content}
						value={input}
						onChange={(e) => setInput(e.target.value)}
					/>
				</span>
			</div>
		</>
	);
};

export const NewChannel = ({
	handleNewDmTrigger,
}: {
	handleNewDmTrigger: () => void;
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
				case 'public':
					state = 'PUBLIC';
					break;
				case 'protected':
					state = 'PROTECTED';
					break;
				case 'private':
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

export const UpdateChannel = ({
	handleNewDmTrigger,
	selectedChannel,
}: {
	selectedChannel: ChannelDto | undefined;
	handleNewDmTrigger: () => void;
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

	useEffect(() => {
		if (selectedChannel) {
			setName(selectedChannel.name);
			setTypeChannel(selectedChannel.state.toLowerCase());
		}
	}, [selectedChannel]);

	const handleCreateChannel = async () => {
		if (!selectedChannel) return;
		try {
			let state = 'PUBLIC';
			switch (typeChannel) {
				case 'public':
					state = 'PUBLIC';
					break;
				case 'protected':
					state = 'PROTECTED';
					break;
				case 'private':
					state = 'PRIVATE';
					break;
			}
			console.log(selectedChannel.name, ": ", name, " ", state, " ", password)
			await axios.patch(
				'http://localhost:3333/chat/edit/' + selectedChannel.name,
				{ name, state, password },
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
			<h3 style={{ height: '24px' }}>Settings</h3>
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
