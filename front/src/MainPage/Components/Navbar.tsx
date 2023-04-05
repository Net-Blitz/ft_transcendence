import React from 'react';
import { Link } from 'react-router-dom';
// import './Navbar.css';
import { useSelector } from 'react-redux';
import { selectUserData } from '../../utils/redux/selectors';


const Navbar = () => {
  const avatar = useSelector(selectUserData).avatar;
  const buttons = [
    { content: 'Home', href: '/', bool:true},
    { content: 'Contact', href: '/contact', bool:false },
    { content: 'Game', href: '/game' },
    { content: 'Chat', href: '/chat' },
    { content: 'Notification', href: '/notification' },
    { content: 'Profile', href: '/profile' },
  ];

  return (

    <div>
  {/* <nav className="navbar">
     <ul className="navbar-list">
       {buttons.map((button, index) => (
         <li key={index} className="navbar-item">
           <Link to={button.href} className="navbar-link">
             {button.content}
           </Link>
         </li>
       ))} */}
    <p>text</p>
        <p>{avatar}</p>
        </div>
  //    </ul>
  //  </nav>
  );
};

export default Navbar;