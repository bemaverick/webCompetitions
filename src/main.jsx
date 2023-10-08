import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './routes/App'
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

const router = createBrowserRouter([
  {
    path: "/",
    element: <SignUp />,
  },
  {
    path: "/signup",
    element: <SignUp />,
  },
  {
    path: "/signin",
    element: <SignInSide />,
  },

]);

const router1 = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    errorElement: <ErrorPage />,
    loader: rootLoader,
    action: rootAction,
    children: [
      { index: true, element: <Index /> },
      {
        path: "contacts/:contactId",
        element: <Contact />,
        loader: contactLoader,
      },
      {
        path: "contacts/:contactId/edit",
        element: <EditContact />,
        loader: contactLoader,
        action: editAction,

      },
      {
        path: "contacts/:contactId/destroy",
        action: destroyAction,
        errorElement: <div>Oops! There was an error.</div>,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <CssBaseline />
    {/* <RouterProvider router={router1} /> */}
    <App />
  </React.StrictMode>,
)
