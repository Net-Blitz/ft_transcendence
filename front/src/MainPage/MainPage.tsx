import React, { useState } from 'react';
import './MainPage.css';
// Components
// import refresh from './Ressources/refresh.svg';
import FilterButton from './Components/FilterButton';

const MainPage = () => {
	const handleFilter = (option:string) => {
		console.log('Selected filter:', option);
		//here we will handle the filter
	};
	const [openFilter, setOpenFilter] = useState<string | null>(null); //can be a string or null
	//open or close the filter
	const toggleDropdown = (filterName : string) => {
		if (openFilter === filterName) {
		  setOpenFilter(null);
		} else {
		  setOpenFilter(filterName);
		}
	  };
	return (
		<div className='rect_no_msg'>
			<p>Games in progress</p>
			<div className='filter'>
				<FilterButton
					label="Sort By"
					options={['Sorted by name', 'Sorted by date', 'Sorted by map', 'Sorted by difficulty']}
					onFilter={handleFilter}
					isOpen={openFilter === "Sort By"} 
					//If another button is clicked, openFilter will have a different value and isOpen will be false
					toggleDropdown={() => toggleDropdown("Sort By")} 
					//update the state openFilter
				/>
				<FilterButton
					label="Game Mode"
					options={['1v1', '2v2']}
					onFilter={handleFilter}
					isOpen={openFilter === "Game Mode"}
					toggleDropdown={() => toggleDropdown("Game Mode")}
				/>
				<FilterButton
					label="Friends"
					options={['Only my friends', 'Everyone']}
					onFilter={handleFilter}
					isOpen={openFilter === "Friends"}
					toggleDropdown={() => toggleDropdown("Friends")}
				/>
				<FilterButton
					label="Map"
					options={['Classic', 'Beach', 'Space']}
					onFilter={handleFilter}
					isOpen={openFilter === "Map"}
					toggleDropdown={() => toggleDropdown("Map")}
				/>
				<FilterButton
					label="Difficulty"
					options={['Easy', 'Hard']}
					onFilter={handleFilter}
					isOpen={openFilter === "Difficulty"}
					toggleDropdown={() => toggleDropdown("Difficulty")}
				/>
			</div>
		</div>
	);
}

export default MainPage;