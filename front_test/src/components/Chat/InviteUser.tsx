import { useState } from "react";
import axios from "axios";

function InviteUser({ channelName }: { channelName: string }) {
	const [username, setUsername] = useState("");

	const handleInvite = async () => {
		try {
			await axios.post(
				"http://localhost:3333/chat/invite/" + channelName,
				{ username: username },
				{ withCredentials: true }
			);
		} catch (error) {
			console.error(error);
		}
	};

	return (
		<div>
			<input
				onChange={(e) => setUsername(e.target.value)}
				placeholder="Enter username to invite"
				value={username}
				type="text"
			/>
			<button onClick={handleInvite} className="add-friend">
				Invite
			</button>
		</div>
	);
}

export default InviteUser;
