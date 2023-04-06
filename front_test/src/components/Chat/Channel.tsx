import { useEffect, useState } from "react";
import axios from "axios";
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
			<JoinnedChannels ChannelsList={channels} />
		</div>
	);
}

export default Channel;
