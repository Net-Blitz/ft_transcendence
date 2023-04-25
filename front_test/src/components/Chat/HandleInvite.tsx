import axios from "axios";
import { useEffect, useState } from "react";

interface HandleInviteProps {
	socket: any;
	userInfo: any;
	setSelectedChannel: (channel: string) => void;
	setMessages: (messages: any[]) => void;
	SaveChannel: string[];
	setSaveChannel: (channels: string[]) => void;
	setAlert: (Alert: { message: string; type: "success" | "error" }) => void;
}

function HandleInvite({
	socket,
	userInfo,
	setSelectedChannel,
	setMessages,
	SaveChannel,
	setSaveChannel,
	setAlert,
}: HandleInviteProps) {
	const [Invites, setInvites] = useState<any[]>([]);

	useEffect(() => {
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
		fetchInvites();
		const interval = setInterval(fetchInvites, 5000);
		return () => clearInterval(interval);
	}, []);

	const JoinPrivateChannel = async (channelName: string) => {
		try {
			await axios.post(
				"http://localhost:3333/chat/join/" + channelName,
				{ state: "PRIVATE" },
				{ withCredentials: true }
			);
			setSelectedChannel(channelName);
			setMessages([]);
			socket?.emit("join", {
				channel: channelName,
				username: userInfo?.username,
			});
			setSaveChannel([...SaveChannel, channelName]);
			setAlert({
				message: "You joinned " + channelName,
				type: "success",
			});
		} catch (error) {
			setAlert({
				message: "You have already joinned this channel",
				type: "error",
			});
		}
	};

	const DeclineInvite = async (channelName: string) => {
		try {
			axios.delete("http://localhost:3333/chat/decline/" + channelName, {
				withCredentials: true,
			});
		} catch (error) {
			console.error(error);
		}
		setInvites(Invites.filter((channel) => channel.name !== channelName));
	};

	return (
		<>
			{Invites.map((invite) => (
				<li className="person" key={invite.id}>
					<span className="name">{invite.channels.name}</span>
					<span
						className="accept-invite"
						onClick={() => JoinPrivateChannel(invite.channels.name)}
					>
						&#10003;
					</span>
					<span
						className="decline-invite"
						onClick={() => DeclineInvite(invite.channels.name)}
					>
						&times;
					</span>
				</li>
			))}
		</>
	);
}

export default HandleInvite;
