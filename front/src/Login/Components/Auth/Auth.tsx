import React from 'react';
import './Auth.css';
/*	COMPONENTS	*/
import Input from './Input/Input';
import Title from './Title/Title';
import Button from './Button/Button';
import Carousel from './Carousel/Carousel';
import Toggle from './Toggle/Toggle';

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

export const AuthNo2fa = () => {
	return (
		<div className='authnameno2fa-wrapper'>
			<Title
				title='Welcome'
				subtitle='please enter your pseudo and choose your avatar'
			/>
			<Toggle/>
			<Button
				content='Continue'
				bottom='true'
			/>
		</div>
	);
}