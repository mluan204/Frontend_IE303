import ReactDom from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";

import "./index.css";

const admin = document.getElementById("admin");
if (!admin) throw new Error("Root element not found");

ReactDom.createRoot(admin).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);

// const sale = document.getElementById("sale");
// if (!sale) throw new Error("Root element not found");

// ReactDom.createRoot(sale).render(
//   <BrowserRouter>
//     <AppSale />
//   </BrowserRouter>
// );
