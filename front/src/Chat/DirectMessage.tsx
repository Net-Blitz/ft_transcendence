import MessageInput from './MessageInput';
import Alert from './Alert';
import { useEffect, useState } from 'react';
import PopupDM from './PopupDM';
import axios from 'axios';
import { Socket } from 'socket.io-client';

export interface DirectMessageDto {
	id: number;
	createdAt: string;
	messages: any[];
	senderId: number;
	receiverId: number;
	sender: any;
	receiver: any;
}

interface Props {
	DMList: DirectMessageDto[];
	userInfo: any;
	socket: Socket;
	channelOrDM: string;
	handleOptionChange: (e: any) => void;
}

function DirectMessage({
	DMList,
	userInfo,
	socket,
	channelOrDM,
	handleOptionChange,
}: Props) {
	const [selectedDM, setSelectedDM] = useState<number>(0);
	const [messages, setMessages] = useState<any[]>([]);
	const [alert, setAlert] = useState({ message: '', type: '' });
	const [PopupNewDm, setPopupNewDm] = useState(false);

	const handleDMClick = async (DM: DirectMessageDto) => {
		if (DM.id === selectedDM) return;
		setSelectedDM(DM.id);
	};

	useEffect(() => {
		if (selectedDM === 0) return;
		const getMessages = async () => {
			try {
				const reponse = await axios.get(
					'http://localhost:3333/chat/dm/messages/' + selectedDM,
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
			if (message.DMid === selectedDM)
				setMessages((messages) => [...messages, message]);
		});
		socket?.emit('ConnectedDM', { id: userInfo?.id });

		getMessages();

		return () => {
			socket?.off('DM');
		};
	}, [selectedDM, socket, userInfo?.id, userInfo?.username]);

	const sendMessage = (message: any) => {
		if (!message.content || !selectedDM) return;
		const DM = DMList.find((DM: DirectMessageDto) => DM.id === selectedDM);
		const receiver =
			DM?.senderId === userInfo.id ? DM?.receiverId : DM?.senderId;
		socket?.emit('DM', {
			...message,
			DMid: selectedDM,
			sender: userInfo.id,
			receiver,
		});
		setMessages((messages) => [...messages, message]);
	};

	const handleTogglePopupNewDm = () => {
		setPopupNewDm(!PopupNewDm);
	};

	return (
		<>
			<Alert message={alert.message} type={alert.type} />
			{PopupNewDm && (
				<PopupDM
					ClosePopup={handleTogglePopupNewDm}
					setAlert={setAlert}
					userInfo={userInfo}
				/>
			)}
			<div className="chat-wrapper">
				<div className="chat-container">
					<div className="chat-left">
						<div className="chat-top">
							<button
								onClick={() => handleOptionChange('channel')}>
								Channels
							</button>
							<button onClick={handleTogglePopupNewDm}>
								New DM
							</button>
						</div>
						<ul className="chat-channel">
							{DMList.map((DM: DirectMessageDto) => (
								<li
									key={DM.id}
									className={`chat-person ${
										selectedDM === DM.id
											? 'chat-active'
											: ''
									}`}
									onClick={() => handleDMClick(DM)}>
									<img
										className="chat-friend-img"
										src={
											userInfo.id === DM.senderId
												? 'http://localhost:3333/' +
												  DM.receiver.avatar
												: 'http://localhost:3333/' +
												  DM.sender.avatar
										}
										alt="avatar"
									/>
									<span className="chat-name">
										{userInfo.id === DM.senderId
											? DM.receiver.username
											: DM.sender.username}
									</span>
								</li>
							))}
						</ul>
					</div>
					<div className="chat-right">
						<div className="chat-top">
							<span>
								To:{' '}
								<span className="chat-name">
									{selectedDM === 0
										? 'No Chat selected'
										: DMList.find(
												(DM: DirectMessageDto) =>
													DM.id === selectedDM
										  )?.senderId === userInfo.id
										? DMList.find(
												(DM: DirectMessageDto) =>
													DM.id === selectedDM
										  )?.receiver.username
										: DMList.find(
												(DM: DirectMessageDto) =>
													DM.id === selectedDM
										  )?.sender.username}
								</span>
							</span>
						</div>
						{selectedDM === 0 && (
							<div className="chat-chat center">
								<p>No Chat selected</p>
							</div>
						)}
						<div className="chat-chat">
							{messages.map((message, index) => (
								<div
									key={index}
									className={`chat-bubble ${
										userInfo.username === message.username
											? 'chat-me'
											: 'chat-you'
									}`}>
									{message.content}
								</div>
							))}
						</div>
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

export default DirectMessage;
