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

interface Props {
	socket: Socket;
	userInfo: userInfoDto | undefined;
}

const Beside = ({ socket, userInfo }: Props) => {
	const { messages, setMessages, selectedChannel, setSelectedChannel } =
		useContext(ChannelsContext);
	const [blocked, setBlocked] = useState<userInfoDto[]>([]);

	useEffect(() => {
		const fetchBlocked = async () => {
			try {
				const response = await axios.get(
					'http://localhost:3333/friend/blocked',
					{
						withCredentials: true,
					}
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
			if (data?.username === userInfo?.username) {
				setSelectedChannel(selectedChannel);
				setMessages([]);
			}
		});
		socket?.on('ban', (data: any) => {
			if (data?.username === userInfo?.username) {
				setSelectedChannel(selectedChannel);
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
		userInfo?.username,
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
							userInfo?.username === message.username
								? 'chat-me'
								: 'chat-you'
						}`}>
						{(userInfo?.username === message.username && (
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
			<MessageInput sendMessage={sendMessage} userInfo={userInfo} />
		</div>
	);
};

export const ChannelElement = ({ socket }: { socket: Socket }) => {
	const [userInfo, setUserInfo] = useState<userInfoDto>();

	useEffect(() => {
		const fetchData = async () => {
			const response = await axios.get('http://localhost:3333/users/me', {
				withCredentials: true,
			});
			setUserInfo(response.data);
		};

		fetchData();
	}, []);

	return (
		<div className="dm-element">
			<ChannelsProvider>
				<Aside
					buttonContent="New Channel"
					userInfo={userInfo}
					socket={socket}
				/>
				<Beside socket={socket} userInfo={userInfo} />
			</ChannelsProvider>
		</div>
	);
};
