import { useState } from 'react';
import { MessageDto } from './Messages';
import send from './Ressources/send.svg';

function MessageInput({
	sendMessage,
	userInfo,
}: {
	sendMessage: (value: MessageDto) => void;
	userInfo: any;
}) {
	const [value, setValue] = useState('');

	const handleSendMessage = () => {
		sendMessage({ username: userInfo.username, content: value });
		setValue('');
	};

	return (
		<div className="chat-write">
			<input
				onChange={(e) => setValue(e.target.value)}
				placeholder="Type your message"
				value={value}
				type="text"
			/>
			<button className="chat-send" onClick={() => handleSendMessage()}>
				<img src={send} alt="send" />
			</button>
		</div>
	);
}

export default MessageInput;
