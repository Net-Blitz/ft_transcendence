export interface MessageDto {
	username: string;
	content: string;
	avatar?: string;
	createdAt: string;
}

function Messages({
	messages,
	userInfo,
}: {
	messages: MessageDto[];
	userInfo: any;
}) {
	return (
		<div className="chat-chat">
			{messages.map((message, index) => (
				<div
					key={index}
					className={`chat-bubble ${
						userInfo.username === message.username
							? 'chat-me'
							: 'chat-you'
					}`}>
					{message.username}: {message.content}
				</div>
			))}
		</div>
	);
}

export default Messages;
