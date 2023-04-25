import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import eyePNG from "./assets/eye.png"
import crown from "./assets/crown.png"
import "./Game.css";

function Podium({color, height, point, avatar, env}:any) {
	return (
		<div className="game-end-podium-div">
			{avatar ? 
			<img src={'http://' + env.host + ':' + env.port + '/' + avatar} alt="a" className="game-end-podium-avatar"/>
			: null}
			<div className="game-end-podium-stone" style={{backgroundColor: color, height: height}}>
				<div className="game-end-podium-point" >{point}</div>
			</div>
		</div>
	)
}


function Game({socketGame, room, login, env}:any) {
	const [here, updateHere] = useState(true);
	const [gameEnd, updateGameEnd] = useState({} as any);
	const navigate = useNavigate();
	// const location = useLocation();
	// const room = location.state.gameId;
	// const login = location.state.login;
	const [spectator, updateSpectator] = useState(0);

	useEffect(() => {
		socketGame.emit("gameConnection", {room: room});
		console.log("gameConection", room);
		localStorage.removeItem("lobby-chat-storage");

		const chatUl = document.querySelector("#game-playing-chat");
		const preMsg = localStorage.getItem("game-chat-storage-room-" + room);
		
		if (chatUl !== null && preMsg !== null) {
			chatUl.innerHTML = preMsg;
		}
		if (chatUl)
			chatUl.scrollTop = chatUl.scrollHeight;

	}, [room, socketGame]);

	useEffect(() => {
		const updateGameState = (gameState: any) => {
			// console.log("gameState", gameState.player1_score, gameState.player2_score)
			let ball = document.querySelector<HTMLElement>(".game-playing-ball");
			let player1 = document.querySelector<HTMLElement>("#game-playing-player1");
			let player2 = document.querySelector<HTMLElement>("#game-playing-player2");
			let gameDiv = document.querySelector<HTMLElement>(".game-playing-board");
			// console.log(ball, gameDiv)
			if (gameDiv) {
				if (ball) {
					ball.style.width = (gameDiv.offsetWidth) * gameState.ball_size + 'px';
					ball.style.height = (gameDiv.offsetWidth) * gameState.ball_size + 'px';
					ball.style.left = (gameDiv.offsetWidth - ball.offsetWidth - 3) * gameState.ball_x + 'px';
					ball.style.top = (gameDiv.offsetHeight - ball.offsetWidth - 3) * gameState.ball_y + 'px';
				}
				if (player1) { 
					player1.style.height = (gameDiv.offsetHeight) * gameState.player1_size + 'px';
					player1.style.width = (gameDiv.offsetWidth) * gameState.player_width + 'px';
					player1.style.top = (gameDiv.offsetHeight - 3 - player1.offsetHeight) * gameState.player1_y + 'px';
					player1.style.left = (gameDiv.offsetWidth - player1.offsetWidth) * gameState.player1_x + 'px';
				}
				if (player2) {
					player2.style.height = (gameDiv.offsetHeight) * gameState.player2_size + 'px';
					player2.style.width = (gameDiv.offsetWidth) * gameState.player_width + 'px';
					player2.style.top = (gameDiv.offsetHeight - 3 - player2.offsetHeight) * gameState.player2_y + 'px';
					player2.style.right = (gameDiv.offsetWidth - player2.offsetWidth) * (1 - gameState.player2_x)  + 'px';
				}
				
				let score1 = document.querySelector<HTMLElement>("#game-playing-score1");
				let score2 = document.querySelector<HTMLElement>("#game-playing-score2"); 
				if (score1)
					score1.innerHTML = gameState.player1_score;
				if (score2)
					score2.innerHTML = gameState.player2_score;
			}
		}

		const endGame = (data: any) => {
			socketGame.emit("endGameStatus", {room: room});
			socketGame.emit("gameDisconnection");
			updateHere(false);
		}

		const errorGame = (data: any) => {
			updateGameEnd(data);
		}

		const quickChatMessageResponse = (data: any) => {
			const tab = ["gg !", "Nice One", "Woohh", "It's my time", "Easy", "Close one!", "Savage", "You are so good", "I'm a wall !!", "OMG"]
		
			const chatUl = document.querySelector<HTMLElement>("#game-playing-chat")
			const li = document.createElement("li");
		
			if (chatUl) {
				li.innerHTML = `<b>${data.login}:</b> ${tab[data.message]}`
				chatUl.appendChild(li);
				localStorage.setItem("game-chat-storage-room-" + room, chatUl.innerHTML);
				chatUl.scrollTop = chatUl.scrollHeight;
			}
		}

		const updateSpectatorFonc = (data: any) => {
			console.log("spectatorJoin", data.spectator)
			updateSpectator(data.spectator);
		}

		const getEndStatus = (data: any) => {
			console.log("getEndStatus", data)
			updateGameEnd(data);
			socketGame.off("getEndStatus")
		}

		if (here === false)
		{
			socketGame.off("gameState");
			socketGame.off("endGame");
			socketGame.off("error");
			socketGame.off("quickChatMessageResponse")
			socketGame.off("updateSpectator")
			localStorage.removeItem("game-chat-storage-room-" + room);
		}
		if (here === true)
		{
			socketGame.off("gameState");
			socketGame.off("endGame");
			socketGame.off("error");
			socketGame.off("quickChatMessageResponse");
			socketGame.off("updateSpectator")
			socketGame.off("getEndStatus")
			socketGame.on("gameState", updateGameState);
			socketGame.on("endGame", endGame);
			socketGame.on("error", errorGame);
			socketGame.on("quickChatMessageResponse", quickChatMessageResponse);
			socketGame.on("updateSpectator", updateSpectatorFonc)
			socketGame.on("getEndStatus", getEndStatus)
			socketGame.emit("getSpectator", {room: room});
		}
	}, [here]);
	
	document.addEventListener('keydown', (event) => {
		if (event.key === 'ArrowUp')
			socketGame.emit('keyPress', 'UP');
		else if (event.key === 'ArrowDown')
			socketGame.emit('keyPress', 'DOWN');
		else if (event.key >= '0' && event.key <= '9')
		{
			socketGame.emit('quickChatMessage', {key: event.key, room: room});
		}
	});
	
	document.addEventListener('keyup', (event) => {
		if (event.key === 'ArrowUp')
			socketGame.emit('keyRelease', 'UP');
		else if (event.key === 'ArrowDown')
			socketGame.emit('keyRelease', 'DOWN');
	});

	const surrend = () => {
		socketGame.emit('surrender', {login: login, room: room});
	}

	const returnToHome = () => {
		navigate("/");
	}

	 
	return (
		<div className="game-playing-parent">
			<div className="game-playing-top">
				<div className="game-playing-quick-chat">
					<ul id="game-playing-chat">
					</ul>
				</div>
				<div className="game-playing-viewer">
					<img src={eyePNG} alt="Spec" className="game-playing-eye" />
					  : {spectator}
				</div>
			</div>
			{ here ?
			<div className="game-playing-board">
				<span className="game-playing-ball"></span>
				<span className="game-playing-player" id="game-playing-player1"></span>
				<span className="game-playing-player" id="game-playing-player2"></span>
				<div className="game-playing-score-div">
					<span className="game-playing-score" id="game-playing-score1">0</span>
					<span className="game-playing-score" id="game-playing-score2">0</span>
				</div>
			</div>
	 		: 
			 <div className="game-end">
				<div className="game-end-podium">
					<Podium color="#C0C0C0" height="45%"  point={gameEnd.score2} avatar={gameEnd.avatar2} env={env}/>
					<Podium color="#FFD700" height="60%" point={gameEnd.score1} avatar={gameEnd.avatar1} env={env}/>
					<Podium color="#CD7F32" height= "30%" point={gameEnd.score3} avatar={gameEnd.avatar3} env={env}/>
					<img src={crown} className="game-end-crown" />
				</div>
				<div className="game-end-elo"></div>
				<div className="game-end-recap"></div>
			</div>
			}
			{ here ?
			<button className="game-playing-button-surrend" onClick={surrend}> Surrend </button> 
			: 
			<button className="game-playing-button-surrend" onClick={returnToHome}> Return to Home </button> 
			} 
		</div>
	);
};

export default Game;
