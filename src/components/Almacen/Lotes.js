import React, { Component, Fragment } from 'react';
import { Nav, NavItem, NavLink, Card, Row, Col, CardHeader, CardBody, Button, Modal, ModalHeader, ModalBody, Container, FormGroup, Label, Input, CustomInput, Form } from 'reactstrap';
import classnames from 'classnames';
import Axios from 'axios';
// import "react-picky/dist/picky.css";
import { FaCartPlus, FaPlusCircle } from "react-icons/fa";
import { toast } from "react-toastify";
import Select from 'react-select';

import { CantDias, debounce, fechaActualYMD } from "../../config/Funciones"

class Lotes extends Component {
    state = {
        DataPresentacionAPI: [],
        DataLotesProductosAPI: [],
        DataProductosAPI: [],
        DataProveedoresAPI: [],
        activeTab: "1",
        modalNuevoEditarProducto: false,
        DataNuevoProducto: {
            "id_lote": null,
            "codigo_lote": "",
            "stock_lote": "",
            "fecha_vencimiento_lote": fechaActualYMD(),
            "status_lote": "1",
            "id_producto": null,
            "cod_barra_lote": "",
            "nomb_comercial_producto": "",
            "nomb_generico_producto": "",
            "costo_producto_lote": "",
            "costo_adquirido_producto_lote": "",
            "fecha_adquisicion_lote": fechaActualYMD(),
            "unidad_medida_producto": "",
            "concentracion_producto": "",
            "status_producto": "1"
        },
        CondicionAgregarEditar: false, // agregar = true editar = false
        proveedorSeleccionado: {},
        productoSeleccionado: {},
    }

    componentDidMount = async () => {
        this.reqPresentacion()
        this.reqProveedores(0, 0)
    }

    reqPresentacion = async () => {
        try {
            var row = await Axios.get(`/presentacion`)
            this.setState({ DataPresentacionAPI: row.data })
            console.log("row presentacion", row.data);
            this.reqLotes(row.data[0].id_presentacion)
        } catch (error) {
            console.error("errores en obtener los presentacion");
        }
    }

    reqProductos = async () => {
        try {
            var row = await Axios.post(`/productos/todos`)
            // this.setState({ productoSeleccionado: row.data[0] })DataProductosAPI
            this.setState({ DataProductosAPI: row.data })
            console.log("row producto seleccionado", row.data);
            // this.reqLotes(row.data[0].id_producto seleccionado)
        } catch (error) {
            console.error("errores en obtener los el producto que seleccionó");
        }
    }

    toggle = (id_categoria) => {
        if (this.state.activeTab !== id_categoria) {
            this.setState({
                activeTab: id_categoria
            });
            this.reqLotes(id_categoria)
        }
    }

    reqLotes = async (id_categoria) => {
        try {
            var row = await Axios.post(`/productos/productoslote`, { id_categoria })
            this.setState({ DataLotesProductosAPI: row.data })
            console.log("row DataLotesProductosAPI", row.data);
        } catch (error) {
            console.error("errores en obtener los presentacion");
        }
    }

    modalToggle = (key, value) => {
        this.setState({ [key]: value })
    }

    TxtRegistrarProducto = debounce((key, value) => {
        let { DataNuevoProducto } = this.state
        // console.log("DataNuevoProducto ", DataNuevoProducto[key]);
        console.log("key: ", key, "value: ", value);
        DataNuevoProducto[key] = value
        this.setState({ DataNuevoProducto })
    }, 0)

    editarProducto = async (producto) => {
        if (this.state.DataProductosAPI.length === 0) {
            await this.reqProductos();
        }
        console.log("producto ", producto);
        let { DataProveedoresAPI, DataProductosAPI } = this.state
        var iProveedores = DataProveedoresAPI.findIndex(p => p.id_proveedor === producto.tb_proveedores_id_proveedor)
        var iProducto = DataProductosAPI.findIndex(p => p.id_producto === producto.id_producto)
        // console.log("DataProveedoresAPI ", DataProveedoresAPI[iProveedores]);
        this.setState({
            modalNuevoEditarProducto: true,
            DataNuevoProducto: producto,
            CondicionAgregarEditar: false,
            proveedorSeleccionado: DataProveedoresAPI[iProveedores],
            productoSeleccionado: DataProductosAPI[iProducto],
        })
    }

    AgregarEditarProducto = async (e) => {
        e.preventDefault()
        try {
            var { DataNuevoProducto, proveedorSeleccionado, productoSeleccionado } = this.state
            console.log("proveedorSeleccionado ", proveedorSeleccionado);
            console.log("productoSeleccionado", productoSeleccionado);

            if (proveedorSeleccionado.id_proveedor) {
                Object.assign(DataNuevoProducto, { "tb_proveedores_id_proveedor": proveedorSeleccionado.id_proveedor, "tb_productos_id_producto": productoSeleccionado.id_producto })
                // console.log("hola", DataNuevoProducto);
                var row = await Axios.post(`/lotes/insertaactualiza`, DataNuevoProducto)
                if (row.status === 200) {
                    toast.success("✔ Exito!!", { position: "top-right" })
                    this.setState({ modalNuevoEditarProducto: false })
                    console.log("row producto agregado o actualizado", row);
                } else {
                    toast.error("❌ Errores! no se pudo guardar los datos", { position: "top-right" })
                }
                // this.setState({ producto agregado o actualizado: row.data })
            } else {
                toast.warn("🤷‍♂️ Seleccione un proveedor y producto", { position: "top-right" })
            }

        } catch (error) {
            console.error("errores en insertar o atualizar el producto");
        }
    }

    reqProveedores = async (limit, CantidadRows) => {
        try {
            var row = await Axios.post(`/proveedores`, { limit, CantidadRows })
            console.log("row proveedores", row.data.data);
            this.setState({ DataProveedoresAPI: row.data.data })

        } catch (error) {
            console.error("errores EN OBTENER LOS PROVEEDORES");
        }
    }

    AbrirModalAgregarProducto = async () => {

        this.setState({
            "CondicionAgregarEditar": true,
            "modalNuevoEditarProducto": true,
            "DataNuevoProducto": {
                "id_lote": null,
                "codigo_lote": "",
                "stock_lote": "",
                "fecha_vencimiento_lote": fechaActualYMD(),
                "status_lote": "1",
                "id_producto": null,
                "cod_barra_lote": "",
                "nomb_comercial_producto": "",
                "nomb_generico_producto": "",
                "costo_producto_lote": "",
                "costo_adquirido_producto_lote": "",
                "fecha_adquisicion_lote": fechaActualYMD(),
                "unidad_medida_producto": "",
                "concentracion_producto": "",
                "status_producto": "1",
            },
            "productoSeleccionado": {},
            "proveedorSeleccionado": {}
        })
        if (this.state.DataProductosAPI.length === 0) {
            await this.reqProductos();
        }
    }

    onChangeProveedor = (e) => {
        console.log("onChangeProveedor", e);
        this.setState({ proveedorSeleccionado: e })
    }

    customFilter = (option, searchText) => {
        if (
            option.data.nombre_proveedor.toLowerCase().includes(searchText.toLowerCase()) ||
            option.data.ruc_proveedor.toLowerCase().includes(searchText.toLowerCase()) ||
            option.data.correo_electronico_proveedor.toLowerCase().includes(searchText.toLowerCase())
        ) {
            return true;
        } else {
            return false;
        }
    };

    customFilterProductos = (option, searchText) => {
        if (
            option.data.nomb_comercial_producto.toLowerCase().includes(searchText.toLowerCase()) ||
            option.data.nomb_generico_producto.toLowerCase().includes(searchText.toLowerCase())
        ) {
            return true;
        } else {
            return false;
        }
    };

    render() {
        const { DataPresentacionAPI, DataProductosAPI, activeTab, DataLotesProductosAPI, modalNuevoEditarProducto, DataNuevoProducto, CondicionAgregarEditar, DataProveedoresAPI,
            proveedorSeleccionado, productoSeleccionado } = this.state
        return (
            <Fragment>
                <div className="font-weight-bold mb-2 px-3 shadow-sm p-2 bg-light">LOTES EXISTENTES EN ALMACEN</div>

                <div className="px-3">
                    <Row>
                        <Col xs="4" sm="2" md="2">
                            <Card>
                                <CardHeader>CATEGORIAS </CardHeader>
                                <CardBody className="p-1">
                                    <Nav tabs vertical pills>
                                        {
                                            DataPresentacionAPI.map((presn, i) =>
                                                <NavItem key={i * 56}>
                                                    <NavLink
                                                        className={classnames({ active: activeTab === presn.id_presentacion.toString() })}
                                                        onClick={() => this.toggle(presn.id_presentacion.toString())}
                                                    >
                                                        {presn.nombre_presentacion}
                                                    </NavLink>
                                                </NavItem>
                                            )
                                        }
                                    </Nav>
                                </CardBody>
                            </Card>
                        </Col>
                        <Col xs="8" sm="10" md="10">
                            <Card>
                                <CardHeader>
                                    <div className="float-left"> LOTES Y PRODUCTOS</div>
                                    <div className="float-right text-primary"
                                        style={{ cursor: "pointer" }}
                                        title="AGREGAR NUEVO PRODUCTO"
                                        onClick={() => this.AbrirModalAgregarProducto()}>
                                        <FaPlusCircle size={23} />
                                    </div>
                                </CardHeader>

                                <CardBody className="p-1">
                                    <div style={{ height: "calc(90vh - 92px)", overflowY: "auto" }}>
                                        <table className="table table-sm table-bordered table-striped  table-hover">
                                            <thead>
                                                <tr>
                                                    <th>LOTE</th>
                                                    <th className="text-center" >STOCK</th>
                                                    <th className="text-center" style={{ borderRight: "2px dashed #d2d2d2" }}>VENCE</th>

                                                    <th>QR</th>
                                                    <th>Nomb. GENÉRICO</th>
                                                    <th>Nomb. COMERCIAL</th>
                                                    <th>CONCENTR.</th>
                                                    <th>COMPRA</th>
                                                    <th>VENTA</th>
                                                    <th>F. COMPRA</th>
                                                    <th></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {
                                                    DataLotesProductosAPI.map((pro, i) =>
                                                        <tr key={i} >
                                                            <td>{pro.codigo_lote}</td>
                                                            <td className="text-center font-weight-bold"
                                                                style={(+pro.stock_lote) < 30
                                                                    ?
                                                                    { background: "#ff00004f", borderLeft: "3px solid red" }
                                                                    :
                                                                    (+pro.stock_lote) < 60 ?
                                                                        { background: "#ffc80066", borderLeft: "3px solid #ffc801" } : null}>
                                                                {pro.stock_lote}
                                                            </td>
                                                            <td className="text-center" style={{ borderRight: "2px dashed #d2d2d2" }}>
                                                                {
                                                                    CantDias(pro.fecha_vencimiento_lote) < 90
                                                                        ?
                                                                        <div className="text-danger" title={`Se vence el ${pro.fecha_vencimiento_lote}`}>
                                                                            {`En ${CantDias(pro.fecha_vencimiento_lote)} dia(s)`}
                                                                        </div>
                                                                        :
                                                                        <div>El {pro.fecha_vencimiento_lote}</div>
                                                                }
                                                            </td>

                                                            <td>{pro.cod_barra_lote}</td>
                                                            <td>{pro.nomb_generico_producto}</td>
                                                            <td>{pro.nomb_comercial_producto}</td>
                                                            <td>{pro.concentracion_producto} {pro.unidad_medida_producto}</td>
                                                            <td>S/. {pro.costo_adquirido_producto_lote}</td>
                                                            <td>S/. {pro.costo_producto_lote}</td>
                                                            <td>{pro.fecha_adquisicion_lote}</td>
                                                            <td>
                                                                <div className="text-success"
                                                                    title="Realizar nueva compra"
                                                                    style={{ cursor: "pointer" }}
                                                                    onClick={() => this.editarProducto(pro)}>
                                                                    <FaCartPlus size={20} />
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
                        </Col>
                    </Row>
                </div>
                <Modal isOpen={modalNuevoEditarProducto} toggle={() => this.modalToggle("modalNuevoEditarProducto", false)} size="lg" backdrop={"static"}>
                    <ModalHeader className="bg-primary text-white" toggle={() => this.modalToggle("modalNuevoEditarProducto", false)}>
                        {!CondicionAgregarEditar ? "EDITAR " : "AGREGAR NUEVO "}
                         LOTE
                    </ModalHeader>
                    <ModalBody className="p-1">
                        <Form onSubmit={e => this.AgregarEditarProducto(e)}>
                            <fieldset>
                                <legend>LOTE</legend>
                                <Row form>
                                    <Col md={4}>
                                        <FormGroup>
                                            <Label className="font-weight-bold">LOTE</Label>
                                            <Input type="text" required name="codigo_lote" value={DataNuevoProducto.codigo_lote} onChange={e => { this.TxtRegistrarProducto(e.target.name, e.target.value) }} />
                                        </FormGroup>
                                    </Col>

                                    <Col md={4}>
                                        <FormGroup>
                                            <Label className="font-weight-bold">CODIGO DE BARRA</Label>
                                            <Input
                                                type="text"
                                                name="cod_barra_lote"
                                                defaultValue={DataNuevoProducto.cod_barra_lote}
                                                onChange={e => { this.TxtRegistrarProducto(e.target.name, e.target.value) }} />
                                        </FormGroup>
                                    </Col>

                                    <Col md={2}>
                                        <FormGroup>
                                            <Label className="font-weight-bold" >STOCK (unidades)</Label>
                                            <Input type="text" name="stock_lote" required value={DataNuevoProducto.stock_lote} onChange={e => { this.TxtRegistrarProducto(e.target.name, e.target.value) }} />
                                        </FormGroup>
                                    </Col>

                                    <Col md={2} className="text-center">
                                        <FormGroup>
                                            <Label className="font-weight-bold">ESTADO</Label>
                                            <CustomInput type="switch" name="status_lote" value={DataNuevoProducto.status_lote.toString() === "1" ? "0" : "1"} checked={+DataNuevoProducto.status_lote} id="status_lote" onChange={e => { this.TxtRegistrarProducto(e.target.name, e.target.value) }} />
                                        </FormGroup>
                                    </Col>
                                </Row>
                                <Container fluid >
                                    <Row>
                                        <Col sm={6}>
                                            <Row form>
                                                <Col md={6}>
                                                    <FormGroup>
                                                        <Label className="font-weight-bold">FECHA DE ADQUICISION</Label>
                                                        <Input type="date" name="fecha_adquisicion_lote" value={DataNuevoProducto.fecha_adquisicion_lote} onChange={e => { this.TxtRegistrarProducto(e.target.name, e.target.value) }} />
                                                    </FormGroup>
                                                </Col>
                                                <Col md={6}>
                                                    <FormGroup>
                                                        <Label className="font-weight-bold">FECHA DE VENCIMIENTO</Label>
                                                        <Input type="date" name="fecha_vencimiento_lote" required value={DataNuevoProducto.fecha_vencimiento_lote} onChange={e => { this.TxtRegistrarProducto(e.target.name, e.target.value) }} />
                                                    </FormGroup>
                                                </Col>
                                            </Row>
                                            <FormGroup>
                                                <Label className="font-weight-bold">PROVEEDOR</Label>
                                                <Select
                                                    defaultValue={proveedorSeleccionado}
                                                    onChange={this.onChangeProveedor}
                                                    getOptionLabel={option =>
                                                        `${option.nombre_proveedor} ${option.ruc_proveedor}`
                                                    }
                                                    getOptionValue={option => `${option}`}
                                                    isOptionSelected={option => proveedorSeleccionado.id_proveedor === option.id_proveedor ? true : false}
                                                    options={DataProveedoresAPI}
                                                    isSearchable={true}
                                                    filterOption={this.customFilter}
                                                    // onInputChange={this.onChangeProveedor}
                                                    noOptionsMessage={() => null}
                                                    placeholder={"seleccione"}
                                                    autoFocus={false}
                                                    menuIsOpen={this.state.menuOpen}
                                                    dropdownHeight={200}
                                                    className="text-dark"
                                                />
                                            </FormGroup>
                                        </Col>
                                        <Col sm={6}>
                                            <FormGroup>
                                                <Label className="font-weight-bold">COSTO TOTAL DE COMPRA S/. </Label>
                                                <Input type="text" name="costo_adquirido_producto_lote" required value={DataNuevoProducto.costo_adquirido_producto_lote} onChange={e => { this.TxtRegistrarProducto(e.target.name, e.target.value) }} />
                                            </FormGroup>

                                            <FormGroup>
                                                <Label className="font-weight-bold">COSTO DE VENTA (unidad) S/.</Label>
                                                <Input type="text" name="costo_producto_lote" required 
                                                    placeholder={"Costo Sugerido " + (DataNuevoProducto.stock_lote / DataNuevoProducto.costo_adquirido_producto_lote) || 0}
                                                    value={DataNuevoProducto.costo_producto_lote} onChange={e => { this.TxtRegistrarProducto(e.target.name, e.target.value) }} />
                                            </FormGroup>
                                        </Col>
                                    </Row>
                                </Container>

                            </fieldset>

                            <fieldset>
                                <legend>DATOS DEL PRODUCTO</legend>
                                <FormGroup>
                                    <Label className="font-weight-bold">PRODUCTO</Label>
                                    <Select
                                        defaultValue={productoSeleccionado}
                                        onChange={e => this.setState({ productoSeleccionado: e })}
                                        getOptionLabel={option =>
                                            `COMERCIAL: ${option.nomb_comercial_producto} 〰 GENERICO: ${option.nomb_generico_producto} ${option.concentracion_producto} ${option.unidad_medida_producto || ""}`
                                        }
                                        getOptionValue={option => `${option}`}
                                        isOptionSelected={option => productoSeleccionado.id_producto === option.id_producto ? true : false}
                                        options={DataProductosAPI}
                                        isSearchable={true}
                                        filterOption={this.customFilterProductos}
                                        // onInputChange={e => this.setState({productoSeleccionado:e})}
                                        noOptionsMessage={() => null}
                                        placeholder={"seleccione un producto"}
                                        autoFocus={false}
                                        menuIsOpen={this.state.menuOpen}
                                        dropdownHeight={200}
                                        className="text-dark"
                                    />
                                </FormGroup>
                            </fieldset>
                            <div className="float-right mx-3 mb-2">
                                <Button color="success" type="submit" size="sm"> {!CondicionAgregarEditar ? "ACTUALIZAR DATOS" : "GUARDAR"} </Button>
                            </div>
                        </Form>
                    </ModalBody>
                </Modal>
            </Fragment>
        );
    }
}

export default Lotes;       