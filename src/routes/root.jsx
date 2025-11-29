import { Outlet, NavLink, useLoaderData, Form, redirect, useNavigation, } from "react-router-dom";
import { getContacts, createContact } from "../contacts";
import Snackbar from '@mui/material/Snackbar';
import { Button, CircularProgress, Link } from "@mui/material";
import { auth, useAuth } from '../contexts/AuthContext';
import * as React from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import CssBaseline from '@mui/material/CssBaseline';
import { ConfirmProvider, useConfirm } from "material-ui-confirm";
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import { useNavigate, useLocation } from "react-router-dom";
import ListIcon from '@mui/icons-material/List';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import DataArrayIcon from '@mui/icons-material/DataArray';
import DisplaySettingsIcon from '@mui/icons-material/DisplaySettings';
import CategoryIcon from '@mui/icons-material/Category';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import logo from '../assets/logo_white.jpeg';
import { observer } from "mobx-react-lite";
import { useIntl } from "react-intl";
import { systemStore } from "../stores/systemStore";
import { tournamentStore } from "../stores/tournament";
import { fromUnixTime, format } from 'date-fns';
import { collection, addDoc, serverTimestamp, doc, setDoc } from "firebase/firestore";
import { firestoreDB, firestoreTournamentsPath } from "../firebase";
import { CATEGORY_STATE } from "../constants/tournamenConfig";
import { wait } from "../utils/common";
import { Copyright } from "./SignIn";
import { analytics } from "../services/analytics";
import { APP_VERSION, FEEDBACK_EMAIL } from "../constants/config";


export async function action() {
  const contact = await createContact();
  return redirect(`/contacts/${contact.id}/edit`);
}

export async function loader({request}) {
  const url = new URL(request.url);
  const q = url.searchParams.get("q");
  const contacts = await getContacts(q);
  return { contacts };
}


const drawerWidth = 240;

const drawerItems = [
  {
    id: '1',
    titleId: "common.brackets",
    path: "/",
    // icon: () => <EmojiEventsIcon />
    icon: () => <DataArrayIcon />
  },
  {
    id: '2',
    titleId: "common.settings",
    path: "/tournamentSettings",
    icon: () => <DisplaySettingsIcon />

  }, , {
    id: '3',
    titleId: "common.categories",
    barTitleId: "common.tournamentCategories",
    path: "/tournamentCategories",
    icon: () => <CategoryIcon />
  }, {
    id: '4',
    titleId: "common.participants",
    path: "/tournamentParticipants",
    icon: () => <PeopleAltIcon />

  }, {
    id: '5',
    titleId: "common.results",
    path: "/tournamentResults",
    icon: () => <FormatListNumberedIcon />

  },
]

//const tournamentsRef = collection(firestoreDB, "armGrid_tournaments");
const tournamentsRef = collection(firestoreDB, firestoreTournamentsPath); //prod;



const saveResults = async (results) => {
  try {
    const userId = auth.currentUser.uid;
    const dateObject = fromUnixTime(tournamentStore.tournamentDate / 1000);
    const formattedDate = format(dateObject, 'dd-MM-yyyy');
    const tournamentRef = doc(tournamentsRef);
    const tournament = {
      tournament: {
        name: tournamentStore.tournamentName || 'Unnamed Tournament', // TODO crutch
        date: formattedDate,
        tablesCount: tournamentStore.tablesCount,
        weightUnit: tournamentStore.weightUnit.value,
      },
      id: tournamentRef.id,
      createdAt: serverTimestamp(),
      user: {
        uid: userId
      },
    }
    const tournamentsWithoutResults = Object.values(tournamentStore.newTournamentCategories).every(({ state }) => state !== CATEGORY_STATE.FINISHED);

    if (tournamentsWithoutResults) {
      analytics.logEvent('on_save_empty_tournament');
      return;
    }
  
    await setDoc(tournamentRef, tournament);
   // const tournamentDocRef = doc(firestoreDB, "armGrid_tournaments", tournamentRef.id);
    for (const categoryId in tournamentStore.results) {
      if (tournamentStore.newTournamentCategories[categoryId].state === CATEGORY_STATE.FINISHED) { 
        // save results of finished categories
        const tournamentCategoryResultCollectionRef = doc(collection(tournamentRef, 'results'));
        await setDoc(tournamentCategoryResultCollectionRef, {
          category: {
            ...tournamentStore.newTournamentCategories[categoryId].config,
            id: categoryId,
          },
          id: tournamentCategoryResultCollectionRef.id,
          result: tournamentStore.results[categoryId]
            .map(athlete => ({
              firstName: athlete.firstName, lastName: athlete.lastName, weight: athlete.weight, id: athlete.id
            }))
        })
      }
    }
    analytics.logEvent('save_results_success');
  } catch (error) {
    analytics.logEvent('save_results_errors');
    console.log('error', error)
  }
};
export default observer(function Root() {
  const intl = useIntl();
  const auth = useAuth();
  const [loading, setLoading] = React.useState(false);
  const navigate = useNavigate();
  const confirm = useConfirm();
  const pathname = useLocation().pathname;
  const currentItem = drawerItems.filter((item => item.path === pathname))[0];
  const appBarTitle = intl.formatMessage({ id: currentItem.barTitleId || currentItem.titleId });
  const inCompetitionsListMode = systemStore.appState === 'competitionsList';
  const competitionInProgress = systemStore.appState === 'competitionInProgress';

  React.useEffect(() => {
    analytics.setUser(auth.user.uid);
    analytics.setUserProps({
      locale: navigator.language,
    });
    analytics.logEvent('session_launched');
  }, []);

  const onPressFinish = async () => {
    if (loading) { return; }
    analytics.logEvent('on_finish_tournament');

    if (competitionInProgress) { 
      try {
        const tournamentIsFinished = Object.values(tournamentStore.newTournamentCategories)
          .every(({ state }) => state === CATEGORY_STATE.FINISHED);
        await confirm({
          title: intl.formatMessage({ id: 'warning.tournament.finish' }),
          description: intl.formatMessage({ id: 'hint.tournament.finish' }),
          confirmationText: intl.formatMessage({ id: 'buttons.confirm.finishTournament' }),
          cancellationText: intl.formatMessage({ id: 'common.no' }),
          confirmationButtonProps: {
            color: 'error'
          }
        }); 
        if (!tournamentIsFinished) {
          await wait(500);
          await confirm({
            title: intl.formatMessage({ id: "warning.tournament.unfinishedCategories" }),
            description: intl.formatMessage({ id: 'hint.tournament.unfinishedCategories' }),
            confirmationText: intl.formatMessage({ id: 'buttons.confirm.finishTournament' }),
            cancellationText: intl.formatMessage({ id: 'common.no' }),
            confirmationButtonProps: {
              color: 'error'
            }
          }); 
        }
        setLoading(true);
        await saveResults(tournamentStore.results);
        systemStore.setAppState('competitionsList');
        tournamentStore.resetStore();
        navigate('/');
      } catch (error) {
        conole.log('cancel', error);
      } finally {
        setLoading(false);
      }
    }
    if (inCompetitionsListMode) {
      analytics.logEvent('logout');
      auth.logout();
    }
  }

  const goToTournamentCreation = () => {
    systemStore.setAppState('competitionInProgress');
    analytics.logEvent('create_tournament');
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{ width: `calc(100% - ${drawerWidth}px)`, ml: `${drawerWidth}px` }}
      >
        <Toolbar>
          <Typography variant="h6" noWrap component="div">
            {appBarTitle}
          </Typography>

        </Toolbar>
      </AppBar>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
        variant="permanent"
        anchor="left"
      >
        <Toolbar>
          <Box
            component="img"
            sx={{
              my: 1,
              ml: -1,
              height: 48,
              width: 48,
              // maxHeight: { xs: 233, md: 167 },
              // maxWidth: { xs: 350, md: 250 },
            }}
            alt="ARM GRID logo"
            src={logo}
          />
          <Typography variant="h5" noWrap component="div">
            {intl.formatMessage({ id: 'app.name' })}
          </Typography>
          <Typography variant="caption" color='GrayText' gutterBottom sx={{ display: 'block' }}>
            v{APP_VERSION}
          </Typography>

        </Toolbar>
        <Divider />
        <List>
          {inCompetitionsListMode && (
            <>
              <ListItem onClick={() => navigate('/')} disablePadding>
                <ListItemButton selected={pathname === '/'}>
                  <ListItemIcon>
                    <ListIcon />
                  </ListItemIcon>
                  <ListItemText primary={intl.formatMessage({ id: "common.prevCompetitons" })} />
                </ListItemButton>
              </ListItem>
              <ListItem onClick={goToTournamentCreation} disablePadding>
                <ListItemButton selected={false}>
                  <ListItemIcon>
                    <EmojiEventsIcon />
                  </ListItemIcon>
                  <ListItemText primary={intl.formatMessage({ id: "button.create.new.tournament" })} />
                </ListItemButton>
              </ListItem>
            </>
          )}
          {competitionInProgress && drawerItems.map((item, index) => (
            <ListItem onClick={() => navigate(item.path)} key={item.id} disablePadding>
              <ListItemButton selected={pathname === item.path}>
                <ListItemIcon sx={{ mr: -2 }}>
                  {item.icon()}
                </ListItemIcon>
                <ListItemText primary={intl.formatMessage({ id: item.titleId })} />
              </ListItemButton>
            </ListItem>
          ))}
          
        </List>
        <Box sx={{ flex: 1, border: '1px solid transparent'}} />
          <Button
            variant="text"
            color="success"
            size="small"
            href="https://brick-swan-502.notion.site/What-s-New-in-Arm-Grid-2a9ab1eba8f480cd971ffb139f278094?source=copy_link" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            {intl.formatMessage({ id: 'common.whatsnew'})}
          </Button>
          <Button 
            variant="text"
            color="info"
            size="small"
            href={`mailto:${FEEDBACK_EMAIL}?subject=${encodeURIComponent(`Support request from Arm Grid${APP_VERSION}`)}`} 
            target="_blank" 
            rel="noopener noreferrer"
          >
            {intl.formatMessage({ id: 'buttons.contactUs'})}
          </Button>
          <Button
            sx={{ height: '40px', m: 2, mt: 1, mb: 0.5 }}
            //size='small'
            startIcon={loading ? <CircularProgress size={20} /> : null}
            variant='outlined'
            color='error'
            size='small'
            onClick={onPressFinish}  
          >
            {intl.formatMessage({ id: competitionInProgress ? 'button.tournament.finish' : 'button.account.logout' })}
          </Button>
        <Box sx={{ px: 2, py: 1 }}>
          <Copyright />
          {/* <Typography variant="body1" color={'grey'} noWrap component="div">
            v. 0.2
          </Typography> */}
        </Box>

        {/* <Divider />
        <List>
          {['All mail'].map((text, index) => (
            <ListItem key={text} disablePadding>
              <ListItemButton>
                <ListItemIcon>
                  {index % 2 === 0 ? <InboxIcon /> : <MailIcon />}
                </ListItemIcon>
                <ListItemText primary={text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List> */}
      </Drawer>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          height: '100vh',
          overflow: 'hidden',
          //backgroundColor: '#fafafa',
          backgroundColor: '#F3F6F9',
          p: 0
        }}
      >
        {pathname !== '/tournamentCategories'
        && pathname !== '/tournamentParticipants'
        && pathname !== '/tournamentResults'
        && pathname !== '/' && (
          <Toolbar />
        )}
        <Outlet /> 
      </Box>
      <Snackbar
        ContentProps={{
          sx: {
            backgroundColor: colorConfig[systemStore.snackBar.style],
            color: 'white',
          },
        }}
        key={`snack-${systemStore.snackBar.message}`}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        open={systemStore.snackBar.visible}
        autoHideDuration={6000}
        onClose={() => systemStore.displaySnackbar(false)}
        message={systemStore.snackBar.message && intl.formatMessage({ id: systemStore.snackBar.message })}
      />
    </Box>
  )
})

const colorConfig = {
  success: 'success.main',
  error: 'error.main',
  warning: ''
}