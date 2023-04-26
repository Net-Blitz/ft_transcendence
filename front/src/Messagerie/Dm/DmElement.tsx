import React, { useState, useCallback, useEffect } from 'react';
import './DmElement.css';
/*	Components	*/
import { PopUp } from '../../Profile/Components/MainInfo/MainInfo';
import MessageInput from './MessageInput';
/*	Ressources	*/
import close from '../../Profile/Components/MainInfo/Ressources/close.svg';
import search from './Ressources/search.svg';
import { BasicFrame } from '../../Profile/Components/MiddleInfo/MiddleInfo';
import axios from 'axios';
import { io } from 'socket.io-client';
import { Socket } from 'socket.io-client';

const InputFlat = ({ icon, content }: { icon: string; content: string }) => {
	return (
		<div className="input-flat">
			<img src={icon} alt="search icon" />
			<input type="text" placeholder={content} />
		</div>
	);
};

const NewDm = ({ handleNewDmTrigger }: { handleNewDmTrigger: () => void }) => {
	const me = document.getElementsByClassName('popup');

	useEffect(() => {
		window.onclick = (event: any) => {
			if (event.target === me[0]) {
				handleNewDmTrigger();
			}
		};
	}, [me, handleNewDmTrigger]);

	return (
		<div className="new-dm">
			<img src={close} alt="close-button" onClick={handleNewDmTrigger} />
			<h3>New DM</h3>
			<InputFlat icon={search} content="Search a user" />
			<div className="new-dm-buttons">
				<button>Create</button>
				<button onClick={handleNewDmTrigger}>Cancel</button>
			</div>
		</div>
	);
};

const Aside = ({ buttonContent }: { buttonContent: string }) => {
	const [newDmTrigger, setNewDmTrigger] = useState(false);

	const handleNewDmTrigger = useCallback(() => {
		setNewDmTrigger(!newDmTrigger);
	}, [newDmTrigger, setNewDmTrigger]);

	return (
		<div className="dm-aside">
			<button className="new-input" onClick={handleNewDmTrigger}>
				{buttonContent}
			</button>
			<PopUp trigger={newDmTrigger}>
				<NewDm handleNewDmTrigger={handleNewDmTrigger} />
			</PopUp>
		</div>
	);
};

interface Props {
	socket: Socket;
	DM: DirectMessageDto;
	userInfo: any;
}

const Beside = ({ socket, DM, userInfo }: Props) => {
	const [messages, setMessages] = useState<any[]>([]);

	useEffect(() => {
		if (!DM) return;
		const getMessages = async () => {
			try {
				const reponse = await axios.get(
					'http://localhost:3333/chat/dm/messages/' + DM.id,
					{ withCredentials: true }
				);
				reponse.data.map((message: any) => {
					return (
						message.userId === userInfo.id
							? (message.username = userInfo.username)
							: (message.username = ''),
						(message.content = message.message)
					);
				});
				setMessages(reponse.data);
			} catch (error) {
				console.log(error);
			}
		};

		socket?.on('DM', (message: any) => {
			if (message.DMid === DM.id)
				setMessages((messages) => [...messages, message]);
		});
		socket?.emit('ConnectedDM', { id: userInfo?.id });

		getMessages();

		return () => {
			socket?.off('DM');
		};
	}, [DM, socket, userInfo?.id, userInfo?.username]);

	const sendMessage = (message: any) => {
		if (!message.content || !DM) return;
		const receiver =
			DM?.senderId === userInfo.id ? DM?.receiverId : DM?.senderId;
		socket?.emit('DM', {
			...message,
			DMid: DM.id,
			sender: userInfo.id,
			receiver,
		});
		message.avatar = userInfo.avatar;
		message.createdAt = new Date();
		setMessages((messages) => [...messages, message]);
	};

	return (
		<div className="dm-beside">
			<BasicFrame
				height="91%"
				title={
					!DM || DM.id === 0
						? 'No Chat selected'
						: DM.senderId === userInfo.id
						? DM.receiver.username
						: userInfo.username
				}>
				<div className="chat-bubble-container">
					{messages.reverse().map((message, index) => (
						<div
							key={index}
							className={`chat-bubble ${
								userInfo.username === message.username
									? 'chat-me'
									: 'chat-you'
							}`}>
							{(userInfo.username === message.username && (
								<>
									<p>{message.content}</p>
									<img
										className="chat-avatar"
										src={
											'http://localhost:3333/' +
											message?.avatar
										}
										alt="avatar"
									/>
									<p>
										{new Date(
											message.createdAt
										).getHours() +
											':' +
											new Date(
												message.createdAt
											).getMinutes()}
									</p>
								</>
							)) || (
								<>
									<p>
										{new Date(
											message.createdAt
										).getHours() +
											':' +
											new Date(
												message.createdAt
											).getMinutes()}
									</p>
									<img
										className="chat-avatar"
										src={
											'http://localhost:3333/' +
											message.avatar
										}
										alt="avatar"
									/>
									<p>{message.content}</p>
								</>
							)}
						</div>
					))}
				</div>
			</BasicFrame>
			<MessageInput sendMessage={sendMessage} userInfo={userInfo} />
		</div>
	);
};

export interface DirectMessageDto {
	id: number;
	createdAt: string;
	messages: any[];
	senderId: number;
	receiverId: number;
	sender: any;
	receiver: any;
}

export const DmElement = () => {
	const [userInfo, setUserInfo] = useState<any>();
	const [socket, setSocket] = useState<any>();
	const [DMList, setDMList] = useState<DirectMessageDto[]>([]);

	useEffect(() => {
		const newSocket = io('http://localhost:3334');
		setSocket(newSocket);

		return () => {
			newSocket.disconnect();
		};
	}, []);

	useEffect(() => {
		const fetchData = async () => {
			const response = await axios.get('http://localhost:3333/users/me', {
				withCredentials: true,
			});
			setUserInfo(response.data);
		};

		const fetchChats = async () => {
			try {
				const DMS = await axios.get<DirectMessageDto[]>(
					'http://localhost:3333/chat/dm',
					{ withCredentials: true }
				);
				setDMList(DMS.data);
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
			<Aside buttonContent="New DM" />
			<Beside socket={socket} DM={DMList[0]} userInfo={userInfo} />
		</div>
	);
};
