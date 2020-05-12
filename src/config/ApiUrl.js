import Axios from "axios"
Axios.defaults.adapter = require('axios/lib/adapters/http');

var ApiURL = "http://localhost:1995";
Axios.defaults.baseURL = ApiURL;

const setAuthToken = async (token) => {
  //console.log("token " , token);
  //  Axios.defaults.headers.common['Authorization'] = '';
  //  await delete Axios.defaults.headers.common['Authorization'];

  // if (token) {
  Axios.defaults.headers.common['Authorization'] = `bearer ${token}`;
  // }
}
// Axios.defaults.headers.common['Authorization'] = `bearer ${datosUsuario !== null ? datosUsuario.access_token : "no hay token"}`;

// export default () => {
//   return Axios.create({
//     baseURL: ApiURL,
//     headers: {
//       'Authorization': `Bearer ${localStorage.getItem('user-token')}`
//     }
//   })
// }

export {
  ApiURL,
  setAuthToken
}