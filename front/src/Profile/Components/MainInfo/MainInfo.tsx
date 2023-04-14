import React, { useCallback } from 'react';
import './MainInfo.css';
import { PopUp, ProfileConfig } from './ProfileConfig';
import { AuthConfig } from '../../../Login/Components/Auth/Auth';
import { InfoElementProps, MainInfoProps } from '../../types';
/*	REDUX	*/
import { useSelector } from 'react-redux';
import { selectUserData } from '../../../utils/redux/selectors';
import { SimpleToggle } from '../../SimpleToggle/SimpleToggle';
/*	RESSOURCES	*/
import paint_brush from './Ressources/paint-brush.svg';

const MainElement = ({ avatar, username }: MainInfoProps) => {
	return (
		<div className="main-element">
			<div className="banner">
				<div className="edit">
					<img src={paint_brush} alt="button-edit" />
				</div>
				<img src={avatar} alt="avatar" />
			</div>
			<h2>{username}</h2>
		</div>
	);
};

const InfoElement = ({
	title,
	content,
	isToggle,
	border,
}: InfoElementProps) => {
	const logToggle = useCallback((state: any) => {
		console.log(state);
	}, []);

	return (
		<div className={border ? 'info-element border' : 'info-element'}>
			<h3>{title}</h3>
			{isToggle ? (
				<SimpleToggle toggled={false} onClick={logToggle} />
			) : (
				<p>{content}</p>
			)}
		</div>
	);
};

export const MainInfo = () => {
	const userData = useSelector(selectUserData);

	return (
		<div className="maininfo-wrapper">
			<InfoElement title="Status" content="Online" border={true} />
			<InfoElement title="Total game" content="1976" border={true} />
			<InfoElement title="Win" content="68%" />
			<MainElement
				avatar={userData.avatar}
				username={userData.username}
			/>
			<InfoElement
				title="42login"
				content={userData.login}
				border={true}
			/>
			<InfoElement
				title="Registration date"
				content="22/02"
				border={true}
			/>
			<InfoElement title="2FA Status" content="22/02" isToggle={true} />
			<PopUp trigger={true}>
				<ProfileConfig />
			</PopUp>
		</div>
	);
};
