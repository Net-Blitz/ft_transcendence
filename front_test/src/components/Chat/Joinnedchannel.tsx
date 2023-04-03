import { useEffect, useState } from "react";
import "./Chat.css";
import { userInfo } from "os";
import MessageInput from "./MessageInput";
import { MessageDto } from "./Chat";
import { ChannelDto } from "./Channel";
import axios from "axios";
import { Socket, io } from "socket.io-client";
import Messages from "./Messages";

function JoinnedChannels({ ChannelsList }: any) {
	const [selectedChannel, setSelectedChannel] = useState<string>("");
	const [socket, setSocket] = useState<Socket>();
	const [userInfo, setUserInfo] = useState<any>();
	const [channel, setChannel] = useState<ChannelDto>();
	const [messages, setMessages] = useState<MessageDto[]>([]);
	const [userChannel, setUserChannel] = useState<any>();

	useEffect(() => {
		const fetchData = async () => {
			const response = await axios.get("http://localhost:3333/users/me", {
				withCredentials: true,
			});
			setUserInfo(response.data);
		};
		const fetchChannel = async () => {
			const response = await axios.get<any>(
				"http://localhost:3333/chat/channel/" + selectedChannel,
				{ withCredentials: true }
			);
			setChannel(response.data.channel);
			setUserChannel(response.data.users);
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
		setSelectedChannel(channel);
		socket?.emit("join", {
			channel: channel,
			username: userInfo?.username,
		});
		socket?.emit("chat", {
			username: "Server",
			content: userInfo?.username + " has join the channel",
			channel: channel,
		});
	};

	useEffect(() => {
		const fetchChannel = async () => {
			const response = await axios.get(
				"http://localhost:3333/chat/channel/" + selectedChannel,
				{ withCredentials: true }
			);
			setChannel(response.data.channel);
			setUserChannel(response.data.users);
		};

		const handleMessage = (message: MessageDto) => {
			console.log(message);
			setMessages([...messages, message]);
			if (message.username === "Server") {
				fetchChannel();
			}
		};

		socket?.on("chat", handleMessage);
		return () => {
			socket?.off("chat", handleMessage);
		};
	}, [messages, selectedChannel, socket]);

	const sendMessage = (message: MessageDto) => {
		socket?.emit("chat", { ...message, channel: selectedChannel });
	};

	return (
		<div className="wrapper">
			<div className="container">
				<div className="left">
					<div className="top">
						<p>Joinned Channels</p>
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
				<div className="right">
					<div className="top">
						<span>
							To: <span className="name">{selectedChannel}</span>
						</span>
					</div>
					<Messages messages={messages} userInfo={userInfo} />
					<div className="write">
						<input type="text" />
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
