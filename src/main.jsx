import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './routes/App'
import SignInSide from './routes/SignIn'
import SignUp from './routes/SignUp'

import './index.css'
import CssBaseline from '@mui/material/CssBaseline';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

const router = createBrowserRouter([
  {
    path: "/",
    element: <SignInSide />,
  },
  {
    path: "/signup",
    element: <SignUp />,
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <CssBaseline />
    <RouterProvider router={router} />
    {/* <App /> */}
  </React.StrictMode>,
)
