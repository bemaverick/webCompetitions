import * as React from 'react';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Button from '@mui/material/Button';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Divider from '@mui/material/Divider';
import { Grid, Stack, Toolbar, FormHelperText, Card, CardContent, Chip  } from '@mui/material';
import { styled } from "@mui/material/styles";
import List from '@mui/material/List';
import Tooltip from '@mui/material/Tooltip';

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


export default observer(function Tournament() {
  const handleTabChange = (event, newValue) => {
    tournamentStore.setCurrentTableIndex(newValue);
  };


  return (
    <Stack sx={{ flexDirection: 'column', height: '100vh' }}>
      <Toolbar />
      <Tabs
        value={tournamentStore.currentTableIndex}
        onChange={handleTabChange}
        centered
      >
        {Object.keys(tournamentStore.tables).map((table, index) => (
          <Tab key={index} label={`Стіл ${index + 1}`} />
        ))}
      </Tabs>
      <TableContent />
    </Stack>
  )
});

const TableContent = observer((props) => {
  const currentTableIndex = tournamentStore.currentTableIndex;
  const currentTable = tournamentStore.currentTable;
  const currentTableState = currentTable.state; // idle, started, or finished;
  const isFinalsAvailable = !!Object.keys(tournamentStore.postponedCategoriesProgress).length;

  if (currentTableState === 'idle') {
    return (
      <Stack sx={{ flex: 1, pb: 4, justifyContent: 'center',  alignItems: 'center' }}>
        <Box sx={{ width: '35%', display: 'flex', flexDirection: 'column',  alignItems: 'center' }}>
          <FormControl fullWidth>
            <InputLabel id="demo-simple-select-label">Оберіть категорію</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={tournamentStore.currentTable.category}
              label="Оберіть категорію"
              onChange={(event) => tournamentStore.setTableCategory(currentTableIndex, event.target.value)}
            >
              {Object.keys(tournamentStore.newTournamentCategories)
                .filter((categoryId => tournamentStore.newTournamentCategories[categoryId].state === 'idle'))
                .map((categoryId) => (
                <MenuItem key={categoryId} value={categoryId}>{tournamentStore.newTournamentCategories[categoryId].categoryTitleFull}</MenuItem>
              ))}
            </Select>
            <FormHelperText>Оберіть категорію, яка боротиметься за столом №{currentTableIndex + 1}</FormHelperText>
          </FormControl>
          <Button
            sx={{ mt: 2, mb: 3, }}
            onClick={() => {
              tournamentStore.setTableStatus(currentTableIndex, 'started');
              tournamentStore.setTournamentCategoryStatus('started');
            }}
            variant='outlined'
          >
            Розпочати боротьбу
          </Button>
          
          {isFinalsAvailable && (
            <>
              <Box sx={{ width: '100%'}}>
                <Divider orientation='horizontal' sx={{ width: '100%'}} textAlign='center' >Або</Divider>
              </Box>
              <FormControl fullWidth sx={{ mt: 3 }}>
                <InputLabel id="demo-simple-select-label">Оберіть категорію</InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={tournamentStore.currentTable.category}
                  label="Оберіть категорію"
                  onChange={(event) => tournamentStore.setTableCategory(currentTableIndex, event.target.value)}
                >
                  {Object.keys(tournamentStore.postponedCategoriesProgress)
                    .filter((categoryId => tournamentStore.newTournamentCategories[categoryId].state === 'paused'))
                    .map((categoryId) => (
                    <MenuItem key={categoryId} value={categoryId}>{tournamentStore.newTournamentCategories[categoryId].categoryTitleFull}</MenuItem>
                  ))}
                </Select>
                <FormHelperText>Оберіть категорію, в якій продовжиться боротьба</FormHelperText>
              </FormControl>
              <Button
                sx={{ mt: 2 }}
                onClick={() => {
                  tournamentStore.startPostponedCategories(currentTableIndex);
                }}
                variant='outlined'
              >
                  Продовжити боротьбу
                </Button>
            </>
          )}
        </Box>
      </Stack>
    )
  }
  if (currentTableState === 'finished1') {
    return (
      <>
        <Stack sx={{ flexGrow: 1, border: '0px solid pink', overflow: 'scroll' }}>
          <Grid container justifyContent={'center'}>
            <Grid item xs={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', p: 2, justifyContent: 'center' }}>
                <Button
                  onClick={() => tournamentStore.setTableStatus(currentTableIndex, 'idle')}
                  type='outlined'
                >
                  Розпочати нову категорію
                </Button>
              </Box>
              <Typography
                textAlign={'center'}
                component="h6"
                variant="h6"
                gutterBottom
              >
                "{tournamentStore.newTournamentCategories[tournamentStore.currentTable.category].categoryTitleFull}"
              </Typography> 
              <Box>
                {tournamentStore.results[tournamentStore.currentTable.category].map((competitor, index) => (
                  <Typography
                    key={competitor.id}
                    component="p"
                    variant="body1"
                  >
                    {`${index + 1}.${competitor.firstName} ${competitor.lastName}`}
                    </Typography> 
                ))}
              </Box>
            </Grid>
          </Grid>
        </Stack>
      </>
    )
  }
  if (currentTableState === 'started' || currentTableState === 'finished') {
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

    return (
      <>
        <Breadcrumbs sx={{ py: 2, px: 1 }} aria-label="breadcrumb">
          {Object.keys(tournamentStore.currentTable.rounds).map((round) => (
            <Button key={`${round}`} size='small' variant="text" onClick={() => tournamentStore.setSelectedRoundIndex(parseInt(round))}>
              <Typography color={round == tournamentStore.currentRoundIndex ? 'green' : "text.primary"}>Раунд {parseInt(round) + 1}</Typography>
            </Button>
          ))}
        </Breadcrumbs>

        <Stack sx={{ flexDirection: 'row', flexGrow: 1, overflow: 'hidden' }}>
          <Stack sx={{ flex: 4 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', pb: 2, pt: 2, px: 1, alignItems: 'center', justifyContent: 'center' }}>
              <Typography variant='h6' textAlign={'center'} pb={2}>
                Категорія: {tournamentStore.newTournamentCategories[tournamentStore.currentTable.category].categoryTitleFull}
              </Typography>
              <Button
                onClick={() => {
                  tournamentStore.setTournamentCategoryStatus('paused');
                  tournamentStore.saveCategoryProgress();
                  tournamentStore.setTableStatus(tournamentStore.currentTableIndex, 'idle');

                }}
                variant='contained'
                disabled={!nextRoundButtonVisible || isLastRound}
              >
                Продовжити пізніше
                {/* Провести фінал пізніше */}
              </Button>
              <Typography variant='body2' textAlign={'center'} pt={2} color='#696969db'>
                Зберегти поточні результати і розпочати нову категорію
              </Typography>

            </Box>
          </Stack>
          <Stack sx={{ flex: 4, flexDirection: 'column', overflow: 'scroll' }}>
            {!!tournamentStore.currentFinalist && <Competitor type="finalist" competitor={tournamentStore.currentFinalist} />}
            {!!tournamentStore.currentSemiFinalist && <Competitor type="semifinalist" competitor={tournamentStore.currentSemiFinalist} />}
            <GroupA
              isFinal={isFinal}
              isSuperFinal={isSuperFinal}
              editable={nextRoundButtonVisible && currentTableState === 'started'}
            />
            <GroupB editable={nextRoundButtonVisible && currentTableState === 'started'} />
            {/* {postponeFinalButton && (
              <Box sx={{ display: 'flex', pb: 2, justifyContent: 'center' }}>
                <Button
                  onClick={() => {
                    tournamentStore.saveCategoryProgress();
                    tournamentStore.setTableStatus(tournamentStore.currentTableIndex, 'idle');
                  }}
                  variant='contained'
                >
                  Провести фінал пізніше
                </Button>
              </Box>
            )} */}
            {/* {currentRoundIndex === 0 && (
              <Box sx={{ display: 'flex', pb: 2, justifyContent: 'center' }}>
                <Button
                  onClick={() => tournamentStore.shuffleCategoryCompetitors()}
                  variant='contained'
                >
                  Змішати
                </Button>
              </Box>
            )} */}
            {nextRoundButtonVisible && currentTableState === 'started' && (
              <Box sx={{ display: 'flex', p: 2, justifyContent: 'center' }}>
                <Button
                  onClick={() => tournamentStore.startNextRound()}
                  variant='contained'
                  disabled={notAllPairsCompleted}
                >
                  {isLastRound ? 'Завершити категорію' : 'Наступний круг'}
                </Button>
              </Box>
            )}
            {currentTableState === 'finished' && (
              <Box sx={{ display: 'flex', p: 2, justifyContent: 'center' }}>
                <Button
                  onClick={() => tournamentStore.setTableStatus(currentTableIndex, 'idle')}
                  type='outlined'
                >
                  Розпочати нову категорію
                </Button>
              </Box>
            )}

          </Stack>
          <Stack sx={{ flex: 4, border: '0px solid black', overflow: 'scroll', alignItems: 'center'}}>
            <Box sx={{ p: 2, px: 4}}>
            <Typography gutterBottom variant="h6" component="div">
              Поточні результати
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
            </Box>
            
          </Stack>
        </Stack>
      </>
    )
  }
  return null;
})

const GroupA = observer((props) => {
  let groupTitle = props.isFinal ? 'Фінал' : 'Верхня сітка';
  if (props.isSuperFinal) {
    groupTitle = 'Супер фінал';
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
  if (!tournamentStore.currentGroupBChunked.length) {
    return null;
  }
  return (
    <Stack borderRadius={2} sx={{ backgroundColor: 'transparent', p: 2, mt: 4, border: '2px solid #a0a0a0', }}>
      <Typography gutterBottom variant="h6" component="div">
        Нижня сітка
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
  const confirm = useConfirm();
  const { isFirstChecked, isSecondChecked } = props;
  
  const tapOnCompetitor = (competitorId, gpoupName) => {
    if (isFirstChecked || isSecondChecked) {
      confirm({
        title: 'Переможець в цій парі вже визначений.',

        description: "Змінити переможця?",
        confirmationText: 'Так, змінити',
        cancellationText: 'Ні'
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
          Поточна пара
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
              Без суперника
            </Button>)
        }
      </Box>
    </Box>
  )
}


const Competitor = ({ competitor, type }) => {
  const title = type === 'finalist' ? "Фіналіст" : "Півфіналіст";
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

