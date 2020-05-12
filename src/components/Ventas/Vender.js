import React, { Component, Fragment } from 'react';
import { Row, Col, Card, CardBody, CardHeader, Input, Button, ModalHeader, ModalBody, Modal, Container, ButtonGroup, InputGroup, InputGroupAddon, InputGroupText, FormGroup, Label } from 'reactstrap'
import Axios from "axios"
import { MdDelete, MdRemove, MdPersonAdd } from "react-icons/md"
import { AiOutlineBarcode, AiOutlineForm } from "react-icons/ai"

import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { toast } from 'react-toastify';
import { fechaActual, debounce, fechaActualYMDhms, CantDias } from "../../config/Funciones"

const { BrowserWindow } = window.require('electron').remote

const fs = window.require('fs')
const url = window.require('url')
const path = window.require('path')
var Mousetrap = require('mousetrap');

let CWD = process.cwd()


class Vender extends Component {

    _isMounted = false;
    state = {
        DataProductosAPI: [],
        DataClienteAPI: {
            id_cliente: null,
            dni_cliente: "",
            nombres_cliente: "",
            ap_paterno_cliente: "",
            ap_materno_cliente: "",
            direccion_cliente: ""
        },
        DataSeleccionados: [],
        totalVenta: 0,
        modalCobrar: false,
        inputRecibido: 0,
        descuento: 0,
        txtObservacionVenta: "",
        txtFiltrador: "",
        txtFiltradorCodBarra: "",// valor del scanneo
        modalRegistrarCliente: false,
        modoLectorCodigoBarra: true,// modo en como se busca o selecciona el producto
        // focusInputBuscarUser: false

    }
    RefAutoFocus = React.createRef();

    componentDidMount = async () => {
        this._isMounted = true;
        this.reqProductos()

        Mousetrap.bind("ctrl+d", () => this.state.DataSeleccionados.length <= 0 ? null : this.modalToggle("modalCobrar", true));
        Mousetrap.bind("ctrl+s", () => this.GenerarTICKET());
        Mousetrap.bind("ctrl+g", () => this.ventaSinComprobante());
    }

    componentWillUnmount() {
        this._isMounted = false;
        Mousetrap.unbind("ctrl+d");
        Mousetrap.unbind("ctrl+s")
        Mousetrap.unbind("ctrl+g")
    }

    reqProductos = async () => {
        try {
            var row = await Axios.get(`/productos`)
            if (this._isMounted) {
                this.setState({ DataProductosAPI: row.data })
            }
            console.log("row productos", row.data);
        } catch (error) {
            console.error("errores en obtener los productos");
        }
    }

    productoSeleccionado = async (producto) => {
        let { DataProductosAPI, DataSeleccionados } = this.state
        var iP = DataProductosAPI.findIndex(p => p.cod_barra_lote === producto.cod_barra_lote)
        if (iP !== -1) {
            var StockLote = ((+DataProductosAPI[iP].stock_lote) - 1)
            if (StockLote % 1 !== 0) {
                // console.log("No Es un numero entero");
                StockLote = StockLote.toFixed(2)
            }
            // console.log("StockLote ", StockLote, typeof StockLote, StockLote % 1);
            DataProductosAPI[iP].stock_lote = StockLote
            var iPs = DataSeleccionados.findIndex(ps => ps.cod_barra_lote === producto.cod_barra_lote)
            // console.log("ip>", iPs);
            if (iPs === -1) {
                Object.assign(DataProductosAPI[iP], { "cantidadVenta": 1 })
                DataSeleccionados.push(DataProductosAPI[iP])
                this.calculaTotal()
            } else {
                var cantidadVenta = ((+DataSeleccionados[iPs].cantidadVenta) + 1)
                if (cantidadVenta % 1 !== 0) {
                    // console.log("NO Es un numero entero");
                    cantidadVenta = cantidadVenta.toFixed(2)
                }
                DataSeleccionados[iPs].cantidadVenta = cantidadVenta
                // console.log("DataSeleccionados ", DataSeleccionados);.toFixed(2)

                this.setState({ DataSeleccionados }, () => this.calculaTotal())
            }
        }
    }

    inputCantidad = (e, i, productoSelect) => {
        let { name, value } = e.target
        // console.log(name, value)
        // value = (+value)||0
        var { DataProductosAPI, DataSeleccionados } = this.state
        var dataProdapi = DataProductosAPI.findIndex(e => e.id_lote === productoSelect.id_lote)
        // console.log("🎉 ", dataProdapi);
        // console.log("DataProductosAPI", DataProductosAPI[dataProdapi])
        // DataSeleccionados[i].stock_lote = ((+DataProductosAPI[dataProdapi].stock_lote) + (productoSelect.cantidadVenta))
        var StockLote = (((+DataProductosAPI[dataProdapi].stock_lote) + (+productoSelect.cantidadVenta)) - value)
        if (StockLote % 1 !== 0) {
            StockLote = StockLote.toFixed(2)
        }
        // console.log("NO Es un numero entero", StockLote);

        if (value % 1 !== 0 && typeof value === Number ) {
            value = value.toFixed(2)
            // console.log(" value NO Es un numero entero", value);
        }
        DataProductosAPI[dataProdapi].stock_lote = StockLote
        
        DataSeleccionados[i][name] = value
        // console.log("DataSeleccionados", DataSeleccionados)

        this.setState({ DataSeleccionados, DataProductosAPI }, () => this.calculaTotal())
    }

    calculaTotal = () => {
        var { DataSeleccionados } = this.state
        var totalVenta = DataSeleccionados.reduce((inicio, fin) => {
            var importe = (+fin.costo_producto_lote * +fin.cantidadVenta || 0) || 0
            // console.log("importe ", importe)
            inicio = (inicio) + importe
            // console.log("inicio ", inicio)
            // console.log("fin ", fin.cantidad)
            return inicio

        }, 0)
        this.setState({ totalVenta })
        // console.log("totalVenta ", totalVenta)
    }

    modalToggle = (name, value) => {
        // console.log("name ", name, "value ", value);
        this.setState({ [name]: value })

        // this.setState({ focusInputBuscarUser: true })
        if (value && name === "modalCobrar") {
            setTimeout(() => {
                this.RefAutoFocus.current.focus();
                // console.log("focusInputBuscarUser", this.RefAutoFocus);
            }, 500)
        }


    }

    EliminarPS = (i, productoSelect) => {
        // console.log(name, value)
        var { DataProductosAPI, DataSeleccionados } = this.state
        var dataProdapi = DataProductosAPI.findIndex(e => e.id_lote === productoSelect.id_lote)
        DataProductosAPI[dataProdapi].stock_lote = ((+DataProductosAPI[dataProdapi].stock_lote) + (+productoSelect.cantidadVenta))

        DataSeleccionados.splice(i, 1)
        // console.log("x", DataSeleccionados);
        this.setState({ DataSeleccionados }, () => this.calculaTotal())

    }

    GenerarRecibo = async () => {
        try {
            var { DataSeleccionados, totalVenta, DataClienteAPI } = this.state
            // console.log("DataSeleccionados ", DataSeleccionados)
            let cantidad = [
                [
                    {
                        text: 'CANT.',
                        alignment: "center",
                        bold: true,
                        fontSize: 11
                    },
                    {
                        text: 'DESCRIPCION',
                        alignment: "center",
                        bold: true,
                        fontSize: 11

                    },
                    {
                        text: 'P. UNIT.',
                        alignment: "center",
                        bold: true,
                        fontSize: 11

                    },
                    {
                        text: 'IMPORTE',
                        alignment: "center",
                        bold: true,
                        fontSize: 11

                    }
                ]
            ]

            DataSeleccionados.forEach(serv => {
                cantidad.push(
                    [
                        {
                            text: serv.cantidadVenta,
                            alignment: "center",
                            fontSize: 9
                        },
                        {
                            text: serv.nomb_comercial_producto,
                            alignment: "left",
                            fontSize: 9

                        },
                        {
                            text: serv.costo_producto_lote,
                            alignment: "center",
                            fontSize: 9

                        },
                        {
                            text: (serv.cantidadVenta || 0) * +serv.costo_producto_lote,
                            alignment: "center",
                            fontSize: 9

                        }
                    ]
                )
            }
                // console.log(serv)
            );
            cantidad.push(
                [
                    {
                        text: 'TOTAL S/. ',
                        alignment: "right",
                        fontSize: 12,
                        colSpan: 3
                    },
                    {

                    },
                    {

                    },
                    {
                        text: totalVenta,
                        alignment: "center",
                        fontSize: 10

                    }
                ]
            )
            // var insertaBoleta = await Axios.post(`/boletas/crear`, {

            //     "fecha": new Date(),
            //     "id": DataEstudianteApi.id_usuario,
            //     "detalle": "total",
            //     "servicios": Servicios

            // })
            // console.log("Servicios ", Servicios);
            // console.log("insertaBoleta ", insertaBoleta);
            // console.log("cantidad ", cantidad);

            // GENERA EL FORMATO PDF
            pdfMake.vfs = pdfFonts.pdfMake.vfs;

            var docDefinition = {
                content: [
                    {
                        //alignment: 'justify',
                        columns: [
                            {
                                table: {
                                    widths: [120, "*"],
                                    body: [
                                        [
                                            {
                                                text: 'FARMACIA',
                                                alignment: "center",
                                                fontSize: 11.5,
                                                bold: true
                                            },
                                            {

                                                table: {
                                                    widths: [130],
                                                    body: [
                                                        [
                                                            {
                                                                text: 'RUC: 20447915015',
                                                                alignment: "center",
                                                                fontSize: 12,
                                                                bold: true
                                                            },
                                                        ],
                                                        [
                                                            {
                                                                text: 'BOLETA DE VENTA',
                                                                alignment: "center",
                                                                fillColor: '#0074c1',
                                                                color: "#ffffff",
                                                                bold: true,
                                                                fontSize: 14,

                                                            },
                                                        ],
                                                        [
                                                            {
                                                                text: `N° ${"00001"}`,
                                                                alignment: "center",
                                                                bold: true,
                                                                fontSize: 13,
                                                            },
                                                        ],
                                                    ]
                                                },
                                                layout: {
                                                    hLineWidth: function (i, node) {
                                                        return (i === 0 || i === node.table.body.length) ? 1 : 1;
                                                    },
                                                    vLineWidth: function (i, node) {
                                                        return (i === 0 || i === node.table.widths.length) ? 1 : 1;
                                                    },
                                                    hLineColor: function (i, node) {
                                                        return (i === 0 || i === node.table.body.length) ? 'black' : 'gray';
                                                    },
                                                    vLineColor: function (i, node) {
                                                        return (i === 0 || i === node.table.widths.length) ? 'black' : 'gray';
                                                    }
                                                },

                                            }
                                        ],
                                        [
                                            {
                                                border: [false, false, false, true],
                                                text: 'Av. Alfonso Ugarte N° 1064',
                                                alignment: "center",
                                                fontSize: 9,
                                                //   bold: true,
                                            },
                                            {
                                                text: `FECHA: ${fechaActual()}`,
                                                alignment: "center",
                                                fontSize: 13,
                                                bold: true,
                                            }
                                        ],
                                        [
                                            {
                                                text: ['Sr.(a): ', { text: `${DataClienteAPI.nombres_cliente} ${DataClienteAPI.ap_paterno_cliente} ${DataClienteAPI.ap_materno_cliente} `, italics: true, fontSize: 12 }],
                                                //   alignment: "center",
                                                fontSize: 11,
                                                colSpan: 2,
                                                bold: true
                                            },
                                            {

                                            }
                                        ],
                                        [
                                            {
                                                text: ['Dirección: ', { text: '', fontSize: 10 }],
                                                //   alignment: "center",
                                                fontSize: 11,
                                                colSpan: 2,
                                                bold: true
                                            },
                                            {

                                            }
                                        ]
                                    ],

                                },
                                layout: 'noBorders'

                            },
                            {
                                text: ''
                            }
                        ],

                    },
                    {
                        table: {
                            widths: [34, 114, 41, 52],
                            body: cantidad
                        },
                        layout: {
                            hLineWidth: function (i, node) {
                                return (i === 0 || i === node.table.body.length) ? 0.7 : 0.5;
                            },
                            vLineWidth: function (i, node) {
                                return (i === 0 || i === node.table.widths.length) ? 0.7 : 0.5;
                            },
                            hLineColor: function (i, node) {
                                return (i === 0 || i === node.table.body.length) ? 'black' : 'dark';
                            },
                            vLineColor: function (i, node) {
                                return (i === 0 || i === node.table.widths.length) ? 'black' : 'gray';
                            }
                        }
                    },
                    {
                        margin: [0, 25, 0, 0],

                        table: {
                            widths: [130, 130],
                            body: [
                                [
                                    {
                                        text: '................................. Tesoreria',
                                        alignment: "center",

                                    },
                                    {
                                        text: "................................. Jefe de administración",
                                        alignment: "center"
                                    }
                                ]
                            ]
                        },
                        layout: "noBorders"
                    }
                ],

                defaultStyle: {
                    columnGap: 2
                },
                pageMargins: [15, 20, 20, 20],
                pageSize: 'A4',
                // pageOrientation: 'landscape',

            };
            var pdfRecibo = pdfMake.createPdf(docDefinition)
            pdfRecibo.print()
            this.reqProductos()
            //   // console.log("pdfRecibo ", pdfRecibo) 
            //   pdfRecibo.getDataUrl((dataUrl) => {
            //     this.setState({ urlPdf: dataUrl })
            //     // console.log(dataUrl)
            //   })
        } catch (error) {
            console.error("errores al generar el pdf ", error)
        }


    }

    BuscarCliente = async (e) => {
        // console.log("e", e.target.value);
        try {
            if (e.target.value.length > 0) {
                var row = await Axios.post(`/clientes/buscar`, { "dni": e.target.value })
                if (row.data.id_cliente) {
                    if (this._isMounted) {
                        this.setState({ DataClienteAPI: row.data })
                    }
                } else {
                    toast.error('😒 Cliente no registrado', {
                        position: "top-right",
                        autoClose: 2000
                    })

                }

                console.log("row DataClienteAPI", row);
            }

        } catch (error) {
            console.error("errores DataClienteAPI ");
        }
    }
    // el que se usa
    GenerarTICKET = async () => {
        var { DataSeleccionados, totalVenta, txtObservacionVenta, DataClienteAPI, descuento } = this.state
        var insertaBoleta = await Axios.post(`/ventas/insertar`, {

            "fecha_venta": fechaActualYMDhms(),
            "observacion_venta": txtObservacionVenta,
            "descuento_venta": descuento,
            "total_venta": (totalVenta - (+descuento)).toFixed(2),
            "tb_clientes_id_cliente": DataClienteAPI.id_cliente,
            "tb_login_id_login": 1,
            "detalles": DataSeleccionados

        })
        console.log("insertaBoleta ", insertaBoleta);
        if (insertaBoleta.status === 200) {
            toast.success('✔ Venta realizada con éxito', {
                position: "top-right",
                autoClose: 1500
            })
            if (this._isMounted) {
                this.setState({
                    modalCobrar: false,
                    DataSeleccionados: [],
                    totalVenta: 0,
                    inputRecibido: 0,
                    descuento: 0,
                    txtObservacionVenta: "",
                    DataClienteAPI: {
                        id_cliente: null,
                        dni_cliente: "",
                        nombres_cliente: "",
                        ap_paterno_cliente: "",
                        ap_materno_cliente: "",
                        direccion_cliente: ""
                    }
                })
            }
            this.reqProductos()
            var htmlContent = `
                  <!DOCTYPE html>
                    <html lang="en">
                    <head>
                      <meta charset="UTF-8">
                      <meta name="viewport" content="width=device-width, initial-scale=1.0">
                      <script src="./JsBarcode.all.min.js"></script>
                      <title>Ticket de venta</title>
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
                            <div style="text-align: center; font-size: 18px; font-weight: bold;">BOTICA VIRGEN DEL ROSARIO</div>
                            <div style="text-align: center; font-size: 7px;">RUC 10704526160 AV.SIMON BOLIVAR N°345 - PUNO</div>
                            <div style="font-size: 12px;  text-align: center; font-weight: bold;">TICKET DE VENTA N° ${insertaBoleta.data.id_venta}</div>
                            <div style="font-size: 10px; text-align: center;"><b>FECHA Y HORA: </b> ${insertaBoleta.data.fecha_venta}</div>
                            <div class="esconder"><b>Sr(a): </b>${DataClienteAPI.ap_paterno_cliente} ${DataClienteAPI.ap_materno_cliente} ${DataClienteAPI.nombres_cliente}</div>
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
                DataSeleccionados.map(imp =>
                    `<tr>
                                                <td class="txtCenter"> ${imp.cantidadVenta} </td>
                                                <td> ${imp.nomb_comercial_producto} ${imp.concentracion_producto} ${imp.unidad_medida_producto} </td>
                                                <td class="txtRight"> ${imp.costo_producto_lote} </td>
                                                <td class="txtRight"> ${((imp.cantidadVenta || 0) * +imp.costo_producto_lote).toFixed(2)} </td>
                                            </tr>`
                ).join('\n')
                }
                                    <tr>
                                        <td colspan="3" class="txtRight">SUBTOTAL S/.</td>
                                        <td class="txtRight">${(+totalVenta).toFixed(2)}</td>
                                    </tr>
                                    <tr>
                                        <td colspan="3" class="txtRight">DESCUENTO S/.</td>
                                        <td class="txtRight">${(+descuento).toFixed(2)}</td>
                                    </tr>
                                    <tr>
                                        <td colspan="3" class="txtRight">IMPORTE A PAGAR S/.</td>
                                        <td class="txtRight">${(totalVenta - (+descuento)).toFixed(2)}</td>
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
                            JsBarcode("#barcode", "${insertaBoleta.data.id_venta}",  {
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
        } else {
            toast.error('❌ Errores al realizar la venta. ¿ Seleccionaste un cliente  ? o puede que su session haya caducado', {
                position: "top-right",
                autoClose: 3500
            })
        }
    }

    ventaSinComprobante = async () => {
        var { DataSeleccionados, totalVenta, txtObservacionVenta, DataClienteAPI, descuento } = this.state

        var insertaBoleta = await Axios.post(`/ventas/insertar`, {
            "fecha_venta": fechaActualYMDhms(),
            "observacion_venta": txtObservacionVenta,
            "descuento_venta": descuento,
            "total_venta": (totalVenta - (+descuento)).toFixed(2),
            "tb_clientes_id_cliente": DataClienteAPI.id_cliente,
            "tb_login_id_login": 1,
            "detalles": DataSeleccionados

        })
        console.log("insertaBoleta ", insertaBoleta);
        if (insertaBoleta.status === 200) {
            toast.success('✔ Venta realizada con éxito', {
                position: "top-right",
                autoClose: 1500
            })
            if (this._isMounted) {
                this.setState({
                    modalCobrar: false,
                    DataSeleccionados: [],
                    totalVenta: 0,
                    inputRecibido: 0,
                    descuento: 0,
                    txtObservacionVenta: "",
                    DataClienteAPI: {
                        id_cliente: null,
                        dni_cliente: "",
                        nombres_cliente: "",
                        ap_paterno_cliente: "",
                        ap_materno_cliente: "",
                        direccion_cliente: ""
                    }
                })
            }
            this.reqProductos();
        } else {
            toast.error('❌ Errores al realizar la venta. ¿ Seleccionaste un cliente  ? o puede que su session haya caducado', {
                position: "top-right",
                autoClose: 3500
            })
        }
    }

    GenerarTICKET2 = async () => {
        try {
            var { DataSeleccionados, totalVenta, txtObservacionVenta, DataClienteAPI, descuento } = this.state
            pdfMake.vfs = pdfFonts.pdfMake.vfs;
            let cantidad = [
                [
                    {
                        text: 'CANT.',
                        alignment: "center",
                        bold: true,
                        fontSize: 6
                    },
                    {
                        text: 'DESCRIPCION',
                        alignment: "center",
                        bold: true,
                        fontSize: 6

                    },
                    {
                        text: 'P. UNIT.',
                        alignment: "center",
                        bold: true,
                        fontSize: 6

                    },
                    {
                        text: 'IMPORTE',
                        alignment: "center",
                        bold: true,
                        fontSize: 6

                    }
                ]
            ]

            DataSeleccionados.forEach(serv => {
                cantidad.push(
                    [
                        {
                            text: serv.cantidadVenta,
                            alignment: "center",
                            fontSize: 5
                        },
                        {
                            text: serv.nomb_comercial_producto,
                            alignment: "left",
                            fontSize: 5
                        },
                        {
                            text: serv.costo_producto_lote,
                            alignment: "center",
                            fontSize: 5
                        },
                        {
                            text: (serv.cantidadVenta || 0) * +serv.costo_producto_lote,
                            alignment: "center",
                            fontSize: 5
                        }
                    ]
                )
            });
            cantidad.push(
                [
                    {
                        text: 'SUBTOTAL S/. ',
                        alignment: "right",
                        colSpan: 3
                    },
                    {

                    },
                    {

                    },
                    {
                        text: `${(+totalVenta).toFixed(2)}`,
                        alignment: "center"
                    }
                ],
                [
                    {
                        text: 'DESCUENTO S/. ',
                        alignment: "right",
                        colSpan: 3
                    },
                    {

                    },
                    {

                    },
                    {
                        text: `${(+descuento).toFixed(2)}`,
                        alignment: "center"
                    }
                ],
                [
                    {
                        text: 'IMPORTE A PAGAR S/. ',
                        alignment: "right",
                        colSpan: 3
                    },
                    {

                    },
                    {

                    },
                    {
                        text: (totalVenta - (+descuento)).toFixed(2),
                        alignment: "center"
                    }
                ]

            )
            Axios.defaults.adapter = require('axios/lib/adapters/http');
            var insertaBoleta = await Axios.post(`/ventas/insertar`, {

                "fecha_venta": fechaActualYMDhms(),
                "observacion_venta": txtObservacionVenta,
                "descuento_venta": descuento,
                "total_venta": (totalVenta - (+descuento)).toFixed(2),
                "tb_clientes_id_cliente": DataClienteAPI.id_cliente,
                "tb_login_id_login": 1,
                "detalles": DataSeleccionados

            })
            console.log("insertaBoleta ", insertaBoleta);
            if (insertaBoleta.status === 200) {
                toast.success('✔ Venta realizada con éxito', {
                    position: "top-right",
                    autoClose: 2000
                })
                this.setState({
                    modalCobrar: false,
                    DataSeleccionados: [],
                    totalVenta: 0,
                    inputRecibido: 0,
                    descuento: 0,
                    txtObservacionVenta: "",
                    DataClienteAPI: {
                        id_cliente: null,
                        dni_cliente: "",
                        nombres_cliente: "",
                        ap_paterno_cliente: "",
                        ap_materno_cliente: "",
                        direccion_cliente: ""
                    }
                })
                // GENERA EL FORMATO PDF

                var docDefinition = {
                    content: [
                        {
                            text: "FARMACIA",
                            alignment: "center",
                            fontSize: 25,
                            bold: true
                        },
                        {
                            text: 'FARMACIA S.A.C. RUC: 107587118205 TELEF: 052 556562',
                            alignment: "center",
                            fontSize: 5,
                        },
                        {
                            text: `TICKET DE VENTA N° ${insertaBoleta.data.id_venta}`,
                            alignment: "center",
                            fontSize: 11.5,
                            bold: true
                        },

                        {
                            text: `FECHA DE EMISION: ${insertaBoleta.data.fecha_venta}`,
                            alignment: "left",
                        },
                        {
                            text: `Sr(a): ${DataClienteAPI.ap_paterno_cliente} ${DataClienteAPI.ap_materno_cliente}, ${DataClienteAPI.nombres_cliente} `,
                            // alignment: "center",
                        },
                        {
                            margin: [0, 2, 0, 5],
                            table: {
                                widths: ["auto", "*", "auto", "auto"],
                                body: cantidad
                            },
                            layout: {
                                hLineWidth: function (i, node) {
                                    return (i === 0 || i === node.table.body.length) ? 0.1 : 0.1;
                                },
                                vLineWidth: function (i, node) {
                                    return (i === 0 || i === node.table.widths.length) ? 0.1 : 0.1;
                                },
                                hLineColor: function (i, node) {
                                    return (i === 0 || i === node.table.body.length) ? 'gray' : 'gray';
                                },
                                vLineColor: function (i, node) {
                                    return (i === 0 || i === node.table.widths.length) ? 'gray' : 'gray';
                                }
                            }
                        },
                        {
                            qr: `${insertaBoleta.data.id_venta}`,
                            fit: '42',
                            alignment: "center",
                            link: 'http://google.com'
                        },
                        {
                            text: '¡Gracias por su compra!',
                            link: 'http://google.com',
                            alignment: "center",

                        }
                    ],
                    pageSize: {
                        width: 160,
                        height: 'auto'
                    },
                    defaultStyle: {
                        // font: 'Courier',
                        fontSize: 6
                    },
                    pageMargins: [13, 20, 10, 20],
                    // pageOrientation: 'portrait'
                }
                var pdfRecibo = pdfMake.createPdf(docDefinition)
                pdfRecibo.print()
                this.reqProductos()
            } else {
                toast.error('❌ Errores al realizar la venta. ¿ Seleccionaste un cliente  ? o puede que su session haya caducado', {
                    position: "top-right",
                    autoClose: 3500
                })
            }

        } catch (error) {
            console.error("errores al intentar registrar la venta");
        }
    }

    TxtObservacion = debounce((name, value) => {
        // var { AfiliadoSeleccionado } = this.state
        // console.log("name", name, "value ", value)
        // AfiliadoSeleccionado[name] = value

        this.setState({ [name]: value })
    }, 300)

    TxtRegistrarCliente = debounce((name, value) => {
        let { DataClienteAPI } = this.state
        console.log("name:", name, "value ", value)
        // console.log("ssss>>", DataClienteAPI[name] = value)
        DataClienteAPI[name] = value

        this.setState({ DataClienteAPI })
    }, 500)

    GuardarCliente = async () => {
        try {
            var { DataClienteAPI } = this.state
            var dataInsert = await Axios.post(`/clientes/insertar`, DataClienteAPI)
            if (dataInsert.status === 200) {
                toast.success('✔ Cliente registrado', {
                    position: "top-right",
                    autoClose: 2000
                })
                if (this._isMounted) {
                    this.setState({
                        modalRegistrarCliente: false,
                        // DataSeleccionados: [],
                        // totalVenta: 0,
                        // inputRecibido: 0,
                        // descuento: 0,
                        // txtObservacionVenta: ""
                    })
                }
                DataClienteAPI.id_cliente = dataInsert.data.id_ClienteInsertado
                this.setState({ DataClienteAPI })
                console.log("dataInsert productos", dataInsert);
            } else {
                toast.error(' Cliente NO registrado', {
                    position: "top-right",
                    autoClose: 2500
                })
            }

        } catch (error) {
            console.error("errores en guardar datos del cliente", error);
        }
    }

    CambioModoSeleccionProducto = async () => {
        this.setState({
            modoLectorCodigoBarra: !this.state.modoLectorCodigoBarra,
            txtFiltradorCodBarra: "",
            txtFiltrador: ""
        })
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

    render() {
        let { DataProductosAPI, DataSeleccionados, totalVenta, modalCobrar, txtFiltradorCodBarra, inputRecibido,
            descuento, DataClienteAPI, txtFiltrador, modalRegistrarCliente, modoLectorCodigoBarra } = this.state

        let buscar = txtFiltrador.trim().toLowerCase();
        if (buscar.length > 0) {
            DataProductosAPI = DataProductosAPI.filter((e) => e.nomb_comercial_producto.toLowerCase().match(buscar) || e.nomb_generico_producto.toLowerCase().match(buscar));
        }

        return (
            <Fragment>
                <div className="font-weight-bold mb-2 px-3 shadow-sm p-2 bg-light">REALIZAR NUEVA VENTA</div>
                <div className="px-3">
                    <Row>
                        <Col sm={7}>
                            <Card>
                                <CardHeader className="clear-fix" style={{ padding: "9px 15px 0px 11px" }}>
                                    <div className="float-left h5">Buscar producto</div>
                                    <div className="float-right d-flex">
                                        <InputGroup size="sm" className="mb-2" >
                                            {
                                                modoLectorCodigoBarra ?
                                                    <Input
                                                        type="text"
                                                        name="txtFiltradorCodBarra"
                                                        value={txtFiltradorCodBarra}
                                                        placeholder="Escanee el código de barras"
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
                                    </div>
                                </CardHeader>
                                <CardBody className="p-1">
                                    <div className="table-responsive">
                                        <div style={{ height: "calc(94vh - 92px)", overflowY: "auto" }}>
                                            <table className="table table-sm table-bordered table-striped  table-hover">
                                                <thead>
                                                    <tr>
                                                        <th>STOCK</th>
                                                        <th>Nomb. GENÉRICO</th>
                                                        <th>Nomb. COMERCIAL</th>
                                                        <th>S/.</th>
                                                        <th>CONCENT.</th>
                                                        <th>PRESENTACIÓN</th>
                                                        <th>VENCIMIENTO</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {
                                                        DataProductosAPI.map((pro, i) =>
                                                            <tr key={`${i * 56}-${pro.id_lote}`} onDoubleClick={() => this.productoSeleccionado(pro, i)} style={{ cursor: "pointer" }}>
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
                                                                <td>{pro.costo_producto_lote}</td>
                                                                <td>{pro.concentracion_producto} {pro.unidad_medida_producto}</td>
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
                                </CardBody>
                            </Card>
                        </Col>

                        <Col sm={5}>
                            <Card className="border-success">
                                <CardHeader>
                                    <div className="float-left h5"> Carrito de Ventas</div>
                                    <div className="float-right h5"><b> Total : S/. </b> {totalVenta.toFixed(2)}</div>
                                </CardHeader>
                                <CardBody className="p-1">
                                    <div style={{ height: "calc(85vh - 58px)", overflowY: "auto" }}>
                                        <table className="table table-sm table-bordered table-striped  table-hover">
                                            <thead>
                                                <tr>
                                                    <th>CANT.</th>
                                                    <th className="text-center">NOMBRE</th>
                                                    <th className="text-center">P. UNIT.</th>
                                                    <th className="text-center">P. TOTAL</th>
                                                    <th></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {
                                                    DataSeleccionados.map((ps, i) =>
                                                        <tr key={`${i * 5}-${ps.id_lote}`}>
                                                            <td style={{ width: "50px" }}>
                                                                <Input bsSize="sm" type="text" value={ps.cantidadVenta} name="cantidadVenta" onChange={e => this.inputCantidad(e, i, ps)} autoComplete="false" />
                                                                {//<i className={(+ps.stock_lote) < (+ps.cantidadVenta) ? "text-danger visible" : "d-none"}>{`Stock = ${ps.stock_lote}`}</i>
                                                                }
                                                            </td>
                                                            <td>{ps.nomb_comercial_producto} {`${ps.concentracion_producto} ${ps.unidad_medida_producto}`}</td>
                                                            <td className="text-right">S/. {ps.costo_producto_lote}</td>
                                                            <td className="text-right">S/. {`${((+ps.costo_producto_lote) * ps.cantidadVenta || 0).toFixed(2)}`}</td>
                                                            <td className="text-center"><Button size="sm" color="danger" title="Eliminar" className="p-0" onClick={() => this.EliminarPS(i, ps)}><MdDelete size={15} /></Button></td>
                                                        </tr>
                                                    )}
                                            </tbody>
                                            <tfoot>
                                                <tr>
                                                    <th colSpan="3" className="text-right">DESCUENTO </th>
                                                    <th colSpan="2" className="text-center h6 text-success" style={{ width: "20px" }}>
                                                        <InputGroup size="sm">
                                                            <InputGroupAddon addonType="prepend">
                                                                <InputGroupText><MdRemove /></InputGroupText>
                                                            </InputGroupAddon>
                                                            <Input type="text" className="text-center" defaultValue={descuento} onChange={e => this.setState({ descuento: e.target.value })} />
                                                            <InputGroupAddon addonType="append">
                                                                <InputGroupText>S/.</InputGroupText>
                                                            </InputGroupAddon>
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
                                                            <label className="form-control" >{(totalVenta - (+descuento)).toFixed(2)}</label>
                                                        </InputGroup>
                                                    </th>

                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                    <Row form>
                                        <Col md={9}>
                                            <Input rows="1" type="textarea" name="txtObservacionVenta" placeholder="Observacion de la venta" onChange={e => { this.TxtObservacion(e.target.name, e.target.value) }} />
                                        </Col>
                                        <Col md={3}>
                                            <Button color="warning" disabled={DataSeleccionados.length <= 0} onClick={() => this.modalToggle("modalCobrar", true)} title="presione Ctrl+D">COBRAR </Button>
                                        </Col>
                                    </Row>
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                </div>
                {
                    // MODAL REGISTRAR NUEVO CLIENTE
                    <Modal isOpen={modalRegistrarCliente} toggle={() => this.modalToggle("modalRegistrarCliente", false)} size="sm">
                        <ModalHeader className="bg-primary text-white" toggle={() => this.modalToggle("modalRegistrarCliente", false)}>REGISTRAR NUEVO CLIENTE</ModalHeader>
                        <ModalBody>
                            <FormGroup>
                                <Label for="DNI">N° DNI</Label>
                                <Input type="text" name="dni_cliente" id="DNI" defaultValue={DataClienteAPI.dni_cliente} onChange={e => { this.TxtRegistrarCliente(e.target.name, e.target.value) }} />

                            </FormGroup>

                            <FormGroup>
                                <Label for="Nombres">Nombres</Label>
                                <Input type="text" name="nombres_cliente" id="Nombres" onChange={e => { this.TxtRegistrarCliente(e.target.name, e.target.value) }} />
                            </FormGroup>

                            <FormGroup>
                                <Label for="Apaterno">Apellido paterno</Label>
                                <Input type="text" name="ap_paterno_cliente" id="Apaterno" onChange={e => { this.TxtRegistrarCliente(e.target.name, e.target.value) }} />
                            </FormGroup>

                            <FormGroup>
                                <Label for="AMaterno">Apellido Materno</Label>
                                <Input type="text" name="ap_materno_cliente" id="AMaterno" onChange={e => { this.TxtRegistrarCliente(e.target.name, e.target.value) }} />
                            </FormGroup>

                            <FormGroup>
                                <Label for="direccion">Dirección</Label>
                                <Input type="text" name="direccion_cliente" id="direccion" onChange={e => { this.TxtRegistrarCliente(e.target.name, e.target.value) }} />
                            </FormGroup>
                            <div className="float-right">
                                <Button color="success" size="sm" onClick={this.GuardarCliente}>GUARDAR </Button>
                            </div>
                        </ModalBody>
                    </Modal>
                }
                {// modal resumen de VENTA
                }
                <Modal isOpen={modalCobrar} toggle={() => this.modalToggle("modalCobrar", false)} size="lg" backdrop={"static"}>
                    <ModalHeader className="bg-primary text-white" toggle={() => this.modalToggle("modalCobrar", false)}>RESUMEN DE LA VENTA / AGREGAR CLIENTE</ModalHeader>
                    <ModalBody>
                        <Container fluid >
                            <Row>
                                <Col sm={4}>
                                    <Card className="bg-info text-white mb-2 h5">
                                        <CardHeader>
                                            <div className="float-left ">TOTAL:</div>
                                            <div className="float-right font-weight-bold">S/. {totalVenta.toFixed(2)}</div>
                                        </CardHeader>
                                    </Card>

                                    <Card className="bg-success text-white mb-2 h5">
                                        <CardHeader>
                                            <div className="float-left ">DESCUENTO:</div>
                                            <div className="float-right font-weight-bold">S/. {descuento}</div>
                                        </CardHeader>
                                    </Card>

                                    <Card className="bg-dark text-white h5 shadow-lg">
                                        <CardHeader>TOTAL A COBRAR</CardHeader>
                                        <CardBody>
                                            <div className="h1 text-center"> S/. {(totalVenta - (+descuento)).toFixed(2)} </div>
                                        </CardBody>
                                    </Card>
                                    <hr />
                                    <Card className="bg-primary mt-2 mb-2 text-white h5">
                                        <CardHeader>RECIBIDO  </CardHeader>
                                        <CardBody>
                                            <InputGroup size="sm">
                                                <InputGroupAddon addonType="prepend">
                                                    <InputGroupText>S/. </InputGroupText>
                                                </InputGroupAddon>
                                                <Input bsSize="sm" placeholder="DINERO RECIBIDO" onChange={e => this.setState({ inputRecibido: e.target.value })} />                                            </InputGroup>
                                        </CardBody>
                                    </Card>
                                    <Card className="bg-warning h5  text-white">
                                        <CardHeader>VUELTO</CardHeader>
                                        <CardBody>
                                            <div className="h3 text-center"> S/. {`${(+inputRecibido) < ((+totalVenta) - (+descuento)) ? 0 : ((+inputRecibido) - ((+totalVenta) - (+descuento))).toFixed(2)}`}</div>
                                        </CardBody>
                                    </Card>
                                </Col>

                                <Col sm={8}>
                                    <InputGroup size="sm" className="mb-2" >
                                        <input className="form-control form-control-sm" type="text" ref={this.RefAutoFocus} placeholder="buscar usuario por DNI" onBlur={this.BuscarCliente} />
                                        <InputGroupAddon addonType="prepend"><Button onClick={() => this.modalToggle("modalRegistrarCliente", true)} title="Regisrar nuevo cliente"><MdPersonAdd size={15} /></Button></InputGroupAddon>
                                    </InputGroup>

                                    <Row form>
                                        <Col md={3}>
                                            <FormGroup>
                                                <Label>DNI</Label>
                                                <label className="form-control form-control-sm">{DataClienteAPI.dni_cliente}</label>
                                            </FormGroup>
                                        </Col>
                                        <Col md={9}>
                                            <FormGroup>
                                                <Label for="nombres">NOMBRES Y APELLIDOS</Label>
                                                <label className="form-control form-control-sm">{`${DataClienteAPI.nombres_cliente} ${DataClienteAPI.ap_paterno_cliente} ${DataClienteAPI.ap_materno_cliente} `}</label>
                                            </FormGroup>
                                        </Col>
                                    </Row>

                                    <Card className="border-secondary shadow-sm">
                                        <CardHeader>DETALLES DE COMPRA</CardHeader>
                                        <CardBody className="p-1">
                                            <div style={{ height: "calc(70vh - 100px)", overflowY: "auto" }}>
                                                <table className="table table-sm table-bordered table-striped  table-hover">
                                                    <thead>
                                                        <tr>
                                                            <th>CANT.</th>
                                                            <th className="text-center">NOMBRE</th>
                                                            <th className="text-center">P. UNIT.</th>
                                                            <th className="text-center">P. TOTAL</th>
                                                            <th></th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {
                                                            DataSeleccionados.map((ps, i) =>
                                                                <tr key={i}>
                                                                    <td style={{ width: "50px" }}>
                                                                        <Input bsSize="sm" type="text" value={ps.cantidadVenta} name="cantidadVenta" onChange={e => this.inputCantidad(e, i, ps)} />
                                                                    </td>
                                                                    <td>{ps.nomb_comercial_producto} {`${ps.concentracion_producto} ${ps.unidad_medida_producto}`}</td>
                                                                    <td className="text-right">S/. {ps.costo_producto_lote}</td>
                                                                    <td className="text-right">S/. {`${((+ps.costo_producto_lote) * ps.cantidadVenta || 0).toFixed(2)}`}</td>
                                                                    <td className="text-center"><Button size="sm" color="danger" title="Eliminar" className="p-0" onClick={() => this.EliminarPS(i, ps)}><MdDelete size={15} /></Button></td>
                                                                </tr>
                                                            )}
                                                    </tbody>
                                                </table>
                                            </div>
                                            <ButtonGroup style={{ display: "flex" }}>
                                                <Button color="warning" size="sm" title="Ctrl+G" disabled={DataSeleccionados.length <= 0} onClick={() => this.ventaSinComprobante()}>TERMINAR VENTA</Button>
                                                {    // <Button color="success" size="sm" disabled={DataSeleccionados.length <= 0} onClick={() => this.GenerarRecibo()}>IMPRIMIR BOLETA</Button>
                                                }
                                                <Button color="dark" size="sm" title="Ctrl+S" disabled={DataSeleccionados.length <= 0} onClick={() => this.GenerarTICKET()}>IMPRIMIR TICKET</Button>
                                            </ButtonGroup>
                                        </CardBody>
                                    </Card>
                                </Col>
                            </Row>
                        </Container>
                    </ModalBody>
                </Modal>
            </Fragment>

        );
    }
}

export default Vender;  