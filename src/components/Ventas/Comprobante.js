import React, { Component, Fragment } from 'react';
import { Container, Row, Col, Card, CardHeader, CardBody, Input, InputGroup, InputGroupAddon, Button, Collapse } from 'reactstrap';
import { AiOutlineBarcode, AiOutlineForm, AiFillPrinter } from "react-icons/ai"

class Comprobante extends Component {
    state = {
        modoLectorCodigoBarra: true,
        txtFiltradorCodBarra: "",
        txtFiltrador: "",
        isOpenCollapse: "COMPROBANTE",
    }
    TxtModoLectorCodBarra = (e) => {
        const { name, value } = e.target
        // console.log(name, value)

        let { DataProductosAPI, DataSeleccionados } = this.state
        var iP = DataProductosAPI.findIndex(p => p.cod_barra_lote === value)
        if (iP !== -1) {
            DataProductosAPI[iP].stock_lote = (+DataProductosAPI[iP].stock_lote) - 1
            var iPs = DataSeleccionados.findIndex(ps => ps.cod_barra_lote === value)
            // console.log("ip>", iPs);
            if (iPs === -1) {
                Object.assign(DataProductosAPI[iP], { "cantidadVenta": 1 })
                DataSeleccionados.push(DataProductosAPI[iP])
                this.calculaTotal()
            } else {
                DataSeleccionados[iPs].cantidadVenta = (+DataSeleccionados[iPs].cantidadVenta) + 1
                // console.log("DataSeleccionados ", DataSeleccionados);

                this.setState({ DataSeleccionados }, () => this.calculaTotal())
            }

        }
        // console.log("name:", name, "value ", value)
        // console.log("ssss>>", DataProductosAPI)

        this.setState({ [name]: value }, () => {
            setTimeout(() => {
                this.setState({ txtFiltradorCodBarra: "" })
            }, 500)
        })
    }
    CambioModoSeleccionProducto = async () => {
        this.setState({
            modoLectorCodigoBarra: !this.state.modoLectorCodigoBarra,
            txtFiltradorCodBarra: "",
            txtFiltrador: ""
        })
    }
    render() {
        const { modoLectorCodigoBarra, txtFiltradorCodBarra, txtFiltrador, isOpenCollapse } = this.state
        return (
            <Fragment>
                <div className="font-weight-bold mb-2 px-3 shadow-sm p-2 bg-light">BUSCAR COMPRABANTE</div>
                <div className="px-3">
                    <Container fluid>
                        <Row>
                            <Col sm="4">
                                <Card>
                                    <CardHeader>
                                        MODO DE BUSQUEDA
                                    </CardHeader>
                                    <CardBody className="p-0">
                                        <fieldset>
                                            <legend style={{cursor:"pointer", background:"#ccff01"}} onClick={() => this.setState({ isOpenCollapse: "COMPROBANTE" })}>POR N° DE COMPROBANTE:</legend>
                                            <Collapse isOpen={isOpenCollapse === "COMPROBANTE"}>
                                                <InputGroup size="sm" className="mb-2" >
                                                    {
                                                        modoLectorCodigoBarra ?
                                                            <Input
                                                                type="text"
                                                                name="txtFiltradorCodBarra"
                                                                value={txtFiltradorCodBarra}
                                                                placeholder="Escanee el código de barra del comprabante"
                                                                onChange={e => { this.TxtModoLectorCodBarra(e) }}
                                                                autoFocus
                                                            />
                                                            :
                                                            <Input
                                                                name="txtFiltrador"
                                                                value={txtFiltrador}
                                                                onChange={e => { this.setState({ [e.target.name]: e.target.value }) }}
                                                            />
                                                    }
                                                    <InputGroupAddon addonType="append" title="Cambiar Modo">

                                                        <Button color="white" className="p-0" onClick={() => this.CambioModoSeleccionProducto()}>
                                                            {
                                                                modoLectorCodigoBarra
                                                                    ? <AiOutlineBarcode size={27} />
                                                                    : <AiOutlineForm size={27} />
                                                            }

                                                        </Button>
                                                    </InputGroupAddon>
                                                </InputGroup>
                                            </Collapse>
                                        </fieldset>

                                        <fieldset>
                                            <legend style={{cursor:"pointer", background:"#ccff01"}} onClick={() => this.setState({ isOpenCollapse: "CLIENTE" })}>POR DATOS DEL CLIENTE:</legend>
                                            <Collapse isOpen={isOpenCollapse === "CLIENTE"}>
                                                dsdsdsa sdsdsdssdsds
                                            </Collapse>
                                        </fieldset>
                                        <fieldset>
                                            <legend style={{cursor:"pointer", background:"#ccff01"}} onClick={() => this.setState({ isOpenCollapse: "FECHAS" })}>POR RANGO DE FECHAS:</legend>
                                            <Collapse isOpen={isOpenCollapse === "FECHAS"}>
                                                dsdsds
                                            </Collapse>
                                        </fieldset>
                                    </CardBody>
                                </Card>
                            </Col>
                            <Col sm="8">
                                <Card>
                                    <CardHeader>
                                        RESULTADOS ENCONTRADOS
                                    </CardHeader>
                                    <CardBody className="p-1">
                                        <div style={{ height: "calc(85vh - 58px)", overflowY: "auto" }}>
                                            <table className="table table-sm table-bordered table-striped  table-hover">
                                                <thead>
                                                    <tr>
                                                        <th>N°.</th>
                                                        <th className="text-center">CLIENTE</th>
                                                        <th className="text-center">FECHA Y HORA</th>
                                                        <th className="text-center">OBSERVACION</th>
                                                        <th className="text-center">DSTO.</th>
                                                        <th className="text-center">SUB TOTAL</th>
                                                        <th className="text-center">TOTAL </th>
                                                        <th className="text-center">VENDEDOR</th>
                                                        <th></th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr>
                                                        <td></td>
                                                        <td></td>
                                                        <td></td>
                                                        <td></td>
                                                        <td></td>
                                                        <td></td>
                                                        <td></td>
                                                        <td></td>
                                                        <td><AiFillPrinter size={20} /></td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </CardBody>
                                </Card>
                            </Col>
                        </Row>
                    </Container>
                </div>
            </Fragment>
        );
    }
}

export default Comprobante;