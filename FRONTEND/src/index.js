import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import axios from 'axios';
import { Provider } from 'react-redux';
import { store } from './state/store';

axios.interceptors.request.use(request=>{
  const userDataStr = localStorage.getItem("userData");
  if(userDataStr){
    const token = JSON.parse(userDataStr).token;
    request.headers.Authorization =`Bearer ${token}`

  }
  return request;
})

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Provider store={store}>
    <App />
  </Provider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
