import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormHelperText from '@mui/material/FormHelperText';
import FormControl from '@mui/material/FormControl';
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

const theme = createTheme();

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
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
        <Stack sx={{ flexDirection: 'column', p: 2, flexGrow: 1, overflow: 'hidden' }}>
          <Grid container spacing={1} sx={{ alignItems: 'top'}}>
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
            <Grid item xs={6}>
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
                  const regex = /^[0-9\b]+$/;
                  // if value is not blank, then test the regex
                  if (event.target.value === '' || (regex.test(event.target.value) && event.target.value[0] !== '0')) {
                    setWeight(event.target.value)
                  }
                }}
                margin="normal"
                id="outlined-basic"
                label="Вага учасника"
                variant="outlined"
                value={weight}
              />
            </Grid>
            <Grid item xs={2}>
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
                  });
                  setFirstName('');
                  setLastName('');
                  setWeight('');
                  setSelectedCategoryIds([]);
                }}  
              >Додати учасника</Button>
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
                onDelete={() => tournamentStore.removeCompetitor(competitor.id)}
                key={competitor.id}
                position={index + 1}
                firstName={competitor.firstName}
                lastName={competitor.lastName}
                weight={competitor.weight} 
                categories={competitor.tournamentCategoryIds.map(
                  (tournamentId) => tournamentStore.newTournamentCategories[tournamentId].categoryTitleFull
                 )}
              />
            ))}
          </Stack>
        </Stack>

      </Stack>

    </ThemeProvider>
  )


  return (
    <ThemeProvider theme={theme}>
      <Container component="main" maxWidth="xm">
        <Box
          sx={{
            marginTop: 8,

          }}
        >
          <h4>Всі учасники</h4>

      
          <TextField
            onChange={(event) => {
              setLastName(event.target.value);
            }}
            margin="normal"
            id="outlined-basic"
            label="Прізвище"
            variant="outlined"
            value={lastName}
          />
          <TextField
            onChange={(event) => {
              setFirstName(event.target.value);
            }}
            margin="normal"
            id="outlined-basic"
            label="Ім'я"
            variant="outlined"
            value={firstName}

          />
          <TextField
            onChange={(event) => {
              setWeight(event.target.value);
            }}
            margin="normal"
            id="outlined-basic"
            label="Вага учасника"
            variant="outlined"
            value={weight}
          />
          <InputLabel id="demo-simple-select-label">Категорія</InputLabel>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={category}
            label="Категорія"
            onChange={(event) => setCategory(event.target.value)}
          >
            {Object.keys(tournamentStore.tournamentCategories).map((category) => (
              <MenuItem value={category}>{category}</MenuItem>
            ))}
          </Select>
          <FormHelperText>Оберіть категорію для участі</FormHelperText>
          <Button
            variant='outlined'
            onClick={() => {
              tournamentStore.addCompetitor_OLD({ 
                firstName, lastName, weight, category
              });
              setFirstName('');
              setLastName('');
              setWeight('');
              setCategory('');
            }}  
          >Додати учасника</Button>
        </Box>

        <BasicTable data={tournamentStore.competitorsList} />
      </Container>
    </ThemeProvider>
  );
})


function createData(name, calories, fat, carbs, protein) {
  return { name, calories, fat, carbs, protein };
}

const rows = [
  createData('Frozen yoghurt', 159, 6.0, 24, 4.0),
  createData('Ice cream sandwich', 237, 9.0, 37, 4.3),
  createData('Eclair', 262, 16.0, 24, 6.0),
  createData('Cupcake', 305, 3.7, 67, 4.3),
  createData('Gingerbread', 356, 16.0, 49, 3.9),
];

function BasicTable(props) {
  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Прізвище</TableCell>
            <TableCell align="right">Ім'я</TableCell>
            <TableCell align="right">Вага</TableCell>
            <TableCell align="right">Категорія</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {props.data.map((row) => (
            <TableRow
              key={row.id}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell component="th" scope="row">
                {row.lastName}
              </TableCell>
              <TableCell align="right">{row.firstName}</TableCell>
              <TableCell align="right">{row.weight}</TableCell>
              <TableCell align="right">{row.category}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}