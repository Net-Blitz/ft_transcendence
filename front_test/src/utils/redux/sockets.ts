import { createAction, createReducer } from '@reduxjs/toolkit';
import { useStore } from 'react-redux';
import { io, Socket } from 'socket.io-client';


const initialState = {
	game: null,
	queue: null,
};

const socketAdd = createAction<any>('socket/queue');

// Reducer
export default createReducer(initialState, (builder) =>
	builder
		.addCase(socketAdd, (draft, action) => {
			if (action.payload.type === 'queue') {
				draft.queue = action.payload.socket;
			}
			return ;
		})
		
);
