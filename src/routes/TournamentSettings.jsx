import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Stack from '@mui/material/Stack';


import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';

import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import Container from '@mui/material/Container';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate  } from 'react-router-dom';
import { observer } from "mobx-react-lite";
import { tournamentStore } from '../stores/tournament';
import { Select, MenuItem, FormControl, InputLabel, FormHelperText, ToggleButtonGroup, ToggleButton } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import Paper from '@mui/material/Paper';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { styled } from '@mui/material/styles';
import TagFacesIcon from '@mui/icons-material/TagFaces';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import { v4 as uuidv4 } from 'uuid';
import _ from "lodash"
import { useIntl } from 'react-intl';



const ListItem = styled('li')(({ theme }) => ({
  margin: theme.spacing(0.5),
}));


const tableCountSelectOptions = [
  {
    key: 0,
    value: 1,
    title: '1 cтіл'

  }, {
    key: 1,
    value: 2,
    title: '2 cтоли'

  }, {
    key: 2,
    value: 3,
    title: '3 cтоли'
    
  }, {
    key: 3,
    value: 4,
    title: '4 столи'
    
  }, {
    key: 4,
    value: 5,
    title: '5 cтолів'
    
  }, {
    key: 5,
    value: 6,
    title: '6 cтолів'
  },
]

//TODO

// add validaton to prevent adding the same categories and classifications


export default observer(function TournamentSettings() {
  const intl = useIntl();
  const weightUnitLabel = tournamentStore.weightUnit.label;
  const [tournamentName, setTournamentName] = React.useState(tournamentStore.tournamentName);
  const [tournamentDate, setTournamentDate] = React.useState(tournamentStore.tournamentDate);
  const [tablesCount, setTablesCount] = React.useState(tournamentStore.tablesCount);
  const [weightCategory, setWeightCategory] = React.useState('');
  const [weightCategories, setWeightCategories] = React.useState(tournamentStore.weightCategories);
  const [classification, setClassification] = React.useState('');
  const [classificationCategories, setClassificationCategories] = React.useState(tournamentStore.classificationCategories);

  const onDeleteWeightCategory = React.useCallback((categoryId) => {
    const updatedCategories = weightCategories.filter(category => category.id !== categoryId);
    setWeightCategories(updatedCategories);
  }, [weightCategories]);

  const onAddCategory = React.useCallback((ev) => {
    if (ev.key === 'Enter') {
      ev.preventDefault();
      // ev.target.blur();
      if (weightCategory?.length > 1) {
        setWeightCategories([...weightCategories, { id: uuidv4(), value: weightCategory }]);
        setWeightCategory('');
      }
    }
  }, [weightCategory, weightCategories])

  const onDeleteClassification = React.useCallback((classificationId) => {
    const updatedClassifications = classificationCategories.filter(classification => classification.id !== classificationId);
    setClassificationCategories(updatedClassifications);
  }, [classificationCategories]);

  const onAddClassification = React.useCallback((ev) => {
    if (ev.key === 'Enter') {
      ev.preventDefault();
      // ev.target.blur();
      if (classification?.length > 2) {
        setClassificationCategories([...classificationCategories, { id: uuidv4(), label: classification }]);
        setClassification('');
      }
    }
  }, [classification, classificationCategories]);

  const onSave = () => {
    tournamentStore.setTournamentBasicSettings({ tournamentName, tournamentDate, tablesCount, weightCategories, classificationCategories });
  }

  //const [weightCategory, setWeightCategory] = React.useState('50');
  // const [classification, setClassification] = React.useState('Чоловіки');
  const [modalVisible, setModalVisible] = React.useState(false);

  const [tournamentCategoryWeight, setTournamentCategoryWeight] = React.useState("");
  const [tournamentCategoryClassiication, setTournamentCategoryClassiication] = React.useState("");
  const [tournamentCategoryHand, setTournamentCategoryHand] = React.useState("right");


  React.useEffect(() => {
    console.log('mount Tournament');
  }, []);

  const navigate = useNavigate();

  return (
    <Grid container sx={{ justifyContent: 'center', mt: 2, }}>
      <Grid item xs={10}>
        <Card raised>
          <CardContent>
            <TextField
              id="outlined-basic"
              label="Назва турніру"
              variant="outlined"
              fullWidth 
              value={tournamentName}
              onChange={(event) => {
                setTournamentName(event.target.value);
              }}
              color="success"
              helperText="Назва турніру, наприклад - 'Кубок Київської області'"
              margin='normal'
            />
            <Grid container sx={{ justifyContent: 'center' }} spacing={2}>

              <Grid item xs={6} >
                <FormControl fullWidth margin='normal'>
                  {/* <InputLabel id="demo-simple-select-label">Дата проведення</InputLabel> */}
                  <DatePicker label="Дата проведення" value={new Date(tournamentDate)}  onChange={setTournamentDate} />
                  <FormHelperText>Дата проведення турніру</FormHelperText>
                </FormControl>
              </Grid>

              <Grid item xs={6}>
                <FormControl fullWidth margin='normal'>
                  <InputLabel id="demo-simple-select-label">Кількість столів</InputLabel>
                  <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={tablesCount}
                    label="Кількість столів"
                    onChange={(event) => setTablesCount(event.target.value)}
                  >
                    {tableCountSelectOptions.map((table) => <MenuItem key={table.key} value={table.value}>{table.title}</MenuItem>)}
                  </Select>
                  <FormHelperText>Кількість столів, за якими буде проводитись боротьба</FormHelperText>
                </FormControl>
              </Grid>
            </Grid>

            <Alert variant='filled' severity="info" sx={{ mt: 2, mb: 2 }}>
              <AlertTitle>Увага</AlertTitle>
              Турнірна категорія формуються з вагової категорії, класифікації та руки на якій відбудеться боротьба (ліва чи права). 
              Наприклад, категорія "70кг, дорослі чоловіки, ліва рука" сформована з вагової категорії - "70 кг" та класифікації - "дорослі чоловіки".
            </Alert>
            <Typography variant="subtitle1" component="h6" sx={{ p: 0.5 }}>
              Вагові Категорії (у кілограмах):
            </Typography>
            <Paper
              elevation={0}
              sx={{
                display: 'flex',
                justifyContent: 'flex-start',
                flexWrap: 'wrap',
                listStyle: 'none',
                p: 0.5,
                m: 0,
              }}
              component="ul"
            >
              <FormControl sx={{ m: 0, width: '20ch',  pr: 2 }} variant="outlined">
                <OutlinedInput
                  size='small'
                  sx={{
                    //height: '32px'
                  }}
                  value={weightCategory}
                  onChange={(event) => {
                    const regex = /^[0-9\b]+\+?$/;
                    // if value is not blank, then test the regex
                    if (event.target.value === '' || (regex.test(event.target.value) && event.target.value[0] !== '0')) {
                      setWeightCategory(event.target.value)
                    }
                  }}
                  onKeyDown={onAddCategory}
                  placeholder='Додати'
                  id="outlined-adornment-weight"
                  endAdornment={<InputAdornment position="end">{weightUnitLabel}</InputAdornment>}
                  aria-describedby="outlined-weight-helper-text"
                  inputProps={{
                    'aria-label': 'weight',
                  }}
                />
              </FormControl>
              {weightCategories.map((category, index) => {
                return (
                  <ListItem key={category.id}>
                    <Chip
                      color="primary" 
                      sx={{ mb: 1 }}
                      label={
                        category.id === 'xxx'
                          ? intl.formatMessage({ id: "unit.weight.kilogram" })
                          : `${category.value} ${weightUnitLabel}`
                      }
                      onDelete={(weightCategories.length === 1 || category.id === 'xxx') ? undefined : () => onDeleteWeightCategory(category.id)}
                    />
                  </ListItem>
                );
              })}

            </Paper>

            <Typography variant="subtitle1" component="h6" sx={{ p: 0.5 }}>
              Класифікація:
            </Typography>
            <Paper
              elevation={0}
              sx={{
                display: 'flex',
                justifyContent: 'flex-start',
                flexWrap: 'wrap',
                listStyle: 'none',
                p: 0.5,
                m: 0,
              }}
              component="ul"
            >
              <FormControl sx={{ m: 0, width: '20ch', pr: 2 }} variant="outlined">
                <TextField
                  id="outlined-basic"
                  placeholder='Створити'
                  variant="outlined"
                  size='small'
                  value={classification}
                  onChange={(event) => {
                    setClassification(event.target.value);
                  }}
                  onKeyDown={onAddClassification}
                />
                {/* <OutlinedInput
                  size='small'
                  sx={{
                    //height: '32px'
                  }}
                  placeholder='Додати'
                  id="outlined-adornment-weight"
                  aria-describedby="outlined-weight-helper-text"
                  inputProps={{
                    'aria-label': 'weight',
                  }}
                /> */}
              </FormControl>
              {classificationCategories.map((classification, index) => {
                return (
                  <ListItem key={classification.id}>
                    <Chip
                      color="secondary" 
                      sx={{ mb: 1 }}
                      label={
                        classification.labelKey
                        ? intl.formatMessage({ id: classification.labelKey }) // predefined classifications
                        : classification.label
                      }
                      onDelete={(classificationCategories.length === 1) ? undefined : () => onDeleteClassification(classification.id)}
                    />
                  </ListItem>
                );
              })}

            </Paper>
            <Stack direction="row" spacing={2} sx={{  justifyContent: "center", mt: 2, mb: 2 }}>
              <Button
                  onClick={onSave}
                  color="primary"
                  size="large"
                  variant="outlined"
                >
                  Застосувати зміни
                </Button>
            </Stack>

          </CardContent>
          
        </Card>
      
      </Grid>
    </Grid>
  )

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
