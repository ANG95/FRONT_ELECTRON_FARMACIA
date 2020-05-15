import React, { Component, Fragment } from 'react';
import { Switch, Route, NavLink } from 'react-router-dom';
import { Collapse } from 'reactstrap';

import { FaChevronRight, FaChevronUp } from 'react-icons/fa';
// import { FaChevronRight, FaChevronUp, FaAngleRight, FaAngleLeft } from 'react-icons/fa';
import { MdSettings, MdSettingsPower } from "react-icons/md";
import { ToastContainer } from "react-toastify";
import TitleBar from 'frameless-titlebar';

import history from '../util/history';

import * as Routes from './index';
import NotFound from '../components/NotFound';
import Perfil from "../components/Otros/DatosUsuario/Perfil"

const { shell } = require('electron')
// const { ipcRenderer, shell } = require('electron')

const { openExternal } = shell;


class PrivateRoutes extends Component {
	state = {
		navbarExpland: true,
		navbarExplandRight: false,
		collapse: null,
		DataObra: [],
		DataMenus: [],
		allowedRoutes: [],
		components: [],
		slackTemplate: [
			{
				id: '1',
				label: 'App',
				submenu: [
					{
						label: 'Barra lateral (Menus)',
						type: 'checkbox',
						checked: false,
						click: () => { this.ButtonToogle() }
					},
					// {
					// 	id: 'hello',
					// 	label: 'Disabled',
					// 	enabled: true,
					// 	after: '2',
					// 	click: (item, win, e) => {
					// 		e.menuBar.setKeyById(item.id, 'enabled', !item.enabled);
					// 	}
					// },
					// {
					// 	id: '4',
					// 	label: 'Not visible',
					// 	visible: false
					// },
					// {
					// 	id: '3',
					// 	icon: 'https://www.gstatic.com/images/branding/product/1x/keep_48dp.png',
					// 	label: 'Arguments',
					// 	click: (item, win, e) => { console.log(item, win, e); }
					// },
					// {
					// 	id: '5',
					// 	label: 'Really Long Menu Label that should be truncated'
					// },
					{ type: 'separator' },
					// {
					// 	label: 'Test Accelerator',
					// 	accelerator: 'CommandOrControl+Y',
					// 	click: () => { ipcRenderer.send('Test'); }
					// },
					{
						label: 'Redimensionable',
						type: 'checkbox',
						checked: true,
						click: (item, win) => { win.setResizable(item.checked); }
					},
					{
						label: 'Unchecked',
						type: 'checkbox',
						checked: false,
						click: (item, win) => { win.setResizable(item.checked); }
					},
					{
						label: 'Salir del sistema',
						click: () => { window.close(); }
					}
				]
			},
			{
				id: '2',
				label: 'Color',
				before: '1',
				submenu: [
					{
						label: 'Light',
						type: 'radio',
						checked: false,
						click: () => { document.querySelector('body').style.background = 'rgb(240,240,240)'; }
					},
					{
						label: 'Dark',
						type: 'radio',
						checked: true,
						click: () => { document.querySelector('body').style.background = 'rgb(64,64,64)'; }
					},
					{
						label: 'Black',
						type: 'radio',
						checked: false,
						click: () => { document.querySelector('body').style.background = 'rgb(0,0,0)'; }
					}
				]
			},
			{
				label: 'Ayuda',
				submenu: [
					{
						label: 'Open Dev Tools',
						click: (item, win) => { win.openDevTools(); }
					},
					{
						label: 'Documentación',
						click: () => { openExternal('https://github.com/ANG95'); }
					},
					{
						label: 'Acerca de',
						click: () => { openExternal('https://ang95.github.io/ang95_blog/'); }
					}
				]
			}
		],
		usuario: ""
	}

	componentDidMount() {
		let roles = JSON.parse(localStorage.getItem('_userD'));
		if (roles) {
			this.setState({
				allowedRoutes: roles.menus,
				components: roles.components,
				usuario: roles.usuario
			});
		} else {
			history.push('/');
		}
	}

	cierraSesion =  async() => {
		if (window.confirm('¿Esta seguro de salir del sistema?')) {
			await localStorage.removeItem('_userD');
			history.push('/');
		}
	}
	
	ButtonToogle = () => {
		let { slackTemplate } = this.state
		slackTemplate[0].submenu[0].checked = !slackTemplate[0].submenu[0].checked
		this.setState({
			navbarExpland: !this.state.navbarExpland,
			slackTemplate
		}, (
			localStorage.setItem('opcionBtnToogle', this.state.navbarExpland)
		))
	}

	collapseRight = () => {
		this.setState({
			navbarExplandRight: !this.state.navbarExplandRight
		});
	}

	CollapseMenu = (e) => {
		let event = Number(e);
		this.setState({ collapse: this.state.collapse !== event ? event : null });
	}

	render() {
		const { collapse, components, slackTemplate, usuario } = this.state
		return (
			<Fragment>
				<nav>
					<TitleBar
						icon={"https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcQerURiUv2CaFOHL1U52ToInzSSzCOMsI8YiD_L1XlQKlICJcaT&usqp=CAU"}
						app="BOTICA VIRGEN DEL ROSARIO"
						menu={slackTemplate}
						theme={{
							barTheme: 'dark',
							barBackgroundColor: '#007bff',
							barColor: 'rgb(230, 230, 230)',
							menuHighlightColor: '#373277',
							menuDimItems: false,
							showIconDarLin: false
						}}
					/>
				</nav>

				<div className="container-fluid">
					<ToastContainer
						position="bottom-right"
						autoClose={1000}
						hideProgressBar={false}
						newestOnTop={false}
						closeOnClick
						rtl={false}
						pauseOnVisibilityChange
						draggable
						pauseOnHover
					/>
					<div className="row">
						<nav className={JSON.parse(localStorage.getItem('opcionBtnToogle')) ? 'navbarExplandLeft sidebar' : "navbarCollapseLeft sidebar"}>
							<div className="sidebar-sticky">
								<div className="p-2 text-white" style={{ background: "linear-gradient(to right, #36e7ff, #007bff" }}>
									<div className="row">
										<div className="col-4">
											<img src="https://image.flaticon.com/icons/png/512/306/306232.png" alt="perfil" width="70" />
										</div>
										<div className="col-8 text-center">
											<div className="mt-1" style={{ marginBottom: "-12px" }}>
												<div className="h6 font-weight-bold">{usuario}</div>
											</div>
											<div className="icon">Bienvenida(o)</div>
											<div className="row text-center">
												<div className="col-6" style={{ cursor: "pointer" }} title="Configuracion de mi perfil" >
													<NavLink
														to={`${this.props.match.path}/Perfil`}
														className="text-white">
														<MdSettings size={21} />
													</NavLink>
												</div>
												<div className="col-6" title="salir del Sistema" onClick={() => { this.cierraSesion() }} style={{ cursor: "pointer" }}>
													<MdSettingsPower size={21} />
												</div>
											</div>
										</div>
									</div>
								</div>

								<ul className="nav flex-column ull">
									{
										this.state.allowedRoutes.map((menus, index) =>
											<li className="lii" key={index}>
												{
													menus.submenu.length > 0
														?
														<div className="nav-link" style={{ cursor: "pointer" }} onClick={() => this.CollapseMenu(index)} activeclassname="active" >  {menus.titulo_menus} <div className="float-right"> {collapse === index ? <FaChevronUp /> : <FaChevronRight />}</div></div>
														:
														<NavLink
															to={`${this.props.match.path}${menus.url_menus}`}
															activeclassname="nav-link"
															className="nav-link">
															{menus.titulo_menus}
														</NavLink>
												}
												<Collapse isOpen={collapse === index}>
													<ul className="nav flex-column ull ">
														{menus.submenu.map((subMenu, IndexSub) =>
															<li className="lii pl-3" key={IndexSub}>
																<NavLink
																	to={`${this.props.match.path}${subMenu.url_menus}`}
																	activeclassname="nav-link">
																	{subMenu.titulo_menus}
																</NavLink>
															</li>
														)}
													</ul>
												</Collapse>
											</li>
										)
									}
								</ul>
							</div>
						</nav>

						<main role="main" className="col ml-sm-auto col-lg px-0">
							<div className="scroll_contenido">
								<Switch>
									<Route exact path={`${this.props.match.path}/Perfil`} component={Perfil} />
									{components.map((route) =>
										<Route
											exact
											key={route.url_menus}
											component={Routes[route.componente_menus]}
											path={`${this.props.match.path}${route.url_menus}`}
										/>
									)}
									<Route component={NotFound} />
								</Switch>
							</div>
						</main>
					</div>
				</div>
			</Fragment>
		);
	}
}

export default PrivateRoutes;
