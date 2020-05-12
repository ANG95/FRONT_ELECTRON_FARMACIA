import React, { Component, Fragment } from 'react';
import { Card, CardBody, CardHeader, Input, InputGroup, InputGroupAddon, Button, Modal, ModalHeader, ModalBody, Row, Col, FormGroup, Label } from "reactstrap"
import Axios from 'axios';
// import Paginacion from './Paginacion';
import { AiFillPlusCircle } from "react-icons/ai"
import { toast } from 'react-toastify';
import { FaEdit } from "react-icons/fa";

import { debounce } from "../../config/Funciones"

class Proveedores extends Component {
    state = {
        DataProveedoresAPI: { data: [], CantPaginas: [] },
        DataNuevoProveedor: {
            id_proveedor: null,
            nombre_proveedor: "",
            ruc_proveedor: "",
            representante_proveedor: "",
            tipo_proveedor: "",
            tipo_actividad_proveedor: "",
            telefono_proveedor: "",
            celular_proveedor: "",
            correo_electronico_proveedor: "",
            direccion_proveedor: ""
        },
        limit: 1,
        CantidadRows: 10,

        // NUEVO DATOS
        modalAgregaProveedor: false,


    }
    componentDidMount = async () => {
        // try {
        //     var row = await Axios.get(`/proveedores`)
        //     this.setState({ DataProveedoresAPI: row.data })
        //     console.log("row proveedores", row.data);
        // } catch (error) {
        //     console.error("errores EN OBTENER LOS PROVEEDORES");
        // }
        this.reqProductos(this.state.limit, this.state.CantidadRows)
    }

    reqProductos = async (limit, CantidadRows) => {
        try {
            var row = await Axios.post(`/proveedores`, { limit, CantidadRows })
            this.setState({ DataProveedoresAPI: row.data })
            console.log("row proveedores", row.data);
        } catch (error) {
            console.error("errores EN OBTENER LOS PROVEEDORES");
        }
    }

    modal = (key, value) => {
        this.setState({ [key]: value })
    }

    TxtRegistrarProveedor = debounce((key, value) => {
        let { DataNuevoProveedor } = this.state
        // console.log("DataNuevoProveedor ", DataNuevoProveedor[key]);
        // console.log("key: ", key, "value:", value);
        DataNuevoProveedor[key] = value
        this.setState({ DataNuevoProveedor })
    }, 500)

    GuardarNuevoProveedor = async () => {
        try {
            let { DataNuevoProveedor, DataProveedoresAPI } = this.state
            // console.log("DataNuevoProveedor ", DataNuevoProveedor)
            const i = DataProveedoresAPI.data.findIndex(p => p.id_proveedor === DataNuevoProveedor.id_proveedor)
            var row = await Axios.post(`/proveedores/insertar`, DataNuevoProveedor)
            // this.setState({ DataProveedoresAPI: row.data })
            // console.log("row insertar proveedor", row.data);
            if (row.status === 200) {
                if (i === -1) {
                    DataNuevoProveedor.id_proveedor = row.data.insertId
                    DataProveedoresAPI.data.unshift(DataNuevoProveedor)
                } else {
                    DataProveedoresAPI.data[i] = DataNuevoProveedor
                }

                // console.log("insertId ", DataProveedoresAPI);
                this.modal("modalAgregaProveedor", false)
                toast.success('✔ Exito', {
                    position: "top-right",
                    autoClose: 2000
                })
            } else {
                toast.error('❌ No se pudo guardar los datos en el sistema', {
                    position: "top-right",
                    autoClose: 2000
                })
            }

        } catch (error) {
            console.error("errores EN OBTENER LOS PROVEEDORES", error);
        }
    }

    ActualizarEditar = async (proveedor) => {
        // console.log("prov ", proveedor);
        this.setState({ DataNuevoProveedor: proveedor, modalAgregaProveedor: true })
    }

    render() {
        const { DataProveedoresAPI, modalAgregaProveedor, DataNuevoProveedor } = this.state
        return (
            <Fragment>
                {
                    // <Paginacion />
                }
                <div className="h4 px-3 shadow-sm p-2 bg-light">PROVEEDORES </div>
                <div className="px-3">
                    <Card>
                        <CardHeader className="clear-fix">
                            <div className="float-left h5">LISTA DE PROVEEDORES </div>
                            <div className="float-right">
                                <InputGroup size="sm" className="mb-2" >
                                    <Input placeholder="buscar proveedor" onBlur={this.BuscarCliente} />
                                    <InputGroupAddon addonType="prepend">
                                        <Button className="p-0"
                                            onClick={() => this.setState({
                                                modalAgregaProveedor: true,
                                                DataNuevoProveedor: {
                                                    id_proveedor: null,
                                                    nombre_proveedor: "",
                                                    ruc_proveedor: "",
                                                    representante_proveedor: "",
                                                    tipo_proveedor: "",
                                                    tipo_actividad_proveedor: "",
                                                    telefono_proveedor: "",
                                                    celular_proveedor: "",
                                                    correo_electronico_proveedor: "",
                                                    direccion_proveedor: ""
                                                },
                                            })}
                                            title="Regisrar nuevo proveedor">
                                            <AiFillPlusCircle size={25} />
                                        </Button>
                                    </InputGroupAddon>
                                </InputGroup>
                            </div>
                        </CardHeader>
                        <div className="table-responsive">
                            <CardBody className="p-2">
                                <table className="table table-sm table-bordered table-striped  table-hover">
                                    <thead>
                                        <tr>
                                            <th className="align-self-center">NOMBRE</th>
                                            <th className="text-center">RUC</th>
                                            <th>REPRESENTANTE</th>
                                            <th>TIPO</th>
                                            <th>ACTIVIDAD</th>
                                            <th>TELEFONO</th>
                                            <th>CELULAR</th>
                                            <th>EMAIL</th>
                                            <th>DIRECCION</th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            DataProveedoresAPI.data.map((prov, i) =>
                                                <tr key={i}>
                                                    <td>{prov.nombre_proveedor}</td>
                                                    <td>{prov.ruc_proveedor}</td>
                                                    <td>{prov.representante_proveedor}</td>
                                                    <td>{prov.tipo_proveedor}</td>
                                                    <td>{prov.tipo_actividad_proveedor}</td>
                                                    <td>{prov.telefono_proveedor}</td>
                                                    <td>{prov.celular_proveedor}</td>
                                                    <td>{prov.correo_electronico_proveedor}</td>
                                                    <td>{prov.direccion_proveedor}</td>
                                                    <td>
                                                        <div className="text-info"
                                                            title="Editar datos del proveedor"
                                                            style={{ cursor: "pointer" }}
                                                            onClick={() => this.ActualizarEditar(prov)}
                                                        >
                                                            <FaEdit size={20} />
                                                        </div>
                                                    </td>
                                                </tr>
                                            )
                                        }

                                    </tbody>
                                </table>
                                {
                                    // <div className="float-left">
                                    //     <Input type="select" bsSize="sm" onChange={e => this.Pagina(`1`, e.target.value)}>
                                    //         <option value="10">10</option>
                                    //         <option value="20">20</option>
                                    //         <option value="50">50</option>
                                    //         <option value="100">100</option>
                                    //     </Input>
                                    // </div>
                                    // <div className="float-right">
                                    //     <Pagination aria-label="Page navigation example">
                                    //         <PaginationItem>
                                    //             <PaginationLink first href="#" />
                                    //         </PaginationItem>
                                    //         <PaginationItem>
                                    //             <PaginationLink previous href="#" />
                                    //         </PaginationItem>
                                    //         {
                                    //             DataProveedoresAPI.CantPaginas.map(pag =>
                                    //                 <PaginationItem key={pag}>
                                    //                     <PaginationLink href="#" onClick={() => this.Pagina(`${pag}0`, 10)}>
                                    //                         {pag}
                                    //                     </PaginationLink>
                                    //                 </PaginationItem>
                                    //             )
                                    //         }



                                    //         <PaginationItem>
                                    //             <PaginationLink next href="#" />
                                    //         </PaginationItem>
                                    //         <PaginationItem>
                                    //             <PaginationLink last href="#" />
                                    //         </PaginationItem>
                                    //     </Pagination>
                                    // </div>

                                }
                            </CardBody>
                        </div>
                    </Card>
                </div>

                <Modal isOpen={modalAgregaProveedor} toggle={() => this.modal("modalAgregaProveedor", false)} size="lg">
                    <ModalHeader toggle={() => this.modal("modalAgregaProveedor", false)} className="bg-primary text-white">AGREGAR / EDITAR PROVEEDOR</ModalHeader>
                    <ModalBody>
                        <FormGroup>
                            <Label className="font-weight-bold">Nombre</Label>
                            <Input type="text" name="nombre_proveedor" defaultValue={DataNuevoProveedor.nombre_proveedor} onChange={e => { this.TxtRegistrarProveedor(e.target.name, e.target.value) }} />
                        </FormGroup>
                        <Row>
                            <Col sm={6}>
                                <FormGroup>
                                    <Label className="font-weight-bold">RUC</Label>
                                    <Input type="text" name="ruc_proveedor" defaultValue={DataNuevoProveedor.ruc_proveedor} onChange={e => { this.TxtRegistrarProveedor(e.target.name, e.target.value) }} />
                                </FormGroup>
                                <FormGroup>
                                    <Label className="font-weight-bold">REPRESENTANTE</Label>
                                    <Input type="text" name="representante_proveedor" defaultValue={DataNuevoProveedor.representante_proveedor} onChange={e => { this.TxtRegistrarProveedor(e.target.name, e.target.value) }} />
                                </FormGroup>
                                <FormGroup>
                                    <Label className="font-weight-bold">TIPO</Label>
                                    <Input type="text" name="tipo_proveedor" defaultValue={DataNuevoProveedor.tipo_proveedor} placeholder="S.A.C." onChange={e => { this.TxtRegistrarProveedor(e.target.name, e.target.value) }} />
                                </FormGroup>
                                <FormGroup>
                                    <Label className="font-weight-bold">TIPO ACTIVIDAD</Label>
                                    <Input type="text" name="tipo_actividad_proveedor" defaultValue={DataNuevoProveedor.tipo_actividad_proveedor} onChange={e => { this.TxtRegistrarProveedor(e.target.name, e.target.value) }} />
                                </FormGroup>
                            </Col>
                            <Col sm={6}>
                                <FormGroup>
                                    <Label className="font-weight-bold">TELEFONO</Label>
                                    <Input type="text" name="telefono_proveedor" defaultValue={DataNuevoProveedor.telefono_proveedor} onChange={e => { this.TxtRegistrarProveedor(e.target.name, e.target.value) }} />
                                </FormGroup>
                                <FormGroup>
                                    <Label className="font-weight-bold">CELULAR</Label>
                                    <Input type="text" name="celular_proveedor" defaultValue={DataNuevoProveedor.celular_proveedor} onChange={e => { this.TxtRegistrarProveedor(e.target.name, e.target.value) }} />
                                </FormGroup>
                                <FormGroup>
                                    <Label className="font-weight-bold">CORREO ELECTRONICO</Label>
                                    <Input type="email" name="correo_electronico_proveedor" defaultValue={DataNuevoProveedor.correo_electronico_proveedor} onChange={e => { this.TxtRegistrarProveedor(e.target.name, e.target.value) }} />
                                </FormGroup>
                                <FormGroup>
                                    <Label className="font-weight-bold">DIRECCIÓN</Label>
                                    <Input type="text" name="direccion_proveedor" defaultValue={DataNuevoProveedor.direccion_proveedor} onChange={e => { this.TxtRegistrarProveedor(e.target.name, e.target.value) }} />
                                </FormGroup>
                            </Col>
                        </Row>
                        <div className="float-right">
                            <Button size="sm" color="success" onClick={() => this.GuardarNuevoProveedor()}>Guardar</Button>
                        </div>
                    </ModalBody>
                </Modal>
            </Fragment>
        );
    }
}

export default Proveedores;