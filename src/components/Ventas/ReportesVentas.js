import React, { Component, Fragment } from 'react';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { Button, Col, ListGroup, ListGroupItem, Row, Input, Card, CardBody, Table, CardHeader } from 'reactstrap';
import Axios from 'axios';
import { fechaActualYMD } from "../../config/Funciones"
pdfMake.vfs = pdfFonts.pdfMake.vfs;

const { BrowserWindow } = window.require('electron').remote

const fs = window.require('fs')
const url = window.require('url')
const path = window.require('path')

let CWD = process.cwd()
const PDFWindow = window.require('electron-pdf-window')

class ReportesVentas extends Component {
    state = {
        DataVentasAPI: [],
        fechaInicio: "",
        fechaFin: "",
        sumadoTotales: {}
    }

    reqVentas = async () => {
        console.log(this.state.fechaInicio);
        try {
            var Fechas = await Axios.post(`/ventas/porrangos`, {
                "fechaInicio": `${this.state.fechaInicio} 00:00:00`,
                "fechaFin": `${this.state.fechaFin} 23:59:59`
            })
            this.setState({ DataVentasAPI: Fechas.data }, () => this.SumaTotales())

        } catch (error) {
            console.error("reqVentas", error);
        }

    }

    GenerarReporte = async () => {
        const { DataVentasAPI, fechaInicio, fechaFin, sumadoTotales } = this.state
        try {
            var DataReporte = [
                [

                    {
                        text: "N° BOLETA",
                        bold: true,
                        alignment: "center"
                    },
                    {
                        text: "FECHA",
                        bold: true,
                        alignment: "center"
                    },
                    {
                        text: "CLIENTE",
                        bold: true,
                        alignment: "center"
                    },
                    {
                        text: "VENDEDOR",
                        bold: true,
                        alignment: "center"
                    },
                    {
                        text: "DSTO.",
                        bold: true,
                        alignment: "center"
                    },
                    {
                        text: "TOTAL",
                        bold: true,
                        alignment: "center"
                    }
                ],
            ]


            DataVentasAPI.forEach(e => {
                DataReporte.push(
                    [

                        {
                            text: e.id_venta
                        },
                        {
                            text: e.fecha_venta
                        },
                        {
                            text: `${e.nombres_cliente} ${e.ap_paterno_cliente} ${e.ap_materno_cliente}`
                        },
                        {
                            text: `${e.nombre_usuario}`
                        },
                        {
                            text: e.descuento_venta
                        },
                        {
                            text: e.total_venta
                        }
                    ]
                )
            });

            DataReporte.push(
                [

                    {
                        text: "TOTAL",
                        colSpan: 4,
                        alignment: "right"
                    },
                    {
                        text: "FECHA"
                    },
                    {
                        text: "CLIENTE"
                    },
                    {
                        text: "VENDEDOR"
                    },
                    {
                        text: `${(sumadoTotales.descuento||0).toFixed(2)}`
                    },
                    {
                        text: `${(sumadoTotales.total||0).toFixed(2)}`
                    }
                ],
                [

                    {
                        text: "TOTAL EN CAJA",
                        colSpan: 5,
                        alignment: "right"
                    },
                    {
                       
                    },
                    {
                       
                    },
                    {
                      
                    },
                    {
                      
                    },
                    {
                        text: `${ (sumadoTotales.total - sumadoTotales.descuento||0).toFixed(2)}`
                    }
                ],
               
            )
            var ObjetosReportes = {
                content: [
                    {
                        text: 'BOTICA DEL ROSARIO ',
                        style: 'header'

                    },
                    {
                        text: `REPORTE DE VENTAS REALIZADAS DEL ${fechaInicio} AL ${fechaFin}`,
                        style: 'header2'

                    },
                    {
                        style: 'tableExample',
                        table: {
                            headerRows: 1,
                            widths: [50, '*', 'auto', '*', 25, 40],
                            body:
                                // contenido del reporte 
                                DataReporte,
                            // total sumatoria


                        },
                        layout: 'lightHorizontalLines'
                    },
                ],
                styles: {
                    header: {
                        fontSize: 16,
                        bold: true,
                        margin: [0, 0, 0, 5],
                        alignment: "center"
                    },
                    header2: {
                        fontSize: 11,
                        bold: true,
                        margin: [0, 0, 0, 5],
                        alignment: "center"
                    }
                },
                defaultStyle: {
                    fontSize: 9,
                }
            }

            // var pdfRecibo = pdfMake.createPdf(ObjetosReportes)

            await pdfMake.createPdf(ObjetosReportes).getBuffer((result) => {
                fs.writeFileSync(path.join(CWD, 'ReporteVentas.pdf'), result);
            });

            const pdfWindow = new BrowserWindow({
                width: 1024,
                height: 800,
                webPreferences: {
                    plugins: true
                }
            })
            pdfWindow.setMenuBarVisibility(false)

            await PDFWindow.addSupport(pdfWindow)
            pdfWindow.loadURL(url.format({
                pathname: path.join(CWD, 'ReporteVentas.pdf'),
                protocol: 'file'
            }))

            // pdfRecibo.print()
        } catch (error) {
            console.error(error);
        }

    }

    SumaTotales = () => {
        const { DataVentasAPI } = this.state
        // console.log("DataVentasAPI ", DataVentasAPI);
        var total = DataVentasAPI.reduce((inicial, sumar) => {
            inicial.total = ((+inicial.total) || 0) + (+sumar.total_venta)
            inicial.descuento = ((+inicial.descuento) || 0) + (+sumar.descuento_venta)
            return inicial
        }, { total: 0, descuento: 0 })
        // console.log("total", total);
        this.setState({ sumadoTotales: total })
    }

    render() {
        const { DataVentasAPI, fechaInicio, fechaFin, sumadoTotales } = this.state

        return (
            <Fragment>
                <div className="h4 px-3 shadow-sm p-2 bg-light">
                    REPORTE DE VENTAS
                    <div className="float-right">
                        <Button size="sm" color="info" onClick={() => this.setState({ fechaInicio: fechaActualYMD(), fechaFin: fechaActualYMD() })}> HOY
                        </Button>
                        {" "}
                        <Button size="sm" color="dark" onClick={() => this.GenerarReporte()}> EXPORTAR PDF</Button>
                    </div>
                </div>
                <div className="px-3">
                    <Row>

                        <Col sm={3}>
                            <ListGroup>
                                <ListGroupItem className="justify-content-between">
                                    DEL
                                    <div>
                                        <Input type="date" defaultValue={fechaInicio} onChange={e => this.setState({ fechaInicio: e.target.value })} />
                                    </div>
                                </ListGroupItem>

                                <ListGroupItem className="justify-content-between">
                                    AL
                                    <div>
                                        <Input type="date" defaultValue={fechaFin} onChange={e => this.setState({ fechaFin: e.target.value })} />
                                    </div>
                                </ListGroupItem>
                                <ListGroupItem className="text-center" active tag="button" action onClick={() => this.reqVentas()}>Generar
                                </ListGroupItem>
                            </ListGroup>
                            <hr />
                            <Card body inverse color="secondary">
                                <CardHeader className="h6">TOTAL S/. {(sumadoTotales.total||0).toFixed(2)}</CardHeader>
                            </Card>
                            <br />
                            <Card body inverse color="warning">
                                <CardHeader className="h6">DESCUENTOS S/. {(sumadoTotales.descuento||0).toFixed(2)}</CardHeader>
                            </Card>
                            <br />
                            <Card body inverse color="success">
                                <CardHeader className="h6">TOTAL NETO S/. {(sumadoTotales.total - sumadoTotales.descuento||0).toFixed(2)}</CardHeader>
                            </Card>
                        </Col>

                        <Col sm={9}>
                            <Card>
                                <CardBody className="p-1">
                                    <Table className="table-sm table-striped">
                                        <tbody>
                                            <tr>
                                                <th>N° TICKET</th>
                                                <th>FECHA</th>
                                                <th>CLIENTE</th>
                                                <th> VENDEDOR</th>
                                                <th>DSTO.</th>
                                                <th>TOTAL</th>
                                            </tr>
                                        </tbody>
                                        <tbody>
                                            {
                                                DataVentasAPI.map((e, iV) =>
                                                    <tr key={iV}>
                                                        <td>{e.id_venta}</td>
                                                        <td>{e.fecha_venta}</td>
                                                        <td>{`${e.nombres_cliente} ${e.ap_paterno_cliente} ${e.ap_materno_cliente}`}</td>
                                                        <td>{`${e.nombre_usuario}`}</td>
                                                        <td>{e.descuento_venta}</td>
                                                        <td>{e.total_venta}</td>
                                                    </tr>
                                                )
                                            }
                                        </tbody>
                                    </Table>
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                </div>
            </Fragment >
        );
    }
}

export default ReportesVentas;