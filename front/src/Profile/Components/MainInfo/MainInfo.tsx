import React, { useCallback, useState } from 'react';
import './MainInfo.css';
/*	Components	*/
import { ProfileConfig } from './ProfileConfig';
import { ProfileQR } from './ProfileQR';
/*	Redux	*/
import { useSelector } from 'react-redux';
import { selectUserData } from '../../../utils/redux/selectors';
import { SimpleToggle } from '../../SimpleToggle/SimpleToggle';
/*	Ressources	*/
import paint_brush from './Ressources/paint-brush.svg';

interface MainInfoProps {
	avatar: string;
	username: string;
	handleTrigger: () => void;
}

interface InfoElementProps {
	title: string;
	content: string;
	isToggle?: boolean;
	border?: boolean;
	toggle?: boolean;
	handleToggle?: () => void;
}

interface PopUpProps {
	trigger: boolean;
	children: any;
}

export const PopUp = ({ trigger, children }: PopUpProps) => {
	return trigger ? <div className="popup">{children}</div> : <div></div>;
};

const MainElement = ({ avatar, username, handleTrigger }: MainInfoProps) => {
	return (
		<div className="main-element">
			<div className="banner">
				<div className="edit" onClick={handleTrigger}>
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
	toggle,
	handleToggle,
}: InfoElementProps) => {
	return (
		<div className={border ? 'info-element border' : 'info-element'}>
			<h3>{title}</h3>
			{isToggle && toggle !== undefined && handleToggle != undefined ? (
				<SimpleToggle toggled={toggle} handleToggle={handleToggle} />
			) : (
				<p>{content}</p>
			)}
		</div>
	);
};

export const MainInfo = () => {
	const userData = useSelector(selectUserData);
	const [trigger, setTrigger] = useState(false);
	const [triggerQR, setTriggerQR] = useState(false);
	const defaultToggle: boolean = userData.twoFactor;

	const handleTrigger = useCallback(() => {
		setTrigger(!trigger);
	}, [trigger, setTrigger]);

	const handleTriggerQR = useCallback(() => {
		setTriggerQR(!triggerQR);
	}, [triggerQR, setTriggerQR]);

	const handleToggle = useCallback(() => {
		if (defaultToggle === false) {
			setTriggerQR(true);
		} else {
			console.log('toggle off');
		}
	}, []);

	return (
		<div className="maininfo-wrapper">
			<InfoElement title="Status" content="Online" border={true} />
			<InfoElement title="Total game" content="1976" border={true} />
			<InfoElement title="Win" content="68%" />
			<MainElement
				avatar={userData.avatar}
				username={userData.username}
				handleTrigger={handleTrigger}
			/>
			<PopUp trigger={trigger}>
				<ProfileConfig handleTrigger={handleTrigger} />
			</PopUp>
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
			<InfoElement
				title="2FA Status"
				content="22/02"
				isToggle={true}
				toggle={defaultToggle}
				handleToggle={handleToggle}
			/>
			{/* <PopUp trigger={triggerQR}> */}
			<PopUp trigger={true}>
				<ProfileQR handleTrigger={handleTriggerQR} />
			</PopUp>
		</div>
	);
};
