import React from 'react';
import './Auth.css';
/*	COMPONENTS	*/
import Input from './Input/Input';
import Title from './Title/Title';
import Button from './Button/Button';
import Carousel from './Carousel/Carousel';

export function AuthStart() {
	return (
		<div className='authstart_wrapper'>
			<Title
				title='Welcome'
				subtitle=''
			/>
			<Button
				content='Login with 42'
			/>
		</div>
	);
}

export function Auth2fa() {
	return (
		<div className='auth2fa_wrapper'>
			<Title
				title='Welcome'
				subtitle=''
			/>
			<Input 
				input_title='Generated code' 
				placeholder='enter the generated code'
			/>
			<Button
				content='Login with 42'
			/>
		</div>
	);
}

export function AuthNameAvatar() {
	return (
		<div className='authnameavatar_wrapper'>
			<Title
				title='Welcome'
				subtitle='please enter your pseudo and choose your avatar'
			/>
			<Input 
				input_title='Pseudo' 
				placeholder='enter your pseudo'
			/>
			<Carousel/>
			<Button
				content='Continue'
			/>
		</div>
	);
}