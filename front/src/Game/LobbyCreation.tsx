import { useEffect } from "react";
import "./LobbyCreation.css"


const LobbyCreation = ({socketQueue, reload, setReload, login}:any) => {
	let mode : string = "ONEVONE";
	useEffect (() =>{
		socketQueue.on("ConnectToQueueResponse", (data:any) => {
			setReload(!reload)
			console.log("ConnectToQueueResponse", data)
		})
	}, [reload]);

	const joinQueue = () => {
		
		socketQueue.emit("ConnectToQueue", {login: login, mode: mode}); // -> appuie sur le bouton plutot
		console.log("join queue")
	}

	const joinGroup = () => {
		socketQueue.emit("JoinGroup", {groupLogin: "lgiband"}); // -> appuie sur le bouton plutot
	}


	const leaveGroup = () => {
		socketQueue.emit("LeaveGroup"); // -> appuie sur le bouton plutot
	}

	const updateMode = (e:any) => {
		mode = e.target.value;
	}


	return (
		<div className="game-creation-background">
			<div className="game-creation-group"></div>
			<div className="game-creation-settings">
				<div className="game-creation-gameMode"></div>
				<div className="game-creation-config">
					<div className="game-creation-difficulty"></div>
					<div className="game-creation-map"></div>
				</div>
			</div>
			<button className="game-creation-leave-lobby-button">Leave Lobby</button>
			<button className="game-creation-start-game-button"></button>
			{/*<button onClick={joinQueue}>joinQueue</button>
			<button onClick={joinGroup}>joinGroup</button>
			<button onClick={leaveGroup}>leaveGroup</button>
			<select name="oui" id="oui" onChange={updateMode}>
				<option value="ONEVONE">1v1</option>
				<option value="TWOVTWO">2v2</option>
				<option value="FREEFORALL">FFA</option>
			</select>*/}
		</div>
	)
}

export default LobbyCreation;