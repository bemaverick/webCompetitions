import * as React from 'react';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import PropTypes from 'prop-types';
import _ from 'lodash';
import Tabs from '@mui/material/Tabs';
import Button from '@mui/material/Button';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Divider from '@mui/material/Divider';
import { Grid, Stack, Toolbar, FormHelperText, Card, CardContent, Chip  } from '@mui/material';
import CastIcon from '@mui/icons-material/Cast';
import { styled } from "@mui/material/styles";
import List from '@mui/material/List';
import Tooltip from '@mui/material/Tooltip';
import ShuffleIcon from '@mui/icons-material/Shuffle';
import PauseIcon from '@mui/icons-material/Pause';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import Checkbox from '@mui/material/Checkbox';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Container from '@mui/material/Container';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate  } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { tournamentStore } from '../stores/tournament';
import { toJS  } from 'mobx';
import { ConfirmProvider, useConfirm } from "material-ui-confirm";
import { useIntl } from 'react-intl'
import { generateTournamentCategoryTitle } from '../utils/categoriesUtils';
import { CATEGORY_STATE, TABLE_STATE, ATHLETE_STATUS, MATCH_RESULT } from '../constants/tournamenConfig';
import { systemStore } from '../stores/systemStore';
import { getFirestore, collection, query, where } from 'firebase/firestore';
import { useCollectionDataOnce, useCollectionOnce } from 'react-firebase-hooks/firestore';
import { firebaseApp, firestoreTournamentsPath } from '../firebase';
import LinearProgress from '@mui/material/LinearProgress';
import { auth } from '../contexts/AuthContext';
import { ResultsByCategories } from '../components/ResultsByCategories';
import { generateResultsPdf } from '../lib/pdf';
import { analytics } from '../services/analytics';

export const markWinnersChannel = new BroadcastChannel('auth_channel');


function TabPanel(props) {
  const intl = useIntl();
  const { tournamentId, tournament } = props;
    const [tournamentsSnapshot, loading, error] = useCollectionOnce(
    collection(getFirestore(firebaseApp), `${firestoreTournamentsPath}/${tournamentId}/results`),
    {
      snapshotListenOptions: { includeMetadataChanges: false },
    }
  )

  React.useEffect(() => {
    if (error) {
      try {
        analytics.logEvent('fetch_tournament_categories_results_errors', { errors: JSON.stringify( error)});
        
      } catch (error) {
      }
    }
  }, [error])
  
  const results = [];
  const categoriesResults = [];

  tournamentsSnapshot?.docs.map(doc => {
    const categoryConfig = doc.data().category;
    const result = doc.data().result;
    results.push({
      category: {
        config: categoryConfig,
        id: doc.data().id
      },
      categoryResults: result
    });
    categoriesResults.push({
      name: generateTournamentCategoryTitle(intl, categoryConfig),
      results: result.map(({ lastName, firstName }) => `${lastName} ${firstName}`)
    });
  });

  if (loading) {
    return (
      <LinearProgress />
    )
  }

  if (!loading && results.length) {
    const pdfResults = {
      title: tournament.tournament.name,
      date: tournament.tournament.date,
      categoriesResults: categoriesResults,
    }

    return (
      <ResultsByCategories
        results={results}
        onClickGenerate={() => {
          analytics.logEvent('on_generate_pdf_past');
          generateResultsPdf(pdfResults);
        }}
      />
    )
  }
  return null;
}

function a11yProps(index) {
  return {
    id: `vertical-tab-${index}`,
    'aria-controls': `vertical-tabpanel-${index}`,
  };
}

const TournamentList = observer(() => {
  const intl = useIntl();
  const auth = useAuth();
  const [value, setValue] = React.useState(0);
  const tournamentCollectionRef = query(
    collection(getFirestore(firebaseApp), firestoreTournamentsPath),
    where("user.uid", "==", auth.user.uid)
  );

  const [tournamentsSnapshot, loading, error] = useCollectionOnce(
    tournamentCollectionRef,
    {
      snapshotListenOptions: { includeMetadataChanges: false },
    }
  )

  React.useEffect(() => {
    if (error) {
      try {
        analytics.logEvent('fetch_tournaments_list_errors', { errors: JSON.stringify( error)});
        
      } catch (error) {
      }
    }
  }, [error])

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  if (loading) {
    return (
      <Box sx={{ width: '100%' }}>
        <LinearProgress />
      </Box>
    )
  }

  const goToTournamentCreation = () => {
    systemStore.setAppState('competitionInProgress');
    analytics.logEvent('create_tournament');
  }

  if (!loading && !tournamentsSnapshot?.docs?.length) {
    return (
      <>
        <Toolbar />

        <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1,  alignItems: 'center', justifyContent: 'center', pb: 20, }}>
          <Typography variant="h6" component="h6" sx={{ pb: 4 }}>
            {intl.formatMessage({ id: 'hint.emptyState.noToutnaments' })}
          </Typography>
          <Button
            sx={{ mt: 2, mb: 3, }}
            onClick={goToTournamentCreation} // TODO move to constants
            variant='outlined'
          >
            {intl.formatMessage({ id: 'button.create.new.tournament' })}
        </Button>
        </Box>
      </>
    )
  }
  return (
    <Box
      sx={{ flexGrow: 1, bgcolor: 'background.paper', display: 'flex', height: 224 }}
    >
      <Tabs
        orientation="vertical"
        variant="scrollable"
        value={value}
        onChange={handleChange}
        aria-label="Vertical tabs example"
        sx={{ borderRight: 1, maxWidth: '250px', borderColor: 'divider' }}
      >
        {tournamentsSnapshot.docs.map((doc) => (
          <Tab key={doc.data().id} label={doc.data().tournament.name} {...a11yProps(0)} />
        ))}
      </Tabs>
      {!!tournamentsSnapshot.docs.length && (
        <TabPanel
          tournament={tournamentsSnapshot.docs[value].data()}
          tournamentId={tournamentsSnapshot.docs[value].id}
        />
      )}
    </Box>
  )

})

export default observer(function Tournament() {
  const intl = useIntl();
  const handleTabChange = (event, newValue) => {
    tournamentStore.setCurrentTableIndex(newValue);
  };

  return (
    <Stack sx={{ height: '100vh' }}>
      <Toolbar />
      {systemStore.appState == 'competitionsList' ? (
        <TournamentList />
      ) : 
        <>
          <Tabs
            value={tournamentStore.currentTableIndex}
            onChange={handleTabChange}
            centered
          >
            
            {Object.keys(tournamentStore.tables).map((table, index) => (
              <Tab
                key={index}
                label={`${intl.formatMessage({ id: "common.table" })} ${index + 1}`}
              />
            ))}
          </Tabs>
          <TableContent />
        </>
      }

    </Stack>
  )
});


const CREATE_CATEGORY_SELECTOR_VAL = 'CREATE_CATEGORY_SELECTOR_VAL';
const TableContent = observer((props) => {
  const intl = useIntl();
  const navigate = useNavigate();
  const confirm = useConfirm();
  const currentTableIndex = tournamentStore.currentTableIndex;
  const currentTable = tournamentStore.currentTable;
  const currentTableState = currentTable.state; // idle, started, or finished;
  const isFinalsAvailable = !!Object.keys(tournamentStore.postponedCategoriesProgress).length;


  const runMatches = () => {
    const actualCategory = tournamentStore.competitorsList.filter(
      ({ participationStatus, tournamentCategoryIds }) => tournamentCategoryIds.includes(currentTable.category) && participationStatus === ATHLETE_STATUS.CHECKED_IN
    );
    if (actualCategory.length < 2) {
      systemStore.displaySnackbar(true, 'error.category.matches.minAmount')
      return;
    }

    tournamentStore.setTableStatus(currentTableIndex, TABLE_STATE.IN_PROGRESS);
    tournamentStore.setTournamentCategoryStatus(CATEGORY_STATE.IN_PROGRESS);
    markWinnersChannel.postMessage({ type: 'refresh' });
  }
  const startMatches = async () => {
    try {
      if (currentTable.category) {
        const categoryHasUncheckedParticipants = tournamentStore.competitorsList.some(
          ({ participationStatus, tournamentCategoryIds }) => {
            return tournamentCategoryIds.includes(currentTable.category) && participationStatus !== ATHLETE_STATUS.CHECKED_IN
          }
        );
        if (categoryHasUncheckedParticipants) {
          await confirm({
            title: intl.formatMessage({ id: 'warning.category.athletes.containUnchecked' }),
            description: intl.formatMessage({ id: 'warning.category.athletes.containUnchecked.explanation' }),
            confirmationText: intl.formatMessage({ id: 'buttons.confirm.startAnyway' }),
            cancellationText: intl.formatMessage({ id: 'buttons.cancel' }),
            confirmationButtonProps: { color: 'error' },
          });
          runMatches();
        } 
        if (!categoryHasUncheckedParticipants) {
          runMatches();
        }
      }
    } catch (error) {
      console.log('user canceled', error)
    }
  }

  const selectCategory = (event) => {
    const { value: categoryId } = event.target;
    if (categoryId === CREATE_CATEGORY_SELECTOR_VAL) {
      navigate('/tournamentCategories');
      return;
    } 
    const selectedCategoryCompetitorsCount = tournamentStore.selectedCategoryCompetitorsCount(categoryId);
    if (!selectedCategoryCompetitorsCount) {
      systemStore.displaySnackbar(true, 'error.selectedCategory.change.noCompetitors')
      return;

    } 
    tournamentStore.setTableCategory(currentTableIndex, categoryId);
  }

  if (currentTableState === TABLE_STATE.IDLE) {
    return (
      <Stack sx={{ flex: 1, pb: 4, justifyContent: 'center',  alignItems: 'center' }}>
        <Box sx={{ width: '35%', display: 'flex', flexDirection: 'column',  alignItems: 'center' }}>
          <FormControl fullWidth>
            <InputLabel id="demo-simple-select-label">{intl.formatMessage({ id: 'common.chooseCategory'})}</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={tournamentStore.currentTable.category}
              label={intl.formatMessage({ id: 'common.chooseCategory' })}
              onChange={selectCategory}
            >
              {tournamentStore.idleCategoriesIdsList
                .map((categoryId) => {
                  const competitorsNumberInCategory = tournamentStore.competitorsList
                    .reduce((accumulator, current) => accumulator + (current.tournamentCategoryIds.includes(categoryId) ? 1 : 0), 0);
                  const label = competitorsNumberInCategory >= 1
                    ? `${competitorsNumberInCategory} ${intl.formatMessage({ id: 'common.participants' })}`
                    : intl.formatMessage({ id: 'common.empty.category' });
                  return (
                    <MenuItem
                      divider
                      key={categoryId}
                      value={categoryId}
                    >
                      {generateTournamentCategoryTitle(intl, tournamentStore.newTournamentCategories[categoryId].config, 'full')}
                      <Chip
                        size='small'
                        label={label}
                        sx={{ ml: 2 }}
                        variant={competitorsNumberInCategory >= 1 ? undefined : "outlined"}
                        color={competitorsNumberInCategory >= 1 ? 'success' : undefined}
                      />
                    </MenuItem>
                 )
              })}
              <MenuItem
                selected
                sx={{ color:  'primary.main'}}
                key={'create_category'}
                value={CREATE_CATEGORY_SELECTOR_VAL}
              >
                {intl.formatMessage({ id: 'button.create.tournamentCategory' })}
              </MenuItem>
            </Select>
            <FormHelperText>
              {intl.formatMessage({ id: 'common.chooseCategoryToStartHint' }, { tableNumber: currentTableIndex + 1 })}
            </FormHelperText>
          </FormControl>
          <Button
            sx={{ mt: 2, mb: 3, }}
            onClick={startMatches}
            variant='contained'
          >
            {intl.formatMessage({ id: 'common.startMatches' })}
          </Button>
          
          {isFinalsAvailable && (
            <>
              <Box sx={{ width: '100%'}}>
                <Divider orientation='horizontal' sx={{ width: '100%'}} textAlign='center'>
                  {intl.formatMessage({ id: 'basic.or' })}
                </Divider>
              </Box>
              <FormControl fullWidth sx={{ mt: 3 }}>
                <InputLabel id="demo-simple-select-label">{intl.formatMessage({ id: 'common.chooseCategory' })}</InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={tournamentStore.currentTable.category}
                  label={intl.formatMessage({ id: 'common.chooseCategory' })}
                  onChange={(event) => tournamentStore.setTableCategory(currentTableIndex, event.target.value)}
                >
                  {tournamentStore.postponedCategoriesIdsList
                    .map((categoryId) => (
                      <MenuItem
                        key={categoryId}
                        value={categoryId}
                      >
                        {generateTournamentCategoryTitle(intl, tournamentStore.newTournamentCategories[categoryId].config, 'full')}
                      </MenuItem>
                  ))}
                </Select>
                <FormHelperText>{intl.formatMessage({ id: 'common.chooseCategoryToContinueHint' }, { tableNumber: currentTableIndex + 1 })}</FormHelperText>
              </FormControl>
              <Button
                sx={{ mt: 2 }}
                onClick={() => {
                  tournamentStore.startPostponedCategories(currentTableIndex);
                  markWinnersChannel.postMessage({ type: 'refresh' });
                }}
                variant='contained'
              >
                {intl.formatMessage({ id: 'common.resumeMatches' })}
              </Button>
            </>
          )}
        </Box>
      </Stack>
    )
  }

  if (currentTableState === TABLE_STATE.IN_PROGRESS || currentTableState === TABLE_STATE.FINISHED) {
    const currentRoundIndex = tournamentStore.currentRoundIndex;
    const nextRoundButtonVisible = currentRoundIndex === Object.keys(currentTable.rounds).length - 1; // if round finished, button not visible;
    const notAllPairsCompleted = tournamentStore.currentGroupA.some(({ stats }) => stats[currentRoundIndex].result === 'idle')
    || tournamentStore.currentGroupB.some(({ stats }) => stats[currentRoundIndex].result === 'idle');
    const isLastRound = tournamentStore.currentGroupA.length === 2 // kind of crunch
     && tournamentStore.currentGroupA.some(
      (competitor) => Object.values(competitor.stats).reduce((prev, current) => prev + (current.result === 'lose' ? 1 : 0), 0) === 2
    )
    const isFinal = tournamentStore.currentGroupA.length <= 2 && tournamentStore.currentGroupB.length === 0;
    const isSuperFinal = isFinal && tournamentStore.currentGroupA.every(
      (competitor) =>  {
        const prevRoundsStats = Object.values(competitor.stats).slice(0, -1);
        return prevRoundsStats.reduce((prev, current) => prev + (current.result === 'lose' ? 1 : 0), 0) === 1
      }
    )
    const postponeFinalButton = isFinal && !isSuperFinal;

    //const categoryLabel= `${intl.formatMessage({ id: 'common.category' })} ${tournamentStore.newTournamentCategories[tournamentStore.currentTable.category].categoryTitleFull}`
    const categoryLabel= generateTournamentCategoryTitle(intl, tournamentStore.newTournamentCategories[tournamentStore.currentTable.category].config, 'full')

    let shuffleButtonVisible = false;
    try {
      shuffleButtonVisible = currentTableState === TABLE_STATE.IN_PROGRESS
        && Object.keys(currentTable.rounds).length === 1
        && currentTable.rounds[0].groupA.every(competitor => competitor.stats[0].result === MATCH_RESULT.IDLE);
    } catch (error) {
      console.log('shuffleButtonVisibility calculation', error);
    }

    return (
      <>
        <Breadcrumbs sx={{ py: 2, px: 1 }} aria-label="breadcrumb">
          {Object.keys(tournamentStore.currentTable.rounds).map((round) => (
            <Button
              key={`${round}`}
              size='small'
              variant="text"
              onClick={() => tournamentStore.setSelectedRoundIndex(parseInt(round))}
            >
              <Typography
                color={round == tournamentStore.currentRoundIndex ? 'green' : "text.primary"}
              >
                {`${intl.formatMessage({ id: 'common.round' })} ${+round + 1}`}
              </Typography>
            </Button>
          ))}
        </Breadcrumbs>

        <Stack sx={{ flexDirection: 'row', flexGrow: 1, overflow: 'hidden', }}>
          <Stack sx={{ flex: 4 }}>
            <Box sx={{
              display: 'flex', flexDirection: 'column', pb: 2, pt: 2, px: 1, alignItems: 'center',   border: '0px solid green'
              }}
            >
              <Typography variant='h6' textAlign={'center'} pb={2}>
                {categoryLabel}
              </Typography>
              <Tooltip
                title={intl.formatMessage({ id: 'hint.categoryContinueLater' })}
              >
                <Button
                  startIcon={<PauseIcon />}
                  onClick={() => {
                    tournamentStore.setTournamentCategoryStatus(CATEGORY_STATE.PAUSED);
                    tournamentStore.saveCategoryProgress();
                    markWinnersChannel.postMessage({ type: 'refresh' });
                  //  tournamentStore.setTableStatus(tournamentStore.currentTableIndex, 'idle');
                  }}
                  variant='outlined'
                  disabled={!nextRoundButtonVisible || isLastRound}
                >
                  {intl.formatMessage({ id: 'buttons.action.pause.category' })}
                </Button>
              </Tooltip>
              {shuffleButtonVisible && (
                <Tooltip title={intl.formatMessage({ id: 'hint.shuffle.particiopants' })}>
                  <Button
                    color='secondary'
                    sx={{ mt: 2 }}
                    onClick={() => tournamentStore.shuffleCategoryCompetitors()}
                    variant='outlined'
                    endIcon={<ShuffleIcon />}
                  >
                    {intl.formatMessage({ id: 'buttons.shuffle.participants' })}
                  </Button>
                </Tooltip>
              )}
    

              {/* <Typography variant='body2' textAlign={'center'} pt={2} color='#696969db'>
                {intl.formatMessage({ id: 'hint.categoryContinueLater' })}
              </Typography> */}
            </Box>
          </Stack>
          <Stack sx={{ flex: 4, flexDirection: 'column', overflow: 'scroll' }}>
            {!!tournamentStore.currentFinalist && 
              <Competitor type="finalist"
                competitor={tournamentStore.currentFinalist}
              />}
            {!!tournamentStore.currentSemiFinalist &&
              <Competitor
                type="semifinalist"
                competitor={tournamentStore.currentSemiFinalist}
              />}
            <GroupA
              isFinal={isFinal}
              isSuperFinal={isSuperFinal}
              editable={nextRoundButtonVisible && currentTableState === TABLE_STATE.IN_PROGRESS}
            />
            <GroupB
              editable={nextRoundButtonVisible && currentTableState === TABLE_STATE.IN_PROGRESS}
            />
            {nextRoundButtonVisible && currentTableState === TABLE_STATE.IN_PROGRESS && (
              <Box sx={{ display: 'flex', p: 2, justifyContent: 'center' }}>
                <Button
                  onClick={() => { tournamentStore.startNextRound(); markWinnersChannel.postMessage({ }); }}
                  variant='contained'
                  disabled={notAllPairsCompleted}
                >
                  {isLastRound
                    ? intl.formatMessage({ id: 'common.finishCategory' })
                    : intl.formatMessage({ id: 'common.nextRound' })
                  }
                </Button>
              </Box>
            )}
            {currentTableState === TABLE_STATE.FINISHED && (
              <Box sx={{ display: 'flex', p: 2, justifyContent: 'center' }}>
                <Button
                  onClick={() => tournamentStore.setTableStatus(currentTableIndex, 'idle')}
                  type='outlined'
                >
                  {intl.formatMessage({ id: 'common.continue' })}
                </Button>
              </Box>
            )}

          </Stack>
          <Stack sx={{ flex: 4, border: '0px solid black', overflow: 'scroll', alignItems: 'center'}}>
            <Box sx={{ pb: 2, px: 4}}>
              <Tooltip
                title={intl.formatMessage({ id: 'hint.table.onenStream' })}
              >
                <Button
                  onClick={() => {
                    window.open(`#/tableStream/${currentTableIndex}`);
                  }}

                  sx={{ mb: 2, }}
                  variant='outlined'
                  endIcon={<CastIcon />}

                >
                  {intl.formatMessage({ id: "buttons.open.streamTable" })}
                </Button>
              </Tooltip>
              {!!_.compact(tournamentStore.results[tournamentStore.currentTable.category]).length && (
                <>
                  <Typography gutterBottom variant="h6" component="div">
                    {intl.formatMessage({ id: 'common.currentResults' })}
                  </Typography>
                  {tournamentStore.results[tournamentStore.currentTable.category]?.map((competitor, index) => (
                    <Typography
                      key={competitor?.id || index}
                      component="p"
                      variant="subtitle1"
                    >
                      {competitor ? `${index + 1}. ${competitor.lastName} ${competitor.firstName}` : `${index + 1}.`}
                    </Typography> 
                  ))}
                </>
              )}
            </Box>
          </Stack>
        </Stack>
      </>
    )
  }
  return null;
})

const GroupA = observer((props) => {
  const intl = useIntl();
  let groupTitle = props.isFinal
    ? intl.formatMessage({ id: 'common.final' })
    : intl.formatMessage({ id: 'common.groupA' });
  if (props.isSuperFinal) {
    groupTitle = intl.formatMessage({ id: 'common.superFinal' });
  }
  if (!tournamentStore.currentGroupAChunked.length) {
    return null;
  }
  return (
    <Stack borderRadius={2} sx={{ backgroundColor: 'transparent', p: 2, mb: 0, border: '2px solid #a0a0a0', }}>
      <Typography gutterBottom variant="h6" component="div">
        {groupTitle}
      </Typography>
      {tournamentStore.currentGroupAChunked.map(([competitor1, competitor2], index) => {
        const currentPairIndex = tournamentStore.currentGroupAChunked.findIndex(
          ([competitor1, _]) => competitor1.stats[tournamentStore.currentRoundIndex].result === 'idle'
        );
        return (
          (
            <Pair
              currentPair={currentPairIndex === index}
              editable={props.editable}
              key={competitor1.id}
              group='groupA'
              firstCompetitor={competitor1}
              secondCompetitor={competitor2}
              isFirstChecked={competitor1.stats[tournamentStore.currentRoundIndex].result === "win"}
              isSecondChecked={competitor2?.stats[tournamentStore.currentRoundIndex].result === "win"}
            />
          )
        )
      })}
    </Stack>
  )
});

const GroupB = observer((props) => {
  const intl = useIntl();

  if (!tournamentStore.currentGroupBChunked.length) {
    return null;
  }
  return (
    <Stack borderRadius={2} sx={{ backgroundColor: 'transparent', p: 2, mt: 4, border: '2px solid #a0a0a0', }}>
      <Typography gutterBottom variant="h6" component="div">
        {intl.formatMessage({ id: 'common.groupB' })}
      </Typography>
      {tournamentStore.currentGroupBChunked.map(([competitor1, competitor2], index) => {
        let currentPairIndex = tournamentStore.currentGroupBChunked.findIndex(
          ([competitor1, _]) => competitor1.stats[tournamentStore.currentRoundIndex].result === 'idle'
        );
        if (tournamentStore.currentGroupA.some((competitor) => competitor.stats[tournamentStore.currentRoundIndex].result === 'idle')) {
          currentPairIndex = -1;
        }
        return (
          (
            <Pair
              currentPair={currentPairIndex === index}
              editable={props.editable}
              key={competitor1.id}
              group='groupB'
              firstCompetitor={competitor1}
              secondCompetitor={competitor2}
              isFirstChecked={competitor1.stats[tournamentStore.currentRoundIndex].result === "win"}
              isSecondChecked={competitor2?.stats[tournamentStore.currentRoundIndex].result === "win"}
            />
          )
        )
      })}
    </Stack>
  )
})

const Pair = (props) => {
  const intl = useIntl();
  const confirm = useConfirm();
  const { isFirstChecked, isSecondChecked } = props;
  
  
  const tapOnCompetitor = (competitorId, gpoupName) => {
    if (isFirstChecked || isSecondChecked) {
      confirm({
        title: intl.formatMessage({ id: 'text.winnerIsChosen' }),
        description: intl.formatMessage({ id: 'text.doChangeWinner' }),
        confirmationText: intl.formatMessage({ id: 'common.yes.change' }),
        cancellationText: intl.formatMessage({ id: 'common.no' }),
      })
        .then(() => {
          tournamentStore.markWinner(competitorId, gpoupName);
        })
        .catch(() => {
          console.log('not confirmed');
        });
    } else {
      tournamentStore.markWinner(competitorId, gpoupName);
    }
  };

  return (
    <Box
      sx={{
        mb: 0,
        p: 2,
        borderRadius: 2,
        position: 'relative',
        border: props.currentPair ? '2px solid green' : '2px solid transparent',
      }}
    >
      {props.currentPair && (
        <Box sx={{
          position: 'absolute',
          mt: '-15px',
          ml: 2,
          top: 0,
          left: 0,
        //  zIndex: 10000,
          backgroundColor: '#F3F6F9', 
          px: 1,
          height: '30px',
          display: 'flex',
          alignItems: 'center'
        }}>
          <Typography
            //textAlign={'center'}
            component="span"
            variant="body2"
          >
            {intl.formatMessage({ id: 'common.currentMatch' })}
        </Typography> 
      </Box>
      )}
      <Box
        sx={{
          m: 0,
          p: 0,
          display: 'flex',
          flexDirection: 'column',
        // bgcolor: 'warning.light',
          bgcolor: 'white',
          boxShadow: 2,
          borderRadius: 2,

        }}
      >
        <Button
          disabled={!props.editable}
          sx={{
            ':hover': {
          //    bgcolor: '#81c784', // theme.palette.primary.main
              bgcolor: isFirstChecked ? '#64c968' : 'rgb(0 108 214 / 11%)', // theme.palette.primary.main

            },
            color: 'text.primary',
            bgcolor: isFirstChecked ? '#81c784' : undefined,
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0
        }}
          onClick={() => tapOnCompetitor(props.firstCompetitor.id, props.group)}
        >
          {props.firstCompetitor.lastName} {props.firstCompetitor.firstName}
        </Button>
        <Divider />
        {props.secondCompetitor ? (
          <Button
            disabled={!props.editable}
            sx={{
              ':hover': {
                //bgcolor: '#81c784', // theme.palette.primary.main
                bgcolor: isSecondChecked ? '#64c968' : 'rgb(0 108 214 / 11%)', // theme.palette.primary.main

              },
              color: 'text.primary',
              bgcolor: isSecondChecked ? '#81c784' : undefined,
              borderTopLeftRadius: 0,
              borderTopRightRadius: 0
            }}
            onClick={() => tapOnCompetitor(props.secondCompetitor.id, props.group)}
          >
            {props.secondCompetitor.lastName} {props.secondCompetitor.firstName}
          </Button>) : (
            <Button
              disabled={true}
              sx={{
                // ':hover': {
                //   bgcolor: '#81c784', // theme.palette.primary.main
                // // color: 'white',
                // },
                color: 'text.primary',
            //   bgcolor: undefined,
                borderTopLeftRadius: 0,
                borderTopRightRadius: 0
              }}
              //onClick={() => tournamentStore.markWinner(props.secondCompetitor.id, props.group)}
            >
              {intl.formatMessage({ id: "common.withoutCompetitor" })}
            </Button>)
        }
      </Box>
    </Box>
  )
}


const Competitor = ({ competitor, type }) => {
  const intl = useIntl();
  const title =
    type === 'finalist'
      ? intl.formatMessage({ id: 'common.finalist'})
      : intl.formatMessage({ id: 'common.semiFinalist'});
  return (
    <Box borderRadius={2} sx={{ mb: 2,  p: 1.5 ,border: '1px solid #a0a0a0', }}>
      <Typography gutterBottom  variant="body1" component="div">
        {title}
      </Typography>
      <Box
        sx={{
          m: 0,
          p: 1,
          display: 'flex',
          flexDirection: 'column',
        // bgcolor: 'warning.light',
          bgcolor: 'white',
          boxShadow: 2,
          borderRadius: 2,
          color: 'text.primary',
          //fontWeight: 500,
          textAlign: 'center'

        }}
      >
        {competitor.lastName} {competitor.firstName}
      </Box>
    </Box>

  )
}

