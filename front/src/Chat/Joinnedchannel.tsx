import { useEffect, useState } from 'react';
import './Chat.css';
import MessageInput from './MessageInput';
import { MessageDto } from './Messages';
import { ChannelDto } from './Chat';
import axios from 'axios';
import Messages from './Messages';
import UsersList from './UsersList';
import Alert from './Alert';
import PopupProtected from './PopupProtected';
import HandleInvite from './HandleInvite';
import CreateChannel from './CreateChannel';

function JoinnedChannels({
	ChannelsList,
	userInfo,
	socket,
	channelOrDM,
	handleOptionChange,
}: any) {
	const [selectedChannel, setSelectedChannel] = useState<string>('');
	const [messages, setMessages] = useState<MessageDto[]>([]);
	const [showUsers, setShowUsers] = useState(false);
	const [alert, setAlert] = useState({ message: '', type: '' });
	const [PopupPassword, setPopupPassword] = useState<string>(''); // <-- name of protected channel
	const [SaveChannel, setSaveChannel] = useState<string[]>([]); // <--- Save all joinned protected || private channel
	const [PopupCreateChannel, setPopupCreateChannel] = useState(false);
	const [ban, setBan] = useState<any[]>([]); // <--- Save all ban channel
	const [blocked, setBlocked] = useState<any[]>([]); // <--- Save all blocked user

	useEffect(() => {
		const fetchBan = async () => {
			if (!userInfo?.username) return;
			const response = await axios.get(
				'http://localhost:3333/chat/ban/' + userInfo?.username,
				{
					withCredentials: true,
				}
			);
			setBan(response.data);
		};

		fetchBan();
	}, [selectedChannel, userInfo?.username]);

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

	const handleChannelClick = async (channel: ChannelDto) => {
		const response = await axios.get(
			'http://localhost:3333/chat/ban/' + userInfo?.username,
			{
				withCredentials: true,
			}
		);
		setBan(response.data);
		if (ban?.find((ban: any) => ban.name === channel.name)) {
			setAlert({
				message: 'You are banned from this channel',
				type: 'error',
			});
		} else if (channel?.state === 'PUBLIC') {
			setSelectedChannel(channel.name);
			setMessages([]);
			socket?.emit('join', {
				channel: channel.name,
				username: userInfo?.username,
			});
		} else if (channel?.state === 'PROTECTED') {
			if (
				SaveChannel.find((channelName) => channelName === channel.name)
			) {
				setSelectedChannel(channel.name);
				setMessages([]);
				socket?.emit('join', {
					channel: channel.name,
					username: userInfo?.username,
				});
				handleTogglePopupPassword('');
			} else {
				handleTogglePopupPassword(channel.name);
			}
		} else if (channel?.state === 'PRIVATE') {
			if (channel.ownerId === userInfo.id) {
				setSelectedChannel(channel.name);
				setMessages([]);
				socket?.emit('join', {
					channel: channel.name,
					username: userInfo?.username,
				});
			} else if (
				SaveChannel.find((channelName) => channelName === channel.name)
			) {
				setSelectedChannel(channel.name);
				setMessages([]);
				socket?.emit('join', {
					channel: channel.name,
					username: userInfo?.username,
				});
			} else {
				setAlert({
					message: 'This channel is private, you have to be invited',
					type: 'error',
				});
			}
		}
	};

	useEffect(() => {
		const handleMessage = (message: MessageDto) => {
			if (!blocked.find((user) => user.username === message.username))
				setMessages([...messages, message]);
		};

		socket?.on('chat', handleMessage);
		socket?.on('kick', (data: any) => {
			if (data?.username === userInfo?.username) {
				setSelectedChannel('');
				setMessages([]);
				setAlert({
					message: `You have been kicked from ${data?.channel}`,
					type: 'error',
				});
			}
		});
		socket?.on('ban', (data: any) => {
			if (data?.username === userInfo?.username) {
				setSelectedChannel('');
				setMessages([]);
				setAlert({
					message: `You have been banned from ${data?.channel}`,
					type: 'error',
				});
			}
		});
		return () => {
			socket?.off('chat', handleMessage);
			socket?.off('kick');
			socket?.off('ban');
		};
	}, [blocked, messages, selectedChannel, socket, userInfo?.username]);

	const sendMessage = (message: MessageDto) => {
		if (!message.content) return;
		socket?.emit('chat', { ...message, channel: selectedChannel });
	};

	const handleToggleUsers = () => {
		setShowUsers(!showUsers);
	};

	const handleTogglePopupPassword = (channel: string) => {
		setPopupPassword(channel);
	};

	const handleToggleCreateChannel = () => {
		setPopupCreateChannel(!PopupCreateChannel);
	};

	return (
		<>
			<Alert message={alert.message} type={alert.type} />
			{PopupCreateChannel && (
				<CreateChannel
					ClosePopup={handleToggleCreateChannel}
					setAlert={setAlert}
				/>
			)}
			<div className="chat-wrapper">
				<div className="chat-container">
					<div className="chat-left">
						<div className="chat-top">
							<select
								id="channelOrDM"
								value={channelOrDM}
								onChange={handleOptionChange}>
								<option value="channel">Channels</option>
								<option value="dm">Direct Message</option>
							</select>
							<button onClick={handleToggleCreateChannel}>
								Create
							</button>
							<button onClick={handleToggleUsers}>Users</button>
						</div>
						<ul className="chat-channel">
							{ChannelsList.map((channel: ChannelDto) => (
								<li
									key={channel.id}
									className={`chat-person ${
										selectedChannel === channel.name
											? 'chat-active'
											: ''
									}`}
									onClick={() => handleChannelClick(channel)}>
									{PopupPassword !== '' && (
										<PopupProtected
											channel={PopupPassword}
											socket={socket}
											userInfo={userInfo}
											setSelectedChannel={
												setSelectedChannel
											}
											setMessages={setMessages}
											SaveChannel={SaveChannel}
											setSaveChannel={setSaveChannel}
											setAlert={setAlert}
										/>
									)}
									<span className="chat-name">
										{channel.name}
									</span>
									<span className="chat-role">
										{channel.state}
									</span>
								</li>
							))}
							<HandleInvite
								socket={socket}
								userInfo={userInfo}
								setSelectedChannel={setSelectedChannel}
								setMessages={setMessages}
								SaveChannel={SaveChannel}
								setSaveChannel={setSaveChannel}
								setAlert={setAlert}
							/>
						</ul>
					</div>
					{showUsers && (
						<UsersList channel={selectedChannel} socket={socket} />
					)}
					<div className="chat-right">
						<div className="chat-top">
							<span>
								To:{' '}
								<span className="chat-name">
									{selectedChannel === ''
										? 'No Channel selected'
										: selectedChannel}
								</span>
							</span>
						</div>
						{selectedChannel === '' && (
							<div className="chat-chat center">
								<p>No Channel selected</p>
							</div>
						)}
						<Messages messages={messages} userInfo={userInfo} />
						<div className="chat-write">
							<MessageInput
								sendMessage={sendMessage}
								userInfo={userInfo}
							/>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}

export default JoinnedChannels;
