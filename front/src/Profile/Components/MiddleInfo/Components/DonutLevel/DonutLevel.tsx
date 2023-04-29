import React from 'react';
import Chart from 'chart.js/auto';
import { CategoryScale } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

import './DonutLevel.css';

Chart.register(CategoryScale);

export const DonutLevel = () => {
	const percentageValue = 25;
	const data = {
		datasets: [
			{
				data: [percentageValue, 100 - percentageValue],
				backgroundColor: ['#F9DA49', '#fff'],
			},
		],
	};
	const options = {
		cutout: '92%',
		responsive: true,
		maintainAspectRatio: true,
		plugins: {
			legend: {
				display: false,
			},
			tooltip: {
				enabled: false,
			},
		},
		elements: {
			arc: {
				borderWidth: 0,
			},
		},
	};

	return (
		<div className="donutlevel-wrapper">
			<div className="level-wrapper">
				Lvl. <span>3</span>
			</div>
			<div className="doughnut-wrapper">
				<div className="d-percentage">
					{percentageValue.toString()} %
				</div>
				<Doughnut data={data} options={options} />
			</div>
			<div className="progression-wrapper">
				<span>81</span> / 325
			</div>
		</div>
	);
};
