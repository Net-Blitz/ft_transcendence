import { useEffect } from "react";

const LobbyCreation = ({socketQueue, reload, setReload, login, mode}:any) => {
	useEffect (() =>{
		socketQueue.on("ConnectToQueueResponse", (data:any) => {
			setReload(!reload)
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

	return (
		<div>
			<button onClick={joinQueue}>joinQueue</button>
			<button onClick={joinGroup}>joinGroup</button>
			<button onClick={leaveGroup}>leaveGroup</button>
		</div>
	)
}

export default LobbyCreation;