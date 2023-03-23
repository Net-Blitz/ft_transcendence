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
		<div className="authstart-wrapper">
			<Title title="Welcome" subtitle="" />
			<Button
				content="Login with 42"
				bottom="false"
				href="https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-f157f9462f604eede6bbea3f75533e279c51636777b283bfe57dfcb391784532&redirect_uri=http%3A%2F%2Flocalhost%3A3333%2Fauth%2Fcallback&response_type=code"
			/>
		</div>
	);
};

export const Auth2fa = () => {
	return (
		<div className="auth2fa-wrapper">
			<Title title="Welcome" subtitle="" />
			<Input
				input_title="Generated code"
				placeholder="enter the generated code"
				icon="padlock"
			/>
			<Button content="Login with 42" bottom="false" href="" />
		</div>
	);
};

export const AuthNameAvatar = () => {
	return (
		<div className="authnameavatar-wrapper">
			<Title
				title="Welcome"
				subtitle="please enter your pseudo and choose your avatar"
			/>
			<Input
				input_title="Pseudo"
				placeholder="enter your pseudo"
				icon="id_card"
			/>
			<Carousel />
			<Button content="Continue" bottom="true" href="" />
		</div>
	);
};

export const Auth2faConfig = () => {
	const [statusState, setStatusState] = useState(false);

	return (
		<div
			className={
				statusState === false
					? 'auth2faconfig-no-wrapper'
					: 'auth2faconfig-yes-wrapper'
			}
		>
			<Title title="Welcome" subtitle="Do you want to configure 2FA ?" />
			<Toggle statusState={statusState} setStatusState={setStatusState} />
			{statusState && (
				<div
					style={{
						width: '100%',
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
					}}
				>
					<QRCode />
					<Input
						input_title="Generate code"
						placeholder="enter the generated code"
						icon="padlock"
					/>
				</div>
			)}
			<Button
				content="Login with 42"
				bottom={statusState === false ? 'true' : 'false'}
				href=""
			/>
		</div>
	);
};
