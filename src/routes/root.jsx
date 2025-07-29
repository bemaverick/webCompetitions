import { Outlet, NavLink, useLoaderData, Form, redirect, useNavigation, } from "react-router-dom";
import { getContacts, createContact } from "../contacts";
import { Button } from "@mui/material";
import { useAuth } from '../contexts/AuthContext';
import * as React from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import CssBaseline from '@mui/material/CssBaseline';
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
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import DataArrayIcon from '@mui/icons-material/DataArray';
import DisplaySettingsIcon from '@mui/icons-material/DisplaySettings';
import CategoryIcon from '@mui/icons-material/Category';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import logo from '../assets/logo_white.jpeg';
import { useIntl } from "react-intl";


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


const drawerWidth = 260;

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

export default function Root() {
  const intl = useIntl();
  const auth = useAuth();
  const navigate = useNavigate();
  const pathname = useLocation().pathname;
  const currentItem = drawerItems.filter((item => item.path === pathname))[0];
  const appBarTitle = intl.formatMessage({ id: currentItem.barTitleId || currentItem.titleId });
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
          ARM GRID
        </Typography>

      </Toolbar>
      <Divider />
      <List>
        {drawerItems.map((item, index) => (
          <ListItem onClick={() => navigate(item.path)} key={item.id} disablePadding>
            <ListItemButton selected={pathname === item.path}>
              <ListItemIcon>
                {item.icon()}
              </ListItemIcon>
              <ListItemText primary={intl.formatMessage({ id: item.titleId })} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
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
  </Box>
  )
}