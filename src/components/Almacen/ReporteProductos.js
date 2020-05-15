import React, { Component, Fragment } from 'react';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { Button, Row, Col, ListGroup, ListGroupItem } from 'reactstrap';
import Axios from 'axios';
import { CantDias } from "../../config/Funciones"

pdfMake.vfs = pdfFonts.pdfMake.vfs;

const { BrowserWindow } = window.require('electron').remote

const fs = window.require('fs')
const url = window.require('url')
const path = window.require('path')

let CWD = process.cwd()
const PDFWindow = window.require('electron-pdf-window')

class ReporteProductos extends Component {
    state = {
        DataProductosAPI: [],
        DataFiltrado: [],
        seleccionado: "FiltrarTodo"
    }

    componentDidMount = async () => {
        this.reqProductos()
    }

    reqProductos = async () => {
        try {
            var row = await Axios.get(`/productos/Lotescategorias`)
            this.setState({ DataProductosAPI: row.data, DataFiltrado: row.data })
            console.log("row productos", row.data);
        } catch (error) {
            console.error("errores en obtener los productos");
        }
    }

    GenerarReporteProductos = async () => {
        const { DataFiltrado } = this.state
        try {
            var DataReporte = [
                [

                    {
                        text: "LOTE",
                        bold: true,
                        alignment: "center"
                    },
                    {
                        text: "STOCK",
                        bold: true,
                        alignment: "center"
                    },
                    {
                        text: "Nomb. GENÉRICO",
                        bold: true,
                        alignment: "center"
                    },
                    {
                        text: "Nomb. COMERCIAL",
                        bold: true,
                        alignment: "center"
                    },
                    {
                        text: "CONCENT.",
                        bold: true,
                        alignment: "center"
                    },
                    {
                        text: "FECHA COMPRA",
                        bold: true,
                        alignment: "center"
                    },
                    {
                        text: "COMPRA S/.",
                        bold: true,
                        alignment: "center"
                    },
                    {
                        text: "VENTA S/.",
                        bold: true,
                        alignment: "center"
                    },
                    {
                        text: "PRESENTACIÓN",
                        bold: true,
                        alignment: "center"
                    },
                    {
                        text: "VENCIMIENTO",
                        bold: true,
                        alignment: "center"
                    }
                ],
            ]


            DataFiltrado.forEach(e => {
                DataReporte.push(
                    [

                        {
                            text: e.codigo_lote
                        },
                        {
                            text: e.stock_lote,
                            alignment: "center"
                        },
                        {
                            text: `${e.nomb_generico_producto}`
                        },
                        {
                            text: `${e.nomb_comercial_producto}`
                        },
                        {
                            text: `${e.concentracion_producto} ${e.unidad_medida_producto}`
                        },
                        {
                            text: e.fecha_aquicision_producto
                        },
                        {
                            text: e.costo_adquirido_producto,
                            alignment: "right"
                        },
                        {
                            text: e.costo_producto,
                            alignment: "right"
                        },
                        {
                            text: e.nombre_presentacion
                        },
                        {
                            text: e.fecha_vencimiento_lote
                        }
                    ]
                )
            });

            console.log("Fechas ", DataFiltrado);
            var ObjetosReportes = {
                content: [
                    {
                        text: 'BOTICA DEL ROSARIO ',
                        style: 'header'

                    },
                    {
                        text: `REPORTE DE PRODUCTOS `,
                        style: 'header2'

                    },
                    {
                        style: 'tableExample',
                        table: {
                            headerRows: 1,
                            widths: [50, 'auto', 'auto', 'auto', "auto", "auto", 'auto', 'auto', 'auto', 'auto'],
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

                },
                pageOrientation: 'landscape'
            }

            // var pdfRecibo = pdfMake.createPdf(ObjetosReportes)

            await pdfMake.createPdf(ObjetosReportes).getBuffer((result) => {
                fs.writeFileSync(path.join(CWD, 'ReporteProductos.pdf'), result);
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
            await pdfWindow.loadURL(url.format({
                pathname: path.join(CWD, 'ReporteProductos.pdf'),
                protocol: 'file'
            }))

            // pdfRecibo.print()
        } catch (error) {
            console.error(error);
        }

    }

    FiltrarTodo = () => {
        let { DataProductosAPI } = this.state
        console.log("DataFiltrado ", DataProductosAPI);
        this.setState({ DataFiltrado: DataProductosAPI, seleccionado: "FiltrarTodo" })

    }

    ProximosAvencerse = () => {
        let { DataProductosAPI } = this.state
        DataProductosAPI = DataProductosAPI.filter(dp => CantDias(dp.fecha_vencimiento_lote) < 90)
        // console.log("DataFiltrado ", DataProductosAPI);
        this.setState({ DataFiltrado: DataProductosAPI, seleccionado: "ProximosAvencerse" })
    }

    Stock = () => {
        let { DataProductosAPI } = this.state
        DataProductosAPI = DataProductosAPI.filter(dp => dp.stock_lote < 60)
        // console.log("DataFiltrado ", DataProductosAPI);
        this.setState({ DataFiltrado: DataProductosAPI, seleccionado: "Stock" })
    }

    render() {
        const { DataFiltrado, seleccionado } = this.state
        return (
            <Fragment>
                <div className="h4 px-3 shadow-sm p-2 bg-light">
                    REPORTE DE PRODUCTOS

                    <div className="float-right">
                        <Button size="sm" color="dark" onClick={() => this.GenerarReporteProductos()}> EXPORTAR PDF</Button>
                    </div>
                </div>
                <div className="px-3">
                    <Row>
                        <Col sm={2}>
                            <ListGroup>
                                <ListGroupItem active={seleccionado === "FiltrarTodo"} tag="button" action onClick={() => this.FiltrarTodo()}>TODO</ListGroupItem>
                                <ListGroupItem active={seleccionado === "ProximosAvencerse"} tag="button" action onClick={() => this.ProximosAvencerse()}>PROXIMOS A VENCERSE</ListGroupItem>
                                <ListGroupItem active={seleccionado === "Stock"} tag="button" action onClick={() => this.Stock()}>STOCK</ListGroupItem>
                            </ListGroup>
                        </Col>

                        <Col sm={10}>
                            <div className="table-responsive card">
                                <div style={{ height: "calc(88vh - 45px)", overflowY: "auto" }}>
                                    <table className="table table-sm table-bordered table-striped  table-hover">
                                        <thead>
                                            <tr>
                                                <th>LOTE</th>
                                                <th>STOCK</th>
                                                <th>Nomb. GENÉRICO</th>
                                                <th>Nomb. COMERCIAL</th>
                                                <th>CONCENT.</th>
                                                <th>FECHA COMPRA</th>
                                                <th>COMPRA S/.</th>
                                                <th>VENTA S/.</th>
                                                <th>PRESENTACIÓN</th>
                                                <th>VENCIMIENTO</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {
                                                DataFiltrado.map((pro, i) =>
                                                    <tr key={`${i * 56}-${pro.id_lote}`}>
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
                                                        <td>{pro.nomb_generico_producto}</td>
                                                        <td>{pro.nomb_comercial_producto}</td>
                                                        <td>{pro.concentracion_producto} {pro.unidad_medida_producto}</td>
                                                        <td>{pro.fecha_aquicision_producto}</td>
                                                        <td>{pro.costo_adquirido_producto}</td>
                                                        <td>{pro.costo_producto}</td>
                                                        <td>{pro.nombre_presentacion}</td>
                                                        <td className="text-center">
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

                                                    </tr>
                                                )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </div>
            </Fragment>
        );
    }
}

export default ReporteProductos;