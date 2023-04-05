import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Lobby.css"
import axios from "axios";
import { setMaxIdleHTTPParsers } from "http";

const LobbyBox = ({children}:any) => {
	return (
		<div className="game-waiting-background">
			{children}
		</div>
)}

const PlayerInLobby = ({player}:any) => {
	return (
		player !== undefined ?
		<div className="game-waiting-player">
			<div className="game-waiting-player-avatar-underdiv">
				<img className="game-waiting-player-avatar" src={player.avatar} alt="Avatar" />
			</div>
			<div className="game-waiting-player-name">{player.name}</div>
			<div className="game-waiting-player-rank">{player.elo} LP</div>
		</div>
		:
		<div className="game-waiting-player-absent">
			<div className="game-waiting-no-player"></div>
		</div>
	)
}

const LobbyChat = ({player, socketQueue}:any) => {
	const [input, setInput] = useState("");

	const handleChange = (e:any) => {
		setInput(e.target.value);
	}

	const sendFunction = (message:string) => {
		
		const chatUl = document.getElementById("lobby-chat");
		const li = document.createElement("li");
		console.log("sendFunction: ", message);
		
		if (chatUl !== null) {
			li.appendChild(document.createTextNode(`${player.name}: ${message}`));
			chatUl.appendChild(li);
			localStorage.setItem("chat", chatUl.innerHTML);
		}
		
		
		setInput("");
		const inputDiv = document.querySelector("input");
		if  (inputDiv !== null) {
			inputDiv.value = "";
		}
	}

	useEffect(() => {
		const chatUl = document.getElementById("lobby-chat");
		const preMsg = localStorage.getItem("lobby-chat-storage");
	
		if (chatUl !== null && preMsg !== null) {
			chatUl.innerHTML = preMsg;
		}
	}, [])

	return (
		<div className="game-waiting-chat">
			<input type="text" onChange={handleChange} placeholder="Type a message..."/>
			<button onClick={() => sendFunction(input)}>Send</button>
			<ul className="game-waiting-chat-messages" id="lobby-chat">
			</ul>
		</div>
	)
}

function Lobby({socketQueue}:any) {
	const navigate = useNavigate();
	const location = useLocation();
	const queueParam = location.state;
	const [time, setTime] = useState(0);
	const [count, updateCount] = useState(0);
	const setTimer = (timer:number) => {
		if (timer === 0) {
			return "00:00";
		}
		const minutes = Math.floor(timer / 60);
		const seconds = timer - minutes * 60;
		return `${minutes < 10 ? "0" + minutes : minutes}:${seconds < 10 ? "0" + seconds : seconds}`;
	}
	
	// function callFrontTimer() {
	// 	updateTimer(timer + 1);
	// 	console.log("here")
	// }

	// const interval = setInterval(callFrontTimer, 1000);

	const getTimer = (data:any) => {
		setTime(parseInt(data.message));
		console.log("call back");
	}

	useEffect(() => {
		
		socketQueue.emit("ConnectToQueue", {login: queueParam.login, mode: queueParam.mode}); // -> appuie sur le bouton plutot
		socketQueue.on("TimerResponse", getTimer);
		socketQueue.emit("Timer"); 
	}, [queueParam, socketQueue]);


	useEffect(() => {
			const interval = setInterval(() => setTime(time + 1), 1000);
			return () => {
				clearInterval(interval);
			};
	}, [time]);

	useEffect(() => {
		const interval = setInterval(() => socketQueue.emit, 5000);
		return () => {
			clearInterval(interval);
		};
	}, [count]);

	const handleLeave = () => {
		//socket.emit("leaveQueue");
		//socket.close();
		console.log("socketQueue: ", socketQueue); 
		localStorage.removeItem("lobby-chat-storage");
		socketQueue.emit("DisconnectFromQueue");
		socketQueue.off("TimerResponse", getTimer);
		navigate("/");
	};

	const player = {
		avatar: "https://pbs.twimg.com/profile_images/1221057614764703744/QljZ27-o_400x400.jpg",
		name: "Lgiband",
		elo: 300
	}


	return (
		<div className="game-waiting-parent-div">
			<div className="game-waiting-nav-bar">
			</div>
			<LobbyBox>
				<div className="game-waiting-timer">{setTimer(time)}</div>

				<div className="game-waiting-players">
					<PlayerInLobby player={player}/>
					<PlayerInLobby player={player}/>
				</div>

				<LobbyChat socketQueue={socketQueue} player={player} />
				
				<button className="game-waiting-button-cancel" onClick={handleLeave} >Cancel Queue</button>


			</LobbyBox>


		</div>
	);
};

export default Lobby;
