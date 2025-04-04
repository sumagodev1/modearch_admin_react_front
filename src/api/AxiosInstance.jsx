////axios instance code shubham sir
// import axios from "axios";
// export const httpinstance = axios.create({
//   // baseURL: "127.0.0.1:8000",
//   // baseURL: "https://webcrown.initiativewater.com",
//   baseURL: process.env.REACT_APP_API_BASE_URL,

//   headers: { "Content-Type": "application/json" },
// });

// httpinstance.interceptors.request.use(async (request) => {
//   const token = localStorage.getItem("accessToken");
//   if (token) request.headers.Authorization = Token ${token};
//   return request;
// });

// httpinstance.interceptors.response.use(
//   async (responce) => {
//     return responce;
//   },
//   async (error) => {
//     // if (error.response.hasOwnProperty("status") === 401) {
//     if (error?.response?.status === 401) {
//       let keysToRemove = ["user", "accessToken"];
//       for (let key of keysToRemove) {
//         localStorage.removeItem(key);
//       }
//       window.location.href = "/";
//     }
//     return Promise.reject(error);
//   }
// );

//// axios instance added to heroform only.       my way of instance
// import axios from 'axios';
// import { toast } from 'react-toastify';

// const instance = axios.create({
// //   baseURL: 'http://localhost:5000/',
//   baseURL:`http://positivebackend.sumagodemo.com/`,
// });

// instance.interceptors.response.use(
//   async response => response,
//   async error => {
//     const status = error.response ? error.response.status : null;
//     if (status) {
//       console.error(`HTTP Status Code: ${status}`);
//       switch (status) {
//         case 401:
//           toast.error('Unauthorized access - please log in.');
//           break;
//         case 404:
//           toast.error('Resource not found.');
//           break;
//         case 500:
//           toast.error('Internal server error.');
//           break;
//         default:
//           toast.error('An error occurred.');
//       }
//     }
//     return Promise.reject(error);
//   }
// );

// export default instance;







// /////shubham sir way instance  I EXECUTED SUCCESSFULLY WITH LOGIN AND TOKEN AUTH
//// NO NEED TO CREATE AUTHCONTEXT TO SHOW USER STATUS LOGIN FOR ALL SCREEN BECAUSE
//// YOU CREATED instance.interceptors.request.use IN AXIOS INSTANCE

import axios from "axios";
import { toast } from "react-toastify";

const instance = axios.create({

  // baseURL: `http://localhost:8000/`,

  baseURL: `https://modearchsteel.sumagodemo.com/`,

  // baseURL: `https://staging-api-v2.modearchsteel.com/`,
  // baseURL: `https://api.modearchsteel.com/`,
});

instance.interceptors.request.use(
  async (request) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      request.headers.Authorization = `Bearer ${token}`;
    }
    return request;
  },
  (error) => Promise.reject(error)
);

instance.interceptors.response.use(
  async (response) => response,
  async (error) => {
    if (error?.response?.status === 401) {
      let keysToRemove = ["accessToken"];
      for (let key of keysToRemove) {
        localStorage.removeItem(key);
      }
      toast.error("Unauthorized access - please log in.");
      window.location.href = "/"; // Redirect to login page
    }
    //  if (error?.response?.status === 404) {
    //   toast.error("Resource not found.");
    // } 
    // else if (error?.response?.status === 500) {
    //   toast.error("Internal server error.");
    // } 
    // else {
    //   toast.error("An error occurred.");
    // }
    return Promise.reject(error);
  }
);

export default instance;