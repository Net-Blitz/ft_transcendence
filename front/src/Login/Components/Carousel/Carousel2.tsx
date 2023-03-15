import React, { useEffect, useState } from 'react'
import { FaArrowAltCircleRight, FaArrowAltCircleLeft } from 'react-icons/fa'
import './Carousel2.css'

const Carousel2 = (props: any) => {
	const {children} = props;
	console.log([children]);
	const [currentIndex, setCurrentIndex] = useState(0);
	const [length, setLenght] = useState(children.length);

	const next = () => {
		if (currentIndex < (length - 1)) {
			setCurrentIndex(prevState => prevState + 1);
		}
	}

	const prev = () => {
		if (currentIndex > 0) {
			setCurrentIndex(prevState => prevState - 1);
		}
	}

	return (
		<div className='carousel-container'>
			<div className='carousel-wrapper'>
				{
					currentIndex > 0 &&
					<button className='left-arrow2' onClick={prev}>
						&lt;
					</button>
				}
				<div className='carousel-content-wrapper'>
					<div
						className='carousel-content'
						style={{transform: `translateX(-${currentIndex * 100}%)`}}	
					>
						{children}
					</div>
				</div>
				{
					currentIndex < (length - 1) && 
					<button className='right-arrow2' onClick={next}>
						&gt;
					</button>
				}
			</div>
		</div>
	);
}

export default Carousel2