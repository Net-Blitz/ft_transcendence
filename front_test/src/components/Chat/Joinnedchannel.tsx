import { useEffect, useRef, useState } from "react";
import "./Chat.css";
import MessageInput from "./MessageInput";
import { MessageDto } from "./Chat";
import { ChannelDto } from "./Channel";
import axios from "axios";
import { Socket, io } from "socket.io-client";
import Messages from "./Messages";
import UsersList from "./UsersList";
import Notification from "../Notification/Notification";

function JoinnedChannels({ ChannelsList }: any) {
	const [selectedChannel, setSelectedChannel] = useState<string>("");
	const [socket, setSocket] = useState<Socket>();
	const [userInfo, setUserInfo] = useState<any>();
	const [channel, setChannel] = useState<ChannelDto>();
	const [messages, setMessages] = useState<MessageDto[]>([]);
	const [showUsers, setShowUsers] = useState(false);
	const [notification, setNotification] = useState({ message: "", type: "" });

	// <=== Popup Password ===>
	const [PopupPassword, setPopupPassword] = useState(""); // <--- Password for protected channel
	const [PopupPasswordChannel, setPopupPasswordChannel] = useState(""); // <--- Name of protected channel
	const PopupPasswordRef = useRef<HTMLDivElement>(null);
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
		console.log(channel);
		if (channel?.state === "PUBLIC") {
			setSelectedChannel(channel.name);
			socket?.emit("join", {
				channel: channel.name,
				username: userInfo?.username,
			});
		} else if (channel?.state === "PROTECTED") {
			if (
				SaveChannel.find((channelName) => channelName === channel.name)
			) {
				setSelectedChannel(channel.name);
				socket?.emit("join", {
					channel: channel.name,
					username: userInfo?.username,
				});
				setPopupPasswordChannel("");
			} else {
				setPopupPasswordChannel(channel.name);
			}
		} else if (channel?.state === "PRIVATE") {
			if (
				SaveChannel.find((channelName) => channelName === channel.name)
			) {
				setSelectedChannel(channel.name);
				socket?.emit("join", {
					channel: channel.name,
					username: userInfo?.username,
				});
			} else {
				try {
					await axios.post(
						"http://localhost:3333/chat/join/" + channel.name,
						{ state: "PRIVATE" },
						{ withCredentials: true }
					);
					setSelectedChannel(channel.name);
					socket?.emit("join", {
						channel: channel.name,
						username: userInfo?.username,
					});
					setSaveChannel([...SaveChannel, channel.name]);
					setNotification({
						message: "You joinned " + channel.name,
						type: "success",
					});
				} catch (error) {
					setNotification({
						message:
							"This channel is private, you have to be invited",
						type: "error",
					});
				}
			}
		}
	};

	const JoinProtectedChannel = async () => {
		try {
			await axios.post(
				"http://localhost:3333/chat/join/" + PopupPasswordChannel,
				{ state: "PROTECTED", password: PopupPassword },
				{ withCredentials: true }
			);
			setSelectedChannel(PopupPasswordChannel);
			socket?.emit("join", {
				channel: PopupPasswordChannel,
				username: userInfo?.username,
			});
			setPopupPasswordChannel("");
			setSaveChannel([...SaveChannel, PopupPasswordChannel]);
			setNotification({
				message: "You joinned " + PopupPasswordChannel,
				type: "success",
			});
		} catch (error) {
			setNotification({
				message: "Wrong password",
				type: "error",
			});
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
		console.log(message);
		console.log(selectedChannel);
		if (!message.content) return;
		socket?.emit("chat", { ...message, channel: selectedChannel });
	};

	const handleToggleUsers = () => {
		setShowUsers(!showUsers);
	};

	// <=== Popup Password ===>
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				PopupPasswordRef.current &&
				!PopupPasswordRef.current.contains(event.target as Node)
			) {
				setPopupPasswordChannel("");
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [PopupPasswordRef]);

	const ClosePopupPassword = () => {
		setPopupPasswordChannel("");
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
						<ul className="people">
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
									{PopupPasswordChannel !== "" && (
										<div
											ref={PopupPasswordRef}
											className="overlay"
										>
											<div className="popup">
												<label
													className="close"
													onClick={ClosePopupPassword}
												>
													&times;
												</label>
												<h2>Private Channel</h2>
												<div className="content">
													<p>
														Enter the password of
														the channel
													</p>
													<input
														onChange={(e) =>
															setPopupPassword(
																e.target.value
															)
														}
														placeholder="Enter password"
														value={PopupPassword}
														type="password"
													/>
													<button
														onClick={() =>
															JoinProtectedChannel()
														}
													>
														Join
													</button>
												</div>
											</div>
										</div>
									)}
									<span className="name">{channel.name}</span>
									<span className="role">
										{channel.state}
									</span>
								</li>
							))}
						</ul>
					</div>
					{showUsers && (
						<div className="middle">
							<UsersList
								channel={selectedChannel}
								socket={socket}
							/>
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
		</>
	);
}

export default JoinnedChannels;
