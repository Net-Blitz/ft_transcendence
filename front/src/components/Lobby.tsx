import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface QueueObject {

	id: number;
	login: string;
	mode: string;
	bonus1: boolean;
	bonus2: boolean;
	elo: number;
}

interface GameObject {

	id: number;
	difficulty: number;
	state: string;
	score1: number;
	score2: number;
	playerConnected: number;
	user1Id: number;
	user2Id: number;
}

function Lobby() {
	const [queue, setqueue] = useState<QueueObject[]>();
	const [game, setgame] = useState<GameObject[]>();
	const navigate = useNavigate();

	useEffect(() => {
		const fetchData = async () => {
			const response = await axios.get("http://localhost:3333/queue/all", {
				withCredentials: true,
			});
			setqueue(response.data);
		};
		fetchData();
	}, []);

	useEffect(() => {
		const fetchData = async () => {
			const response = await axios.get("http://localhost:3333/games/", {
				withCredentials: true,
			});
			setgame(response.data);
		};
		fetchData();
	}, []);
	//console.log(userInfo);
	
	const handleLeave = async () => {
		await axios.post("http://localhost:3333/queue/remove", {}, {
			withCredentials: true})
			.then((res) => {
				console.log(res);
			})
			.catch((err) => {
				console.log(err);
			});
			navigate("/");
	};

	const handleMatch = async () => {
		await axios.get("http://localhost:3333/queue/match", {withCredentials: true})
			.then((res) => {
				console.log("res: ", res);
				navigate("/lobby");
			})
			.catch((err) => {
				console.log(err);
			});
	};

	const handleConnect = async () => {
		await axios.get("http://localhost:3333/games/connect", {withCredentials: true})
			.then((res) => {
				if (res.data)					
					navigate("/game", { state: { gameId: res.data.id } } );
			})
			.catch((err) => {
				console.log(err);
			});
	};

	const joinGame = async (gameId: number) => {
		await axios.get("http://localhost:3333/games/" + gameId, {withCredentials: true})
			.then((res) => {
				if (res.data.state !== "ENDED")
					navigate("/game", { state: { gameId: gameId } } );
			})
			.catch((err) => {
				console.log(err);
			});
	}

	return (
		<div>
			<h1>Lobby</h1>
			<h2>User information:</h2>
			<ul>
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
			</ul>
			<div>
				<button onClick={handleLeave}>LeaveLobby</button>
				<button onClick={handleMatch}>Match</button>
				<button onClick={handleConnect}>ConnectToMyGame</button>
			</div>
		</div>
	);
};

export default Lobby;
