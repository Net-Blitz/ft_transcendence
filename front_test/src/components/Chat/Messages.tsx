export interface MessageDto {
	username: string;
	content: string;
}

function Messages({
	messages,
	userInfo,
}: {
	messages: MessageDto[];
	userInfo: any;
}) {
	return (
		<div className="chat">
			{messages.map((message, index) => (
				<div
					key={index}
					className={`bubble ${
						userInfo.username === message.username ? "me" : "you"
					}`}
				>
					{message.username}: {message.content}
				</div>
			))}
		</div>
	);
}

export default Messages;
