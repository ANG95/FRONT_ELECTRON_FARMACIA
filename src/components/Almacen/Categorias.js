import React, { Component, Fragment } from 'react';
import { Card, CardHeader, CardBody, FormGroup, Label, Input, ModalBody, ModalHeader, Modal, Button } from 'reactstrap';
import Axios from 'axios';
import { FaEdit, FaPlusCircle } from "react-icons/fa";
import { debounce } from "../../config/Funciones"
import { toast } from "react-toastify";

class Categorias extends Component {
    state = {
        DataPresentacionAPI: [],
        categoriaSeleccionada: {
            id_presentacion: null,
            nombre_presentacion: "",
            descripcion_presentacion: ""
        },
        modalNuevoEditarCategoria: false
    }

    componentDidMount = () => {
        this.reqPresentacion()
    }

    reqPresentacion = async () => {
        try {
            var row = await Axios.get(`/presentacion`)
            this.setState({ DataPresentacionAPI: row.data })
            // console.log("row presentacion", row.data);
        } catch (error) {
            console.error("errores en obtener los presentacion");
        }
    }

    modalToggle = (key, value) => {
        this.setState({ [key]: value })
    }

    TxtOnchangeCategoria = debounce((key, value) => {
        let { categoriaSeleccionada } = this.state
        // console.log("categoriaSeleccionada ", categoriaSeleccionada[key]);
        // console.log("key: ", key, "value:", value);
        categoriaSeleccionada[key] = value
        this.setState({ categoriaSeleccionada })
    }, 500)

    SeteaCategoriaSeleccionada = categoria => {
        // console.log("categoria", categoria);
        this.setState({
            categoriaSeleccionada: categoria,
            modalNuevoEditarCategoria: true
        })
    }

    GuardarPresentacion = async () => {
        try {
            let { categoriaSeleccionada, DataPresentacionAPI } = this.state
            // console.log("categoriaSeleccionada ", categoriaSeleccionada)
            const i = DataPresentacionAPI.findIndex(p => p.id_presentacion === categoriaSeleccionada.id_presentacion)
            var row = await Axios.post(`/presentacion/actualizainserta`, categoriaSeleccionada)
            // this.setState({ DataPresentacionAPI: row.data })
            console.log("row insertar GuardarPresentacion", row);
            if (row.status === 200) {
                if (i === -1) {
                    categoriaSeleccionada.id_presentacion = row.data.insertId
                    DataPresentacionAPI.unshift(categoriaSeleccionada)
                } else {
                    DataPresentacionAPI[i] = categoriaSeleccionada
                }

                // console.log("insertId ", DataPresentacionAPI);
                this.modalToggle("modalNuevoEditarCategoria", false)
                toast.success('✔ Exito', {
                    position: "top-right",
                    autoClose: 1500
                })
            } else {
                toast.error('❌ No se pudo guardar los datos en el sistema', {
                    position: "top-right",
                    autoClose: 2000
                })
            }

        } catch (error) {
            console.error("errores EN INSERTAR O ACTUALIZAR Presentacion", error);
        }
    }

    render() {
        var { DataPresentacionAPI, categoriaSeleccionada, modalNuevoEditarCategoria } = this.state
        return (
            <Fragment>
                <div className="h4 px-3 shadow-sm p-2 bg-light">CATEGORIAS</div>
                <div className="px-3">
                    <Card>
                        <CardHeader>
                            <div className="float-left"> LISTA DE CATEGORIAS O PRESENTACION</div>
                            <div className="float-right text-primary"
                                style={{ cursor: "pointer" }}
                                onClick={() => this.setState({
                                    categoriaSeleccionada: {
                                        id_presentacion: null,
                                        nombre_presentacion: "",
                                        descripcion_presentacion: ""
                                    },
                                    modalNuevoEditarCategoria: true
                                })}>
                                <FaPlusCircle size={23} />
                            </div>
                        </CardHeader>
                        <CardBody className="p-1">
                            <div style={{ height: "calc(90vh - 92px)", overflowY: "auto" }}>
                                <table className="table table-sm table-bordered table-striped  table-hover">
                                    <thead>
                                        <tr>
                                            <th>N°</th>
                                            <th>NOMBRE</th>
                                            <th>DESCRIPCION</th>
                                            <th className="text-center"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            DataPresentacionAPI.map((pres, IP) =>
                                                <tr key={IP}>
                                                    <td>{IP + 1}</td>
                                                    <td>{pres.nombre_presentacion}</td>
                                                    <td>{pres.descripcion_presentacion}</td>
                                                    <td className="text-center">
                                                        <div className="text-info"
                                                            title="Editar datos del La categoria"
                                                            style={{ cursor: "pointer" }}
                                                            onClick={() => this.SeteaCategoriaSeleccionada(pres)}
                                                        >
                                                            <FaEdit size={20} />
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
                <Modal isOpen={modalNuevoEditarCategoria} toggle={() => this.modalToggle("modalNuevoEditarCategoria", false)} size="sm" backdrop={"static"}>
                    <ModalHeader className="bg-primary text-white" toggle={() => this.modalToggle("modalNuevoEditarCategoria", false)}> REGISTRAR O EDITAR CATEGORIA</ModalHeader>
                    <ModalBody>

                        <FormGroup>
                            <Label className="font-weight-bold">NOMBRE </Label>
                            <Input type="text" name="nombre_presentacion" defaultValue={categoriaSeleccionada.nombre_presentacion} onChange={e => { this.TxtOnchangeCategoria(e.target.name, e.target.value) }} />
                        </FormGroup>

                        <FormGroup>
                            <Label className="font-weight-bold">DESCRIPCION</Label>
                            <Input type="text" name="descripcion_presentacion" defaultValue={categoriaSeleccionada.descripcion_presentacion} onChange={e => { this.TxtOnchangeCategoria(e.target.name, e.target.value) }} />
                        </FormGroup>
                        <Button onClick={() => this.GuardarPresentacion()} >GUARDAR</Button>
                    </ModalBody>
                </Modal>

            </Fragment>
        );
    }
}

export default Categorias;