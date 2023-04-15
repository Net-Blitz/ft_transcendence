import React from 'react';
import { useEffect, useState } from 'react';
import './MatchesInProgress.css';

//Ressources
import avatar1 from '../Ressources/avatar1.svg';
import avatar2 from '../Ressources/avatar2.svg';
import avatar3 from '../Ressources/avatar3.svg';
import avatar4 from '../Ressources/avatar4.svg';

//Interface
import { DataTable, MatchesInProgressProps, Filters } from '../../types';

//Not working
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

const MatchesInProgress: React.FC<MatchesInProgressProps> = ({ filters }) => {
	//This specifies that the MatchesInProgress variable is a React component and it expects props of the type
	const header = [
		'Game mode',
		'Team',
		'Date',
		'Hour',
		'Score',
		'Difficulty',
		'Map',
		'Watch',
	];
	const headerMobile = ['Game mode', 'Team', 'Score', 'Watch'];
	const isMobileView = useWindowWidth() < 767;
	{
		/** @TODO Lier au back */
	}
	const data: DataTable[] = [
		{
			gameMode: '1v1',
			team: [
				{ img: avatar1, level: 1 },
				{ img: avatar2, level: 2 },
				{ img: avatar3, level: 10 },
				{ img: avatar4, level: 9 },
			],
			date: '20/06/2023',
			hour: '3h38',
			score: [3, 10, 28, 1],
			difficulty: 'Hard',
			map: 'Classic',
			watch: 'http://localhost:8080/game',
		},
		{
			gameMode: '2v2',
			team: [
				{ img: avatar1, level: 1 },
				{ img: avatar2, level: 2 },
				{ img: avatar3, level: 10 },
				{ img: avatar4, level: 9 },
			],
			date: '08/06/2023',
			hour: '3h38',
			score: [3, 10, 28, 1],
			difficulty: 'Easy',
			map: 'Beach',
			watch: 'http://localhost:8080/game',
		},
		{
			gameMode: '1v1',
			team: [
				{ img: avatar1, level: 1 },
				{ img: avatar2, level: 2 },
				{ img: avatar3, level: 10 },
				{ img: avatar4, level: 9 },
			],
			date: '01/06/2023',
			hour: '3h38',
			score: [3, 10, 28, 1],
			difficulty: 'Easy',
			map: 'Beach',
			watch: 'http://localhost:8080/game',
		},
	];
	const parseDate = (dataString: string): Date => {
		const [month, day, year] = dataString.split('/').map(Number);
		return new Date(year, month - 1, day); //date is waiting for January to be 0
	};
	const sortByDate = (data: DataTable[]) => {
		return data.sort((a, b) => {
			const dateA = parseDate(a.date); //create data object
			const dateB = parseDate(b.date);
			return dateA.getTime() - dateB.getTime(); //compare the 2 dates
		});
	};
	const sortByMap = (data: DataTable[]): DataTable[] => {
		return data.sort((a, b) => {
			const mapA = a.map.toLowerCase();
			const mapB = b.map.toLowerCase();
			if (mapA < mapB) return -1;
			if (mapA > mapB) return 1;
			return 0;
		});
	};
	const sortByDifficulty = (data: DataTable[]): DataTable[] => {
		return data.sort((a, b) => {
			const difficultyA = a.difficulty.toLowerCase();
			const difficultyB = b.difficulty.toLowerCase();
			if (difficultyA < difficultyB) return -1;
			if (difficultyA > difficultyB) return 1;
			return 0;
		});
	};
	const filterAll = (data: DataTable[], filter: Filters): DataTable[] => {
		let filteredData = data.filter((match) => {
			//if it returns false, it is not save. If it returns true, it is save
			for (const filterKey in filters) {
				// console.log('filterKey', filterKey);
				if (filterKey !== 'sortBy') {
					const filterValue = filters[filterKey as keyof Filters]; //used to create a type representing all the keys
					if (
						filterValue !== 'all' &&
						match[filterKey as keyof DataTable] !== filterValue
					)
						//if it FilterValue == all : no option is selected
						return false;
				}
			}
			return true;
		});
		if (filters.sortBy == 'date') {
			filteredData = sortByDate(filteredData);
		}
		if (filters.sortBy == 'map') {
			filteredData = sortByMap(filteredData);
		}
		if (filters.sortBy == 'difficulty') {
			filteredData = sortByDifficulty(filteredData);
		}
		return filteredData;
	};
	const finalData = filterAll(data, filters);
	const dataGame = (data: DataTable, index: number) => (
		<tr className={index % 2 === 0 ? 'odd' : 'even'}>
			<td>{data.gameMode}</td>
			<td className="teamMatch">
				{data.team.map((teamMember, index) => (
					<div className="teamMemberLevel" key={index}>
						<img
							src={teamMember.img}
							alt={`Team member ${index + 1}`}
						/>
						<p>{teamMember.level}</p>
					</div>
				))}
			</td>
			{!isMobileView && <td className="dateMatch">{data.date}</td>}
			{!isMobileView && <td className="hourMatch">{data.hour}</td>}
			<td className="ScoreMatch">
				<div className="teamScore">
					{data.score.map((scoreMember, index) => (
						<p>{scoreMember}</p>
					))}
				</div>
			</td>
			{!isMobileView && (
				<td className="difficultyMatch">{data.difficulty}</td>
			)}
			{!isMobileView && <td className="mapMatch">{data.map}</td>}
			<td className="watchMatch">
				<button
					className="buttonMatch"
					onClick={() => window.open(data.watch)}>
					Watch
				</button>
			</td>
		</tr>
	);

	return (
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
			<tbody>{finalData.map(dataGame)}</tbody>
		</table>
	);
};

export default MatchesInProgress;
