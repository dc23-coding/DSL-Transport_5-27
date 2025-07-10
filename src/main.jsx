import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '@/App';
import '@/index.css';

console.log('React version:', React.version);
console.log('ReactDOM version:', ReactDOM.version);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
