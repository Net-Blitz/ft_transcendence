import React from 'react';
import './MatchHistory.css';
import { useEffect, useState } from 'react';

import { BasicFrame } from '../MiddleInfo/MiddleInfo';
import { useAxios } from '../../../utils/hooks';
import axios from 'axios';
import { useParams, useSearchParams } from 'react-router-dom';

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
	return windowWidth;
};

export const MatchHistory = ({ userData }: { userData: any }) => {
	const headerMobile = ['Game mode', 'Team', 'Score', 'XP Gained'];
	const isMobileView = useWindowWidth() < 767;
	const [matchHistory, setMatchHistory] = useState<any[]>([]);
	const { username } = useParams();
	if (username) userData.username = username;

	useEffect(() => {
		const getMatchHistory = async () => {
			try {
				const response = await axios.get(
					'http://localhost:3333/users/matchs/' + userData.username,
					{ withCredentials: true }
				);
				setMatchHistory(response.data);
			} catch (error) {
				console.log(error);
			}
		};
		getMatchHistory();
	}, []);

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

	const dataHistory = ({ history, index }: dataHistoryProps) => {
		const date: Date = new Date(history.date);

		return (
			<tr key={index} className={index % 2 === 0 ? 'odd' : 'even'}>
				<td>
					{history.mode === 'ONEVONE'
						? '1v1'
						: history.mode === 'TWOVTWO'
						? '2v2'
						: 'FFA'}
				</td>
				<td className="teamMatch">
					{history.team.map((teamMember: any, index: number) => (
						<TeamMatch
							img={'http://localhost:3333/' + teamMember.avatar}
							level={Math.floor(teamMember.experience / 1000)}
							index={index}
							key={index}
						/>
					))}
				</td>
				{!isMobileView && (
					<td>
						{date.getDate() +
							'/' +
							date.getMonth() +
							'/' +
							date.getFullYear()}
					</td>
				)}
				{!isMobileView && (
					<td>{date.getHours() + ':' + date.getMinutes()}</td>
				)}
				<td>
					{history.mode === 'ONEVONE'
						? history.score1 + ' - ' + history.score2
						: history.mode === 'TWOVTWO'
						? history.score1 + ' - ' + history.score3
						: history.score1 +
						  ' - ' +
						  history.score2 +
						  ' - ' +
						  history.score3 +
						  ' - ' +
						  history.score4}
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
						{matchHistory &&
							matchHistory.map((history: any, index: number) =>
								dataHistory({ history, index })
							)}
					</tbody>
				</table>
			</BasicFrame>
		</div>
	);
};
