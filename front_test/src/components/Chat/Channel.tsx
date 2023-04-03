import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import axios from "axios";
import { Route, Routes, useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import Chat from "./Chat";
import JoinnedChannels from "./Joinnedchannel";

export interface ChannelDto {
	id: number;
	name: string;
	state: string;
	ownerId: number;
}

function Channel() {
	const [channels, setChannels] = useState<ChannelDto[]>([]);
	const [name, setName] = useState("");
	const [password, setPassword] = useState("");
	const [privacy, setPrivacy] = useState("PUBLIC");
	const [invites, setInvites] = useState<any[]>([]);
	const [socket, setSocket] = useState<Socket>();
	//const [JoinnedChannels, setJoinnedChannels] = useState<string[]>([]);

	const navigate = useNavigate();

	const fetchChannels = async () => {
		try {
			const response = await axios.get<ChannelDto[]>(
				"http://localhost:3333/chat/channels",
				{ withCredentials: true }
			);
			setChannels(response.data);
		} catch (error) {
			console.error(error);
		}
		fetchInvites();
	};

	const fetchInvites = async () => {
		try {
			const response = await axios.get(
				"http://localhost:3333/chat/invites",
				{ withCredentials: true }
			);
			setInvites(response.data);
		} catch (error) {
			console.error(error);
		}
	};

	useEffect(() => {
		fetchChannels();

		const interval = setInterval(fetchChannels, 5000);
		return () => clearInterval(interval);
	}, []);

	useEffect(() => {
		const newSocket = io("http://localhost:3334");
		setSocket(newSocket);

		return () => {
			newSocket.disconnect();
		};
	}, []);

	const JoinChannel = async (
		name: string,
		state: string,
		password: string
	) => {
		//console.log("Joining channel: " + name + " with password: " + password);
		try {
			if (state === "PROTECTED") {
				await axios.post(
					"http://localhost:3333/chat/join/" + name,
					{ state: "PROTECTED", password },
					{ withCredentials: true }
				);
			} else if (state === "PUBLIC") {
				await axios.post(
					"http://localhost:3333/chat/join/" + name,
					{ state: "PUBLIC" },
					{ withCredentials: true }
				);
			} else if (state === "PRIVATE") {
				await axios.post(
					"http://localhost:3333/chat/join/" + name,
					{ state: "PRIVATE" },
					{ withCredentials: true }
				);
			} else {
				return;
			}
			//setJoinnedChannels((prev) => [...prev, name]);
			//JoinnedChannels.map((channel) => {
			//	console.log("Joinned channel: " + channel);
			//});
			//navigate("/chat/" + name);
		} catch (error) {
			console.error(error);
		}
	};

	const handleSubmit = async (event: any) => {
		event.preventDefault();
		try {
			let state = "PUBLIC";
			switch (privacy) {
				case "PUBLIC":
					state = "PUBLIC";
					break;
				case "PROTECTED":
					state = "PROTECTED";
					break;
				case "PRIVATE":
					state = "PRIVATE";
					break;
			}
			console.log("state: " + state);
			await axios.post(
				"http://localhost:3333/chat/create/" + name,
				{ state, password },
				{ withCredentials: true }
			);
			setName("");
			fetchChannels();
		} catch (error) {
			console.error(error);
		}
	};

	const handlePrivacyChange = (event: any) => {
		setPrivacy(event.target.value);
	};

	const ChannelsList = channels.map((channel) => channel.name);

	return (
		<div>
			<h1>Create a Channel</h1>
			<form onSubmit={handleSubmit}>
				<label>
					Create a channel:
					<input
						onChange={(e) => setName(e.target.value)}
						placeholder="Enter channel name"
						value={name}
						type="text"
					/>
				</label>
				<label>
					Privacy:
					<select value={privacy} onChange={handlePrivacyChange}>
						<option value="PUBLIC">Public</option>
						<option value="PROTECTED">Protected</option>
						<option value="PRIVATE">Private</option>
					</select>
				</label>

				{privacy === "PROTECTED" && (
					<input
						onChange={(e) => setPassword(e.target.value)}
						placeholder="Enter password"
						value={password}
						type="password"
					/>
				)}
				<button type="submit">Create</button>
			</form>
			<h1>List of Channels</h1>
			<ul>
				{channels
					.sort((a, b) => (a.state === "PROTECTED" ? -1 : 1))
					.map((channel) => (
						<li key={channel.id}>
							<div className="channel-info">
								<span className="friend-username">
									{channel.name}
								</span>
								{channel.state === "PROTECTED" && (
									<input
										onChange={(e) =>
											setPassword(e.target.value)
										}
										placeholder="Enter password"
										value={password}
										type="password"
									/>
								)}
							</div>
							<button
								className="add-friend"
								onClick={() =>
									JoinChannel(
										channel.name,
										channel.state,
										password
									)
								}
							>
								Join Channel
							</button>
						</li>
					))}
			</ul>
			<h1>Invites</h1>
			<ul>
				{invites.map((invite) => (
					<li key={invite.id}>
						<div className="friend-info">
							<span className="friend-username">
								{invite.channels.name}
							</span>
						</div>
						<button
							className="add-friend"
							onClick={() =>
								JoinChannel(invite.channels.name, "PRIVATE", "")
							}
						>
							Join Channel
						</button>
					</li>
				))}
			</ul>
			<JoinnedChannels ChannelsList={ChannelsList} />
		</div>
	);
}

export default Channel;
