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
import CreateChannel from "./CreateChannel";

function JoinnedChannels({ ChannelsList, userInfo }: any) {
	const [selectedChannel, setSelectedChannel] = useState<string>("");
	const [socket, setSocket] = useState<Socket>();
	const [messages, setMessages] = useState<MessageDto[]>([]);
	const [showUsers, setShowUsers] = useState(false);
	const [notification, setNotification] = useState({ message: "", type: "" });
	const [PopupPassword, setPopupPassword] = useState<string>(""); // <-- name of protected channel
	const [SaveChannel, setSaveChannel] = useState<string[]>([]); // <--- Save all joinned protected || private channel
	const [PopupCreateChannel, setPopupCreateChannel] = useState(false);
	const [ban, setBan] = useState<any[]>([]); // <--- Save all ban channel
	const [blocked, setBlocked] = useState<any[]>([]); // <--- Save all blocked user

	useEffect(() => {
		const fetchBan = async () => {
			if (!userInfo?.username) return;
			const response = await axios.get(
				"http://localhost:3333/chat/ban/" + userInfo?.username,
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
					"http://localhost:3333/friend/blocked",
					{
						withCredentials: true,
					}
				);
				setBlocked(response.data);
			} catch (error) {}
		};
		fetchBlocked();
	}, [messages]);

	useEffect(() => {
		const newSocket = io("http://localhost:3334");
		setSocket(newSocket);

		return () => {
			newSocket.disconnect();
		};
	}, []);

	const handleChannelClick = async (channel: ChannelDto) => {
		const response = await axios.get(
			"http://localhost:3333/chat/ban/" + userInfo?.username,
			{
				withCredentials: true,
			}
		);
		setBan(response.data);
		if (ban?.find((ban: any) => ban.name === channel.name)) {
			setNotification({
				message: "You are banned from this channel",
				type: "error",
			});
		} else if (channel?.state === "PUBLIC") {
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
			if (!blocked.find((user) => user.username === message.username))
				setMessages([...messages, message]);
		};

		socket?.on("chat", handleMessage);
		socket?.on("kick", (data: any) => {
			if (data?.username === userInfo?.username) {
				setSelectedChannel("");
				setMessages([]);
				setNotification({
					message: `You have been kicked from ${data?.channel}`,
					type: "error",
				});
			}
		});
		socket?.on("ban", (data: any) => {
			if (data?.username === userInfo?.username) {
				setSelectedChannel("");
				setMessages([]);
				setNotification({
					message: `You have been banned from ${data?.channel}`,
					type: "error",
				});
			}
		});
		return () => {
			socket?.off("chat", handleMessage);
			socket?.off("kick");
			socket?.off("ban");
		};
	}, [blocked, messages, selectedChannel, socket, userInfo?.username]);

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

	const handleToggleCreateChannel = () => {
		setPopupCreateChannel(!PopupCreateChannel);
	};

	return (
		<>
			<Notification
				message={notification.message}
				type={notification.type}
			/>
			{PopupCreateChannel && (
				<CreateChannel
					ClosePopup={handleToggleCreateChannel}
					setNotification={setNotification}
				/>
			)}
			<div className="wrapper">
				<div className="container">
					<div className="left">
						<div className="top">
							<p>Channels</p>
							<button onClick={handleToggleCreateChannel}>
								Create
							</button>
							<button onClick={handleToggleUsers}>Users</button>
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
