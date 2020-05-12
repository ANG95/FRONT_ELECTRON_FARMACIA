import React, { Component, Fragment } from 'react';
import { Card, CardHeader, CardBody, Button, Modal, ModalHeader, ModalBody, FormGroup, Label, Input, CustomInput } from 'reactstrap';
import { FaEdit, FaPlusCircle } from "react-icons/fa";
import Axios from 'axios';
// import Picky from "react-picky";
import { toast } from "react-toastify";
import Select from 'react-select';

import { debounce } from "../../config/Funciones"

class Productos extends Component {
    state = {
        // DataLotesAPI: [],
        DataProductosAPI: [],
        DataPresentacionAPI: [],
        presentacionSeleccionado: {},
        ProductoSeleccionado: {
            "id_producto": null,
            "nomb_comercial_producto": "",
            "nomb_generico_producto": "",
            "unidad_medida_producto": "",
            "concentracion_producto": "",
            "status_producto": 1,
            "tb_login_id_login": null,
            "tb_presentacion_id_presentacion": null
        },
        modalNuevoLote: false
    }

    componentDidMount = async () => {
        // this.reqLotes()
        await this.reqPresentacion()
        this.reqProductos()
    }

    reqProductos = async () => {
        try {
            var row = await Axios.post(`/productos/todos`)
            // 
            row.data.forEach(data => {
                var iPresentacion = this.state.DataPresentacionAPI.findIndex(p => p.id_presentacion === data.tb_presentacion_id_presentacion)
                // console.log("iPresentacion ", iPresentacion);
                if (iPresentacion !== -1) {
                    Object.assign(data, this.state.DataPresentacionAPI[iPresentacion])
                }
            });
            // console.log("row DataProductosAPI", row.data);
            this.setState({ DataProductosAPI: row.data })
        } catch (error) {
            console.error("errores en obtener los reqProductos");
        }
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

    AbrirModalAgregarLote = () => {
        this.setState({
            modalNuevoLote: true,
            ProductoSeleccionado: {
                "id_producto": null,
                "nomb_comercial_producto": "",
                "nomb_generico_producto": "",
                "unidad_medida_producto": "",
                "concentracion_producto": "",
                "status_producto": 1,
                "tb_login_id_login": null,
                "tb_presentacion_id_presentacion": null
            },
            presentacionSeleccionado: {},
        })
    }

    TxtRegistrarProducto = debounce((key, value) => {
        let { ProductoSeleccionado } = this.state
        // console.log("ProductoSeleccionado ", ProductoSeleccionado[key]);
        // console.log("key: ", key, "value:", value);
        ProductoSeleccionado[key] = value
        this.setState({ ProductoSeleccionado })
    }, 0)

    AgregarEditarProducto = async () => {
        try {
            var { ProductoSeleccionado, presentacionSeleccionado, DataProductosAPI } = this.state
            // console.log(presentacionSeleccionado, ProductoSeleccionado);
            ProductoSeleccionado.tb_presentacion_id_presentacion = presentacionSeleccionado.id_presentacion
            // ProductoSeleccionado.tb_productos_id_producto = ProductoSeleccionado.id_producto
            // console.log("ProductoSeleccionado ", ProductoSeleccionado);
            var row = await Axios.post(`/productos/agregareditar`, ProductoSeleccionado)
            if (row.status === 200) {
                this.setState({ modalNuevoLote: false })

                if (ProductoSeleccionado.id_producto === null) {
                    DataProductosAPI.unshift(ProductoSeleccionado)
                    this.setState({ DataProductosAPI })
                }
                toast.success("✔ Exito!!", { position: "top-right" })
            } else {
                toast.error("❌ error!", { position: "top-right" })

            }
            // console.log("row AgregarEditarProducto", row);
        } catch (error) {
            console.error("errores en obtener al AgregarEditarProducto");
            toast.error("❌ error!", { position: "top-right" })

        }

    }

    EditarProducto = async (producto, i) => {
        let { DataPresentacionAPI } = this.state
        var IndexPresent = DataPresentacionAPI.findIndex(p => p.id_presentacion === producto.tb_presentacion_id_presentacion)
        // console.log("DataproductosAPI >", DataproductosAPI[iproducto]);
        // console.log("producto ", productos);
        this.setState({
            modalNuevoLote: true,
            ProductoSeleccionado: Object.assign(producto, { "index": i }),
            CondicionAgregarEditar: false,
            presentacionSeleccionado: DataPresentacionAPI[IndexPresent]
        })
    }

    actualizarEstadoProducto = async (i, key, value) => {
        // console.log("value", i, key, value);
        try {
            var { DataProductosAPI } = this.state
            DataProductosAPI[i].status_producto = value.toString() === "1" ? "0" : "1"
            var row = await Axios.post(`/productos/agregareditar`, DataProductosAPI[i])
            if (row.status === 200) {
                this.setState({ DataProductosAPI })
                toast.success("✔ Exito!!", { position: "top-right" })
            } else {
                toast.error("❌ error!", { position: "top-right" })
            }
            // console.log("row AgregarEditarProducto", row);
        } catch (error) {
            console.error("errores en obtener al AgregarEditarProducto");
            toast.error("❌ error!", { position: "top-right" })

        }
    }

    SeleccionarCategoria = e => {
        var { ProductoSeleccionado, DataProductosAPI } = this.state
        if (ProductoSeleccionado.id_producto) {
            DataProductosAPI[ProductoSeleccionado.index].nombre_presentacion = e.nombre_presentacion
        }
       // console.log("ProductoSeleccionado",ProductoSeleccionado);

        this.setState({ presentacionSeleccionado: e, DataProductosAPI })

    }

    customFilterCategorias = (option, searchText) => {
        if (
            option.data.nombre_presentacion.toLowerCase().includes(searchText.toLowerCase())) {
            return true;
        } else {
            return false;
        }
    };

    render() {
        const { modalNuevoLote, ProductoSeleccionado, DataProductosAPI, DataPresentacionAPI, presentacionSeleccionado } = this.state
        return (
            <Fragment>
                <div className="h4 px-3 shadow-sm p-2 bg-light">LISTADO DE PRODUCTOS</div>
                <div className="px-3">
                    <Card>
                        <CardHeader>
                            <div className="float-left"> PRODUCTOS</div>
                            <div className="float-right text-primary"
                                style={{ cursor: "pointer" }}
                                title="AGREGAR NUEVO LOTE"
                                onClick={() => this.AbrirModalAgregarLote()}>
                                <FaPlusCircle size={23} />
                            </div>
                        </CardHeader>
                        <CardBody className="p-1">
                            <div style={{ height: "calc(90vh - 92px)", overflowY: "auto" }}>
                                <table className="table table-sm table-bordered table-striped  table-hover">
                                    <thead>
                                        <tr>
                                            <th>NOMBRE COMERCIAL</th>
                                            <th>NOMBRE GENERICO</th>
                                            <th>CONCENTRACION</th>
                                            <th>PRESENTACION</th>
                                            <th className="text-center">ESTADO</th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            DataProductosAPI.map((producto, l) =>
                                                <tr key={l}>
                                                    <td>{producto.nomb_comercial_producto}</td>
                                                    <td>{producto.nomb_generico_producto}</td>
                                                    <td>{producto.concentracion_producto}</td>
                                                    <td>{producto.nombre_presentacion}</td>
                                                    <td className="text-center">
                                                        <CustomInput
                                                            type="switch"
                                                            name="status_producto"
                                                            value={producto.status_producto.toString()}
                                                            checked={+producto.status_producto}
                                                            id={"status_producto" + l}
                                                            onChange={e => { this.actualizarEstadoProducto(l, e.target.name, e.target.value) }}
                                                        />
                                                    </td>
                                                    <td className="text-center">
                                                        <div className="text-info"
                                                            title="Editar datos del producto"
                                                            style={{ cursor: "pointer" }}
                                                            onClick={() => this.EditarProducto(producto, l)}>
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
                <Modal isOpen={modalNuevoLote} toggle={() => this.modalToggle("modalNuevoLote", false)} size="sm" backdrop={"static"}>
                    <ModalHeader className="bg-primary text-white" toggle={() => this.modalToggle("modalNuevoLote", false)}> DATOS DEL PRODUCTO</ModalHeader>
                    <ModalBody>
                        <FormGroup>
                            <Label className="font-weight-bold">NOMBRE COMERCIAL</Label>
                            <Input type="text" name="nomb_comercial_producto" value={ProductoSeleccionado.nomb_comercial_producto} onChange={e => { this.TxtRegistrarProducto(e.target.name, e.target.value) }} />
                        </FormGroup>

                        <FormGroup>
                            <Label className="font-weight-bold">NOMBRE GENERICO</Label>
                            <Input type="text" name="nomb_generico_producto" value={ProductoSeleccionado.nomb_generico_producto} onChange={e => { this.TxtRegistrarProducto(e.target.name, e.target.value) }} />
                        </FormGroup>

                        <FormGroup>
                            <Label className="font-weight-bold">CONCENTRACION</Label>
                            <Input type="text" name="concentracion_producto" value={ProductoSeleccionado.concentracion_producto} onChange={e => { this.TxtRegistrarProducto(e.target.name, e.target.value) }} />
                        </FormGroup>
                        <FormGroup>
                            <Label className="font-weight-bold">PRESENTACION O CATEGORIA</Label>

                            <Select
                                defaultValue={presentacionSeleccionado}
                                onChange={this.SeleccionarCategoria}
                                getOptionLabel={option =>
                                    `${option.nombre_presentacion}`
                                }
                                getOptionValue={option => `${option}`}
                                isOptionSelected={option => presentacionSeleccionado.id_presentacion === option.id_presentacion ? true : false}
                                options={DataPresentacionAPI}
                                isSearchable={true}
                                filterOption={this.customFilterCategorias}
                                // onInputChange={this.onChangeProveedor}
                                noOptionsMessage={() => null}
                                placeholder={"seleccione"}
                                autoFocus={false}
                                menuIsOpen={this.state.menuOpen}
                                dropdownHeight={200}
                                className="text-dark"
                            />
                        </FormGroup>

                        <FormGroup>
                            <Label className="font-weight-bold">STATUS</Label>
                            <CustomInput
                                type="switch"
                                name="status_producto"
                                value={ProductoSeleccionado.status_producto.toString() === "1" ? "0" : "1"}
                                checked={+ProductoSeleccionado.status_producto}
                                id={"status_producto"}
                                onChange={e => { this.TxtRegistrarProducto(e.target.name, e.target.value) }}
                            />
                        </FormGroup>

                        <div className="float-right mx-3 mb-2">
                            <Button color="success" size="sm" onClick={() => this.AgregarEditarProducto()}>GUARDAR</Button>
                        </div>
                    </ModalBody>

                </Modal>
            </Fragment>
        );
    }
}

export default Productos;