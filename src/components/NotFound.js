import React, { Fragment } from 'react';
import { Link } from 'react-router-dom';

const NotFound = (props) => (
	<Fragment>
		<div className="text-center">
				<div className="h1 text-danger">404</div>
				<div className="h6 text-danger">Página no encontrada </div>
		</div>
		{props.children}
	</Fragment>
);

NotFound.defaultProps = {
	jumbotronProps: {
		title: '>'
	},
	children: (<Link className="nav-link" to="/">Volver</Link>)
};

export default NotFound;
