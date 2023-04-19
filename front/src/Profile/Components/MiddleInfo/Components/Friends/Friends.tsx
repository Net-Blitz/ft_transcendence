import React from 'react';
import './Friends.css';
import { BasicFrame } from '../../MiddleInfo';
/*	TMP RESSOURCES	*/
import friend1 from './Tmp/friend1.png';

interface FriendProps {
	avatar: string;
	username: string;
	level: number;
}

const Friend = ({ avatar, username, level }: FriendProps) => {
	return (
		<div className="friend">
			<div className="avatar-wrapper">
				<div className="level-wrapper">{level.toString()}</div>
				<img src={avatar} alt="friend-avatar" />
			</div>
			<div className="friend-username">{username}</div>
		</div>
	);
};

export const Friends = () => {
	return (
		<div className="friends">
			<BasicFrame title="Friends">
				<div className="friends-in-wrapper">
					<Friend avatar={friend1} username="name" level={2} />
					<Friend avatar={friend1} username="name" level={2} />
					<Friend avatar={friend1} username="name" level={2} />
					<Friend avatar={friend1} username="name" level={2} />
					<Friend avatar={friend1} username="name" level={2} />
					<Friend avatar={friend1} username="name" level={2} />
					<Friend avatar={friend1} username="name" level={2} />
					<Friend avatar={friend1} username="name" level={2} />
					<Friend avatar={friend1} username="name" level={2} />
					<Friend avatar={friend1} username="name" level={2} />
					<Friend avatar={friend1} username="name" level={2} />
					<Friend avatar={friend1} username="name" level={2} />
					<Friend avatar={friend1} username="name" level={2} />
					<Friend avatar={friend1} username="name" level={2} />
				</div>
			</BasicFrame>
		</div>
	);
};
