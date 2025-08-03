import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ToggleButton from '@mui/material/ToggleButton';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormHelperText from '@mui/material/FormHelperText';
import FormControl from '@mui/material/FormControl';
import FormGroup from '@mui/material/FormGroup';
import Tooltip from '@mui/material/Tooltip';

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
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation  } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { tournamentStore } from '../stores/tournament';
import { CompetitorRow } from '../components/Competitor';
import { EditCompetitorModal } from '../components/EditCompetitorModal';
import { useIntl } from 'react-intl';
import { generateTournamentCategoryTitle } from '../utils/categoriesUtils';
import { FAKE_competitorsList } from '../constants/tournamenConfig';


let index = 0;
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
  const navigate = useNavigate();
  const intl = useIntl();
  console.log('tournamentCategoryId', location)
  const weightUnitLabel = intl.formatMessage({ id: `unit.weight.${tournamentStore.weightUnit.value}`});

  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [weight, setWeight] = React.useState('');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedCategoryIds, setSelectedCategoryIds] = React.useState(location.state?.tournamentCategoryId ? [location.state.tournamentCategoryId] : []);
  const [editModalVisble, setEditModalVisble] = React.useState(false);
  const [selectedCompetitor, setSelectedCompetitor] =  React.useState(null);
  const [checkboxes, setCheckboxes] = React.useState({
    present: true,
  });
  const [filterParam, setFilterParam] = React.useState('all');

  const { present } = checkboxes;

  const handleCheckboxChange = (event) => {
    setCheckboxes({
      ...checkboxes,
      [event.target.name]: event.target.checked,
    });
  };

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
    if (filterParam === 'present') {
      filtered = tournamentStore.competitorsList.filter((competitor) => competitor.present)
    };
    if (filterParam === 'preliminary') {
      filtered = tournamentStore.competitorsList.filter((competitor) => !competitor.present)
    };
    return filtered;

  }, [tournamentStore.competitorsList, searchQuery, filterParam]);

  const addCompetitor = () => {
    let firstNameTmp = firstName;
    let lastNameTmp = lastName;
    const weightTmp = 70;
    console.log('firs', firstName, lastName, firstName === lastName === '')
    if (firstName === '' && lastName === '') {
      firstNameTmp = FAKE_competitorsList[index].firstName;
      lastNameTmp = FAKE_competitorsList[index].lastName;
      index++;
    }
    tournamentStore.addCompetitor({ 
      firstName: firstNameTmp,
      lastName: lastNameTmp,
      weight: weightTmp,
      tournamentCategoryIds: selectedCategoryIds,
      present: checkboxes.present
    });
    setFirstName('');
    setLastName('');
    setWeight('');
    // setSelectedCategoryIds([]);
    //setCheckboxes({ present: false })
  }


  return (
    <>
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
                label={intl.formatMessage({ id: 'common.firstName'})}
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
                label={intl.formatMessage({ id: 'common.lastName'})}
                variant="outlined"
                value={lastName}
              />
            </Grid>
            <Grid item xs={4.5}>
              <FormControl size="small" fullWidth margin='normal'>
                <InputLabel id="demo-simple-select-label">
                  {intl.formatMessage({ id: 'common.categories'})}
                </InputLabel>
                <Select
                  labelId="demo-multiple-checkbox-label"
                  id="demo-multiple-checkbox"
                  multiple
                  value={selectedCategoryIds}
                  onChange={handleChange}
                  input={<OutlinedInput label={intl.formatMessage({ id: 'common.categories'})} />}
                  renderValue={(selected) => selected.map((id) => generateTournamentCategoryTitle(intl, tournamentStore.newTournamentCategories[id].config, 'full')).join(', ')}
                  MenuProps={MenuProps}
                >
                  {Object.values(tournamentStore.newTournamentCategories).map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      <Checkbox checked={selectedCategoryIds.indexOf(category.id) > -1} />
                      <ListItemText primary={generateTournamentCategoryTitle(intl, category.config, 'full')}/>
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
                label={`${intl.formatMessage({ id: 'common.weight' })} (${weightUnitLabel})`}
                variant="outlined"
                value={weight}
              />
            </Grid>
            <Grid item xs={1.5} sx={{ display: 'flex', alignItems: 'center',  justifyContent: 'center'}}>
              <Box sx={{ pt: 1, }}>
                <Tooltip title={intl.formatMessage({ id: 'hint.participant.confimed' })}>
                  <FormControlLabel control={<Checkbox color="success" checked={present} onChange={handleCheckboxChange} name='present' />} label={intl.formatMessage({ id: 'common.confirmed'})} />
                </Tooltip>
              </Box>
            </Grid>
            <Grid item xs={2}>
              <Button
                sx={{ height: '40px', mt: 2 }}
                //size='small'
                fullWidth
                variant='outlined'
                onClick={addCompetitor}  
              >
                {intl.formatMessage({ id: 'buttons.add.participant' })}
              </Button>
            </Grid>
          </Grid>
          <Grid container spacing={1} sx={{ pt: 1 }}>
            <Grid item xs={9}>
              <TextField
                fullWidth
                sx={{ mb: 2 }}
                size='small'
                onChange={(event) => {
                  setSearchQuery(event.target.value);
                }}
                id="outlined-basic"
                label={intl.formatMessage({ id: 'search.by.participants' })}
                variant="outlined"
                value={searchQuery}
              />
            </Grid>
            <Grid item xs={3}>
              <FormControl size="small" fullWidth>
                <InputLabel id="demo-simple-select-label">{intl.formatMessage({ id: 'common.show' })}</InputLabel>
                <Select
                  labelId="demo-multiple-checkbox-label"
                  id="demo-multiple-checkbox"
                  value={filterParam}
                  onChange={(event) => {
                    setFilterParam(event.target.value);
                  }}
                  input={<OutlinedInput label={intl.formatMessage({ id: 'common.show' })} />}
                  MenuProps={MenuProps}
                >
                  <MenuItem value={'all'}>{intl.formatMessage({ id: 'filter.participants.all' })}</MenuItem>
                  <MenuItem value={'present'}>{intl.formatMessage({ id: 'filter.participants.confirmed' })}</MenuItem>
                  <MenuItem value={'preliminary'}>{intl.formatMessage({ id: 'filter.participants.preliminary' })}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>


          <Stack sx={{ flexGrow: 1, overflow: 'scroll' }}>
            {сompetitorsList.map((competitor, index) => (
              <CompetitorRow
                onEdit={() => {
                  setEditModalVisble(true);
                  setSelectedCompetitor(competitor);
                }}
                onDelete={() => tournamentStore.removeCompetitorFromList(competitor.id)}
                key={competitor.id}
                position={сompetitorsList.length - index}
                firstName={competitor.firstName}
                lastName={competitor.lastName}
                present={competitor.present}
                weight={competitor.weight} 
                categories={competitor.tournamentCategoryIds.map(
                  (tournamentId) => generateTournamentCategoryTitle(intl, tournamentStore.newTournamentCategories[tournamentId].config, 'full')
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
    </>
  )
});
