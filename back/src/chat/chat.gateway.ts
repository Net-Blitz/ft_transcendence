import {
	MessageBody,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
} from "@nestjs/websockets";

@WebSocketGateway(3334, { cors: "*" })
export class ChatGateway {
	@WebSocketServer()
	server: { emit: (arg0: string, arg1: string) => void };
	@SubscribeMessage("message")
	handleMessage(@MessageBody() message: string): void {
		console.log("message: ", message);
		this.server.emit("message", message);
	}
}
