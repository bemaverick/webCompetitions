import React from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { AuthProvider } from "../contexts/AuthContext"
import PrivateRoute from "./PrivateRoute"
import SignUp from "./SignUp"
import SignIn from "./SignIn"
import InitialPage from "./InitialPage"
import Root from "./root"


function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Root />
              </PrivateRoute>
            }
          >
             <Route index element={<InitialPage />} />
             <Route path="contacts" element={<SignUp />} />
 
          </Route>
          <Route path="/signup" element={<SignUp/>} />
          <Route path="/signin" element={<SignIn/>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}



// function App() {
//   return (
//     <BrowserRouter>
//       <AuthProvider>
//         <Routes>
//           <Route
//             path="/"
//             element={
//               <PrivateRoute>
//                 <InitialPage />
//               </PrivateRoute>
//             }
//           >
//              <Route index element={<Root />} />
//           </Route>
//           <Route path="/signup" element={<SignUp/>} />
//           <Route path="/signin" element={<SignIn/>} />
//         </Routes>
//       </AuthProvider>
//     </BrowserRouter>
//   )
// }

export default App