import React, { useState, Fragment, useEffect } from 'react';
import Axios from 'axios';
import { Nav, NavItem, NavLink } from 'reactstrap'
import classnames from 'classnames';
import { CantDias } from '../../config/Funciones';

function ProductosAlerta() {
    // Declaración de una variable de estado que llamaremos "count"
    const [activeTab, setActiveTab] = useState("1");
    const [DataProductosAPI, setDataProductosAPI] = useState([]);
    const [DataFiltrado, setDataFiltrado] = useState([]);


    useEffect(() => {
        reqProductos();
    }, [])

    const reqProductos = async () => {
        try {
            var row = await Axios.get(`/productos/Lotescategorias`)
            let filtrado = row.data.filter(dp => CantDias(dp.fecha_vencimiento_lote) < 90)
            setDataFiltrado(filtrado)
            setDataProductosAPI(row.data)
            console.log("row productos", row.data);
        } catch (error) {
            console.error("errores en obtener los productos");
        }
    }

    const ProximosAvencerse = () => {
        let filtrado = DataProductosAPI.filter(dp => CantDias(dp.fecha_vencimiento_lote) < 90)
        setDataFiltrado(filtrado)
        setActiveTab("1")
    }

    const Stock = () => {
        let stockFil = DataProductosAPI.filter(dp => dp.stock_lote < 60)
        setDataFiltrado(stockFil)
        setActiveTab("2")

    }

    return (
        <Fragment>
            <div className="card">
                {/* <div className="card-header font-weight-bold">PRODUCTOS PROXIMOS A VENCERSE <div className="badge badge-primary">45</div></div> */}
                <Nav tabs className="mt-2">
                    <NavItem className="ml-2">
                        <NavLink
                            className={classnames({ active: activeTab === '1' })}
                            onClick={() => { ProximosAvencerse(); }}
                        >
                            PROXIMOS A VENCERSE
                        </NavLink>
                    </NavItem>
                    <NavItem>
                        <NavLink
                            className={classnames({ active: activeTab === '2' })}
                            onClick={() => { Stock(); }}
                        >
                            STOCK MININO
                        </NavLink>
                    </NavItem>
                </Nav>
                <div className="card-body p-1">

                    <div className="table-responsive">
                        <table className="table table-sm table-bordered">
                            <thead>
                                <tr>
                                    <th>STOCK</th>
                                    <th>VENCIMIENTO</th>
                                    <th>PRODUCTO</th>
                                    <th>PRESENTACION</th>
                                    <th>LOTE</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    DataFiltrado.map((pro, i) =>
                                        <tr key={`${i * 56}-${pro.id_lote}`}>
                                            <td className="text-center font-weight-bold"
                                                style={(+pro.stock_lote) < 30
                                                    ?
                                                    { background: "#ff00004f", borderLeft: "3px solid red" }
                                                    :
                                                    (+pro.stock_lote) < 60 ?
                                                        { background: "#ffc80066", borderLeft: "3px solid #ffc801" } : null}>
                                                {pro.stock_lote}
                                            </td>
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
                                            <td>{`${pro.nomb_generico_producto} ${pro.nomb_comercial_producto} ${pro.concentracion_producto}`}</td>
                                            <td>{pro.nombre_presentacion}</td>
                                            <td>{pro.codigo_lote}</td>
                                        </tr>
                                    )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

        </Fragment>

    );
}
export default ProductosAlerta;