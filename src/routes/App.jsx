
import React from "react"
import { HashRouter, Routes, Route } from "react-router-dom"
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { AuthProvider } from "../contexts/AuthContext"
import PrivateRoute from "./PrivateRoute"
import Tournament from "./Tournament"
import TournamentSettings from "./TournamentSettings"
import TournamentCategories from "./TournamentCategories"
import TournamentCompetitors from "./TournamentCompetitors"
import TournamentResults from "./TournamentResults";


import SignUp from "./SignUp"
import SignIn from "./SignIn"
import InitialPage from "./InitialPage"
import Root from "./root"

//Browser router was changed to HashRouter
//because GitHub pages doesn't support browser history

function App() {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <HashRouter>
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
              {/* <Route index element={<InitialPage />} /> */}
              <Route index element={<Tournament />} />
              <Route index path="/tournamentSettings" element={<TournamentSettings />} />
              <Route index path="/tournamentCategories" element={<TournamentCategories />} />
              <Route index path="/tournamentCompetitors" element={<TournamentCompetitors />} />
              <Route path="/tournamentResults" element={<TournamentResults />} />
            </Route>
            <Route path="/signup" element={<SignUp/>} />
            <Route path="/signin" element={<SignIn/>} />
          </Routes>
        </AuthProvider>
      </HashRouter>
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