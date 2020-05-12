import React, { Component } from 'react';
import { UncontrolledPopover, PopoverBody } from 'reactstrap';
import { FaPowerOff, FaChevronDown } from "react-icons/fa";
import history from '../../util/history';

class UserNav extends Component {
    state = {
        Datos: {}
    }
    componentDidMount() {
       
        let roles = JSON.parse(localStorage.getItem('_userD'));
        if (roles) {
            // console.log("data  ", roles);
            this.setState({ Datos: roles });
        } else {
            history.push('/')
        }
    }
    cierraSesion = () => {
        if (window.confirm('¿Esta seguro de salir del sistema?')) {
            localStorage.removeItem('_userD');
            history.push('/');
        }
    }

    render() {
        const { Datos } = this.state
        return (
            <div>
                <span id="userLogin" className="mr-1 nav-link text-white" >
                    <label className="text-capitalize font-weight-bold" >{sessionStorage.getItem('cargo')}</label>Hola: {Datos.usuario} <FaChevronDown />   
                </span>

                <UncontrolledPopover trigger="legacy" placement="bottom" target="userLogin">
                    <PopoverBody>
                        {/* <label>Configuración</label>
                        <div className="divider"></div>
                        <label>Contraseña</label>
                        <div className="divider"></div>*/}
                        <label>Contraseña</label> 
                        <div className="divider"></div>
                        <span className="nav-link" onClick={() => this.cierraSesion()}> <FaPowerOff color="red" className="p-0" /> Salir</span>
                    </PopoverBody>
                </UncontrolledPopover>
            </div>
        );
    }
}

export default UserNav;
