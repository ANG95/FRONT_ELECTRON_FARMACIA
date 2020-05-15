import React, { Component, Fragment } from 'react';
import { Container, Row, Col, Card, CardHeader, CardBody, Input, InputGroup, InputGroupAddon, Button, Collapse, InputGroupText } from 'reactstrap';
import { AiOutlineBarcode, AiOutlineForm, AiFillPrinter } from "react-icons/ai"
import Axios from 'axios';

const { BrowserWindow } = window.require('electron').remote

const fs = window.require('fs')
const url = window.require('url')
const path = window.require('path')

let CWD = process.cwd()
class Comprobante extends Component {
    state = {
        DataApiComprobantes: {
            ap_materno_cliente: "",
            ap_paterno_cliente: "",
            apaterno_usuario: "",
            descuento_venta: "",
            detalles: [],
            dni_cliente: "",
            fecha_venta: "",
            id_venta: "",
            nombre_usuario: "",
            nombres_cliente: "",
            observacion_venta: "",
            total_venta: ""
        },
        modoLectorCodigoBarra: true,
        txtFiltradorCodBarra: "",
        txtFiltrador: "",
        isOpenCollapse: "COMPROBANTE",
    }
    TxtModoLectorCodBarra = async (e) => {
        const { name, value } = e.target
        await this.reqBuscarComprobante(value);
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

    ModoManual = async (value) => {
        await this.reqBuscarComprobante(value);

        this.setState({
            txtFiltrador: value
        })
    }
    reqBuscarComprobante = async (NroComprobante) => {
        try {
            if (NroComprobante) {
                var Fechas = await Axios.post(`/ventas/buscar`, {
                    NroComprobante
                })
                console.log("Fechas ", Fechas);
                if (Fechas.status === 200) {
                    this.setState({ DataApiComprobantes: Fechas.data })
                }
                
            }
        } catch (error) {
            console.error("Buscar Comprobante", error);
        }
    }
    // el que se usa
    GenerarTICKET = async () => {
        const { DataApiComprobantes } = this.state
        var htmlContent = `
                  <!DOCTYPE html>
                    <html lang="en">
                    <head>
                      <meta charset="UTF-8">
                      <meta name="viewport" content="width=device-width, initial-scale=1.0">
                      <script src="./JsBarcode.all.min.js"></script>
                      <title>TICKET DE VENTA N° ${DataApiComprobantes.id_venta}</title>
                    </head>
                    <body>
                    <style type="text/css">
                    .printer-content {
                      position: absolute;
                      left: 0;
                      top: 0;
                      width: 58mm;
                      min-width: 58mm;
                      max-width: 58mm;
                      font-family: courier!important;
                      font-weight:bold;
                    }
                    @media print {
                        @page {
                          size: 58mm auto portrait;
                          margin: 0px 33px auto 16px;
                        }
                  
                        #printer-content {
                          position: absolute;
                          left: 0;
                          top: 0;
                          width: 58mm;
                          min-width: 58mm;
                          max-width: 58mm;
                          font-family: Courier New,Courier!important;
                        }
                  
                        table,
                        td,
                        th {
                          border: 1px solid #e7e7e7;
                          font-size: 9px;
                          padding: 1px;
                        }
                  
                        table {
                          border-collapse: collapse;
                          width: 100%;
                        }
                  
                        th {
                          text-align: center;
                        }
                  
                        .txtCenter {
                          text-align: center;
                        }
                  
                        .txtRight {
                          text-align: right;
                        }
                        .esconder{
                            font-size: 9px;
                            text-align: center;
                        }
                    }

                    </style>
                        <div class="printer-content">
                            <div style="text-align: center; font-size: 18px; font-weight: bold;">BOTICA DEL ROSARIO</div>
                            <div style="text-align: center; font-size: 7px;">RUC 10704526160 AV.SIMON BOLIVAR N°345 - PUNO</div>
                            <div style="font-size: 12px;  text-align: center; font-weight: bold;">TICKET DE VENTA N° ${DataApiComprobantes.id_venta}-d</div>
                            <div style="font-size: 10px; text-align: center;"><b>FECHA Y HORA: </b> ${DataApiComprobantes.fecha_venta}</div>
                            <div class="esconder"><b>Sr(a): </b>${DataApiComprobantes.ap_paterno_cliente} ${DataApiComprobantes.ap_materno_cliente} ${DataApiComprobantes.nombres_cliente}</div>
                            <table>
                                <thead>
                                    <tr>
                                        <th>CANT.</th>
                                        <th>DESCRIPCION</th>
                                        <th>P.U.</th>
                                        <th>IMPORTE</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${
            DataApiComprobantes.detalles.map(imp =>
                `<tr>
                                            <td class="txtCenter"> ${imp.cantidad_detalle_venta} </td>
                                            <td> ${imp.nomb_comercial_producto} ${imp.nomb_comercial_producto}</td>
                                            <td class="txtRight"> ${imp.precio_unit_detalle_venta} </td>
                                            <td class="txtRight"> ${+imp.precio_total_detalle_venta} </td>
                                        </tr>`
            ).join('\n')
            }
                                    <tr>
                                        <td colspan="3" class="txtRight">SUBTOTAL S/.</td>
                                        <td class="txtRight">${DataApiComprobantes.total_venta}</td>
                                    </tr>
                                    <tr>
                                        <td colspan="3" class="txtRight">DESCUENTO S/.</td>
                                        <td class="txtRight">${DataApiComprobantes.descuento_venta}</td>
                                    </tr>
                                    <tr>
                                        <td colspan="3" class="txtRight">IMPORTE A PAGAR S/.</td>
                                        <td class="txtRight">${(+DataApiComprobantes.total_venta - (+DataApiComprobantes.descuento_venta))}</td>
                                    </tr>
                                </tbody>
                            </table>
                        
                        <div style="text-align: center; display: flex; height: 100%;align-items: center;">
                            <svg id="barcode"></svg>    
                            <div>
                                <div style="font-size: 7px; text-align: center;">No se aceptan devoluciones</div>
                                <div style="font-size: 9px; text-align: center;">Gracias por su compra</div>
                            </div>
                        </div>

                        <script>
                            JsBarcode("#barcode", "${DataApiComprobantes.id_venta}",  {
                                format: "code128",
                                displayValue: false,
                                height: 30,
                                width: 2
                            });
                        </script>
                      </div>
                    </body>
                </html>`

        await fs.writeFileSync(path.join(CWD, "ticket.html"), htmlContent, error => {
            /* handle error */
            console.log("err", error);
        });

        let win = await new BrowserWindow({ show: false })
        // let win = await new BrowserWindow({
        //     width: 1024,
        //     height: 800,
        //     webPreferences: {
        //         plugins: true
        //     }
        // })
        // win.setMenuBarVisibility(false)

        // console.log("CWD ", CWD)

        await win.loadURL(url.format({
            pathname: path.join(CWD, 'ticket.html'),
            protocol: 'file'
        })
        )

        // configuracion 
        const options = {
            silent: true,
            deviceName: 'POS-58',
            header: false,
            footer: false,

        }

        win.webContents.print(options, (success, errorType) => {
            if (success) {
                console.log("genial ::", success)
            } else {
                console.log("errores ::", errorType)
            }
        })
    }

    render() {
        const { modoLectorCodigoBarra, isOpenCollapse, DataApiComprobantes, txtFiltradorCodBarra , txtFiltrador} = this.state
        return (
            <Fragment>
                <div className="font-weight-bold mb-2 px-3 shadow-sm p-2 bg-light">BUSCAR COMPRABANTE</div>
                <div className="px-1">
                    <Container fluid>
                        <Row>
                            <Col sm="3">
                                <Card>
                                    <CardHeader>
                                        MODO DE BUSQUEDA
                                    </CardHeader>
                                    <CardBody className="p-0">
                                        <fieldset>
                                            <legend style={{ cursor: "pointer", background: "#ccff01" }} onClick={() => this.setState({ isOpenCollapse: "COMPROBANTE" })}>POR N° DE COMPROBANTE:</legend>
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
                                                                placeholder="Escriba el N° del comprabante"
                                                                value={txtFiltrador}
                                                                onChange={e => { this.ModoManual(e.target.value)}}
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

                                        {/* <fieldset>
                                            <legend style={{ cursor: "pointer", background: "#ccff01" }} onClick={() => this.setState({ isOpenCollapse: "CLIENTE" })}>POR DATOS DEL CLIENTE:</legend>
                                            <Collapse isOpen={isOpenCollapse === "CLIENTE"}>
                                                en desarrollo
                                            </Collapse>
                                        </fieldset>
                                        <fieldset>
                                            <legend style={{ cursor: "pointer", background: "#ccff01" }} onClick={() => this.setState({ isOpenCollapse: "FECHAS" })}>POR RANGO DE FECHAS:</legend>
                                            <Collapse isOpen={isOpenCollapse === "FECHAS"}>
                                                en desarrollo
                                            </Collapse>
                                        </fieldset> */}
                                    </CardBody>
                                </Card>
                            </Col>
                            <Col sm="9">
                                <Card>
                                    <CardHeader>
                                        RESULTADOS
                                    </CardHeader>
                                    <CardBody className="p-1">
                                        <div style={{ height: "calc(85vh - 58px)", overflowY: "auto" }}>
                                            <table className="table table-sm table-bordered table-striped  table-hover">
                                                <thead>
                                                    <tr>
                                                        <th>N°.</th>
                                                        <th className="text-center">DNI</th>
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
                                                        <td>{DataApiComprobantes.id_venta}</td>
                                                        <td>{DataApiComprobantes.dni_cliente}</td>
                                                        <td>{`${DataApiComprobantes.nombres_cliente} ${DataApiComprobantes.ap_paterno_cliente} ${DataApiComprobantes.ap_materno_cliente}`}</td>
                                                        <td>{DataApiComprobantes.fecha_venta}</td>
                                                        <td>{DataApiComprobantes.observacion_venta}</td>
                                                        <td>{DataApiComprobantes.descuento_venta}</td>
                                                        <td>{DataApiComprobantes.total_venta}</td>
                                                        <td>{(+DataApiComprobantes.total_venta) - (+DataApiComprobantes.descuento_venta)}</td>
                                                        <td>{`${DataApiComprobantes.nombre_usuario} ${DataApiComprobantes.apaterno_usuario}`}</td>
                                                        <td><div onClick={() => this.GenerarTICKET()} style={{cursor:'pointer'}} title="IMPRIMIR DUPLICADO"><AiFillPrinter size={20} /></div></td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                            <table className="table table-sm table-bordered table-striped  table-hover">
                                                <thead>
                                                    <tr>
                                                        <th>CANT.</th>
                                                        <th className="text-center">NOMBRE</th>
                                                        <th className="text-center">P. UNIT.</th>
                                                        <th className="text-center">P. TOTAL</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {

                                                        DataApiComprobantes.detalles.map((ps, i) =>
                                                            <tr key={`${i * 5}-${ps.id_lote}`}>
                                                                <td style={{ width: "50px" }}>{ps.cantidad_detalle_venta}</td>
                                                                <td>{ps.nomb_comercial_producto} {`${ps.nomb_comercial_producto}`}</td>
                                                                <td className="text-right">S/. {ps.precio_unit_detalle_venta}</td>
                                                                <td className="text-right">S/. {`${+ps.precio_total_detalle_venta}`}</td>
                                                            </tr>
                                                        )
                                                    }
                                                </tbody>
                                                <tfoot>
                                                    <tr>
                                                        <th colSpan="3" className="text-right">DESCUENTO </th>
                                                        <th colSpan="2" className="text-center h6 text-success" style={{ width: "20px" }}>
                                                            <InputGroup size="sm">
                                                                <InputGroupAddon addonType="prepend">
                                                                    <InputGroupText>S/.</InputGroupText>
                                                                </InputGroupAddon>
                                                                <label className="text-center form-control form-control-sm">{DataApiComprobantes.descuento_venta} </label>
                                                            </InputGroup>
                                                        </th>
                                                    </tr>
                                                    <tr>
                                                        <th colSpan="3" className="text-right">TOTAL</th>
                                                        <th colSpan="2" className="text-center h4">
                                                            <InputGroup size="sm">
                                                                <InputGroupAddon addonType="prepend">
                                                                    <InputGroupText>S/. </InputGroupText>
                                                                </InputGroupAddon>
                                                                <label className="form-control" >{(+DataApiComprobantes.total_venta - (+DataApiComprobantes.descuento_venta))}</label>
                                                            </InputGroup>
                                                        </th>
                                                    </tr>
                                                </tfoot>
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