import userEvent from "@testing-library/user-event";
import { useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import "./GamePopUp.css";


	
const GamePopUp = ({socketQueue, load, updateLoad}:any) => {
	// socketQueue.on("gameFound", (data: any) => {
	// });
	const [accept, update_accept] = useState(0)
	
	useEffect(() => {
		function handleCheck(data: any) {
			console.log("check: ", data);
		}
		if (socketQueue && socketQueue.connected !== undefined && load == 1) {
			socketQueue.on("check", handleCheck);	
		}
		else if (socketQueue && socketQueue.connected !== undefined && load == 0) {
			console.log("Queue: ");
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

	//socket.on("gameOK", (data: any) => { remove popUp, load game page })
	//socket.on("gameKO", (data: any) => { remove popUp, update game state(maybe can be user state) })

	useEffect(() => {
		if (accept == 0)
			return;
		
		const ball = document.querySelector<HTMLElement>(".game-pop-up-ball");
		const bg = document.querySelector<HTMLElement>(".game-pop-up-background-blue");
		
		ball?.style.setProperty("animation-duration", "0s");
		bg?.style.setProperty("animation-duration", "0s");
		//socket.emit("acceptGame")
	}, [accept]);
		
	const handleAccept = (e:any) => {
		if (accept == 0)
			update_accept(1);
	}
	
	const handleDecline = () => {
		console.log("Decline");
		updateLoad(0);
		//socket.emit("declineGame")
		document.querySelector<HTMLElement>(".game-pop-up-main")!.style.display = "none";
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
