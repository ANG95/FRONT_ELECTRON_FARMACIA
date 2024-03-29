import React, { Component } from 'react';
import { Router, Route, Switch, Redirect } from 'react-router-dom';
import { Container } from 'reactstrap';
import PublicRoutes from './routes/PublicRoutes';
import PrivateRoutes from './routes/PrivateRoutes';
import history from './util/history';

const authentication = () =>
	JSON.parse(localStorage.getItem('roles')) ? (
		<Redirect to="/app" />
	) : (
			<PublicRoutes />
		);

class App extends Component {
	render() {
		return (
			<Container fluid className="px-0">
				<Router history={history}>
					<Switch>
						<Route path="/app" component={PrivateRoutes} />
						<Route path="/" render={authentication} />
					</Switch>
				</Router>
			</Container>
		);
	}
}

export default App;
