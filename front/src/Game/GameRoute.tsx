import AppLayout from "../AppLayout";
import Game from "./Game";
import Lobby from "./Lobby";
import LobbyCreation from "./LobbyCreation";
import { Navigate, Outlet } from 'react-router-dom';


const GameRoute = ({socketQueue, socketGame}:any) => {
	const state = {code: 2, room: 1, login: "lgiband"}; //call back

	if (state.code === 0)
	{
		return (
			<AppLayout>
			{' '}
			<LobbyCreation />
		</AppLayout>
		)
	}
	if (state.code === 1)
	{
		return (
			<AppLayout>
			{' '}
			<Lobby socketQueue={socketQueue}/>
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