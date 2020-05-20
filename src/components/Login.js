import React, { Component } from 'react';
import { FormGroup, Label, Button, Input, Form } from 'reactstrap';
import Axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import "../assets/css/login.css"
import history from '../util/history';
import { ApiURL, setAuthToken } from '../config/ApiUrl'

class Login extends Component {
	state = {
		usuario: "",
		contrasena: ""
	};
	
	handleChange = (e) => {
		var { name, value } = e.target
		this.setState({ [name]: value });
	};

	handleClick = async (e) => {
		e.preventDefault()
		try {
			var resLogin = await Axios.post(`${ApiURL}/login/signin`, {
				username: this.state.usuario,
				password: this.state.contrasena
			})
			// console.log("resLogin ", resLogin.data)

			if (resLogin.status === 200) {
				await localStorage.setItem('_userD', JSON.stringify(resLogin.data));
				await setAuthToken(resLogin.data.access_token)
				history.push('/app/Inicio');
			} else {
					toast.error('Usuario o contraseña incorrectos ', {
					position: "top-right",
					autoClose: 2500
				})
			}

		} catch (error) {
			console.error("error en login ", error)
			toast.error('Errores al tratar de ingresar al sistema ' + error, {
				position: "top-right",
				autoClose: 2500
			})
		}
	};

	SalirSistema = async ()=>{
		await localStorage.removeItem('_userD');
		await window.close()
	}

	render() {
		return (
			<div className="d-flex justify-content-center align-items-center fondoLogin" style={{ height: "calc(100vh)" }}>
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
				<div className="card p-4 cardLogin p-5">
					<img src="https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcQerURiUv2CaFOHL1U52ToInzSSzCOMsI8YiD_L1XlQKlICJcaT&usqp=CAU" width="85px"  height="85px" alt="SisWise Logo" className="rounded-circle mx-auto d-block" />
					<h6 className="mt-2 text-center text-white"> BOTICA DEL ROSARIO  </h6>
					<p className="h6 text-center text-white">Iniciar sesión</p>
					<Form className="text-white">
						<FormGroup row>
							<Label for="usuario" >Usuario</Label>
							<Input type="text" autoFocus name="usuario" required={false} placeholder="usuario" onChange={this.handleChange} />
						</FormGroup>
						<FormGroup row>
							<Label for="Contraseña" >Contraseña</Label>
							<Input type="password" name="contrasena" required={false} placeholder="contraseña" onChange={this.handleChange} />
						</FormGroup>
						<div className="d-flex">
							<div className="mr-auto">
								<Button type="submit" outline color="success" size="sm"
									variant="primary"
									onClick={e => this.handleClick(e)}
									disabled={!this.state.contrasena.length}> INGRESAR</Button>
							</div>
							<div className="mr-auto"><Button type="reset" outline color="warning" size="sm"> CANCELAR</Button></div>
							<div><Button outline color="danger" size="sm" onClick={()=>{this.SalirSistema()}}>SALIR </Button></div>
							
						</div>
					</Form>

				</div>
			</div>
		);
	}
}

export default Login;
