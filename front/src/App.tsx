import React from 'react';
import {Routes, Route} from "react-router-dom"
import { LoginStart, Login2fa } from './Login/Login';
import Carousel from './Login/Components/Carousel/Carousel';
import Carousel2 from './Login/Components/Carousel/Carousel2';
import { AvatarData } from './Login/Components/Background/Background';

function App(this: any) {
	return (
		<Routes>
			<Route path='/' element={<LoginStart/>}/>
			<Route path='/2fa' element={<Login2fa/>}/>

			<Route path='/carousel' element={<Carousel/>}/>
			<Route path='/carousel2' element={
			<div style={{ maxWidth: 600, marginLeft: 'auto', marginRight: 'auto', marginTop: 64}}>
				<Carousel2> 
					<img src={AvatarData[0].avatar}/>
					<img src={AvatarData[1].avatar}/>
					<img src={AvatarData[2].avatar}/>
					<img src={AvatarData[3].avatar}/>
				</Carousel2>
			</div>
			}/>

		</Routes>
	);
}

export default App;
