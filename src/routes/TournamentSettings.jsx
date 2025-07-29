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
    titleKey: 'tables.count.one'

  }, {
    key: 1,
    value: 2,
    titleKey: 'tables.count.two'

  }, {
    key: 2,
    value: 3,
    titleKey: 'tables.count.three'
    
  }, {
    key: 3,
    value: 4,
    titleKey: 'tables.count.four'
    
  }, {
    key: 4,
    value: 5,
    titleKey: 'tables.count.five'
    
  }, {
    key: 5,
    value: 6,
    titleKey: 'tables.count.six'
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
              label={intl.formatMessage({ id: 'common.tournamentName' })}
              variant="outlined"
              fullWidth 
              value={tournamentName}
              onChange={(event) => {
                setTournamentName(event.target.value);
              }}
              color="success"
              helperText={intl.formatMessage({ id: 'placeholder.tournamentName' })}
              margin='normal'
            />
            <Grid container sx={{ justifyContent: 'center' }} spacing={2}>
              <Grid item xs={6} >
                <FormControl fullWidth margin='normal'>
                  <DatePicker
                    label={intl.formatMessage({ id: 'common.tournamentDate' })}
                    value={new Date(tournamentDate)}
                    onChange={setTournamentDate}
                  />
                  <FormHelperText>{intl.formatMessage({ id: 'placeholder.tournamentDate' })}</FormHelperText>
                </FormControl>
              </Grid>

              <Grid item xs={6}>
                <FormControl fullWidth margin='normal'>
                  <InputLabel id="demo-simple-select-label">{intl.formatMessage({ id: 'common.tableNumber' })}</InputLabel>
                  <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={tablesCount}
                    label={intl.formatMessage({ id: 'common.tableNumber' })}
                    onChange={(event) => setTablesCount(event.target.value)}
                  >
                    {tableCountSelectOptions.map(
                      (table) => <MenuItem key={table.key} value={table.value}>{intl.formatMessage({ id: table.titleKey })}</MenuItem>
                    )}
                  </Select>
                  <FormHelperText>{intl.formatMessage({ id: 'placeholder.tableNumber' })}</FormHelperText>
                </FormControl>
              </Grid>
            </Grid>

            <Alert variant='filled' severity="info" sx={{ mt: 2, mb: 2 }}>
              <AlertTitle>{intl.formatMessage({ id: 'common.attention' })}</AlertTitle>
              {intl.formatMessage({ id: 'categories.rulesExplanation' })}
            </Alert>
            <Typography variant="subtitle1" component="h6" sx={{ p: 0.5 }}>
              {intl.formatMessage({ id: 'common.weightCategory' })} ({tournamentStore.weightUnit.label}):
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
              {intl.formatMessage({ id: "commonn.classification" })}:
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
                  {intl.formatMessage({ id: "common.saveChanges" })}
                </Button>
            </Stack>

          </CardContent>
          
        </Card>
      </Grid>
    </Grid>
  )
})
