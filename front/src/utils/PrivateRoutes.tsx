import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
/*	SELECTORS	*/
import { useSelector } from 'react-redux';
import { selectUser, selectUserAuth, selectUserData } from './redux/selectors';

export function AuthRoutes() {
	const isAuth = useSelector(selectUserAuth);
	const status = useSelector(selectUser).status;
	
	if (status !== 'resolved' && status !== 'notAuth')
		return (<div>isLoading</div>);
	return isAuth ? <Outlet /> : <Navigate to="/login" replace />;
}

export function ConfigRoutes() {
	const avatar_url = useSelector(selectUserData).avatar;
	let ok: boolean = false;

	if (avatar_url === null)
		ok = true;
	return ok ? <Outlet /> : <Navigate to="/" replace />;
}