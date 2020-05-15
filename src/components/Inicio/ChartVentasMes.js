import React, { Component } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Axios from 'axios';


class ChartVentasMes extends Component {
    _isMounted = false;
    state = {
        DataVentasAnioAPI: []
    }

    componentDidMount = async () => {
        this._isMounted = true;
        this.SeleccionaAnio(2020)
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    SeleccionaAnio = async (anio) => {
        try {
            if (this._isMounted) {
                var ventasAnio = await Axios.post(`/ventas/poranio`, { "anio": anio })
                this.setState({ DataVentasAnioAPI: ventasAnio.data })
            }
            // console.log("ventas del añio 2020", ventasAnio.data)
        } catch (error) {
            console.error("error en consultar el api de ventas por año");
        }
    }
    render() {
        const { DataVentasAnioAPI } = this.state
        return (
            <div className="card">
                <div className="card-header font-weight-bold">
                    <div className="float-left"> Ventas Por Año</div>
                    <div className="float-right">
                        <select onChange={e => this.SeleccionaAnio(e.target.value)}>
                            <option value="2020">2020</option>
                            <option value="2021">2021</option>
                            <option value="2022">2022</option>
                            <option value="2019">2023</option>
                        </select>
                    </div>
                </div>
                <div className="card-body p-1 table-responsive" style={{ height: "calc(70vh)" }}>
                    <ResponsiveContainer width='100%' aspect={3.0 / 2.7}>
                        <BarChart
                            // width={555}
                            // height={500}
                            data={DataVentasAnioAPI}
                            margin={{
                                top: 5, right: 5, left: 2, bottom: 5,
                            }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="mes" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="total_venta" fill="#ffd300" name="Total de Ventas S/." />
                            <Bar dataKey="total_venta_descuento" fill="#ff8d00" name="Total de descuentos S/. " />
                            <Bar dataKey="cantidad_ventas" fill="#6e00ff" name="Cantidad de Ventas" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

        );
    }
}

export default ChartVentasMes