
import React from "react"
import { HashRouter, Routes, Route } from "react-router-dom"
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { AuthProvider } from "../contexts/AuthContext"
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { ConfirmProvider, useConfirm } from "material-ui-confirm";
import PrivateRoute from "./PrivateRoute"
import Tournament from "./Tournament"
import TournamentSettings from "./TournamentSettings"
import TournamentCategories from "./TournamentCategories"
import TournamentCompetitors from "./TournamentCompetitors"
import TournamentResults from "./TournamentResults";
import English from "../locales/en.json";
import Ukrainian from "../locales/uk.json";


import { IntlProvider } from 'react-intl';
import SignUp from "./SignUp"
import SignIn from "./SignIn"
import InitialPage from "./InitialPage"
import Root from "./root"
const theme = createTheme();

const locale = navigator.language;
let lang;
if (locale.includes("uk")) {
   lang = Ukrainian;
} else {
  lang = English;
}

//Browser router was changed to HashRouter
//because GitHub pages doesn't support browser history

function App() {
  return (
    <IntlProvider locale={locale} messages={English}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <ThemeProvider theme={theme}>
          <ConfirmProvider>
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
                    <Route index path="/tournamentParticipants" element={<TournamentCompetitors />} />
                    <Route path="/tournamentResults" element={<TournamentResults />} />
                  </Route>
                  <Route path="/signup" element={<SignUp/>} />
                  <Route path="/signin" element={<SignIn/>} />
                </Routes>
              </AuthProvider>
            </HashRouter>
          </ConfirmProvider>
        </ThemeProvider>
      </LocalizationProvider>
    </IntlProvider>

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