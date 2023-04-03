import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function Lobby({socketQueue}:any) {
	const navigate = useNavigate();
	const location = useLocation();
	const queueParam = location.state;
	
	useEffect(() => {
		socketQueue.emit("ConnectToQueue", {login: queueParam.login, mode: queueParam.mode}); // -> appuie sur le bouton plutot
	}, [queueParam, socketQueue]);


	const handleLeave = () => {
		//socket.emit("leaveQueue");
		//socket.close();
		console.log("socketQueue: ", socketQueue); 
		socketQueue.emit("DisconnectFromQueue") 
		navigate("/");
	};


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
