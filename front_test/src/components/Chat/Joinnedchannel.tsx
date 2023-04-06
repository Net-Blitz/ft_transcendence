import { useEffect, useState } from "react";
import "./Chat.css";
import MessageInput from "./MessageInput";
import { MessageDto } from "./Messages";
import { ChannelDto } from "./Channel";
import axios from "axios";
import { Socket, io } from "socket.io-client";
import Messages from "./Messages";
import UsersList from "./UsersList";
import Notification from "../Notification/Notification";
import PopupProtected from "./PopupProtected";
import HandleInvite from "./HandleInvite";

function JoinnedChannels({ ChannelsList }: any) {
	const [selectedChannel, setSelectedChannel] = useState<string>("");
	const [socket, setSocket] = useState<Socket>();
	const [userInfo, setUserInfo] = useState<any>();
	const [channel, setChannel] = useState<ChannelDto>();
	const [messages, setMessages] = useState<MessageDto[]>([]);
	const [showUsers, setShowUsers] = useState(false);
	const [notification, setNotification] = useState({ message: "", type: "" });

	// <=== Popup Password ===>
	const [PopupPassword, setPopupPassword] = useState<string>(""); // <-- name of protected channel
	const [SaveChannel, setSaveChannel] = useState<string[]>([]); // <--- Save all joinned protected || private channel

	useEffect(() => {
		const fetchData = async () => {
			const response = await axios.get("http://localhost:3333/users/me", {
				withCredentials: true,
			});
			setUserInfo(response.data);
		};
		const fetchChannel = async () => {
			if (!selectedChannel) return;
			const response = await axios.get(
				"http://localhost:3333/chat/channel/" + selectedChannel,
				{ withCredentials: true }
			);
			setChannel(response.data.channel);
		};
		fetchData();
		fetchChannel();
	}, [channel?.name, selectedChannel, userInfo?.username]);

	useEffect(() => {
		const newSocket = io("http://localhost:3334");
		setSocket(newSocket);

		return () => {
			newSocket.disconnect();
		};
	}, []);

	const handleChannelClick = async (channel: ChannelDto) => {
		if (channel?.state === "PUBLIC") {
			setSelectedChannel(channel.name);
			setMessages([]);
			socket?.emit("join", {
				channel: channel.name,
				username: userInfo?.username,
			});
		} else if (channel?.state === "PROTECTED") {
			if (
				SaveChannel.find((channelName) => channelName === channel.name)
			) {
				setSelectedChannel(channel.name);
				setMessages([]);
				socket?.emit("join", {
					channel: channel.name,
					username: userInfo?.username,
				});
				handleTogglePopupPassword("");
			} else {
				handleTogglePopupPassword(channel.name);
			}
		} else if (channel?.state === "PRIVATE") {
			if (channel.ownerId === userInfo.id) {
				setSelectedChannel(channel.name);
				setMessages([]);
				socket?.emit("join", {
					channel: channel.name,
					username: userInfo?.username,
				});
			} else if (
				SaveChannel.find((channelName) => channelName === channel.name)
			) {
				setSelectedChannel(channel.name);
				setMessages([]);
				socket?.emit("join", {
					channel: channel.name,
					username: userInfo?.username,
				});
			} else {
				setNotification({
					message: "This channel is private, you have to be invited",
					type: "error",
				});
			}
		}
	};

	useEffect(() => {
		const handleMessage = (message: MessageDto) => {
			setMessages([...messages, message]);
		};

		socket?.on("chat", handleMessage);
		return () => {
			socket?.off("chat", handleMessage);
		};
	}, [messages, selectedChannel, socket]);

	const sendMessage = (message: MessageDto) => {
		if (!message.content) return;
		socket?.emit("chat", { ...message, channel: selectedChannel });
	};

	const handleToggleUsers = () => {
		setShowUsers(!showUsers);
	};

	const handleTogglePopupPassword = (channel: string) => {
		setPopupPassword(channel);
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
							<p>Channels</p>
							<button onClick={handleToggleUsers}>
								Show Users
							</button>
						</div>
						<ul className="channel">
							{ChannelsList.map((channel: ChannelDto) => (
								<li
									key={channel.id}
									className={`person ${
										selectedChannel === channel.name
											? "active"
											: ""
									}`}
									onClick={() => handleChannelClick(channel)}
								>
									{PopupPassword !== "" && (
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
											setNotification={setNotification}
										/>
									)}
									<span className="name">{channel.name}</span>
									<span className="role">
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
								setNotification={setNotification}
							/>
						</ul>
					</div>
					{showUsers && (
						<UsersList channel={selectedChannel} socket={socket} />
					)}
					<div className="right">
						<div className="top">
							<span>
								To:{" "}
								<span className="name">
									{selectedChannel === ""
										? "No Channel selected"
										: selectedChannel}
								</span>
							</span>
						</div>
						{selectedChannel === "" && (
							<div className="chat center">
								<p>No Channel selected</p>
							</div>
						)}
						<Messages messages={messages} userInfo={userInfo} />
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

export default JoinnedChannels;
