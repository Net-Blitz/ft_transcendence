import React, { useState, useCallback, useEffect, useContext } from 'react';
import axios from 'axios';
import { Socket } from 'socket.io-client';
import '../Dm/DmElement.css';
/*	Components	*/
import { PopUp } from '../../Profile/Components/MainInfo/MainInfo';
import MessageInput from '../Dm/MessageInput';
import { BasicFrame } from '../../Profile/Components/MiddleInfo/MiddleInfo';
import { NewChannel } from './NewChannel/NewChannel';
import { ChannelPassword } from './ChannelPassword';
import { ChannelDto, MessagesContext, MessagesProvider, userInfoDto } from './ChannelsUtils';
import Invite from './Invite';

export const InputFlat = ({
	icon,
	content,
	userInfo,
	selectedUser,
	setSelectedUser,
}: {
	icon: string;
	content: string;
	userInfo: userInfoDto | undefined;
	selectedUser: string;
	setSelectedUser: React.Dispatch<React.SetStateAction<string>>;
}) => {
	const [searchTerm, setSearchTerm] = useState('');
	const [searchResults, setSearchResults] = useState<userInfoDto[]>([]);
	const [users, setUsers] = useState<userInfoDto[]>([]);

	useEffect(() => {
		const FetchUsers = async () => {
			try {
				const response = await axios.get(
					'http://localhost:3333/users/login',
					{ withCredentials: true }
				);
				setUsers(
					response.data.filter(
						(user: userInfoDto) =>
							user.username !== userInfo?.username
					)
				);
			} catch (error) {
				console.log(error);
			}
		};

		FetchUsers();
	}, [userInfo]);

	useEffect(() => {
		const searchUsers = (searchTerm: string) => {
			const results = users.filter((user) =>
				user.username.toLowerCase().includes(searchTerm.toLowerCase())
			);
			setSearchResults(results);
		};

		searchUsers(searchTerm);
	}, [searchTerm, users]);

	return (
		<>
			<div className="input-flat">
				<img src={icon} alt="search icon" />
				<input
					type="text"
					placeholder={content}
					value={searchTerm}
					onChange={(e) => {
						setSearchTerm(e.target.value);
					}}
				/>
			</div>
			<div className="input-select">
				<select
					value={selectedUser}
					onChange={(e) => setSelectedUser(e.target.value)}>
					{searchResults.length > 0
						? searchResults.map((user, index) => (
								<option key={index} value={user.username}>
									{user.username}
								</option>
						  ))
						: users.map((user, index) => (
								<option key={index} value={user.username}>
									{user.username}
								</option>
						  ))}
				</select>
			</div>
		</>
	);
};

const ChannelListElement = ({
	Channel,
	userInfo,
	socket,
	selectedChannel,
	setSelectedChannel,
}: {
	Channel: ChannelDto;
	userInfo: userInfoDto | undefined;
	socket: Socket;
	selectedChannel: ChannelDto | undefined;
	setSelectedChannel: React.Dispatch<
		React.SetStateAction<ChannelDto | undefined>
	>;
}) => {
	const [ban, setBan] = useState<any[]>([]);
	const [ChannelPasswordTrigger, setChannelPasswordTrigger] = useState(false);
	const { setMessages, SaveChannel, setSaveChannel } = useContext(MessagesContext);

	const handleSelectChannel = async (channel: ChannelDto) => {
		const response = await axios.get(
			'http://localhost:3333/chat/ban/' + userInfo?.username,
			{ withCredentials: true }
		);
		setBan(response.data);
		if (ban?.find((ban: any) => ban.name === channel.name)) {
			console.log('You are banned from this channel');
			return;
		}
		if (channel?.state === 'PUBLIC') {
			setSelectedChannel(channel);
			setMessages([]);
			socket?.emit('join', {
				channel: channel.name,
				username: userInfo?.username,
			});
		} else if (channel?.state === 'PROTECTED') {
			if (
				SaveChannel.find(
					(savechannel) => savechannel.name === channel.name
				)
			) {
				setSelectedChannel(channel);
				setMessages([]);
				socket?.emit('join', {
					channel: channel.name,
					username: userInfo?.username,
				});
			} else {
				handleChannelPasswordTrigger();
			}
		} else if (channel?.state === 'PRIVATE') {
			if (channel.ownerId === userInfo?.id) {
				setSelectedChannel(channel);
				socket?.emit('join', {
					channel: channel.name,
					username: userInfo?.username,
				});
			} else if (
				SaveChannel.find((savechannel) => savechannel.name === channel.name)
			) {
				setSelectedChannel(channel);
				socket?.emit('join', {
					channel: channel.name,
					username: userInfo?.username,
				});
			} else {
				console.log("You don't have access to this channel");
			}
		}
	};

	const handleChannelPasswordTrigger = useCallback(() => {
		setChannelPasswordTrigger(!ChannelPasswordTrigger);
	}, [ChannelPasswordTrigger, setChannelPasswordTrigger]);

	return (
		<>
			<div
				className={`dm-list-element ${
					Channel.id === selectedChannel?.id && 'active'
				}`}
				onClick={() => handleSelectChannel(Channel)}>
				<h4>{Channel.name}</h4>
			</div>
			<PopUp trigger={ChannelPasswordTrigger}>
				<ChannelPassword
					handleChannelPasswordTrigger={handleChannelPasswordTrigger}
					Channel={Channel}
					setSaveChannel={setSaveChannel}
				/>
			</PopUp>
		</>
	);
};

const ChannelLists = ({
	ChannelList,
	userInfo,
	socket,
	selectedChannel,
	setSelectedChannel,
}: {
	ChannelList: ChannelDto[];
	userInfo: userInfoDto | undefined;
	socket: Socket;
	selectedChannel: ChannelDto | undefined;
	setSelectedChannel: React.Dispatch<
		React.SetStateAction<ChannelDto | undefined>
	>;
}) => {
	return (
		<div className="dm-list">
			{ChannelList.map((Channel, index) => {
				return (
					<ChannelListElement
						Channel={Channel}
						userInfo={userInfo}
						socket={socket}
						key={index}
						selectedChannel={selectedChannel}
						setSelectedChannel={setSelectedChannel}
					/>
				);
			})}
			<Invite socket={socket} userInfo={userInfo} setSelectedChannel={setSelectedChannel} />
		</div>
	);
};

const Aside = ({
	buttonContent,
	ChannelList,
	userInfo,
	socket,
	selectedChannel,
	setSelectedChannel,
}: {
	buttonContent: string;
	ChannelList: ChannelDto[];
	userInfo: userInfoDto | undefined;
	socket: Socket;
	selectedChannel: ChannelDto | undefined;
	setSelectedChannel: React.Dispatch<
		React.SetStateAction<ChannelDto | undefined>
	>;
}) => {
	const [newDmTrigger, setNewDmTrigger] = useState(false);

	const handleNewDmTrigger = useCallback(() => {
		setNewDmTrigger(!newDmTrigger);
	}, [newDmTrigger, setNewDmTrigger]);

	return (
		<div className="dm-aside">
			<button className="new-input" onClick={handleNewDmTrigger}>
				{buttonContent}
			</button>
			<ChannelLists
				ChannelList={ChannelList}
				socket={socket}
				userInfo={userInfo}
				selectedChannel={selectedChannel}
				setSelectedChannel={setSelectedChannel}
			/>
			<PopUp trigger={newDmTrigger}>
				<NewChannel
					handleNewDmTrigger={handleNewDmTrigger}
					userInfo={userInfo}
				/>
			</PopUp>
		</div>
	);
};

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
	}, [Channel, blocked, messages, setMessages, setSelectedChannel, socket, userInfo?.username]);

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

