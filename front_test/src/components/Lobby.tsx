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
			<div className="game-waiting-player-name">{player.login}</div>
			<div className="game-waiting-player-rank">{player.elo} LP</div>
		</div>
		:
		<div className="game-waiting-player-absent">
			<div className="game-waiting-no-player"></div>
		</div>
	)
}

const LobbyTimer = ({socketQueue}:any) => {
	const [timer, updateTimer] = useState(0);
	const [count, updateCount] = useState(0);

	const setTimer = (timer:number) => {
		if (timer === 0) {
			return "00:00";
		}
		const minutes = Math.floor(timer / 60);
		const seconds = timer - minutes * 60;
		return `${minutes < 10 ? "0" + minutes : minutes}:${seconds < 10 ? "0" + seconds : seconds}`;
	}

	const getTimer = (data:any) => {
		updateTimer(parseInt(data.message));
	}

	useEffect(() => {
		socketQueue.on("TimerResponse", getTimer);
		socketQueue.emit("Timer");
	}, [socketQueue]);

	useEffect(() => {
		const interval = setInterval(() => updateTimer(current => (current + 1)), 1000);
		return () => {
			clearInterval(interval);
		};
	}, [timer]);


	return (<div className="game-waiting-timer">{setTimer(timer)}</div>)

}

const LobbyChat = ({socketQueue}:any) => {
	const [input, setInput] = useState("");

	
	const sendFunction = (message:string) => {
		if (message === "")
			return;
		socketQueue.emit("ChatWithGroup", {message: message});

		
		
		setInput("");
		const inputDiv = document.querySelector("input");
		if  (inputDiv !== null) {
			inputDiv.value = "";
		}
	}
	
	const handleChange = (e:any) => {
		setInput(e.target.value);
	}

	const handleEnter = (e:any) => {
		if (e.key === "Enter") {
			sendFunction(input);
		}
	}

	const handleMessage = (data:any) => {
		const chatUl = document.getElementById("lobby-chat");
		const li = document.createElement("li");
		console.log("data: ", data);
		if (chatUl) {
			li.innerHTML = `<b>${data.login}:</b> ${data.message}`
			chatUl.appendChild(li);
			localStorage.setItem("lobby-chat-storage", chatUl.innerHTML);
			chatUl.scrollTop = chatUl.scrollHeight;
		}
	};

	useEffect(() => {
		socketQueue.off("GetNewMessage")
		socketQueue.on("GetNewMessage", handleMessage);
		
	}, [socketQueue]);

	useEffect(() => {
		const chatUl = document.querySelector("#lobby-chat");
		const preMsg = localStorage.getItem("lobby-chat-storage");
		
		console.log("ChatUl: ", chatUl);
		if (chatUl !== null && preMsg !== null) {
			chatUl.innerHTML = preMsg;
		}
		if (chatUl)
			chatUl.scrollTop = chatUl.scrollHeight;

	}, [])

	return (
		<div className="game-waiting-chat">
			<input id="lobby-input" type="text" onKeyDown={handleEnter} onChange={handleChange} placeholder="Type a message..."/>
			<button onClick={() => sendFunction(input)}>Send</button>
			<ul id="lobby-chat">
				
			</ul>
		</div>
	)
}

function Lobby({socketQueue}:any) {
	const navigate = useNavigate();
	const location = useLocation();
	const queueParam = location.state;
	const [player1, setPlayer1] = useState(undefined);
	const [player2, setPlayer2] = useState(undefined);
	const [player3, setPlayer3] = useState(undefined);

	const setPlayer = (data:any) => {
		console.log("data: ", data);
		if (data && data.player1)
			setPlayer1(data.player1);
	}

	useEffect(() => {
		
		socketQueue.emit("ConnectToQueue", {login: queueParam.login, mode: queueParam.mode}); // -> appuie sur le bouton plutot

		socketQueue.on("ConnectToQueueResponse", setPlayer);
	}, [queueParam, socketQueue]);


	const handleLeave = () => {
		console.log("socketQueue: ", socketQueue); 
		localStorage.removeItem("lobby-chat-storage");
		socketQueue.emit("DisconnectFromQueue");
		socketQueue.off("ConnectToQueueResponse", setPlayer);
		socketQueue.off("GetNewMessage");
		navigate("/");
	};

	return (
		<div className="game-waiting-parent-div">
			<div className="game-waiting-nav-bar">
			</div>
			<LobbyBox>
				<LobbyTimer socketQueue={socketQueue} />

				<div className="game-waiting-players">
					<PlayerInLobby player={player1}/>
					<PlayerInLobby player={player2}/>
					<PlayerInLobby player={player3}/>
				</div>

				<LobbyChat socketQueue={socketQueue} />
				
				<button className="game-waiting-button-cancel" onClick={handleLeave} >Cancel Queue</button>


			</LobbyBox>


		</div>
	);
};

export default Lobby;
