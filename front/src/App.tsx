import React from 'react';
import {Routes, Route} from 'react-router-dom'
import './App.css'
/*	COMPONENTS	*/
import Login from './Login/Login';

function App(this: any) {
	return (
		<Routes>
			{/*	LOGIN	*/}
			<Route path='/start' element={<Login/>} />
			<Route path='/2fa' element={<Login/>} />
			<Route path='/name&avatar' element={<Login/>} />
			<Route path='/2faconfig' element={<Login/>} />
		</Routes>
	);
}

export default App;
