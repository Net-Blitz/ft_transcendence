import produce from 'immer';
import { selectUser } from '../redux/selectors';
import axios from 'axios';

// First State
const initialState = {
	status: 'void',
	data: null,
	error: null,
};

// Actions Types
const FETCHING = 'user/fetching';
const RESOLVED = 'user/resolved';
const REJECTED = 'user/rejected';

// Actions Creators
const userFetching = () => ({ type: FETCHING });
const userResolved = (data: any) => ({ type: RESOLVED, payload: data });
const userRejected = (error: any) => ({ type: REJECTED, payload: error });

export async function fetchOrUpdateUser(store: any) {
	const status = selectUser(store.getState()).status;
	if (status === 'pending' || status === 'updating') {
		return;
	}
	store.dispatch(userFetching());
	try {
		const response = await axios.get('http://localhost:3333/users/me');
		const data = response.data;
		store.dispatch(userResolved(data));
	} catch (error) {
		store.dispatch(userRejected(error));
	}
}

// Reducer
export default function userReducer(state = initialState, action: any) {
	return produce(state, (draft) => {
		switch (action.type) {
			case FETCHING: {
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
			}
			case RESOLVED: {
				if (draft.status === 'pending' || draft.status === 'updating') {
					draft.data = action.payload;
					draft.status = 'resolved';
					return;
				}
				return;
			}
			case REJECTED: {
				if (draft.status === 'pending' || draft.status === 'updating') {
					draft.error = action.payload;
					draft.data = null;
					draft.status = 'rejected';
					return;
				}
				return;
			}
			default:
				return;
		}
	});
}
