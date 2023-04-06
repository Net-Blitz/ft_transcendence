import React, { useState } from 'react';
import './FilterButton.css';
import arrow_down from './Ressources/arrow_down_beige.svg';
import close from './Ressources/close_blue.svg';


const FilterButton = ({ label, options, onFilter, isOpen, toggleDropdown }) => {
	const [selectedFilter, setSelectedFilter] = useState(label); //if one filter was selected
	const [isFilterSelected, setIsFilterSelected] = useState(false);


	const handleFilterClick = (option) => { //when we click on a filter
		setSelectedFilter(`${label}: ${option}`); //update the selected filter
		onFilter(option);
		setIsFilterSelected(true);
		setIsOpen(false);
	};

	return (
		<div className={`filter-button${isFilterSelected ? ' filter-button-selected' : ''}`}> {/* add filter-button-selected as a classname if it is selected */}
			<button onClick={toggleDropdown}>
				{selectedFilter}
				<img className="icon_arrow" src={isFilterSelected ? close : arrow_down} alt={selectedFilter}/>
			</button>
			{/* if it is open : */}
			{isOpen && (
				<div className="filter-dropdown">
				{options.map((option) => (
					<button key={option} onClick={() => handleFilterClick(option)}>
						<div className='rect_sub_filter'></div>
						{option}
					</button>
				))}
				</div>
			)}
		</div>
	);
};

export default FilterButton