import { MessageDto } from "./Chat";

function Messages({
	messages,
	userInfo,
}: {
	messages: MessageDto[];
	userInfo: any;
}) {
	return (
		//<div className="chat">
		//	<div className="bubble you">
		//		Hello, how are you? Lorem ipsum dolor sit amet,
		//	</div>
		//	<div className="bubble me">
		//		Hello, how are you? Lorem ipsum dolor sit amet,
		//	</div>
		//</div>
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
