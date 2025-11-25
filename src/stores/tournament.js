// store.js

import { makeAutoObservable, autorun, toJS } from 'mobx';
import { v4 as uuidv4 } from 'uuid';
import _, { findLast } from 'lodash';
import { makePersistable } from 'mobx-persist-store';
import { ATHLETE_STATUS, ATHLETES_LIST_SOURCE, CATEGORY_STATE, CLASSIFICATION_LIST_DEFAULT, HANDS, MATCH_RESULT, SEX, TABLE_INITIAL_STATE, TABLE_STATE, WEIGHT_CATEGORIES_DEFAULT, WEIGHT_UNIT_KG, WEIGHT_UNITS } from '../constants/tournamenConfig';
import { createTournamentCategoryConfig, generateTournamentCategoryTitle, getCategoryShortId } from '../utils/categoriesUtils';
import { fromUnixTime, format } from 'date-fns';
import { getIntl } from '../routes/App';
import { analytics } from '../services/analytics';
import { markWinnersChannel } from '../routes/Tournament';
// import { intl } from '../routes/App';

class TournamentStore {
  constructor() {
    makeAutoObservable(this);

    makePersistable(
      this,
      {
        name: 'TournamentStore',
        properties: [
          'tournamentName',
          'tournamentDate',
          'tablesCount',
          'currentTableIndex',
          'tables',
          'weightCategories',
          'classificationCategories',
          'newTournamentCategories',
          'competitorsList',
          'results',
          'postponedCategoriesProgress',
          'weightUnit',

        ],
        storage: window.localStorage
      }
    );
  }

  weightUnit = WEIGHT_UNITS[WEIGHT_UNIT_KG];

  tournamentName = '';

  tournamentDate = Date.now();

  tablesCount = 3;

  currentTableIndex = 0;

  tables = {
    0: TABLE_INITIAL_STATE,
    1: TABLE_INITIAL_STATE,
    2: TABLE_INITIAL_STATE,
  }

  weightCategories = WEIGHT_CATEGORIES_DEFAULT;

  classificationCategories = CLASSIFICATION_LIST_DEFAULT;

//tournamentCategories = {};

  newTournamentCategories = {}; // TODO should be renamed

  postponedCategoriesProgress = {}; // when user presses pause category progress is saving here

  competitorsList = [];

  results = {}; // can be renamed to tournament results;

  setTournamentBasicSettings = ({ 
    tournamentName,
    tournamentDate,
    tablesCount,
    weightCategories,
    classificationCategories,
    weightUnit,
  }) => {
    this.tournamentName = tournamentName;
    this.tournamentDate = tournamentDate;
    this.weightCategories = weightCategories;
    this.classificationCategories = classificationCategories;
    this.setTablesConfig(tablesCount);
    this.weightUnit = weightUnit;
    analytics.logEvent('apply_tournament_settings');
  }

  setTablesConfig = (tablesCount) => {
    this.tablesCount = tablesCount;  
  //  this.tables = {}; //reset and then fill                
    for (let i = 0; i < tablesCount; i++ ) {
      this.tables[i] = this.tables[i] || TABLE_INITIAL_STATE;
    }
    if (tablesCount < 6) { // clear old tables with idle status;
      for (let i = tablesCount; i < 6; i++ ) {
        delete this.tables[i];
      }
    }
    this.setCurrentTableIndex(this.currentTableIndex < tablesCount ? this.currentTableIndex : 0); // switch to exist table
  };

  setCurrentTableIndex = (index) => this.currentTableIndex = index;

  setSelectedRoundIndex = (index) => this.currentTable.selectedRound = index;

  addWeightCategory = (weightCategory) => {
    this.weightCategories = [...this.weightCategories, weightCategory];
  };

  addClassificationCategory = (clasiffications) => {
    this.classificationCategories = [...this.classificationCategories, clasiffications];
  };

  createTournamentCategories = ({ classification, weightCategories, leftHand, rightHand, men, women }) => {
    const createdCategories = {};
    try {
      analytics.logEvent('generate_categories', { 
        classification: classification.id,
        weightCategories: Object.values(weightCategories)?.map(({ id, value }) => value || id),
        leftHand,
        rightHand,
        men,
        women
      });
    } catch(e) {
      console.log('e', e)
    }  
    for (const [key, category] of Object.entries(weightCategories)) {
      // const categoryTitleShort = `${classification.label} ${category.value} ${this.weightUnit.label}`;
      // const categoryTitleFull = `${classification.label} ${category.value} ${this.weightUnit.label}, mans, left hand`;
      const configDefaults = {
        classification: _.cloneDeep(classification),
        weightCategory: _.cloneDeep(category),
      }
      if (leftHand && men) {
        const id = uuidv4();
        const isCategoryAlreadyPresented = Object.values(tournamentStore.newTournamentCategories).some(({ config }) => {
          return _.isEqual(classification, config.classification) && _.isEqual(category, config.weightCategory) && config.hand === HANDS.LEFT && config.sex === SEX.MEN
        })
        if (!isCategoryAlreadyPresented) {
          createdCategories[id] = createTournamentCategoryConfig(id, HANDS.LEFT, SEX.MEN, configDefaults);
        }
        console.log('isCategoryAlreadyPresented', isCategoryAlreadyPresented, classification, category);
      }
      if (rightHand && men) {
        const id = uuidv4();
        const isCategoryAlreadyPresented = Object.values(tournamentStore.newTournamentCategories).some(({ config }) => {
          return _.isEqual(classification, config.classification) && _.isEqual(category, config.weightCategory) && config.hand === HANDS.RIGHT && config.sex === SEX.MEN
        })
        if (!isCategoryAlreadyPresented) {
          createdCategories[id] = createTournamentCategoryConfig(id, HANDS.RIGHT, SEX.MEN, configDefaults);
        }
      }
      if (leftHand && women) {
        const id = uuidv4();
        const isCategoryAlreadyPresented = Object.values(tournamentStore.newTournamentCategories).some(({ config }) => {
          return _.isEqual(classification, config.classification) && _.isEqual(category, config.weightCategory) && config.hand === HANDS.LEFT && config.sex === SEX.WOMEN
        })
        if (!isCategoryAlreadyPresented) {
          createdCategories[id] = createTournamentCategoryConfig(id, HANDS.LEFT, SEX.WOMEN, configDefaults);
        }
      }
      if (rightHand && women) {
        const id = uuidv4();
        const isCategoryAlreadyPresented = Object.values(tournamentStore.newTournamentCategories).some(({ config }) => {
          return _.isEqual(classification, config.classification) && _.isEqual(category, config.weightCategory) && config.hand === HANDS.RIGHT && config.sex === SEX.WOMEN
        })
        if (!isCategoryAlreadyPresented) {
          createdCategories[id] = createTournamentCategoryConfig(id, HANDS.RIGHT, SEX.WOMEN, configDefaults);
        }
      }
    }
  
    this.newTournamentCategories = {
      ...createdCategories,
      ...this.newTournamentCategories,
    };
  }

  removeTournamentCategory = (tournamentCategoryId) => {
    const updatedCompetitorsList = [];
    this.competitorsList.map((competitor) => {
      if (!competitor.tournamentCategoryIds.includes(tournamentCategoryId)) {
        updatedCompetitorsList.push(competitor);
      } else {
        const updatedTournamentCategoryIds = competitor.tournamentCategoryIds.filter(id => id !== tournamentCategoryId);
        if (updatedTournamentCategoryIds.length) {
          updatedCompetitorsList.push({ ...competitor, tournamentCategoryIds: updatedTournamentCategoryIds});
        }
      }
    });
    this.competitorsList = updatedCompetitorsList; 
    delete this.newTournamentCategories[tournamentCategoryId];
    analytics.logEvent('remove_category');
  }


  addCompetitor = ({ firstName, lastName, weight, tournamentCategoryIds, participationStatus, source = ATHLETES_LIST_SOURCE.CREATED }) => {
    analytics.logEvent('add_competitor', {
      firstName, 
      lastName, 
      participationStatus,
      weight, 
      source
    });
    const competitorAlreadyPresented = !!this.competitorsList.find(
      (competitor) => competitor.lastName === lastName && competitor.firstName === firstName
    );
    if (competitorAlreadyPresented) {
      return false;
    }
    const newCompetitor = {
      tournamentCategoryIds,
      firstName, 
      lastName, 
      weight, 
      id: uuidv4(),
      participationStatus,
      source: {
        type: source,
        createdAt: Date.now(),
        subType: null, // will be used for sheet, form, website, api...
      }
    }
    //this.competitorsList = [newCompetitor, ...this.competitorsList];
    this.competitorsList.unshift(newCompetitor);
    return true;

  }

  editCompetitor = (editedCompetitor) => {
    this.competitorsList = this.competitorsList.map((competitor) => editedCompetitor.id === competitor.id ? { ...competitor, ...editedCompetitor } : competitor);
    analytics.logEvent('edit_competitor');
  }

  removeCompetitorFromList = (competitorId) => {
    this.competitorsList = this.competitorsList.filter(({ id }) => id !== competitorId);
    analytics.logEvent('remove_competitor');
    
  }

  removeCompetitorFromCategory = (competitorId, tournamentCategoryId) => {
    const competitorIndex = this.competitorsList.findIndex((competitor) => competitor.id === competitorId);
    const updatedTournamentCategoryIds = this.competitorsList[competitorIndex].tournamentCategoryIds.filter((id) => id !== tournamentCategoryId);
    if (!updatedTournamentCategoryIds.length) { // competitor was presented only in this category, should be removed
      this.competitorsList = this.competitorsList.filter((competitor) => competitor.id !== competitorId);
    } else { // competitor is presented in other categories, so tournamentCategoryIds should be updated;\
      this.competitorsList = this.competitorsList.map((competitor) => {
        if (competitorId === competitor.id) {
          return { ...competitor, tournamentCategoryIds: updatedTournamentCategoryIds};
        }
        return competitor;
      });
    }
    analytics.logEvent('remove_competitor_from_category');
  }

  shuffleCategoryCompetitors = () => {
    this.currentTable.rounds[0].groupA = _.shuffle(this.currentTable.rounds[0].groupA);
  }

  setTableCategory = (tableId, category) => {
    this.tables[tableId].category = category;
    analytics.logEvent('set_table_category');
  }

  setTableStatus = (tableId, state) => {
    if (state === TABLE_STATE.IN_PROGRESS) {
      this.setupFirstRound(tableId);
    }
    if (state === TABLE_STATE.IDLE) {
      this.tables[tableId] = TABLE_INITIAL_STATE;
    }

    this.tables[tableId].state = state;
    analytics.logEvent('set_table_status', { table: tableId, state });
  }

  setTournamentCategoryStatus = (status) => { //idle, in_progress, paused, finished see CATEGORY_STATE
    const currentCategoryId = this.currentTable.category;
    this.newTournamentCategories[currentCategoryId].state = status;
    analytics.logEvent('set_tournament_category_status', { state: status });
  }

  setupFirstRound = () => {
    const actualCategory = this.competitorsList.filter(
      ({ participationStatus, tournamentCategoryIds }) => tournamentCategoryIds.includes(this.currentTable.category) && participationStatus === ATHLETE_STATUS.CHECKED_IN
    );
    const groupA = actualCategory.map((competitor) => ({ ...competitor, stats: { 0: { result: MATCH_RESULT.IDLE }}}))
    this.currentTable.rounds[0].groupA = _.shuffle(groupA); // TODOD check
    //this.currentTable.rounds[0].groupA = groupA;
    
    this.currentTable.selectedRound = 0;
    this.currentRound.groupB = [];
    this.currentRound.finalist = null;
    this.currentRound.semifinalist = null;
   // analytics.logEvent('setup_first_raund');
  }

  startNextRound = () => {
    analytics.logEvent('start_next_round');
    const nextRoundIndex = this.currentRoundIndex + 1;
    const newRoundGroupA = [];
    let newRoundGroupB = [];
    let finalist = this.currentFinalist;
    let semifinalist = this.currentSemiFinalist;
    const finishedGroup = []; // list of competitors who have finished in current round;
    let exitToFinal = false; // who will go to final and who to semifinal, both competitors with no loses;
    let isSuperFinal = false; // when groupB is empty and there are 2 competitors in groupA with 1 lose for each;
    // console.log('initial finalist',  finalist)
		// console.log('initial semifinalist',  semifinalist)

    this.currentGroupA.map((competitor, index) => {
      const currentGroupALength = this.currentGroupA.length;
      const isLastPairIncomplete = (index === currentGroupALength - 1) && currentGroupALength % 2 === 1; 
      const isCompetitorWinner = competitor.stats[this.currentRoundIndex].result === MATCH_RESULT.WIN;
      const isCompetitorLoser = competitor.stats[this.currentRoundIndex].result === MATCH_RESULT.LOSE;

      if (currentGroupALength === 2 && index === 0) { // 
        const firstCompetitorLosesCountInPrevRoounds = Object.keys(competitor.stats) //we dont count lose in current round
          .reduce((prev, current) => prev + (competitor.stats[current].result === MATCH_RESULT.LOSE && current != this.currentRoundIndex ? 1 : 0), 0);
        const secondCompetitorLosesCountInPrevRounds = Object.keys(this.currentGroupA[1].stats) //we dont count lose in current round
          .reduce((prev, current) => prev + (this.currentGroupA[1].stats[current].result === MATCH_RESULT.LOSE && current != this.currentRoundIndex ? 1 : 0), 0);
        if (firstCompetitorLosesCountInPrevRoounds === 0 && secondCompetitorLosesCountInPrevRounds === 0) {
          exitToFinal = true;
        }
        console.log('LosesCountInPrevRoounds', firstCompetitorLosesCountInPrevRoounds, secondCompetitorLosesCountInPrevRounds);
      };

      if (exitToFinal) { // to prevent copy of competitor in next iteration
        if (!semifinalist && !finalist) {
          if (isCompetitorWinner) {
            finalist = competitor;
            semifinalist = this.currentGroupA[1];
          }
          if (isCompetitorLoser) {
            semifinalist = competitor; 
            finalist = this.currentGroupA[1];
          }
        }
        return;
      }

      if (index === 0 && this.currentGroupB.length === 0 && currentGroupALength === 2 ) { //&& !semifinalist && !finalist
        //can be SUPERFINAL, && !semifinalist && !finalist is unnecessary
        const firstCompetitorLosesCountInAllRoounds = Object.values(competitor.stats)
          .reduce((prev, current) => prev + (current.result === MATCH_RESULT.LOSE ? 1 : 0), 0);
        const secondCompetitorLosesCountInAllRounds = Object.values(this.currentGroupA[1].stats)
          .reduce((prev, current) => prev + (current.result === MATCH_RESULT.LOSE ? 1 : 0), 0); 
        console.log('CompetitorLosesCountInAllRoounds', firstCompetitorLosesCountInAllRoounds, secondCompetitorLosesCountInAllRounds)
        if (firstCompetitorLosesCountInAllRoounds === 1 && secondCompetitorLosesCountInAllRounds === 1) { // means superfinal
          isSuperFinal = true;
          if (isCompetitorWinner) {
            const updatedWinner = _.cloneDeep(competitor);
            _.set(updatedWinner.stats, [nextRoundIndex, 'result'], MATCH_RESULT.IDLE);
            newRoundGroupA.push(updatedWinner);
            const updatedLoser = _.cloneDeep(this.currentGroupA[1]);
            _.set(updatedLoser.stats, [nextRoundIndex, 'result'], MATCH_RESULT.IDLE);
            newRoundGroupA.push(updatedLoser);
          } 
          if (isCompetitorLoser) {
            const updatedLoser = _.cloneDeep(competitor);
            _.set(updatedLoser.stats, [nextRoundIndex, 'result'], MATCH_RESULT.IDLE);
            newRoundGroupA.push(updatedLoser);
            const updatedWinner = _.cloneDeep(this.currentGroupA[1]);
            _.set(updatedWinner.stats, [nextRoundIndex, 'result'], MATCH_RESULT.IDLE);
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
        _.set(updateCompetitor.stats, [nextRoundIndex, 'result'], MATCH_RESULT.IDLE)
        newRoundGroupA.unshift(updateCompetitor);
        return;
      }
      if (isCompetitorWinner) {
        const updateCompetitor = _.cloneDeep(competitor);
        _.set(updateCompetitor.stats, [nextRoundIndex, 'result'], MATCH_RESULT.IDLE)
        newRoundGroupA.push(updateCompetitor)
      }

      // COMPETITOR MOVES TO GROUP B
      if (isCompetitorLoser) {
        const updateCompetitor = _.cloneDeep(competitor);
        _.set(updateCompetitor.stats, [nextRoundIndex, 'result'], MATCH_RESULT.IDLE)
        newRoundGroupB.push(updateCompetitor)
      }
    });

    this.currentGroupB.map((competitor, index) => { 
      const isLastPairIncomplete = (index === this.currentGroupB.length - 1) && this.currentGroupB.length % 2 === 1;
      const isCompetitorWinner = competitor.stats[this.currentRoundIndex].result === 'win';
      const isCompetitorLoser = competitor.stats[this.currentRoundIndex].result === 'lose';

      // NO PAIR, MOVES TO TOP OF HIS GROUP IN NEXT ROUND
      if (isLastPairIncomplete) {
        const updateCompetitor = _.cloneDeep(competitor);
        _.set(updateCompetitor.stats, [nextRoundIndex, 'result'], MATCH_RESULT.IDLE)
        newRoundGroupB.unshift(updateCompetitor);
        return;
      }
      if (isCompetitorWinner) {
        const updateCompetitor = _.cloneDeep(competitor);
        _.set(updateCompetitor.stats, [nextRoundIndex, 'result'], MATCH_RESULT.IDLE);
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
        _.set(updateCompetitor.stats, [nextRoundIndex, 'result'], MATCH_RESULT.IDLE);
        newRoundGroupB.unshift(updateCompetitor);
        semifinalist = null;
      }
    } 

    if (finalist) {
      if (!semifinalist && newRoundGroupB.length === 1) {
        const updatedFinalist = _.cloneDeep(finalist);
        _.set(updatedFinalist.stats, [nextRoundIndex, 'result'], MATCH_RESULT.IDLE);
        newRoundGroupA.push(updatedFinalist);
        const updatedSemifinalist = _.cloneDeep(newRoundGroupB[0]);
        _.set(updatedSemifinalist.stats, [nextRoundIndex, 'result'], MATCH_RESULT.IDLE);
        newRoundGroupA.push(updatedSemifinalist);
        finalist = null;
        newRoundGroupB = [];
      }
    }

    //END OF CATEGORY
    if (newRoundGroupA.length === 1 && newRoundGroupB.length === 0) {
      this.setTournamentCategoryStatus(CATEGORY_STATE.FINISHED);
      this.setTableStatus(this.currentTableIndex, TABLE_STATE.FINISHED);
      finishedGroup.unshift( _.cloneDeep(newRoundGroupA[0]));       
      this.logRoundResults(finishedGroup);                       
      return;
    }

     this.logRoundResults(finishedGroup);
     this.currentTable.rounds[nextRoundIndex] = { groupA: newRoundGroupA, groupB: newRoundGroupB, finalist: finalist, semifinalist: semifinalist };
     this.currentTable.selectedRound = nextRoundIndex;
  }

  markWinner = (competitorId, group) => {
   // analytics.logEvent('mark_winner');
    // console.log('competitorId', competitorId, group)
    let currentGroup;
    if (group === 'groupA') {
      currentGroup = this.currentGroupA;
    }
    if (group === 'groupB') {
      currentGroup = this.currentGroupB;
    }
    const selectedCompetitorIndex = currentGroup.findIndex(competitor => competitor.id === competitorId);
    //index of another competitor in pair
    const pairedCompetitorIndex = selectedCompetitorIndex % 2 == 0
      ? selectedCompetitorIndex + 1
      : selectedCompetitorIndex - 1;
    
    currentGroup[selectedCompetitorIndex].stats[this.currentRoundIndex].result = MATCH_RESULT.WIN;
    const winner = currentGroup[selectedCompetitorIndex];
    let loser = null;

    if (pairedCompetitorIndex < currentGroup.length) {
      currentGroup[pairedCompetitorIndex].stats[this.currentRoundIndex].result = MATCH_RESULT.LOSE;
      loser = currentGroup[pairedCompetitorIndex];
    }

    // check
    if (winner && loser) {
      markWinnersChannel.postMessage({
        winner: {
          lastName: winner.lastName,
         firstName: winner.firstName,
         id: winner.id,
        },
        loser: {
          lastName: loser.lastName,
          firstName: loser.firstName,
          id: loser.id,
        },
        tableIndex: this.currentTableIndex
      })
    }
  }
  

  logRoundResults = (finishedGroup) => {
    const competitorsCount = this.currentTable.rounds[0].groupA.length;
    if (!this.results[this.currentTable.category]) { //means category id;
      this.results[this.currentTable.category] = new Array(competitorsCount).fill(null);
    } 
    const results = this.results[this.currentTable.category];
    let firstCompetitorIndex = results.findIndex((competitor) => !!competitor);
    if (firstCompetitorIndex === -1) { firstCompetitorIndex = results.length };
    results.splice(firstCompetitorIndex - finishedGroup.length, finishedGroup.length, ...finishedGroup);

    this.results[this.currentTable.category] = results.map((el) => el);
   // analytics.logEvent('log_round_results');

    //console.log(toJS(this.results))
  }

  saveCategoryProgress = () => {
    const categoryId = this.currentTable.category;
    const currentTableCopy = _.cloneDeep(this.currentTable);
    const lastRoundIndex = currentTableCopy.selectedRound; //on this case selected round is last round, (user press pospone final)
    // currentTableCopy.rounds[lastRoundIndex].groupA.map((competitor) => {
    //   competitor.stats[lastRoundIndex].result = 'idle';
    // })

    this.postponedCategoriesProgress = {
      [categoryId]: {
        ...currentTableCopy
      },
      ...this.postponedCategoriesProgress,
    };
    this.setTableStatus(this.currentTableIndex, TABLE_STATE.IDLE);
    analytics.logEvent('save_category_progress');

  };

  startPostponedCategories = (currentTableIndex) => {
    const categoryHistory = this.postponedCategoriesProgress[this.currentTable.category];
    this.tables[currentTableIndex] = _.cloneDeep(categoryHistory);
    this.setTournamentCategoryStatus(CATEGORY_STATE.IN_PROGRESS);
    delete this.postponedCategoriesProgress[this.currentTable.category];
    analytics.logEvent('start_postponed_category');
  }

  removeResults = () => {
    this.results = {};
  }

  resetStore = () => {
    this.weightUnit = WEIGHT_UNITS[WEIGHT_UNIT_KG];
    this.tournamentName = '';
    this.tournamentDate = Date.now();
    this.tablesCount = 3;
    this.currentTableIndex = 0;
    this.tables = {
      0: TABLE_INITIAL_STATE,
      1: TABLE_INITIAL_STATE,
      2: TABLE_INITIAL_STATE,
    };
    this.weightCategories = WEIGHT_CATEGORIES_DEFAULT;
    this.classificationCategories = CLASSIFICATION_LIST_DEFAULT;
    this.newTournamentCategories = {};
    this.postponedCategoriesProgress = {};
    this.competitorsList = [];
    this.results = {};
  }

  get
  currentTable() {
    return this.tables[this.currentTableIndex];
  }
  
  get
  currentRoundIndex() {
    return +this.currentTable.selectedRound;
  }

  get
  currentRound() {
    return this.currentTable.rounds[this.currentRoundIndex];
  }

  get
  currentGroupA() {
    return this.currentRound.groupA;
  }

  get
  currentGroupAChunked() {
    return _.chunk(this.currentRound.groupA, 2);
  }

  get
  currentGroupB() {
    return this.currentRound.groupB;
  }

  get
  currentGroupBChunked() {
    return _.chunk(this.currentRound.groupB, 2);
  }


  get
  currentFinalist() {
    return this.currentRound.finalist || null; // can be undefined for prerounds so need fallback
  }

  get
  currentSemiFinalist() {
    return this.currentRound.semifinalist || null; // can be undefined for prerounds so need fallback
  }

  get
  postponedCategoriesIdsList() {
    return Object.keys(this.postponedCategoriesProgress)
            //  .filter((categoryId => this.newTournamentCategories[categoryId].state === CATEGORY_STATE.PAUSED))
  }

  get
  idleCategoriesIdsList() {
    return Object.keys(this.newTournamentCategories)
      .filter((categoryId => this.newTournamentCategories[categoryId].state === CATEGORY_STATE.IDLE))
  }

  selectedCategoryCompetitorsCount(categoryId) {
    return this.competitorsList.reduce((prev, { tournamentCategoryIds }) => prev + (tournamentCategoryIds.includes(categoryId) ? 1 : 0), 0);
  }

  get
  resultForPDF() {
    const dateObject = fromUnixTime(this.tournamentDate / 1000);
    const formattedDate = format(dateObject, 'dd-MM-yyyy');
    const categoriesResults = [];
    Object.keys(this.results).map(categoryId => {
      const category = this.newTournamentCategories[categoryId];
      if (category.state === CATEGORY_STATE.FINISHED) {
        categoriesResults.push({
          name: generateTournamentCategoryTitle(getIntl(), category.config, 'full'),
          results: this.results[categoryId].map((athlete) => `${athlete.lastName} ${athlete.firstName}`)
        })
      }
    })
    return {
      title: this.tournamentName,
      date: formattedDate,
      categoriesResults,
    }
  }

  get
  tournamentCategoriesNames() {
    const categoriesNames = [];
    Object.values(this.newTournamentCategories).map(category => {
      categoriesNames.push(
        `${generateTournamentCategoryTitle(getIntl(), category.config, 'full')} [${getCategoryShortId(category.id)}]`
      )
    })
    return categoriesNames;
  }


}

export const tournamentStore = new TournamentStore();

// autorun(() => {
//   //console.log("Energy level:", tournamentStore)
// })
