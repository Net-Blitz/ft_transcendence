import React, { useState, useEffect} from 'react';
import './FilterButton.css';
import arrow_down from './Ressources/arrow_down_beige.svg';
import close from './Ressources/close_blue.svg';


const FilterButton = ({ label, options, onFilter, isOpen, toggleDropdown, resetFilter}) => {
	const [selectedFilter, setSelectedFilter] = useState(label); //if one filter was selected
	const [isFilterSelected, setIsFilterSelected] = useState(false);

	const handleFilterClick = (option) => { //when we click on a filter
		setSelectedFilter(`${label}: ${option}`); //update the selected filter
		onFilter(option);
		setIsFilterSelected(true);
		setIsOpen(false);
	};

	useEffect(() => {
		setSelectedFilter(label);
		setIsFilterSelected(false);
	  }, [resetFilter, label]);

	const handleButtonClose = () => {
		if (isFilterSelected) {
		  setSelectedFilter(label);
		  setIsFilterSelected(false);
		}
		toggleDropdown();
	  };

	return (
		<div className={`filter-button${isFilterSelected ? ' filter-button-selected' : ''}`}> {/* add filter-button-selected as a classname if it is selected */}
			<button onClick={toggleDropdown}>
				{selectedFilter}
				<button onClick={handleButtonClose}>
					<img className="icon_arrow" src={isFilterSelected ? close : arrow_down} alt={selectedFilter}/>
				</button>
			</button>
			{/* if it is open : */}
			{isOpen && (
				<div className="filter-dropdown">
				{options.map((option) => (
					<button key={option} onClick={() => handleFilterClick(option)}>
						<div className={`rect_sub_filter${selectedFilter === `${label}: ${option}` ? ' rect_sub_filter_selected' : ''}`}></div>
             			<span className={`txt_sub_filter${selectedFilter === `${label}: ${option}` ? ' txt_sub_filter_selected' : ''}`}>{option}</span>
					</button>
				))}
				</div>
			)}
		</div>
	);
};

export default FilterButton