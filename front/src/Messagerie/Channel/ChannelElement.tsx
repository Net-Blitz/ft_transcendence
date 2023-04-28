import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Socket } from 'socket.io-client';
import '../Dm/DmElement.css';
/*	Components	*/
import MessageInput from '../Dm/MessageInput';
import { BasicFrame } from '../../Profile/Components/MiddleInfo/MiddleInfo';
import { Aside } from './Aside/Aside';
/* Interfaces */
import { ChannelsContext, ChannelsProvider } from './ChannelsUtils';
import { userInfoDto } from './ChannelsUtils';
import { useSelector } from 'react-redux';
import { selectUserData } from '../../utils/redux/selectors';

const Beside = ({ socket }: { socket: Socket }) => {
	const { messages, setMessages, selectedChannel, setSelectedChannel } =
		useContext(ChannelsContext);
	const [blocked, setBlocked] = useState<userInfoDto[]>([]);
	const connectedUser = useSelector(selectUserData);

	useEffect(() => {
		const fetchBlocked = async () => {
			try {
				const response = await axios.get(
					'http://localhost:3333/friend/blocked',
					{ withCredentials: true }
				);
				setBlocked(response.data);
			} catch (error) {}
		};
		fetchBlocked();
	}, [messages]);

	useEffect(() => {
		const handleMessage = (message: any) => {
			if (!blocked.find((user) => user.username === message.username))
				setMessages([message, ...messages]);
		};

		socket?.on('chat', handleMessage);
		socket?.on('kick', (data: any) => {
			if (data?.username === connectedUser.username) {
				setSelectedChannel({
					id: 0,
					name: '',
					state: '',
					ownerId: 0,
				});
				setMessages([]);
			}
		});
		socket?.on('ban', (data: any) => {
			if (data?.username === connectedUser.username) {
				setSelectedChannel({
					id: 0,
					name: '',
					state: '',
					ownerId: 0,
				});
				setMessages([]);
			}
		});
		return () => {
			socket?.off('chat', handleMessage);
			socket?.off('kick');
			socket?.off('ban');
		};
	}, [
		selectedChannel,
		blocked,
		messages,
		setMessages,
		setSelectedChannel,
		socket,
		connectedUser.username,
	]);

	const sendMessage = (message: any) => {
		if (!message.content || selectedChannel.id === 0) return;
		socket?.emit('chat', { ...message, channel: selectedChannel.name });
	};

	return (
		<div className="dm-beside">
			<BasicFrame
				height="91%"
				title={
					selectedChannel.id === 0
						? 'No Chat selected'
						: selectedChannel.name
				}>
				{messages.map((message, index) => (
					<div
						key={index}
						className={`chat-bubble ${
							connectedUser.username === message.username
								? 'chat-me'
								: 'chat-you'
						}`}>
						{(connectedUser.username === message.username && (
							<>
								<p>{message.content}</p>
								<img
									className="chat-avatar"
									src={message.avatar}
									alt="avatar"
								/>
								<p>
									{new Date(message.createdAt).getHours() +
										':' +
										new Date(message.createdAt)
											.getMinutes()
											.toString()
											.padStart(2, '0')}
								</p>
							</>
						)) || (
							<>
								<p>
									{new Date(message.createdAt).getHours() +
										':' +
										new Date(message.createdAt)
											.getMinutes()
											.toString()
											.padStart(2, '0')}
								</p>
								<img
									className="chat-avatar"
									src={message.avatar}
									alt="avatar"
								/>
								<p>{message.content}</p>
							</>
						)}
					</div>
				))}
			</BasicFrame>
			<MessageInput sendMessage={sendMessage} userInfo={connectedUser} />
		</div>
	);
};

export const ChannelElement = ({ socket }: { socket: Socket }) => {
	return (
		<div className="dm-element">
			<ChannelsProvider>
				<Aside buttonContent="New Channel" socket={socket} />
				<Beside socket={socket} />
			</ChannelsProvider>
		</div>
	);
};
