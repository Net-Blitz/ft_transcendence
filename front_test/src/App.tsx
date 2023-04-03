import { Routes, Route } from 'react-router-dom';
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

	const socketQueue: Socket = io("http://localhost:3333/queue", {transports: ['websocket']});
	const socketGame: Socket = io("http://localhost:3333/game", {transports: ['websocket']});
	
	return ( 
			<div>
			<GamePopUp socketQueue={socketQueue} />
			<Routes>
				<Route path="/login" element={<Login />} />
				<Route path="/login/2fa" element={<Login2fa />} /> 
				<Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
				<Route path="/" element={<PrivateRoute><Hello /></PrivateRoute>} />
				<Route path="/search" element={<PrivateRoute><SearchUser /></PrivateRoute>} />
				<Route path="/2fa" element={<PrivateRoute><DoubleAuth /></PrivateRoute>} />
				<Route path="/lobby" element={<PrivateRoute><Lobby socketQueue={socketQueue} /></PrivateRoute>} />
				<Route path="/game" element={<PrivateRoute><Game socketGame={socketGame}/></PrivateRoute>} />
				{/* <Route path="/game/:id" exact component={Game} /> */}
			</Routes>
			</div>
	);
}

export default App;
