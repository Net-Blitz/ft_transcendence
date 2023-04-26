import React, { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { Socket } from 'socket.io-client';
import './DmElement.css';
/*	Components	*/
import { PopUp } from '../../Profile/Components/MainInfo/MainInfo';
import MessageInput from './MessageInput';
import { BasicFrame } from '../../Profile/Components/MiddleInfo/MiddleInfo';
/*	Ressources	*/
import close from '../../Profile/Components/MainInfo/Ressources/close.svg';
import search from './Ressources/search.svg';
import block from './Ressources/block.svg';
import controller from './Ressources/controller.svg';

const InputFlat = ({
	icon,
	content,
	userInfo,
	handleCreateDM,
}: {
	icon: string;
	content: string;
	userInfo: userInfoDto | undefined;
	handleCreateDM: (username: string) => void;
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
			<ul>
				{searchTerm.length > 0 &&
					searchResults.map((user, index) => (
						<li key={index}>
							<div className="search-result" key={index}>
								<img
									src={'http://localhost:3333/' + user.avatar}
									alt="avatar"
								/>
								<h4>{user.username}</h4>
								<button
									onClick={() =>
										handleCreateDM(user.username)
									}
									value={user.username}>
									DM
								</button>
							</div>
						</li>
					))}
			</ul>
		</div>
	);
};

const NewDm = ({
	handleNewDmTrigger,
	userInfo,
}: {
	handleNewDmTrigger: () => void;
	userInfo: userInfoDto | undefined;
}) => {
	const me = document.getElementsByClassName('popup');
	const [blocked, setBlocked] = useState<userInfoDto[]>([]);

	useEffect(() => {
		window.onclick = (event: any) => {
			if (event.target === me[0]) {
				handleNewDmTrigger();
			}
		};
	}, [me, handleNewDmTrigger]);

	useEffect(() => {
		const FetchBlocked = async () => {
			try {
				const response = await axios.get(
					'http://localhost:3333/friend/blocked',
					{ withCredentials: true }
				);
				setBlocked(response.data);
			} catch (error) {
				console.log(error);
			}
		};
		FetchBlocked();
	}, []);

	const handleCreateDM = async (username: string) => {
		if (blocked?.find((user) => user.username === username)) {
			alert('You cannot DM this user');
			return;
		}
		try {
			await axios.post(
				'http://localhost:3333/chat/dm/create',
				{ username },
				{ withCredentials: true }
			);
			handleNewDmTrigger();
		} catch (error) {
			alert('DM already exist');
			console.log(error);
		}
	};

	return (
		<div className="new-dm">
			<img src={close} alt="close-button" onClick={handleNewDmTrigger} />
			<h3>New DM</h3>
			<InputFlat
				icon={search}
				content="Search a user"
				userInfo={userInfo}
				handleCreateDM={handleCreateDM}
			/>
			<div className="new-dm-buttons">
				<button onClick={() => handleCreateDM('')}>Create</button>
				<button onClick={handleNewDmTrigger}>Cancel</button>
			</div>
		</div>
	);
};

const DmListElement = ({
	DM,
	userInfo,
}: {
	DM: DirectMessageDto;
	userInfo: userInfoDto | undefined;
}) => {
	const user: userInfoDto =
		userInfo?.id === DM.senderId ? DM.receiver : DM.sender;

	return (
		<div className="dm-list-element">
			<img className="dm-list-element-avatar" src={user.avatar} alt="" />
			<h4>{user.username}</h4>
			<div className="dm-list-buttons">
				<div className="buttons-wrapper">
					<img
						className="dm-list-element-controller"
						src={controller}
						alt="controller icon"
					/>
				</div>
				<div className="buttons-wrapper">
					<img
						className="dm-list-element-block"
						src={block}
						alt="block icon"
					/>
				</div>
			</div>
		</div>
	);
};

const DmList = ({
	DMList,
	userInfo,
}: {
	DMList: DirectMessageDto[];
	userInfo: userInfoDto | undefined;
}) => {
	return (
		<div className="dm-list">
			{DMList.map((DM, index) => {
				return (
					<DmListElement DM={DM} key={index} userInfo={userInfo} />
				);
			})}
		</div>
	);
};

const Aside = ({
	buttonContent,
	DMList,
	userInfo,
}: {
	buttonContent: string;
	DMList: DirectMessageDto[];
	userInfo: userInfoDto | undefined;
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
			<DmList DMList={DMList} userInfo={userInfo} />
			<PopUp trigger={newDmTrigger}>
				<NewDm
					handleNewDmTrigger={handleNewDmTrigger}
					userInfo={userInfo}
				/>
			</PopUp>
		</div>
	);
};

interface Props {
	socket: Socket;
	DM: DirectMessageDto;
	userInfo: userInfoDto | undefined;
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
						message.userId === userInfo?.id
							? (message.username = userInfo?.username)
							: (message.username = ''),
						(message.content = message.message)
					);
				});
				setMessages(reponse.data.reverse());
			} catch (error) {
				console.log(error);
			}
		};

		socket?.on('DM', (message: any) => {
			if (message.DMid === DM.id)
				setMessages((messages) => [message, ...messages]);
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
			DM?.senderId === userInfo?.id ? DM?.receiverId : DM?.senderId;
		socket?.emit('DM', {
			...message,
			DMid: DM.id,
			sender: userInfo?.id,
			receiver,
		});
		message.avatar = userInfo?.avatar;
		message.createdAt = new Date();
		setMessages((messages) => [message, ...messages]);
	};

	return (
		<div className="dm-beside">
			<BasicFrame
				height="91%"
				title={
					!DM || DM.id === 0
						? 'No Chat selected'
						: DM.senderId === userInfo?.id
						? DM.receiver.username
						: userInfo?.username
				}>
				<div className="chat-bubble-container">
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
										src={message.avatar}
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

export interface userInfoDto {
	id: number;
	username: string;
	avatar: string;
}

export const DmElement = () => {
	const [userInfo, setUserInfo] = useState<userInfoDto>();
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
			<Aside buttonContent="New DM" DMList={DMList} userInfo={userInfo} />
			<Beside socket={socket} DM={DMList[0]} userInfo={userInfo} />
		</div>
	);
};
