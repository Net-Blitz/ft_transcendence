import React from 'react';
import {Routes, Route} from "react-router-dom"
import Login from './Login/Login';

function App(this: any) {
	return (
		<Routes>
			{/*	LOGIN	*/}
			<Route path='/start' element={<Login/>} />
			<Route path='/2fa' element={<Login/>} />
		</Routes>
	);
}

export default App;
