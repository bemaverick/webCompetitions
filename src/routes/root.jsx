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
import InboxIcon from '@mui/icons-material/MoveToInbox';
import MailIcon from '@mui/icons-material/Mail';
import Typography from '@mui/material/Typography';
import { useNavigate, useLocation } from "react-router-dom";
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import DisplaySettingsIcon from '@mui/icons-material/DisplaySettings';
import CategoryIcon from '@mui/icons-material/Category';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';


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
    title: "Турнір",
    path: "/",
    icon: () => <EmojiEventsIcon />
  },
  {
    id: '2',
    title: "Налаштування",
    path: "/tournamentSettings",
    icon: () => <DisplaySettingsIcon />

  }, , {
    id: '3',
    title: "Категорії",
    barTitle: "Категорії турніру",
    path: "/tournamentCategories",
    icon: () => <CategoryIcon />
  }, {
    id: '4',
    title: "Учасники",
    path: "/tournamentCompetitors",
    icon: () => <PeopleAltIcon />

  }, {
    id: '5',
    title: "Результати",
    path: "/tournamentResults",
    icon: () => <FormatListNumberedIcon />

  },
]

export default function Root() {
  const auth = useAuth();
  const navigate = useNavigate();
  const pathname = useLocation().pathname;
  const currentItem = drawerItems.filter((item => item.path === pathname))[0];
  const appBarTitle = currentItem.barTitle || currentItem.title;
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
      <Toolbar />
      <Divider />
      <List>
        {drawerItems.map((item, index) => (
          <ListItem onClick={() => navigate(item.path)} key={item.id} disablePadding>
            <ListItemButton selected={pathname === item.path}>
              <ListItemIcon>
                {item.icon()}
              </ListItemIcon>
              <ListItemText primary={item.title} />
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
      && pathname !== '/tournamentCompetitors'
      && pathname !== '/tournamentResults'
      && pathname !== '/' && (
        <Toolbar />
      )}
      <Outlet /> 
    </Box>
  </Box>
  )
  
 // const navigation = useNavigation();
  return (
    <Box sx={{ display: 'flex', border: '2px solid green' }}>
      {OldDrawer}
      <Box
        component="main"
        sx={{ flexGrow: 1, bgcolor: 'background.default', p: 3, border: '2px solid blue' }}
      >
        <Outlet />
      </Box>

    </Box>
  );
}