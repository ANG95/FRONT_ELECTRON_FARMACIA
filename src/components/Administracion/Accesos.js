import React, { Component, Fragment } from 'react';
import { Card, CardHeader, CardBody, CustomInput, Modal, ModalHeader, ModalBody, Button, FormGroup, Label, Input, Row, Col } from 'reactstrap';
import Axios from 'axios';
import { toast } from 'react-toastify';
import { FaUserEdit, FaUserShield, FaPlusCircle } from "react-icons/fa";
import { debounce } from "../../config/Funciones"


class Accesos extends Component {
    state = {
        DataUsuariosAPI: [],
        DataMenusAPI: [],
        rolesUserIdAPI: [],
        UsuarioSeleccionado: {
            id_usuario: null,
            nombre_usuario: "",
            apaterno_usuario: "",
            amaterno_usuario: "",
            dni_usuario: "",
            colegiatura_usuario: "",
            id_login: null,
            user_login: "",
            status_login: 1,
            pass_login: "",
            intentos_login: 0,
            tb_usuarios_id_usuario: null
        },
        id_login: "",
        // checked: [],
        modalEditarAccesos: false,
        modalAgregarEditarUsuario: false
    }

    componentDidMount = async () => {
        this.reqUsuarios()
        // this.reqMenus()
    }

    reqUsuarios = async () => {
        try {
            var row = await Axios.get(`/usuarios`)
            this.setState({ DataUsuariosAPI: row.data })
            console.log("row Usuarios", row.data);
        } catch (error) {
            console.error("errores en obtener Usuarios", error);
        }
    }

    reqMenus = async () => {
        try {
            var menus = await Axios.get(`/menus/`)

            this.setState({ DataMenusAPI: menus.data })
            console.log("menus ", menus.data);
            // console.log("DataTree ", DataTree);
        } catch (error) {
            console.error("errores en obtener menus", error);
        }
    }

    ActualizaStatus = async (e, i) => {
        let { DataUsuariosAPI } = this.state
        DataUsuariosAPI[i].status_login = e.target.value === "1" ? 0 : 1
        // console.log("ActualizaStatus  ", (+e.target.value));
        try {
            await Axios.put(`/login/actualizarstatus`, {
                "id": DataUsuariosAPI[i].id_usuario,
                "status": DataUsuariosAPI[i].status_login
            })
            // this.setState({ DataUsuariosAPI: row.data })
            // console.log("crear login ", row);
            console.log("DataUsuariosAPI[i] ", DataUsuariosAPI[i]);
        } catch (error) {
            console.error("errores en obtener Usuarios", error);
            toast.error('❌ Errores al actualizar el estado del usuario', {
                position: "top-right",
                autoClose: 2000
            })
        }

        this.setState({ DataUsuariosAPI }, () => console.log("DataUsuariosAPI", DataUsuariosAPI))
    }

    toggleModal = async (name, valor) => {
        this.setState({ [name]: valor })
    }

    reqAccesosRoles = async ({ id_login }) => {
        // console.log("id_login ", id_login);
        this.setState({ id_login:id_login })

        await this.reqMenus()
        await this.toggleModal("modalEditarAccesos", true)

        try {
            var { DataMenusAPI } = this.state
            var RolesID = await Axios.post(`/roles/id`, { "id_user_Login": id_login })
            
            var rowRolesID = RolesID.data
            
            rowRolesID.forEach(mPri => {
                var indexRowID = DataMenusAPI.findIndex(d =>  d.id_menus === mPri.id_menus)
                DataMenusAPI[indexRowID].status = true
                Object.assign(DataMenusAPI[indexRowID], { "id_rol": mPri.id_roles })
                mPri.submenu.forEach(mPriE => {
                    var indexRowIDE =  DataMenusAPI[indexRowID].submenu.findIndex(e => mPriE.id_menus === e.id_menus)
                    DataMenusAPI[indexRowID].submenu[indexRowIDE].status = true
                    Object.assign(DataMenusAPI[indexRowID].submenu[indexRowIDE], { "id_rol": mPriE.id_roles })

                    // console.log( DataMenusAPI[indexRowID].submenu[indexRowIDE]);
                })
            })

            // console.log("DataMenusAPI ", DataMenusAPI);
            this.setState({ DataMenusAPI })
            // this.setState({ checked: MenusFusionados, id_login, rolesUserIdAPI: RolesID.data })

        } catch (error) {
            console.error("errores en obtener roles user selectid", error);
        }
    }

    GuardarRoles = async () => {
        try {
            var { DataMenusAPI, id_login } = this.state
            console.log("id_login ", id_login);
            var NuevosAccesso = []
            var datosEliminar = []
            console.log("DataMenusAPI ", DataMenusAPI);
            DataMenusAPI.forEach(mA => {
                if (mA.status === true) {
                    NuevosAccesso.push([mA.id_rol || null, id_login, mA.id_menus])
                } else {
                    if (mA.id_rol) {
                        // console.log("id_rol ", mA.id_rol);
                        datosEliminar.push([mA.id_rol])
                    }
                }
                mA.submenu.forEach(mB => {
                    if (mB.status === true) {
                        NuevosAccesso.push([mB.id_rol || null, id_login, mB.id_menus])
                    } else {
                        if (mB.id_rol) {
                            // console.log("id_rol ", mB.id_rol);
                            datosEliminar.push([mB.id_rol])
                        }
                    }

                });
            });
            // console.log("GuardarRoles ");

            // console.log("datosEliminar ", datosEliminar);
            if (datosEliminar.length > 0) {
                await Axios.delete(`/roles/eliminar`, { data: datosEliminar })
                // console.log("datosEliminados>", datosEliminados);  
            }

            // console.log("NuevosAccesso ", NuevosAccesso);
            var InsertUpdateRoles = await Axios.post(`/roles/insertaractualizar`, NuevosAccesso)
            if (InsertUpdateRoles.status === 200) {
                toast.success('✔ Cambio realizados', {
                    position: "top-right",
                    autoClose: 2000
                })
                this.toggleModal("modalEditarAccesos", false)
                // localStorage.removeItem('_userD');
                // history.push('/');
            } else {
                toast.error('❌ Errores al asignar los accesos', {
                    position: "top-right",
                    autoClose: 3500
                })
            }
            console.log("InsertUpdateRoles", InsertUpdateRoles);
        } catch (error) {

        }
    }

    CapturarInputA = (i) => {
        var { DataMenusAPI } = this.state
        DataMenusAPI[i].status = !DataMenusAPI[i].status
        this.setState({ DataMenusAPI })
    }

    CapturarInputB = (a, b) => {
        var { DataMenusAPI } = this.state
        DataMenusAPI[a].submenu[b].status = !DataMenusAPI[a].submenu[b].status
        this.setState({ DataMenusAPI })
    }

    SeleccionaUsuario = (usuario) => {
        // console.log("UsuarioSeleccionado ", usuario);
        this.setState({
            modalAgregarEditarUsuario: true,
            UsuarioSeleccionado: usuario
        })
    }

    TxtOnchageAcceso = debounce((key, value) => {
        let { UsuarioSeleccionado } = this.state
        // console.log("DataNuevoProducto ", DataNuevoProducto[key]);
        console.log("key: ", key, "value:", value);
        UsuarioSeleccionado[key] = value
        this.setState({ UsuarioSeleccionado })
    }, 0)


    GuardarActualizar = async () => {
        let { UsuarioSeleccionado } = this.state
        console.log("UsuarioSeleccionado", UsuarioSeleccionado);
        try {
            var row = await Axios.post(`/login/actualizainserta`, UsuarioSeleccionado)
            console.log("row actualizainserta", row);
        } catch (error) {
            console.error("errores en obtener actualizainserta", error);
        }
    }

    render() {
        let { DataUsuariosAPI, modalEditarAccesos, DataMenusAPI, modalAgregarEditarUsuario, UsuarioSeleccionado } = this.state
        return (
            <Fragment>
                <div className="h4 px-3 shadow-sm p-2 bg-light">USUARIOS Y  ACCESOS</div>
                <div className="px-3">
                    <Card>
                        <CardHeader>
                            <div className="float-left"> USUARIOS</div>
                            <div className="float-right text-primary"
                                style={{ cursor: "pointer" }}
                                title="AGREGAR NUEVO ACCESO"
                                onClick={() => this.setState({
                                    modalAgregarEditarUsuario: true,
                                    UsuarioSeleccionado: {
                                        id_usuario: null,
                                        nombre_usuario: "",
                                        apaterno_usuario: "",
                                        amaterno_usuario: "",
                                        dni_usuario: "",
                                        colegiatura_usuario: "",
                                        id_login: null,
                                        user_login: "",
                                        status_login: 1,
                                        pass_login: "",
                                        intentos_login: 0,
                                        tb_usuarios_id_usuario: null
                                    }
                                })}>
                                <FaPlusCircle size={23} />
                            </div>
                        </CardHeader>
                        <CardBody className="p-1">
                            <div style={{ height: "calc(90vh - 92px)", overflowY: "auto" }}>
                                <table className="table table-sm table-bordered table-striped  table-hover">
                                    <thead className="text-center">
                                        <tr>
                                            <th>NOMBRE</th>
                                            <th>APELLIDOS</th>
                                            <th>DNI</th>
                                            <th style={{ borderRight: "2px dashed #d2d2d2" }}>COLEG.</th>
                                            <th>USUARIO</th>
                                            <th>ESTADO</th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            DataUsuariosAPI.map((user, iu) =>
                                                <tr key={iu}>
                                                    <td>{user.nombre_usuario}</td>
                                                    <td>{`${user.apaterno_usuario} ${user.amaterno_usuario}`}</td>
                                                    <td>{user.dni_usuario}</td>
                                                    <td style={{ borderRight: "2px dashed #d2d2d2" }}>{user.colegiatura_usuario}</td>
                                                    <td>{user.user_login}</td>
                                                    <td className="text-center">
                                                        <CustomInput type="switch" name="ejemplo" id={`${user.dni_usuario}${iu}`} value={user.status_login} checked={user.status_login} onChange={e => this.ActualizaStatus(e, iu)} />
                                                    </td>
                                                    <td className="text-center">
                                                        <div style={{ display: "inline-flex" }}>
                                                            <div
                                                                title="Editar accesos"
                                                                className="text-success p-0 mr-2"
                                                                style={{
                                                                    cursor: "pointer"
                                                                }}
                                                                onClick={() => this.reqAccesosRoles(user)}>
                                                                <FaUserShield size={20} />
                                                            </div>

                                                            <div
                                                                title="Editar Datos del usuario"
                                                                className="text-info p-0"
                                                                style={{
                                                                    cursor: "pointer"
                                                                }}
                                                                onClick={() => this.SeleccionaUsuario(user)}>
                                                                <FaUserEdit size={20} />
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )
                                        }
                                    </tbody>
                                </table>

                            </div>
                        </CardBody>

                    </Card>
                </div>

                <Modal isOpen={modalEditarAccesos} toggle={() => this.toggleModal("modalEditarAccesos", false)}>
                    <ModalHeader toggle={() => this.toggleModal("modalEditarAccesos", false)} className="bg-primary text-white">PRIVILEGIOS</ModalHeader>
                    <ModalBody className="p-0">
                        <Card>
                            <CardBody>
                                <ul style={{ listStyle: "none" }}>
                                    {
                                        DataMenusAPI.map((menuI, i) =>
                                            <Fragment key={i * 4}>
                                                <li>
                                                    <CustomInput
                                                        type="checkbox"
                                                        className="font-weight-bold"
                                                        id={menuI.titulo_menus || ""}
                                                        label={menuI.titulo_menus || ""}
                                                        checked={menuI.status || false}
                                                        value={menuI.titulo_menus || ""}
                                                        onChange={() => this.CapturarInputA(i)}
                                                    />
                                                </li>
                                                <ul style={{ listStyle: "none" }}>
                                                    {
                                                        menuI.submenu.map((menuF, F) =>
                                                            <li key={F * 4}>
                                                                <CustomInput
                                                                    type="checkbox"
                                                                    id={menuF.titulo_menus || ""}
                                                                    label={menuF.titulo_menus || ""}
                                                                    checked={menuF.status || false}
                                                                    value={menuF.titulo_menus || ""}
                                                                    onChange={() => this.CapturarInputB(i, F)}
                                                                />
                                                            </li>
                                                        )
                                                    }

                                                </ul>
                                            </Fragment>
                                        )
                                    }
                                </ul>
                                <div className="float-right">
                                    <Button color="success" size="sm" onClick={this.GuardarRoles}>GUARDAR </Button>
                                </div>
                            </CardBody>
                        </Card>
                    </ModalBody>
                </Modal>

                <Modal isOpen={modalAgregarEditarUsuario} toggle={() => this.toggleModal("modalAgregarEditarUsuario", false)}>
                    <ModalHeader toggle={() => this.toggleModal("modalAgregarEditarUsuario", false)} className="bg-primary text-white">EDITAR O AGREGAR USUARIO</ModalHeader>
                    <ModalBody className="p-0">
                        <fieldset>
                            <legend>DATOS DEL USUARIO</legend>
                            <Row form>
                                <Col md={4}>
                                    <FormGroup>
                                        <Label className="font-weight-bold">NOMBRE</Label>
                                        <Input type="text" name="nombre_usuario" defaultValue={UsuarioSeleccionado.nombre_usuario} onChange={e => { this.TxtOnchageAcceso(e.target.name, e.target.value) }} />
                                    </FormGroup>
                                </Col>
                                <Col md={4}>
                                    <FormGroup>
                                        <Label className="font-weight-bold">AP. PATERNO</Label>
                                        <Input type="text" name="apaterno_usuario" defaultValue={UsuarioSeleccionado.apaterno_usuario} onChange={e => { this.TxtOnchageAcceso(e.target.name, e.target.value) }} />
                                    </FormGroup>
                                </Col>
                                <Col md={4}>
                                    <FormGroup>
                                        <Label className="font-weight-bold">AP. MATERNO</Label>
                                        <Input type="text" name="amaterno_usuario" defaultValue={UsuarioSeleccionado.amaterno_usuario} onChange={e => { this.TxtOnchageAcceso(e.target.name, e.target.value) }} />
                                    </FormGroup>
                                </Col>
                            </Row>
                            <Row form>
                                <Col md={7}>
                                    <FormGroup>
                                        <Label className="font-weight-bold">DNI</Label>
                                        <Input type="text" name="dni_usuario" defaultValue={UsuarioSeleccionado.dni_usuario} onChange={e => { this.TxtOnchageAcceso(e.target.name, e.target.value) }} />
                                    </FormGroup>
                                </Col>
                                <Col md={5}>
                                    <FormGroup>
                                        <Label className="font-weight-bold">COLEGIATURA</Label>
                                        <Input type="text" name="colegiatura_usuario" defaultValue={UsuarioSeleccionado.colegiatura_usuario} onChange={e => { this.TxtOnchageAcceso(e.target.name, e.target.value) }} />
                                    </FormGroup>
                                </Col>
                            </Row>

                        </fieldset>

                        <fieldset>
                            <legend>DATOS DEL ACCESOS (Login)</legend>
                            <Row form>
                                <Col md={5}>
                                    <FormGroup>
                                        <Label className="font-weight-bold">USUARIO (nick)</Label>
                                        <Input type="text" name="user_login" disabled={UsuarioSeleccionado.id_login === null ? false : true} defaultValue={UsuarioSeleccionado.user_login} onChange={e => { this.TxtOnchageAcceso(e.target.name, e.target.value) }} />
                                    </FormGroup>
                                </Col>
                                <Col md={5}>
                                    <FormGroup>
                                        <Label className="font-weight-bold">CONTRASEÑA</Label>
                                        <Input type="text" name="pass_login" disabled={UsuarioSeleccionado.id_login === null ? false : true} defaultValue={UsuarioSeleccionado.pass_login} onChange={e => { this.TxtOnchageAcceso(e.target.name, e.target.value) }} />
                                    </FormGroup>
                                </Col>
                                <Col md={2}>
                                <FormGroup>
                                    <Label className="font-weight-bold">ESTADO</Label>
                                    <CustomInput type="switch" disabled={UsuarioSeleccionado.id_login === null ? false : true} name="status_login" value={UsuarioSeleccionado.status_login.toString() === "1" ? "0" : "1"} checked={+UsuarioSeleccionado.status_login} id="status_lote" onChange={e => { this.TxtOnchageAcceso(e.target.name, e.target.value) }} />
                                </FormGroup>
                            </Col>
                            </Row>
                        </fieldset>

                        <Button color="success" className="mx-3 mb-3" onClick={() => this.GuardarActualizar()}>GUARDAR</Button>
                    </ModalBody>
                </Modal>
            </Fragment>
        );
    }
}

export default Accesos;