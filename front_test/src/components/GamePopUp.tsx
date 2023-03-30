import { useEffect, useState } from "react";
import "./GamePopUp.css";


	
const GamePopUp = ({socketQueue}:any) => {

	const [accept, update_accept] = useState(0)
	const [load, updateLoad] = useState(0)
	
	/* Socket Manager */
	useEffect(() => {
	//socket.on("gameOK", (data: any) => { remove popUp, load game page })
	//socket.on("gameKO", (data: any) => { remove popUp, update game state(maybe can be user state) })
		/* Function handler */
		function handleCheck(data: any) { 			
			console.log("check: ", data);
		}

		/* Load or unload listener */ 
		if (socketQueue && socketQueue.connected !== undefined && load == 1) {
			socketQueue.on("check", handleCheck);	
		}
		else if (socketQueue && socketQueue.connected !== undefined && load == 0) {
			console.log("uncheck");
			socketQueue.off("check");
		}
	
	}, [socketQueue, load]);
	
	useEffect(() => {
		document.addEventListener('keydown', (event) => {
			if (event.key === 'a')
			{
				updateLoad(1);
				document.querySelector<HTMLElement>(".game-pop-up-main")!.style.display = "block";
			}
			else
			{
				updateLoad(0);
				document.querySelector<HTMLElement>(".game-pop-up-main")!.style.display = "none";
			}
			});
	}, []);

	/* Aniamtion manager */
	useEffect(() => {
		if (accept == 0)
			return;
		
		const ball = document.querySelector<HTMLElement>(".game-pop-up-ball");
		const bg = document.querySelector<HTMLElement>(".game-pop-up-background-blue");
		
		ball?.style.setProperty("animation-duration", "0s");
		bg?.style.setProperty("animation-duration", "0s");
		//socket.emit("acceptGame")
	}, [accept]);
		
	/* Button handler */
	const handleAccept = (e:any) => {
		if (accept == 0)
			update_accept(1);
	}
	
	const handleDecline = () => {
		console.log("Decline");
		updateLoad(0);
		document.querySelector<HTMLElement>(".game-pop-up-main")!.style.display = "none";
		//socket.emit("declineGame")
	}

	return (
	<div className="game-pop-up-main">
		<span className="game-pop-up-background-blue"></span>
		<div className="game-pop-up-board">
			<button className="game-pop-up-button" id="Accept-button" onClick={handleAccept}>Accept</button>
			<button className="game-pop-up-button" id="Decline-button" onClick={handleDecline}>Decline</button>
			<span className="game-pop-up-bar" id="player1-bar-popup"></span>
			<span className="game-pop-up-bar" id="player2-bar-popup"></span>
			<span className="game-pop-up-ball" id="no"></span>
		</div>
	</div>
	)
}

export default GamePopUp;
