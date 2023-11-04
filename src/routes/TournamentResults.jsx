import * as React from 'react';
import Box from '@mui/material/Box';
import _ from 'lodash';
import Tab from '@mui/material/Tab';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';

import FormControl from '@mui/material/FormControl';
import Toolbar from '@mui/material/Toolbar';
import Divider from '@mui/material/Divider';

import List from '@mui/material/List';
import ListItemText from '@mui/material/ListItemText';

import ListItemIcon from '@mui/material/ListItemIcon';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListSubheader from '@mui/material/ListSubheader';
import { CompetitorRow } from '../components/Competitor';


import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';

import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate  } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { tournamentStore } from '../stores/tournament';

const theme = createTheme();

const handTranslations = {
  left: 'ліва рука',
  right: 'права рука',
}

const genderTranslations = {
  men: 'чоловіки',
  women: 'жінки',
}

const CategoryItem = ({ title, subTitle, id, onClick, selected }) => {
  return (
    <ListItem divider disablePadding>
      <ListItemButton selected={selected} onClick={onClick}>
        <ListItemText
          primary={title}
          secondary={subTitle}
        />
      </ListItemButton>
    </ListItem>
  )
}

export default observer(function TournamentResults() {
  const [currentCategoryId, setCurrentCategoryId] = React.useState('');

  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    console.log(event)
  };


  return (
    <Stack sx={{ flexDirection: 'column', height: '100vh' }}>
      <Toolbar />
      <Stack sx={{ flexGrow: 1, overflow: 'hidden', flexDirection: 'row'}}>
        <Stack sx={{ flex: 2, overflow: 'scroll', p: 2, pt: 0 }}>
          <List
            sx={{ pt: 0}}
            dense={true}
          >
            <ListSubheader
              disableGutters
              sx={{ display: 'flex', pt: 0, backgroundColor: '#fafafa', justifyContent: 'center', borderBottom: '2px solid #ddd', }}>
                Пошук по категорії
            </ListSubheader>
            {Object.keys(tournamentStore.results).map((tournamentCategoryId) => {
              const category = tournamentStore.newTournamentCategories[tournamentCategoryId];
              return (
                <CategoryItem
                  onClick={() => setCurrentCategoryId(tournamentCategoryId)}
                  selected={currentCategoryId === category.id}
                  key={tournamentCategoryId}
                  title={category.categoryTitleShort}
                  subTitle={`${_.upperFirst(genderTranslations[category.config.gender])}, ${handTranslations[category.config.hand]}`}
                />
              )
            })}
          </List>
        </Stack>
        <Divider orientation='vertical'></Divider>
        <CategoryDetailsView
          tournamentCategoryId={currentCategoryId}
        />
      </Stack>
    </Stack>
  )
});


const CategoryDetailsView = observer((props) => {
  const currentTournamentCategory = tournamentStore.newTournamentCategories[props.tournamentCategoryId];
  const results = tournamentStore.results[props.tournamentCategoryId] || [];


  // const categoryCompetitorsList = React.useMemo(() => {
  //   const results = tournamentStore.results[props.tournamentCategoryId] || [];
  //   return results;

  // }, [props.tournamentCategoryId]);
  
  return (
    <Stack sx={{ flex: 9, flexDirection: 'column', p: 2 }}>
      <Typography variant="h6" component="h6" sx={{ p: 0, textAlign: 'center' }}>
        {currentTournamentCategory?.categoryTitleFull}
      </Typography>
      <Stack elevation={2} sx={{ flexGrow: 1, p: 2, overflow: 'hidden', border: '2px solid #eee', borderRadius: 1  }}>
        <Stack sx={{ flexGrow: 1, overflow: 'scroll' }}>
          {results.map((competitor, index) => (
            <CompetitorRow
              withEmoji
              key={competitor.id}
              moreButtonVisible={false}
              position={index + 1}
              columnSizes={[4,4,4]}
              firstName={competitor.firstName}
              lastName={competitor.lastName}
              weight={`${competitor.weight} ${tournamentStore.weightUnit.label}`}
            />
          ))}
        </Stack>
      </Stack>
    </Stack>
  )
})