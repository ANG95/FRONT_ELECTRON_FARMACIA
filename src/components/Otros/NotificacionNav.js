import React, { Component } from 'react';
import { Popover, PopoverHeader, PopoverBody, Spinner } from 'reactstrap';
import { FaBell } from "react-icons/fa";

class NotificacionNav extends Component {
    constructor(props) {
        super(props);

        this.toggle = this.toggle.bind(this);
        this.clics = this.clics.bind(this)
        this.state = {
            popoverOpen: false,
            clik: false
        };
    }

    toggle() {
        this.setState({
            popoverOpen: !this.state.popoverOpen
        });
    }

    clics() {
        this.setState({
            clik: !this.state.clik
        })
    }

    render() {
        return (
            <div>
                <a href="# " id="notification" onClick={this.toggle} className="nav-link text-white">
                    <FaBell />
                </a>
                <Popover placement="bottom" isOpen={this.state.popoverOpen} target="notification" toggle={this.toggle}  >
                    <PopoverHeader>
                        <div className="d-flex small">
                            <div className="flex-fill pr-5"><b>Notificaciones</b> </div>
                            <div className="flex-fill pr-2">más</div>
                            <div className="flex-fill">Configuración</div>
                        </div>
                    </PopoverHeader>
                    <PopoverBody>
                        <div className={this.state.clik === true ? 'd-none' : ''}>
                            <Spinner />

                        </div>


                        <div className={this.state.clik === true ? '' : 'd-none'}>
                            <img src="https://source.unsplash.com/random" className="img-fluid rounded mx-auto d-block" onClick={this.clics} alt="demo" />
                        </div>
                    </PopoverBody>
                </Popover>
            </div>
        );
    }
}

export default NotificacionNav;