import React from 'react';
import {Routes, Route} from "react-router-dom"
import { LoginStart, Login2fa } from './Login/Login';

function App(this: any) {
	return (
		<Routes>
			<Route path='/' element={<LoginStart/>}/>
			<Route path='/2fa' element={<Login2fa/>}/>
		</Routes>
	);
}

export default App;
