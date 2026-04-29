import React from 'react';
import ReactDOM from 'react-dom/client';
import '../src/style/index.css';
import App from './App';
import "bootstrap/dist/css/bootstrap.min.css";
import { HelmetProvider } from "react-helmet-async";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
   <HelmetProvider>
      <App />
    </HelmetProvider>
  </React.StrictMode>
);


