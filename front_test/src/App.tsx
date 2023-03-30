import React, { useEffect, useState } from 'react';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import Hello from './components/Hello';
import PrivateRoute from './components/PrivateRoute';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import SearchUser from './components/SearchUser';
import DoubleAuth from './components/DoubleAuth';
import Login2fa from './components/Login2fa';
import Lobby from './components/Lobby';
import Game from './components/Game';
import GamePopUp from './components/GamePopUp';
import { io, Socket } from 'socket.io-client';

function initOneSocket(path: string, debug: boolean = false, connectFunction?: () => void, disconnectFunction?: () => void) {
	const [socket, setSocket] = useState({} as Socket);
	useEffect(() => {
		const socket: Socket = io("http://localhost:3333/" + path, {transports: ['websocket'], withCredentials: true,})
		socket.on("connect", () => {
			if (debug)
				console.log("Connected to socket.io server " + path);
			if (connectFunction)
				connectFunction();
		});
		socket.on("disconnect", () => {
			if (debug)
				console.log("Disconnected from socket.io server " + path);
			if (disconnectFunction)
				disconnectFunction();
		});
		setSocket(socket);
		
	}, []);
	return (socket);
}

function initSockets() {
	const socketQueue = initOneSocket("queue"); // set dans redux ce qu'il faut pour affiner l'animation ou pour toggle la popUp par exemple
	// const socketGame = initOneSocket("game");
	return ({queue: socketQueue});
}

function App(this: any) {

	const socket = initSockets();

	return (
			<div>
			<GamePopUp socketQueue={socket.queue} />
			<Routes>
				<Route path="/login" element={<Login />} />
				<Route path="/login/2fa" element={<Login2fa />} />
				<Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
				<Route path="/" element={<PrivateRoute><Hello /></PrivateRoute>} />
				<Route path="/search" element={<PrivateRoute><SearchUser /></PrivateRoute>} />
				<Route path="/2fa" element={<PrivateRoute><DoubleAuth /></PrivateRoute>} />
				<Route path="/lobby" element={<PrivateRoute><Lobby /></PrivateRoute>} />
				<Route path="/game" element={<PrivateRoute><Game /></PrivateRoute>} />
				{/* <Route path="/game/:id" exact component={Game} /> */}
			</Routes>
			</div>
	);
}

export default App;
