import React, {
	useState,
	useCallback,
	useContext,
	useEffect,
	useRef,
} from 'react';
import './Aside.css';
import { Socket } from 'socket.io-client';
import axios from 'axios';
/* Interface */
import { ChannelDto, ChannelsContext } from '../ChannelsUtils';
import { userInfoDto } from '../ChannelsUtils';
/* Components */
import { PopUp } from '../../../Profile/Components/MainInfo/MainInfo';
import { ChannelPassword } from '../ChannelPassword';
import { NewChannel, UpdateChannel } from '../NewChannel/NewChannel';
import { BasicFrame } from '../../../Profile/Components/MiddleInfo/MiddleInfo';
/* Ressources */
import controller from '../../Ressources/controller.svg';
import settings from '../../Ressources/settings.svg';
import profile from '../../Ressources/profile.svg';
import { useSelector } from 'react-redux';
import { selectUserData } from '../../../utils/redux/selectors';
import Invite from '../Invite';

export const ChannelButton = ({
	icon,
	onClick,
	myRef,
}: {
	icon: string;
	onClick?: any;
	myRef?: any;
}) => {
	return (
		<>
			<img
				className="channel-button"
				src={icon}
				alt="icon"
				onClick={onClick}
				ref={myRef}
			/>
		</>
	);
};

const ChannelListElement = ({
	Channel,
	socket,
}: {
	Channel: ChannelDto;
	socket: Socket;
}) => {
	const [ban, setBan] = useState<any[]>([]);
	const [ChannelPasswordTrigger, setChannelPasswordTrigger] = useState(false);
	const [ChannelSettingsTrigger, setChannelSettingsTrigger] = useState(false);
	const { setMessages, SaveChannel, selectedChannel, setSelectedChannel } =
		useContext(ChannelsContext);
	const connectedUser = useSelector(selectUserData);

	useEffect(() => {
		const getBan = async () => {
			try {
				const response = await axios.get(
					'http://localhost:3333/chat/ban/' + connectedUser.username,
					{ withCredentials: true }
				);
				setBan(response.data);
			} catch (error) {
				console.log(error);
			}
		};
		getBan();
	}, [connectedUser.username]);
	const getMessages = async () => {
		try {
			const response = await axios.get(
				'http://localhost:3333/chat/channel/messages/' + Channel.id,
				{ withCredentials: true }
			);
			response.data.map((message: any) => {
				return (
					message.userId === connectedUser.id
						? (message.username = connectedUser.username)
						: (message.username = ''),
					(message.content = message.message)
				);
			});
			setMessages(response.data.reverse());
		} catch (error) {
			console.log(error);
		}
	};

	const handleSelectChannel = async (channel: ChannelDto) => {
		const response = await axios.get(
			'http://localhost:3333/chat/ban/' + connectedUser.username,
			{ withCredentials: true }
		);
		setBan(response.data);
		if (ban.find((ban: any) => ban.name === channel.name)) {
			console.log('You are banned from this channel');
			return;
		} else if (channel?.state === 'PUBLIC') {
			setSelectedChannel(channel);
			getMessages();
			socket?.emit('join', {
				channel: channel.name,
				username: connectedUser.username,
			});
		} else if (channel?.state === 'PROTECTED') {
			if (
				SaveChannel.find(
					(savechannel) => savechannel.name === channel.name
				) ||
				connectedUser.id === channel.ownerId
			) {
				setSelectedChannel(channel);
				getMessages();
				socket?.emit('join', {
					channel: channel.name,
					username: connectedUser.username,
				});
			} else {
				handleChannelPasswordTrigger();
			}
		} else if (channel?.state === 'PRIVATE') {
			if (channel.ownerId === connectedUser.id) {
				setSelectedChannel(channel);
				socket?.emit('join', {
					channel: channel.name,
					username: connectedUser.username,
				});
			} else if (
				SaveChannel.find(
					(savechannel) => savechannel.name === channel.name
				)
			) {
				setSelectedChannel(channel);
				socket?.emit('join', {
					channel: channel.name,
					username: connectedUser.username,
				});
			} else {
				console.log("You don't have access to this channel");
			}
		}
	};

	const handleChannelPasswordTrigger = useCallback(() => {
		setChannelPasswordTrigger(!ChannelPasswordTrigger);
	}, [ChannelPasswordTrigger, setChannelPasswordTrigger]);

	const handleChannelSettingsTrigger = useCallback(() => {
		setChannelSettingsTrigger(!ChannelSettingsTrigger);
	}, [ChannelSettingsTrigger, setChannelSettingsTrigger]);

	return (
		<>
			<div
				className={`dm-list-element ${
					Channel.id === selectedChannel?.id && 'active'
				}`}
				onClick={() => handleSelectChannel(Channel)}>
				<h4>{Channel.name}</h4>
				{Channel.id === selectedChannel?.id && (
					<button>Disconnect</button>
				)}
				{connectedUser.id === Channel.ownerId && (
					<ChannelButton
						icon={settings}
						onClick={handleChannelSettingsTrigger}
					/>
				)}
			</div>
			<PopUp trigger={ChannelSettingsTrigger}>
				<UpdateChannel
					handleNewDmTrigger={handleChannelSettingsTrigger}
				/>
			</PopUp>
			<PopUp trigger={ChannelPasswordTrigger}>
				<ChannelPassword
					handleChannelPasswordTrigger={handleChannelPasswordTrigger}
					Channel={Channel}
				/>
			</PopUp>
		</>
	);
};

const ChannelLists = ({ socket }: { socket: Socket }) => {
	const { ChannelList } = useContext(ChannelsContext);

	return (
		<div className="dm-list">
			{ChannelList.map((Channel, index) => {
				return (
					<ChannelListElement
						Channel={Channel}
						socket={socket}
						key={index}
					/>
				);
			})}
		</div>
	);
};

const UserChannelElement = ({
	user,
	channel,
	isAdmin,
	socket,
}: {
	user: userInfoDto;
	channel: ChannelDto;
	isAdmin: boolean;
	socket: Socket;
}) => {
	const userConnected = useSelector(selectUserData);
	const userIsAdmin = channel.ownerId === user.id || user.role === 'admin';
	const [userSettingsTrigger, setUserSettingsTrigger] = useState(false);
	const dropdown = useRef<HTMLDivElement>(null);
	const settingButton = useRef<HTMLDivElement>(null);
	const [isMute, setIsMute] = useState<boolean>(false);
	const [isBlocked, setIsBlocked] = useState<boolean>(false);

	const handleUserSettingsTrigger = useCallback(() => {
		setUserSettingsTrigger(!userSettingsTrigger);
	}, [userSettingsTrigger, setUserSettingsTrigger]);

	useEffect(() => {
		window.onclick = (event: any) => {
			if (userSettingsTrigger) {
				if (
					!dropdown.current?.contains(event.target) &&
					!settingButton.current?.contains(event.target)
				) {
					setUserSettingsTrigger(false);
				}
			}
		};
	}, [userSettingsTrigger]);

	useEffect(() => {
		const getMute = async () => {
			try {
				const response = await axios.get(
					'http://localhost:3333/chat/mutes/' + channel.name,
					{ withCredentials: true }
				);
				const mute = response.data;
				mute.forEach((mutedUser: any) => {
					if (mutedUser.username === user.username) {
						setIsMute(true);
					}
				});
			} catch (error) {
				console.log(error);
			}
		};
		const getBlock = async () => {
			try {
				const response = await axios.get(
					'http://localhost:3333/friend/blockbyme/' + user.username,
					{ withCredentials: true }
				);
				setIsBlocked(response.data.isBlocked);
			} catch (error) {
				console.error(error);
			}
		};
		const fetchAll = async () => {
			getMute();
			getBlock();
		};

		fetchAll();
		const interval = setInterval(fetchAll, 2500);
		return () => clearInterval(interval);
	}, [channel.name, user.username]);

	if (user.id === userConnected.id) return <></>;

	const handlePromote = async () => {
		try {
			await axios.post(
				'http://localhost:3333/chat/admin/promote/' + channel.name,
				{
					username: user.username,
				},
				{ withCredentials: true }
			);
			console.log(user.username + ' has been promoted');
		} catch (error) {
			console.error(error);
		}
	};

	const handleDemote = async () => {
		try {
			await axios.post(
				'http://localhost:3333/chat/admin/demote/' + channel.name,
				{
					username: user.username,
				},
				{ withCredentials: true }
			);
			console.log(user.username + ' has been demoted');
		} catch (error) {
			console.error(error);
		}
	};

	const handleKick = async () => {
		socket?.emit('ToKick', {
			username: userConnected.username,
			channel: channel.name,
			login: user.username,
		});
		console.log(user.username + ' has been kicked');
	};

	const handleBan = async () => {
		socket?.emit('ToBan', {
			username: userConnected.username,
			channel: channel.name,
			login: user.username,
		});
		console.log(user.username + ' has been banned');
	};

	const handleMute = async () => {
		socket?.emit('ToMute', {
			username: userConnected.username,
			channel: channel.name,
			login: user.username,
		});
		setIsMute(true);
		console.log(user.username + ' has been muted');
	};

	const handleUnmute = async () => {
		socket?.emit('ToUnmute', {
			username: userConnected.username,
			channel: channel.name,
			login: user.username,
		});
		setIsMute(false);
		console.log(user.username + ' has been unmuted');
	};

	const handleBlock = async () => {
		try {
			await axios.post(
				'http://localhost:3333/friend/block/' + user.username,
				{},
				{ withCredentials: true }
			);
			setIsBlocked(true);
			console.log(user.username + ' has been blocked');
		} catch (error) {
			console.error(error);
		}
	};

	const handleUnblock = async () => {
		try {
			await axios.post(
				'http://localhost:3333/friend/unblock/' + user.username,
				{},
				{ withCredentials: true }
			);
			setIsBlocked(false);
			console.log(user.username + ' has been unblocked');
		} catch (error) {
			console.error(error);
		}
	};

	return (
		<div className="user-channel-list-element">
			<img
				className={
					userIsAdmin
						? 'dm-list-element-avatar admin-avatar'
						: 'dm-list-element-avatar'
				}
				src={'http://localhost:3333/' + user.avatar}
				alt=""
			/>
			<h4 className={userIsAdmin ? 'admin' : undefined}>
				{user.username}{' '}
			</h4>
			<div className="user-channel-list-buttons">
				<ChannelButton icon={controller} />
				<ChannelButton icon={profile} />
				{(channel.ownerId === userConnected.id ||
					(user.role !== 'admin' && isAdmin === true)) && (
					<ChannelButton
						icon={settings}
						onClick={handleUserSettingsTrigger}
						myRef={settingButton}
					/>
				)}
				<div
					className="dropdown-settings-user-channel"
					style={{ display: userSettingsTrigger ? 'block' : 'none' }}
					ref={dropdown}>
					{user.role === 'user' && (
						<p onClick={handlePromote}>Op this user</p>
					)}
					{user.role === 'owner' && (
						<p onClick={handleDemote}>Demote this user</p>
					)}
					{!isMute ? (
						<p onClick={handleMute}>Mute this user</p>
					) : (
						<p onClick={handleUnmute}>Unmute this user</p>
					)}
					<p onClick={handleKick}>Kick this user</p>
					<p onClick={handleBan}>Ban this user</p>
					{!isBlocked ? (
						<p onClick={handleBlock}>Block this user</p>
					) : (
						<p onClick={handleUnblock}>UnBlock this user</p>
					)}
				</div>
			</div>
		</div>
	);
};

const UserChannelList = ({
	channel,
	socket,
}: {
	channel: ChannelDto;
	socket: Socket;
}) => {
	const [usersList, setUsersList] = useState<userInfoDto[]>([]);
	const [isAdmin, setIsAdmin] = useState(false);
	const [bansList, setBansList] = useState<userInfoDto[]>([]);
	const [selectedUser, setSelectedUser] = useState<string>();
	const userConnected = useSelector(selectUserData);

	useEffect(() => {
		if (!channel.name) return;
		const getUsers = async () => {
			if (!channel) return;
			const response = await axios.get(
				'http://localhost:3333/chat/channel/' + channel.name,
				{ withCredentials: true }
			);
			setUsersList(response.data.users);
			response.data.users.forEach((user: userInfoDto) => {
				if (user.id === userConnected.id && user.role === 'admin') {
					setIsAdmin(true);
				}
			});
		};
		const getBans = async () => {
			const response = await axios.get(
				'http://localhost:3333/chat/bans/' + channel.name,
				{ withCredentials: true }
			);
			setBansList(response.data);
			if (response.data.length > 0)
				setSelectedUser(response.data[0].username);
		};
		const fetchAll = async () => {
			await getUsers();
			await getBans();
		};

		fetchAll();
		const interval = setInterval(fetchAll, 2500);
		return () => clearInterval(interval);
	}, [channel, userConnected]);

	const handleUnban = async () => {
		if (!selectedUser) return;
		socket?.emit('ToUnban', {
			username: userConnected.username,
			channel: channel.name,
			login: selectedUser,
		});
		console.log(selectedUser + ' has been unbanned');
	};

	return (
		<div className="user-channel-list">
			<BasicFrame title="In this channel" height="90%">
				{usersList.map((user, index) => (
					<UserChannelElement
						socket={socket}
						user={user}
						key={index}
						channel={channel}
						isAdmin={isAdmin}
					/>
				))}
			</BasicFrame>
			{isAdmin ||
				(channel.ownerId === userConnected.id && (
					<div className="ban-list-dropdown-channel">
						<select
							onChange={(e) => setSelectedUser(e.target.value)}>
							{bansList.map((bannedUser, index) => (
								<option value={bannedUser.username} key={index}>
									{bannedUser.username}
								</option>
							))}
						</select>
						<button onClick={handleUnban}>Unban</button>
					</div>
				))}
		</div>
	);
};

export const Aside = ({
	buttonContent,
	socket,
}: {
	buttonContent: string;
	socket: Socket;
}) => {
	const [newDmTrigger, setNewDmTrigger] = useState(false);
	const { selectedChannel } = useContext(ChannelsContext);

	const handleNewDmTrigger = useCallback(() => {
		setNewDmTrigger(!newDmTrigger);
	}, [newDmTrigger, setNewDmTrigger]);

	return (
		<div className="aside-channel">
			<div className="dm-aside" style={{ width: '100%', height: '48%' }}>
				<button className="new-input" onClick={handleNewDmTrigger}>
					{buttonContent}
				</button>
				<div className="content-dm-aside">
					<ChannelLists socket={socket} />
					<Invite socket={socket} />
					<PopUp trigger={newDmTrigger}>
						<NewChannel handleNewDmTrigger={handleNewDmTrigger} />
					</PopUp>
				</div>
			</div>
			<UserChannelList channel={selectedChannel} socket={socket} />{' '}
		</div>
	);
};
