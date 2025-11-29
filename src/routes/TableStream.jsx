import * as React from 'react';
import { Grid, Box, Chip, Typography } from '@mui/material';
import FaceIcon from '@mui/icons-material/Face';
import { observer } from "mobx-react-lite";
import { useIntl } from 'react-intl';
import { useParams } from 'react-router-dom';
import _ from 'lodash';
import { markWinnersChannel } from './Tournament';
import { tournamentStore } from '../stores/tournament';
import { generateTournamentCategoryTitle } from '../utils/categoriesUtils';
import { CATEGORY_STATE, MATCH_RESULT, MATCH_STATE, TABLE_STATE } from '../constants/tournamenConfig';
import { toJS } from 'mobx';

// markWinnersChannel.onmessage = (event) => {
//     console.log('Отримано повідомлення:', event.data);
//     //location.reload();
// };

markWinnersChannel.onmessageerror = (event) => {
  console.log('onmessageerror erro', event)
}


const calculateNextRound = (currentRoundIndex, currentGroupA, currentGroupB, currentFinalist, currentSemifinalist) => {
  const nextRoundIndex = currentRoundIndex + 1;
  const newRoundGroupA = [];
  let newRoundGroupB = [];
  let finalist = currentFinalist;
  let semifinalist = currentSemifinalist;
  const finishedGroup = []; // list of competitors who have finished in current round;
  let exitToFinal = false; // who will go to final and who to semifinal, both competitors with no loses;
  let isSuperFinal = false; // when groupB is empty and there are 2 competitors in groupA with 1 lose for each;

  currentGroupA.map((competitor, index) => {
    const currentGroupALength = currentGroupA.length;
    const isLastPairIncomplete = (index === currentGroupALength - 1) && currentGroupALength % 2 === 1; 
    const isCompetitorWinner = competitor.stats[currentRoundIndex].result === MATCH_RESULT.WIN;
    const isCompetitorLoser = competitor.stats[currentRoundIndex].result === MATCH_RESULT.LOSE;

    if (currentGroupALength === 2 && index === 0) { // 
      const firstCompetitorLosesCountInPrevRoounds = Object.keys(competitor.stats) //we dont count lose in current round
        .reduce((prev, current) => prev + (competitor.stats[current].result === MATCH_RESULT.LOSE && current != currentRoundIndex ? 1 : 0), 0);
      const secondCompetitorLosesCountInPrevRounds = Object.keys(currentGroupA[1].stats) //we dont count lose in current round
        .reduce((prev, current) => prev + (currentGroupA[1].stats[current].result === MATCH_RESULT.LOSE && current != currentRoundIndex ? 1 : 0), 0);
      if (firstCompetitorLosesCountInPrevRoounds === 0 && secondCompetitorLosesCountInPrevRounds === 0) {
        exitToFinal = true;
      }
      console.log('LosesCountInPrevRoounds', firstCompetitorLosesCountInPrevRoounds, secondCompetitorLosesCountInPrevRounds);
    };

    if (exitToFinal) { // to prevent copy of competitor in next iteration
      if (!semifinalist && !finalist) {
        if (isCompetitorWinner) {
          finalist = competitor;
          semifinalist = currentGroupA[1];
        }
        if (isCompetitorLoser) {
          semifinalist = competitor; 
          finalist = currentGroupA[1];
        }
      }
      return;
    }

    if (index === 0 && currentGroupB.length === 0 && currentGroupALength === 2 ) { //&& !semifinalist && !finalist
      //can be SUPERFINAL, && !semifinalist && !finalist is unnecessary
      const firstCompetitorLosesCountInAllRoounds = Object.values(competitor.stats)
        .reduce((prev, current) => prev + (current.result === MATCH_RESULT.LOSE ? 1 : 0), 0);
      const secondCompetitorLosesCountInAllRounds = Object.values(currentGroupA[1].stats)
        .reduce((prev, current) => prev + (current.result === MATCH_RESULT.LOSE ? 1 : 0), 0); 
      console.log('CompetitorLosesCountInAllRoounds', firstCompetitorLosesCountInAllRoounds, secondCompetitorLosesCountInAllRounds)
      if (firstCompetitorLosesCountInAllRoounds === 1 && secondCompetitorLosesCountInAllRounds === 1) { // means superfinal
        isSuperFinal = true;
        if (isCompetitorWinner) {
          const updatedWinner = _.cloneDeep(competitor);
         // _.set(updatedWinner.stats, [nextRoundIndex, 'result'], MATCH_RESULT.IDLE);
          newRoundGroupA.push(updatedWinner);
          const updatedLoser = _.cloneDeep(currentGroupA[1]);
         // _.set(updatedLoser.stats, [nextRoundIndex, 'result'], MATCH_RESULT.IDLE);
          newRoundGroupA.push(updatedLoser);
        } 
        if (isCompetitorLoser) {
          const updatedLoser = _.cloneDeep(competitor);
        //  _.set(updatedLoser.stats, [nextRoundIndex, 'result'], MATCH_RESULT.IDLE);
          newRoundGroupA.push(updatedLoser);
          const updatedWinner = _.cloneDeep(currentGroupA[1]);
          //_.set(updatedWinner.stats, [nextRoundIndex, 'result'], MATCH_RESULT.IDLE);
          newRoundGroupA.unshift(updatedWinner);
        }
        return;
      }
    }
    if (isSuperFinal) { // all competitors already calculated above, prevent copy of loser competitor in next iteration
      return;
    }

    //IN THE FINAL IN GROUP A CAN BE A COMPETITOR WITH LOSSES, WE NEED TO COUNT LOSSES
    const numberOfLoses = Object.values(competitor.stats).reduce((prev, current) => prev + (current.result === MATCH_RESULT.LOSE ? 1 : 0), 0);
    console.log(competitor.lastName, numberOfLoses)

    // 2 LOSES IN A => COMPETITION IS FINISHING
    if (numberOfLoses === 2) {
      finishedGroup.unshift( _.cloneDeep(competitor));
      return;
    }

      // NO PAIR, MOVES TO TOP OF HIS GROUP IN NEXT ROUND
    if (isLastPairIncomplete) {
      const updateCompetitor = _.cloneDeep(competitor);
     // _.set(updateCompetitor.stats, [nextRoundIndex, 'result'], MATCH_RESULT.IDLE)
      newRoundGroupA.unshift(updateCompetitor);
      return;
    }
    if (isCompetitorWinner) {
      const updateCompetitor = _.cloneDeep(competitor);
      //_.set(updateCompetitor.stats, [nextRoundIndex, 'result'], MATCH_RESULT.IDLE)
      newRoundGroupA.push(updateCompetitor)
    }

    // COMPETITOR MOVES TO GROUP B
    if (isCompetitorLoser) {
      const updateCompetitor = _.cloneDeep(competitor);
      _//.set(updateCompetitor.stats, [nextRoundIndex, 'result'], MATCH_RESULT.IDLE)
      newRoundGroupB.push(updateCompetitor)
    }
  });

  currentGroupB.map((competitor, index) => { 
    const isLastPairIncomplete = (index === currentGroupB.length - 1) && currentGroupB.length % 2 === 1;
    const isCompetitorWinner = competitor.stats[currentRoundIndex].result === MATCH_RESULT.WIN;
    const isCompetitorLoser = competitor.stats[currentRoundIndex].result === MATCH_RESULT.LOSE;

    // NO PAIR, MOVES TO TOP OF HIS GROUP IN NEXT ROUND
    if (isLastPairIncomplete) {
      const updateCompetitor = _.cloneDeep(competitor);
     // _.set(updateCompetitor.stats, [nextRoundIndex, 'result'], MATCH_RESULT.IDLE)
      newRoundGroupB.unshift(updateCompetitor);
      return;
    }
    if (isCompetitorWinner) {
      const updateCompetitor = _.cloneDeep(competitor);
     // _.set(updateCompetitor.stats, [nextRoundIndex, 'result'], MATCH_RESULT.IDLE);
      newRoundGroupB.push(updateCompetitor)
    }
    // COMPETITOR FINISHING AND MOVED TO RESULT
    if (isCompetitorLoser) {
      finishedGroup.unshift(_.cloneDeep(competitor)); 
    }
  });

  if (semifinalist) {
    if (newRoundGroupB.length === 1 || newRoundGroupB.length == 0) {
      const updateCompetitor = _.cloneDeep(semifinalist);
      //_.set(updateCompetitor.stats, [nextRoundIndex, 'result'], MATCH_RESULT.IDLE);
      newRoundGroupB.unshift(updateCompetitor);
      semifinalist = null;
    }
  } 

  if (finalist) {
    if (!semifinalist && newRoundGroupB.length === 1) {
      const updatedFinalist = _.cloneDeep(finalist);
      //_.set(updatedFinalist.stats, [nextRoundIndex, 'result'], MATCH_RESULT.IDLE);
      newRoundGroupA.push(updatedFinalist);
      const updatedSemifinalist = _.cloneDeep(newRoundGroupB[0]);
      //_.set(updatedSemifinalist.stats, [nextRoundIndex, 'result'], MATCH_RESULT.IDLE);
      newRoundGroupA.push(updatedSemifinalist);
      finalist = null;
      newRoundGroupB = [];
    }
  }

  //END OF CATEGORY
  if (newRoundGroupA.length === 1 && newRoundGroupB.length === 0) {
    finishedGroup.unshift( _.cloneDeep(newRoundGroupA[0]));       
  }


  return {
    finalist,
    semifinalist,
    finishedGroup,
    newRoundGroupA,
    newRoundGroupB
  }


 
}

export default observer(function TableStream() {
  
  const intl = useIntl();
  const [tablesCount, setTablesCount] = React.useState();
  const params = useParams();
  const [prevFirstCompetitor, setPrevFirstCompetitor] = React.useState();
  const [prevSecondCompetitor, setPrevSecondCompetitor] = React.useState();
  const currentTableIndex = params.id;

  React.useEffect(() => {
    const onMessage = (event) => {
      const winner = event?.data?.winner;
      const loser = event?.data?.loser;
      console.log('Отримано повідомлення:', event.data, );

      if (event?.data?.type === 'refresh') {
        location.reload();
      }
      if (winner && loser && event?.data?.tableIndex == currentTableIndex) {
        location.reload();
        // setPrevFirstCompetitor(winner);
        // setPrevSecondCompetitor(loser);
      }
    };
    markWinnersChannel.onmessage = onMessage;
    return () => markWinnersChannel.removeEventListener('message', onMessage)
  }, []);

  const currentCategory = tournamentStore.newTournamentCategories[tournamentStore.tables[currentTableIndex].category];
  console.log('currentCategory', currentCategory)

  if (currentCategory?.state !== CATEGORY_STATE.IN_PROGRESS) {
    return (
      <Grid container sx={{ border: '0px solid red', height: '100vh'}}>
        <Grid item xs={3} sx={{ border: '0px solid green'}}></Grid>
        <Grid item xs={6} sx={{ border: '0px solid green', display: 'flex', flexDirection: 'column'}}>
          <Box sx={{ flex: 3, border: '0px solid blue', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
            <Typography variant='h5' sx={{ mb: 4}}>
              {intl.formatMessage({ id: "warning.stream.noMatches" })}
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={3} sx={{ border: '0px solid green', }}>-</Grid>
      </Grid>
    )
  }

  const categoryName = generateTournamentCategoryTitle(intl, currentCategory.config, 'full');


  const actualRoundIndex = Object.keys(tournamentStore.tables[currentTableIndex].rounds).length - 1; //

  const groupALength = tournamentStore.tables[currentTableIndex].rounds[actualRoundIndex].groupA.length;
  const groupBLength = tournamentStore.tables[currentTableIndex].rounds[actualRoundIndex].groupB.length;
  const groupAEmpty = !groupALength; 
  const groupBEmpty = !groupBLength;
  const { finalist, semifinalist } = tournamentStore.tables[currentTableIndex].rounds[actualRoundIndex];
  const isFirstRound = actualRoundIndex === 0;
  //console.log(`groupALength=${groupALength}, groupBLength=${groupBLength}, finalist=${finalist}, semifinalist=${semifinalist}`)
  const groupALastPairWithoutPair = !!(groupALength % 2);
  const groupBLastPairWithoutPair = !!(groupBLength % 2);
  //console.log(`isFirstRound=${isFirstRound}, groupALastPairWithoutPair=${groupALastPairWithoutPair}, groupBLastPairWithoutPair=${groupBLastPairWithoutPair}`);


  const firstIDLECompetitorIndexInGroupA = tournamentStore.tables[currentTableIndex].rounds[actualRoundIndex].groupA
    .findIndex((competitor) => competitor.stats[actualRoundIndex].result === TABLE_STATE.IDLE);
  const firstIDLECompetitorIndexInGroupB = tournamentStore.tables[currentTableIndex].rounds[actualRoundIndex].groupB
    .findIndex((competitor) => competitor.stats[actualRoundIndex].result === TABLE_STATE.IDLE);
  
  const secondIDLECompetitorIndexInGroupA = firstIDLECompetitorIndexInGroupA === -1
    ? -1
    : _.findIndex(tournamentStore.tables[currentTableIndex].rounds[actualRoundIndex].groupA, ((competitor) => competitor.stats[actualRoundIndex].result === TABLE_STATE.IDLE), firstIDLECompetitorIndexInGroupA + 2);
  const secondIDLECompetitorIndexInGroupB = firstIDLECompetitorIndexInGroupB === -1
    ? -1
    : _.findIndex(tournamentStore.tables[currentTableIndex].rounds[actualRoundIndex].groupB, ((competitor) => competitor.stats[actualRoundIndex].result === TABLE_STATE.IDLE), firstIDLECompetitorIndexInGroupB + 2);

  // console.log('secondIDLECompetitorIndexInGroupA', secondIDLECompetitorIndexInGroupA, secondIDLECompetitorIndexInGroupB)

  const currentPairInGroupACompetitor0 = tournamentStore.tables[currentTableIndex].rounds[actualRoundIndex].groupA[firstIDLECompetitorIndexInGroupA];
  const currentPairInGroupACompetitor1 = tournamentStore.tables[currentTableIndex].rounds[actualRoundIndex].groupA[firstIDLECompetitorIndexInGroupA + 1];

  const currentPairInGroupBCompetitor0 = tournamentStore.tables[currentTableIndex].rounds[actualRoundIndex].groupB[firstIDLECompetitorIndexInGroupB];
  const currentPairInGroupBCompetitor1 = tournamentStore.tables[currentTableIndex].rounds[actualRoundIndex].groupB[firstIDLECompetitorIndexInGroupB + 1];

  const nextPairInGroupACompetitor0 = tournamentStore.tables[currentTableIndex].rounds[actualRoundIndex].groupA[secondIDLECompetitorIndexInGroupA];
  const nextPairInGroupACompetitor1 = tournamentStore.tables[currentTableIndex].rounds[actualRoundIndex].groupA[secondIDLECompetitorIndexInGroupA + 1];

  const nextPairInGroupBCompetitor0 = tournamentStore.tables[currentTableIndex].rounds[actualRoundIndex].groupB[secondIDLECompetitorIndexInGroupB];
  const nextPairInGroupBCompetitor1 = tournamentStore.tables[currentTableIndex].rounds[actualRoundIndex].groupB[secondIDLECompetitorIndexInGroupB + 1];
  
  const lastPairInGroupACompetitor0 = tournamentStore.tables[currentTableIndex].rounds[actualRoundIndex].groupA[groupALength - 1];
  const lastPairInGroupBCompetitor0 = tournamentStore.tables[currentTableIndex].rounds[actualRoundIndex].groupB[groupBLength - 1];


  const getMatchPairTitle = (firstCompetitor, secondCompetitor) => {
    if (secondCompetitor === MATCH_STATE.IN_PROGRESS) {
      return `${firstCompetitor?.lastName} ${firstCompetitor?.firstName} vs In Progress`;
    }
    if (firstCompetitor === MATCH_STATE.IN_PROGRESS) {
      return `In Progress vs ${secondCompetitor?.lastName} ${secondCompetitor?.firstName}`;
    }
    return `${firstCompetitor?.lastName} ${firstCompetitor?.firstName} vs ${secondCompetitor?.lastName} ${secondCompetitor?.firstName}`
  }

  // const calculateTwoNextWinnersInGroup = (groupName = 'groupA', index = 4) => {
  //   const winners = tournamentStore.tables[currentTableIndex].rounds[actualRoundIndex][groupName]
  //     .filter((competitor, i) => competitor.stats[actualRoundIndex].result === MATCH_RESULT.WIN && i < index);
  //   return winners;
  // }

  // const calculateTwoNextLoosersInGroupA = () => {
  //   const winners = tournamentStore.tables[currentTableIndex].rounds[actualRoundIndex].groupA
  //     .filter((competitor, index) => competitor.stats[actualRoundIndex].result === MATCH_RESULT.LOSE && index < 4);
  //   return winners;
  // }


  const calculateCurrentPair = () => {
    const { groupA, groupB, finalist, semifinalist } = tournamentStore.tables[currentTableIndex].rounds[actualRoundIndex];
    const groupAUnpaired = _.isEmpty(groupA.slice(groupALength - groupALength % 2, groupALength)) ? null : groupA.slice(groupALength - groupALength % 2, groupALength)[0];
    const groupBUnpaired = _.isEmpty(groupB.slice(groupBLength - groupBLength % 2, groupBLength)) ? null : groupB.slice(groupBLength - groupBLength % 2, groupBLength)[0];

    const groupAStripped = groupA.slice(0, groupALength - groupALength % 2);
    const groupBStripped = groupB.slice(0, groupBLength - groupBLength % 2);

    const allMatches = [
      ...groupAStripped,
      ...groupBStripped
    ];

    const firstIDLECompetitorIndex = allMatches.findIndex((competitor) => competitor.stats[actualRoundIndex].result === TABLE_STATE.IDLE);


    if (firstIDLECompetitorIndex !== -1) {
     // console.log('here pair', )
      let status = 'default';  // means default preliminary matches
      //console.log('allMatches', allMatches.length, semifinalist, finalist)
      // if (allMatches.length === 2) {
      //if ()
      if (groupA.length === 2) {
      
        if (finalist) {
          status = 'semifinal';
        }
        if (!groupBEmpty && firstIDLECompetitorIndex === 0) {
          status = 'WBFinal';
        }
        const firstCompetitorLosesCount = Object.keys(allMatches[firstIDLECompetitorIndex].stats) //we dont count lose in current round
          .reduce((prev, current) => prev + (allMatches[firstIDLECompetitorIndex].stats[current].result === MATCH_RESULT.LOSE ? 1 : 0), 0);
        const secondCompetitorLosesCount = Object.keys( allMatches[firstIDLECompetitorIndex +1].stats) //we dont count lose in current round
          .reduce((prev, current) => prev + (allMatches[firstIDLECompetitorIndex + 1].stats[current].result === MATCH_RESULT.LOSE ? 1 : 0), 0);
        if (firstCompetitorLosesCount + secondCompetitorLosesCount === 1) {
          status = 'final'
        }

        if (firstCompetitorLosesCount === 1 && secondCompetitorLosesCount === 1 && !groupB.length) {
          status = 'superfinal';
        }
      }
      if (groupB.length === 2 && finalist && !semifinalist) {
        status = 'semifinal';

      }
      // return getMatchPairTitle(
      //   allMatches[firstIDLECompetitorIndex],
      //   allMatches[firstIDLECompetitorIndex + 1]
      // ) 
      return {
        competitor1: allMatches[firstIDLECompetitorIndex],
        competitor2: allMatches[firstIDLECompetitorIndex + 1],
        status
      }

    }

    // need to calculate winners and present first pair from next round
    if (firstIDLECompetitorIndex === -1) {
      const groupALoosers = groupAStripped.filter(competitor => competitor.stats[actualRoundIndex].result === MATCH_RESULT.LOSE);
      const groupBWinners = groupBStripped.filter(competitor => competitor.stats[actualRoundIndex].result === MATCH_RESULT.WIN);
      let status = 'default';
    
      if (groupA.length === 2 && groupB.length) { // to the final
        const newGroupB = [...(groupBUnpaired ? [groupBUnpaired] : []), ...groupBWinners];
        const firstCompetitor = newGroupB[0];
        const secondCompetitor = newGroupB[1];
        if (!secondCompetitor) {
          console.log('!secondCompetitor');
          return {
            competitor1: groupALoosers[0], // semifinalist
            competitor2: newGroupB[0],
            status: 'semifinal' // means default preliminary matches
          }
        }
        console.log('groupA.length === 2 && groupB.length');

        return {
          competitor1: firstCompetitor,
          competitor2: secondCompetitor,
          status: 'default' // means default preliminary matches
        }
      }

      const groupAWinners = groupAStripped.filter(competitor => competitor.stats[actualRoundIndex].result === MATCH_RESULT.WIN);
      if (groupAUnpaired) groupAWinners.unshift(groupAUnpaired);

      const newGroupB = [...(groupBUnpaired ? [groupBUnpaired] : []), ...groupALoosers, ...groupBWinners];
      const newAllPairs = [...groupAWinners, ...newGroupB];

      if (newAllPairs.length === 2) { // fix it
  
        const firstCompetitorLosesCount = Object.keys(newAllPairs[0].stats) //we dont count lose in current round
          .reduce((prev, current) => prev + (newAllPairs[0].stats[current].result === MATCH_RESULT.LOSE ? 1 : 0), 0);
        const secondCompetitorLosesCount = Object.keys(newAllPairs[1].stats) //we dont count lose in current round
          .reduce((prev, current) => prev + (newAllPairs[1].stats[current].result === MATCH_RESULT.LOSE ? 1 : 0), 0);
          
        if (!firstCompetitorLosesCount && secondCompetitorLosesCount) {
          status = 'semifinal';
          // means only 2 competitor;
        }
        
        if (firstCompetitorLosesCount === 1 && secondCompetitorLosesCount === 1) {
          status = 'superfinal';
        }
       // console.log('firstCompetitorLosesCount', firstCompetitorLosesCount, secondCompetitorLosesCount)
        if (firstCompetitorLosesCount > 1 || secondCompetitorLosesCount > 1) {
          console.log('firstCompetitorLosesCount > 1 || secondCompetitorLosesCount > 1');
          
          return  {
            competitor1: null,
            competitor2: null,
            status: MATCH_STATE.FINAl // means default preliminary matches
          };
        } 
      }

      let firstCompetitor = newAllPairs[0];
      let secondCompetitor = newAllPairs[1];

      if (firstCompetitor && !secondCompetitor) {
        console.log('firstCompetitor && !secondCompetitor');
        firstCompetitor = semifinalist;
        secondCompetitor = newAllPairs[0];
        status = 'semifinal';
      }
      if (finalist && !semifinalist) {
        console.log('finalist && !semifinalist');
        firstCompetitor = finalist;
        secondCompetitor = newAllPairs[0];
        status = 'final';
      }



      console.log(newAllPairs)
      //not sure 
      if (groupAWinners.length === 2 && !semifinalist && !finalist) {
        status = 'semifinal'
      }

      return  {
        competitor1: firstCompetitor,
        competitor2: secondCompetitor || MATCH_STATE.IN_PROGRESS,
        status,
      };
    }
  }


  const calculateFuturePair = () => {
    const { groupA, groupB, finalist, semifinalist } = _.cloneDeep(tournamentStore.tables[currentTableIndex].rounds[actualRoundIndex]);
    const groupAUnpaired = _.isEmpty(groupA.slice(groupALength - groupALength % 2, groupALength)) ? null : groupA.slice(groupALength - groupALength % 2, groupALength)[0];
    const groupBUnpaired = _.isEmpty(groupB.slice(groupBLength - groupBLength % 2, groupBLength)) ? null : groupB.slice(groupBLength - groupBLength % 2, groupBLength)[0];

    const groupAStripped = groupA.slice(0, groupALength - groupALength % 2);
    const groupBStripped = groupB.slice(0, groupBLength - groupBLength % 2);


    const allMatches = [
      ...groupAStripped,
      ...groupBStripped
    ];

    // console.log('allMatches', allMatches, )
    // console.log('groupBStripped', groupBStripped, )

    let firstIDLECompetitorIndex = allMatches.findIndex((competitor) => competitor.stats[actualRoundIndex].result === TABLE_STATE.IDLE);
    const secondIDLECompetitorIndex = firstIDLECompetitorIndex === -1
      ? -1
      : _.findIndex(allMatches, ((competitor) => competitor.stats[actualRoundIndex].result === TABLE_STATE.IDLE), firstIDLECompetitorIndex + 2);
   
    console.log(firstIDLECompetitorIndex, secondIDLECompetitorIndex);

    if (secondIDLECompetitorIndex !== -1) {
      return {
        competitor1: allMatches[secondIDLECompetitorIndex],
        competitor2: allMatches[secondIDLECompetitorIndex + 1]
      };
    }

    if (secondIDLECompetitorIndex === -1 && firstIDLECompetitorIndex !== -1) {
      console.log('should be calculated');
      const { competitor1: currentCompetitor1, competitor2: currentCompetitor2, status: currentMatchStatus } = calculateCurrentPair();
      if (currentMatchStatus === 'finished' || currentMatchStatus === 'superfinal') {
        return {
          competitor1: null,
          competitor2: null,
          status: MATCH_STATE.CATEGORY_FINISHED
        };
      } 
            
      
      if (currentMatchStatus === 'final') {
        return {
          competitor1: null,
          competitor2: null,
          status: MATCH_STATE.CATEGORY_FINISHED
        };
      }
      if (currentCompetitor2 === MATCH_STATE.IN_PROGRESS) {
        return {
          competitor1: null,
          competitor2: null,
          status: MATCH_STATE.CALCULATING
        };;
      }
      let groupAWinners = groupAStripped.filter(competitor => competitor.stats[actualRoundIndex]?.result === MATCH_RESULT.WIN);
      if (groupAUnpaired) {
        groupAUnpaired.stats[actualRoundIndex].result = MATCH_RESULT.WIN;
        groupAWinners.unshift(groupAUnpaired);
      }

      let groupALoosers = groupAStripped.filter(competitor => competitor.stats[actualRoundIndex]?.result === MATCH_RESULT.LOSE);
      const groupBWinners = groupBStripped.filter(competitor => competitor.stats[actualRoundIndex]?.result === MATCH_RESULT.WIN);

      const groupBIDLE = groupBStripped.filter((competitor, index) => 
        competitor.stats[actualRoundIndex]?.result === MATCH_RESULT.IDLE && !(index % 2)
      );
      const groupAIDLE = groupAStripped.filter((competitor, index) => 
        competitor.stats[actualRoundIndex]?.result === MATCH_RESULT.IDLE && !(index % 2)
      );

      // const newGroupB = [...(groupBUnpaired ? [groupBUnpaired] : []), ...groupALoosers, ...groupBWinners];
      const newGroupB = [...groupALoosers, ...groupBWinners];

      if (groupBUnpaired) {
        groupBUnpaired.stats[actualRoundIndex].result = MATCH_RESULT.WIN;
        newGroupB.unshift(groupBUnpaired);
      }

      let newAllPairs = [...groupAWinners,  ...groupAIDLE, ...newGroupB, ...groupBIDLE];

      console.log('groupAWinners', toJS(groupAWinners));
      console.log('groupALoosers', toJS(groupALoosers));
      console.log('groupBUnpaired', toJS(groupBUnpaired));
      console.log('groupBWinners', toJS(groupBWinners));
      console.log('groupBIDLE', toJS(groupBIDLE));
      




      if (groupAWinners.length === 1 && groupALoosers.length === 1) {
        // means to the final;
        const newGroupB = [...(groupBUnpaired ? [groupBUnpaired] : []), ...groupBWinners, ...groupBIDLE];
        console.log('here', newGroupB)
        if (newGroupB.length > 1) {
          newAllPairs = [...newGroupB];
        }
        if (newGroupB.length === 1) {
          newAllPairs = [groupALoosers[0], ...newGroupB];
        }
      }
      if (finalist) {
        if (semifinalist) {
           if (newAllPairs.length === 1) {
             newAllPairs.unshift(semifinalist)
           }
        }
        if (!semifinalist) {
          if (newAllPairs.length === 1) {
             newAllPairs.unshift(finalist)
          }
        }
      }
      console.log('newAllPairs', toJS(newAllPairs))
      let nextCompetitor1 = newAllPairs[0];
      let nextCompetitor2 = newAllPairs[1];

      if (!nextCompetitor1 && !nextCompetitor2) {
        return {
          competitor1: null,
          competitor2: null,
          status: MATCH_STATE.CALCULATING
        };
      };
      if (nextCompetitor1?.stats[actualRoundIndex]?.result === MATCH_RESULT.IDLE && !nextCompetitor2) {
        return {
          competitor1: null,
          competitor2: null,
          status: MATCH_STATE.CALCULATING
        };;
      }
      return {
        competitor1: nextCompetitor1?.stats[actualRoundIndex]?.result === MATCH_RESULT.IDLE ? MATCH_STATE.IN_PROGRESS : nextCompetitor1,
        competitor2: nextCompetitor2?.stats[actualRoundIndex].result === MATCH_RESULT.IDLE ? MATCH_STATE.IN_PROGRESS : nextCompetitor2,
      };
     
    }

    if (secondIDLECompetitorIndex === -1 && firstIDLECompetitorIndex === -1) {

      // means we know how to build next round;
      const {
        finalist: nextRoundFinalist,
        semifinalist: nextRoundSemifinalist,
        finishedGroup, 
        newRoundGroupA,
        newRoundGroupB,
      } = calculateNextRound(actualRoundIndex, groupA, groupB, finalist, semifinalist);
      
      const newRoundGroupAStripped = newRoundGroupA.slice(0, newRoundGroupA.length - newRoundGroupA.length % 2);
      const newRoundGroupBStripped = newRoundGroupB.slice(0, newRoundGroupB.length - newRoundGroupB.length % 2);
      console.log('calculateNextRound finalist', nextRoundFinalist)
      console.log('calculateNextRound semifinalist', nextRoundSemifinalist)
      console.log('calculateNextRound newRoundGroupA', newRoundGroupAStripped)
      console.log('calculateNextRound newRoundGroupB', newRoundGroupBStripped)
      console.log('calculateNextRound finishedGroup', finishedGroup);
      let futurePairs = _.compact([nextRoundFinalist, nextRoundSemifinalist, ...newRoundGroupAStripped, ...newRoundGroupBStripped])
      // if (futurePairs.length === 2) {
      //   futurePairs = _.compact([nextRoundSemifinalist,...newRoundGroupAStripped, ...newRoundGroupBStripped]);
      // }
      // if (futurePairs.length === 2) {
      //   futurePairs = _.compact([nextRoundFinalist,...newRoundGroupAStripped, ...newRoundGroupBStripped]);
      // }
      
      console.log('futurePairs', futurePairs,  !!nextRoundFinalist, !!nextRoundSemifinalist, futurePairs.length)
      if (!futurePairs.length) {
        console.log('over, we cant cal future pair' );
        return {
          competitor1: null,
          competitor2: null,
          status: MATCH_STATE.CATEGORY_FINISHED
        };
      } else if (nextRoundFinalist && !nextRoundSemifinalist && futurePairs.length === 3) {
        console.log('next competitor 1', nextRoundFinalist)
        console.log('next competitor 2', MATCH_STATE.IN_PROGRESS)
        return {
          competitor1: nextRoundFinalist,
          competitor2: MATCH_STATE.IN_PROGRESS,
        }
      } else if (nextRoundFinalist && !nextRoundSemifinalist) {
        console.log('next competitor 1', futurePairs[1])
        console.log('next competitor 2', futurePairs[2])
        return {
          competitor1: futurePairs[1],
          competitor2: futurePairs[2],
        }

      } else if (!nextRoundFinalist && !nextRoundSemifinalist && futurePairs.length === 2) {
        console.log('final, we cant cal future pair' );
        
        const firstCompetitorLosesCountInPrevRoounds = Object.keys(futurePairs[0].stats) //we dont count lose in current round
          .reduce((prev, current) => prev + (futurePairs[0].stats[current].result === MATCH_RESULT.LOSE ? 1 : 0), 0);
        const secondCompetitorLosesCountInPrevRounds = Object.keys(futurePairs[1].stats) //we dont count lose in current round
          .reduce((prev, current) => prev + (futurePairs[1].stats[current].result === MATCH_RESULT.LOSE ? 1 : 0), 0);
   
        console.log('firstCompetitorLosesCount', firstCompetitorLosesCountInPrevRoounds, futurePairs[0], toJS(futurePairs[0].stats))
        console.log('secondCompetitorLosesCount', secondCompetitorLosesCountInPrevRounds, futurePairs[1],  toJS(futurePairs[1].stats))

        return {
          competitor1: null,
          competitor2: null,
          // status: MATCH_STATE.CATEGORY_FINISHED
          status: firstCompetitorLosesCountInPrevRoounds + secondCompetitorLosesCountInPrevRounds === 2 ? MATCH_STATE.CATEGORY_FINISHED : MATCH_STATE.CALCULATING

        };

      } else if (nextRoundFinalist && nextRoundSemifinalist && futurePairs.length === 4) {
        console.log('next competitor 1', nextRoundSemifinalist)
        console.log('next competitor 2', MATCH_STATE.IN_PROGRESS)
        return {
          competitor1: nextRoundSemifinalist,
          competitor2: MATCH_STATE.IN_PROGRESS,
        };
      } else {
        console.log('next competitor 1', futurePairs[2])
        console.log('next competitor 2', futurePairs[3])
        return {
          competitor1: futurePairs[2],
          competitor2: futurePairs[3],
        };
      }
    }

  return;


    if (secondIDLECompetitorIndex === -1) {
      const { competitor1: currentCompetitor1, competitor2: currentCompetitor2, status: currentMatchStatus } = calculateCurrentPair();
      if (currentMatchStatus === 'finished' || currentMatchStatus === 'superfinal') return 'cat finished';
      if (currentMatchStatus === 'final' || currentCompetitor2 === '_in_progress_') {
        return 'calculating';
      }

      let groupAWinners = groupAStripped.filter(competitor => competitor.stats[actualRoundIndex]?.result === MATCH_RESULT.WIN);
      if (groupAUnpaired) {
        groupAUnpaired.stats[actualRoundIndex].result = MATCH_RESULT.WIN;
        groupAWinners.unshift(groupAUnpaired);
      }

      let groupALoosers = groupAStripped.filter(competitor => competitor.stats[actualRoundIndex]?.result === MATCH_RESULT.LOSE);
      const groupBWinners = groupBStripped.filter(competitor => competitor.stats[actualRoundIndex]?.result === MATCH_RESULT.WIN);

      const groupBIDLE = groupBStripped.filter((competitor, index) => 
        competitor.stats[actualRoundIndex]?.result === MATCH_RESULT.IDLE && !(index % 2)
      );
      const groupAIDLE = groupAStripped.filter((competitor, index) => 
        competitor.stats[actualRoundIndex]?.result === MATCH_RESULT.IDLE && !(index % 2)
      );

      // const newGroupB = [...(groupBUnpaired ? [groupBUnpaired] : []), ...groupALoosers, ...groupBWinners];
      const newGroupB = [...groupALoosers, ...groupBWinners];

      if (groupBUnpaired) {
        groupBUnpaired.stats[actualRoundIndex].result = MATCH_RESULT.WIN;
        console.log('groupBUnpaired', groupBUnpaired.stats)

        newGroupB.unshift(groupBUnpaired);
      }
      let newAllPairs = [...groupAWinners,  ...groupAIDLE, ...newGroupB, ...groupBIDLE];



   //   console.log('nextCompetitor1', toJS(nextCompetitor1?.stats[actualRoundIndex].result === MATCH_RESULT.IDLE))
   //   console.log('nextCompetitor2', toJS(nextCompetitor2?.stats[actualRoundIndex].result === MATCH_RESULT.IDLE))

        console.log('firstIDLECompetitorIndex ', firstIDLECompetitorIndex)

      // if (firstIDLECompetitorIndex === 2 && groupA.length === 2 && groupB.length === 2) {
      //   console.log('remove first item');
      //   newAllPairs.shift();
      // }

      if (firstIDLECompetitorIndex === -1) {
        console.log('firstIDLECompetitorIndex === -1')

        const futureGroupAStripped = groupAWinners.slice(0, Math.max(...[groupAWinners.length - groupAWinners.length % 2, 1]));
        const futureGroupBStripped = newGroupB.slice(0, Math.max(...[newGroupB.length - newGroupB.length % 2, 1]));
         console.log('futureGroupAStripped', toJS(futureGroupAStripped))
         console.log('futureGroupBStripped', toJS(futureGroupBStripped))
         newAllPairs = [...futureGroupAStripped,  ...groupAIDLE, ...futureGroupBStripped, ...groupBIDLE];

        // if (status === 'semifinal') {
        //   return getMatchPairTitle(
        //     newAllPairs[0],
        //     '_in_progress_',
        //   )
        // }
      }

      // if (status === 'semifinal' && semifinalist) {
      //    newAllPairs.unshift(finalist);
      // }

      // if (status === 'semifinal' && finalist && !semifinalist) {
      //   newAllPairs.unshift(finalist);
      // }
 

      let nextCompetitor1 = newAllPairs[0 + (firstIDLECompetitorIndex === -1 ? 2 : 0)];
      let nextCompetitor2 = newAllPairs[1 + (firstIDLECompetitorIndex === -1 ? 2 : 0)];

      console.log('future pairs newAllPairs', toJS(newAllPairs))
      console.log('currentCompetitor1', toJS(currentCompetitor1))
      console.log('currentCompetitor2', toJS(currentCompetitor2))
      console.log('nextCompetitor1', toJS(nextCompetitor1))
      console.log('nextCompetitor2', toJS(nextCompetitor2))

      // if (status === 'WBFinal') {
      //   return getMatchPairTitle(
      //     nextCompetitor1?.stats[actualRoundIndex].result === MATCH_RESULT.IDLE ? '_in_progress_' : nextCompetitor1,
      //     nextCompetitor2?.stats[actualRoundIndex].result === MATCH_RESULT.IDLE && groupB.length > 1 ? '_in_progress_' : nextCompetitor2,
  
      //   )
      // }
      // if (status === 'semifinal') {
      //   if (newAllPairs.length === 3) {
      //     return getMatchPairTitle(
      //       allMatches[0],
      //       '_in_progress_',
      //     )
      //   }
      //   if (nextCompetitor1 && nextCompetitor1.stats[actualRoundIndex].result !== MATCH_RESULT.IDLE) {
      //     return getMatchPairTitle(
      //       '_in_progress_',
      //       nextCompetitor1,
      //     )
      //   }
      //   if (!finalist) {
      //     return 'calculating';
      //   }
  
      //   return getMatchPairTitle(
      //  // firstCompetitor?.stats[actualRoundIndex]?.result === MATCH_RESULT.IDLE ? '_in_progress_' : firstCompetitor,
      //     finalist,
      //     '_in_progress_',
      //   )
      // }

      if (currentCompetitor2 === 'calculating') {
        return 'calculating';
      }

      if (!nextCompetitor1 && !nextCompetitor2) {
        return 'calculating'
      }

      if (finalist && !nextCompetitor2) {
        newAllPairs.unshift(finalist);
        nextCompetitor1 = newAllPairs[0 + (firstIDLECompetitorIndex === -1 ? 2 : 0)];
        nextCompetitor2 = newAllPairs[1 + (firstIDLECompetitorIndex === -1 ? 2 : 0)];
      }

      if (newAllPairs.length === 3) {
        if (firstIDLECompetitorIndex !== -1) {
          nextCompetitor1 = newAllPairs[1];
          nextCompetitor2 = newAllPairs[2];
        } else {
          nextCompetitor1 = newAllPairs[0];
          nextCompetitor2 = null;
        }
  
      }

      if (nextCompetitor1?.stats[actualRoundIndex]?.result === MATCH_RESULT.IDLE && !nextCompetitor2) {
        return 'calculating';
      }

        console.log('here')

      return getMatchPairTitle(
       // firstCompetitor?.stats[actualRoundIndex]?.result === MATCH_RESULT.IDLE ? '_in_progress_' : firstCompetitor,
        nextCompetitor1?.stats[actualRoundIndex]?.result === MATCH_RESULT.IDLE ? '_in_progress_' : nextCompetitor1,
        nextCompetitor2?.stats[actualRoundIndex].result === MATCH_RESULT.IDLE ? '_in_progress_' : nextCompetitor2 || '_in_progress_',
      )
     
     
      if (firstIDLECompetitorIndex !== -1) {// only last pair winners aren't selected

        
      }

      if (firstIDLECompetitorIndex === -1) {

      }
    } 


  }


  const { competitor1: currentFirstCompetitor, competitor2: currentSecondCompetitor, status: currentMatchStatus } = calculateCurrentPair();
  // const newCurrentMatch = status !== 'finished' && getMatchPairTitle(competitor1, competitor2);
  const { competitor1: nextFirstCompetitor, competitor2: nextSecondCompetitor, status: nextMatchStatus } = calculateFuturePair();

  const title = `${intl.formatMessage({ id: 'common.table' })} ${+currentTableIndex + 1}, ${categoryName}`

  console.log('state', prevFirstCompetitor, prevSecondCompetitor)
  return (
    <Grid container sx={{ border: '0px solid red', height: '100vh'}}>
      <Grid item xs={3} sx={{ border: '0px solid green'}}></Grid>
      <Grid item xs={6} sx={{ border: '0px solid green', display: 'flex', flexDirection: 'column'}}>
        <Box sx={{ flex: 3, border: '0px solid blue', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end'}}>
          <Typography variant='h5' sx={{ mb: 4}}>
            {title}
          </Typography>
          {prevFirstCompetitor && prevSecondCompetitor && (
            <Pair
              type={'previous'}
              firstCompetitor={prevFirstCompetitor}
              secondCompetitor={prevSecondCompetitor}
            >
            </Pair>
          )}
     
        </Box>
        <Box sx={{ flex: 2, border: '0px solid blue', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Pair
            firstCompetitor={currentFirstCompetitor}
            secondCompetitor={currentSecondCompetitor}
            type={'current'}
            status={currentMatchStatus}
          ></Pair>
          
        </Box>
        <Box sx={{ flex: 3, border: '0px solid blue', display: 'flex', alignItems: 'flex-start', justifyContent: 'center' }}>
          {![MATCH_STATE.CATEGORY_FINISHED].includes(nextMatchStatus) && (
            <Pair
              type={'next'}
              firstCompetitor={nextFirstCompetitor}
              secondCompetitor={nextSecondCompetitor}
              status={nextMatchStatus}
            >
          </Pair>

          )}
        </Box>
      </Grid>
      <Grid item xs={3} sx={{ border: '0px solid green', }}></Grid>
    </Grid>
  )
})

const matchTypeTranslationsKey = {
  'previous': 'common.matches.previous',
  'current': 'common.matches.current',
  'next': 'common.matches.next',
}

const chipColor = {
  'previous': 'default',
  'current': 'primary',
  'next': 'default',
};

const chipVariant = {
  'previous': 'filled',
  'current': 'filled',
  'next': 'outlined',
};

const Pair = (props) => {
  const intl = useIntl();
  let { type, firstCompetitor, secondCompetitor, status } = props;
   console.log('Pair', firstCompetitor, secondCompetitor, status, type)
  let firstCompetitorName = '';
  let secondCompetitorName = ''|| secondCompetitor;

  if (firstCompetitor?.firstName && firstCompetitor?.lastName) {
    firstCompetitorName = `${firstCompetitor.lastName} ${firstCompetitor.firstName}`
  }

  if (secondCompetitor?.firstName && secondCompetitor?.lastName) {
    secondCompetitorName = `${secondCompetitor.lastName} ${secondCompetitor.firstName}`
  }

  if (secondCompetitor === MATCH_STATE.IN_PROGRESS) {
    secondCompetitorName = intl.formatMessage({ id: 'common.matches.opponentInProgress' });
  }

  if (status === MATCH_STATE.CALCULATING) {
    firstCompetitorName = intl.formatMessage({ id: 'common.matches.opponentInProgress' });
    secondCompetitorName = intl.formatMessage({ id: 'common.matches.opponentInProgress' });
  }

  if (status === MATCH_STATE.CATEGORY_FINISHED || (status === MATCH_STATE.FINAl && !firstCompetitor && !secondCompetitor)) {
    return (
      <Typography variant="h5" sx={{ my: 1, textAlign: 'center' }}>
        {intl.formatMessage({ id: 'common.category.finished.title' })}
      </Typography>
    )
  }

  return (
    <Box>
      <Typography variant="subtitle1" sx={{ my: 1, textAlign: 'center' }}>
        {intl.formatMessage({ id: matchTypeTranslationsKey[type] })}
      </Typography>
      <Box sx={{ border: '0px solid grey', flexDirection: 'row', alignItems: 'center', display: 'flex'}}>
        <Chip color={chipColor[type]} icon={<FaceIcon />} label={firstCompetitorName} variant={chipVariant[type]} />
        <Typography sx={{ px: 1 }}>
          vs
        </Typography>
        <Chip color={chipColor[type]} icon={<FaceIcon />} label={secondCompetitorName} variant={chipVariant[type]} />

      </Box>
    </Box>
  )
}