import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import { Button, Stack, Modal, FormControl, MenuItem, Select, InputLabel, Divider, ListSubheader, Chip, FormGroup, List, FormControlLabel, Checkbox, ListItem, ListItemButton, ListItemIcon, ListItemText, TextField } from '@mui/material';

import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate  } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { tournamentStore } from '../stores/tournament';
import DoneIcon from '@mui/icons-material/Done';
import _ from 'lodash';
import Toolbar from '@mui/material/Toolbar';
import { toJS } from 'mobx';
import { CompetitorRow } from '../components/Competitor';


const theme = createTheme();


const handTranslations = {
  left: 'ліва рука',
  right: 'права рука',
}

const genderTranslations = {
  men: 'чоловіки',
  women: 'жінки',
}

export default observer(function TournamentCategories() {
  const [creatingCategoryModal, setCreatingCategoryModal] = React.useState(false);
  const [currentCategoryId, setCurrentCategoryId] = React.useState(
    Object.keys(tournamentStore.newTournamentCategories)[0] || ''
  );

  const navigate = useNavigate();

  const handleSubmit = async (event) => {
  };

  const isTournamentCategoriesListEmpty = Object.keys(tournamentStore.newTournamentCategories).length === 0;

  if (isTournamentCategoriesListEmpty) {
    return (
      <ThemeProvider theme={theme}>
        <Stack sx={{ flexDirection: 'column', height: '100vh' }}>
          <Toolbar />
          <Stack sx={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center', p: 2, pb: 4 }}>
            <Typography variant="h6" component="h6" sx={{ mb: 2, textAlign: 'center' }}>
              Тут буде список турнірних категорій, в яких відбуватиметься боротьба
              <br />Тисни "Створити турнірну категорію" 👇
            </Typography>
            <Button
              onClick={() => setCreatingCategoryModal(true)}
              color="primary"
              size="large"
              variant="contained"
            >
              Створити турнірну категорію
            </Button>
          </Stack>
         
        </Stack>
        <ModalForCategories
          modalVisible={creatingCategoryModal}
          onClose={() => setCreatingCategoryModal(false)}
          setCurrentCategory={(id) => setCurrentCategoryId(id)}
        />
      </ThemeProvider>  
    )
  }

  return (
    <ThemeProvider theme={theme}>
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
                  <Button
                    
                    sx={{ mt: 2, mb: 2 }}
                    onClick={() => setCreatingCategoryModal(true)}
                    color="primary"
                    size="small"
                    variant="contained"
                  >
                    Створити категорію
                  </Button>
                </ListSubheader>
                {Object.values(tournamentStore.newTournamentCategories).map((category) => (
                  <CategoryItem
                    onClick={() => setCurrentCategoryId(category.id)}
                    selected={currentCategoryId === category.id}
                    key={category.id}
                    id={category.id}
                    title={category.categoryTitleShort}
                    subTitle={`${_.upperFirst(genderTranslations[category.config.gender])}, ${handTranslations[category.config.hand]}`}
                  />
                ))}
              </List>
            </Stack>
            <Divider orientation='vertical'></Divider>
            <CategoryDetailsView
              tournamentCategoryId={currentCategoryId}
            />
          </Stack>
       </Stack>
       <ModalForCategories
        modalVisible={creatingCategoryModal}
        onClose={() => setCreatingCategoryModal(false)}
        setCurrentCategory={(id) => setCurrentCategoryId(id)}
      />
    </ThemeProvider>
  )


  return (
    <ThemeProvider theme={theme}>
      {/* <Alert variant='outlined' severity="info" sx={{ m: 2, }}>
        <AlertTitle>Увага</AlertTitle>
        Турнірна категорія формуються з вагової категорії, класифікації та руки на якій відбудеться боротьба (ліва чи права). 
        Наприклад, категорія "70кг, дорослі чоловіки, ліва рука" сформована з вагової категорії - "70 кг" та класифікації - "дорослі чоловіки".
      </Alert> */}

      <Grid container spacing={0} sx={{ height: '100vh', backgroundColor: '#eee', overflow: 'hidden' }}>
        <Grid item xs={12} sx={{ flexGrow: 0 }}>
          <Stack p={3} direction="row" justifyContent="center">
            <Button
              onClick={() => setCreatingCategoryModal(true)}
              color="primary"
              size="large"
              variant="contained"
            >
              Створити турнірну категорію
            </Button>
          </Stack>
        </Grid>

        <Grid item xs={12} sx={{ border: '2px solid green', flexGrow: 0 }}>
          <Grid container  spacing={0}>
          <Grid item xs={3}
             sx={{
              overflow: 'auto',
              flexGrow: 1, 
            }}
        >
          <List
         
            dense={true}
            //sx={{ pt: 0 }}
          >
            {Object.values(tournamentStore.newTournamentCategories).map((category) => (
              <CategoryItem
                key={category.id}
                title={category.categoryTitleShort}
                subTitle={`${_.upperFirst(genderTranslations[category.config.gender])}, ${handTranslations[category.config.hand]}`}
              />
            ))}
          </List>
        </Grid>
        <Grid item xs={9} sx={{ border: '1px solid green' }}>
        <List>
            <ListItem disablePadding>
              <ListItemButton>
                <ListItemIcon>
                  <DoneIcon />
                </ListItemIcon>
                <ListItemText primary="Inbox" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton>
                <ListItemIcon>
                  <DoneIcon />
                </ListItemIcon>
                <ListItemText primary="Drafts" />
              </ListItemButton>
            </ListItem>
          </List>
        </Grid>

          </Grid>
        </Grid>
      </Grid>
      <ModalForCategories modalVisible={creatingCategoryModal} onClose={() => setCreatingCategoryModal(false)} />
    </ThemeProvider>
  )

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


const CategoryDetailsView = observer((props) => {
  const currentTournamentCategory = tournamentStore.newTournamentCategories[props.tournamentCategoryId];
  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [weight, setWeight] = React.useState('');
  const [searchQuery, setSearchQuery] = React.useState('');
  const navigate = useNavigate();

  const navigateToCompetitors = () => {
    navigate('/tournamentCompetitors', { state: { tournamentCategoryId: props.tournamentCategoryId }});
  }

  const categoryCompetitorsList = React.useMemo(() => {
    let filtered = tournamentStore.competitorsList.filter(
      (competitor => competitor.tournamentCategoryIds.includes(props.tournamentCategoryId)))
    if (searchQuery.length > 0) {
      filtered = filtered.filter((competitor) => (
        competitor.firstName.toLowerCase().includes(searchQuery.toLowerCase())
        || competitor.lastName.toLowerCase().includes(searchQuery.toLowerCase())
        || competitor.weight.toLowerCase().includes(searchQuery.toLowerCase())
      ))
    }
    return filtered;

  }, [props.tournamentCategoryId, tournamentStore.competitorsList, searchQuery]);
  console.log('categoryCompetitorsList', toJS(categoryCompetitorsList))
  
  return (
    <Stack sx={{ flex: 9, flexDirection: 'column', p: 2 }}>
      <Typography variant="h6" component="h6" sx={{ p: 0, textAlign: 'center' }}>
        {currentTournamentCategory?.categoryTitleFull}
      </Typography>
      <Grid container spacing={1} sx={{ alignItems: 'top'}}>
        <Grid item xs={4}>
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
        <Grid item xs={3}>
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
            value={firstName}
          />
        </Grid>
        <Grid item xs={2}>
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
        <Grid item xs={3}>
          <Button
            sx={{ height: '40px', mt: 2 }}
            //size='small'
            fullWidth
            variant='outlined'
            onClick={navigateToCompetitors}
            // onClick={() => {
            //   tournamentStore.addCompetitorViaCategory({ 
            //     firstName, lastName, weight, tournamentCategoryId: props.tournamentCategoryId,
            //   });
            //   setFirstName('');
            //   setLastName('');
            //   setWeight('');
            // }}  
          >Додати учасника</Button>
        </Grid>

      </Grid>
      <Stack elevation={2} sx={{ flexGrow: 1, mt: 1, p: 2, overflow: 'hidden', border: '2px solid #eee', borderRadius: 1  }}>
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
          {categoryCompetitorsList.map((competitor, index) => (
            <CompetitorRow key={competitor.id}
              position={index + 1}
              firstName={competitor.firstName}
              lastName={competitor.lastName}
              weight={`${competitor.weight} ${tournamentStore.weightUnit.label}`}
              categories={competitor.tournamentCategoryIds.map(
                (tournamentId) => tournamentStore.newTournamentCategories[tournamentId].categoryTitleFull
               )}
            />
          ))}
        </Stack>
      </Stack>
    </Stack>
  )
})

const modalChildreContainerStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '50%',
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
}

const ModalForCategories = observer((props) => {
  const weightUnitLabel = tournamentStore.weightUnit.label;
  const [classification, setClassification] = React.useState({ id: '', label: '' });
  const [selectedWeightCategories, setSelectedWeightCategories] = React.useState({});
  const [checkboxes, setCheckboxes] = React.useState({
    men: true,
    women: true,
    left: true,
    right: true,
  });
  const { men, women, left, right } = checkboxes;

  const handleChange = (event) => {
    setCheckboxes({
      ...checkboxes,
      [event.target.name]: event.target.checked,
    });
  };


  const selectWeightCategory = (weightCategory) => {
    const copyOfSelectedCategories = _.cloneDeep(selectedWeightCategories);
    if (selectedWeightCategories[weightCategory.value]) { //remove selected category
      delete copyOfSelectedCategories[weightCategory.value];
    } else { //add selected category
      copyOfSelectedCategories[weightCategory.value] = weightCategory;
    }
    setSelectedWeightCategories(copyOfSelectedCategories);
  }
  
  const onSave = () => {
    props.onClose();
    tournamentStore.createTournamentCategories({
      classification,
      weightCategories: selectedWeightCategories,
      leftHand: left,
      rightHand: right,
      men,
      women
    });
    console.log('current', Object.keys(tournamentStore.newTournamentCategories)[0])
    props.setCurrentCategory(Object.keys(tournamentStore.newTournamentCategories)[0]);

  }

  console.log('selectedWeightCategories', selectedWeightCategories)
  return (
    <Modal
      open={props.modalVisible}
      onClose={props.onClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
   >
      <Box sx={modalChildreContainerStyle}>
        <Typography variant="h6" component="h6" sx={{ p: 0.5, pb: 3, textAlign: 'center' }}>
            Конструктор категорій
        </Typography>
        <FormControl fullWidth>
          <InputLabel id="demo-simple-select-label">Класифікація</InputLabel>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={classification.id}
            label="Класифікація"
            //onChange={(event) => console.log('event', event.target.value,_.find(tournamentStore.classificationCategories, (item) => item.id == event.target.value))}
            onChange={(event) => setClassification({ id: event.target.value, label: _.find(tournamentStore.classificationCategories, (item) => item.id == event.target.value).label })}
          >
            {tournamentStore.classificationCategories.map((classificationCategory) => (
              <MenuItem key={classificationCategory.id} value={classificationCategory.id}>{classificationCategory.label}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <Typography gutterBottom variant="body1" sx={{ mt: 2 }}>
          Вагові категорії
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap">
          {tournamentStore.weightCategories.map((weightCategory) => {
            const isSelected = selectedWeightCategories[weightCategory.value];
            return (
              <Chip
                sx={{ mb: 1 }}
                key={weightCategory.id}
                color={isSelected ? 'success' : 'default'}
                label={`${weightCategory.value} ${weightUnitLabel}`}
                onClick={() => selectWeightCategory(weightCategory)}
                deleteIcon={isSelected ? <DoneIcon /> : undefined}
                onDelete={isSelected ? () => selectWeightCategory(weightCategory) : undefined}
              />
            )
          })}
        </Stack>

        <Grid container sx={{ justifyContent: 'center', mt: 2, }}>
          <Grid item xs={6}>
            <Typography gutterBottom variant="body1" sx={{ mt: 2, }}>
              Cтать
            </Typography>
            <FormControlLabel control={<Checkbox color="success" checked={men} onChange={handleChange} name='men' />} label="чоловіки" />
            <FormControlLabel control={<Checkbox color="success" checked={women} onChange={handleChange} name='women' />} label="жінки" />
          </Grid>
          <Grid item xs={6}>
            <Typography gutterBottom variant="body1" sx={{ mt: 2, }}>
              Рука
            </Typography>
            <FormControlLabel control={<Checkbox color="success" checked={left} onChange={handleChange} name='left' />} label="ліва" />
            <FormControlLabel control={<Checkbox color="success" checked={right} onChange={handleChange} name='right' />} label="права" />
          </Grid>
        </Grid>

        <Stack direction="row" spacing={2} sx={{ justifyContent: "center", mt: 3, mb: 0 }}>
          <Button
              onClick={onSave}
              color="primary"
              size="large"
              variant="outlined"
            >
              Створити категорії
            </Button>
        </Stack>
        
        {/* <Grid container sx={{ justifyContent: 'center', mt: 0 }}>
          <Grid item xs={10} ml={2} mr={2} >
            <Card raised>
              <CardContent>
                <Stack direction="row" spacing={0} sx={{  justifyContent: "center" }}>
                  <Button
                      onClick={() => setCreatingCategoryModal(true)}
                      color="primary"
                      size="large"
                      variant="contained"
                    >
                      Створити турнірну категорію
                    </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid> */}
      </Box>
    </Modal>
  )
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