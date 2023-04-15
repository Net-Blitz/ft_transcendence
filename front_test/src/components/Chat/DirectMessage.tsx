import MessageInput from "./MessageInput";
import Notification from "../Notification/Notification";
import { useEffect, useState } from "react";
import PopupDM from "./PopupDM";

export interface DirectMessageDto {
	id: number;
	createdAt: string;
	messages: any[];
	senderId: number;
	receiverId: number;
	sender: any;
	receiver: any;
}

function DirectMessage({
	DMList,
	userInfo,
	socket,
	channelOrDM,
	handleOptionChange,
}: any) {
	const [selectedDM, setSelectedDM] = useState<number>(0);
	const [messages, setMessages] = useState<any[]>([]);
	const [notification, setNotification] = useState({ message: "", type: "" });
	const [PopupNewDm, setPopupNewDm] = useState(false);

	const handleDMClick = async (DM: DirectMessageDto) => {
		if (DM.id === selectedDM) return;
		setSelectedDM(DM.id);
	};

	useEffect(() => {
		socket?.on("DM", (message: any) => {
			if (message.DMid === selectedDM)
				setMessages((messages) => [...messages, message]);
		});
		socket?.emit("ConnectedDM", { id: userInfo?.id });

		return () => {
			socket?.off("DM");
		};
	}, [selectedDM, socket, userInfo?.id]);

	const sendMessage = (message: any) => {
		if (!message.content) return;
		const DM = DMList.find((DM: DirectMessageDto) => DM.id === selectedDM);
		const receiver =
			DM?.senderId === userInfo.id ? DM?.receiverId : DM?.senderId;
		socket?.emit("DM", {
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
			<Notification
				message={notification.message}
				type={notification.type}
			/>
			{PopupNewDm && (
				<PopupDM
					ClosePopup={handleTogglePopupNewDm}
					setNotification={setNotification}
				/>
			)}
			<div className="wrapper">
				<div className="container">
					<div className="left">
						<div className="top">
							<select
								id="channelOrDM"
								value={channelOrDM}
								onChange={handleOptionChange}
							>
								<option value="channel">Channels</option>
								<option value="dm">Direct Message</option>
							</select>
							<button onClick={handleTogglePopupNewDm}>
								New DM
							</button>
						</div>
						<ul className="channel">
							{DMList.map((DM: DirectMessageDto) => (
								<li
									key={DM.id}
									className={`person ${
										selectedDM === DM.id ? "active" : ""
									}`}
									onClick={() => handleDMClick(DM)}
								>
									<img
										className="friend-img"
										src={
											userInfo.id === DM.senderId
												? DM.receiver.avatar
												: DM.sender.avatar
										}
										alt="avatar"
									/>
									<span className="name">
										{userInfo.id === DM.senderId
											? DM.receiver.username
											: DM.sender.username}
									</span>
								</li>
							))}
						</ul>
					</div>
					<div className="right">
						<div className="top">
							<span>
								To:{" "}
								<span className="name">
									{selectedDM === 0
										? "No Chat selected"
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
							<div className="chat center">
								<p>No Chat selected</p>
							</div>
						)}
						<div className="chat">
							{messages.map((message, index) => (
								<div
									key={index}
									className={`bubble ${
										userInfo.username === message.username
											? "me"
											: "you"
									}`}
								>
									{message.content}
								</div>
							))}
						</div>
						<div className="write">
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
