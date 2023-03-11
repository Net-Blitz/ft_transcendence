import logo from '../logo.svg';
import '../App.css';

function Login() {
	return (
		<div className="App">
			<header className="App-header">
			<img src={logo} className="App-logo" alt="logo" />
			<a
				className="App-link"
				href="https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-d5cdcc47ce45e3c769f2cb13e87ab75731cca27c43d93f1353595fceb48986ac&redirect_uri=http%3A%2F%2Flocalhost%3A3333%2Fauth%2Fcallback&response_type=code">
				login
			</a>
			</header>
		</div>
	);
};

export default Login;
