import ReactDom from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

const root = document.getElementById('root');
if (!root) throw new Error('Root element not found');

ReactDom.createRoot(root).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);