import * as React from 'react';
import Avatar from '@mui/material/Avatar';
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
import Modal from '@mui/material/Modal';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate  } from 'react-router-dom';
import { observer } from "mobx-react-lite";
import { tournamentStore } from '../stores/tournament';
import { Select, MenuItem, FormControl, InputLabel, FormHelperText, ToggleButtonGroup, ToggleButton } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';


const theme = createTheme();

export default observer(function TournamentSettings() {
  const [weightCategory, setWeightCategory] = React.useState('50');
  const [classification, setClassification] = React.useState('Чоловіки');
  const [modalVisible, setModalVisible] = React.useState(false);

  const [tournamentCategoryWeight, setTournamentCategoryWeight] = React.useState("");
  const [tournamentCategoryClassiication, setTournamentCategoryClassiication] = React.useState("");
  const [tournamentCategoryHand, setTournamentCategoryHand] = React.useState("right");


  console.log('tournamentCategoryWeight', tournamentCategoryWeight)

  React.useEffect(() => {
    console.log('mount Tournament');
    return () => console.log('Unmount Tournament')
  }, []);

  const navigate = useNavigate();

  return (
    <ThemeProvider theme={theme}>
      <Container>
        <TextField
          onChange={(event) => {
            tournamentStore.setTournamentName(event.target.value);
          }}
          margin="normal"
          id="outlined-basic"
          label="Назва турніру"
          variant="outlined"
          fullWidth
        />
        <DatePicker value={tournamentStore.tournamentDate} onChange={tournamentStore.setTournamentDate}  />
        <Box sx={{ minWidth: 120 }}>
          <FormControl fullWidth>
            <InputLabel id="demo-simple-select-label">Кількість столів</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={tournamentStore.tablesCount}
              label="Кількість столів"
              onChange={(event) => tournamentStore.setTablesCount(event.target.value)}
            >
              <MenuItem value={1}>1 Стіл</MenuItem>
              <MenuItem value={2}>2 Столи</MenuItem>
              <MenuItem value={3}>3 Столи</MenuItem>
              <MenuItem value={4}>4 Столи</MenuItem>
              <MenuItem value={5}>5 Столів</MenuItem>
              <MenuItem value={6}>6 Столів</MenuItem>
            </Select>
            <FormHelperText>Кількість столів для проведення турніру</FormHelperText>
          </FormControl>
        </Box>
        <Box>

          <span>Вагові категорії:</span>
          <TextField
            onChange={(event) => {
              setWeightCategory(event.target.value);
            }}
            value={weightCategory}
            margin="normal"
            id="outlined-basic"
            label="категорія"
            variant="outlined"
          />
          <Button 
            onClick={() => {
              tournamentStore.addWeightCategory(weightCategory);
              setWeightCategory('');
            }}
            variant="text"
          >
            Додати категорію
          </Button>
          {tournamentStore.weightCategories.map(weight => <span>{weight} кг </span>)}

        </Box>

        <Box sx={{
            display: 'flex',
            alignItems: 'center',
            border: 1
        }}>
          <span>Класифікація: </span>
          <TextField
            onChange={(event) => {
              setClassification(event.target.value);
            }}
            value={classification}
            margin="normal"
            id="outlined-basic"
            label="категорія"
            variant="outlined"
          />
          <Button 
            onClick={() => {
              tournamentStore.addClassificationCategory(classification);
              setClassification('');
            }}
            variant="text"
          >
            Додати класифікацію
          </Button>
          {tournamentStore.classificationCategories.map(classification => <span>{classification} , </span>)}


        </Box>
       

        <Button 
            onClick={() => {
              setModalVisible(true)
            }}
            variant="text"
          >
            Додати турнірну категорію
          </Button>

      </Container>


      <Modal
        open={modalVisible}
        onClose={() => setModalVisible(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
        <Box sx={{ minWidth: 120 }}>
          <FormControl fullWidth>
            <InputLabel id="demo-simple-select-label">Вага</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={tournamentCategoryWeight}
              label="Вага"
              onChange={(event) => setTournamentCategoryWeight(event.target.value)}
            >
              {tournamentStore.weightCategories.map((weight) => (
                <MenuItem value={weight}>{weight} kg</MenuItem>
              ))}
            </Select>
            <FormHelperText>Оберіть вагу в якій змагатимуться учасники категорії </FormHelperText>
          </FormControl>
        </Box>

        <Box sx={{ minWidth: 120 }}>
          <FormControl fullWidth>
            <InputLabel id="demo-simple-select-label">Класифікація</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={tournamentCategoryClassiication}
              label="Вага"
              onChange={(event) => setTournamentCategoryClassiication(event.target.value)}
            >
              {tournamentStore.classificationCategories.map((classification) => (
                <MenuItem value={classification}>{classification}</MenuItem>
              ))}
            </Select>
            <FormHelperText>Вкажіть класифікацію </FormHelperText>
          </FormControl>
        </Box>
        <Box>

          <ToggleButtonGroup
            color="primary"
            value={tournamentCategoryHand}
            exclusive
            onChange={(_, newAlignment) => setTournamentCategoryHand(newAlignment)}
            aria-label="Platform"
          >
            <ToggleButton value="right">Права рука</ToggleButton>
            <ToggleButton value="left">Ліва рука</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <Box>
          <Button 
              onClick={() => {
                tournamentStore.addCategory({ weight: tournamentCategoryWeight, classification: tournamentCategoryClassiication, hand: tournamentCategoryHand })
              }}
              variant="text"
            >
              Створити категорію
            </Button>
        </Box>
        </Box>
      </Modal>
    </ThemeProvider>
  );
})

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};
