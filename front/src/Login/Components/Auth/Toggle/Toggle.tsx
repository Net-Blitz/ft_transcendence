import React, {useState} from 'react'
import './Toggle.css'

interface ToggleProps {
	statusState: boolean;
	setStatusState: React.Dispatch<React.SetStateAction<boolean>>;
}

const Toggle = ({statusState, setStatusState} : ToggleProps) => {
	/*	HOOK settings	*/
	const [firstElement, setFirstElement] = useState('No');
	const [secondElement, setSecondElement] = useState('Yes');

	function toggleButton (event: any) {
		const part_one = document.querySelector<HTMLElement>('.toggle-wrapper .button-element');
		const part_two = document.querySelector<HTMLElement>('.toggle-wrapper #yes');

		if (!statusState)
		{
			setStatusState(true);
			setFirstElement('Yes');
			setSecondElement('No');
			if (part_one)
				part_one.style.transform = 'translateX(100px)';
			if (part_two)
				part_two.style.transform = 'translateX(-90px)';
		}
		else
		{
			setStatusState(false);
			setFirstElement('No');
			setSecondElement('Yes');
			if (part_one)
				part_one.style.transform = 'translateX(0px)';
			if (part_two)
			part_two.style.transform = 'translateX(0px)';
		}
	} 

	return (
		<div className='toggle-wrapper'>
			<div id='button-container' className='button' onClick={toggleButton}>
				<div id='my_button' className='button-element'>
					<p id='no'>{firstElement}</p>
				</div>
				<p id='yes'>{secondElement}</p>
			</div>
		</div>
	);
}

export default Toggle;