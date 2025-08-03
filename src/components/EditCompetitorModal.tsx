import * as React from 'react';
import Grid from '@mui/material/Grid';
import { Button, MenuItem, Modal, FormControl, Select, InputLabel, Box, OutlinedInput, FormGroup, List, FormControlLabel, Checkbox, ListItem, ListItemButton, ListItemIcon, ListItemText, TextField } from '@mui/material';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useIntl } from 'react-intl';
import { observer } from 'mobx-react-lite';
import { tournamentStore } from '../stores/tournament';
import DoneIcon from '@mui/icons-material/Done';
import _ from 'lodash';
import { generateTournamentCategoryTitle } from '../utils/categoriesUtils';

type EditCompetitorModalProps = {
  modalVisible: boolean;
  onClose: () => void;
  competitor: {
    firstName: string;
    lastName: string;
    weight: string;
    tournamentCategoryIds: string[];
    id: string;
    present?: boolean;
  };
}

export const EditCompetitorModal = observer((props: EditCompetitorModalProps): any => {
  const intl = useIntl();
  const weightUnitLabel = intl.formatMessage({ id: `unit.weight.${tournamentStore.weightUnit.value}`});
  const [firstName, setFirstName] = React.useState(props.competitor?.firstName);
  const [lastName, setLastName] = React.useState(props.competitor?.lastName);
  const [weight, setWeight] = React.useState(props.competitor?.weight);
  const [selectedCategoryIds, setSelectedCategoryIds] = React.useState(props.competitor?.tournamentCategoryIds || []);
  const [checkboxes, setCheckboxes] = React.useState({
    present: !!props.competitor?.present,
  });
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


  const onSave = () => {
    props.onEdit({
      firstName, 
      lastName,
      weight,
      tournamentCategoryIds: selectedCategoryIds, 
      id: props.competitor.id,
      present: !!present
    });
    setFirstName('');
    setLastName('');
    setWeight('');
    setSelectedCategoryIds([]);
    setCheckboxes({ present: false });
    props.onClose();
  }

  return (
    <Modal
      open={props.modalVisible}
      onClose={props.onClose}
    >
      <Box sx={modalChildreContainerStyle}>
        <Typography variant="h6" component="h6" sx={{ p: 0.5, pb: 3, textAlign: 'center' }}>
          {intl.formatMessage({ id: 'common.athlete.edit' })}
        </Typography>
        <Grid container  spacing={1}>
          <Grid item xs={2}>
            <TextField
              fullWidth
              size='small'
              onChange={(event) => {
                setFirstName(event.target.value);
              }}
              margin="normal"
              id="outlined-basic"
              label={intl.formatMessage({ id: 'common.firstName' })}
              variant="outlined"
              value={firstName}
            />
          </Grid>
          <Grid item xs={2}>
            <TextField
              fullWidth
              size='small'
              onChange={(event) => {
                setLastName(event.target.value);
              }}
              margin="normal"
              id="outlined-basic"
              label={intl.formatMessage({ id: 'common.lastName' })}
              variant="outlined"
              value={lastName}
            />
          </Grid>
          <Grid item xs={5}>
            <FormControl size="small" fullWidth margin='normal'>
              <InputLabel id="demo-simple-select-label">
                {intl.formatMessage({ id: 'common.categories' })}
              </InputLabel>
              <Select
                labelId="demo-multiple-checkbox-label"
                id="demo-multiple-checkbox"
                multiple
                value={selectedCategoryIds}
                onChange={handleChange}
                input={<OutlinedInput  label={intl.formatMessage({ id: 'common.categories' })} />}
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
             //   const regex = /^[0-9\b]+$/;
                // if value is not blank, then test the regex
            //    if (event.target.value === '' || (regex.test(event.target.value) && event.target.value[0] !== '0')) {
                  setWeight(event.target.value)
              //  }
              }}
              margin="normal"
              id="outlined-basic"
              label={`${intl.formatMessage({ id: 'common.weight' })} (${weightUnitLabel})`}
              variant="outlined"
              value={weight}
            />
          </Grid>
          <Grid item xs={2} sx={{ display: 'flex', alignItems: 'center',  justifyContent: 'center'}}>
            <Box sx={{ pt: 1, }}>
              <Tooltip title={intl.formatMessage({ id: 'hint.participant.confimed' })}>
                <FormControlLabel control={<Checkbox color="success" checked={present} onChange={handleCheckboxChange} name='present' />} label={intl.formatMessage({ id: 'common.confirmed'})} />
              </Tooltip>
            </Box>
          </Grid>
        </Grid>

        <Box sx={{ display: 'flex', justifyContent: 'center'}}>
          <Button
            sx={{ height: '40px', mt: 3, }}
            //size='small'
            variant='outlined'
            onClick={onSave}  
          >
            {intl.formatMessage({ id: 'buttons.apply.changes' })}
          </Button>
        </Box>
      </Box>
    </Modal>
  )
})


const modalChildreContainerStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '70%',
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
}

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

