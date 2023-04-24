import userReducer from './user';
import socketReducer from './sockets';
import { configureStore } from '@reduxjs/toolkit';

const store = configureStore({
	reducer: {
		user: userReducer,
		sockets: socketReducer,
	},
});

export default store;
