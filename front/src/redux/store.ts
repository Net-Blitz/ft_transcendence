import { combineReducers, legacy_createStore as createStore } from 'redux';
import userReducer from './user';

const reduxDevtools =
	window.__REDUX_DEVTOOLS_EXTENSION__ &&
	window.__REDUX_DEVTOOLS_EXTENSION__();

const reducer = combineReducers({
	user: userReducer,
});

const store = createStore(reducer, reduxDevtools);

export default store;
