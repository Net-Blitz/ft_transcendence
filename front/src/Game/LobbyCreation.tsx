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

	return (
		<div>
			<button onClick={joinQueue}>click bb</button>
		</div>
	)
}

export default LobbyCreation;