import React from 'react';
//Interface
import {MatchesInProgressProps} from '../../types'

const MatchesInProgress : React.FC<MatchesInProgressProps> = ({header, data, dataGame}) => { //This specifies that the MatchesInProgress variable is a React component and it expects props of the type
	return(
		<table>
			<thead>
				<tr>
					{header.map((header, index) => (
						<th key={index}>{header}</th>
					))}
				</tr>
			</thead>
			<tbody>
				{data.map((dataGame))}
			</tbody>
		</table>
	);
}

export default MatchesInProgress;