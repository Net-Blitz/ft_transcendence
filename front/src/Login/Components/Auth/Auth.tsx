import React, { useState } from 'react';
import './Auth.css';
/*	COMPONENTS	*/
import Input from './Input/Input';
import Title from './Title/Title';
import Button from './Button/Button';
import Carousel from './Carousel/Carousel';
import Toggle from './Toggle/Toggle';
import QRCode from './QRCode/QRCode';

export const AuthStart = () => {
	return (
		<div className='authstart-wrapper'>
			<Title
				title='Welcome'
				subtitle=''
			/>
			<Button
				content='Login with 42'
				bottom='false'
			/>
		</div>
	);
}

export const Auth2fa = () => {
	return (
		<div className='auth2fa-wrapper'>
			<Title
				title='Welcome'
				subtitle=''
			/>
			<Input 
				input_title='Generated code' 
				placeholder='enter the generated code'
				icon= 'padlock'
			/>
			<Button
				content='Login with 42'
				bottom='false'
			/>
		</div>
	);
}

export const AuthNameAvatar = () => {
	return (
		<div className='authnameavatar-wrapper'>
			<Title
				title='Welcome'
				subtitle='please enter your pseudo and choose your avatar'
			/>
			<Input 
				input_title='Pseudo' 
				placeholder='enter your pseudo'
				icon= 'id_card'
			/>
			<Carousel/>
			<Button
				content='Continue'
				bottom='true'
			/>
		</div>
	);
}

export const Auth2faConfig = () => {
	const [statusState, setStatusState] = useState(false);

	return (
		<div className={statusState === false ? 'auth2faconfig-no-wrapper' : 'auth2faconfig-yes-wrapper'}>
			<Title
				title='Welcome'
				subtitle='Do you want to configure 2FA ?'
			/>
			<Toggle
				statusState = {statusState}
				setStatusState = {setStatusState}
			/>
			{
				statusState && 
				<div 
					style={{
						width: '100%',
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center'
				}}>
				<QRCode/>
				<Input 
					input_title='Generate code' 
					placeholder='enter the generated code'
					icon= 'padlock'
				/>
				</div>
			}
			<Button
				content='Login with 42'
				bottom={statusState === false ? 'true' : 'false'}
			/>
		</div>
	);
}