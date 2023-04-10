
import * as React from 'react';
import {useState} from 'react';
import './MainPage.css';
/*	SELECTORS	*/
import { selectUserData } from '../utils/redux/selectors';

//Interface
import {DataTable} from './types'

// Components
import FilterButton from './Components/Filter/FilterButton';
import MatchesInProgress from './Components/Matches/MatchesInProgress';

//Ressources
import refresh from './Components/Ressources/refresh.svg';
import avatar1 from './Components/Ressources/avatar1.svg';
import avatar2 from './Components/Ressources/avatar2.svg';
import avatar3 from './Components/Ressources/avatar3.svg';
import avatar4 from './Components/Ressources/avatar4.svg';
import personSad from './Components/Ressources/personSad.svg'

const MainPage = () => {
	//filter
	const handleFilter = (option:string) => {
		console.log('Selected filter:', option);
		//here we will handle the filter
	};
	const [resetFilter, setResetFilter] = useState(false);
	const [openFilter, setOpenFilter] = useState<string | null>(null); //can be a string or null
	//open or close the filter
	const toggleDropdown = (filterName : string) => {
		if (openFilter === filterName) {
		  setOpenFilter(null);
		} else {
		  setOpenFilter(filterName);
		}
	};
	const clearAllFilter = () => {
		setOpenFilter(null);
		// handleFilter(""); // Clear the filter -> only usefull when the handleFilter will do something
		setResetFilter(!resetFilter); // Toggle resetFilter state -> what triggers the UseEffect
	};

	//table
	const header = ["Game mode", "Team", "Date", "Hour", "Score", "Difficulty", "Map", "Watch"];

	{/** @TODO Lier au back */}
	const data:DataTable[] = [
		{gameMode:"1v1", team:[{img:avatar1, level:1}, {img:avatar2, level:2}, {img:avatar3, level:10}, {img:avatar4, level:9}], date:"02/04/2023", hour:"3h38", score:[3,10,28,1], difficulty:"easy", map:"beach", watch:"http://localhost:8080/game"},
		{gameMode:"1v1", team:[{img:avatar1, level:1}, {img:avatar2, level:2}, {img:avatar3, level:10}, {img:avatar4, level:9}], date:"08/04/2023", hour:"3h38",score:[3,10,28,1], difficulty:"easy", map:"beach", watch:"http://localhost:8080/game"},
		{gameMode:"1v1", team:[{img:avatar1, level:1}, {img:avatar2, level:2}, {img:avatar3, level:10}, {img:avatar4, level:9}], date:"08/04/2023", hour:"3h38",score:[3,10,28,1], difficulty:"easy", map:"beach", watch:"http://localhost:8080/game"}
	];

	const dataGame = (data: DataTable, index:number) => (
		<tr className={index % 2 === 0 ? "odd" : "even"}>
			<td>{data.gameMode}</td>
			<td className='teamMatch'>
				{data.team.map((teamMember, index) => (
					<div className="teamMemberLevel" key={index}>
						<img  src={teamMember.img} alt={`Team member ${index + 1}`} />
						<p>{teamMember.level}</p>
					</div>
				))}
			</td>
			<td>{data.date}</td>
			<td>{data.hour}</td>
			<td>
				<div className='teamScore'>
				{data.score.map((scoreMember, index) => (
					<p>{scoreMember}</p>
				))}
				</div>
			</td>
			<td>{data.difficulty}</td>
			<td>{data.map}</td>
			<td><button className='buttonMatch' onClick={() => window.open(data.watch)}>Watch</button></td>
		</tr>
	);

	return (
		<div className='rectNoMsg'>
			<p className='mainTitle'>Games in progress</p>
			<div className='filter'>
				<button className="refreshButton" onClick={clearAllFilter}>
					<img src={refresh} alt="refresh"/>
				</button>
				<FilterButton
					label="Sort By"
					options={['name', 'date', 'map', 'difficulty']}
					onFilter={handleFilter}
					isOpen={openFilter === "Sort By"} 
					//If another button is clicked, openFilter will have a different value and isOpen will be false
					toggleDropdown={() => toggleDropdown("Sort By")} 
					//update the state openFilter
					resetFilter={resetFilter}
				/>
				<FilterButton
					label="Game Mode"
					options={['1v1', '2v2']}
					onFilter={handleFilter}
					isOpen={openFilter === "Game Mode"}
					toggleDropdown={() => toggleDropdown("Game Mode")}
					resetFilter={resetFilter}
				/>
				<FilterButton
					label="Friends"
					options={['Only my friends', 'Everyone']}
					onFilter={handleFilter}
					isOpen={openFilter === "Friends"}
					toggleDropdown={() => toggleDropdown("Friends")}
					resetFilter={resetFilter}
				/>
				<FilterButton
					label="Map"
					options={['Classic', 'Beach', 'Space']}
					onFilter={handleFilter}
					isOpen={openFilter === "Map"}
					toggleDropdown={() => toggleDropdown("Map")}
					resetFilter={resetFilter}
				/>
				<FilterButton
					label="Difficulty"
					options={['Easy', 'Hard']}
					onFilter={handleFilter}
					isOpen={openFilter === "Difficulty"}
					toggleDropdown={() => toggleDropdown("Difficulty")}
					resetFilter={resetFilter}
				/>
			</div>
			<div className='gameDiv'>
				<MatchesInProgress header={header} data={data} dataGame={dataGame}/>
				<div className='illustrationGamingActivity'>
					<p>The gaming activity is <br /> relatively low right now</p>
					<img src={personSad} alt="personsad"/>
				</div>
			</div>
		</div>
	);
}

export default MainPage;