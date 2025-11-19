import * as React from 'react';
import { Grid, Box } from '@mui/material';
import { observer } from "mobx-react-lite";
import { useIntl } from 'react-intl';
import { useParams } from 'react-router-dom';
import _ from 'lodash';
import { markWinnersChannel } from './Tournament';
import { tournamentStore } from '../stores/tournament';
import { generateTournamentCategoryTitle } from '../utils/categoriesUtils';
import { MATCH_RESULT, TABLE_STATE } from '../constants/tournamenConfig';

markWinnersChannel.onmessage = (event) => {
    console.log('Отримано повідомлення:', event.data);
    location.reload();
};

markWinnersChannel.onmessageerror = (event) => {
  console.log('onmessageerror erro', event)
}

export default observer(function TableStream() {
  
  const intl = useIntl();
  const [tablesCount, setTablesCount] = React.useState();
  const params = useParams();

  const currentTableIndex = params.id;
  const currentCategory = tournamentStore.newTournamentCategories[tournamentStore.tables[currentTableIndex].category];
  const categoryName = generateTournamentCategoryTitle(intl, currentCategory.config, 'full');



  const actualRoundIndex = Object.keys(tournamentStore.tables[currentTableIndex].rounds).length - 1; //

  const groupALength = tournamentStore.tables[currentTableIndex].rounds[actualRoundIndex].groupA.length;
  const groupBLength = tournamentStore.tables[currentTableIndex].rounds[actualRoundIndex].groupB.length;
  const groupAEmpty = !groupALength; 
  const groupBEmpty = !groupBLength;
  const { finalist, semifinalist } = tournamentStore.tables[currentTableIndex].rounds[actualRoundIndex];
  const isFirstRound = actualRoundIndex === 0;
  console.log(`groupALength=${groupALength}, groupBLength=${groupBLength}, finalist=${finalist}, semifinalist=${semifinalist}`)
  const groupALastPairWithoutPair = !!(groupALength % 2);
  const groupBLastPairWithoutPair = !!(groupBLength % 2);
  console.log(`isFirstRound=${isFirstRound}, groupALastPairWithoutPair=${groupALastPairWithoutPair}, groupBLastPairWithoutPair=${groupBLastPairWithoutPair}`);


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

  console.log('secondIDLECompetitorIndexInGroupA', secondIDLECompetitorIndexInGroupA, secondIDLECompetitorIndexInGroupB)

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
    if (secondCompetitor === '_in_progress_') {
      return `${firstCompetitor?.lastName} ${firstCompetitor?.firstName} vs In Progress`;
    }
    return `${firstCompetitor?.lastName} ${firstCompetitor?.firstName} vs ${secondCompetitor?.lastName} ${secondCompetitor?.firstName}`
  }

  const calculateTwoNextWinnersInGroup = (groupName = 'groupA', index = 4) => {
    const winners = tournamentStore.tables[currentTableIndex].rounds[actualRoundIndex][groupName]
      .filter((competitor, i) => competitor.stats[actualRoundIndex].result === MATCH_RESULT.WIN && i < index);
    return winners;
  }

  const calculateTwoNextLoosersInGroupA = () => {
    const winners = tournamentStore.tables[currentTableIndex].rounds[actualRoundIndex].groupA
      .filter((competitor, index) => competitor.stats[actualRoundIndex].result === MATCH_RESULT.LOSE && index < 4);
    return winners;
  }


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
      return getMatchPairTitle(
        allMatches[firstIDLECompetitorIndex],
        allMatches[firstIDLECompetitorIndex + 1]
      ) 
    }

    // need to calculate winners and present first pair from next round
    if (firstIDLECompetitorIndex === -1) {
      let groupALoosers = groupAStripped.filter(competitor => competitor.stats[actualRoundIndex].result === MATCH_RESULT.LOSE);
      const groupBWinners = groupBStripped.filter(competitor => competitor.stats[actualRoundIndex].result === MATCH_RESULT.WIN);
    
      if (groupA.length === 2 && groupB.length) { // to the final
        const newGroupB = [...(groupBUnpaired ? [groupBUnpaired] : []), ...groupBWinners];
        let firstCompetitor = newGroupB[0];
        let secondCompetitor = newGroupB[1];
        if (!secondCompetitor) {
          firstCompetitor = groupALoosers[0];
          secondCompetitor = newGroupB[0]
        }
        return getMatchPairTitle(
          firstCompetitor,
          secondCompetitor
        )
      }

      let groupAWinners = groupAStripped.filter(competitor => competitor.stats[actualRoundIndex].result === MATCH_RESULT.WIN);
      if (groupAUnpaired) groupAWinners.unshift(groupAUnpaired);

      const newGroupB = [...(groupBUnpaired ? [groupBUnpaired] : []), ...groupALoosers, ...groupBWinners];
      const newAllPairs = [...groupAWinners, ...newGroupB];
    //  console.log('newAllPairs', newAllPairs)

      if (newAllPairs.length === 2) { // fix it
        const firstCompetitorLosesCount = Object.keys(newAllPairs[0].stats) //we dont count lose in current round
          .reduce((prev, current) => prev + (newAllPairs[0].stats[current].result === MATCH_RESULT.LOSE ? 1 : 0), 0);
        const secondCompetitorLosesCount = Object.keys(newAllPairs[1].stats) //we dont count lose in current round
          .reduce((prev, current) => prev + (newAllPairs[1].stats[current].result === MATCH_RESULT.LOSE ? 1 : 0), 0);
       // console.log('firstCompetitorLosesCount', firstCompetitorLosesCount, secondCompetitorLosesCount)
        if (firstCompetitorLosesCount > 1 || secondCompetitorLosesCount > 1) {
          return 'cat finished';
        } 
      }

      let firstCompetitor = newAllPairs[0];
      let secondCompetitor = newAllPairs[1];
      if (firstCompetitor && !secondCompetitor) {
        firstCompetitor = semifinalist;
        secondCompetitor = newAllPairs[0];

      }
      if (finalist && !semifinalist) {
        firstCompetitor = finalist;
        secondCompetitor = newAllPairs[0];
      }
      
      return getMatchPairTitle(
        firstCompetitor,
        secondCompetitor || '_in_progress_',
      )
    }
  }

  const calculateCurrentPair_old = () => {
    const currentPair = null;
    if (isFirstRound) {
      if (groupALastPairWithoutPair && firstIDLECompetitorIndexInGroupA === groupALength - 1) {
       // console.log('1')
        return getMatchPairTitle(currentPairInGroupACompetitor0, calculateTwoNextWinnersInGroup()[0]);
      }
      if (groupALastPairWithoutPair && firstIDLECompetitorIndexInGroupA === - 1) { // means last winner without pair selected
     //   console.log('8');
        return getMatchPairTitle(lastPairInGroupACompetitor0, calculateTwoNextWinnersInGroup()[0]);
      } 
      if (firstIDLECompetitorIndexInGroupA === - 1) {
      //  console.log('14')
        return getMatchPairTitle(calculateTwoNextWinnersInGroup()[0], calculateTwoNextWinnersInGroup()[1]);
      }
   //   console.log('2')

      return getMatchPairTitle(currentPairInGroupACompetitor0, currentPairInGroupACompetitor1);
    }
    if (firstIDLECompetitorIndexInGroupA !== -1) {
      if (groupALastPairWithoutPair && firstIDLECompetitorIndexInGroupA === groupALength - 1 && isFirstRound) {
     //   console.log('3')
        return getMatchPairTitle(currentPairInGroupACompetitor0, calculateTwoNextWinnersInGroup()[0]);
      } 
      if (groupALastPairWithoutPair && firstIDLECompetitorIndexInGroupA === groupALength - 1 && !groupBEmpty) {
      //  console.log('13')
       
        return getMatchPairTitle(currentPairInGroupBCompetitor0, currentPairInGroupBCompetitor1);
      }
    //  console.log('4')
      return getMatchPairTitle(currentPairInGroupACompetitor0, currentPairInGroupACompetitor1);
    }


    if (firstIDLECompetitorIndexInGroupA === -1) {
      if (groupBLength) {
        if (firstIDLECompetitorIndexInGroupB !== -1) {
          if (groupBLastPairWithoutPair && firstIDLECompetitorIndexInGroupB === groupBLength - 1) {
            if (groupAEmpty) {
            //  console.log('10');
              return getMatchPairTitle(lastPairInGroupBCompetitor0, calculateTwoNextWinnersInGroup('groupB')[0]);
            }
          //  console.log('5')
            return getMatchPairTitle(currentPairInGroupBCompetitor0, calculateTwoNextLoosersInGroupA()[0]);
          }
       //   console.log('6')
          return getMatchPairTitle(currentPairInGroupBCompetitor0, currentPairInGroupBCompetitor1);
        }
        if (firstIDLECompetitorIndexInGroupB === -1) {
          if (groupALength) {
            if (groupALength === 2 && groupBLength === 2) {
              return getMatchPairTitle(calculateTwoNextLoosersInGroupA()[0],  calculateTwoNextWinnersInGroup('groupB')[0]);
            }
            if (groupALength === 2) { // means to the final
          //  console.log('9');
              return getMatchPairTitle(calculateTwoNextWinnersInGroup('groupB')[0],  calculateTwoNextWinnersInGroup('groupB')[1]);

            }
           // console.log('7');
            return getMatchPairTitle(calculateTwoNextWinnersInGroup()[0],  calculateTwoNextWinnersInGroup()[1]);

            //return getMatchPairTitle(lastPairInGroupBCompetitor0, calculateTwoNextLoosersInGroupA()[0])
          }
          if (finalist && semifinalist) {
            if (groupBLength === 2) {
              return getMatchPairTitle(semifinalist,  calculateTwoNextWinnersInGroup('groupB')[0]);
            }
            if (groupBLastPairWithoutPair) {
              return getMatchPairTitle(lastPairInGroupBCompetitor0,  calculateTwoNextWinnersInGroup('groupB')[0]);
            }

          }
          if (groupBLength === 2 && finalist && !semifinalist) {
          //  console.log('calculateTwoNextWinnersInGroup', calculateTwoNextWinnersInGroup('groupB'))
            return getMatchPairTitle(finalist,  calculateTwoNextWinnersInGroup('groupB')[0]);
          }

        }
      }
    }

    if (groupBEmpty && groupALength === 2) {
      const firstCompetitor = tournamentStore.tables[currentTableIndex].rounds[actualRoundIndex].groupA[0];
      const secondCompetitor = tournamentStore.tables[currentTableIndex].rounds[actualRoundIndex].groupA[1];
      const firstCompetitorLosesCountInAllRounds = Object.values(firstCompetitor.stats)
        .reduce((prev, current) => prev + (current.result === MATCH_RESULT.LOSE ? 1 : 0), 0);
      const secondCompetitorLosesCountInAllRounds = Object.values(secondCompetitor.stats)
        .reduce((prev, current) => prev + (current.result === MATCH_RESULT.LOSE ? 1 : 0), 0); 
      console.log('firstCompetitorLosesCountInAllRoounds',firstCompetitorLosesCountInAllRounds);
      console.log('secondCompetitorLosesCountInAllRounds',secondCompetitorLosesCountInAllRounds);
      if (firstCompetitorLosesCountInAllRounds === 2 || secondCompetitorLosesCountInAllRounds === 2) {
          return 'Category is Finished';
      }
      return getMatchPairTitle(
        tournamentStore.tables[currentTableIndex].rounds[actualRoundIndex].groupA[firstCompetitorLosesCountInAllRounds < secondCompetitor ? 0 : 1], 
        tournamentStore.tables[currentTableIndex].rounds[actualRoundIndex].groupA[firstCompetitorLosesCountInAllRounds < secondCompetitor ? 1 : 0]
      )

    }
    console.log(11, firstIDLECompetitorIndexInGroupA);
    return currentPair;
  }

  const calculateFuturePair = () => {
    const { groupA, groupB, finalist, semifinalist } = tournamentStore.tables[currentTableIndex].rounds[actualRoundIndex];
    const groupAUnpaired = _.isEmpty(groupA.slice(groupALength - groupALength % 2, groupALength)) ? null : groupA.slice(groupALength - groupALength % 2, groupALength)[0];
    const groupBUnpaired = _.isEmpty(groupB.slice(groupBLength - groupBLength % 2, groupBLength)) ? null : groupB.slice(groupBLength - groupBLength % 2, groupBLength)[0];

    const groupAStripped = groupA.slice(0, groupALength - groupALength % 2);
    const groupBStripped = groupB.slice(0, groupBLength - groupBLength % 2);


    const allMatches = [
      ...groupAStripped,
      ...groupBStripped
    ];

    console.log('allMatches', allMatches, )
    console.log('groupBStripped', groupBStripped, )

    const firstIDLECompetitorIndex = allMatches.findIndex((competitor) => competitor.stats[actualRoundIndex].result === TABLE_STATE.IDLE);
    const secondIDLECompetitorIndex = firstIDLECompetitorIndex === -1
      ? -1
      : _.findIndex(allMatches, ((competitor) => competitor.stats[actualRoundIndex].result === TABLE_STATE.IDLE), firstIDLECompetitorIndex + 2);
   
    if (secondIDLECompetitorIndex !== -1) {
      return getMatchPairTitle(
        allMatches[secondIDLECompetitorIndex],
        allMatches[secondIDLECompetitorIndex + 1]
      )
    }
    // if (secondIDLECompetitorIndex === -1 && firstIDLECompetitorIndex !== -1) {
    //    console.log('we here');
    //   return getMatchPairTitle(
    //     allMatches[secondIDLECompetitorIndex],
    //     allMatches[secondIDLECompetitorIndex + 1]
    //   )
    // }
    if (secondIDLECompetitorIndex === -1) {
      let groupAWinners = groupAStripped.filter(competitor => competitor.stats[actualRoundIndex].result === MATCH_RESULT.WIN);
      if (groupAUnpaired) groupAWinners.unshift(groupAUnpaired);

      let groupALoosers = groupAStripped.filter(competitor => competitor.stats[actualRoundIndex].result === MATCH_RESULT.LOSE);
      const groupBWinners = groupBStripped.filter(competitor => competitor.stats[actualRoundIndex].result === MATCH_RESULT.WIN);

      if (groupA.length === 2 && !groupBEmpty) {
        groupAWinners = [];// means to the final, so looser don't go to loosers bracket
        groupALoosers = [];
      }

      const newGroupB = [...(groupBUnpaired ? [groupBUnpaired] : []), ...groupALoosers, ...groupBWinners];

      console.log('groupAWinners', groupAWinners);
      console.log('groupALoosers', groupALoosers);
      console.log('newGroupB', newGroupB);

      if (groupA.length === 2 && groupBEmpty) {
        return undefined;
      }
      
      if (firstIDLECompetitorIndex === -1 && semifinalist && finalist) {
        const firstCompetitor = finalist; 
        const  secondCompetitor = '_in_progress_';
        return getMatchPairTitle(
          firstCompetitor,
          secondCompetitor
        )
      }

      // if (finalist && !semifinalist && firstIDLECompetitorIndex === -1) {
      //   return 'hz'
      // }

      if (groupAWinners.length === 0) {
        const firstCompetitor = newGroupB[2] || groupAStripped.filter(competitor => competitor.stats[actualRoundIndex].result === MATCH_RESULT.LOSE)[0] || semifinalist || finalist; 
        const secondCompetitor = newGroupB[3] || newGroupB[0] || '_in_progress_';
        return getMatchPairTitle(
          firstCompetitor,
          secondCompetitor
        )
      }

      return getMatchPairTitle(
        groupAWinners[0],
        groupAWinners[1]
      )
      
      // console.log('groupAWinners', groupAWinners);
      // console.log('newGroupB', newGroupB);


      

    
      console.log('time to calculate next round', secondIDLECompetitorIndex, firstIDLECompetitorIndex);
    }
    

  }
  const calculateFuturePair_old = () => {
    const result = null;
    if (isFirstRound) {
      if (secondIDLECompetitorIndexInGroupA !== -1) {
        if (groupALastPairWithoutPair && secondIDLECompetitorIndexInGroupA === groupALength - 1) {
          console.log('1')
          return getMatchPairTitle(nextPairInGroupACompetitor0, calculateTwoNextWinnersInGroup()[0]);
        }
        console.log('2')
        return getMatchPairTitle(nextPairInGroupACompetitor0, nextPairInGroupACompetitor1);
      }
      if (secondIDLECompetitorIndexInGroupA === -1) {
        if (firstIDLECompetitorIndexInGroupA === -1) {
          return getMatchPairTitle(calculateTwoNextWinnersInGroup(undefined, 8)[2], calculateTwoNextWinnersInGroup(undefined, 8)[3]);
        }
        if (groupALastPairWithoutPair) {
          return getMatchPairTitle(calculateTwoNextWinnersInGroup(undefined)[1], calculateTwoNextWinnersInGroup(undefined, 6)[2]);
        }
        return getMatchPairTitle(calculateTwoNextWinnersInGroup()[0], calculateTwoNextWinnersInGroup()[1]);
      }
    }

    if (secondIDLECompetitorIndexInGroupA !== -1) {
      if (groupBLength) {
        if (groupALastPairWithoutPair && secondIDLECompetitorIndexInGroupA === groupALength - 1) {
        console.log('5');
          return getMatchPairTitle(currentPairInGroupBCompetitor0, currentPairInGroupBCompetitor1);

        }
      }
      if (groupALastPairWithoutPair && secondIDLECompetitorIndexInGroupA === groupALength - 1) {
        console.log('4')
        return getMatchPairTitle(nextPairInGroupACompetitor0, calculateTwoNextWinnersInGroup()[0]);
      }
      return getMatchPairTitle(nextPairInGroupACompetitor0, nextPairInGroupACompetitor1);
    }

    if (secondIDLECompetitorIndexInGroupA === -1) {
      if (firstIDLECompetitorIndexInGroupA === -1) {
        if (groupALength > 3) {

        }
      }
      if (secondIDLECompetitorIndexInGroupB !== -1) {
        return getMatchPairTitle(nextPairInGroupBCompetitor0, nextPairInGroupBCompetitor1);
      }
 
    }

    return result;
  }

  const newCurrentMatch = calculateCurrentPair();
  const newNextMatch = calculateFuturePair();

  // let currentMatch = `${currentPairInGroupACompetitor0?.lastName} ${currentPairInGroupACompetitor0?.firstName} vs ${currentPairInGroupACompetitor1?.lastName} ${currentPairInGroupACompetitor1?.firstName}`  
  
  // if (firstIDLECompetitorIndexInGroupA === -1) {
  // //if (firstIDLECompetitorIndexInGroupA === -1 && firstIDLECompetitorIndexInGroupB !== -1) {
  //   currentMatch = `${currentPairInGroupBCompetitor0?.lastName} ${currentPairInGroupBCompetitor0?.firstName} vs ${currentPairInGroupBCompetitor1?.lastName} ${currentPairInGroupBCompetitor1?.firstName}`  
  // }
 
 
  // let prevMatch = undefined;
  // if (actualRoundIndex === 0) {
  //   if ( firstIDLECompetitorIndexInGroupA === 0) {
  //     prevMatch = 'No Prev Match';
  //   }
  //   const prevPairInGroupACompetitor0 = tournamentStore.tables[currentTableIndex].rounds[actualRoundIndex].groupA[firstIDLECompetitorIndexInGroupA - 2];
  //   const prevPairInGroupACompetitor1 = tournamentStore.tables[currentTableIndex].rounds[actualRoundIndex].groupA[firstIDLECompetitorIndexInGroupA - 1];
  //   prevMatch = `${prevPairInGroupACompetitor0?.lastName} ${prevPairInGroupACompetitor0?.firstName} vs ${prevPairInGroupACompetitor1?.lastName} ${prevPairInGroupACompetitor1?.firstName}`
    
  // } 
  // if (actualRoundIndex === 1) {
  //   if (firstIDLECompetitorIndexInGroupA === 0) {
  //     prevPairInGroupACompetitor0 =  tournamentStore.tables[currentTableIndex].rounds[0].groupA[firstIDLECompetitorIndexInGroupA - 2];
  //   }

  //   if (firstIDLECompetitorIndexInGroupA !== -1) {
  //     const prevPairInGroupACompetitor0 = tournamentStore.tables[currentTableIndex].rounds[actualRoundIndex].groupA[firstIDLECompetitorIndexInGroupA - 2];
  //     const prevPairInGroupACompetitor1 = tournamentStore.tables[currentTableIndex].rounds[actualRoundIndex].groupA[firstIDLECompetitorIndexInGroupA - 1];
  //     prevMatch = `${prevPairInGroupACompetitor0?.lastName} ${prevPairInGroupACompetitor0?.firstName} vs ${prevPairInGroupACompetitor1?.lastName} ${prevPairInGroupACompetitor1?.firstName}`
  
  //   }
  // }


  // let nextMatch = undefined;
  // //console.log('firstIDLECompetitorIndexInGroupA', firstIDLECompetitorIndexInGroupA, groupALength,groupALength + groupALength % 2 - 2)
  // if (firstIDLECompetitorIndexInGroupA !== -1) {
  //   const currentPairIsLastInGroupA = groupALength - firstIDLECompetitorIndexInGroupA <= 2;
  //   console.log('currentPairIsLastInGroupA', currentPairIsLastInGroupA);
  //   if (currentPairIsLastInGroupA && !groupBLength) {
  //     const winners = tournamentStore.tables[currentTableIndex].rounds[actualRoundIndex].groupA
  //       .filter((competitor, index) => competitor.stats[actualRoundIndex].result === MATCH_RESULT.WIN && index < 4)
  //     console.log('we are here 1', winners)
  //     nextMatch = `${winners[0]?.lastName} ${winners[0]?.firstName} vs ${winners[1]?.lastName} ${winners[1]?.firstName}`; 

  //   } else if (currentPairIsLastInGroupA && groupBLength) {
  //     nextMatch = `${currentPairInGroupBCompetitor0?.lastName} ${currentPairInGroupBCompetitor0?.firstName} vs ${currentPairInGroupBCompetitor1?.lastName} ${currentPairInGroupBCompetitor1?.firstName}`; 
  //   } else {
  //     const nextPairInGroupACompetitor0 = tournamentStore.tables[currentTableIndex].rounds[actualRoundIndex].groupA[firstIDLECompetitorIndexInGroupA + 2];
  //     const nextPairInGroupACompetitor1 = tournamentStore.tables[currentTableIndex].rounds[actualRoundIndex].groupA[firstIDLECompetitorIndexInGroupA + 3];
  //     nextMatch = `${nextPairInGroupACompetitor0?.lastName} ${nextPairInGroupACompetitor0?.firstName} vs ${nextPairInGroupACompetitor1?.lastName} ${nextPairInGroupACompetitor1?.firstName}`; 
  //   }
  // } 
  // if (firstIDLECompetitorIndexInGroupA === -1 && firstIDLECompetitorIndexInGroupB !== -1) {
  //   const currentPairIsLastInGroupB = groupBLength - firstIDLECompetitorIndexInGroupB <= 2;
  //   if (currentPairIsLastInGroupB) {
  //     const winners = tournamentStore.tables[currentTableIndex].rounds[actualRoundIndex].groupA
  //       .filter((competitor, index) => competitor.stats[actualRoundIndex].result === MATCH_RESULT.WIN && index < 4)
  //     console.log('we are here 2', winners)
  //     nextMatch = `${winners[0]?.lastName} ${winners[0]?.firstName} vs ${winners[1]?.lastName} ${winners[1]?.firstName}`; 
  //   } else if (!currentPairIsLastInGroupB) {
  //     const nextPairInGroupBCompetitor0 = tournamentStore.tables[currentTableIndex].rounds[actualRoundIndex].groupB[firstIDLECompetitorIndexInGroupB + 2];
  //     const nextPairInGroupBCompetitor1 = tournamentStore.tables[currentTableIndex].rounds[actualRoundIndex].groupB[firstIDLECompetitorIndexInGroupB + 3];
    
  //     nextMatch = `${nextPairInGroupBCompetitor0?.lastName} ${nextPairInGroupBCompetitor0?.firstName} vs ${nextPairInGroupBCompetitor1?.lastName} ${nextPairInGroupBCompetitor1?.firstName}`; 
  
  //   }
    
  // }
  
  // if (firstIDLECompetitorIndexInGroupA === -1 && firstIDLECompetitorIndexInGroupB === -1) { // means 1 round ended, no group b
  //   currentMatch = 
  
  // }





  return (
    <Grid container>
      <Grid item xs={12} sx={{ border: '1px solid black'}}>

        Table {1 + +currentTableIndex}
        <br/>
        Actual Round: {actualRoundIndex}
        <br/>
        Current Category: {categoryName}
        <br/>
        <br/>

        <br/>

        {/* Previous Match {prevMatch}
        <br/> */}
        Current Match: {newCurrentMatch}
        <br/>

        <br/>
        <br/>

        next Match: {newNextMatch}
        <br/> 
        <Box
          sx={{
            m: 2,
            width: 100,
            height: 100,
            borderRadius: 1,
            bgcolor: 'primary.main',
          }}
        ></Box>
        
        <Box
          sx={{
            m: 2,
            width: 100,
            height: 100,
            borderRadius: 1,
            bgcolor: 'primary.main',
          }}
        ></Box>
        <Box
          sx={{
            m: 2,
            width: 100,
            height: 100,
            borderRadius: 1,
            bgcolor: 'primary.main',
          }}
        ></Box>
      </Grid>
    </Grid>
  )
})
