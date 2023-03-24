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
			await axios.post(
				"http://localhost:3333/chat/create/" + name,
				{},
				{ withCredentials: true }
			);
			fetchChannels();
		} catch (error) {
			console.error(error);
		}
	};

	const JoinChannel = async (name: string) => {
		try {
			await axios.post(
				"http://localhost:3333/chat/join/" + name,
				{},
				{ withCredentials: true }
			);
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
			<button onClick={() => CreateChannel(value)}>Create</button>
			<h1>List of Channels</h1>
			<ul>
				{channels.map((channel) => (
					<li key={channel.id}>
						<div className="channel-info">
							<span className="friend-username">
								{channel.name}
							</span>
						</div>
						<button
							className="add-friend"
							onClick={() => JoinChannel(channel.name)}
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
