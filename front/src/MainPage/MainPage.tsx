import * as React from 'react';
import { useState } from 'react';
import './MainPage.css';
/*	SELECTORS	*/
import { selectUserData } from '../utils/redux/selectors';

// Components
import FilterButton from './Components/Filter/FilterButton';
import MatchesInProgress from './Components/Matches/MatchesInProgress';

//Ressources
import refresh from './Components/Ressources/refresh.svg';
import personSad from './Components/Ressources/personSad.svg';

//Interface
import { Filters } from './types';

const MainPage = () => {
	//filter
	const handleFilter = (key: keyof Filters, option: string) => {
		setFilters({ ...filters, [key]: option }); //...filters => create a new object (a copy) but with the new option for
	};
	const [resetFilter, setResetFilter] = useState(false);
	const [openFilter, setOpenFilter] = useState<string | null>(null); //can be a string or null
	//open or close the filter
	const toggleDropdown = (filterName: string) => {
		if (openFilter === filterName) {
			setOpenFilter(null);
		} else {
			setOpenFilter(filterName);
		}
	};
	const clearAllFilter = () => {
		setOpenFilter(null);
		setFilters({
			sortBy: 'all',
			gameMode: 'all',
			friends: 'all',
			map: 'all',
			difficulty: 'all',
		});
		setResetFilter(!resetFilter); // Toggle resetFilter state -> what triggers the UseEffect
	};

	const [filters, setFilters] = useState({
		sortBy: 'all',
		gameMode: 'all',
		friends: 'all',
		map: 'all',
		difficulty: 'all',
	});

	return (
		<div className="rectNoMsg">
			<p className="mainTitle">Games in progress</p>
			<div className="filter">
				{/* <FilterGlobal/> */}
				<button className="refreshButton" onClick={clearAllFilter}>
					<img src={refresh} alt="refresh" />
				</button>
				<FilterButton
					label="Sort By"
					options={['date', 'map', 'difficulty']}
					onFilter={(option) => handleFilter('sortBy', option)} //only called when there is an option
					isOpen={openFilter === 'Sort By'}
					//If another button is clicked, openFilter will have a different value and isOpen will be false
					setIsOpen={() => setOpenFilter(null)}
					toggleDropdown={() => toggleDropdown('Sort By')}
					//update the state openFilter
					resetFilter={resetFilter}
				/>
				<FilterButton
					label="Game Mode"
					options={['1v1', '2v2']}
					onFilter={(option) => handleFilter('gameMode', option)}
					isOpen={openFilter === 'Game Mode'}
					setIsOpen={() => setOpenFilter(null)}
					toggleDropdown={() => toggleDropdown('Game Mode')}
					resetFilter={resetFilter}
				/>
				<FilterButton
					label="Friends"
					options={['Only my friends', 'Everyone']}
					onFilter={(option) => handleFilter('friends', option)}
					isOpen={openFilter === 'Friends'}
					setIsOpen={() => setOpenFilter(null)}
					toggleDropdown={() => toggleDropdown('Friends')}
					resetFilter={resetFilter}
				/>
				<FilterButton
					label="Map"
					options={['Classic', 'Beach', 'Space']}
					onFilter={(option) => handleFilter('map', option)}
					isOpen={openFilter === 'Map'}
					setIsOpen={() => setOpenFilter(null)}
					toggleDropdown={() => toggleDropdown('Map')}
					resetFilter={resetFilter}
				/>
				<FilterButton
					label="Difficulty"
					options={['Easy', 'Hard']}
					onFilter={(option) => handleFilter('difficulty', option)}
					isOpen={openFilter === 'Difficulty'}
					setIsOpen={() => setOpenFilter(null)}
					toggleDropdown={() => toggleDropdown('Difficulty')}
					resetFilter={resetFilter}
				/>
			</div>
			<div className="gameDiv">
				<MatchesInProgress filters={filters} />
				<div className="illustrationGamingActivity">
					<p>
						The gaming activity is <br /> relatively low right now
					</p>
					<img src={personSad} alt="personsad" />
				</div>
			</div>
		</div>
	);
};

export default MainPage;
