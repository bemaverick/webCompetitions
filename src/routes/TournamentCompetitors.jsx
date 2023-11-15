import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormHelperText from '@mui/material/FormHelperText';
import FormControl from '@mui/material/FormControl';
import FormGroup from '@mui/material/FormGroup';

import Checkbox from '@mui/material/Checkbox';
import ListItemText from '@mui/material/ListItemText';
import OutlinedInput from '@mui/material/OutlinedInput';

import InputLabel from '@mui/material/InputLabel';


import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Toolbar from '@mui/material/Toolbar';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation  } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { tournamentStore } from '../stores/tournament';
import { CompetitorRow } from '../components/Competitor';
import { EditCompetitorModal } from '../components/EditCompetitorModal';

const theme = createTheme();

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 10.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};


export default observer(function TournamentCompetitors() {
  const location = useLocation();
  console.log('tournamentCategoryId', location)

  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [weight, setWeight] = React.useState('');
  const [category, setCategory] = React.useState('');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedCategoryIds, setSelectedCategoryIds] = React.useState(location.state?.tournamentCategoryId ? [location.state.tournamentCategoryId] : []);
  const [editModalVisble, setEditModalVisble] = React.useState(false);
  const [selectedCompetitor, setSelectedCompetitor] =  React.useState(null);
  const [checkboxes, setCheckboxes] = React.useState({
    present: false,
  });
  const { present } = checkboxes;

  const handleCheckboxChange = (event) => {
    setCheckboxes({
      ...checkboxes,
      [event.target.name]: event.target.checked,
    });
  };


  const navigate = useNavigate();
  console.log('tournamentCategoryId', location)

  const handleChange = (event) => {
    const {
      target: { value },
    } = event;
    setSelectedCategoryIds(
      // On autofill we get a stringified value.
      typeof value === 'string' ? value.split(',') : value,
    );
  };

  const сompetitorsList = React.useMemo(() => {
    let filtered = tournamentStore.competitorsList;
    if (searchQuery.length > 0) {
      filtered = tournamentStore.competitorsList.filter((competitor) => (
        competitor.firstName.toLowerCase().includes(searchQuery.toLowerCase())
        || competitor.lastName.toLowerCase().includes(searchQuery.toLowerCase())
        || competitor.weight.toLowerCase().includes(searchQuery.toLowerCase())
      ))
    }
    return filtered;

  }, [tournamentStore.competitorsList, searchQuery]);


  return (
    <ThemeProvider theme={theme}>
      <Stack sx={{ flexDirection: 'column', height: '100vh' }}>
        <Toolbar />
        <Stack sx={{  p: 2, flexGrow: 1, overflow: 'hidden' }}>
          <Grid container spacing={1} sx={{ alignItems: 'top' }}>
            <Grid item xs={1.5}>
              <TextField
                fullWidth
                size='small'
                onChange={(event) => {
                  setFirstName(event.target.value);
                }}
                margin="normal"
                id="outlined-basic"
                label="Ім'я"
                variant="outlined"
                autoFocus={!!location?.state?.tournamentCategoryId}
                value={firstName}
              />

            </Grid>
            <Grid item xs={1.5}>
              <TextField
                fullWidth
                size='small'
                onChange={(event) => {
                  setLastName(event.target.value);
                }}
                margin="normal"
                id="outlined-basic"
                label="Прізвище"
                variant="outlined"
                value={lastName}
              />
            </Grid>
            <Grid item xs={5.5}>
              <FormControl size="small" fullWidth margin='normal'>
                <InputLabel id="demo-simple-select-label">Категорії</InputLabel>
                <Select
                  labelId="demo-multiple-checkbox-label"
                  id="demo-multiple-checkbox"
                  multiple
                  value={selectedCategoryIds}
                  onChange={handleChange}
                  input={<OutlinedInput  label="Категорії" />}
                  renderValue={(selected) => selected.map((id) => tournamentStore.newTournamentCategories[id].categoryTitleFull).join(', ')}
                  MenuProps={MenuProps}
                >
                  {Object.values(tournamentStore.newTournamentCategories).map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      <Checkbox checked={selectedCategoryIds.indexOf(category.id) > -1} />
                      <ListItemText primary={category.categoryTitleFull}/>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={1}>
              <TextField
                size='small'
                fullWidth
                onChange={(event) => {
                  //const regex = /^[0-9\b]+$/;
                  // if value is not blank, then test the regex
                  //if (event.target.value === '' || (regex.test(event.target.value) && event.target.value[0] !== '0')) {
                    setWeight(event.target.value)
                  //}
                }}
                margin="normal"
                id="outlined-basic"
                label="Вага учасника"
                variant="outlined"
                value={weight}
              />
            </Grid>
            <Grid item xs={1.5} sx={{ display: 'flex', alignItems: 'center',  justifyContent: 'center'}}>
              <Box sx={{ pt: 1, }}>
                <FormControlLabel control={<Checkbox color="success" checked={present} onChange={handleCheckboxChange} name='present' />} label="Присутній" />
              </Box>
            </Grid>
            <Grid item xs={1}>
              <Button
                sx={{ height: '40px', mt: 2 }}
                //size='small'
                fullWidth
                variant='outlined'
                onClick={() => {
                  tournamentStore.addCompetitor({ 
                    firstName,
                    lastName,
                    weight,
                    tournamentCategoryIds: selectedCategoryIds,
                    present: checkboxes.present
                  });
                  setFirstName('');
                  setLastName('');
                  setWeight('');
                  setSelectedCategoryIds([]);
                  setCheckboxes({ present: false })
                }}  
              >Додати</Button>
            </Grid>
          </Grid>
          <TextField
            fullWidth
            sx={{ mb: 2 }}
            size='small'
            onChange={(event) => {
              setSearchQuery(event.target.value);
            }}
            id="outlined-basic"
            label="Пошук по учасниках"
            variant="outlined"
            value={searchQuery}
          />
          <Stack sx={{ flexGrow: 1, overflow: 'scroll' }}>
            {сompetitorsList.map((competitor, index) => (
              <CompetitorRow
                onEdit={() => {
                  setEditModalVisble(true);
                  setSelectedCompetitor(competitor);
                }}
                onDelete={() => tournamentStore.removeCompetitorFromList(competitor.id)}
                key={competitor.id}
                position={index + 1}
                firstName={competitor.firstName}
                lastName={competitor.lastName}
                present={competitor.present}
                weight={competitor.weight} 
                categories={competitor.tournamentCategoryIds.map(
                  (tournamentId) => tournamentStore.newTournamentCategories[tournamentId].categoryTitleFull
                 )}
              />
            ))}
          </Stack>
        </Stack>

      </Stack>
      <EditCompetitorModal
        key={selectedCompetitor?.id}
        onEdit={(editedCompetitor) => tournamentStore.editCompetitor(editedCompetitor)}
        onClose={() => {
          setEditModalVisble(false);
          setSelectedCompetitor(null);
        }}
        competitor={selectedCompetitor}
        modalVisible={editModalVisble}
      />             
    </ThemeProvider>
  )
});
