import React, { Fragment } from 'react';
import { Link, Route, Switch } from 'react-router-dom';
import Login from '../components/Login';
import NotFound from '../components/NotFound';
import { Card, CardHeader } from 'reactstrap';

const Register = () => (
	<div >
	title="Register"
		<Link className="nav-link" to="/">
			Back to login
		</Link>
	</div>
);
const ForgotPassword = () => (
	<div>
		<Card>
			<CardHeader>ForgotPassword</CardHeader>
		</Card>
		<Link className="nav-link" to="/">
			Volver a Login
		</Link>
	</div>
);

const PublicRoutes = () => (
	<Fragment>
		<Switch>
			<Route path="/forgot-password" component={ForgotPassword} />
			<Route path="/register" component={Register} />
			<Route exact path="/" component={Login} />
			<Route component={NotFound} />
		</Switch>
	</Fragment>
);

export default PublicRoutes;
