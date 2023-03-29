import { useState } from "react";
import { MessageDto } from "./Chat";

function MessageInput({
	sendMessage,
	userInfo,
}: {
	sendMessage: (value: MessageDto) => void;
	userInfo: any;
}) {
	const [value, setValue] = useState("");

	const handleSendMessage = () => {
		sendMessage({ username: userInfo.username, content: value });
		setValue("");
	};

	return (
		<>
			<input
				onChange={(e) => setValue(e.target.value)}
				placeholder="Type your message"
				value={value}
				type="text"
			/>
			<button onClick={() => handleSendMessage()}>Send</button>
		</>
	);
}

export default MessageInput;
