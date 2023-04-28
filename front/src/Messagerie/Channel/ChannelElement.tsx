import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Socket } from 'socket.io-client';
import '../Dm/DmElement.css';
/*	Components	*/
import MessageInput from '../Dm/MessageInput';
import { BasicFrame } from '../../Profile/Components/MiddleInfo/MiddleInfo';
import { Aside } from './Aside/Aside';
import { MessagesProvider } from './ChannelsUtils';
/* Interfaces */
import { ChannelDto } from './ChannelsUtils';
import { userInfoDto } from './ChannelsUtils';
import { MessagesContext } from './ChannelsUtils';

interface Props {
	socket: Socket;
	Channel: ChannelDto | undefined;
	userInfo: userInfoDto | undefined;
	setSelectedChannel: React.Dispatch<
		React.SetStateAction<ChannelDto | undefined>
	>;
}

const Beside = ({ socket, Channel, userInfo, setSelectedChannel }: Props) => {
	const { messages, setMessages } = useContext(MessagesContext);
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
				setSelectedChannel(Channel);
				setMessages([]);
			}
		});
		socket?.on('ban', (data: any) => {
			if (data?.username === userInfo?.username) {
				setSelectedChannel(Channel);
				setMessages([]);
			}
		});
		return () => {
			socket?.off('chat', handleMessage);
			socket?.off('kick');
			socket?.off('ban');
		};
	}, [
		Channel,
		blocked,
		messages,
		setMessages,
		setSelectedChannel,
		socket,
		userInfo?.username,
	]);

	const sendMessage = (message: any) => {
		if (!message.content || !Channel) return;
		socket?.emit('chat', { ...message, channel: Channel.name });
	};

	return (
		<div className="dm-beside">
			<BasicFrame
				height="91%"
				title={
					!Channel || Channel.id === 0
						? 'No Chat selected'
						: Channel.name
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
	const [ChannelList, setChannelList] = useState<ChannelDto[]>([]);
	const [selectedChannel, setSelectedChannel] = useState<ChannelDto>();

	useEffect(() => {
		const fetchData = async () => {
			const response = await axios.get('http://localhost:3333/users/me', {
				withCredentials: true,
			});
			setUserInfo(response.data);
		};

		const fetchChats = async () => {
			try {
				const Channels = await axios.get<ChannelDto[]>(
					'http://localhost:3333/chat/channels',
					{ withCredentials: true }
				);
				setChannelList(Channels.data);
			} catch (error) {
				console.error(error);
			}
		};

		fetchData();
		fetchChats();
		const interval = setInterval(fetchChats, 5000);
		return () => clearInterval(interval);
	}, [userInfo?.username]);

	return (
		<div className="dm-element">
			<MessagesProvider>
				<Aside
					buttonContent="New Channel"
					ChannelList={ChannelList}
					userInfo={userInfo}
					socket={socket}
					selectedChannel={selectedChannel}
					setSelectedChannel={setSelectedChannel}
				/>
				<Beside
					socket={socket}
					Channel={selectedChannel}
					userInfo={userInfo}
					setSelectedChannel={setSelectedChannel}
				/>
			</MessagesProvider>
		</div>
	);
};
