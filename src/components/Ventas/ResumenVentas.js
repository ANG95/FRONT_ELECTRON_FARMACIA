import React, { Component, Fragment } from 'react';

class ResumenVentas extends Component {
    state = {
    }
    render() {
        return (
            <Fragment>
                <div className="font-weight-bold mb-2 px-3 shadow-sm p-2 bg-light">RESUMEN DE VENTAS REALIZADAS</div>

                <div className="px-3">
                    <div className="card-group">
                        <div className="card">
                            <div className="card-body">
                                <h5 className="card-title text-center">TOTAL DE VENTAS</h5>
                                <p className="card-text">S/. 2500.02</p>
                                <p className="card-text">de 50 ventas</p>
                            </div>
                            <div className="card-footer">
                                <small className="text-muted">* Total de ventas realizadas hasta hoy</small>
                            </div>
                        </div>
                        <div className="card">
                            <div className="card-body">
                                <h5 className="card-title text-center">DESCUENTOS</h5>
                                <p className="card-text">S/. 2500.02</p>
                                <p className="card-text"> de un total de 50 ventas</p>
                            </div>
                            <div className="card-footer">
                                <small className="text-muted">* Descuentos realizados por venta</small>
                            </div>
                        </div>
                        {/* <div className="card">
                            <div className="card-body">
                                <h5 className="card-title text-center">GANANCIAS</h5>
                                <p className="card-text">This is a wider card with sirst to show that equal height action.</p>
                            </div>
                            <div className="card-footer">
                                <small className="text-muted">Ganancias = tatal de ventas - descuentos </small>
                            </div>
                        </div> */}
                        <div className="card">
                            <div className="card-body">
                                <h5 className="card-title text-center">PERDIDAS</h5>
                                <p className="card-text">S/. 2500.02</p>
                                <p className="card-text">de 5 Lotes</p>
                            </div>
                            <div className="card-footer">
                                <small className="text-muted">* Productos vencidos</small>
                            </div>
                        </div>
                        <div className="card">
                            <div className="card-body">
                                <h5 className="card-title text-center">EN ALMACEN</h5>
                                <p className="card-text">S/. 2500.02</p>
                                <p className="card-text">5 lotes por vencerse</p>
                                <p className="card-text">52 lotes con stock mínimo </p>
                                {/* <p className="card-text">de un total de 5 Productos</p> */}
                            </div>
                            <div className="card-footer">
                                <small className="text-muted">* Que se encuentran aun en almacen</small>
                            </div>
                        </div>
                    </div>
                </div>

            </Fragment>
        );
    }
}

export default ResumenVentas;