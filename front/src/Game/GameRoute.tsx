import { useEffect, useState } from "react";
import AppLayout from "../AppLayout";
import Game from "./Game";
import Lobby from "./Lobby";
import LobbyCreation from "./LobbyCreation";
import { Navigate, useLocation } from 'react-router-dom';
import axios from "axios";


const GameRoute = ({socketQueue, socketGame, reload, setReload}:any) => {
	const [state, updateState] = useState({} as {code: number, login: string, mode: string, room: number});
	const location = useLocation();
	const update = location.state;
	useEffect (() =>{
		axios.get("http://localhost:3333/queues/joinable", { withCredentials: true })
		.then((res) => {
			if (res.data.canJoin)
				updateState({code: 0, login: res.data.login, mode: "1v1", room: 0});
			if (res.data.reason === "searching")
				updateState({code: 1, login: res.data.login, mode: "", room: 0});
			if (res.data.reason === "playing")
				updateState({code: 2, login: res.data.login, mode: "", room: res.data.gameId});
		})
		.catch((err) => {
			console.log(err);
		});

	}, [reload, update]);

	if (state.code === undefined)
		return <div></div>
	if (state.code === 0)
	{
		return (
			<AppLayout>
			{' '}
			<LobbyCreation socketQueue={socketQueue} login={state.login} mode={state.mode} reload={reload} setReload={setReload}/>
		</AppLayout>
		)
	}
	if (state.code === 1)
	{
		return (
			<AppLayout>
			{' '}
			<Lobby socketQueue={socketQueue} login={state.login} reload={reload} setReload={setReload}/>
		</AppLayout>
		)
	}
	if (state.code === 2)
	{
		return (
			<Game socketGame={socketGame} room={state.room} login={state.login}/>
		)
	}
	return <Navigate to="/" replace />;
}

export default GameRoute;
