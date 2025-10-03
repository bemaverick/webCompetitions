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
import Grid from '@mui/material/Grid';

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
import { jsPDF } from "jspdf";
import { useIntl } from 'react-intl';
import { generateTournamentCategoryTitle } from '../utils/categoriesUtils';

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

export const ResultsByCategories = (props) => {
  const [selectedCategoryId, selectCurrentCategoryId] = React.useState('');
  const intl = useIntl();
  const { results } = props;

  return (
    <Stack sx={{ flexGrow: 1, overflow: 'hidden', flexDirection: 'row'}}>
      <Stack sx={{ flex: 2, overflow: 'scroll', p: 2, pt: 0 }}>
        <List
          sx={{ pt: 0}}
          dense={true}
        >
          {/* <ListSubheader
            disableGutters
            sx={{ display: 'flex', pt: 0, backgroundColor: '#fafafa', justifyContent: 'center', borderBottom: '2px solid #ddd', }}>
              Пошук по категорії
          </ListSubheader> */}
          {results.map((result) => {
            const { category } = result;
            return (
              <CategoryItem
                onClick={() => selectCurrentCategoryId(category.id)}
                selected={selectedCategoryId === category.id}
                key={category.id}
                title={generateTournamentCategoryTitle(intl, category.config)}
                subTitle={generateTournamentCategoryTitle(intl, category.config, 'handOnly')}
              />
            )
          })}
        </List>
      </Stack>
      <Divider orientation='vertical'></Divider>
        <CategoryDetailsView
          categoryResults={results.find(result => result.category.id === selectedCategoryId)}
          // generateResultPDF={() => generateResultPDF(demoData)}
          generateResultPDF={() => props.onClickGenerate()}
        />

    </Stack>
  )
}

const CategoryDetailsView = observer((props) => {
  const intl = useIntl();
  const results = props.categoryResults?.categoryResults || [];
  const currentTournamentCategory = props.categoryResults?.category;
  console.log('CategoryDetailsView', props.categoryResults)


  // const categoryCompetitorsList = React.useMemo(() => {
  //   const results = tournamentStore.results[props.tournamentCategoryId] || [];
  //   return results;

  // }, [props.tournamentCategoryId]);
  
  return (
    <Stack sx={{ flex: 9, flexDirection: 'column', p: 2 }}>
        <Grid container justifyContent={'center'} sx={{ p: 2 }}>
          <Grid item xs={3}>
            <Button
              //sx={{ height: '40px', mt: 2 }}
              size='noraml'
              fullWidth
              variant='contained'
              onClick={props.generateResultPDF}
            >
              {intl.formatMessage({ id: 'button.create.pdf' })}
            </Button>
          </Grid>
        </Grid>
      {currentTournamentCategory && (
        <Typography variant="h6" component="h6" sx={{ p: 2, textAlign: 'center' }}>
          {generateTournamentCategoryTitle(intl, currentTournamentCategory.config, 'full')}
        </Typography>
      )}

      <Stack elevation={2} sx={{ flexGrow: 1, p: 2, overflow: 'hidden', border: '2px solid #eee', borderRadius: 1  }}>
        <Stack sx={{ flexGrow: 1, overflow: 'scroll', alignItems: 'center' }}>
          <Box>
            {results.map((competitor, index) => (
              <Typography key={competitor?.id || index} variant="body1" component="p" sx={{ p: 0, textAlign: 'left' }}>
                {competitor ? `${index + 1}. ${competitor.lastName} ${competitor.firstName}` : `${index + 1}.`}
              </Typography>
            ))}
          </Box>
        </Stack>
      </Stack>
    </Stack>
  )
})
