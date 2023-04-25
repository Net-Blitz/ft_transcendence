import axios from "axios";
import { useEffect, useRef, useState } from "react";

interface PopupProtectedProps {
	channel: string;
	socket: any;
	userInfo: any;
	setSelectedChannel: (channel: string) => void;
	setMessages: (messages: any[]) => void;
	SaveChannel: string[];
	setSaveChannel: (channels: string[]) => void;
	setAlert: (Alert: { message: string; type: "success" | "error" }) => void;
}

function PopupProtected({
	channel,
	socket,
	userInfo,
	setSelectedChannel,
	setMessages,
	SaveChannel,
	setSaveChannel,
	setAlert,
}: PopupProtectedProps) {
	const [Password, setPassword] = useState(""); // <--- Password for protected channel
	const [ChannelName, setChannelName] = useState(channel); // <--- Name of protected channel
	const PopupRef = useRef<HTMLDivElement>(null); // <--- Ref for protected channel

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				PopupRef.current &&
				!PopupRef.current.contains(event.target as Node)
			) {
				setChannelName("");
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [PopupRef]);

	const ClosePopupPassword = () => {
		setChannelName("");
	};

	const JoinProtectedChannel = async () => {
		try {
			await axios.post(
				"http://localhost:3333/chat/join/" + ChannelName,
				{ state: "PROTECTED", password: Password },
				{ withCredentials: true }
			);
			setSelectedChannel(ChannelName);
			setMessages([]);
			socket?.emit("join", {
				channel: ChannelName,
				username: userInfo?.username,
			});
			setChannelName("");
			setSaveChannel([...SaveChannel, ChannelName]);
			setAlert({
				message: "You joinned " + ChannelName,
				type: "success",
			});
		} catch (error) {
			setAlert({
				message: "Wrong password",
				type: "error",
			});
		}
	};

	return (
		<>
			{ChannelName !== "" && (
				<div ref={PopupRef} className="overlay">
					<div className="popup">
						<label className="close" onClick={ClosePopupPassword}>
							&times;
						</label>
						<h2>Protected Channel</h2>
						<div className="content">
							<p>Enter the password of the channel</p>
							<input
								onChange={(e) => setPassword(e.target.value)}
								placeholder="Enter password"
								value={Password}
								type="password"
							/>
							<button onClick={() => JoinProtectedChannel()}>
								Join
							</button>
						</div>
					</div>
				</div>
			)}
		</>
	);
}

export default PopupProtected;
