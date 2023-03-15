import React from 'react';
import {Routes, Route} from "react-router-dom"
import { LoginStart, Login2fa } from './Login/Login';
import { AvatarData } from './Login/Components/Background/Background';
import Carousel from './Login/Components/Carousel/Carousel';

function App(this: any) {
	return (
		<Routes>
			<Route path='/' element={<LoginStart/>}/>
			<Route path='/2fa' element={<Login2fa/>}/>


			<Route path='/carousel' element={<Carousel/>}/>
		</Routes>
	);
}

export default App;
