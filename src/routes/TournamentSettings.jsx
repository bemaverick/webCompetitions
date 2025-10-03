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
import { CATEGORY_OPEN_ID, TABLE_STATE, TABLES_SELECT_CONFIG, WEIGHT_CATEGORIES_DEFAULT, WEIGHT_CATEGORIES_DEFAULT_LBS, WEIGHT_UNIT_KG, WEIGHT_UNITS } from '../constants/tournamenConfig';
import { systemStore } from '../stores/systemStore';


const ListItem = styled('li')(({ theme }) => ({
  margin: theme.spacing(0.5),
}));

//TODO
// add validaton to prevent adding the same categories and classifications

export default observer(function TournamentSettings() {
  const auth = useAuth();
  
  const intl = useIntl();
  const [tournamentName, setTournamentName] = React.useState(tournamentStore.tournamentName);
  const [tournamentDate, setTournamentDate] = React.useState(tournamentStore.tournamentDate);
  const [tablesCount, setTablesCount] = React.useState(tournamentStore.tablesCount);
  const [weightUnit, setWeightUnit] = React.useState(tournamentStore.weightUnit);
  const [weightCategory, setWeightCategory] = React.useState('');
  const [weightCategories, setWeightCategories] = React.useState(tournamentStore.weightCategories);
  const [classification, setClassification] = React.useState('');
  const [classificationCategories, setClassificationCategories] = React.useState(tournamentStore.classificationCategories);
  const weightUnitLabel = intl.formatMessage({ id: `unit.weight.${weightUnit.value}`});

  const onAddWeightCategory = React.useCallback((ev) => {
    if (ev.key === 'Enter') {
      ev.preventDefault();
      // ev.target.blur();
      if (weightCategory?.length > 0) {
        setWeightCategories([...weightCategories, { id: uuidv4(), value: weightCategory }]);
        setWeightCategory('');
      }
    }
  }, [weightCategory, weightCategories]);

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

  const onDeleteWeightCategory = React.useCallback((categoryId) => {
    const updatedCategories = weightCategories.filter(category => category.id !== categoryId);
    setWeightCategories(updatedCategories);
  }, [weightCategories]);

  const onDeleteClassification = React.useCallback((classificationId) => {
    const updatedClassifications = classificationCategories.filter(classification => classification.id !== classificationId);
    setClassificationCategories(updatedClassifications);
  }, [classificationCategories]);

  const onSave = async () => {
    //auth.logout();
    tournamentStore.setTournamentBasicSettings({ tournamentName, tournamentDate, tablesCount, weightCategories, classificationCategories, weightUnit });
  }

  // React.useEffect(() => {
  //   console.log('mount Tournament');
  //   return () => console.log('unmount Tournament Settings') // check why mount/unmount twice
  // }, []);

  const onChangeWeightUnit = (unit) => {  
    setWeightUnit(WEIGHT_UNITS[unit]);
    const defaultCategoriesList = weightUnit.value === WEIGHT_UNIT_KG ? WEIGHT_CATEGORIES_DEFAULT : WEIGHT_CATEGORIES_DEFAULT_LBS;
    if (_.isEqual(defaultCategoriesList, weightCategories)) {
      setWeightCategories(unit === WEIGHT_UNIT_KG ? WEIGHT_CATEGORIES_DEFAULT : WEIGHT_CATEGORIES_DEFAULT_LBS);
    }
  }

  const changeNumberOfTables = (event) => {
    const numberOfTables = event.target.value;
    let lastActiveTableIndex = 0;
    for (let i = 0; i < tournamentStore.tablesCount; i++) {
      if (tournamentStore.tables[i].state !== TABLE_STATE.IDLE) {
        lastActiveTableIndex = i;
      }
    }
    if (numberOfTables < lastActiveTableIndex + 1) {
      systemStore.displaySnackbar(true, 'error.tablesCount.change')
    } else {
      setTablesCount(numberOfTables);
    }
    console.log('lastActiveTableIndex', lastActiveTableIndex);
  }

  return (
    <Grid container sx={{ justifyContent: 'center', p: 4, }}>
      <Grid item xs={12}>
        <Card raised>
          <CardContent>
            <Grid container sx={{ }} spacing={2}>
              <Grid item xs={6}>
                <TextField
                  id="outlined-basic"
                  label={intl.formatMessage({ id: 'common.tournamentName' })}
                  variant="outlined"
                  fullWidth 
                  value={tournamentName}
                  onChange={(event) => {
                    setTournamentName(event.target.value);
                  }}
                  helperText={intl.formatMessage({ id: 'placeholder.tournamentName' })}
                  margin='normal'
                />
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth margin='normal'>
                  <DatePicker
                    format='dd-MM-yyyy'
                    label={intl.formatMessage({ id: 'common.tournamentDate' })}
                    value={new Date(tournamentDate)}
                    onChange={setTournamentDate}
                  />
                  <FormHelperText>{intl.formatMessage({ id: 'placeholder.tournamentDate' })}</FormHelperText>
                </FormControl>
              </Grid>
            </Grid>
            <Grid container sx={{ justifyContent: 'center' }} spacing={2}>
              <Grid item xs={6}>
                <FormControl fullWidth margin='normal'>
                  <InputLabel id="demo-simple-select-label">{intl.formatMessage({ id: 'common.tableNumber' })}</InputLabel>
                  <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={tablesCount}
                    label={intl.formatMessage({ id: 'common.tableNumber' })}
                    onChange={changeNumberOfTables}
                  >
                    {TABLES_SELECT_CONFIG.map(
                      (table) => <MenuItem key={table.key} value={table.value}>{intl.formatMessage({ id: table.titleKey })}</MenuItem>
                    )}
                  </Select>
                  <FormHelperText>{intl.formatMessage({ id: 'placeholder.tableNumber' })}</FormHelperText>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth margin='normal'>
                  <InputLabel id="demo-simple-select-label">{intl.formatMessage({ id: 'common.weightUnit' })}</InputLabel>
                  <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={weightUnit.value}
                    label={intl.formatMessage({ id: 'common.weightUnit' })}
                    onChange={(event) => onChangeWeightUnit(event.target.value)}
                  >
                    {Object.keys(WEIGHT_UNITS).map(
                      (unit) => <MenuItem key={WEIGHT_UNITS[unit].value} value={WEIGHT_UNITS[unit].value}>{intl.formatMessage({ id: `unit.weight.label.${WEIGHT_UNITS[unit].value}`})}</MenuItem>
                    )}
                  </Select>
                  <FormHelperText>{intl.formatMessage({ id: 'placeholder.weightUnit' })}</FormHelperText>
                </FormControl>
              </Grid>
            </Grid>

            <Alert variant='filled' severity="warning" sx={{ mt: 2, mb: 2 }}>
              <AlertTitle>{intl.formatMessage({ id: 'common.attention' })}</AlertTitle>
              {intl.formatMessage({ id: 'categories.rulesExplanation' })}
            </Alert>
            <Typography variant="subtitle1" component="h6" sx={{ p: 0.5 }}>
              {intl.formatMessage({ id: 'common.weightCategories' })} ({weightUnitLabel}):
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
                  onKeyDown={onAddWeightCategory}
                  placeholder={intl.formatMessage({ id: 'common.add' })}
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
                        category.id === CATEGORY_OPEN_ID
                          ? intl.formatMessage({ id: "category.open" })
                          : `${category.value} ${weightUnitLabel}`
                      }
                      onDelete={(weightCategories.length === 1 || category.id === CATEGORY_OPEN_ID) ? undefined : () => onDeleteWeightCategory(category.id)}
                    />
                  </ListItem>
                );
              })}

            </Paper>

            <Typography variant="subtitle1" component="h6" sx={{ p: 0.5 }}>
              {intl.formatMessage({ id: "common.classification" })}:
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
                  placeholder={intl.formatMessage({ id: "common.create" })}
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
                  {intl.formatMessage({ id: "buttons.apply.changes" })}
                </Button>
            </Stack>

          </CardContent>
          
        </Card>
      </Grid>
    </Grid>
  )
})
