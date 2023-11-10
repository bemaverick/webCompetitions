import * as React from 'react';
import Grid from '@mui/material/Grid';
import { Button, MenuItem, Modal, FormControl, Select, InputLabel, Box, OutlinedInput, Chip, FormGroup, List, FormControlLabel, Checkbox, ListItem, ListItemButton, ListItemIcon, ListItemText, TextField } from '@mui/material';

import Typography from '@mui/material/Typography';
import { observer } from 'mobx-react-lite';
import { tournamentStore } from '../stores/tournament';
import DoneIcon from '@mui/icons-material/Done';
import _ from 'lodash';

type EditCompetitorModalProps = {
  modalVisible: boolean;
  onClose: () => void;
  competitor: {
    firstName: string;
    lastName: string;
    weight: string;
    tournamentCategoryIds: string[];
    id: string;
  };
}

export const EditCompetitorModal = observer((props: EditCompetitorModalProps): any => {
  const weightUnitLabel = tournamentStore.weightUnit.label;
  const [firstName, setFirstName] = React.useState(props.competitor?.firstName);
  const [lastName, setLastName] = React.useState(props.competitor?.lastName);
  const [weight, setWeight] = React.useState(props.competitor?.weight);

  const [selectedCategoryIds, setSelectedCategoryIds] = React.useState(props.competitor?.tournamentCategoryIds || []);

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
      id: props.competitor.id
    });
    setFirstName('');
    setLastName('');
    setWeight('');
    setSelectedCategoryIds([]);
    props.onClose();
  }

  return (
    <Modal
      open={props.modalVisible}
      onClose={props.onClose}
    >
      <Box sx={modalChildreContainerStyle}>
        <Typography variant="h6" component="h6" sx={{ p: 0.5, pb: 3, textAlign: 'center' }}>
            Редагування користувача
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
              label="Ім'я"
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
        </Grid>
        <Box sx={{ display: 'flex', justifyContent: 'center'}}>
          <Button
            sx={{ height: '40px', mt: 3, }}
            //size='small'
            variant='outlined'
            onClick={onSave}  
          >
            Застосувати зміни
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

