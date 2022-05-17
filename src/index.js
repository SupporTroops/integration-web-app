import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './components/App';
import { Provider as Web3Provider, Updater as Web3Updater } from "./contexts/Web3";
import { Provider as CrowdFundProvider, Updater as CrowdFundUpdater } from './contexts/CrowdFund';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Web3Provider>
      <CrowdFundProvider>
        <App />
        <Web3Updater />
        <CrowdFundUpdater />
      </CrowdFundProvider>
    </Web3Provider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
