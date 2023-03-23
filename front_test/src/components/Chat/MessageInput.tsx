import { useState } from "react";

function MessageInput({
	sendMessage,
}: {
	sendMessage: (value: string) => void;
}) {
	const [value, setValue] = useState("");

	return (
		<>
			<input
				onChange={(e) => setValue(e.target.value)}
				placeholder="Type your message"
				value={value}
				type="text"
			/>
			<button onClick={() => sendMessage(value)}>Send</button>
		</>
	);
}

export default MessageInput;
