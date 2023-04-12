import React, { useCallback } from 'react';
import './MiddleInfo.css';
import { AchivementProps, BasicFrameProps } from '../../types';
/*	TMP RESSOURCES	*/
import achievement1 from './Tmp/achievement1.png';
import achievement2 from './Tmp/achievement2.png';
import achievement3 from './Tmp/achievement3.png';
import achievement4 from './Tmp/achievement4.png';

const BasicFrame = ({ height, width, title, children }: BasicFrameProps) => {
	return (
		<div className="basic-frame" style={{ height: height, width: width }}>
			<div className="title-wrapper">
				<h3>{title}</h3>
			</div>
			<div className="content-wrapper">{children}</div>
		</div>
	);
};

const Achievement = ({ img, title, description, lock }: AchivementProps) => {
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

const Achievements = () => {
	return (
		<div className="achievements">
			<BasicFrame height="254px" width="39%" title="Achievements">
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
					description="Score a point within the first few seconds of the game"
					lock={true}
				/>
				<Achievement
					img={achievement4}
					title="Friendly Power"
					description="Win a game with a friend"
					lock={true}
				/>
			</BasicFrame>
		</div>
	);
};

export const MiddleInfo = () => {
	return (
		<div className="middleinfo-wrapper">
			<Achievements />
		</div>
	);
};
