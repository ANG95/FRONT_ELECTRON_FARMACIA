import React, { PureComponent } from 'react'
import { Row, Col } from 'reactstrap'
import ChartVentasMes from './ChartVentasMes'

class Inicio extends PureComponent {

    state = {

    }

    render() {
        return (
            <div className="mt-2 px-3">
                <div className="card-deck">
                    <div className="card text-white bg-primary">
                        <div className="card-header">
                            Total de proveedores
                        </div>
                        <div className="card-body">
                            <h5 className="card-title">60</h5>
                        </div>
                    </div>
                    <div className="card text-white bg-success">
                        <div className="card-header">
                            Total de ventas
                        </div>
                        <div className="card-body">
                            <h5 className="card-title">1296</h5>
                        </div>
                    </div>
                    <div className="card text-white bg-dark">
                        <div className="card-header">
                            Producto mas vendido
                        </div>
                        <div className="card-body">
                            <h5 className="card-title">Amendazol</h5>
                        </div>
                    </div>
                </div>
                <br />

                <Row>
                    <Col sm={6}>
                        <div className="card">
                            <div className="card-header font-weight-bold">PRODUCTOS PROXIMOS A VENCERSE <div className="badge badge-primary">45</div></div>
                            <div className="card-body">

                                <div className="table-responsive">
                                    <table className="table table-sm table-bordered">
                                        <thead>
                                            <tr>
                                                <th>VENCIMIENTO</th>
                                                <th>PRODUCTO</th>
                                                <th>PRESENTACION</th>
                                                <th>PROVEEDOR</th>
                                                <th>STOCK</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td>20/02/2020</td>
                                                <td></td>
                                                <td></td>
                                                <td></td>
                                                <td></td>
                                            </tr>
                                            <tr>
                                                <td>20/02/2020</td>
                                                <td></td>
                                                <td></td>
                                                <td></td>
                                                <td></td>
                                            </tr>
                                            <tr>
                                                <td>20/02/2020</td>
                                                <td></td>
                                                <td></td>
                                                <td></td>
                                                <td></td>
                                            </tr>
                                            <tr>
                                                <td>20/02/2020</td>
                                                <td></td>
                                                <td></td>
                                                <td></td>
                                                <td></td>
                                            </tr>
                                            <tr>
                                                <td>20/02/2020</td>
                                                <td></td>
                                                <td></td>
                                                <td></td>
                                                <td></td>
                                            </tr>
                                            <tr>
                                                <td>20/02/2020</td>
                                                <td></td>
                                                <td></td>
                                                <td></td>
                                                <td></td>
                                            </tr>
                                            <tr>
                                                <td>20/02/2020</td>
                                                <td></td>
                                                <td></td>
                                                <td></td>
                                                <td></td>
                                            </tr>
                                            <tr>
                                                <td>20/02/2020</td>
                                                <td></td>
                                                <td></td>
                                                <td></td>
                                                <td></td>
                                            </tr>
                                            <tr>
                                                <td>20/02/2020</td>
                                                <td></td>
                                                <td></td>
                                                <td></td>
                                                <td></td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
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