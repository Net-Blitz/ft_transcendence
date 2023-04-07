import React, { useState } from 'react';
import './MainPage.css';
// Components
import refresh from './Components/Ressources/refresh.svg';
import FilterButton from './Components/FilterButton';

const MainPage = () => {
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
	return (
		<div className='rect_no_msg'>
			<p>Games in progress</p>
			<div className='filter'>
				<button onClick={clearAllFilter}>
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
		</div>
	);
}

export default MainPage;