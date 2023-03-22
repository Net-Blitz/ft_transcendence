import { useEffect, useState } from "react";
import { useLocation, useNavigate, useRoutes } from "react-router-dom";
import {io, Socket} from 'socket.io-client';
import "./Game.css";


function Game() {
	const navigate = useNavigate();
	const location = useLocation();
	const room = location.state.gameId;

	const connectionObject = { //-> cause probablement le probleme de double connection
		transports: ['websocket'],
		withCredentials: true,
	  };

	const socket: Socket = io(`http://localhost:3333/game?room=${room}`, connectionObject);

	socket.on('disconnect', () => {
		console.log("disconnected");
	});

	socket.on("close", () => {
		socket.close();
	});

	socket.on("BadConnection", () => {
		socket.close();
		navigate("/");		
	});
	
	socket.on("gameState", (gameState: any) => {
		let ball = document.getElementById("ball");
		let player1 = document.getElementById("player1");
		let player2 = document.getElementById("player2");
		let gameDiv = document.getElementById("Game");
		if (gameDiv) {
			if (ball) {
				ball.style.left = (gameDiv.offsetWidth - ball.offsetWidth) * gameState.ball_x + 'px';
				ball.style.top = (gameDiv.offsetHeight - ball.offsetWidth) * gameState.ball_y + 'px';
				ball.style.width = (gameDiv.offsetWidth) * gameState.ball_size + 'px';
				ball.style.height = (gameDiv.offsetWidth) * gameState.ball_size + 'px';
			}
			if (player1) {
				player1.style.height = (gameDiv.offsetHeight) * gameState.player1_size + 'px';
				player1.style.width = (gameDiv.offsetWidth) * gameState.player_width + 'px';
				player1.style.top = (gameDiv.offsetHeight - player1.offsetHeight) * gameState.player1_y + 'px';
				player1.style.left = (gameDiv.offsetWidth - player1.offsetWidth) * gameState.player1_x + 'px';
			}
			if (player2) {
				player2.style.height = (gameDiv.offsetHeight) * gameState.player2_size + 'px';
				player2.style.width = (gameDiv.offsetWidth) * gameState.player_width + 'px';
				player2.style.top = (gameDiv.offsetHeight - player2.offsetHeight) * gameState.player2_y + 'px';
				player2.style.left = (gameDiv.offsetWidth - player2.offsetWidth) * gameState.player2_x + 'px';
			}
			
			let score1 = document.getElementById("score1");
			let score2 = document.getElementById("score2");
			if (score1)
				score1.innerHTML = gameState.player1_score;
			if (score2)
				score2.innerHTML = gameState.player2_score;
		}
	});
	
	document.addEventListener('keydown', (event) => {
		if (event.key === 'ArrowUp')
		socket.emit('keyPress', 'UP');
		if (event.key === 'ArrowDown')
		socket.emit('keyPress', 'DOWN');
	});
	
	document.addEventListener('keyup', (event) => {
		if (event.key === 'ArrowUp')
		socket.emit('keyRelease', 'UP');
		if (event.key === 'ArrowDown')
			socket.emit('keyRelease', 'DOWN');
	});

	const leaveGame = () => {
		//socket.emit('leaveLobby');
	}

	
	return (
		<div>
			<h1>Gaming</h1>
			<div id="Game">
				<span id="ball"></span>
				<span id="player1"></span>
				<span id="player2"></span>
				<span id="score1">0</span>
				<span id="score2">0</span>
			</div>
			<div>
				<button id="surrend" onClick={leaveGame}> Surrend </button> 
			</div>

		</div>
			

	);
};

export default Game;
