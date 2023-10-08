import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate  } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { tournamentStore  } from '../stores/tournament';
import _ from 'lodash';

const theme = createTheme();

export default observer(function TournamentCategories() {

  const navigate = useNavigate();

  const handleSubmit = async (event) => {
  };

  return (
    <ThemeProvider theme={theme}>
      <Container component="main" maxWidth="xm">
        <Box
          sx={{
            marginTop: 8,
            width: '90%'
          }}
        >
          <h4>Турнірні Категорії</h4>

          <div>
            {Object.keys(tournamentStore.tournamentCategories).map((category) => (
              <>
                <p style={{ backgroundColor: '#eee', marginTop: '20px', padding: '12px' }}>{category}</p>
                <BasicTable data={_.filter(tournamentStore.competitorsList, (competitor) => competitor.category == category)}>

                </BasicTable>
              </>
            ))}
          </div>

        </Box>
      </Container>
    </ThemeProvider>
  );
})

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