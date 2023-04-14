import MessageInput from "./MessageInput";
import Messages from "./Messages";
import Notification from "../Notification/Notification";
import { useEffect, useState } from "react";

export interface DirectMessageDto {
	id: number;
	createdAt: string;
	messages: any[];
	senderId: number;
	receiverId: number;
	sender: any;
	receiver: any;
}

function DirectMessage({ DMList, userInfo, socket }: any) {
	const [selectedDM, setSelectedDM] = useState<number>(0);
	const [messages, setMessages] = useState<any[]>([]);
	const [notification, setNotification] = useState({ message: "", type: "" });

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

	return (
		<>
			<Notification
				message={notification.message}
				type={notification.type}
			/>
			<div className="wrapper">
				<div className="container">
					<div className="left">
						<div className="top">
							<p>Direct Messages</p>
							<button>New DM</button>
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
									<span className="name">
										{userInfo.id === DM.senderId
											? DM.receiverId
											: DM.senderId}
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
										: selectedDM}
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
