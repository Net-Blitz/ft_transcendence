import React from 'react';
import './Achievements.css';
import { BasicFrame } from '../../MiddleInfo';
/*	TMP RESSOURCES	*/
import achievement1 from './Tmp/achievement1.png';
import achievement2 from './Tmp/achievement2.png';
import achievement3 from './Tmp/achievement3.png';
import achievement4 from './Tmp/achievement4.png';

interface AchievementProps {
	img: string;
	title: string;
	description: string;
	lock?: boolean;
}

const Achievement = ({ img, title, description, lock }: AchievementProps) => {
	return (
		<div className={lock ? 'achievement lock' : 'achievement'}>
			<div className="img-wrapper">
				<img src={img} alt="achievement-img" />
			</div>
			<div className="content-wrapper">
				<h4>{title}</h4>
				<p>{description}</p>
			</div>
		</div>
	);
};

export const Achievements = () => {
	return (
		<div className="achievements">
			<BasicFrame title="Achievements">
				<Achievement
					img={achievement1}
					title="Ace"
					description="Win a game without letting the opponent score a single point."
				/>
				<Achievement
					img={achievement2}
					title="Paddle Master"
					description="Score 10 points using only your paddle (no power-ups)."
				/>
				<Achievement
					img={achievement3}
					title="Quick Reflexes"
					description="Score a point within the first few seconds of the game."
					lock={true}
				/>
				<Achievement
					img={achievement4}
					title="Friendly Power"
					description="Win a game with a friend."
					lock={true}
				/>
			</BasicFrame>
		</div>
	);
};
