import { useEffect, useState } from "react";
import "./Chat.css";
import MessageInput from "./MessageInput";
import { MessageDto } from "./Chat";
import { ChannelDto } from "./Channel";
import axios from "axios";
import { Socket, io } from "socket.io-client";
import Messages from "./Messages";
import UsersList from "./UsersList";

function JoinnedChannels({ ChannelsList }: any) {
	const [selectedChannel, setSelectedChannel] = useState<string>("");
	const [socket, setSocket] = useState<Socket>();
	const [userInfo, setUserInfo] = useState<any>();
	const [channel, setChannel] = useState<ChannelDto>();
	const [messages, setMessages] = useState<MessageDto[]>([]);
	const [showUsers, setShowUsers] = useState(false);

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

	const handleChannelClick = (channel: string) => {
		const fetchChannel = async () => {
			const response = await axios.get(
				"http://localhost:3333/chat/channel/" + selectedChannel,
				{ withCredentials: true }
			);
			setChannel(response.data.channel);
		};

		setSelectedChannel(channel);
		socket?.emit("join", {
			channel: channel,
			username: userInfo?.username,
		});
		fetchChannel();
	};

	useEffect(() => {
		const handleMessage = (message: MessageDto) => {
			console.log(message);
			setMessages([...messages, message]);
		};

		socket?.on("chat", handleMessage);
		return () => {
			socket?.off("chat", handleMessage);
		};
	}, [messages, selectedChannel, socket]);

	const sendMessage = (message: MessageDto) => {
		socket?.emit("chat", { ...message, channel: selectedChannel });
	};

	const handleToggleUsers = () => {
		setShowUsers(!showUsers);
	};

	return (
		<div className="wrapper">
			<div className="container">
				<div className="left">
					<div className="top">
						<p>Channels</p>
						<button onClick={handleToggleUsers}>Show Users</button>
					</div>
					<ul className="people">
						{ChannelsList.map((channel: string) => (
							<li
								key={channel}
								className={`person ${
									selectedChannel === channel ? "active" : ""
								}`}
								onClick={() => handleChannelClick(channel)}
							>
								<span className="name">{channel}</span>
							</li>
						))}
					</ul>
				</div>
				{showUsers && (
					<div className="middle">
						<UsersList channel={selectedChannel} socket={socket} />
					</div>
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
	);
}

export default JoinnedChannels;
