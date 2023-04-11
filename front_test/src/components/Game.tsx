import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import eyePNG from "../eye.png"
import "./Game.css";


function Game({socketGame}:any) {
	const [here, updateHere] = useState(true);
	const navigate = useNavigate();
	const location = useLocation();
	const room = location.state.gameId;
	const login = location.state.login;

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
				console.log("gameDiv", gameDiv.offsetWidth, gameDiv.offsetHeight)
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
					console.log("player2 top: ", player2.offsetWidth);
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
			socketGame.emit("gameDisconnection");
			navigate("/");
		}

		const errorGame = (data: any) => {
			console.log("error: ", data);
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

		if (here === false)
		{
			socketGame.off("gameState");
			socketGame.off("endGame");
			socketGame.off("error");
			socketGame.off("quickChatMessageResponse")
			localStorage.removeItem("game-chat-storage-room-" + room);
		}
		if (here === true)
		{
			socketGame.off("gameState");
			socketGame.off("endGame");
			socketGame.off("error");
			socketGame.off("quickChatMessageResponse");
			socketGame.on("gameState", updateGameState);
			socketGame.on("endGame", endGame);
			socketGame.on("error", errorGame);
			socketGame.on("quickChatMessageResponse", quickChatMessageResponse);
		}
	}, [here]);
	
	document.addEventListener('keydown', (event) => {
		console.log(event.key)
		if (event.key === 'ArrowUp')
			socketGame.emit('keyPress', 'UP');
		else if (event.key === 'ArrowDown')
			socketGame.emit('keyPress', 'DOWN');
		else if (event.key >= '0' && event.key <= '9')
		{
			console.log("aled");
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
		updateHere(false);
	}

	 
	return (
		<div className="game-playing-parent">
			<div className="game-playing-top">
				<div className="game-playing-quick-chat">
					<ul id="game-playing-chat">
						<li>Player1 : test</li>
						<li>Player1 : test</li>
						<li>Player1 : test</li>
						<li>Player1 : test</li>
						<li>Player1 : test</li>
						<li>Player1 : test</li>
						<li>Player1 : test</li>
						<li>Player1 : test</li>
					</ul>
				</div>
				<div className="game-playing-viewer">
					<img src={eyePNG} alt="Spec" className="game-playing-eye" />
					  : 5
				</div>
			</div>
			<div className="game-playing-board">
				<span className="game-playing-ball"></span>
				<span className="game-playing-player" id="game-playing-player1"></span>
				<span className="game-playing-player" id="game-playing-player2"></span>
				<div className="game-playing-score-div">
					<span className="game-playing-score" id="game-playing-score1">0</span>
					<span className="game-playing-score" id="game-playing-score2">0</span>
				</div>
			</div>
			<button className="game-playing-button-surrend" onClick={surrend}> Surrend </button> 

		</div>
			

	);
};

export default Game;
