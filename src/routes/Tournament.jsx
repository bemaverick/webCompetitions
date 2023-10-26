import * as React from 'react';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Divider from '@mui/material/Divider';
import { Grid, Stack, Toolbar, FormHelperText, Card, CardContent, Chip  } from '@mui/material';
import { styled } from "@mui/material/styles";
import List from '@mui/material/List';
import ListItemText from '@mui/material/ListItemText';

import ListItemIcon from '@mui/material/ListItemIcon';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import Checkbox from '@mui/material/Checkbox';


import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';

import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate  } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { tournamentStore } from '../stores/tournament';
import { toJS  } from 'mobx';

const theme = createTheme();

export default observer(function Tournament() {
  // React.useEffect(() => {
  //   console.log('mount Tournament');
  //   return () => console.log('Unmount Tournament')
  // }, []);
  const handleChange = (event, newValue) => {
    tournamentStore.setCurrentTableIndex(newValue);
  };

  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    console.log(event)
  };

  return (
    <ThemeProvider theme={theme}>
      <Stack sx={{ flexDirection: 'column', height: '100vh' }}>
        <Toolbar />
        <Stack sx={{ p: 2, pt: 1, flexGrow: 1, flexDirection: 'column', border: '0px solid green', overflow: 'hidden'  }}>
          <Tabs value={tournamentStore.currentTableIndex} onChange={handleChange} centered>
            {Object.keys(tournamentStore.tables).map((table, index) => (
              <Tab key={index} label={`Стіл ${index + 1}`} />
            ))}
          </Tabs>
          <TableContent />
        </Stack>
      </Stack>
    </ThemeProvider>
  )
  return (
    <ThemeProvider theme={theme}>
      <Container component="main" maxWidth="xm">
        <BasicTabs />
      </Container>
    </ThemeProvider>
  );
});

const TableContent = observer((props) => {
  const currentTableIndex = tournamentStore.currentTableIndex;
  const currentTable = tournamentStore.currentTable;
  const currentTableState = currentTable.state; //idle, started, or finished;
  const [resultShown, setShowResult] = React.useState();

  if (currentTableState === 'idle') {
    return (
      <Stack sx={{ flex: 1, pb: 4, justifyContent: 'center',  alignItems: 'center'}}>
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
              {Object.keys(tournamentStore.newTournamentCategories).map((categoryId) => (
                <MenuItem key={categoryId} value={categoryId}>{tournamentStore.newTournamentCategories[categoryId].categoryTitleFull}</MenuItem>
              ))}
            </Select>
            <FormHelperText>Оберіть категорію, яка боротиметься за столом №{currentTableIndex + 1}</FormHelperText>
          </FormControl>
          <Button sx={{ mt: 2, mb: 3, }} onClick={() => tournamentStore.setTableStatus(currentTableIndex, 'started')} variant='outlined'>Розпочати боротьбу</Button>
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
              {Object.keys(tournamentStore.postponedFinals).map((categoryId) => (
                <MenuItem key={categoryId} value={categoryId}>{tournamentStore.newTournamentCategories[categoryId].categoryTitleFull}</MenuItem>
              ))}
            </Select>
            <FormHelperText>Оберіть категорію, в якій відбудуться фінальні поєдинки за столом №{currentTableIndex + 1}</FormHelperText>
          </FormControl>
          <Button sx={{ mt: 2 }} onClick={() => tournamentStore.startPostponedFinal(currentTableIndex)} variant='outlined'>Розпочати фінали</Button>
        </Box>
      </Stack>
    )
  }
  if (currentTableState === 'finished') {
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
                  Розпочати нову категрію
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
  if (currentTableState === 'started') {
    const currentRoundIndex = tournamentStore.currentRoundIndex;
    const isButtonVisible = currentRoundIndex ===  Object.keys(currentTable.rounds).length - 1; // if round finished, button not visible;
    const nonAllParCompleted = tournamentStore.currentGroupA.some(({ stats }) => stats[currentRoundIndex].result === 'idle')
    ||  tournamentStore.currentGroupB.some(({ stats }) => stats[currentRoundIndex].result === 'idle');
    const isLastRound = tournamentStore.currentGroupA.length === 2 // kind of crunch
     && tournamentStore.currentGroupA.some(
      (competitor) => Object.values(competitor.stats).reduce((prev, current) => prev + (current.result === 'lose' ? 1 : 0), 0) === 2
    )
    const isFinal = tournamentStore.currentGroupA.length <= 2 && tournamentStore.currentGroupB.length === 0;
    const isSuperFinal = isFinal && tournamentStore.currentGroupA.every(
      (competitor) =>  {
        const prevRoundsStats = Object.values(competitor.stats).slice(0, -1);
        console.log('Object.values(competitor.stats)', toJS(prevRoundsStats));
        return prevRoundsStats.reduce((prev, current) => prev + (current.result === 'lose' ? 1 : 0), 0) === 1
      }
    )
    const postponeFinalButton = isFinal && !isSuperFinal;

    return (
      <>
        <Breadcrumbs aria-label="breadcrumb">
          {Object.keys(tournamentStore.currentTable.rounds).map((round) => (
            <Button key={`${round}`} size='small' variant="text" onClick={() => tournamentStore.setSelectedRoundIndex(parseInt(round))}>
              <Typography color={round == tournamentStore.currentRoundIndex ? 'green' : "text.primary"}>Раунд {parseInt(round) + 1}</Typography>
            </Button>
          ))}
        </Breadcrumbs>
        <Stack sx={{ flexGrow: 1, border: '0px solid pink', overflow: 'scroll' }}>
          <Grid container justifyContent={'center'}>
            <Grid item xs={4} sx={{  }}>
              <GroupA isFinal={isFinal} isSuperFinal={isSuperFinal} editable={isButtonVisible} />
              <GroupB editable={isButtonVisible} />
              {postponeFinalButton && (
                <Box sx={{ display: 'flex', pt: 2, justifyContent: 'center' }}>
                  <Button
                    onClick={() => tournamentStore.postponeFinalForCategory()}
                    variant='contained'
                  >
                    Провести фінал пізніше
                  </Button>
                </Box>
              )}
              {isButtonVisible && (
                <Box sx={{ display: 'flex', pt: 2, justifyContent: 'center' }}>
                  <Button
                    onClick={() => tournamentStore.startNextRound()}
                    variant='contained'
                    disabled={nonAllParCompleted}
                  >
                    {isLastRound ? 'До результатів' : 'Наступний круг'}
                  </Button>
                </Box>
              )}
      

            </Grid>
          </Grid>
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
  return (
    <Card variant="outlined" sx={{ backgroundColor: 'transparent', p: 2, pb: 0, pt: 1, mb: 2, mt: 1 }}>
      <Typography gutterBottom variant="h6" component="div">
        {groupTitle}
      </Typography>
      {tournamentStore.currentGroupAChunked.map(([competitor1, competitor2]) => (
        <Pair
          editable={props.editable}
          key={competitor1.id}
          group='groupA'
          firstCompetitor={competitor1}
          secondCompetitor={competitor2}
          isFirstChecked={competitor1.stats[tournamentStore.currentRoundIndex].result === "win"}
          isSecondChecked={competitor2?.stats[tournamentStore.currentRoundIndex].result === "win"}
        />
      ))}
    </Card>
  )
});

const GroupB = observer((props) => {
  if (!tournamentStore.currentGroupBChunked.length) {
    return null;
  }
  return (
    <Card variant="outlined" sx={{ backgroundColor: 'transparent', p: 2, pb: 0, pt: 1 }}>
      <Typography gutterBottom variant="h6" component="div">
        Нижня сітка
      </Typography>
      {tournamentStore.currentGroupBChunked.map(([competitor1, competitor2]) => (
        <Pair
          editable={props.editable}
          key={competitor1.id}
          group='groupB'
          firstCompetitor={competitor1}
          secondCompetitor={competitor2}
          isFirstChecked={competitor1.stats[tournamentStore.currentRoundIndex].result === "win"}
          isSecondChecked={competitor2?.stats[tournamentStore.currentRoundIndex].result === "win"}
        />
      ))}
    </Card>
  )
})


const Pair = (props) => {
  return (
    <Box
      sx={{
        mb: 2,
        display: 'flex',
        flexDirection: 'column',
      // bgcolor: 'warning.light',
        bgcolor: 'white',
        borderRadius: 2,
        boxShadow: 2,
      }}
    >
      <Button
        disabled={!props.editable}
        sx={{
          ':hover': {
            bgcolor: '#81c784', // theme.palette.primary.main
           // color: 'white',
          },
          color: 'text.primary',
          bgcolor: props.isFirstChecked ? '#81c784' : undefined,
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0
      }}
        onClick={() => tournamentStore.markWinner(props.firstCompetitor.id, props.group)}
      >
        {props.firstCompetitor.lastName} {props.firstCompetitor.firstName}
      </Button>
      <Divider />
      {props.secondCompetitor ? (
        <Button
          disabled={!props.editable}
          sx={{
            ':hover': {
              bgcolor: '#81c784', // theme.palette.primary.main
             // color: 'white',
            },
            color: 'text.primary',
            bgcolor: props.isSecondChecked ? '#81c784' : undefined,
            borderTopLeftRadius: 0,
            borderTopRightRadius: 0
          }}
          onClick={() => tournamentStore.markWinner(props.secondCompetitor.id, props.group)}
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
  )
}

function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

CustomTabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

const BasicTabs = observer(function() {
  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    tournamentStore.setCurrentTableIndex(newValue);
  };

  const tables = new Array(tournamentStore.tablesCount);

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs centered value={tournamentStore.currentTableIndex} onChange={handleChange} aria-label="basic tabs example">
          {tables.fill(0).map((el, index) => (
            <Tab label={`Стіл ${index + 1}`} {...a11yProps(0)} />
          ))}
        </Tabs>
      </Box>
      {tables.map((_, index) => (
        <CustomTabPanel value={tournamentStore.currentTableIndex} index={index}>
          {tournamentStore.currentTable.state === 'idle' && (
            <>
              <FormControl fullWidth>
                <InputLabel id="demo-simple-select-label">Оберіть категорію для боротьби</InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={tournamentStore.currentTable.category}
                  label="Age"
                  onChange={(event) => tournamentStore.setTableCategory(index, event.target.value)}

                >
                  {Object.keys(tournamentStore.tournamentCategories).map((category) => (
                    <MenuItem key={category} value={category}>{category}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button onClick={() => tournamentStore.setTableStatus(index, 'started')} type='outlined'>Розпочати</Button>
            </>
          )}
          {tournamentStore.currentTable.state === 'started' && (
            <>
              <div role="presentation" onClick={(event) => { event.preventDefault(); }}>
                <Breadcrumbs aria-label="breadcrumb">
                  {Object.keys(tournamentStore.currentTable.rounds).map((round) => (
                    <Button key={`${round}`} size='small' variant="text" onClick={() => tournamentStore.setSelectedRoundIndex(parseInt(round))}>
                      <Typography color={round == tournamentStore.currentRoundIndex ? 'green' : "text.primary"}>Round {parseInt(round) + 1}</Typography>
                    </Button>
                  ))}
                </Breadcrumbs>
              </div>

              <List sx={{ width: '100%', maxWidth: 480}}>
                <h4>Верхня сітка</h4>
                {tournamentStore.currentGroupAChunked.map(([competitor1, competitor2]) => {
                  //const labelId = `checkbox-list-label-${value}`;
                  const isCheckedFirst = competitor1.stats[tournamentStore.currentRoundIndex].result === "win";
                  const isCheckedSecond = competitor2?.stats[tournamentStore.currentRoundIndex].result === "win"

                  //currentTable.rounds[selectedRound][currentCompetitorIndex].results[selectedRound].result = 'win';
                  return (
                    <div key={competitor1.id} style={{ backgroundColor: 'rgb(210,244,210)',  borderBottom: "3px solid grey" }}>
                      <ListItem disablePadding>
                        <ListItemButton role={undefined} onClick={() => tournamentStore.markWinner(competitor1.id, 'groupA')} dense>
                          <ListItemIcon>
                            <Checkbox
                              edge="start"
                              checked={isCheckedFirst}
                              //checked={isChecked}
                              tabIndex={-1}
                              disableRipple
                              //inputProps={{ 'aria-labelledby': labelId }}
                            />
                          </ListItemIcon>
                          <ListItemText primary={`${competitor1.lastName} ${competitor1.firstName}`} />
                        </ListItemButton>
                      </ListItem>
                      {competitor2 ? (
                        <ListItem disablePadding>
                          <ListItemButton role={undefined} onClick={() => tournamentStore.markWinner(competitor2.id, 'groupA')} dense>
                            <ListItemIcon>
                              <Checkbox
                                edge="start"
                                checked={isCheckedSecond}
  
                                //checked={isChecked}
                                tabIndex={-1}
                                disableRipple
                                //inputProps={{ 'aria-labelledby': labelId }}
                              />
                            </ListItemIcon>
                            <ListItemText primary={`${competitor2.lastName} ${competitor2.firstName}`} />
                          </ListItemButton>
                        </ListItem>
                        ) : (
                          <ListItem>
                            <ListItemText primary={`Без суперника`} />
                          </ListItem>
                        )}
                    </div>
                  )
                })}
              </List>
              <List sx={{ width: '100%', maxWidth: 480 }}>
                <h4>Нижня сітка</h4>
                {tournamentStore.currentGroupBChunked.map(([competitor1, competitor2]) => {

                  //const labelId = `checkbox-list-label-${value}`;
                  const isCheckedFirst = competitor1.stats[tournamentStore.currentRoundIndex].result === "win";
                  const isCheckedSecond = competitor2?.stats[tournamentStore.currentRoundIndex].result === "win"

                  //currentTable.rounds[selectedRound][currentCompetitorIndex].results[selectedRound].result = 'win';
                  return (
                    <div key={competitor1.id} style={{ backgroundColor: 'rgb(244,210,210)' }}>
                      <ListItem disablePadding>
                        <ListItemButton role={undefined} onClick={() => tournamentStore.markWinner(competitor1.id, 'groupB')} dense>
                          <ListItemIcon>
                            <Checkbox
                              edge="start"
                              checked={isCheckedFirst}
                              //checked={isChecked}
                              tabIndex={-1}
                              disableRipple
                              //inputProps={{ 'aria-labelledby': labelId }}
                            />
                          </ListItemIcon>
                          <ListItemText primary={`${competitor1.lastName} ${competitor1.firstName}`} />
                        </ListItemButton>
                      </ListItem>
                      {competitor2 ? (
                        <ListItem disablePadding>
                          <ListItemButton role={undefined} onClick={() => tournamentStore.markWinner(competitor2.id, 'groupB')} dense>
                            <ListItemIcon>
                              <Checkbox
                                edge="start"
                                checked={isCheckedSecond}
                                tabIndex={-1}
                                disableRipple
                                //inputProps={{ 'aria-labelledby': labelId }}
                              />
                            </ListItemIcon>
                            <ListItemText primary={`${competitor2.lastName} ${competitor2.firstName}`} />
                          </ListItemButton>
                        </ListItem>
                      ) : (
                        <ListItem>
                          <ListItemText primary={`Без суперника`} />
                        </ListItem>
                      )}
                    </div>
                  )
                })}
              </List>
              <Button onClick={() => tournamentStore.startNextRound()} type='outlined'>Наступний круг</Button>
            </>
          )}

        </CustomTabPanel>
      ))}
    </Box>
  );
})