import React, { useState, useCallback, useContext, useEffect } from 'react';
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
import add from '../../Ressources/add.svg';
import profile from '../../Ressources/profile.svg';

export const ChannelButton = ({
	icon,
	onClick,
}: {
	icon: string;
	onClick?: any;
}) => {
	return (
		<>
			<img
				className="channel-button"
				src={icon}
				alt="icon"
				onClick={onClick}
			/>
		</>
	);
};

const ChannelListElement = ({
	Channel,
	userInfo,
	socket,
}: {
	Channel: ChannelDto;
	userInfo: userInfoDto | undefined;
	socket: Socket;
}) => {
	const [ban, setBan] = useState<any[]>([]);
	const [ChannelPasswordTrigger, setChannelPasswordTrigger] = useState(false);
	const [ChannelSettingsTrigger, setChannelSettingsTrigger] = useState(false);
	const { setMessages, SaveChannel, selectedChannel, setSelectedChannel } =
		useContext(ChannelsContext);

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
				SaveChannel.find(
					(savechannel) => savechannel.name === channel.name
				)
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
				<ChannelButton
					icon={settings}
					onClick={handleChannelSettingsTrigger}
				/>
				<PopUp trigger={ChannelSettingsTrigger}>
					<UpdateChannel
						handleNewDmTrigger={handleChannelSettingsTrigger}
					/>
				</PopUp>
			</div>
			<PopUp trigger={ChannelPasswordTrigger}>
				<ChannelPassword
					handleChannelPasswordTrigger={handleChannelPasswordTrigger}
					Channel={Channel}
				/>
			</PopUp>
		</>
	);
};

const ChannelLists = ({
	userInfo,
	socket,
}: {
	userInfo: userInfoDto | undefined;
	socket: Socket;
}) => {
	const { ChannelList } = useContext(ChannelsContext);

	return (
		<div className="dm-list">
			{ChannelList.map((Channel, index) => {
				return (
					<ChannelListElement
						Channel={Channel}
						userInfo={userInfo}
						socket={socket}
						key={index}
					/>
				);
			})}
		</div>
	);
};

const UserChannelElement = ({ user }: { user: userInfoDto }) => {
	return (
		<div className="user-channel-list-element">
			<img
				className="dm-list-element-avatar"
				src={'http://localhost:3333/' + user.avatar}
				alt=""
			/>
			<h4>{user.username}</h4>
			<div className="user-channel-list-buttons">
				<ChannelButton icon={controller} />
				<ChannelButton icon={add} />
				<ChannelButton icon={profile} />
				<ChannelButton icon={settings} />
			</div>
		</div>
	);
};

const UserChannelList = ({ channel }: { channel: ChannelDto }) => {
	const [usersList, setUsersList] = useState<userInfoDto[]>([]);

	useEffect(() => {
		if (!channel.name) return;
		const getUsers = async () => {
			if (!channel) return;
			const response = await axios.get(
				'http://localhost:3333/chat/channel/' + channel.name,
				{ withCredentials: true }
			);
			setUsersList(response.data.users);
		};
		getUsers();

		const interval = setInterval(getUsers, 2500);
		return () => clearInterval(interval);
	}, [channel]);

	return (
		<BasicFrame title="In this channel">
			{usersList.map((user, index) => (
				<UserChannelElement user={user} key={index} />
			))}
		</BasicFrame>
	);
};

export const Aside = ({
	buttonContent,
	userInfo,
	socket,
}: {
	buttonContent: string;
	userInfo: userInfoDto | undefined;
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
				<ChannelLists socket={socket} userInfo={userInfo} />
				<PopUp trigger={newDmTrigger}>
					<NewChannel handleNewDmTrigger={handleNewDmTrigger} />
				</PopUp>
			</div>
			<UserChannelList channel={selectedChannel} />
		</div>
	);
};
