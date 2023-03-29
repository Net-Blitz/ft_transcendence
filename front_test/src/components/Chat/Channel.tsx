import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export interface ChannelDto {
	id: number;
	name: string;
	state: string;
}

function Channel() {
	const [channels, setChannels] = useState([] as ChannelDto[]);
	const [value, setValue] = useState("");
	const [password, setPassword] = useState("");
	const [isPrivate, setIsPrivate] = useState(false);

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
	};

	useEffect(() => {
		fetchChannels();

		const interval = setInterval(fetchChannels, 5000);
		return () => clearInterval(interval);
	}, []);

	const CreateChannel = async (name: string) => {
		try {
			const state = isPrivate ? "PROTECTED" : "PUBLIC";
			//console.log("state: " + state);
			await axios.post(
				"http://localhost:3333/chat/create/" + name,
				{ state, password },
				{ withCredentials: true }
			);
			fetchChannels();
		} catch (error) {
			console.error(error);
		}
	};

	const JoinChannel = async (name: string, password: string) => {
		//console.log("Joining channel: " + name + " with password: " + password);
		try {
			if (password) {
				await axios.post(
					"http://localhost:3333/chat/join/" + name,
					{ state: "PROTECTED", password },
					{ withCredentials: true }
				);
			} else {
				await axios.post(
					"http://localhost:3333/chat/join/" + name,
					{ state: "PUBLIC" },
					{ withCredentials: true }
				);
			}
			navigate("/chat/" + name);
		} catch (error) {
			console.error(error);
		}
	};

	return (
		<div>
			<input
				onChange={(e) => setValue(e.target.value)}
				placeholder="Create a channel"
				value={value}
				type="text"
			/>
			<label>
				Private:
				<input
					type="checkbox"
					checked={isPrivate}
					onChange={() => setIsPrivate(!isPrivate)}
				/>
			</label>
			{isPrivate && (
				<input
					onChange={(e) => setPassword(e.target.value)}
					placeholder="Enter channel password"
					value={password}
					type="password"
				/>
			)}
			<button onClick={() => CreateChannel(value)}>Create</button>
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
									JoinChannel(channel.name, password)
								}
							>
								Join Channel
							</button>
						</li>
					))}
			</ul>
		</div>
	);
}

export default Channel;
