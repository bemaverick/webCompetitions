import * as React from 'react';
import Grid from '@mui/material/Grid';
import { Button, MenuItem, Modal, CircularProgress, FormHelperText, InputLabel, Box, OutlinedInput, FormGroup, Link, FormControlLabel, Checkbox, ListItem, ListItemButton, ListItemIcon, ListItemText, TextField, Alert, Stack } from '@mui/material';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import PublicGoogleSheetsParser from 'public-google-sheets-parser'
import { useIntl } from 'react-intl';
import { observer } from 'mobx-react-lite';
import { tournamentStore } from '../stores/tournament';
import DoneIcon from '@mui/icons-material/Done';
import { Chip } from '@mui/material';
import _ from 'lodash';
import { categoryChipStyle, categoryStateTranslationsKey, generateTournamentCategoryTitle, getCategoryShortId } from '../utils/categoriesUtils';
import { ATHLETE_STATUS, ATHLETES_LIST_SOURCE, CATEGORY_STATE } from '../constants/tournamenConfig';
import { detectGoogleSheetLink, extractGoogleSheetId } from '../services/google';
import { systemStore } from '../stores/systemStore';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import Tournament from '../routes/Tournament';


// type GoogleSheetImportModalProps = {
//   modalVisible: boolean;
//   onClose: () => void;
//   competitor: {
//     firstName: string;
//     lastName: string;
//     weight: string;
//     tournamentCategoryIds: string[];
//     id: string;
//     participationStatus
//   };
// }


export const GoogleSheetImportModal = observer((props) => {
  const intl = useIntl();
  const [link, setLink] = React.useState('');
  const isInvalid = link && !detectGoogleSheetLink(link);
  const [items, setItems] = React.useState(0);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      if (props.modalVisible) {
        await handleFocus();
      }
    })()
  }, [props.modalVisible]);

  const handleFocus = async () => {
    const bufferText = await navigator.clipboard.readText();
    if (bufferText) {
      const isGoogleLink = detectGoogleSheetLink(bufferText);
      if (isGoogleLink) {
        setLink(isGoogleLink);
        systemStore.displaySnackbar(true, 'hint.link.detected', 'success')
      }
    }
  }

  function validateImportedAthlete(athlete) {
    return athlete['First Name']
      && athlete['Last Name']
      && athlete ['Tournament Categories']
      // && athlete ['Weight']
  }
  function validateImportedAthleteCategories(athleteCategories, originCategories) {
    const athleteCategoriesNames = athleteCategories.split(', ');
    const bracketRegex = /\[([A-Za-z0-9]{8})\]$/;
    const originCategoriesShortId = {};
    Object.keys(originCategories).map(categoryId => { originCategoriesShortId[getCategoryShortId(categoryId)] = true; })
    
    return athleteCategoriesNames.every((categoryName) => {
      const match = categoryName.match(bracketRegex);
      if (match && match[1]) {
        return !!originCategoriesShortId[match[1]];
      } else {
        return null;
      }
    })
  }
  function transformImportedAthleteCategoriesNamesToIds(athleteCategories, originCategories) {
    const originCategoriesShortId = {};
    Object.keys(originCategories).map(categoryId => { originCategoriesShortId[getCategoryShortId(categoryId)] = originCategories[categoryId].id; })
    const athleteCategoriesNames = athleteCategories.split(', ');
    const bracketRegex = /\[([A-Za-z0-9]{8})\]$/;

    return athleteCategoriesNames.map((categoryName) => {
      const match = categoryName.match(bracketRegex);
      return originCategoriesShortId[match[1]];
    })

  }

  const parseResults = async () => {
    try {
      setLoading(true);
      if (!isInvalid) {
        const parser = new PublicGoogleSheetsParser(extractGoogleSheetId(link));
        const data = await parser.parse();
        data.map((athlete) => {
          const isValid = validateImportedAthlete(athlete)
          if (isValid) {
            const isCategoriesValid = validateImportedAthleteCategories(athlete['Tournament Categories'], tournamentStore.newTournamentCategories);
            console.log(isCategoriesValid);
            if (isCategoriesValid) {
              const tournamentCategoryIds = transformImportedAthleteCategoriesNamesToIds(athlete['Tournament Categories'], tournamentStore.newTournamentCategories);
              console.log('athlete', athlete, tournamentCategoryIds);
              tournamentStore.addCompetitor({
                firstName: athlete['First Name'],
                lastName: athlete['Last Name'],
                weight: String(athlete['Weight'] || ''),
                participationStatus: ATHLETE_STATUS.REGISTERED,
                tournamentCategoryIds: tournamentCategoryIds,
                source: ATHLETES_LIST_SOURCE.IMPORTED
              })
              props.onClose();
            
            }
          }
        })
        console.log(data);
      } 
    } catch (error) {
      
    } finally {
      setLoading(true);
    }
  }


  return (
    <Modal
      open={props.modalVisible}
      onClose={props.onClose}
    >
      <Box sx={modalChildreContainerStyle}>
        <Alert severity="warning"
          sx={{
            whiteSpace: 'pre-line', // ✅ важливо: щоб \n працювали
            lineHeight: 1.5,
          }}
        >
          {intl.formatMessage({ id: 'hint.googleSheet.requirements.alert' })}
          <br />
          <Link
            target="_blank"
            rel="noreferrer"
            href="https://forms.gle/UByihhVpXWB8PpDz5"
          >
            {intl.formatMessage({ id: 'google.forms.example' })}
          </Link>
          <br />
          <Link
            target="_blank"
            rel="noreferrer"
            href="https://docs.google.com/spreadsheets/d/1JETdgsNRt03FIQuJmBH44lCICFe5Z7m_2MLiaTLonXA/edit?usp=sharing"
          >
            {intl.formatMessage({ id: 'google.sheets.example' })}
          </Link>
          
        </Alert>
        <Alert severity="info"
          sx={{
            mt: 2
          }}
        >
          <Box sx={{ pb: 1, }}>

          <Link
            target="_blank"
            rel="noreferrer"
            href="https://brick-swan-502.notion.site/Set-Up-Your-Google-Form-to-Collect-Athlete-Sign-Ups-2a8ab1eba8f48067a0eced5ca48cf55c"
          >
           {intl.formatMessage({ id: 'google.forms.integration.guide' })}
          </Link>
          </Box>
          <Link
            target="_blank"
            rel="noreferrer"
            href="https://brick-swan-502.notion.site/Import-Athletes-from-an-Existing-Google-Sheet-2a8ab1eba8f480b38125d9d51cc78bc4?source=copy_link"
          >
           {intl.formatMessage({ id: 'google.forms.intrgation.existing.guide' })}
          </Link>
        </Alert>

        <TextField
          id="outlined-basic"
          sx={{ my: 3, }}
          label={intl.formatMessage({ id: 'google.sheets.link' })}
          value={link}
          fullWidth
          size='small'
          variant="filled"
          onChange={(event) => {
            setLink(event.target.value);
          }}
          onFocus={handleFocus}
          helperText={
            isInvalid ? intl.formatMessage({ id: 'validation.google.link.invalid' }) : ''
          }
          error={isInvalid}
        />
        <Stack sx={{ mt: 1, alignItems: 'center' }}>
          <Button
            startIcon={loading ? <CircularProgress size={20} /> : <CloudDownloadIcon />}
            disabled={isInvalid || !link}
            color="secondary"
            variant='contained'
            onClick={parseResults}
          >
            {intl.formatMessage({ id: 'buttons.import.list' })}
          </Button>
        </Stack>
      </Box>
    </Modal>
  )
})


const modalChildreContainerStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '55%',
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
}

