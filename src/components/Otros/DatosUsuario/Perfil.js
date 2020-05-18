import React, { useState, Fragment } from 'react';
import { InputGroup, InputGroupAddon, Input, Card, CardBody, Button, Form } from 'reactstrap';
import Axios from 'axios';
import { toast } from 'react-toastify';

function Perfil() {
    // Declaración de una variable de estado que llamaremos "count"
    // const [count, setCount] = useState(0);
    const [contraActual, setContraActual] = useState("");
    const [contrasenas, setDataContrasenas] = useState({ contrasena1: '', contrasena2: '' });

    const CaptutaInputs = async (e) => {
        // Similar a this.setState({ fruit: 'orange' })
        // setContraActual(e.target.value);
        contrasenas[e.target.name] = e.target.value
        setDataContrasenas(contrasenas)
        // console.log("contraseñaa", e.target.name, '||', e.target.value);
        // console.log("contrasenas ", contrasenas);
    }

    const ReqVerificarContrasenaActual = async (e) => {
        e.preventDefault();
        try {
            if (contraActual) {
                if (contrasenas.contrasena1 === contrasenas.contrasena2) {
                    // console.log("las contraseñas coinciden");
                    let resContraActual = await Axios.post(`/login/cambiarcontrasena`, {
                        "contraActual": contraActual,
                        "contraNueva": contrasenas.contrasena2
                    })
                    // console.log("resContraActual ffdfdfd", resContraActual);
                    if (resContraActual.status === 200) toast.success("!Contraseña actualizada¡");
                } else {
                    // console.log("las contraseñas ingresadas no son iguales");
                    toast.error("las contraseñas ingresadas no son coinciden")
                }
            } else {
                // console.log("ingrese una contraseña actual valida");
                toast.error("ingrese una contraseña ")
            }
        } catch (error) {
            console.error("errores al verificar la contraseña actual ingresada", error);
            toast.error("Errores en cambiar la contraseña ", error)
        }
    }

    return (
        <Fragment>
            <div className="font-weight-bold mb-2 px-3 shadow-sm p-2 bg-light">CAMBIAR CONTRASEÑA</div>
            <div className="px-1">
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-4">
                            <Card>
                                <CardBody>
                                    <Form onSubmit={e => ReqVerificarContrasenaActual(e)}>
                                    <InputGroup>
                                        <InputGroupAddon addonType="prepend">Contraseña actual</InputGroupAddon>
                                        <Input type="password" name="contraActual" onBlur={e => setContraActual(e.target.value)} />
                                    </InputGroup>
                                    <br />
                                    <InputGroup>
                                        <InputGroupAddon addonType="prepend">Contraseña Nueva</InputGroupAddon>
                                        <Input type="password" name="contrasena1" onBlur={e => CaptutaInputs(e)} />
                                    </InputGroup>
                                    <br />
                                    <InputGroup>
                                        <InputGroupAddon addonType="prepend">Repite la Contraseña </InputGroupAddon>
                                        <Input type="password" name="contrasena2" onBlur={e => CaptutaInputs(e)} />
                                    </InputGroup>
                                    <br />
                                    <Button color="success" type="submit">Actualizar  </Button>
                                    </Form>
                                </CardBody>
                            </Card>
                        </div>
                    </div>
                </div>

                {/* <div>
                    <p>You clicked {count} times</p>
                    <button onClick={() => setCount(count + 1)}>
                        Click me
                    </button>
                </div> */}
            </div>
        </Fragment>

    );
}
export default Perfil;