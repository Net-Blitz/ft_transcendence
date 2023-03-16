import React, {useState} from 'react'
import './Toggle.css'

const Toggle = () => {
	/*	HOOK settings	*/
	const [buttonState, setButtonState] = useState(1);

  return (
	<div className='toggle-wrapper'>
		<div id='button-container' className='button'>
			<div id='my_button' className='button-element'>
				<p id='no'>No</p>
			</div>
			<p id='yes'>Yes</p>
		</div>
	</div>
  );
}

export default Toggle;