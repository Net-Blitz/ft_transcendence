import React from 'react';
import './Title.css';

interface TitleProps {
	title: string;
	subtitle: string;
}

export default function Title({title, subtitle} : TitleProps){
	console.log(subtitle.length);
	return (
		<div className='title_wrapper'>
			<h1>{title}</h1>
		</div>
	);
}