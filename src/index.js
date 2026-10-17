import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import DeliveryApp from './DeliveryApp';
import PublicBill from './PublicBill';
import reportWebVitals from './reportWebVitals';

// /b/<token> is a customer's bill link: show just that bill, no PIN.
// /d is the delivery boy's page: his own mobile number and PIN, only his orders.
const linkToken = window.location.pathname.match(/^\/b\/([^/]+)\/?$/)?.[1];
const isDelivery = /^\/d\/?$/.test(window.location.pathname);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  // <React.StrictMode>
  linkToken ? <PublicBill token={linkToken} /> : isDelivery ? <DeliveryApp /> : <App />
  // </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
