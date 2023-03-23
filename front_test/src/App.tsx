import React from "react";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import Hello from "./components/Hello";
import PrivateRoute from "./components/PrivateRoute";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import SearchUser from "./components/SearchUser";
import DoubleAuth from "./components/DoubleAuth";
import Login2fa from "./components/Login2fa";
import Lobby from "./components/Lobby";
import Game from "./components/Game";
import Friend from "./components/Friend";
import Profile from "./components/Profile";
import Chat from "./components/Chat/Chat";

function App(this: any) {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/login" element={<Login />} />
				<Route path="/login/2fa" element={<Login2fa />} />
				<Route
					path="/dashboard"
					element={
						<PrivateRoute>
							<Dashboard />
						</PrivateRoute>
					}
				/>
				<Route
					path="/profile/:username"
					element={
						<PrivateRoute>
							<Profile />
						</PrivateRoute>
					}
				/>
				<Route
					path="/"
					element={
						<PrivateRoute>
							<Hello />
						</PrivateRoute>
					}
				/>
				<Route
					path="/search"
					element={
						<PrivateRoute>
							<SearchUser />
						</PrivateRoute>
					}
				/>
				<Route
					path="/2fa"
					element={
						<PrivateRoute>
							<DoubleAuth />
						</PrivateRoute>
					}
				/>
				<Route
					path="/lobby"
					element={
						<PrivateRoute>
							<Lobby />
						</PrivateRoute>
					}
				/>
				<Route
					path="/game"
					element={
						<PrivateRoute>
							<Game />
						</PrivateRoute>
					}
				/>
				<Route
					path="/friend"
					element={
						<PrivateRoute>
							<Friend />
						</PrivateRoute>
					}
				/>
				<Route
					path="/chat"
					element={
						<PrivateRoute>
							<Chat />
						</PrivateRoute>
					}
				/>
			</Routes>
		</BrowserRouter>
	);
}

export default App;
