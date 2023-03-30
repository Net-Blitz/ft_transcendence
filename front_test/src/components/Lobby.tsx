import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import { redirect } from "react-router-dom";

function Lobby() {
	//const [queue, setqueue] = useState<QueueObject[]>();
	//const [game, setgame] = useState<GameObject[]>();
	const navigate = useNavigate();
	const location = useLocation();
	const queueParam = location.state;
	
	const connectionObject = { //-> cause probablement le probleme de double connection ou alors c'est aue la page se re-render
		transports: ['websocket'],
		withCredentials: true,
		auth : {
			...queueParam
		}
	  };

	const socket: Socket = io(`http://localhost:3333/queue`, connectionObject);
				
	const joinGame = async (gameId: number) => {
			socket.close();
			navigate("/game", { state: { gameId: gameId, login: queueParam.login } } );
	}

	socket.on('disconnect', () => {
	});

	socket.on("close", () => {
		socket.close();
	});

	socket.on("redirect", (data:string) => {
		socket.close();
		navigate(data);
	});

	socket.on("queue1v1", (data:string) => {
		console.log("data: ", data);
	})

	socket.on("gameFound", (data:any) => {
		socket.close();
		joinGame(data.gameId);
	})


	const handleLeave = () => {
		socket.emit("leaveQueue");
		socket.close();
		navigate("/");
	};

	//const handleMatch = async () => {
	//	await axios.get("http://localhost:3333/queue/match", {withCredentials: true})
	//		.then((res) => {
	//			console.log("res: ", res);
	//			navigate("/lobby");
	//		})
	//		.catch((err) => {
	//			console.log(err);
	//		});
	//};

	//const handleConnect = async () => {
	//	await axios.get("http://localhost:3333/games/connect", {withCredentials: true})
	//		.then((res) => {
	//			if (res.data)					
	//				navigate("/game", { state: { gameId: res.data.id } } );
	//		})
	//		.catch((err) => {
	//			console.log(err);
	//		});
	//};


	return (
		<div>
			<h1>Lobby</h1>
			{/*<ul>
				{queue?.every ? (
					<div>
						{queue.map((user) => (
							<li key={user.id}>- {user.login}, {user.id}</li>
						))}
					</div>
				) : (
					<p>Loading...</p>
					)}
			</ul>
			<ul>
				{game?.every ? (
					<div>
						{game.map((game) => (
							<li key={game.id}>- Game:{game.id} -- player {game.user1Id} vs player {game.user2Id}
								<button onClick={() => joinGame(game.id)}>joinGame</button>
							</li>
						))}
					</div>
				) : (
					<p>Loading...</p>
					)}
			</ul>*/}
			<div>
				<button onClick={handleLeave}>LeaveLobby</button>
				{/*<button onClick={handleMatch}>Match</button>
				<button onClick={handleConnect}>ConnectToMyGame</button>*/}
			</div>
		</div>
	);
};

export default Lobby;
