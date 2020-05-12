import React from 'react';

import Inicio from '../components/Inicio/Inicio';
import Vender from "../components/Ventas/Vender"
import Comprobante from "../components/Ventas/Comprobante"
import ResumenVentas from "../components/Ventas/ResumenVentas"
import ReportesVentas from "../components/Ventas/ReportesVentas";
import Proveedores from "../components/Proveedores/Proveedores";
import Productos from "../components/Almacen/Productos"
import Categorias from "../components/Almacen/Categorias"
import Lotes from "../components/Almacen/Lotes"
import ReporteProductos from "../components/Almacen/ReporteProductos"
import Configuracion from "../components/Administracion/Configuracion"
import Accesos from "../components/Administracion/Accesos"
import DataBase from "../components/Administracion/DataBase"
// import Roles from "../components/Roles/Roles";
// Private routes.
const AdminOnly = () => <div >title="Admin Only"HOLA ESTOY EN ADMIN DE MUESTRA SOLO PARA PROBAR</div>;
const Users = () => <div>usuarios</div>

export {
	AdminOnly,
	Users,

	Inicio,
	Vender,
	Comprobante,
	ResumenVentas,
	ReportesVentas,
	Proveedores,
	Productos,
	Categorias,//categoria de productos
	Lotes,
	ReporteProductos,
	Configuracion,
	Accesos,
	DataBase,
	// rutas del usuario
	// Roles
};
