import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './routes/App'
import { StyledEngineProvider } from '@mui/material/styles';

import SignInSide from './routes/SignIn'
import SignUp from './routes/SignUp'
import InitialPage from './routes/InitialPage'
import Contact, { loader as contactLoader } from './routes/contact'
import EditContact, { action as editAction,} from './routes/edit'
import Index from './routes'
import { action as destroyAction } from './routes/destroy'
import Root, {
  loader as rootLoader,
  action as rootAction,
} from "./routes/root";

import './index.css'
import CssBaseline from '@mui/material/CssBaseline';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import ErrorPage from './error-page'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <StyledEngineProvider injectFirst>
      <App />
    </StyledEngineProvider>
    <CssBaseline />
  </React.StrictMode>,
)
