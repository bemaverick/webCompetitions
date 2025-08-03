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
import { jsPDF } from "jspdf";


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

function createHeaders(keys) {
  var result = [];
  for (var i = 0; i < keys.length; i += 1) {
    result.push({
      id: keys[i],
      name: keys[i],
      prompt: keys[i],
      width: 65,
      align: "center",
      padding: 0
    });
  }
  return result;
}

var headers = createHeaders([
  "id",
  "game_group",
  "game_name",
]);

export default observer(function TournamentResults() {
  const [currentCategoryId, setCurrentCategoryId] = React.useState('');

  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    console.log(event)
  };

  const generateResultPDF = () => {
     console.log('generateResultPDF');
     const items = [];
     _.map(tournamentStore.results, (category, id) => {
      category.map(el => {

        items.push({
          id: (id).toString(),
          game_group: el.firstName,
          game_name: el.lastName,
        })
      });
      console.log(items);
      console.log(headers)

    }) 
    const doc = new jsPDF({ putOnlyUsedFonts: true, orientation: "landscape" });
    doc.addFont("../assets/PTSans-Regular.ttf", "PTSans", "normal");

    doc.setFont("PTSans"); // set font
    doc.setFontSize(10);
    doc.table(1, 1, items, headers, { autoSize: true });
    doc.save("a4.pdf")
    
   
  }


  return (
    <Stack sx={{ flexDirection: 'column', height: '100vh' }}>
      <Toolbar />
      <Button
        sx={{ mt: 2, mb: 3, }}
        onClick={() => {
          generateResultPDF();
          // tournamentStore.removeResults();
          // Default export is a4 paper, portrait, using millimeters for units
          // try {
          //   const doc = new jsPDF();

          //   doc.text("Hello world!", 10, 10);
          //   doc.save("a4.pdf")
          // } catch (error) {
            
          // }
        }}
        variant='outlined'
      >
        Видалити
      </Button>
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
        <Stack sx={{ flexGrow: 1, overflow: 'scroll', alignItems: 'center' }}>
          <Box>
            {results.map((competitor, index) => (
              <Typography variant="body1" component="p" sx={{ p: 0, textAlign: 'left' }}>
                {competitor ? `${index + 1}. ${competitor.lastName} ${competitor.firstName}` : `${index + 1}.`}
              </Typography>
            ))}
          </Box>
        </Stack>
      </Stack>
    </Stack>
  )
})