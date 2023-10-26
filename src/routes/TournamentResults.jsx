import * as React from 'react';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Divider from '@mui/material/Divider';

import List from '@mui/material/List';
import ListItemText from '@mui/material/ListItemText';

import ListItemIcon from '@mui/material/ListItemIcon';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import Checkbox from '@mui/material/Checkbox';


import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';

import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate  } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { tournamentStore } from '../stores/tournament';

const theme = createTheme();

export default observer(function TournamentResults() {
  React.useEffect(() => {
    console.log('mount Tournament');
    return () => console.log('Unmount Tournament')
  }, []);

  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    console.log(event)
  };

  return (
    <ThemeProvider theme={theme}>
      <Container component="main" maxWidth="xm">
       {Object.keys(tournamentStore.results).map(category => (
        <div key={category}>
          <h3>{category}</h3>
          {tournamentStore.results[category].map((competitor, index) => (
            <p key={competitor.id}>
              {index + 1}. {competitor.lastName} {competitor.firstName} 
            </p>
          ))}
        </div>
       ))}
      </Container>
    </ThemeProvider>
  );
})