import { selectUser } from './selectors';
import axios from 'axios';
import { createAction, createReducer } from '@reduxjs/toolkit';

// First State
const initialState = {
	auth: false,
	status: 'void',
	data: null,
	error: null,
};

// Actions Creators
const userAuth = createAction<any>('user/auth');
const userFetching = createAction('user/fetching');
const userResolved = createAction<any>('user/resolved');
const userRejected = createAction<any>('user/rejected');

export async function fetchOrUpdateUser(store: any) {
	try {
		const response = await axios.get('http://localhost:3333/auth/verify', {
			withCredentials: true,
		});
		const data = response.data;
		if (data === 'OK')
			store.dispatch(userAuth(true));
	} catch (error) {
		store.dispatch(userAuth(false));
		return ;
	}
	const status = selectUser(store.getState()).status;
	if (status === 'pending' || status === 'updating') {
		return;
	}
	store.dispatch(userFetching());
	try {
		const response = await axios.get('http://localhost:3333/users/me', {
			withCredentials: true,
		});
		const data = response.data;
		store.dispatch(userResolved(data));
	} catch (error) {
		store.dispatch(userRejected(error));
	}
}

export default createReducer(initialState, (builder) =>
	builder
		.addCase(userAuth, (draft, action) => {
			draft.auth = action.payload;
			return ;
		})
		.addCase(userFetching, (draft, action) => {
			if (draft.status === 'void') {
				draft.status = 'pending';
				return;
			}
			if (draft.status === 'rejected') {
				draft.error = null;
				draft.status = 'pending';
				return;
			}
			if (draft.status === 'resolved') {
				draft.status = 'updating';
				return;
			}
			return;
		})
		.addCase(userResolved, (draft, action) => {
			if (draft.status === 'pending' || draft.status === 'updating') {
				draft.data = action.payload;
				draft.status = 'resolved';
				return;
			}
			return;
		})
		.addCase(userRejected, (draft, action) => {
			if (draft.status === 'pending' || draft.status === 'updating') {
				draft.error = action.payload;
				draft.data = null;
				draft.status = 'rejected';
				return;
			}
			return;
		})
);
