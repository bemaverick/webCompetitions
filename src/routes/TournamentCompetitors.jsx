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
import InputLabel from '@mui/material/InputLabel';


import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate  } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { tournamentStore } from '../stores/tournament';

const theme = createTheme();

export default observer(function TournamentCompetitors() {
  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [weight, setWeight] = React.useState('');
  const [category, setCategory] = React.useState('');


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