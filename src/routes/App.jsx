
import React from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { AuthProvider } from "../contexts/AuthContext"
import PrivateRoute from "./PrivateRoute"
import Tournament from "./Tournament"
import TournamentSettings from "./TournamentSettings"
import TournamentCategories from "./TournamentCategories"
import TournamentCompetitors from "./TournamentCompetitors"


import SignUp from "./SignUp"
import SignIn from "./SignIn"
import InitialPage from "./InitialPage"
import Root from "./root"


function App() {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
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
              <Route index path="/tournament" element={<Tournament />} />
              <Route index path="/tournamentSettings" element={<TournamentSettings />} />
              <Route index path="/categories" element={<TournamentCategories />} />
              <Route index path="/competitors" element={<TournamentCompetitors />} />
              <Route index path="/results" element={<SignIn />} />
            </Route>
            <Route path="/signup" element={<SignUp/>} />
            <Route path="/signin" element={<SignIn/>} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </LocalizationProvider>
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