import React from 'react';
import {Routes, Route} from 'react-router-dom'
import './App.css'

/*	COMPONENTS	*/
import Login from './Login/Login';
import PrivateRoute from './PrivateRoute';

function App(this: any) {
	return (
		<Routes>
			{/*	LOGIN	*/}
			<Route path='/' element={<PrivateRoute checkconf={true}><Login/></PrivateRoute>} /> {/*	config */}
			<Route path='/login' element={<Login/>} /> {/*	rien */}
			<Route path='/login/2fa' element={<PrivateRoute check2fa={true} checkconf={true}><Login/></PrivateRoute>} /> {/*	config + 2fa */}
			<Route path='/login/name&avatar' element={<PrivateRoute checkconf={false}><Login/></PrivateRoute>} /> {/*no config*/}
			<Route path='/login/2faconfig' element={<PrivateRoute checkconf={false}><Login/></PrivateRoute>} /> {/*no config*/}
		</Routes>
	);
}

export default App;
