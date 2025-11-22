import React from 'react';  // Important for JSX in some setups
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { Provider } from "react-redux";
import { store } from './redux/store';
import { AuthContextProvider } from './context/AuthContext.jsx';
import { UserContextProvider } from './context/UserContext.jsx';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <AuthContextProvider>
        <UserContextProvider>
          <App />
        </UserContextProvider>
      </AuthContextProvider>
    </Provider>
  </StrictMode>
);
