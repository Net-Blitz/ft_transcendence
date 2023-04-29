import React from 'react';
import './MatchHistory.css';
import { useEffect, useState } from 'react';

import { BasicFrame } from '../MiddleInfo/MiddleInfo';
import { useAxios } from '../../../utils/hooks';

interface TeamMatchProps {
	img: string;
	level: number;
	index: number;
}

interface dataHistoryProps {
	history: any;
	index: number;
}

const TeamMatch = ({ img, level, index }: TeamMatchProps) => {
	return (
		<div className="teamMatch ">
			<img src={img} alt={`Team member ${index + 1}`} />
			<p>{level}</p>
		</div>
	);
};

const useWindowWidth = () => {
	const [windowWidth, setwindowWidth] = useState(window.innerWidth);
	useEffect(() => {
		const handleResize = () => {
			setwindowWidth(window.innerWidth);
		};
		window.addEventListener('resize', handleResize);
		handleResize();
		return () => {
			window.removeEventListener('resize', handleResize);
		};
	}, []);
	console.log('windowWidth', windowWidth);
	return windowWidth;
};

export const MatchHistory = ({ userData }: { userData: any }) => {
	const headerMobile = ['Game mode', 'Team', 'Score', 'XP Gained'];
	const isMobileView = useWindowWidth() < 767;
	const {
		isLoading,
		data,
		error,
	}: { isLoading: boolean; data: any; error: boolean } = useAxios(
		'http://localhost:3333/users/matchs/' + userData.username
	);

	if (isLoading && !error) return <></>;

	// console.log(data.GamePlayer1);
	// console.log(data.GamePlayer2);
	// console.log(data.GamePlayer3);
	// console.log(data.GamePlayer4);

	const header: string[] = [
		'Game mode',
		'Team',
		'Date',
		'Hour',
		'Score',
		'Duration',
		'Difficulty',
		'Map',
		'XP Gained',
	];

	//let data = [
	//	{
	//		gameMode: '1v1',
	//		team: [
	//			{ img: avatar1, level: 1 },
	//			{ img: avatar2, level: 2 },
	//			{ img: avatar3, level: 10 },
	//			{ img: avatar4, level: 9 },
	//		],
	//		date: '02/04/2023',
	//		hour: '3h38',
	//		score: [3, 10],
	//		duration: '30 min',
	//		difficulty: 'easy',
	//		map: 'beach',
	//		XPgained: 1000,
	//	},
	//	{
	//		gameMode: '1v1',
	//		team: [
	//			{ img: avatar1, level: 1 },
	//			{ img: avatar2, level: 2 },
	//			{ img: avatar3, level: 10 },
	//			{ img: avatar4, level: 9 },
	//		],
	//		date: '02/04/2023',
	//		hour: '3h38',
	//		score: [3, 10],
	//		duration: '30 min',
	//		difficulty: 'easy',
	//		map: 'beach',
	//		XPgained: 1000,
	//	},
	//	{
	//		gameMode: '1v1',
	//		team: [
	//			{ img: avatar1, level: 1 },
	//			{ img: avatar2, level: 2 },
	//			{ img: avatar3, level: 10 },
	//			{ img: avatar4, level: 9 },
	//		],
	//		date: '02/04/2023',
	//		hour: '3h38',
	//		score: [3, 10],
	//		duration: '30 min',
	//		difficulty: 'easy',
	//		map: 'beach',
	//		XPgained: 1000,
	//	},
	//	{
	//		gameMode: '1v1',
	//		team: [
	//			{ img: avatar1, level: 1 },
	//			{ img: avatar2, level: 2 },
	//			{ img: avatar3, level: 10 },
	//			{ img: avatar4, level: 9 },
	//		],
	//		date: '02/04/2023',
	//		hour: '3h38',
	//		score: [3, 10],
	//		duration: '30 min',
	//		difficulty: 'easy',
	//		map: 'beach',
	//		XPgained: 1000,
	//	},
	//	{
	//		gameMode: '1v1',
	//		team: [
	//			{ img: avatar1, level: 1 },
	//			{ img: avatar2, level: 2 },
	//			{ img: avatar3, level: 10 },
	//			{ img: avatar4, level: 9 },
	//		],
	//		date: '02/04/2023',
	//		hour: '3h38',
	//		score: [3, 10],
	//		duration: '30 min',
	//		difficulty: 'easy',
	//		map: 'beach',
	//		XPgained: 1000,
	//	},
	//];
	console.log('isMobileView', isMobileView);
	const dataHistory = ({ history, index }: dataHistoryProps) => {
		return (
			<tr key={index} className={index % 2 === 0 ? 'odd' : 'even'}>
				<td>{history.gameMode}</td>
				<td className="teamMatch">
					{history.team.map((teamMember: any, index: number) => (
						<TeamMatch
							img={teamMember.img}
							level={teamMember.level}
							index={index}
							key={index}
						/>
					))}
				</td>
				{!isMobileView && <td>{history.date}</td>}
				{!isMobileView && <td>{history.hour}</td>}
				<td>
					{history.score[0]} - {history.score[1]}
				</td>
				{!isMobileView && <td>{history.duration}</td>}
				{!isMobileView && <td>{history.difficulty}</td>}
				{!isMobileView && <td>{history.map}</td>}
				<td>{history.XPgained}</td>
			</tr>
		);
	};

	return (
		<div className="match-history">
			<BasicFrame title="Match History" height="100%">
				<table className="matchesInProgress">
					<thead>
						<tr>
							{!isMobileView &&
								header.map((header, index) => (
									<th key={index}>{header}</th>
								))}
							{isMobileView &&
								headerMobile.map((headerMobile, index) => (
									<th className={headerMobile} key={index}>
										{headerMobile}
									</th>
								))}
						</tr>
					</thead>
					<tbody>
						{/*{data.map((history, index) =>
							dataHistory({ history, index })
						)}*/}
					</tbody>
				</table>
			</BasicFrame>
		</div>
	);
};
