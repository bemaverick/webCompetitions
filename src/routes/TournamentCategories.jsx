import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Dialog from '@mui/material/Dialog';
import PeopleIcon from '@mui/icons-material/People';
import PersonIcon from '@mui/icons-material/Person';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Slide from '@mui/material/Slide';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import { FormHelperText, Button, Badge, Stack, Modal, FormControl, MenuItem, Select, InputLabel, Divider, ListSubheader, Chip, FormGroup, List, FormControlLabel, Checkbox, ListItem, ListItemButton, ListItemIcon, ListItemText, TextField, selectClasses } from '@mui/material';

import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { useAuth } from '../contexts/AuthContext';
import { styled } from '@mui/material/styles';

import { useNavigate  } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { tournamentStore } from '../stores/tournament';
import DoneIcon from '@mui/icons-material/Done';
import _ from 'lodash';
import Toolbar from '@mui/material/Toolbar';
import { toJS } from 'mobx';
import { CompetitorRow } from '../components/Competitor';
import { EditCompetitorModal } from '../components/EditCompetitorModal';
import { useIntl } from 'react-intl';
import { CATEGORY_OPEN_ID, CATEGORY_STATE } from '../constants/tournamenConfig';
import { categoryChipStyle, categoryStateTranslationsKey, generateTournamentCategoryTitle } from '../utils/categoriesUtils';
import { systemStore } from '../stores/systemStore';


const Transition = React.forwardRef(function Transition(
  props,
  ref,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default observer(function TournamentCategories() {
  const intl = useIntl();
  
  const [creatingCategoryModal, setCreatingCategoryModal] = React.useState(false);
  const [currentCategoryId, setCurrentCategoryId] = React.useState(
    Object.keys(tournamentStore.newTournamentCategories)[0] || ''
  );

  const isTournamentCategoriesListEmpty = Object.keys(tournamentStore.newTournamentCategories).length === 0;

  if (isTournamentCategoriesListEmpty) {
    return (
      <>
        <Stack sx={{ flexDirection: 'column', height: '100vh' }}>
          <Toolbar />
          <Stack sx={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center', p: 2, pb: 4 }}>
            <Typography variant="h6" component="h6" sx={{ mb: 2, textAlign: 'center' }}>
              {intl.formatMessage({ id: 'categories.emptyState' })}
            </Typography>
            <Button
              onClick={() => setCreatingCategoryModal(true)}
              color="primary"
              size="large"
              variant="contained"
            >
              {intl.formatMessage({ id: 'button.create.tournamentCategory' })}
            </Button>
          </Stack>
        </Stack>
        <ModalForCategories
          modalVisible={creatingCategoryModal}
          onClose={() => setCreatingCategoryModal(false)}
          setCurrentCategory={(id) => setCurrentCategoryId(id)}
        />
      </>  
    )
  }

  return (
    <>
      <Stack sx={{ flexDirection: 'column', height: '100vh' }}>
        <Toolbar />
        <Stack sx={{ flexGrow: 1, overflow: 'hidden', flexDirection: 'row'}}>
          <Stack sx={{ flex: 3, overflow: 'scroll', p: 2, pt: 0 }}>
            <List
              sx={{ pt: 0}}
              dense={true}
            >
              <ListSubheader
                disableGutters
                sx={{ display: 'flex', pt: 0, backgroundColor: 'transparent', justifyContent: 'center', borderBottom: '2px solid #ddd', }}
              >
                <Button
                  sx={{ mt: 2, mb: 2 }}
                  onClick={() => setCreatingCategoryModal(true)}
                  color="primary"
                  size="small"
                  variant="contained"
                >
                   {intl.formatMessage({ id: 'button.add.tournamentCategory' })}
                </Button>
              </ListSubheader>
              {Object.values(tournamentStore.newTournamentCategories).map((category) => (
                <CategoryItem
                  onClick={() => setCurrentCategoryId(category.id)}
                  selected={currentCategoryId === category.id}
                  key={category.id}
                  id={category.id}
                  //Senior Women 50 kg Left
                  categoryState={category.state}
                  title={generateTournamentCategoryTitle(intl, category.config)}
                  subTitle={generateTournamentCategoryTitle(intl, category.config, 'handOnly')}
                />
              ))}
            </List>
          </Stack>
          <Divider orientation='vertical'></Divider>
          <CategoryDetailsView
            setCurrentCategoryId={(id) => setCurrentCategoryId(id)}
            tournamentCategoryId={currentCategoryId}
          />
        </Stack>
      </Stack>
      <ModalForCategories
        modalVisible={creatingCategoryModal}
        onClose={() => setCreatingCategoryModal(false)}
        setCurrentCategory={(id) => setCurrentCategoryId(id)}
      />    
    </>
  )
})

// const StyledBadge = styled(Badge)(({ theme }) => ({
//   '& .MuiBadge-badge': {
//     right: -3,
//     top: 13,
//     border: `2px solid ${(theme.vars ?? theme).palette.background.paper}`,
//     padding: '0 4px',
    
//   },
// }));


const CategoryItem = ({ title, subTitle, id, onClick, selected, categoryState }) => {
  const intl = useIntl();
  const stateLabel = intl.formatMessage({ id: categoryStateTranslationsKey[categoryState] });
  const competitorsNumberInCategory = tournamentStore.competitorsList
    .reduce((accumulator, current) => accumulator + (current.tournamentCategoryIds.includes(id) ? 1 : 0), 0);
//  const secondary = competitorsNumberInCategory >= 1 ? `${subTitle} | ${competitorsNumberInCategory} athletes` : subTitle;
  
  return (
    <ListItem divider disablePadding>
      <ListItemButton selected={selected} onClick={onClick}>
        <ListItemText
          primary={title}
          secondary={subTitle}
        />
       {competitorsNumberInCategory > 0 && (
          <Badge sx={{ mx: 1 }}  badgeContent={competitorsNumberInCategory} color="info">
            <PersonIcon color="disabled" />
          </Badge>
       )}

        <Chip size='small' sx={{ mx: 1, mr: 0 }} label={stateLabel} color={categoryChipStyle[categoryState]} />
      </ListItemButton>
    </ListItem>
  )
}

const CategoryDetailsView = observer((props) => {
  const navigate = useNavigate();
  const intl = useIntl();
  const [removalConfirmationModal, setRemovalConfirmationModal] = React.useState(false);

  const currentTournamentCategory = tournamentStore.newTournamentCategories[props.tournamentCategoryId];
  const weightUnitLabel = intl.formatMessage({ id: `unit.weight.${tournamentStore.weightUnit.value}`});
  const [editModalVisble, setEditModalVisble] = React.useState(false);
  const [selectedCompetitor, setSelectedCompetitor] = React.useState(null);
  const [searchQuery, setSearchQuery] = React.useState('');

  const navigateToCompetitors = () => {
    navigate('/tournamentParticipants', { state: { tournamentCategoryId: props.tournamentCategoryId }});
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
  //console.log('categoryCompetitorsList', toJS(categoryCompetitorsList))

  const removeCategory = () => { 
    setRemovalConfirmationModal(false);
    const isCategoryAlreadyLaunched = tournamentStore.newTournamentCategories[props.tournamentCategoryId].state !== CATEGORY_STATE.IDLE;
    if (isCategoryAlreadyLaunched) {
      systemStore.displaySnackbar(true, 'error.selectedCategory.inProgress.remove');
      return;
    }
    const isFirstItem = Object.keys(tournamentStore.newTournamentCategories)[0] === props.tournamentCategoryId;
    props.setCurrentCategoryId(isFirstItem ? (Object.keys(tournamentStore.newTournamentCategories)[1] || '') : Object.keys(tournamentStore.newTournamentCategories)[0]);
    //kind of crutch to prevent for access to undefined in  currentTournamentCategory.config  
    tournamentStore.removeTournamentCategory(props.tournamentCategoryId)
  }

  const onDeleteCompetitor = (competitorId) => {
    const categoryState = tournamentStore.newTournamentCategories[props.tournamentCategoryId].state;
    if (categoryState === CATEGORY_STATE.IDLE) {
      tournamentStore.removeCompetitorFromCategory(competitorId, props.tournamentCategoryId);

    } else {
      systemStore.displaySnackbar(true, intl.formatMessage({ id: 'warning.category.specific.delete.athlete' }));
    }
  }

  const addAthetesEnabled = currentTournamentCategory.state === CATEGORY_STATE.IDLE
  
  return (
    <>
      <Stack sx={{ flex: 7, flexDirection: 'column', p: 2 }}>
        <Typography variant="h6" component="h6" sx={{ p: 0, textAlign: 'center' }}>
          {generateTournamentCategoryTitle(intl, currentTournamentCategory.config, 'full')}
        </Typography>
        {addAthetesEnabled && (
          <Grid container justifyContent={'center'} sx={{ p: 2 }}>
            <Grid item xs={3}>
              <Button
                //sx={{ height: '40px', mt: 2 }}
                size='noraml'
                fullWidth
                variant='contained'
                onClick={navigateToCompetitors}
              >
                {intl.formatMessage({ id: 'buttons.add.participant' })}
              </Button>
            </Grid>
          </Grid>
        )}
        <Stack elevation={2} sx={{ flexGrow: 1, mt: 1, p: 2, overflow: 'hidden', border: '2px solid #eee', borderRadius: 1  }}>
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
          <Stack sx={{ flexGrow: 1, overflow: 'scroll' }}>
            {categoryCompetitorsList.map((competitor, index) => (
              <CompetitorRow
                key={competitor.id}
                position={index + 1}
                firstName={competitor.firstName}
                lastName={competitor.lastName}
                present={competitor.present}
                weight={`${competitor.weight} ${weightUnitLabel}`}
                categories={competitor.tournamentCategoryIds.map(
                  (tournamentId) => tournamentStore.newTournamentCategories[tournamentId].categoryTitleFull
                )}
                onEdit={() => {
                  setEditModalVisble(true);
                  setSelectedCompetitor(competitor);
                }}
                onDelete={() => onDeleteCompetitor(competitor.id)}
              />
            ))}
          </Stack>
        </Stack>
        <Box sx={{ display: 'flex', justifyContent: 'center', pt: 1, width: '100%' }}>
          <Button
            color='error'
            size='small'
            variant='outlined'
            onClick={() => setRemovalConfirmationModal(true)}
            >
              {intl.formatMessage({ id: 'buttons.remove.category' })}
          </Button>
        </Box>
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
      <AlertDialogSlide
        state={removalConfirmationModal}
        onClose={() => setRemovalConfirmationModal(false)}
        onAgree={() => removeCategory()}
        
      />
    </>
  )
})

const modalChildrenContainerStyle = {
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
  const intl = useIntl();
  const [validationErrors, showValidationErrors] = React.useState(false);
  const [numberOfCategories, setNumberOfCategories] = React.useState(0);
  const weightUnitLabel = intl.formatMessage({ id: `unit.weight.${tournamentStore.weightUnit.value}`});
  const [classification, setClassification] = React.useState(tournamentStore.classificationCategories[0]);
  const [selectedWeightCategories, setSelectedWeightCategories] = React.useState({});
  const [checkboxes, setCheckboxes] = React.useState({
    men: true,
    women: false,
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

  React.useEffect(() => {
    if (validationErrors && !_.isEmpty(selectedWeightCategories)) {
      showValidationErrors(false);
    }
  }, selectedWeightCategories, validationErrors);

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
    console.log('selectedWeightCategories', selectedWeightCategories)
    if (_.isEmpty(selectedWeightCategories) || (!checkboxes.left && !checkboxes.right) || (!checkboxes.men && !checkboxes.women)) {
      showValidationErrors(true);
      return;
    } else {
      showValidationErrors(false);
    }
    props.onClose();
    tournamentStore.createTournamentCategories({
      classification,
      weightCategories: selectedWeightCategories,
      leftHand: left,
      rightHand: right,
      men,
      women
    });
    props.setCurrentCategory(Object.keys(tournamentStore.newTournamentCategories)[0]);
  }

  React.useEffect(() => {
    let totalCount = 0;
    if (classification.id && !_.isEmpty(selectedWeightCategories) && Object.values(checkboxes).some(el => el)) {
      const weightCategoriesNumber = Object.keys(selectedWeightCategories).length;
      const handsNumber = left && right ? 2 : 1;
      const genderNumber = men && women ? 2 : 1;
      const multiplier = handsNumber * genderNumber;

      console.log(multiplier, Object.values(checkboxes), checkboxes);
      totalCount = weightCategoriesNumber * multiplier;
    }
    setNumberOfCategories(totalCount);
  }, [checkboxes, classification, selectedWeightCategories])


  const selectClassification = (event) => {
    const classificationId = event.target.value;
    const selectedClassification = tournamentStore.classificationCategories.find(classification => classification.id === classificationId);
    setClassification(selectedClassification);
  }

  return (
    <Modal
      open={props.modalVisible}
      onClose={props.onClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
   >
      <Box sx={modalChildrenContainerStyle}>
        <Typography variant="h6" component="h6" sx={{ p: 0.5, pb: 3, textAlign: 'center' }}>
          {intl.formatMessage({ id: 'categories.title.builder'})}
        </Typography>
        <FormControl fullWidth>
          <InputLabel id="demo-simple-select-label">
            {intl.formatMessage({ id: 'common.classification'})}
          </InputLabel>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={classification.id}
            label={intl.formatMessage({ id: 'common.classification'})}
            //onChange={(event) => console.log('event', event.target.value,_.find(tournamentStore.classificationCategories, (item) => item.id == event.target.value))}
            onChange={selectClassification}
          >
            {tournamentStore.classificationCategories.map((classificationCategory) => (
              <MenuItem
        
                key={classificationCategory.id}
                value={classificationCategory.id}

              >
                {classificationCategory.label || intl.formatMessage({ id: classificationCategory.labelKey })}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Typography gutterBottom variant="body1" sx={{ mt: 2 }}>
          {intl.formatMessage({ id: 'common.select.weightCategories'})}:
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap">
          {tournamentStore.weightCategories.map((weightCategory) => {
            const isSelected = selectedWeightCategories[weightCategory.value];
            return (
              <Chip
                sx={{ mb: 1 }}
                key={weightCategory.id}
                color={isSelected ? 'success' : 'default'}
               // label={`${weightCategory.value} ${weightUnitLabel}`}
                label={weightCategory.id === CATEGORY_OPEN_ID ? intl.formatMessage({ id: "category.open" }) : `${weightCategory.value} ${weightUnitLabel}`}
                onClick={() => selectWeightCategory(weightCategory)}
                deleteIcon={isSelected ? <DoneIcon /> : undefined}
                onDelete={isSelected ? () => selectWeightCategory(weightCategory) : undefined}
              />
            )
          })}
        </Stack>
        {validationErrors && _.isEmpty(selectWeightCategory) && <FormHelperText sx={{ py: 2 }} error>{intl.formatMessage({ id: 'common.select.weightCategories'})}</FormHelperText>}
        <Grid container sx={{ justifyContent: 'center', mt: 2, }}>
          <Grid item xs={6}>
            <Typography gutterBottom variant="body1" sx={{ mt: 2, }}>
              {intl.formatMessage({ id: 'common.sex'})}:
            </Typography>
            <FormControlLabel control={<Checkbox color="success" checked={men} onChange={handleChange} name='men' />} label={intl.formatMessage({ id: 'common.sex.men'})} />
            <FormControlLabel control={<Checkbox color="success" checked={women} onChange={handleChange} name='women' />} label= {intl.formatMessage({ id: 'common.sex.women'})} />
            {validationErrors && (!checkboxes.men && !checkboxes.women) && <FormHelperText error>{intl.formatMessage({ id: 'validation.commong.required'})}</FormHelperText>}
          </Grid>
          <Grid item xs={6}>
            <Typography gutterBottom variant="body1" sx={{ mt: 2, }}>
              {intl.formatMessage({ id: 'common.hand'})}:
            </Typography>
            <FormControlLabel control={<Checkbox color="success" checked={left} onChange={handleChange} name='left' />} label={intl.formatMessage({ id: 'common.hand.left'})} />
            <FormControlLabel control={<Checkbox color="success" checked={right} onChange={handleChange} name='right' />} label={intl.formatMessage({ id: 'common.hand.right'})} />
            {validationErrors && (!checkboxes.left && !checkboxes.right) && <FormHelperText error>{intl.formatMessage({ id: 'validation.commong.required'})}</FormHelperText>}
          </Grid>
        </Grid>
        <Typography variant="subtitle1" component="h6" sx={{ pt: 2, textAlign: 'center' }}>
          {intl.formatMessage({ id: 'hint.tournamentCategories.count.beGenerated'})} [{numberOfCategories}]
        </Typography>
        <Stack direction="row" spacing={2} sx={{ justifyContent: "center", mt: 1.5, mb: 0 }}>
          <Button
            onClick={onSave}
            color="primary"
            size="large"
            variant="outlined"
          >
            {intl.formatMessage({ id: 'buttons.create.categories'})}
          </Button>
        </Stack>
      </Box>
    </Modal>
  )
});

function AlertDialogSlide(props) {
  const intl = useIntl();

  return (
    <React.Fragment>
      <Dialog
        open={props.state}
        slots={{
          transition: Transition,
        }}
        keepMounted
        onClose={props.onClose}
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle>{intl.formatMessage({ id: 'warning.category.remove.confirmationModal1' })}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-slide-description">
            {intl.formatMessage({ id: 'warning.category.remove.confirmationModal2' })}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={props.onClose}>{intl.formatMessage({ id: 'buttons.cancel' })}</Button>
          <Button color='error' onClick={props.onAgree}>{intl.formatMessage({ id: 'buttons.remove.category' })}</Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}

