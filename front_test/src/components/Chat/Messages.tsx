import { MessageDto } from "./Chat";

function Messages({ messages }: { messages: MessageDto[] }) {
	return (
		<div>
			{messages.map((message, index) => (
				<div key={index}>
					{message.username}: {message.content}
				</div>
			))}
		</div>
	);
}

export default Messages;
