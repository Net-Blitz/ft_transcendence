import React from 'react';
import './MatchHistory.css';
import { BasicFrame } from '../MiddleInfo/MiddleInfo';
/* Ressources */
import avatar1 from '../../../MainPage/Components/Ressources/avatar1.svg';
import avatar2 from '../../../MainPage/Components/Ressources/avatar2.svg';
import avatar3 from '../../../MainPage/Components/Ressources/avatar3.svg';
import avatar4 from '../../../MainPage/Components/Ressources/avatar4.svg';

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

export const MatchHistory = () => {
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

	let data = [
		{
			gameMode: '1v1',
			team: [
				{ img: avatar1, level: 1 },
				{ img: avatar2, level: 2 },
				{ img: avatar3, level: 10 },
				{ img: avatar4, level: 9 },
			],
			date: '02/04/2023',
			hour: '3h38',
			score: [3, 10],
			duration: '30 min',
			difficulty: 'easy',
			map: 'beach',
			XPgained: 1000,
		},
		{
			gameMode: '1v1',
			team: [
				{ img: avatar1, level: 1 },
				{ img: avatar2, level: 2 },
				{ img: avatar3, level: 10 },
				{ img: avatar4, level: 9 },
			],
			date: '02/04/2023',
			hour: '3h38',
			score: [3, 10],
			duration: '30 min',
			difficulty: 'easy',
			map: 'beach',
			XPgained: 1000,
		},
		{
			gameMode: '1v1',
			team: [
				{ img: avatar1, level: 1 },
				{ img: avatar2, level: 2 },
				{ img: avatar3, level: 10 },
				{ img: avatar4, level: 9 },
			],
			date: '02/04/2023',
			hour: '3h38',
			score: [3, 10],
			duration: '30 min',
			difficulty: 'easy',
			map: 'beach',
			XPgained: 1000,
		},
		{
			gameMode: '1v1',
			team: [
				{ img: avatar1, level: 1 },
				{ img: avatar2, level: 2 },
				{ img: avatar3, level: 10 },
				{ img: avatar4, level: 9 },
			],
			date: '02/04/2023',
			hour: '3h38',
			score: [3, 10],
			duration: '30 min',
			difficulty: 'easy',
			map: 'beach',
			XPgained: 1000,
		},
		{
			gameMode: '1v1',
			team: [
				{ img: avatar1, level: 1 },
				{ img: avatar2, level: 2 },
				{ img: avatar3, level: 10 },
				{ img: avatar4, level: 9 },
			],
			date: '02/04/2023',
			hour: '3h38',
			score: [3, 10],
			duration: '30 min',
			difficulty: 'easy',
			map: 'beach',
			XPgained: 1000,
		},
	];

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
				<td>{history.date}</td>
				<td>{history.hour}</td>
				<td>
					{history.score[0]} - {history.score[1]}
				</td>
				<td>{history.duration}</td>
				<td>{history.difficulty}</td>
				<td>{history.map}</td>
				<td>{history.XPgained}</td>
			</tr>
		);
	};

	return (
		<div className="match-history">
			<BasicFrame height="100%" title="Match History">
				<table>
					<thead>
						<tr>
							{header.map((header, index) => (
								<th key={index}>{header}</th>
							))}
						</tr>
					</thead>
					<tbody>
						{data.map((history, index) =>
							dataHistory({ history, index })
						)}
					</tbody>
				</table>
			</BasicFrame>
		</div>
	);
};
