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

function App(this: any) {

	const [socketQueue, setSocketQueue] = useState({} as Socket);
	const [load, updateLoad] = useState(0);

	useEffect(() => {
		const socket: Socket = io("http://localhost:3333/queue", {transports: ['websocket'], withCredentials: true,})
		socket.on("connect", () => {
			console.log("Connected to socket.io server");
		});
		socket.on("disconnect", () => {
			console.log("Disconnected from socket.io server");
		});
		socket.on("close", () => {
			console.log("Closed socket.io server");
			socket.close();
		});
		setSocketQueue(socket);
		
	}, []);

	return (
			<div>
			<GamePopUp socketQueue={socketQueue} load={load} updateLoad={updateLoad} />
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
