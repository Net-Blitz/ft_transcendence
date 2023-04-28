import React, { useState, useCallback, useContext } from 'react';
import './Aside.css';
import { Socket } from 'socket.io-client';
import axios from 'axios';
/* Interface */
import { ChannelDto } from '../ChannelsUtils';
import { userInfoDto } from '../ChannelsUtils';
import { MessagesContext } from '../ChannelsUtils';
/* Components */
import { PopUp } from '../../../Profile/Components/MainInfo/MainInfo';
import { ChannelPassword } from '../ChannelPassword';
import { NewChannel } from '../NewChannel/NewChannel';
import { BasicFrame } from '../../../Profile/Components/MiddleInfo/MiddleInfo';
/* Ressources */
import controller from '../../Ressources/controller.svg';
import settings from '../../Ressources/settings.svg';
import add from '../../Ressources/add.svg';
import profile from '../../Ressources/profile.svg';

const ChannelButton = ({ icon }: { icon: string }) => {
	return (
		<>
			<img className="channel-button" src={icon} alt="icon" />
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
	const { setMessages, SaveChannel } = useContext(MessagesContext);

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
		</div>
	);
};

const UserChannelElement = () => {
	return (
		<div className="user-channel-list-element">
			{/* <img className="dm-list-element-avatar" src={friend} alt="" /> */}
			<h4>xxxx</h4>
			<div className="user-channel-list-buttons">
				<ChannelButton icon={controller} />
				<ChannelButton icon={add} />
				<ChannelButton icon={profile} />
				<ChannelButton icon={settings} />
			</div>
		</div>
	);
};

const UserChannelList = () => {
	return (
		<BasicFrame title="In this channel">
			<UserChannelElement />
		</BasicFrame>
	);
};

export const Aside = ({
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
		<div className="aside-channel">
			<div className="dm-aside" style={{ width: '100%', height: '48%' }}>
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
			<UserChannelList />
		</div>
	);
};
