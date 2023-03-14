import React from 'react';
import './Auth.css';
import Button from './Button/Button';
/*	COMPONENTS	*/
import Input from './Input/Input';
import Title from './Title/Title';

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