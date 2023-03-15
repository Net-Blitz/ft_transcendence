import React, {useState} from 'react';
import { FaArrowAltCircleRight, FaArrowAltCircleLeft } from 'react-icons/fa'
import './Carousel.css';
import { AvatarData } from '../Background/Background';

interface contentCarou {
	first: string | any;
	second: string | any;
	third: string | any;
};

function findImg(index: number): contentCarou {
	let result: contentCarou = {
		first: null,
		second: null,
		third: null
	};
	let length: number = AvatarData.length;
	let prev: number = -1;
	let next: number = -1;

	result.second = AvatarData[index];
	if (index + 1 < length)
		next = index + 1;
	else
		next = 0;
	if (index - 1 >= 0)
		prev = index - 1;
	else
		prev = length - 1;
	if (prev === next)
	{
		if (prev === 1)
			prev = -1;
		else
			next = -1;
	}
	console.log('length is ' + length);
	console.log('prev is ' + prev);
	console.log('index is ' + index);
	console.log('next is ' + next);
	return (result);
}

export default function Carousel() {
	const [current, setCurrent] = useState(0);
	const length = AvatarData.length;

	const nextSlide = () => {
		setCurrent(current === length - 1 ? 0 : current + 1);
	}

	const prevSlide = () => {
		setCurrent(current === 0 ? length - 1 : current - 1);
	}

	return (
		<div className='Carousel'>
			<FaArrowAltCircleLeft className='left-arrow' onClick={prevSlide}/>
			{AvatarData.map((slide, index, elements) => {
				let prev :number;
				if (current === index)
					findImg(index);

				return (
					<div 
					className={index === current ? 'slide active' : 'slide'} 
					key={index}
					>
						{index === current && (
							<img src={slide.avatar} alt="avatar etudiant 42" className='avatar'/>
						)}
					</div>
				);
			})}
			<FaArrowAltCircleRight className='right-arrow' onClick={nextSlide}/>
		</div>
	);
}

