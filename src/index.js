import React from 'react';
import ReactDOM from 'react-dom';
import './index.css'; // Ensure this path is correct
import App from './App'; // Main App component

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root') // 'root' refers to the div in public/index.html
);
