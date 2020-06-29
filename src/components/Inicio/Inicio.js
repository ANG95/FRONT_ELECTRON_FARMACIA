import React, { PureComponent } from 'react'
import { Row, Col } from 'reactstrap'
import ChartVentasMes from './ChartVentasMes'
import Axios from 'axios'
import ProductosAlerta from './ProductosAlerta'

class Inicio extends PureComponent {

    state = {
        DataTotalProveedoresAPI: 0,
        VentasdescuentosAPI: {},
        masvendidoAPI: [],
        activeTab: '1',
    }
    componentDidMount = () => {
        this.reqProveedores()
        this.reqVentasdescuentosAPI()
        this.reqMasvendido()


    }
    reqProveedores = async () => {
        try {
            var row = await Axios.get(`/proveedores/cantidad`)
            this.setState({ DataTotalProveedoresAPI: row.data.Total })
            // console.log("row proveedores >", row.data);
        } catch (error) {
            console.error("errores EN OBTENER LOS PROVEEDORES");
        }
    }
    reqVentasdescuentosAPI = async () => {
        try {
            var ventas = await Axios.get(`/ventas/ventasdescuentos`)
            this.setState({ VentasdescuentosAPI: ventas.data })
            // console.log("VentasdescuentosAPI >", ventas.data);
        } catch (error) {
            console.error("errores EN OBTENER VentasdescuentosAPI");
        }
    }
    reqMasvendido = async () => {
        try {
            var masvendido = await Axios.get(`/productos/masvendido`)
            this.setState({ masvendidoAPI: masvendido.data })
            // console.log("masvendido >", masvendido.data);
        } catch (error) {
            console.error("errores EN OBTENER masvendido");
        }
    }

    render() {
        const { DataTotalProveedoresAPI, VentasdescuentosAPI, masvendidoAPI } = this.state
        return (
            <div className="mt-2 px-3">
                <div className="card-deck">
                    <div className="card text-white bg-primary">
                        <div className="card-header">
                            Total de proveedores
                        </div>
                        <div className="card-body">
                            <h5 className="card-title">{DataTotalProveedoresAPI}</h5>
                        </div>
                    </div>
                    <div className="card text-white bg-success">
                        <div className="card-header">
                            Total de ventas S/.
                        </div>
                        <div className="card-body">
                            <h5 className="card-title">
                                <b>Descuentos : </b>{VentasdescuentosAPI.total_descuentos} {" "}
                                <b>Ventas : </b>{VentasdescuentosAPI.total_ventas}
                            </h5>
                        </div>
                    </div>
                    <div className="card text-white bg-dark">
                        <div className="card-header">
                            Productos mas vendido
                        </div>
                        <div className="card-body pt-0">
                            {
                                masvendidoAPI.map((prod, k) =>
                                    <div style={{ borderBottom: "1px dashed #a9a9a9" }} key={k}>{`${prod.nomb_comercial_producto} ${prod.nomb_generico_producto} ${prod.concentracion_producto} vendido ${prod.producto}  `}</div>
                                )
                            }
                        </div>
                    </div>
                </div>
                <br />

                <Row>
                    <Col sm={6}>
                        <ProductosAlerta />
                    </Col>

                    <Col sm={6}>
                        <ChartVentasMes />
                    </Col>
                </Row>
            </div>

        )
    }
}

export default Inicio