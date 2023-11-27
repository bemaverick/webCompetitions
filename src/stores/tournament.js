// store.js

import { makeAutoObservable, autorun, toJS } from 'mobx';
import { v4 as uuidv4 } from 'uuid';
import _, { findLast } from 'lodash';
import { makePersistable } from 'mobx-persist-store';

const FAKE_competitorsList = [
  { firstName: 'Сергій', lastName: 'Іванчук', weight: '88', category: '90_man_left', id: '1'},
  { firstName: 'Рустам', lastName: 'Стерненко', weight: '88', category: '90_man_left', id: '2'},
  { firstName: 'Антон', lastName: 'Умаров', weight: '88', category: '90_man_left', id: '3'},
  { firstName: 'Андрій', lastName: 'Олійник', weight: '90', category: '90_man_left', id: '4'},
  // { firstName: 'Іван', lastName: 'Драганчук', weight: '88', category: '90_man_left', id: '5'},
  // { firstName: 'Павло', lastName: 'Курильчик', weight: '93', category: '90_man_left', id: '6'},
  // { firstName: 'Тарас', lastName: 'Сергійчук', weight: '88', category: '90_man_left', id: '7'},
  // { firstName: 'Олег', lastName: 'Попов', weight: '90', category: '90_man_left', id: '8'},
  // { firstName: 'Сергій', lastName: 'Дьомін', weight: '88', category: '90_man_left', id: '9'},
  // { firstName: 'Микола', lastName: 'Попенко', weight: '88', category: '90_man_left', id: '10'},
  // { firstName: 'Степан', lastName: 'Савченко', weight: '87', category: '90_man_left', id: '11'},
  // { firstName: 'Платон', lastName: 'Раменко', weight: '88', category: '90_man_left', id: '12'},
  { firstName: 'Мирослав', lastName: 'Федоренко', weight: '85', category: '90_man_left', id: '13'},
  { firstName: 'Кирило', lastName: 'Буданов', weight: '88', category: '90_man_left', id: '14'},
  { firstName: 'Ренат', lastName: 'Ізмаїлов', weight: '86', category: '90_man_left', id: '15'},
  { firstName: 'Максим', lastName: 'Куценко', weight: '90', category: '90_man_left', id: '16'},
  { firstName: 'Євгеній', lastName: 'Вовченко', weight: '91', category: '90_man_left', id: '17'},
  { firstName: 'Кирило', lastName: 'Буданов', weight: '88', category: '110_man_right', id: '18'},
  { firstName: 'Ренат', lastName: 'Ізмаїлов', weight: '86', category: '110_man_right', id: '19'},
  { firstName: 'Максим', lastName: 'Куценко', weight: '90', category: '110_man_right', id: '16'},
  { firstName: 'Євгеній', lastName: 'Вовченко', weight: '91', category: '110_man_right', id: '20'},
]


//  { firstName: 'Євгеній', lastName: 'Вовченко', weight: '91', category: '110_man_right', id: '20', stats: { 0: { result: 'win' }}},
//result can be win|lose|idle


const weightCategoriesDefault = [
  {
    id: '60',
    value: '60',
  }, {
    id: '70',
    value: '70',
  }, {
    id: '80',
    value: '80',
    
  }, {
    id: '90',
    value: '90',
    
  }, {
    id: '100',
    value: '100',
    
  }, {
    id: '100+',
    value: '100+',
  }, {
    id: 'xxx',
    valueKey: 'unit.weight.kilogram',
  }
]

const classificationCategoriesDefault = [
  {
    id: '1',
    labelKey: 'classification.seniors',
  }, {
    id: '2',
    labelKey: 'classification.youth',
  }, {
    id: '3',
    labelKey: 'classification.juniors',
  }, {
    id: '4',
    labelKey: 'classification.masters',
  }, {
    id: '5',
    labelKey: 'classification.grandmasters',
  }, {
    id: '6',
    labelKey: 'classification.amateurs',
  },    {
    id: '7',
    labelKey: 'classification.professionals',
  },
]

class TournamentStore {
  constructor() {
    makeAutoObservable(this);

    makePersistable(
      this,
      {
        name: 'SampleStore',
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
          'postponedCategoriesProgress'
        ],
        storage: window.localStorage
      }
    );
  }

  weightUnit = { value: 'kg', factor: 1, label: 'kg' };

  tournamentName = '';

  tournamentDate = Date.now();

  tablesCount = 3;

  currentTableIndex = 0;

  //groupA[competitorIndex].results[roundId].result === win || false
  tables = {
    0: {
      category: '',
      state: 'idle', //idle, started, or finished
      rounds: {
        0: {
          groupA: [],
          groupB: [],
          finalist: null,
          semifinalist: null,
        }
      },
      selectedRound: 0
    },
    1: {
      category: '',
      state: 'idle',
      rounds: {
        0: {
          groupA: [],
          groupB: [],
          finalist: null,
          semifinalist: null,
        }
      },
      selectedRound: 0
    },
    2: {
      category: '',
      state: 'idle',
      rounds: {
        0: {
          groupA: [],
          groupB: [],
          finalist: null,
          semifinalist: null,
        }
      },
      selectedRound: 0
    },
  }

  weightCategories = weightCategoriesDefault;

  classificationCategories = classificationCategoriesDefault;

  tournamentCategories = {};

  newTournamentCategories = {

  }

  postponedCategoriesProgress = {

  }

  competitorsList = [];
  // competitorsList = FAKE_competitorsList;

  results = {};

  setTournamentBasicSettings = ({ 
    tournamentName,
    tournamentDate,
    tablesCount,
    weightCategories,
    classificationCategories
  }) => {
    this.tournamentName = tournamentName;
    this.tournamentDate = tournamentDate;
    this.weightCategories = weightCategories;
    this.classificationCategories = classificationCategories;
    this.setTablesConfig(tablesCount);
  }

  // setTournamentName = (name) => this.tournamentName = name;

  // setTournamentDate = (date) => this.tournamentDate = date;
  setTablesConfig = (tablesCount) => {
    this.tablesCount = tablesCount;  
    this.tables = {}; //reset and then fill                
    for (let i = 0; i < tablesCount; i ++ ) {
      this.tables[i] = {    
        state: 'idle',
        category: '',
        rounds: {
          0: {
            groupA: [],     
            groupB: [],
            finalist: null,
            semifinalist: null,
        }
        },
        selectedRound: 0,
      } 
    }

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

    for (const [key, category] of Object.entries(weightCategories)) {
      const categoryTitleShort = `${classification.label} ${category.value} ${this.weightUnit.label}`;
      const configDefaults = {
        classification: _.cloneDeep(classification),
        weightCategory: _.cloneDeep(category),
      }
      if (leftHand && men) {
        const id = uuidv4();
        const categoryTitleFull = `${classification.label} ${category.value} ${this.weightUnit.label}, mans, left hand`;
        createdCategories[id] = {
          categoryTitleFull,
          categoryTitleShort,
          id,
          config: {
            ...configDefaults,
            hand: 'left',
            gender: 'men',
          },
          state: 'idle'
        };
      }
      if (rightHand && men) {
        const id = uuidv4();
        const categoryTitleFull = `${classification.label} ${category.value} ${this.weightUnit.label}, mans, right hand`;
        createdCategories[id] = {
          categoryTitleFull,
          categoryTitleShort,
          id,
          config: {
            ...configDefaults,
            hand: 'right',
            gender: 'men',
          },
          state: 'idle'
        };
      }
      if (leftHand && women) {
        const id = uuidv4();
        const categoryTitleFull = `${classification.label} ${category.value} ${this.weightUnit.label}, women, left hand`;
        createdCategories[id] = {
          categoryTitleFull,
          categoryTitleShort,
          id,
          config: {
            ...configDefaults,
            hand: 'left',
            gender: 'women',
          },
          state: 'idle'
        };
      }
      if (rightHand && women) {
        const id = uuidv4();
        const categoryTitleFull = `${classification.label} ${category.value} ${this.weightUnit.label}, women, right hand`;
        createdCategories[id] = {
          categoryTitleFull,
          categoryTitleShort,
          id,

          config: {
            ...configDefaults,
            hand: 'right',
            gender: 'women',
          },
          state: 'idle'
        };
      }
    }
  
    this.newTournamentCategories = {
      ...createdCategories,
      ...this.newTournamentCategories,
    };

    console.log(classification, Object.values(weightCategories), leftHand, rightHand, men, women)
    console.log("createdCategories", createdCategories)
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
  }


  addCompetitor = ({ firstName, lastName, weight, tournamentCategoryIds, present }) => {
    const newCompetitor = {
      tournamentCategoryIds,
      firstName, 
      lastName, 
      weight, 
      id: uuidv4(),
      present
    }
    this.competitorsList = [newCompetitor, ...this.competitorsList];
  }

  editCompetitor = (editedCompetitor) => {
    this.competitorsList = this.competitorsList.map((competitor) => editedCompetitor.id === competitor.id ? editedCompetitor : competitor);
  }

  removeCompetitorFromList = (competitorId) => {
    this.competitorsList = this.competitorsList.filter(({ id }) => id !== competitorId);
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
  }

  shuffleCategoryCompetitors = () => {
    this.currentTable.rounds[0].groupA = _.shuffle(this.currentTable.rounds[0].groupA);
  }

  setTableCategory = (tableId, category) => {
    this.tables[tableId].category = category;
  }

  setTableStatus = (tableId, state) => {
    if (state === 'started') {
      this.setupFirstRound(tableId);
    }
    if (state === 'idle') {
      this.tables[tableId] = { // initial
        category: '',
        state: 'idle', //idle, started, or finished
        rounds: {
          0: {
            groupA: [],
            groupB: [],
            finalist: null,
            semifinalist: null,
          }
        },
        selectedRound: 0
      };
    }
    this.tables[tableId].state = state;
  }

  setTournamentCategoryStatus = (status) => { //idle, started, paused, finished
    const currentCategoryId = this.currentTable.category;
    this.newTournamentCategories[currentCategoryId].state = status;
  }

  setupFirstRound = () => {
    const actualCategory = this.competitorsList.filter(
      ({ present, tournamentCategoryIds }) => tournamentCategoryIds.includes(this.currentTable.category) && present
    );
    const groupA = actualCategory.map((competitor) => ({ ...competitor, stats: { 0: { result: 'idle' }}}))
    this.currentTable.rounds[0].groupA = _.shuffle(groupA);
    this.currentTable.selectedRound = 0;
    this.currentRound.groupB = [];
    this.currentRound.finalist = null;
    this.currentRound.semifinalist = null;
  }

  startNextRound = () => {
    const nextRoundIndex = this.currentRoundIndex + 1;
    const newRoundGroupA = [];
    let newRoundGroupB = [];
    let finalist = this.currentFinalist;
    let semifinalist = this.currentSemiFinalist;
    const finishedGroup = []; // list of competitors who have finished in current round;
    let exitToFinal = false; // who will go to final and who to semifinal, both competitors with no loses;
    let isSuperFinal = false; // when groupB is empty and there are 2 competitors in groupA with 1 lose for each;
    console.log('initial finalist',  finalist)
		console.log('initial semifinalist',  semifinalist)

    this.currentGroupA.map((competitor, index) => {
      const currentGroupALength = this.currentGroupA.length;
      const isLastPairIncomplete = (index === currentGroupALength - 1) && currentGroupALength % 2 === 1; 
      const isCompetitorWinner = competitor.stats[this.currentRoundIndex].result === 'win';
      const isCompetitorLoser = competitor.stats[this.currentRoundIndex].result === 'lose';
      if (currentGroupALength === 2 && index === 0) { // 
        const firstCompetitorLosesCountInPrevRoounds = Object.keys(competitor.stats) //we dont count lose in current round
          .reduce((prev, current) => prev + (competitor.stats[current].result === 'lose' && current != this.currentRoundIndex ? 1 : 0), 0);
        const secondCompetitorLosesCountInPrevRounds = Object.keys(this.currentGroupA[1].stats) //we dont count lose in current round
          .reduce((prev, current) => prev + (this.currentGroupA[1].stats[current].result === 'lose' && current != this.currentRoundIndex ? 1 : 0), 0);
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
          .reduce((prev, current) => prev + (current.result === 'lose' ? 1 : 0), 0);
        const secondCompetitorLosesCountInAllRounds = Object.values(this.currentGroupA[1].stats)
          .reduce((prev, current) => prev + (current.result === 'lose' ? 1 : 0), 0); 
        console.log('CompetitorLosesCountInAllRoounds', firstCompetitorLosesCountInAllRoounds, secondCompetitorLosesCountInAllRounds)
        if (firstCompetitorLosesCountInAllRoounds === 1 && secondCompetitorLosesCountInAllRounds === 1) { // mens superfinal
          isSuperFinal = true;
          if (isCompetitorWinner) {
            const updatedWinner = _.cloneDeep(competitor);
            _.set(updatedWinner.stats, [nextRoundIndex, 'result'], 'idle');
            newRoundGroupA.push(updatedWinner);
            const updatedLoser = _.cloneDeep(this.currentGroupA[1]);
            _.set(updatedLoser.stats, [nextRoundIndex, 'result'], 'idle');
            newRoundGroupA.push(updatedLoser);
          } 
          if (isCompetitorLoser) {
            const updatedLoser = _.cloneDeep(competitor);
            _.set(updatedLoser.stats, [nextRoundIndex, 'result'], 'idle');
            newRoundGroupA.push(updatedLoser);
            const updatedWinner = _.cloneDeep(this.currentGroupA[1]);
            _.set(updatedWinner.stats, [nextRoundIndex, 'result'], 'idle');
            newRoundGroupA.unshift(updatedWinner);
          }
          return;
        }
      }
      if (isSuperFinal) { // all competitors already calculated above, prevent copy of loser competitor in next iteration
        return;
      }

      //IN THE FINAL IN GROUP A CAN BE A COMPETITOR WITH LOSSES, WE NEED TO COUNT LOSSES
      const numberOfLoses = Object.values(competitor.stats).reduce((prev, current) => prev + (current.result === 'lose' ? 1 : 0), 0);
      console.log(competitor.lastName, numberOfLoses)

      // 2 LOSES IN A => COMPETITION IS FINISHING
      if (numberOfLoses === 2) {
        finishedGroup.unshift( _.cloneDeep(competitor));
        return;
      }

       // NO PAIR, MOVES TO TOP OF HIS GROUP IN NEXT ROUND
      if (isLastPairIncomplete) {
        const updateCompetitor = _.cloneDeep(competitor);
        _.set(updateCompetitor.stats, [nextRoundIndex, 'result'], 'idle')
        newRoundGroupA.unshift(updateCompetitor);
        return;
      }
      if (isCompetitorWinner) {
        const updateCompetitor = _.cloneDeep(competitor);
        _.set(updateCompetitor.stats, [nextRoundIndex, 'result'], 'idle')
        newRoundGroupA.push(updateCompetitor)
      }

      // COMPETITOR MOVES TO GROUP B
      if (isCompetitorLoser) {
        const updateCompetitor = _.cloneDeep(competitor);
        _.set(updateCompetitor.stats, [nextRoundIndex, 'result'], 'idle')
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
        _.set(updateCompetitor.stats, [nextRoundIndex, 'result'], 'idle')
        newRoundGroupB.unshift(updateCompetitor);
        return;
      }
      if (isCompetitorWinner) {
        const updateCompetitor = _.cloneDeep(competitor);
        _.set(updateCompetitor.stats, [nextRoundIndex, 'result'], 'idle');
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
        _.set(updateCompetitor.stats, [nextRoundIndex, 'result'], 'idle');
        newRoundGroupB.unshift(updateCompetitor);
        semifinalist = null;
      }
    } 

    if (finalist) {
      if (!semifinalist && newRoundGroupB.length === 1) {
        const updatedFinalist = _.cloneDeep(finalist);
        _.set(updatedFinalist.stats, [nextRoundIndex, 'result'], 'idle');
        newRoundGroupA.push(updatedFinalist);
        const updatedSemifinalist = _.cloneDeep(newRoundGroupB[0]);
        _.set(updatedSemifinalist.stats, [nextRoundIndex, 'result'], 'idle');
        newRoundGroupA.push(updatedSemifinalist);
        finalist = null;
        newRoundGroupB = [];
      }
    }

    //END OF CATEGORY
    if (newRoundGroupA.length === 1 && newRoundGroupB.length === 0) {
      this.setTournamentCategoryStatus('finished');
      this.setTableStatus(this.currentTableIndex, 'finished');
      finishedGroup.unshift( _.cloneDeep(newRoundGroupA[0]));       
      this.logRoundResults(finishedGroup);                       
      return;
    }

     this.logRoundResults(finishedGroup);
     this.currentTable.rounds[nextRoundIndex] = { groupA: newRoundGroupA, groupB: newRoundGroupB, finalist: finalist, semifinalist: semifinalist };
     this.currentTable.selectedRound = nextRoundIndex;
  }

  markWinner = (competitorId, group) => {
    console.log('competitorId', competitorId, group)
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
    
    currentGroup[selectedCompetitorIndex].stats[this.currentRoundIndex].result = 'win';

    if (pairedCompetitorIndex < currentGroup.length) {
      currentGroup[pairedCompetitorIndex].stats[this.currentRoundIndex].result = 'lose';
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

    console.log(toJS(this.results))
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
    this.setTableStatus(this.currentTableIndex, 'idle');
  };

  startPostponedCategories = (currentTableIndex) => {
    const categoryHistory = this.postponedCategoriesProgress[this.currentTable.category];
    this.tables[currentTableIndex] = _.cloneDeep(categoryHistory);
    delete this.postponedCategoriesProgress[this.currentTable.category];
  }

  removeResults = () => {
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


}

export const tournamentStore = new TournamentStore();

autorun(() => {
  //console.log("Energy level:", tournamentStore)
})



const kharkivResults = {
  "tournamentName": "Відкритий Кубок Харкова",
  "tournamentDate": 1699678682433,
  "tablesCount": 3,
  "currentTableIndex": 1,
  "tables": {
      "0": {
          "category": "5b5125b7-09a1-410d-9d5d-1b5196b1c01a",
          "state": "finished",
          "rounds": {
              "0": {
                  "groupA": [
                      {
                          "firstName": "Андрій",
                          "lastName": "Зуяков ",
                          "weight": "75.5",
                          "tournamentCategoryIds": [
                              "25b0f044-9a01-42b5-b377-16accd14b5b3",
                              "5b5125b7-09a1-410d-9d5d-1b5196b1c01a"
                          ],
                          "id": "4131dd33-9f0e-4623-8e95-d59fbbcb161f",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "win"
                              }
                          }
                      },
                      {
                          "firstName": "Владислав",
                          "lastName": "Юрченко",
                          "weight": "73.5",
                          "tournamentCategoryIds": [
                              "25b0f044-9a01-42b5-b377-16accd14b5b3",
                              "5b5125b7-09a1-410d-9d5d-1b5196b1c01a"
                          ],
                          "id": "da1fdf6d-493e-4658-977f-95f55973ca0e",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "lose"
                              }
                          }
                      },
                      {
                          "firstName": "Дмитро",
                          "lastName": "Рудич",
                          "weight": "69.4",
                          "tournamentCategoryIds": [
                              "25b0f044-9a01-42b5-b377-16accd14b5b3",
                              "5b5125b7-09a1-410d-9d5d-1b5196b1c01a"
                          ],
                          "id": "64c969d3-e0a2-4ff8-a32a-dc03a024b2c0",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "lose"
                              }
                          }
                      },
                      {
                          "firstName": "Ілля",
                          "lastName": "Мазніченко",
                          "weight": "68.3",
                          "tournamentCategoryIds": [
                              "25b0f044-9a01-42b5-b377-16accd14b5b3",
                              "5b5125b7-09a1-410d-9d5d-1b5196b1c01a"
                          ],
                          "id": "a04e619f-c5ac-48ba-baaa-2e3bfbcd3892",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "win"
                              }
                          }
                      },
                      {
                          "firstName": "Артем",
                          "lastName": "Босенко",
                          "weight": "66.5",
                          "tournamentCategoryIds": [
                              "25b0f044-9a01-42b5-b377-16accd14b5b3",
                              "5b5125b7-09a1-410d-9d5d-1b5196b1c01a"
                          ],
                          "id": "b2116fd3-d857-4d8b-8adf-49e29ac9285b",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "lose"
                              }
                          }
                      },
                      {
                          "firstName": "Олександр",
                          "lastName": "Біловол ",
                          "weight": "69.7",
                          "tournamentCategoryIds": [
                              "25b0f044-9a01-42b5-b377-16accd14b5b3",
                              "5b5125b7-09a1-410d-9d5d-1b5196b1c01a"
                          ],
                          "id": "460bb6d1-4f6b-4cf9-a174-98b7bad141ae",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "win"
                              }
                          }
                      },
                      {
                          "firstName": "Тимур",
                          "lastName": "Кувандіков",
                          "weight": "73.8",
                          "tournamentCategoryIds": [
                              "25b0f044-9a01-42b5-b377-16accd14b5b3",
                              "5b5125b7-09a1-410d-9d5d-1b5196b1c01a"
                          ],
                          "id": "f5daf1a7-3931-48db-b81c-987978799486",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "win"
                              }
                          }
                      },
                      {
                          "firstName": "Андрій",
                          "lastName": "Чукарин ",
                          "weight": "73.7",
                          "tournamentCategoryIds": [
                              "25b0f044-9a01-42b5-b377-16accd14b5b3",
                              "5b5125b7-09a1-410d-9d5d-1b5196b1c01a"
                          ],
                          "id": "67ead343-de74-4032-9682-d5b0ee831a7c",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "lose"
                              }
                          }
                      },
                      {
                          "tournamentCategoryIds": [
                              "25b0f044-9a01-42b5-b377-16accd14b5b3",
                              "5b5125b7-09a1-410d-9d5d-1b5196b1c01a"
                          ],
                          "firstName": "Данило",
                          "lastName": "Бобровський",
                          "weight": "75.4",
                          "id": "9f09a533-7670-4f0c-b07d-bc2b59c3c7dd",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "win"
                              }
                          }
                      },
                      {
                          "firstName": "Хаям",
                          "lastName": "Багіров",
                          "weight": "67.3",
                          "tournamentCategoryIds": [
                              "25b0f044-9a01-42b5-b377-16accd14b5b3",
                              "5b5125b7-09a1-410d-9d5d-1b5196b1c01a"
                          ],
                          "id": "cadd8fdc-9c0d-4be7-aee0-f26a70595ab5",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "lose"
                              }
                          }
                      },
                      {
                          "tournamentCategoryIds": [
                              "25b0f044-9a01-42b5-b377-16accd14b5b3",
                              "5b5125b7-09a1-410d-9d5d-1b5196b1c01a"
                          ],
                          "firstName": "В'ячеслав",
                          "lastName": "Грінченко",
                          "weight": "73.9",
                          "id": "cde29451-66c5-4af3-a5c3-0c453543e190",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "lose"
                              }
                          }
                      },
                      {
                          "tournamentCategoryIds": [
                              "25b0f044-9a01-42b5-b377-16accd14b5b3",
                              "5b5125b7-09a1-410d-9d5d-1b5196b1c01a"
                          ],
                          "firstName": "Олександр",
                          "lastName": "Циганій",
                          "weight": "73.6",
                          "id": "844d8167-2d7f-4f3e-9fd4-f89711edeafb",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "win"
                              }
                          }
                      }
                  ],
                  "groupB": []
              },
              "1": {
                  "groupA": [
                      {
                          "firstName": "Андрій",
                          "lastName": "Зуяков ",
                          "weight": "75.5",
                          "tournamentCategoryIds": [
                              "25b0f044-9a01-42b5-b377-16accd14b5b3",
                              "5b5125b7-09a1-410d-9d5d-1b5196b1c01a"
                          ],
                          "id": "4131dd33-9f0e-4623-8e95-d59fbbcb161f",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "win"
                              },
                              "1": {
                                  "result": "lose"
                              }
                          }
                      },
                      {
                          "firstName": "Ілля",
                          "lastName": "Мазніченко",
                          "weight": "68.3",
                          "tournamentCategoryIds": [
                              "25b0f044-9a01-42b5-b377-16accd14b5b3",
                              "5b5125b7-09a1-410d-9d5d-1b5196b1c01a"
                          ],
                          "id": "a04e619f-c5ac-48ba-baaa-2e3bfbcd3892",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "win"
                              },
                              "1": {
                                  "result": "win"
                              }
                          }
                      },
                      {
                          "firstName": "Олександр",
                          "lastName": "Біловол ",
                          "weight": "69.7",
                          "tournamentCategoryIds": [
                              "25b0f044-9a01-42b5-b377-16accd14b5b3",
                              "5b5125b7-09a1-410d-9d5d-1b5196b1c01a"
                          ],
                          "id": "460bb6d1-4f6b-4cf9-a174-98b7bad141ae",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "win"
                              },
                              "1": {
                                  "result": "lose"
                              }
                          }
                      },
                      {
                          "firstName": "Тимур",
                          "lastName": "Кувандіков",
                          "weight": "73.8",
                          "tournamentCategoryIds": [
                              "25b0f044-9a01-42b5-b377-16accd14b5b3",
                              "5b5125b7-09a1-410d-9d5d-1b5196b1c01a"
                          ],
                          "id": "f5daf1a7-3931-48db-b81c-987978799486",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "win"
                              },
                              "1": {
                                  "result": "win"
                              }
                          }
                      },
                      {
                          "tournamentCategoryIds": [
                              "25b0f044-9a01-42b5-b377-16accd14b5b3",
                              "5b5125b7-09a1-410d-9d5d-1b5196b1c01a"
                          ],
                          "firstName": "Данило",
                          "lastName": "Бобровський",
                          "weight": "75.4",
                          "id": "9f09a533-7670-4f0c-b07d-bc2b59c3c7dd",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "win"
                              },
                              "1": {
                                  "result": "lose"
                              }
                          }
                      },
                      {
                          "tournamentCategoryIds": [
                              "25b0f044-9a01-42b5-b377-16accd14b5b3",
                              "5b5125b7-09a1-410d-9d5d-1b5196b1c01a"
                          ],
                          "firstName": "Олександр",
                          "lastName": "Циганій",
                          "weight": "73.6",
                          "id": "844d8167-2d7f-4f3e-9fd4-f89711edeafb",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "win"
                              },
                              "1": {
                                  "result": "win"
                              }
                          }
                      }
                  ],
                  "groupB": [
                      {
                          "firstName": "Владислав",
                          "lastName": "Юрченко",
                          "weight": "73.5",
                          "tournamentCategoryIds": [
                              "25b0f044-9a01-42b5-b377-16accd14b5b3",
                              "5b5125b7-09a1-410d-9d5d-1b5196b1c01a"
                          ],
                          "id": "da1fdf6d-493e-4658-977f-95f55973ca0e",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "lose"
                              },
                              "1": {
                                  "result": "win"
                              }
                          }
                      },
                      {
                          "firstName": "Дмитро",
                          "lastName": "Рудич",
                          "weight": "69.4",
                          "tournamentCategoryIds": [
                              "25b0f044-9a01-42b5-b377-16accd14b5b3",
                              "5b5125b7-09a1-410d-9d5d-1b5196b1c01a"
                          ],
                          "id": "64c969d3-e0a2-4ff8-a32a-dc03a024b2c0",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "lose"
                              },
                              "1": {
                                  "result": "lose"
                              }
                          }
                      },
                      {
                          "firstName": "Артем",
                          "lastName": "Босенко",
                          "weight": "66.5",
                          "tournamentCategoryIds": [
                              "25b0f044-9a01-42b5-b377-16accd14b5b3",
                              "5b5125b7-09a1-410d-9d5d-1b5196b1c01a"
                          ],
                          "id": "b2116fd3-d857-4d8b-8adf-49e29ac9285b",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "lose"
                              },
                              "1": {
                                  "result": "lose"
                              }
                          }
                      },
                      {
                          "firstName": "Андрій",
                          "lastName": "Чукарин ",
                          "weight": "73.7",
                          "tournamentCategoryIds": [
                              "25b0f044-9a01-42b5-b377-16accd14b5b3",
                              "5b5125b7-09a1-410d-9d5d-1b5196b1c01a"
                          ],
                          "id": "67ead343-de74-4032-9682-d5b0ee831a7c",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "lose"
                              },
                              "1": {
                                  "result": "win"
                              }
                          }
                      },
                      {
                          "firstName": "Хаям",
                          "lastName": "Багіров",
                          "weight": "67.3",
                          "tournamentCategoryIds": [
                              "25b0f044-9a01-42b5-b377-16accd14b5b3",
                              "5b5125b7-09a1-410d-9d5d-1b5196b1c01a"
                          ],
                          "id": "cadd8fdc-9c0d-4be7-aee0-f26a70595ab5",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "lose"
                              },
                              "1": {
                                  "result": "lose"
                              }
                          }
                      },
                      {
                          "tournamentCategoryIds": [
                              "25b0f044-9a01-42b5-b377-16accd14b5b3",
                              "5b5125b7-09a1-410d-9d5d-1b5196b1c01a"
                          ],
                          "firstName": "В'ячеслав",
                          "lastName": "Грінченко",
                          "weight": "73.9",
                          "id": "cde29451-66c5-4af3-a5c3-0c453543e190",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "lose"
                              },
                              "1": {
                                  "result": "win"
                              }
                          }
                      }
                  ]
              },
              "2": {
                  "groupA": [
                      {
                          "firstName": "Ілля",
                          "lastName": "Мазніченко",
                          "weight": "68.3",
                          "tournamentCategoryIds": [
                              "25b0f044-9a01-42b5-b377-16accd14b5b3",
                              "5b5125b7-09a1-410d-9d5d-1b5196b1c01a"
                          ],
                          "id": "a04e619f-c5ac-48ba-baaa-2e3bfbcd3892",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "win"
                              },
                              "1": {
                                  "result": "win"
                              },
                              "2": {
                                  "result": "lose"
                              }
                          }
                      },
                      {
                          "firstName": "Тимур",
                          "lastName": "Кувандіков",
                          "weight": "73.8",
                          "tournamentCategoryIds": [
                              "25b0f044-9a01-42b5-b377-16accd14b5b3",
                              "5b5125b7-09a1-410d-9d5d-1b5196b1c01a"
                          ],
                          "id": "f5daf1a7-3931-48db-b81c-987978799486",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "win"
                              },
                              "1": {
                                  "result": "win"
                              },
                              "2": {
                                  "result": "win"
                              }
                          }
                      },
                      {
                          "tournamentCategoryIds": [
                              "25b0f044-9a01-42b5-b377-16accd14b5b3",
                              "5b5125b7-09a1-410d-9d5d-1b5196b1c01a"
                          ],
                          "firstName": "Олександр",
                          "lastName": "Циганій",
                          "weight": "73.6",
                          "id": "844d8167-2d7f-4f3e-9fd4-f89711edeafb",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "win"
                              },
                              "1": {
                                  "result": "win"
                              },
                              "2": {
                                  "result": "win"
                              }
                          }
                      }
                  ],
                  "groupB": [
                      {
                          "firstName": "Андрій",
                          "lastName": "Зуяков ",
                          "weight": "75.5",
                          "tournamentCategoryIds": [
                              "25b0f044-9a01-42b5-b377-16accd14b5b3",
                              "5b5125b7-09a1-410d-9d5d-1b5196b1c01a"
                          ],
                          "id": "4131dd33-9f0e-4623-8e95-d59fbbcb161f",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "win"
                              },
                              "1": {
                                  "result": "lose"
                              },
                              "2": {
                                  "result": "win"
                              }
                          }
                      },
                      {
                          "firstName": "Олександр",
                          "lastName": "Біловол ",
                          "weight": "69.7",
                          "tournamentCategoryIds": [
                              "25b0f044-9a01-42b5-b377-16accd14b5b3",
                              "5b5125b7-09a1-410d-9d5d-1b5196b1c01a"
                          ],
                          "id": "460bb6d1-4f6b-4cf9-a174-98b7bad141ae",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "win"
                              },
                              "1": {
                                  "result": "lose"
                              },
                              "2": {
                                  "result": "lose"
                              }
                          }
                      },
                      {
                          "tournamentCategoryIds": [
                              "25b0f044-9a01-42b5-b377-16accd14b5b3",
                              "5b5125b7-09a1-410d-9d5d-1b5196b1c01a"
                          ],
                          "firstName": "Данило",
                          "lastName": "Бобровський",
                          "weight": "75.4",
                          "id": "9f09a533-7670-4f0c-b07d-bc2b59c3c7dd",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "win"
                              },
                              "1": {
                                  "result": "lose"
                              },
                              "2": {
                                  "result": "lose"
                              }
                          }
                      },
                      {
                          "firstName": "Владислав",
                          "lastName": "Юрченко",
                          "weight": "73.5",
                          "tournamentCategoryIds": [
                              "25b0f044-9a01-42b5-b377-16accd14b5b3",
                              "5b5125b7-09a1-410d-9d5d-1b5196b1c01a"
                          ],
                          "id": "da1fdf6d-493e-4658-977f-95f55973ca0e",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "lose"
                              },
                              "1": {
                                  "result": "win"
                              },
                              "2": {
                                  "result": "win"
                              }
                          }
                      },
                      {
                          "firstName": "Андрій",
                          "lastName": "Чукарин ",
                          "weight": "73.7",
                          "tournamentCategoryIds": [
                              "25b0f044-9a01-42b5-b377-16accd14b5b3",
                              "5b5125b7-09a1-410d-9d5d-1b5196b1c01a"
                          ],
                          "id": "67ead343-de74-4032-9682-d5b0ee831a7c",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "lose"
                              },
                              "1": {
                                  "result": "win"
                              },
                              "2": {
                                  "result": "win"
                              }
                          }
                      },
                      {
                          "tournamentCategoryIds": [
                              "25b0f044-9a01-42b5-b377-16accd14b5b3",
                              "5b5125b7-09a1-410d-9d5d-1b5196b1c01a"
                          ],
                          "firstName": "В'ячеслав",
                          "lastName": "Грінченко",
                          "weight": "73.9",
                          "id": "cde29451-66c5-4af3-a5c3-0c453543e190",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "lose"
                              },
                              "1": {
                                  "result": "win"
                              },
                              "2": {
                                  "result": "lose"
                              }
                          }
                      }
                  ]
              },
              "3": {
                  "groupA": [
                      {
                          "tournamentCategoryIds": [
                              "25b0f044-9a01-42b5-b377-16accd14b5b3",
                              "5b5125b7-09a1-410d-9d5d-1b5196b1c01a"
                          ],
                          "firstName": "Олександр",
                          "lastName": "Циганій",
                          "weight": "73.6",
                          "id": "844d8167-2d7f-4f3e-9fd4-f89711edeafb",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "win"
                              },
                              "1": {
                                  "result": "win"
                              },
                              "2": {
                                  "result": "win"
                              },
                              "3": {
                                  "result": "lose"
                              }
                          }
                      },
                      {
                          "firstName": "Тимур",
                          "lastName": "Кувандіков",
                          "weight": "73.8",
                          "tournamentCategoryIds": [
                              "25b0f044-9a01-42b5-b377-16accd14b5b3",
                              "5b5125b7-09a1-410d-9d5d-1b5196b1c01a"
                          ],
                          "id": "f5daf1a7-3931-48db-b81c-987978799486",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "win"
                              },
                              "1": {
                                  "result": "win"
                              },
                              "2": {
                                  "result": "win"
                              },
                              "3": {
                                  "result": "win"
                              }
                          }
                      }
                  ],
                  "groupB": [
                      {
                          "firstName": "Ілля",
                          "lastName": "Мазніченко",
                          "weight": "68.3",
                          "tournamentCategoryIds": [
                              "25b0f044-9a01-42b5-b377-16accd14b5b3",
                              "5b5125b7-09a1-410d-9d5d-1b5196b1c01a"
                          ],
                          "id": "a04e619f-c5ac-48ba-baaa-2e3bfbcd3892",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "win"
                              },
                              "1": {
                                  "result": "win"
                              },
                              "2": {
                                  "result": "lose"
                              },
                              "3": {
                                  "result": "win"
                              }
                          }
                      },
                      {
                          "firstName": "Андрій",
                          "lastName": "Зуяков ",
                          "weight": "75.5",
                          "tournamentCategoryIds": [
                              "25b0f044-9a01-42b5-b377-16accd14b5b3",
                              "5b5125b7-09a1-410d-9d5d-1b5196b1c01a"
                          ],
                          "id": "4131dd33-9f0e-4623-8e95-d59fbbcb161f",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "win"
                              },
                              "1": {
                                  "result": "lose"
                              },
                              "2": {
                                  "result": "win"
                              },
                              "3": {
                                  "result": "lose"
                              }
                          }
                      },
                      {
                          "firstName": "Владислав",
                          "lastName": "Юрченко",
                          "weight": "73.5",
                          "tournamentCategoryIds": [
                              "25b0f044-9a01-42b5-b377-16accd14b5b3",
                              "5b5125b7-09a1-410d-9d5d-1b5196b1c01a"
                          ],
                          "id": "da1fdf6d-493e-4658-977f-95f55973ca0e",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "lose"
                              },
                              "1": {
                                  "result": "win"
                              },
                              "2": {
                                  "result": "win"
                              },
                              "3": {
                                  "result": "win"
                              }
                          }
                      },
                      {
                          "firstName": "Андрій",
                          "lastName": "Чукарин ",
                          "weight": "73.7",
                          "tournamentCategoryIds": [
                              "25b0f044-9a01-42b5-b377-16accd14b5b3",
                              "5b5125b7-09a1-410d-9d5d-1b5196b1c01a"
                          ],
                          "id": "67ead343-de74-4032-9682-d5b0ee831a7c",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "lose"
                              },
                              "1": {
                                  "result": "win"
                              },
                              "2": {
                                  "result": "win"
                              },
                              "3": {
                                  "result": "lose"
                              }
                          }
                      }
                  ]
              },
              "4": {
                  "groupA": [
                      {
                          "firstName": "Тимур",
                          "lastName": "Кувандіков",
                          "weight": "73.8",
                          "tournamentCategoryIds": [
                              "25b0f044-9a01-42b5-b377-16accd14b5b3",
                              "5b5125b7-09a1-410d-9d5d-1b5196b1c01a"
                          ],
                          "id": "f5daf1a7-3931-48db-b81c-987978799486",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "win"
                              },
                              "1": {
                                  "result": "win"
                              },
                              "2": {
                                  "result": "win"
                              },
                              "3": {
                                  "result": "win"
                              },
                              "4": {
                                  "result": "win"
                              }
                          }
                      }
                  ],
                  "groupB": [
                      {
                          "tournamentCategoryIds": [
                              "25b0f044-9a01-42b5-b377-16accd14b5b3",
                              "5b5125b7-09a1-410d-9d5d-1b5196b1c01a"
                          ],
                          "firstName": "Олександр",
                          "lastName": "Циганій",
                          "weight": "73.6",
                          "id": "844d8167-2d7f-4f3e-9fd4-f89711edeafb",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "win"
                              },
                              "1": {
                                  "result": "win"
                              },
                              "2": {
                                  "result": "win"
                              },
                              "3": {
                                  "result": "lose"
                              },
                              "4": {
                                  "result": "lose"
                              }
                          }
                      },
                      {
                          "firstName": "Ілля",
                          "lastName": "Мазніченко",
                          "weight": "68.3",
                          "tournamentCategoryIds": [
                              "25b0f044-9a01-42b5-b377-16accd14b5b3",
                              "5b5125b7-09a1-410d-9d5d-1b5196b1c01a"
                          ],
                          "id": "a04e619f-c5ac-48ba-baaa-2e3bfbcd3892",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "win"
                              },
                              "1": {
                                  "result": "win"
                              },
                              "2": {
                                  "result": "lose"
                              },
                              "3": {
                                  "result": "win"
                              },
                              "4": {
                                  "result": "win"
                              }
                          }
                      },
                      {
                          "firstName": "Владислав",
                          "lastName": "Юрченко",
                          "weight": "73.5",
                          "tournamentCategoryIds": [
                              "25b0f044-9a01-42b5-b377-16accd14b5b3",
                              "5b5125b7-09a1-410d-9d5d-1b5196b1c01a"
                          ],
                          "id": "da1fdf6d-493e-4658-977f-95f55973ca0e",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "lose"
                              },
                              "1": {
                                  "result": "win"
                              },
                              "2": {
                                  "result": "win"
                              },
                              "3": {
                                  "result": "win"
                              },
                              "4": {
                                  "result": "win"
                              }
                          }
                      }
                  ]
              },
              "5": {
                  "groupA": [
                      {
                          "firstName": "Тимур",
                          "lastName": "Кувандіков",
                          "weight": "73.8",
                          "tournamentCategoryIds": [
                              "25b0f044-9a01-42b5-b377-16accd14b5b3",
                              "5b5125b7-09a1-410d-9d5d-1b5196b1c01a"
                          ],
                          "id": "f5daf1a7-3931-48db-b81c-987978799486",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "win"
                              },
                              "1": {
                                  "result": "win"
                              },
                              "2": {
                                  "result": "win"
                              },
                              "3": {
                                  "result": "win"
                              },
                              "4": {
                                  "result": "win"
                              },
                              "5": {
                                  "result": "win"
                              }
                          }
                      }
                  ],
                  "groupB": [
                      {
                          "firstName": "Владислав",
                          "lastName": "Юрченко",
                          "weight": "73.5",
                          "tournamentCategoryIds": [
                              "25b0f044-9a01-42b5-b377-16accd14b5b3",
                              "5b5125b7-09a1-410d-9d5d-1b5196b1c01a"
                          ],
                          "id": "da1fdf6d-493e-4658-977f-95f55973ca0e",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "lose"
                              },
                              "1": {
                                  "result": "win"
                              },
                              "2": {
                                  "result": "win"
                              },
                              "3": {
                                  "result": "win"
                              },
                              "4": {
                                  "result": "win"
                              },
                              "5": {
                                  "result": "win"
                              }
                          }
                      },
                      {
                          "firstName": "Ілля",
                          "lastName": "Мазніченко",
                          "weight": "68.3",
                          "tournamentCategoryIds": [
                              "25b0f044-9a01-42b5-b377-16accd14b5b3",
                              "5b5125b7-09a1-410d-9d5d-1b5196b1c01a"
                          ],
                          "id": "a04e619f-c5ac-48ba-baaa-2e3bfbcd3892",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "win"
                              },
                              "1": {
                                  "result": "win"
                              },
                              "2": {
                                  "result": "lose"
                              },
                              "3": {
                                  "result": "win"
                              },
                              "4": {
                                  "result": "win"
                              },
                              "5": {
                                  "result": "lose"
                              }
                          }
                      }
                  ]
              },
              "6": {
                  "groupA": [
                      {
                          "firstName": "Тимур",
                          "lastName": "Кувандіков",
                          "weight": "73.8",
                          "tournamentCategoryIds": [
                              "25b0f044-9a01-42b5-b377-16accd14b5b3",
                              "5b5125b7-09a1-410d-9d5d-1b5196b1c01a"
                          ],
                          "id": "f5daf1a7-3931-48db-b81c-987978799486",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "win"
                              },
                              "1": {
                                  "result": "win"
                              },
                              "2": {
                                  "result": "win"
                              },
                              "3": {
                                  "result": "win"
                              },
                              "4": {
                                  "result": "win"
                              },
                              "5": {
                                  "result": "win"
                              },
                              "6": {
                                  "result": "win"
                              }
                          }
                      },
                      {
                          "firstName": "Владислав",
                          "lastName": "Юрченко",
                          "weight": "73.5",
                          "tournamentCategoryIds": [
                              "25b0f044-9a01-42b5-b377-16accd14b5b3",
                              "5b5125b7-09a1-410d-9d5d-1b5196b1c01a"
                          ],
                          "id": "da1fdf6d-493e-4658-977f-95f55973ca0e",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "lose"
                              },
                              "1": {
                                  "result": "win"
                              },
                              "2": {
                                  "result": "win"
                              },
                              "3": {
                                  "result": "win"
                              },
                              "4": {
                                  "result": "win"
                              },
                              "5": {
                                  "result": "win"
                              },
                              "6": {
                                  "result": "lose"
                              }
                          }
                      }
                  ],
                  "groupB": []
              }
          },
          "selectedRound": 6
      },
      "1": {
          "category": "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8",
          "state": "finished",
          "rounds": {
              "0": {
                  "groupA": [
                      {
                          "tournamentCategoryIds": [
                              "7300f941-113a-4567-a9a2-5e633b555dca",
                              "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
                          ],
                          "firstName": "Гліб",
                          "lastName": "Кривоносов",
                          "weight": "97.2",
                          "id": "2c513f1a-8f98-4dc2-b83a-a7c48f86c0e6",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "lose"
                              }
                          }
                      },
                      {
                          "firstName": "Богдан",
                          "lastName": "Зуяков ",
                          "weight": "103.3",
                          "tournamentCategoryIds": [
                              "7300f941-113a-4567-a9a2-5e633b555dca",
                              "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
                          ],
                          "id": "355337a7-e112-4f73-8e27-2d89a9b5d39b",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "win"
                              }
                          }
                      },
                      {
                          "tournamentCategoryIds": [
                              "7300f941-113a-4567-a9a2-5e633b555dca",
                              "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
                          ],
                          "firstName": "Михайло",
                          "lastName": "Шевченко",
                          "weight": "150",
                          "id": "0969a1bb-b05e-4c3f-a9e3-33fda9b16d37",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "lose"
                              }
                          }
                      },
                      {
                          "firstName": "Олександр",
                          "lastName": "Власов",
                          "weight": "122.3",
                          "tournamentCategoryIds": [
                              "7300f941-113a-4567-a9a2-5e633b555dca",
                              "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
                          ],
                          "id": "12747830-f88c-493a-a16d-5c5f8baea9d0",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "win"
                              }
                          }
                      },
                      {
                          "tournamentCategoryIds": [
                              "7300f941-113a-4567-a9a2-5e633b555dca",
                              "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
                          ],
                          "firstName": "Станіслав",
                          "lastName": "Гулий",
                          "weight": "105.7",
                          "id": "fb756e7c-4c21-4060-9ddd-1a8e9e698e30",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "lose"
                              }
                          }
                      },
                      {
                          "firstName": "Іван",
                          "lastName": "Спесивцев ",
                          "weight": "110",
                          "tournamentCategoryIds": [
                              "7300f941-113a-4567-a9a2-5e633b555dca",
                              "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
                          ],
                          "id": "84f1a6d9-fecd-4bcb-ab78-1b1649449c7f",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "win"
                              }
                          }
                      },
                      {
                          "tournamentCategoryIds": [
                              "7300f941-113a-4567-a9a2-5e633b555dca",
                              "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
                          ],
                          "firstName": "Юрій",
                          "lastName": "Маляр",
                          "weight": "106.5",
                          "id": "20c08a4d-36e4-4960-a46a-74964621915f",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "lose"
                              }
                          }
                      },
                      {
                          "firstName": "Андрій",
                          "lastName": "Толбатов",
                          "weight": "95.3",
                          "tournamentCategoryIds": [
                              "179b369a-9fe2-4c0a-a1bb-5ce5ff16c8c9",
                              "a69cd04d-5492-42e4-9c2b-dc991a9e3d15",
                              "7300f941-113a-4567-a9a2-5e633b555dca",
                              "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
                          ],
                          "id": "d3b8ae2c-3258-40ce-8990-6b3478a9f03a",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "win"
                              }
                          }
                      },
                      {
                          "firstName": "Артем",
                          "lastName": "Попов",
                          "weight": "87.5",
                          "tournamentCategoryIds": [
                              "7300f941-113a-4567-a9a2-5e633b555dca",
                              "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
                          ],
                          "id": "b5ea0ff3-edb6-434d-9ed6-6576da0a0eaa",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "win"
                              }
                          }
                      },
                      {
                          "tournamentCategoryIds": [
                              "7300f941-113a-4567-a9a2-5e633b555dca",
                              "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
                          ],
                          "firstName": "Олександр",
                          "lastName": "Картишкін",
                          "weight": "102",
                          "id": "ed6e2d81-2ff6-436c-84a3-c7678daa63da",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "lose"
                              }
                          }
                      },
                      {
                          "tournamentCategoryIds": [
                              "179b369a-9fe2-4c0a-a1bb-5ce5ff16c8c9",
                              "a69cd04d-5492-42e4-9c2b-dc991a9e3d15",
                              "7300f941-113a-4567-a9a2-5e633b555dca",
                              "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
                          ],
                          "firstName": "Ігор",
                          "lastName": "Окара",
                          "weight": "95.2",
                          "id": "b0e84cc7-5e56-4092-b591-bf6be8701345",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "lose"
                              }
                          }
                      },
                      {
                          "tournamentCategoryIds": [
                              "7300f941-113a-4567-a9a2-5e633b555dca",
                              "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
                          ],
                          "firstName": "Дмитро",
                          "lastName": "Єрохін",
                          "weight": "105",
                          "id": "2a438433-61eb-4a50-8ca4-bbf535bffb74",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "win"
                              }
                          }
                      },
                      {
                          "tournamentCategoryIds": [
                              "7300f941-113a-4567-a9a2-5e633b555dca",
                              "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
                          ],
                          "firstName": "Володимир",
                          "lastName": "Кривобок",
                          "weight": "154",
                          "id": "329dba25-a265-4e6c-b48c-dbdc2cf1b161",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "lose"
                              }
                          }
                      },
                      {
                          "firstName": "Олег",
                          "lastName": "Гаврелець",
                          "weight": "104.8",
                          "tournamentCategoryIds": [
                              "7300f941-113a-4567-a9a2-5e633b555dca",
                              "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
                          ],
                          "id": "35a069c0-2414-46c3-8001-65d81b38be10",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "win"
                              }
                          }
                      },
                      {
                          "firstName": "Костянтин",
                          "lastName": "Брехов",
                          "weight": "109.6",
                          "tournamentCategoryIds": [
                              "7300f941-113a-4567-a9a2-5e633b555dca",
                              "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
                          ],
                          "id": "2f64c9d9-99ce-4dee-bdbc-9605f6535807",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "win"
                              }
                          }
                      },
                      {
                          "tournamentCategoryIds": [
                              "7300f941-113a-4567-a9a2-5e633b555dca",
                              "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
                          ],
                          "firstName": "Олександр",
                          "lastName": "Скрипник",
                          "weight": "110.3",
                          "id": "059c1bcb-4897-48c1-9298-a84b54a239b1",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "lose"
                              }
                          }
                      }
                  ],
                  "groupB": []
              },
              "1": {
                  "groupA": [
                      {
                          "firstName": "Богдан",
                          "lastName": "Зуяков ",
                          "weight": "103.3",
                          "tournamentCategoryIds": [
                              "7300f941-113a-4567-a9a2-5e633b555dca",
                              "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
                          ],
                          "id": "355337a7-e112-4f73-8e27-2d89a9b5d39b",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "win"
                              },
                              "1": {
                                  "result": "win"
                              }
                          }
                      },
                      {
                          "firstName": "Олександр",
                          "lastName": "Власов",
                          "weight": "122.3",
                          "tournamentCategoryIds": [
                              "7300f941-113a-4567-a9a2-5e633b555dca",
                              "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
                          ],
                          "id": "12747830-f88c-493a-a16d-5c5f8baea9d0",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "win"
                              },
                              "1": {
                                  "result": "lose"
                              }
                          }
                      },
                      {
                          "firstName": "Іван",
                          "lastName": "Спесивцев ",
                          "weight": "110",
                          "tournamentCategoryIds": [
                              "7300f941-113a-4567-a9a2-5e633b555dca",
                              "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
                          ],
                          "id": "84f1a6d9-fecd-4bcb-ab78-1b1649449c7f",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "win"
                              },
                              "1": {
                                  "result": "win"
                              }
                          }
                      },
                      {
                          "firstName": "Андрій",
                          "lastName": "Толбатов",
                          "weight": "95.3",
                          "tournamentCategoryIds": [
                              "179b369a-9fe2-4c0a-a1bb-5ce5ff16c8c9",
                              "a69cd04d-5492-42e4-9c2b-dc991a9e3d15",
                              "7300f941-113a-4567-a9a2-5e633b555dca",
                              "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
                          ],
                          "id": "d3b8ae2c-3258-40ce-8990-6b3478a9f03a",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "win"
                              },
                              "1": {
                                  "result": "lose"
                              }
                          }
                      },
                      {
                          "firstName": "Артем",
                          "lastName": "Попов",
                          "weight": "87.5",
                          "tournamentCategoryIds": [
                              "7300f941-113a-4567-a9a2-5e633b555dca",
                              "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
                          ],
                          "id": "b5ea0ff3-edb6-434d-9ed6-6576da0a0eaa",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "win"
                              },
                              "1": {
                                  "result": "lose"
                              }
                          }
                      },
                      {
                          "tournamentCategoryIds": [
                              "7300f941-113a-4567-a9a2-5e633b555dca",
                              "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
                          ],
                          "firstName": "Дмитро",
                          "lastName": "Єрохін",
                          "weight": "105",
                          "id": "2a438433-61eb-4a50-8ca4-bbf535bffb74",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "win"
                              },
                              "1": {
                                  "result": "win"
                              }
                          }
                      },
                      {
                          "firstName": "Олег",
                          "lastName": "Гаврелець",
                          "weight": "104.8",
                          "tournamentCategoryIds": [
                              "7300f941-113a-4567-a9a2-5e633b555dca",
                              "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
                          ],
                          "id": "35a069c0-2414-46c3-8001-65d81b38be10",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "win"
                              },
                              "1": {
                                  "result": "win"
                              }
                          }
                      },
                      {
                          "firstName": "Костянтин",
                          "lastName": "Брехов",
                          "weight": "109.6",
                          "tournamentCategoryIds": [
                              "7300f941-113a-4567-a9a2-5e633b555dca",
                              "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
                          ],
                          "id": "2f64c9d9-99ce-4dee-bdbc-9605f6535807",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "win"
                              },
                              "1": {
                                  "result": "lose"
                              }
                          }
                      }
                  ],
                  "groupB": [
                      {
                          "tournamentCategoryIds": [
                              "7300f941-113a-4567-a9a2-5e633b555dca",
                              "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
                          ],
                          "firstName": "Гліб",
                          "lastName": "Кривоносов",
                          "weight": "97.2",
                          "id": "2c513f1a-8f98-4dc2-b83a-a7c48f86c0e6",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "lose"
                              },
                              "1": {
                                  "result": "lose"
                              }
                          }
                      },
                      {
                          "tournamentCategoryIds": [
                              "7300f941-113a-4567-a9a2-5e633b555dca",
                              "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
                          ],
                          "firstName": "Михайло",
                          "lastName": "Шевченко",
                          "weight": "150",
                          "id": "0969a1bb-b05e-4c3f-a9e3-33fda9b16d37",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "lose"
                              },
                              "1": {
                                  "result": "win"
                              }
                          }
                      },
                      {
                          "tournamentCategoryIds": [
                              "7300f941-113a-4567-a9a2-5e633b555dca",
                              "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
                          ],
                          "firstName": "Станіслав",
                          "lastName": "Гулий",
                          "weight": "105.7",
                          "id": "fb756e7c-4c21-4060-9ddd-1a8e9e698e30",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "lose"
                              },
                              "1": {
                                  "result": "win"
                              }
                          }
                      },
                      {
                          "tournamentCategoryIds": [
                              "7300f941-113a-4567-a9a2-5e633b555dca",
                              "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
                          ],
                          "firstName": "Юрій",
                          "lastName": "Маляр",
                          "weight": "106.5",
                          "id": "20c08a4d-36e4-4960-a46a-74964621915f",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "lose"
                              },
                              "1": {
                                  "result": "lose"
                              }
                          }
                      },
                      {
                          "tournamentCategoryIds": [
                              "7300f941-113a-4567-a9a2-5e633b555dca",
                              "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
                          ],
                          "firstName": "Олександр",
                          "lastName": "Картишкін",
                          "weight": "102",
                          "id": "ed6e2d81-2ff6-436c-84a3-c7678daa63da",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "lose"
                              },
                              "1": {
                                  "result": "win"
                              }
                          }
                      },
                      {
                          "tournamentCategoryIds": [
                              "179b369a-9fe2-4c0a-a1bb-5ce5ff16c8c9",
                              "a69cd04d-5492-42e4-9c2b-dc991a9e3d15",
                              "7300f941-113a-4567-a9a2-5e633b555dca",
                              "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
                          ],
                          "firstName": "Ігор",
                          "lastName": "Окара",
                          "weight": "95.2",
                          "id": "b0e84cc7-5e56-4092-b591-bf6be8701345",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "lose"
                              },
                              "1": {
                                  "result": "lose"
                              }
                          }
                      },
                      {
                          "tournamentCategoryIds": [
                              "7300f941-113a-4567-a9a2-5e633b555dca",
                              "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
                          ],
                          "firstName": "Володимир",
                          "lastName": "Кривобок",
                          "weight": "154",
                          "id": "329dba25-a265-4e6c-b48c-dbdc2cf1b161",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "lose"
                              },
                              "1": {
                                  "result": "lose"
                              }
                          }
                      },
                      {
                          "tournamentCategoryIds": [
                              "7300f941-113a-4567-a9a2-5e633b555dca",
                              "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
                          ],
                          "firstName": "Олександр",
                          "lastName": "Скрипник",
                          "weight": "110.3",
                          "id": "059c1bcb-4897-48c1-9298-a84b54a239b1",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "lose"
                              },
                              "1": {
                                  "result": "win"
                              }
                          }
                      }
                  ]
              },
              "2": {
                  "groupA": [
                      {
                          "firstName": "Богдан",
                          "lastName": "Зуяков ",
                          "weight": "103.3",
                          "tournamentCategoryIds": [
                              "7300f941-113a-4567-a9a2-5e633b555dca",
                              "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
                          ],
                          "id": "355337a7-e112-4f73-8e27-2d89a9b5d39b",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "win"
                              },
                              "1": {
                                  "result": "win"
                              },
                              "2": {
                                  "result": "win"
                              }
                          }
                      },
                      {
                          "firstName": "Іван",
                          "lastName": "Спесивцев ",
                          "weight": "110",
                          "tournamentCategoryIds": [
                              "7300f941-113a-4567-a9a2-5e633b555dca",
                              "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
                          ],
                          "id": "84f1a6d9-fecd-4bcb-ab78-1b1649449c7f",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "win"
                              },
                              "1": {
                                  "result": "win"
                              },
                              "2": {
                                  "result": "lose"
                              }
                          }
                      },
                      {
                          "tournamentCategoryIds": [
                              "7300f941-113a-4567-a9a2-5e633b555dca",
                              "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
                          ],
                          "firstName": "Дмитро",
                          "lastName": "Єрохін",
                          "weight": "105",
                          "id": "2a438433-61eb-4a50-8ca4-bbf535bffb74",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "win"
                              },
                              "1": {
                                  "result": "win"
                              },
                              "2": {
                                  "result": "win"
                              }
                          }
                      },
                      {
                          "firstName": "Олег",
                          "lastName": "Гаврелець",
                          "weight": "104.8",
                          "tournamentCategoryIds": [
                              "7300f941-113a-4567-a9a2-5e633b555dca",
                              "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
                          ],
                          "id": "35a069c0-2414-46c3-8001-65d81b38be10",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "win"
                              },
                              "1": {
                                  "result": "win"
                              },
                              "2": {
                                  "result": "lose"
                              }
                          }
                      }
                  ],
                  "groupB": [
                      {
                          "firstName": "Олександр",
                          "lastName": "Власов",
                          "weight": "122.3",
                          "tournamentCategoryIds": [
                              "7300f941-113a-4567-a9a2-5e633b555dca",
                              "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
                          ],
                          "id": "12747830-f88c-493a-a16d-5c5f8baea9d0",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "win"
                              },
                              "1": {
                                  "result": "lose"
                              },
                              "2": {
                                  "result": "win"
                              }
                          }
                      },
                      {
                          "firstName": "Андрій",
                          "lastName": "Толбатов",
                          "weight": "95.3",
                          "tournamentCategoryIds": [
                              "179b369a-9fe2-4c0a-a1bb-5ce5ff16c8c9",
                              "a69cd04d-5492-42e4-9c2b-dc991a9e3d15",
                              "7300f941-113a-4567-a9a2-5e633b555dca",
                              "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
                          ],
                          "id": "d3b8ae2c-3258-40ce-8990-6b3478a9f03a",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "win"
                              },
                              "1": {
                                  "result": "lose"
                              },
                              "2": {
                                  "result": "lose"
                              }
                          }
                      },
                      {
                          "firstName": "Артем",
                          "lastName": "Попов",
                          "weight": "87.5",
                          "tournamentCategoryIds": [
                              "7300f941-113a-4567-a9a2-5e633b555dca",
                              "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
                          ],
                          "id": "b5ea0ff3-edb6-434d-9ed6-6576da0a0eaa",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "win"
                              },
                              "1": {
                                  "result": "lose"
                              },
                              "2": {
                                  "result": "win"
                              }
                          }
                      },
                      {
                          "firstName": "Костянтин",
                          "lastName": "Брехов",
                          "weight": "109.6",
                          "tournamentCategoryIds": [
                              "7300f941-113a-4567-a9a2-5e633b555dca",
                              "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
                          ],
                          "id": "2f64c9d9-99ce-4dee-bdbc-9605f6535807",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "win"
                              },
                              "1": {
                                  "result": "lose"
                              },
                              "2": {
                                  "result": "lose"
                              }
                          }
                      },
                      {
                          "tournamentCategoryIds": [
                              "7300f941-113a-4567-a9a2-5e633b555dca",
                              "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
                          ],
                          "firstName": "Михайло",
                          "lastName": "Шевченко",
                          "weight": "150",
                          "id": "0969a1bb-b05e-4c3f-a9e3-33fda9b16d37",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "lose"
                              },
                              "1": {
                                  "result": "win"
                              },
                              "2": {
                                  "result": "win"
                              }
                          }
                      },
                      {
                          "tournamentCategoryIds": [
                              "7300f941-113a-4567-a9a2-5e633b555dca",
                              "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
                          ],
                          "firstName": "Станіслав",
                          "lastName": "Гулий",
                          "weight": "105.7",
                          "id": "fb756e7c-4c21-4060-9ddd-1a8e9e698e30",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "lose"
                              },
                              "1": {
                                  "result": "win"
                              },
                              "2": {
                                  "result": "lose"
                              }
                          }
                      },
                      {
                          "tournamentCategoryIds": [
                              "7300f941-113a-4567-a9a2-5e633b555dca",
                              "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
                          ],
                          "firstName": "Олександр",
                          "lastName": "Картишкін",
                          "weight": "102",
                          "id": "ed6e2d81-2ff6-436c-84a3-c7678daa63da",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "lose"
                              },
                              "1": {
                                  "result": "win"
                              },
                              "2": {
                                  "result": "win"
                              }
                          }
                      },
                      {
                          "tournamentCategoryIds": [
                              "7300f941-113a-4567-a9a2-5e633b555dca",
                              "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
                          ],
                          "firstName": "Олександр",
                          "lastName": "Скрипник",
                          "weight": "110.3",
                          "id": "059c1bcb-4897-48c1-9298-a84b54a239b1",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "lose"
                              },
                              "1": {
                                  "result": "win"
                              },
                              "2": {
                                  "result": "lose"
                              }
                          }
                      }
                  ]
              },
              "3": {
                  "groupA": [
                      {
                          "firstName": "Богдан",
                          "lastName": "Зуяков ",
                          "weight": "103.3",
                          "tournamentCategoryIds": [
                              "7300f941-113a-4567-a9a2-5e633b555dca",
                              "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
                          ],
                          "id": "355337a7-e112-4f73-8e27-2d89a9b5d39b",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "win"
                              },
                              "1": {
                                  "result": "win"
                              },
                              "2": {
                                  "result": "win"
                              },
                              "3": {
                                  "result": "win"
                              }
                          }
                      },
                      {
                          "tournamentCategoryIds": [
                              "7300f941-113a-4567-a9a2-5e633b555dca",
                              "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
                          ],
                          "firstName": "Дмитро",
                          "lastName": "Єрохін",
                          "weight": "105",
                          "id": "2a438433-61eb-4a50-8ca4-bbf535bffb74",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "win"
                              },
                              "1": {
                                  "result": "win"
                              },
                              "2": {
                                  "result": "win"
                              },
                              "3": {
                                  "result": "lose"
                              }
                          }
                      }
                  ],
                  "groupB": [
                      {
                          "firstName": "Іван",
                          "lastName": "Спесивцев ",
                          "weight": "110",
                          "tournamentCategoryIds": [
                              "7300f941-113a-4567-a9a2-5e633b555dca",
                              "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
                          ],
                          "id": "84f1a6d9-fecd-4bcb-ab78-1b1649449c7f",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "win"
                              },
                              "1": {
                                  "result": "win"
                              },
                              "2": {
                                  "result": "lose"
                              },
                              "3": {
                                  "result": "lose"
                              }
                          }
                      },
                      {
                          "firstName": "Олег",
                          "lastName": "Гаврелець",
                          "weight": "104.8",
                          "tournamentCategoryIds": [
                              "7300f941-113a-4567-a9a2-5e633b555dca",
                              "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
                          ],
                          "id": "35a069c0-2414-46c3-8001-65d81b38be10",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "win"
                              },
                              "1": {
                                  "result": "win"
                              },
                              "2": {
                                  "result": "lose"
                              },
                              "3": {
                                  "result": "win"
                              }
                          }
                      },
                      {
                          "firstName": "Олександр",
                          "lastName": "Власов",
                          "weight": "122.3",
                          "tournamentCategoryIds": [
                              "7300f941-113a-4567-a9a2-5e633b555dca",
                              "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
                          ],
                          "id": "12747830-f88c-493a-a16d-5c5f8baea9d0",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "win"
                              },
                              "1": {
                                  "result": "lose"
                              },
                              "2": {
                                  "result": "win"
                              },
                              "3": {
                                  "result": "win"
                              }
                          }
                      },
                      {
                          "firstName": "Артем",
                          "lastName": "Попов",
                          "weight": "87.5",
                          "tournamentCategoryIds": [
                              "7300f941-113a-4567-a9a2-5e633b555dca",
                              "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
                          ],
                          "id": "b5ea0ff3-edb6-434d-9ed6-6576da0a0eaa",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "win"
                              },
                              "1": {
                                  "result": "lose"
                              },
                              "2": {
                                  "result": "win"
                              },
                              "3": {
                                  "result": "lose"
                              }
                          }
                      },
                      {
                          "tournamentCategoryIds": [
                              "7300f941-113a-4567-a9a2-5e633b555dca",
                              "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
                          ],
                          "firstName": "Михайло",
                          "lastName": "Шевченко",
                          "weight": "150",
                          "id": "0969a1bb-b05e-4c3f-a9e3-33fda9b16d37",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "lose"
                              },
                              "1": {
                                  "result": "win"
                              },
                              "2": {
                                  "result": "win"
                              },
                              "3": {
                                  "result": "win"
                              }
                          }
                      },
                      {
                          "tournamentCategoryIds": [
                              "7300f941-113a-4567-a9a2-5e633b555dca",
                              "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
                          ],
                          "firstName": "Олександр",
                          "lastName": "Картишкін",
                          "weight": "102",
                          "id": "ed6e2d81-2ff6-436c-84a3-c7678daa63da",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "lose"
                              },
                              "1": {
                                  "result": "win"
                              },
                              "2": {
                                  "result": "win"
                              },
                              "3": {
                                  "result": "lose"
                              }
                          }
                      }
                  ]
              },
              "4": {
                  "groupA": [
                      {
                          "firstName": "Богдан",
                          "lastName": "Зуяков ",
                          "weight": "103.3",
                          "tournamentCategoryIds": [
                              "7300f941-113a-4567-a9a2-5e633b555dca",
                              "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
                          ],
                          "id": "355337a7-e112-4f73-8e27-2d89a9b5d39b",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "win"
                              },
                              "1": {
                                  "result": "win"
                              },
                              "2": {
                                  "result": "win"
                              },
                              "3": {
                                  "result": "win"
                              },
                              "4": {
                                  "result": "win"
                              }
                          }
                      }
                  ],
                  "groupB": [
                      {
                          "tournamentCategoryIds": [
                              "7300f941-113a-4567-a9a2-5e633b555dca",
                              "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
                          ],
                          "firstName": "Дмитро",
                          "lastName": "Єрохін",
                          "weight": "105",
                          "id": "2a438433-61eb-4a50-8ca4-bbf535bffb74",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "win"
                              },
                              "1": {
                                  "result": "win"
                              },
                              "2": {
                                  "result": "win"
                              },
                              "3": {
                                  "result": "lose"
                              },
                              "4": {
                                  "result": "lose"
                              }
                          }
                      },
                      {
                          "firstName": "Олег",
                          "lastName": "Гаврелець",
                          "weight": "104.8",
                          "tournamentCategoryIds": [
                              "7300f941-113a-4567-a9a2-5e633b555dca",
                              "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
                          ],
                          "id": "35a069c0-2414-46c3-8001-65d81b38be10",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "win"
                              },
                              "1": {
                                  "result": "win"
                              },
                              "2": {
                                  "result": "lose"
                              },
                              "3": {
                                  "result": "win"
                              },
                              "4": {
                                  "result": "win"
                              }
                          }
                      },
                      {
                          "firstName": "Олександр",
                          "lastName": "Власов",
                          "weight": "122.3",
                          "tournamentCategoryIds": [
                              "7300f941-113a-4567-a9a2-5e633b555dca",
                              "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
                          ],
                          "id": "12747830-f88c-493a-a16d-5c5f8baea9d0",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "win"
                              },
                              "1": {
                                  "result": "lose"
                              },
                              "2": {
                                  "result": "win"
                              },
                              "3": {
                                  "result": "win"
                              },
                              "4": {
                                  "result": "win"
                              }
                          }
                      },
                      {
                          "tournamentCategoryIds": [
                              "7300f941-113a-4567-a9a2-5e633b555dca",
                              "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
                          ],
                          "firstName": "Михайло",
                          "lastName": "Шевченко",
                          "weight": "150",
                          "id": "0969a1bb-b05e-4c3f-a9e3-33fda9b16d37",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "lose"
                              },
                              "1": {
                                  "result": "win"
                              },
                              "2": {
                                  "result": "win"
                              },
                              "3": {
                                  "result": "win"
                              },
                              "4": {
                                  "result": "lose"
                              }
                          }
                      }
                  ]
              },
              "5": {
                  "groupA": [
                      {
                          "firstName": "Богдан",
                          "lastName": "Зуяков ",
                          "weight": "103.3",
                          "tournamentCategoryIds": [
                              "7300f941-113a-4567-a9a2-5e633b555dca",
                              "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
                          ],
                          "id": "355337a7-e112-4f73-8e27-2d89a9b5d39b",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "win"
                              },
                              "1": {
                                  "result": "win"
                              },
                              "2": {
                                  "result": "win"
                              },
                              "3": {
                                  "result": "win"
                              },
                              "4": {
                                  "result": "win"
                              },
                              "5": {
                                  "result": "win"
                              }
                          }
                      }
                  ],
                  "groupB": [
                      {
                          "firstName": "Олег",
                          "lastName": "Гаврелець",
                          "weight": "104.8",
                          "tournamentCategoryIds": [
                              "7300f941-113a-4567-a9a2-5e633b555dca",
                              "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
                          ],
                          "id": "35a069c0-2414-46c3-8001-65d81b38be10",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "win"
                              },
                              "1": {
                                  "result": "win"
                              },
                              "2": {
                                  "result": "lose"
                              },
                              "3": {
                                  "result": "win"
                              },
                              "4": {
                                  "result": "win"
                              },
                              "5": {
                                  "result": "win"
                              }
                          }
                      },
                      {
                          "firstName": "Олександр",
                          "lastName": "Власов",
                          "weight": "122.3",
                          "tournamentCategoryIds": [
                              "7300f941-113a-4567-a9a2-5e633b555dca",
                              "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
                          ],
                          "id": "12747830-f88c-493a-a16d-5c5f8baea9d0",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "win"
                              },
                              "1": {
                                  "result": "lose"
                              },
                              "2": {
                                  "result": "win"
                              },
                              "3": {
                                  "result": "win"
                              },
                              "4": {
                                  "result": "win"
                              },
                              "5": {
                                  "result": "lose"
                              }
                          }
                      }
                  ]
              },
              "6": {
                  "groupA": [
                      {
                          "firstName": "Богдан",
                          "lastName": "Зуяков ",
                          "weight": "103.3",
                          "tournamentCategoryIds": [
                              "7300f941-113a-4567-a9a2-5e633b555dca",
                              "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
                          ],
                          "id": "355337a7-e112-4f73-8e27-2d89a9b5d39b",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "win"
                              },
                              "1": {
                                  "result": "win"
                              },
                              "2": {
                                  "result": "win"
                              },
                              "3": {
                                  "result": "win"
                              },
                              "4": {
                                  "result": "win"
                              },
                              "5": {
                                  "result": "win"
                              },
                              "6": {
                                  "result": "lose"
                              }
                          }
                      },
                      {
                          "firstName": "Олег",
                          "lastName": "Гаврелець",
                          "weight": "104.8",
                          "tournamentCategoryIds": [
                              "7300f941-113a-4567-a9a2-5e633b555dca",
                              "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
                          ],
                          "id": "35a069c0-2414-46c3-8001-65d81b38be10",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "win"
                              },
                              "1": {
                                  "result": "win"
                              },
                              "2": {
                                  "result": "lose"
                              },
                              "3": {
                                  "result": "win"
                              },
                              "4": {
                                  "result": "win"
                              },
                              "5": {
                                  "result": "win"
                              },
                              "6": {
                                  "result": "win"
                              }
                          }
                      }
                  ],
                  "groupB": []
              },
              "7": {
                  "groupA": [
                      {
                          "firstName": "Олег",
                          "lastName": "Гаврелець",
                          "weight": "104.8",
                          "tournamentCategoryIds": [
                              "7300f941-113a-4567-a9a2-5e633b555dca",
                              "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
                          ],
                          "id": "35a069c0-2414-46c3-8001-65d81b38be10",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "win"
                              },
                              "1": {
                                  "result": "win"
                              },
                              "2": {
                                  "result": "lose"
                              },
                              "3": {
                                  "result": "win"
                              },
                              "4": {
                                  "result": "win"
                              },
                              "5": {
                                  "result": "win"
                              },
                              "6": {
                                  "result": "win"
                              },
                              "7": {
                                  "result": "lose"
                              }
                          }
                      },
                      {
                          "firstName": "Богдан",
                          "lastName": "Зуяков ",
                          "weight": "103.3",
                          "tournamentCategoryIds": [
                              "7300f941-113a-4567-a9a2-5e633b555dca",
                              "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
                          ],
                          "id": "355337a7-e112-4f73-8e27-2d89a9b5d39b",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "win"
                              },
                              "1": {
                                  "result": "win"
                              },
                              "2": {
                                  "result": "win"
                              },
                              "3": {
                                  "result": "win"
                              },
                              "4": {
                                  "result": "win"
                              },
                              "5": {
                                  "result": "win"
                              },
                              "6": {
                                  "result": "lose"
                              },
                              "7": {
                                  "result": "win"
                              }
                          }
                      }
                  ],
                  "groupB": []
              }
          },
          "selectedRound": 7
      },
      "2": {
          "category": "7300f941-113a-4567-a9a2-5e633b555dca",
          "state": "finished",
          "rounds": {
              "0": {
                  "groupA": [
                      {
                          "tournamentCategoryIds": [
                              "7300f941-113a-4567-a9a2-5e633b555dca",
                              "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
                          ],
                          "firstName": "Дмитро",
                          "lastName": "Єрохін",
                          "weight": "105",
                          "id": "2a438433-61eb-4a50-8ca4-bbf535bffb74",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "win"
                              }
                          }
                      },
                      {
                          "tournamentCategoryIds": [
                              "7300f941-113a-4567-a9a2-5e633b555dca",
                              "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
                          ],
                          "firstName": "Станіслав",
                          "lastName": "Гулий",
                          "weight": "105.7",
                          "id": "fb756e7c-4c21-4060-9ddd-1a8e9e698e30",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "lose"
                              }
                          }
                      },
                      {
                          "tournamentCategoryIds": [
                              "7300f941-113a-4567-a9a2-5e633b555dca",
                              "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
                          ],
                          "firstName": "Олександр",
                          "lastName": "Картишкін",
                          "weight": "102",
                          "id": "ed6e2d81-2ff6-436c-84a3-c7678daa63da",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "win"
                              }
                          }
                      },
                      {
                          "firstName": "Іван",
                          "lastName": "Спесивцев ",
                          "weight": "110",
                          "tournamentCategoryIds": [
                              "7300f941-113a-4567-a9a2-5e633b555dca",
                              "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
                          ],
                          "id": "84f1a6d9-fecd-4bcb-ab78-1b1649449c7f",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "lose"
                              }
                          }
                      },
                      {
                          "firstName": "Богдан",
                          "lastName": "Зуяков ",
                          "weight": "103.3",
                          "tournamentCategoryIds": [
                              "7300f941-113a-4567-a9a2-5e633b555dca",
                              "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
                          ],
                          "id": "355337a7-e112-4f73-8e27-2d89a9b5d39b",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "lose"
                              }
                          }
                      },
                      {
                          "tournamentCategoryIds": [
                              "7300f941-113a-4567-a9a2-5e633b555dca",
                              "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
                          ],
                          "firstName": "Михайло",
                          "lastName": "Шевченко",
                          "weight": "150",
                          "id": "0969a1bb-b05e-4c3f-a9e3-33fda9b16d37",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "win"
                              }
                          }
                      },
                      {
                          "firstName": "Олександр",
                          "lastName": "Власов",
                          "weight": "122.3",
                          "tournamentCategoryIds": [
                              "7300f941-113a-4567-a9a2-5e633b555dca",
                              "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
                          ],
                          "id": "12747830-f88c-493a-a16d-5c5f8baea9d0",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "win"
                              }
                          }
                      },
                      {
                          "firstName": "Андрій",
                          "lastName": "Толбатов",
                          "weight": "95.3",
                          "tournamentCategoryIds": [
                              "179b369a-9fe2-4c0a-a1bb-5ce5ff16c8c9",
                              "a69cd04d-5492-42e4-9c2b-dc991a9e3d15",
                              "7300f941-113a-4567-a9a2-5e633b555dca",
                              "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
                          ],
                          "id": "d3b8ae2c-3258-40ce-8990-6b3478a9f03a",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "lose"
                              }
                          }
                      },
                      {
                          "tournamentCategoryIds": [
                              "7300f941-113a-4567-a9a2-5e633b555dca",
                              "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
                          ],
                          "firstName": "Гліб",
                          "lastName": "Кривоносов",
                          "weight": "97.2",
                          "id": "2c513f1a-8f98-4dc2-b83a-a7c48f86c0e6",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "win"
                              }
                          }
                      },
                      {
                          "tournamentCategoryIds": [
                              "7300f941-113a-4567-a9a2-5e633b555dca",
                              "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
                          ],
                          "firstName": "Юрій",
                          "lastName": "Маляр",
                          "weight": "106.5",
                          "id": "20c08a4d-36e4-4960-a46a-74964621915f",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "lose"
                              }
                          }
                      },
                      {
                          "firstName": "Олег",
                          "lastName": "Гаврелець",
                          "weight": "104.8",
                          "tournamentCategoryIds": [
                              "7300f941-113a-4567-a9a2-5e633b555dca",
                              "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
                          ],
                          "id": "35a069c0-2414-46c3-8001-65d81b38be10",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "lose"
                              }
                          }
                      },
                      {
                          "tournamentCategoryIds": [
                              "179b369a-9fe2-4c0a-a1bb-5ce5ff16c8c9",
                              "a69cd04d-5492-42e4-9c2b-dc991a9e3d15",
                              "7300f941-113a-4567-a9a2-5e633b555dca",
                              "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
                          ],
                          "firstName": "Ігор",
                          "lastName": "Окара",
                          "weight": "95.2",
                          "id": "b0e84cc7-5e56-4092-b591-bf6be8701345",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "win"
                              }
                          }
                      },
                      {
                          "tournamentCategoryIds": [
                              "7300f941-113a-4567-a9a2-5e633b555dca",
                              "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
                          ],
                          "firstName": "Олександр",
                          "lastName": "Скрипник",
                          "weight": "110.3",
                          "id": "059c1bcb-4897-48c1-9298-a84b54a239b1",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "lose"
                              }
                          }
                      },
                      {
                          "firstName": "Костянтин",
                          "lastName": "Брехов",
                          "weight": "109.6",
                          "tournamentCategoryIds": [
                              "7300f941-113a-4567-a9a2-5e633b555dca",
                              "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
                          ],
                          "id": "2f64c9d9-99ce-4dee-bdbc-9605f6535807",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "win"
                              }
                          }
                      },
                      {
                          "firstName": "Артем",
                          "lastName": "Попов",
                          "weight": "87.5",
                          "tournamentCategoryIds": [
                              "7300f941-113a-4567-a9a2-5e633b555dca",
                              "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
                          ],
                          "id": "b5ea0ff3-edb6-434d-9ed6-6576da0a0eaa",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "win"
                              }
                          }
                      },
                      {
                          "tournamentCategoryIds": [
                              "7300f941-113a-4567-a9a2-5e633b555dca",
                              "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
                          ],
                          "firstName": "Володимир",
                          "lastName": "Кривобок",
                          "weight": "154",
                          "id": "329dba25-a265-4e6c-b48c-dbdc2cf1b161",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "lose"
                              }
                          }
                      }
                  ],
                  "groupB": []
              },
              "1": {
                  "groupA": [
                      {
                          "tournamentCategoryIds": [
                              "7300f941-113a-4567-a9a2-5e633b555dca",
                              "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
                          ],
                          "firstName": "Дмитро",
                          "lastName": "Єрохін",
                          "weight": "105",
                          "id": "2a438433-61eb-4a50-8ca4-bbf535bffb74",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "win"
                              },
                              "1": {
                                  "result": "win"
                              }
                          }
                      },
                      {
                          "tournamentCategoryIds": [
                              "7300f941-113a-4567-a9a2-5e633b555dca",
                              "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
                          ],
                          "firstName": "Олександр",
                          "lastName": "Картишкін",
                          "weight": "102",
                          "id": "ed6e2d81-2ff6-436c-84a3-c7678daa63da",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "win"
                              },
                              "1": {
                                  "result": "lose"
                              }
                          }
                      },
                      {
                          "tournamentCategoryIds": [
                              "7300f941-113a-4567-a9a2-5e633b555dca",
                              "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
                          ],
                          "firstName": "Михайло",
                          "lastName": "Шевченко",
                          "weight": "150",
                          "id": "0969a1bb-b05e-4c3f-a9e3-33fda9b16d37",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "win"
                              },
                              "1": {
                                  "result": "win"
                              }
                          }
                      },
                      {
                          "firstName": "Олександр",
                          "lastName": "Власов",
                          "weight": "122.3",
                          "tournamentCategoryIds": [
                              "7300f941-113a-4567-a9a2-5e633b555dca",
                              "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
                          ],
                          "id": "12747830-f88c-493a-a16d-5c5f8baea9d0",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "win"
                              },
                              "1": {
                                  "result": "lose"
                              }
                          }
                      },
                      {
                          "tournamentCategoryIds": [
                              "7300f941-113a-4567-a9a2-5e633b555dca",
                              "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
                          ],
                          "firstName": "Гліб",
                          "lastName": "Кривоносов",
                          "weight": "97.2",
                          "id": "2c513f1a-8f98-4dc2-b83a-a7c48f86c0e6",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "win"
                              },
                              "1": {
                                  "result": "lose"
                              }
                          }
                      },
                      {
                          "tournamentCategoryIds": [
                              "179b369a-9fe2-4c0a-a1bb-5ce5ff16c8c9",
                              "a69cd04d-5492-42e4-9c2b-dc991a9e3d15",
                              "7300f941-113a-4567-a9a2-5e633b555dca",
                              "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
                          ],
                          "firstName": "Ігор",
                          "lastName": "Окара",
                          "weight": "95.2",
                          "id": "b0e84cc7-5e56-4092-b591-bf6be8701345",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "win"
                              },
                              "1": {
                                  "result": "win"
                              }
                          }
                      },
                      {
                          "firstName": "Костянтин",
                          "lastName": "Брехов",
                          "weight": "109.6",
                          "tournamentCategoryIds": [
                              "7300f941-113a-4567-a9a2-5e633b555dca",
                              "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
                          ],
                          "id": "2f64c9d9-99ce-4dee-bdbc-9605f6535807",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "win"
                              },
                              "1": {
                                  "result": "win"
                              }
                          }
                      },
                      {
                          "firstName": "Артем",
                          "lastName": "Попов",
                          "weight": "87.5",
                          "tournamentCategoryIds": [
                              "7300f941-113a-4567-a9a2-5e633b555dca",
                              "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
                          ],
                          "id": "b5ea0ff3-edb6-434d-9ed6-6576da0a0eaa",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "win"
                              },
                              "1": {
                                  "result": "lose"
                              }
                          }
                      }
                  ],
                  "groupB": [
                      {
                          "tournamentCategoryIds": [
                              "7300f941-113a-4567-a9a2-5e633b555dca",
                              "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
                          ],
                          "firstName": "Станіслав",
                          "lastName": "Гулий",
                          "weight": "105.7",
                          "id": "fb756e7c-4c21-4060-9ddd-1a8e9e698e30",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "lose"
                              },
                              "1": {
                                  "result": "lose"
                              }
                          }
                      },
                      {
                          "firstName": "Іван",
                          "lastName": "Спесивцев ",
                          "weight": "110",
                          "tournamentCategoryIds": [
                              "7300f941-113a-4567-a9a2-5e633b555dca",
                              "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
                          ],
                          "id": "84f1a6d9-fecd-4bcb-ab78-1b1649449c7f",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "lose"
                              },
                              "1": {
                                  "result": "win"
                              }
                          }
                      },
                      {
                          "firstName": "Богдан",
                          "lastName": "Зуяков ",
                          "weight": "103.3",
                          "tournamentCategoryIds": [
                              "7300f941-113a-4567-a9a2-5e633b555dca",
                              "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
                          ],
                          "id": "355337a7-e112-4f73-8e27-2d89a9b5d39b",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "lose"
                              },
                              "1": {
                                  "result": "win"
                              }
                          }
                      },
                      {
                          "firstName": "Андрій",
                          "lastName": "Толбатов",
                          "weight": "95.3",
                          "tournamentCategoryIds": [
                              "179b369a-9fe2-4c0a-a1bb-5ce5ff16c8c9",
                              "a69cd04d-5492-42e4-9c2b-dc991a9e3d15",
                              "7300f941-113a-4567-a9a2-5e633b555dca",
                              "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
                          ],
                          "id": "d3b8ae2c-3258-40ce-8990-6b3478a9f03a",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "lose"
                              },
                              "1": {
                                  "result": "lose"
                              }
                          }
                      },
                      {
                          "tournamentCategoryIds": [
                              "7300f941-113a-4567-a9a2-5e633b555dca",
                              "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
                          ],
                          "firstName": "Юрій",
                          "lastName": "Маляр",
                          "weight": "106.5",
                          "id": "20c08a4d-36e4-4960-a46a-74964621915f",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "lose"
                              },
                              "1": {
                                  "result": "lose"
                              }
                          }
                      },
                      {
                          "firstName": "Олег",
                          "lastName": "Гаврелець",
                          "weight": "104.8",
                          "tournamentCategoryIds": [
                              "7300f941-113a-4567-a9a2-5e633b555dca",
                              "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
                          ],
                          "id": "35a069c0-2414-46c3-8001-65d81b38be10",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "lose"
                              },
                              "1": {
                                  "result": "win"
                              }
                          }
                      },
                      {
                          "tournamentCategoryIds": [
                              "7300f941-113a-4567-a9a2-5e633b555dca",
                              "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
                          ],
                          "firstName": "Олександр",
                          "lastName": "Скрипник",
                          "weight": "110.3",
                          "id": "059c1bcb-4897-48c1-9298-a84b54a239b1",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "lose"
                              },
                              "1": {
                                  "result": "lose"
                              }
                          }
                      },
                      {
                          "tournamentCategoryIds": [
                              "7300f941-113a-4567-a9a2-5e633b555dca",
                              "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
                          ],
                          "firstName": "Володимир",
                          "lastName": "Кривобок",
                          "weight": "154",
                          "id": "329dba25-a265-4e6c-b48c-dbdc2cf1b161",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "lose"
                              },
                              "1": {
                                  "result": "win"
                              }
                          }
                      }
                  ]
              },
              "2": {
                  "groupA": [
                      {
                          "tournamentCategoryIds": [
                              "7300f941-113a-4567-a9a2-5e633b555dca",
                              "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
                          ],
                          "firstName": "Дмитро",
                          "lastName": "Єрохін",
                          "weight": "105",
                          "id": "2a438433-61eb-4a50-8ca4-bbf535bffb74",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "win"
                              },
                              "1": {
                                  "result": "win"
                              },
                              "2": {
                                  "result": "lose"
                              }
                          }
                      },
                      {
                          "tournamentCategoryIds": [
                              "7300f941-113a-4567-a9a2-5e633b555dca",
                              "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
                          ],
                          "firstName": "Михайло",
                          "lastName": "Шевченко",
                          "weight": "150",
                          "id": "0969a1bb-b05e-4c3f-a9e3-33fda9b16d37",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "win"
                              },
                              "1": {
                                  "result": "win"
                              },
                              "2": {
                                  "result": "win"
                              }
                          }
                      },
                      {
                          "tournamentCategoryIds": [
                              "179b369a-9fe2-4c0a-a1bb-5ce5ff16c8c9",
                              "a69cd04d-5492-42e4-9c2b-dc991a9e3d15",
                              "7300f941-113a-4567-a9a2-5e633b555dca",
                              "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
                          ],
                          "firstName": "Ігор",
                          "lastName": "Окара",
                          "weight": "95.2",
                          "id": "b0e84cc7-5e56-4092-b591-bf6be8701345",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "win"
                              },
                              "1": {
                                  "result": "win"
                              },
                              "2": {
                                  "result": "win"
                              }
                          }
                      },
                      {
                          "firstName": "Костянтин",
                          "lastName": "Брехов",
                          "weight": "109.6",
                          "tournamentCategoryIds": [
                              "7300f941-113a-4567-a9a2-5e633b555dca",
                              "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
                          ],
                          "id": "2f64c9d9-99ce-4dee-bdbc-9605f6535807",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "win"
                              },
                              "1": {
                                  "result": "win"
                              },
                              "2": {
                                  "result": "lose"
                              }
                          }
                      }
                  ],
                  "groupB": [
                      {
                          "tournamentCategoryIds": [
                              "7300f941-113a-4567-a9a2-5e633b555dca",
                              "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
                          ],
                          "firstName": "Олександр",
                          "lastName": "Картишкін",
                          "weight": "102",
                          "id": "ed6e2d81-2ff6-436c-84a3-c7678daa63da",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "win"
                              },
                              "1": {
                                  "result": "lose"
                              },
                              "2": {
                                  "result": "win"
                              }
                          }
                      },
                      {
                          "firstName": "Олександр",
                          "lastName": "Власов",
                          "weight": "122.3",
                          "tournamentCategoryIds": [
                              "7300f941-113a-4567-a9a2-5e633b555dca",
                              "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
                          ],
                          "id": "12747830-f88c-493a-a16d-5c5f8baea9d0",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "win"
                              },
                              "1": {
                                  "result": "lose"
                              },
                              "2": {
                                  "result": "lose"
                              }
                          }
                      },
                      {
                          "tournamentCategoryIds": [
                              "7300f941-113a-4567-a9a2-5e633b555dca",
                              "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
                          ],
                          "firstName": "Гліб",
                          "lastName": "Кривоносов",
                          "weight": "97.2",
                          "id": "2c513f1a-8f98-4dc2-b83a-a7c48f86c0e6",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "win"
                              },
                              "1": {
                                  "result": "lose"
                              },
                              "2": {
                                  "result": "lose"
                              }
                          }
                      },
                      {
                          "firstName": "Артем",
                          "lastName": "Попов",
                          "weight": "87.5",
                          "tournamentCategoryIds": [
                              "7300f941-113a-4567-a9a2-5e633b555dca",
                              "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
                          ],
                          "id": "b5ea0ff3-edb6-434d-9ed6-6576da0a0eaa",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "win"
                              },
                              "1": {
                                  "result": "lose"
                              },
                              "2": {
                                  "result": "win"
                              }
                          }
                      },
                      {
                          "firstName": "Іван",
                          "lastName": "Спесивцев ",
                          "weight": "110",
                          "tournamentCategoryIds": [
                              "7300f941-113a-4567-a9a2-5e633b555dca",
                              "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
                          ],
                          "id": "84f1a6d9-fecd-4bcb-ab78-1b1649449c7f",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "lose"
                              },
                              "1": {
                                  "result": "win"
                              },
                              "2": {
                                  "result": "lose"
                              }
                          }
                      },
                      {
                          "firstName": "Богдан",
                          "lastName": "Зуяков ",
                          "weight": "103.3",
                          "tournamentCategoryIds": [
                              "7300f941-113a-4567-a9a2-5e633b555dca",
                              "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
                          ],
                          "id": "355337a7-e112-4f73-8e27-2d89a9b5d39b",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "lose"
                              },
                              "1": {
                                  "result": "win"
                              },
                              "2": {
                                  "result": "win"
                              }
                          }
                      },
                      {
                          "firstName": "Олег",
                          "lastName": "Гаврелець",
                          "weight": "104.8",
                          "tournamentCategoryIds": [
                              "7300f941-113a-4567-a9a2-5e633b555dca",
                              "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
                          ],
                          "id": "35a069c0-2414-46c3-8001-65d81b38be10",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "lose"
                              },
                              "1": {
                                  "result": "win"
                              },
                              "2": {
                                  "result": "win"
                              }
                          }
                      },
                      {
                          "tournamentCategoryIds": [
                              "7300f941-113a-4567-a9a2-5e633b555dca",
                              "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
                          ],
                          "firstName": "Володимир",
                          "lastName": "Кривобок",
                          "weight": "154",
                          "id": "329dba25-a265-4e6c-b48c-dbdc2cf1b161",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "lose"
                              },
                              "1": {
                                  "result": "win"
                              },
                              "2": {
                                  "result": "lose"
                              }
                          }
                      }
                  ]
              },
              "3": {
                  "groupA": [
                      {
                          "tournamentCategoryIds": [
                              "7300f941-113a-4567-a9a2-5e633b555dca",
                              "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
                          ],
                          "firstName": "Михайло",
                          "lastName": "Шевченко",
                          "weight": "150",
                          "id": "0969a1bb-b05e-4c3f-a9e3-33fda9b16d37",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "win"
                              },
                              "1": {
                                  "result": "win"
                              },
                              "2": {
                                  "result": "win"
                              },
                              "3": {
                                  "result": "lose"
                              }
                          }
                      },
                      {
                          "tournamentCategoryIds": [
                              "179b369a-9fe2-4c0a-a1bb-5ce5ff16c8c9",
                              "a69cd04d-5492-42e4-9c2b-dc991a9e3d15",
                              "7300f941-113a-4567-a9a2-5e633b555dca",
                              "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
                          ],
                          "firstName": "Ігор",
                          "lastName": "Окара",
                          "weight": "95.2",
                          "id": "b0e84cc7-5e56-4092-b591-bf6be8701345",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "win"
                              },
                              "1": {
                                  "result": "win"
                              },
                              "2": {
                                  "result": "win"
                              },
                              "3": {
                                  "result": "win"
                              }
                          }
                      }
                  ],
                  "groupB": [
                      {
                          "tournamentCategoryIds": [
                              "7300f941-113a-4567-a9a2-5e633b555dca",
                              "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
                          ],
                          "firstName": "Дмитро",
                          "lastName": "Єрохін",
                          "weight": "105",
                          "id": "2a438433-61eb-4a50-8ca4-bbf535bffb74",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "win"
                              },
                              "1": {
                                  "result": "win"
                              },
                              "2": {
                                  "result": "lose"
                              },
                              "3": {
                                  "result": "win"
                              }
                          }
                      },
                      {
                          "firstName": "Костянтин",
                          "lastName": "Брехов",
                          "weight": "109.6",
                          "tournamentCategoryIds": [
                              "7300f941-113a-4567-a9a2-5e633b555dca",
                              "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
                          ],
                          "id": "2f64c9d9-99ce-4dee-bdbc-9605f6535807",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "win"
                              },
                              "1": {
                                  "result": "win"
                              },
                              "2": {
                                  "result": "lose"
                              },
                              "3": {
                                  "result": "lose"
                              }
                          }
                      },
                      {
                          "tournamentCategoryIds": [
                              "7300f941-113a-4567-a9a2-5e633b555dca",
                              "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
                          ],
                          "firstName": "Олександр",
                          "lastName": "Картишкін",
                          "weight": "102",
                          "id": "ed6e2d81-2ff6-436c-84a3-c7678daa63da",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "win"
                              },
                              "1": {
                                  "result": "lose"
                              },
                              "2": {
                                  "result": "win"
                              },
                              "3": {
                                  "result": "lose"
                              }
                          }
                      },
                      {
                          "firstName": "Артем",
                          "lastName": "Попов",
                          "weight": "87.5",
                          "tournamentCategoryIds": [
                              "7300f941-113a-4567-a9a2-5e633b555dca",
                              "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
                          ],
                          "id": "b5ea0ff3-edb6-434d-9ed6-6576da0a0eaa",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "win"
                              },
                              "1": {
                                  "result": "lose"
                              },
                              "2": {
                                  "result": "win"
                              },
                              "3": {
                                  "result": "win"
                              }
                          }
                      },
                      {
                          "firstName": "Богдан",
                          "lastName": "Зуяков ",
                          "weight": "103.3",
                          "tournamentCategoryIds": [
                              "7300f941-113a-4567-a9a2-5e633b555dca",
                              "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
                          ],
                          "id": "355337a7-e112-4f73-8e27-2d89a9b5d39b",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "lose"
                              },
                              "1": {
                                  "result": "win"
                              },
                              "2": {
                                  "result": "win"
                              },
                              "3": {
                                  "result": "win"
                              }
                          }
                      },
                      {
                          "firstName": "Олег",
                          "lastName": "Гаврелець",
                          "weight": "104.8",
                          "tournamentCategoryIds": [
                              "7300f941-113a-4567-a9a2-5e633b555dca",
                              "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
                          ],
                          "id": "35a069c0-2414-46c3-8001-65d81b38be10",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "lose"
                              },
                              "1": {
                                  "result": "win"
                              },
                              "2": {
                                  "result": "win"
                              },
                              "3": {
                                  "result": "lose"
                              }
                          }
                      }
                  ]
              },
              "4": {
                  "groupA": [
                      {
                          "tournamentCategoryIds": [
                              "179b369a-9fe2-4c0a-a1bb-5ce5ff16c8c9",
                              "a69cd04d-5492-42e4-9c2b-dc991a9e3d15",
                              "7300f941-113a-4567-a9a2-5e633b555dca",
                              "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
                          ],
                          "firstName": "Ігор",
                          "lastName": "Окара",
                          "weight": "95.2",
                          "id": "b0e84cc7-5e56-4092-b591-bf6be8701345",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "win"
                              },
                              "1": {
                                  "result": "win"
                              },
                              "2": {
                                  "result": "win"
                              },
                              "3": {
                                  "result": "win"
                              },
                              "4": {
                                  "result": "win"
                              }
                          }
                      }
                  ],
                  "groupB": [
                      {
                          "tournamentCategoryIds": [
                              "7300f941-113a-4567-a9a2-5e633b555dca",
                              "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
                          ],
                          "firstName": "Михайло",
                          "lastName": "Шевченко",
                          "weight": "150",
                          "id": "0969a1bb-b05e-4c3f-a9e3-33fda9b16d37",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "win"
                              },
                              "1": {
                                  "result": "win"
                              },
                              "2": {
                                  "result": "win"
                              },
                              "3": {
                                  "result": "lose"
                              },
                              "4": {
                                  "result": "lose"
                              }
                          }
                      },
                      {
                          "tournamentCategoryIds": [
                              "7300f941-113a-4567-a9a2-5e633b555dca",
                              "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
                          ],
                          "firstName": "Дмитро",
                          "lastName": "Єрохін",
                          "weight": "105",
                          "id": "2a438433-61eb-4a50-8ca4-bbf535bffb74",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "win"
                              },
                              "1": {
                                  "result": "win"
                              },
                              "2": {
                                  "result": "lose"
                              },
                              "3": {
                                  "result": "win"
                              },
                              "4": {
                                  "result": "win"
                              }
                          }
                      },
                      {
                          "firstName": "Артем",
                          "lastName": "Попов",
                          "weight": "87.5",
                          "tournamentCategoryIds": [
                              "7300f941-113a-4567-a9a2-5e633b555dca",
                              "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
                          ],
                          "id": "b5ea0ff3-edb6-434d-9ed6-6576da0a0eaa",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "win"
                              },
                              "1": {
                                  "result": "lose"
                              },
                              "2": {
                                  "result": "win"
                              },
                              "3": {
                                  "result": "win"
                              },
                              "4": {
                                  "result": "win"
                              }
                          }
                      },
                      {
                          "firstName": "Богдан",
                          "lastName": "Зуяков ",
                          "weight": "103.3",
                          "tournamentCategoryIds": [
                              "7300f941-113a-4567-a9a2-5e633b555dca",
                              "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
                          ],
                          "id": "355337a7-e112-4f73-8e27-2d89a9b5d39b",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "lose"
                              },
                              "1": {
                                  "result": "win"
                              },
                              "2": {
                                  "result": "win"
                              },
                              "3": {
                                  "result": "win"
                              },
                              "4": {
                                  "result": "lose"
                              }
                          }
                      }
                  ]
              },
              "5": {
                  "groupA": [
                      {
                          "tournamentCategoryIds": [
                              "179b369a-9fe2-4c0a-a1bb-5ce5ff16c8c9",
                              "a69cd04d-5492-42e4-9c2b-dc991a9e3d15",
                              "7300f941-113a-4567-a9a2-5e633b555dca",
                              "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
                          ],
                          "firstName": "Ігор",
                          "lastName": "Окара",
                          "weight": "95.2",
                          "id": "b0e84cc7-5e56-4092-b591-bf6be8701345",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "win"
                              },
                              "1": {
                                  "result": "win"
                              },
                              "2": {
                                  "result": "win"
                              },
                              "3": {
                                  "result": "win"
                              },
                              "4": {
                                  "result": "win"
                              },
                              "5": {
                                  "result": "win"
                              }
                          }
                      }
                  ],
                  "groupB": [
                      {
                          "tournamentCategoryIds": [
                              "7300f941-113a-4567-a9a2-5e633b555dca",
                              "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
                          ],
                          "firstName": "Дмитро",
                          "lastName": "Єрохін",
                          "weight": "105",
                          "id": "2a438433-61eb-4a50-8ca4-bbf535bffb74",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "win"
                              },
                              "1": {
                                  "result": "win"
                              },
                              "2": {
                                  "result": "lose"
                              },
                              "3": {
                                  "result": "win"
                              },
                              "4": {
                                  "result": "win"
                              },
                              "5": {
                                  "result": "win"
                              }
                          }
                      },
                      {
                          "firstName": "Артем",
                          "lastName": "Попов",
                          "weight": "87.5",
                          "tournamentCategoryIds": [
                              "7300f941-113a-4567-a9a2-5e633b555dca",
                              "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
                          ],
                          "id": "b5ea0ff3-edb6-434d-9ed6-6576da0a0eaa",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "win"
                              },
                              "1": {
                                  "result": "lose"
                              },
                              "2": {
                                  "result": "win"
                              },
                              "3": {
                                  "result": "win"
                              },
                              "4": {
                                  "result": "win"
                              },
                              "5": {
                                  "result": "lose"
                              }
                          }
                      }
                  ]
              },
              "6": {
                  "groupA": [
                      {
                          "tournamentCategoryIds": [
                              "179b369a-9fe2-4c0a-a1bb-5ce5ff16c8c9",
                              "a69cd04d-5492-42e4-9c2b-dc991a9e3d15",
                              "7300f941-113a-4567-a9a2-5e633b555dca",
                              "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
                          ],
                          "firstName": "Ігор",
                          "lastName": "Окара",
                          "weight": "95.2",
                          "id": "b0e84cc7-5e56-4092-b591-bf6be8701345",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "win"
                              },
                              "1": {
                                  "result": "win"
                              },
                              "2": {
                                  "result": "win"
                              },
                              "3": {
                                  "result": "win"
                              },
                              "4": {
                                  "result": "win"
                              },
                              "5": {
                                  "result": "win"
                              },
                              "6": {
                                  "result": "win"
                              }
                          }
                      },
                      {
                          "tournamentCategoryIds": [
                              "7300f941-113a-4567-a9a2-5e633b555dca",
                              "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
                          ],
                          "firstName": "Дмитро",
                          "lastName": "Єрохін",
                          "weight": "105",
                          "id": "2a438433-61eb-4a50-8ca4-bbf535bffb74",
                          "present": true,
                          "stats": {
                              "0": {
                                  "result": "win"
                              },
                              "1": {
                                  "result": "win"
                              },
                              "2": {
                                  "result": "lose"
                              },
                              "3": {
                                  "result": "win"
                              },
                              "4": {
                                  "result": "win"
                              },
                              "5": {
                                  "result": "win"
                              },
                              "6": {
                                  "result": "lose"
                              }
                          }
                      }
                  ],
                  "groupB": []
              }
          },
          "selectedRound": 6
      }
  },
  "weightCategories": [
      {
          "id": "xxx",
          "value": "абсолютна"
      },
      {
          "id": "bc3a8c90-eed4-46c9-84d4-cadb802e84e4",
          "value": "75"
      },
      {
          "id": "17d14f7e-f65a-4d0b-8d22-5f52803c9c8e",
          "value": "85"
      },
      {
          "id": "1ea5c30b-48c3-455f-ac00-05d13c22a967",
          "value": "95"
      },
      {
          "id": "aa7ed61a-51ea-45e0-8ec1-f92ef205fa66",
          "value": "95+"
      }
  ],
  "classificationCategories": [
      {
          "id": "1",
          "label": "Дорослі"
      },
      {
          "id": "75be7fe9-bfd2-4492-a020-ac95b67ff6bb",
          "label": "Сидячи PID"
      },
      {
          "id": "d6998d5f-6607-44f9-91fd-18fffa76b2e5",
          "label": "Стоячи PIU"
      },
      {
          "id": "69a19bc2-2a11-443c-b475-ece3e6c8e58b",
          "label": "Уражені ОРА"
      },
      {
          "id": "3558bb91-7ec2-46bb-88c5-f6d1bd47053e",
          "label": "Сидячи PID H"
      }
  ],
  "newTournamentCategories": {
      "7145e7a5-809f-4581-96a9-09009f4ab0fd": {
          "categoryTitleFull": "Сидячи PID H абсолютна кг, чоловіки, ліва рука",
          "categoryTitleShort": "Сидячи PID H абсолютна кг",
          "id": "7145e7a5-809f-4581-96a9-09009f4ab0fd",
          "config": {
              "classification": {
                  "id": "3558bb91-7ec2-46bb-88c5-f6d1bd47053e",
                  "label": "Сидячи PID H"
              },
              "weightCategory": {
                  "id": "xxx",
                  "value": "абсолютна"
              },
              "hand": "left",
              "gender": "men"
          },
          "state": "finished"
      },
      "7ae3a387-953b-4d1c-abe9-1d8aafeae004": {
          "categoryTitleFull": "Дорослі абсолютна кг, жінки, ліва рука",
          "categoryTitleShort": "Дорослі абсолютна кг",
          "id": "7ae3a387-953b-4d1c-abe9-1d8aafeae004",
          "config": {
              "classification": {
                  "id": "1",
                  "label": "Дорослі"
              },
              "weightCategory": {
                  "id": "xxx",
                  "value": "абсолютна"
              },
              "hand": "left",
              "gender": "women"
          },
          "state": "finished"
      },
      "d5e94274-26a8-48ce-8193-fc232d90a7d7": {
          "categoryTitleFull": "Дорослі абсолютна кг, жінки, права рука",
          "categoryTitleShort": "Дорослі абсолютна кг",
          "id": "d5e94274-26a8-48ce-8193-fc232d90a7d7",
          "config": {
              "classification": {
                  "id": "1",
                  "label": "Дорослі"
              },
              "weightCategory": {
                  "id": "xxx",
                  "value": "абсолютна"
              },
              "hand": "right",
              "gender": "women"
          },
          "state": "finished"
      },
      "fc01e05d-1e01-4131-a3a7-8c1de14c7c51": {
          "categoryTitleFull": "Стоячи PIU абсолютна кг, чоловіки, ліва рука",
          "categoryTitleShort": "Стоячи PIU абсолютна кг",
          "id": "fc01e05d-1e01-4131-a3a7-8c1de14c7c51",
          "config": {
              "classification": {
                  "id": "d6998d5f-6607-44f9-91fd-18fffa76b2e5",
                  "label": "Стоячи PIU"
              },
              "weightCategory": {
                  "id": "xxx",
                  "value": "абсолютна"
              },
              "hand": "left",
              "gender": "men"
          },
          "state": "finished"
      },
      "17e7bcd3-1ea3-4edd-9b33-0f8e17fb9105": {
          "categoryTitleFull": "Стоячи PIU абсолютна кг, чоловіки, права рука",
          "categoryTitleShort": "Стоячи PIU абсолютна кг",
          "id": "17e7bcd3-1ea3-4edd-9b33-0f8e17fb9105",
          "config": {
              "classification": {
                  "id": "d6998d5f-6607-44f9-91fd-18fffa76b2e5",
                  "label": "Стоячи PIU"
              },
              "weightCategory": {
                  "id": "xxx",
                  "value": "абсолютна"
              },
              "hand": "right",
              "gender": "men"
          },
          "state": "finished"
      },
      "a8c8bf87-29b9-423d-b387-4c546de07fa6": {
          "categoryTitleFull": "Сидячи PID абсолютна кг, чоловіки, ліва рука",
          "categoryTitleShort": "Сидячи PID абсолютна кг",
          "id": "a8c8bf87-29b9-423d-b387-4c546de07fa6",
          "config": {
              "classification": {
                  "id": "75be7fe9-bfd2-4492-a020-ac95b67ff6bb",
                  "label": "Сидячи PID"
              },
              "weightCategory": {
                  "id": "xxx",
                  "value": "абсолютна"
              },
              "hand": "left",
              "gender": "men"
          },
          "state": "finished"
      },
      "8fc3b2f4-c934-4ce5-bb80-3b384c33c973": {
          "categoryTitleFull": "Сидячи PID абсолютна кг, чоловіки, права рука",
          "categoryTitleShort": "Сидячи PID абсолютна кг",
          "id": "8fc3b2f4-c934-4ce5-bb80-3b384c33c973",
          "config": {
              "classification": {
                  "id": "75be7fe9-bfd2-4492-a020-ac95b67ff6bb",
                  "label": "Сидячи PID"
              },
              "weightCategory": {
                  "id": "xxx",
                  "value": "абсолютна"
              },
              "hand": "right",
              "gender": "men"
          },
          "state": "finished"
      },
      "25b0f044-9a01-42b5-b377-16accd14b5b3": {
          "categoryTitleFull": " 75 кг, чоловіки, ліва рука",
          "categoryTitleShort": " 75 кг",
          "id": "25b0f044-9a01-42b5-b377-16accd14b5b3",
          "config": {
              "classification": {
                  "id": "",
                  "label": ""
              },
              "weightCategory": {
                  "id": "bc3a8c90-eed4-46c9-84d4-cadb802e84e4",
                  "value": "75"
              },
              "hand": "left",
              "gender": "men"
          },
          "state": "finished"
      },
      "5b5125b7-09a1-410d-9d5d-1b5196b1c01a": {
          "categoryTitleFull": " 75 кг, чоловіки, права рука",
          "categoryTitleShort": " 75 кг",
          "id": "5b5125b7-09a1-410d-9d5d-1b5196b1c01a",
          "config": {
              "classification": {
                  "id": "",
                  "label": ""
              },
              "weightCategory": {
                  "id": "bc3a8c90-eed4-46c9-84d4-cadb802e84e4",
                  "value": "75"
              },
              "hand": "right",
              "gender": "men"
          },
          "state": "finished"
      },
      "b75851f8-bc4a-409b-8eff-bca2f3d3af94": {
          "categoryTitleFull": " 85 кг, чоловіки, ліва рука",
          "categoryTitleShort": " 85 кг",
          "id": "b75851f8-bc4a-409b-8eff-bca2f3d3af94",
          "config": {
              "classification": {
                  "id": "",
                  "label": ""
              },
              "weightCategory": {
                  "id": "17d14f7e-f65a-4d0b-8d22-5f52803c9c8e",
                  "value": "85"
              },
              "hand": "left",
              "gender": "men"
          },
          "state": "finished"
      },
      "5a38530a-cb13-45de-8893-f376fb842a84": {
          "categoryTitleFull": " 85 кг, чоловіки, права рука",
          "categoryTitleShort": " 85 кг",
          "id": "5a38530a-cb13-45de-8893-f376fb842a84",
          "config": {
              "classification": {
                  "id": "",
                  "label": ""
              },
              "weightCategory": {
                  "id": "17d14f7e-f65a-4d0b-8d22-5f52803c9c8e",
                  "value": "85"
              },
              "hand": "right",
              "gender": "men"
          },
          "state": "finished"
      },
      "179b369a-9fe2-4c0a-a1bb-5ce5ff16c8c9": {
          "categoryTitleFull": " 95 кг, чоловіки, ліва рука",
          "categoryTitleShort": " 95 кг",
          "id": "179b369a-9fe2-4c0a-a1bb-5ce5ff16c8c9",
          "config": {
              "classification": {
                  "id": "",
                  "label": ""
              },
              "weightCategory": {
                  "id": "1ea5c30b-48c3-455f-ac00-05d13c22a967",
                  "value": "95"
              },
              "hand": "left",
              "gender": "men"
          },
          "state": "finished"
      },
      "a69cd04d-5492-42e4-9c2b-dc991a9e3d15": {
          "categoryTitleFull": " 95 кг, чоловіки, права рука",
          "categoryTitleShort": " 95 кг",
          "id": "a69cd04d-5492-42e4-9c2b-dc991a9e3d15",
          "config": {
              "classification": {
                  "id": "",
                  "label": ""
              },
              "weightCategory": {
                  "id": "1ea5c30b-48c3-455f-ac00-05d13c22a967",
                  "value": "95"
              },
              "hand": "right",
              "gender": "men"
          },
          "state": "finished"
      },
      "7300f941-113a-4567-a9a2-5e633b555dca": {
          "categoryTitleFull": " 95+ кг, чоловіки, ліва рука",
          "categoryTitleShort": " 95+ кг",
          "id": "7300f941-113a-4567-a9a2-5e633b555dca",
          "config": {
              "classification": {
                  "id": "",
                  "label": ""
              },
              "weightCategory": {
                  "id": "aa7ed61a-51ea-45e0-8ec1-f92ef205fa66",
                  "value": "95+"
              },
              "hand": "left",
              "gender": "men"
          },
          "state": "finished"
      },
      "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8": {
          "categoryTitleFull": " 95+ кг, чоловіки, права рука",
          "categoryTitleShort": " 95+ кг",
          "id": "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8",
          "config": {
              "classification": {
                  "id": "",
                  "label": ""
              },
              "weightCategory": {
                  "id": "aa7ed61a-51ea-45e0-8ec1-f92ef205fa66",
                  "value": "95+"
              },
              "hand": "right",
              "gender": "men"
          },
          "state": "finished"
      }
  },
  "competitorsList": [
      {
          "tournamentCategoryIds": [
              "25b0f044-9a01-42b5-b377-16accd14b5b3",
              "5b5125b7-09a1-410d-9d5d-1b5196b1c01a"
          ],
          "firstName": "Данило",
          "lastName": "Бобровський",
          "weight": "75.4",
          "id": "9f09a533-7670-4f0c-b07d-bc2b59c3c7dd",
          "present": true
      },
      {
          "firstName": "Андрій",
          "lastName": "Кулик",
          "weight": "72.2",
          "tournamentCategoryIds": [
              "17e7bcd3-1ea3-4edd-9b33-0f8e17fb9105",
              "fc01e05d-1e01-4131-a3a7-8c1de14c7c51"
          ],
          "id": "fbedd4f4-8e6f-42ee-89b8-69acab31a064",
          "present": true
      },
      {
          "tournamentCategoryIds": [
              "7300f941-113a-4567-a9a2-5e633b555dca",
              "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
          ],
          "firstName": "Юрій",
          "lastName": "Маляр",
          "weight": "106.5",
          "id": "20c08a4d-36e4-4960-a46a-74964621915f",
          "present": true
      },
      {
          "tournamentCategoryIds": [
              "fc01e05d-1e01-4131-a3a7-8c1de14c7c51",
              "17e7bcd3-1ea3-4edd-9b33-0f8e17fb9105"
          ],
          "firstName": "Олександр",
          "lastName": "Семоненко",
          "weight": "65",
          "id": "a628452d-8cc3-4014-b718-7e94e11ddb4c",
          "present": true
      },
      {
          "tournamentCategoryIds": [
              "17e7bcd3-1ea3-4edd-9b33-0f8e17fb9105",
              "fc01e05d-1e01-4131-a3a7-8c1de14c7c51"
          ],
          "firstName": "Володимир",
          "lastName": "Сємаєв",
          "weight": "84.6",
          "id": "9fef19be-7cf4-4c28-8eea-dbd4ca5cde11",
          "present": true
      },
      {
          "tournamentCategoryIds": [
              "179b369a-9fe2-4c0a-a1bb-5ce5ff16c8c9",
              "a69cd04d-5492-42e4-9c2b-dc991a9e3d15",
              "7300f941-113a-4567-a9a2-5e633b555dca",
              "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
          ],
          "firstName": "Ігор",
          "lastName": "Окара",
          "weight": "95.2",
          "id": "b0e84cc7-5e56-4092-b591-bf6be8701345",
          "present": true
      },
      {
          "tournamentCategoryIds": [
              "179b369a-9fe2-4c0a-a1bb-5ce5ff16c8c9",
              "a69cd04d-5492-42e4-9c2b-dc991a9e3d15"
          ],
          "firstName": "Владіслав",
          "lastName": "Жегус",
          "weight": "89.9",
          "id": "937f489a-475b-48e9-86f9-4c074610c664",
          "present": true
      },
      {
          "tournamentCategoryIds": [
              "25b0f044-9a01-42b5-b377-16accd14b5b3",
              "5b5125b7-09a1-410d-9d5d-1b5196b1c01a"
          ],
          "firstName": "Олександр",
          "lastName": "Циганій",
          "weight": "73.6",
          "id": "844d8167-2d7f-4f3e-9fd4-f89711edeafb",
          "present": true
      },
      {
          "tournamentCategoryIds": [
              "7300f941-113a-4567-a9a2-5e633b555dca",
              "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
          ],
          "firstName": "Дмитро",
          "lastName": "Єрохін",
          "weight": "105",
          "id": "2a438433-61eb-4a50-8ca4-bbf535bffb74",
          "present": true
      },
      {
          "tournamentCategoryIds": [
              "179b369a-9fe2-4c0a-a1bb-5ce5ff16c8c9",
              "a69cd04d-5492-42e4-9c2b-dc991a9e3d15"
          ],
          "firstName": "Максим",
          "lastName": "Зуй",
          "weight": "88.5",
          "id": "5c2e3dc0-c5ee-4fc9-9218-dace6401d748",
          "present": true
      },
      {
          "tournamentCategoryIds": [
              "7300f941-113a-4567-a9a2-5e633b555dca",
              "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
          ],
          "firstName": "Олександр",
          "lastName": "Картишкін",
          "weight": "102",
          "id": "ed6e2d81-2ff6-436c-84a3-c7678daa63da",
          "present": true
      },
      {
          "firstName": "Андрій",
          "lastName": "Толбатов",
          "weight": "95.3",
          "tournamentCategoryIds": [
              "179b369a-9fe2-4c0a-a1bb-5ce5ff16c8c9",
              "a69cd04d-5492-42e4-9c2b-dc991a9e3d15",
              "7300f941-113a-4567-a9a2-5e633b555dca",
              "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
          ],
          "id": "d3b8ae2c-3258-40ce-8990-6b3478a9f03a",
          "present": true
      },
      {
          "tournamentCategoryIds": [
              "7300f941-113a-4567-a9a2-5e633b555dca",
              "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
          ],
          "firstName": "Михайло",
          "lastName": "Шевченко",
          "weight": "150",
          "id": "0969a1bb-b05e-4c3f-a9e3-33fda9b16d37",
          "present": true
      },
      {
          "tournamentCategoryIds": [
              "a8c8bf87-29b9-423d-b387-4c546de07fa6",
              "8fc3b2f4-c934-4ce5-bb80-3b384c33c973"
          ],
          "firstName": "Віктор",
          "lastName": "Кіктенко",
          "weight": "90",
          "id": "28d177bb-b5e5-4efc-9534-0e30fde500a9",
          "present": true
      },
      {
          "tournamentCategoryIds": [
              "b75851f8-bc4a-409b-8eff-bca2f3d3af94",
              "5a38530a-cb13-45de-8893-f376fb842a84"
          ],
          "firstName": "Іван",
          "lastName": "Бєлік",
          "weight": "80",
          "id": "8333b9db-eca2-4bbe-97c5-958d22bc1747",
          "present": true
      },
      {
          "tournamentCategoryIds": [
              "a8c8bf87-29b9-423d-b387-4c546de07fa6",
              "8fc3b2f4-c934-4ce5-bb80-3b384c33c973"
          ],
          "firstName": "Олег",
          "lastName": "Капінус",
          "weight": "65",
          "id": "587e3c35-48a4-459c-a0f8-8512472c1403",
          "present": true
      },
      {
          "tournamentCategoryIds": [
              "7145e7a5-809f-4581-96a9-09009f4ab0fd"
          ],
          "firstName": "Олексій",
          "lastName": "Повалкін",
          "weight": "70",
          "id": "3882bb16-c22e-4039-994f-e7035c615d13",
          "present": true
      },
      {
          "tournamentCategoryIds": [
              "7300f941-113a-4567-a9a2-5e633b555dca",
              "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
          ],
          "firstName": "Станіслав",
          "lastName": "Гулий",
          "weight": "105.7",
          "id": "fb756e7c-4c21-4060-9ddd-1a8e9e698e30",
          "present": true
      },
      {
          "tournamentCategoryIds": [
              "7ae3a387-953b-4d1c-abe9-1d8aafeae004",
              "d5e94274-26a8-48ce-8193-fc232d90a7d7"
          ],
          "firstName": "Валерія",
          "lastName": "Пилюк",
          "weight": "69.2",
          "id": "b04be8e6-fa22-4420-8951-6b9ebf2cc314",
          "present": true
      },
      {
          "tournamentCategoryIds": [
              "7300f941-113a-4567-a9a2-5e633b555dca",
              "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
          ],
          "firstName": "Олександр",
          "lastName": "Скрипник",
          "weight": "110.3",
          "id": "059c1bcb-4897-48c1-9298-a84b54a239b1",
          "present": true
      },
      {
          "tournamentCategoryIds": [
              "b75851f8-bc4a-409b-8eff-bca2f3d3af94",
              "5a38530a-cb13-45de-8893-f376fb842a84"
          ],
          "firstName": "Владислав",
          "lastName": "Сокотнюк",
          "weight": "85",
          "id": "488b3ce4-e772-4cff-a518-26d335f1d2ba",
          "present": true
      },
      {
          "tournamentCategoryIds": [
              "7300f941-113a-4567-a9a2-5e633b555dca",
              "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
          ],
          "firstName": "Гліб",
          "lastName": "Кривоносов",
          "weight": "97.2",
          "id": "2c513f1a-8f98-4dc2-b83a-a7c48f86c0e6",
          "present": true
      },
      {
          "tournamentCategoryIds": [
              "5a38530a-cb13-45de-8893-f376fb842a84",
              "b75851f8-bc4a-409b-8eff-bca2f3d3af94"
          ],
          "firstName": "Євгеній",
          "lastName": "Шахов",
          "weight": "84.6",
          "id": "a71c2d3a-5cbb-473d-8c1f-f4957c320ca7",
          "present": true
      },
      {
          "tournamentCategoryIds": [
              "7300f941-113a-4567-a9a2-5e633b555dca",
              "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
          ],
          "firstName": "Володимир",
          "lastName": "Кривобок",
          "weight": "154",
          "id": "329dba25-a265-4e6c-b48c-dbdc2cf1b161",
          "present": true
      },
      {
          "tournamentCategoryIds": [
              "25b0f044-9a01-42b5-b377-16accd14b5b3",
              "5b5125b7-09a1-410d-9d5d-1b5196b1c01a"
          ],
          "firstName": "В'ячеслав",
          "lastName": "Грінченко",
          "weight": "73.9",
          "id": "cde29451-66c5-4af3-a5c3-0c453543e190",
          "present": true
      },
      {
          "tournamentCategoryIds": [
              "179b369a-9fe2-4c0a-a1bb-5ce5ff16c8c9",
              "a69cd04d-5492-42e4-9c2b-dc991a9e3d15"
          ],
          "firstName": "Юрій",
          "lastName": "Біда",
          "weight": "94.5",
          "id": "49e90b47-31e2-4eb5-ad9a-2a38e8aa0fe6",
          "present": true
      },
      {
          "firstName": "Юлія",
          "lastName": "Гадаєва",
          "weight": "63.4",
          "tournamentCategoryIds": [
              "7ae3a387-953b-4d1c-abe9-1d8aafeae004",
              "d5e94274-26a8-48ce-8193-fc232d90a7d7"
          ],
          "id": "2ca86aa2-661e-4948-b34a-6083518005c6",
          "present": true
      },
      {
          "tournamentCategoryIds": [
              "7ae3a387-953b-4d1c-abe9-1d8aafeae004",
              "d5e94274-26a8-48ce-8193-fc232d90a7d7"
          ],
          "firstName": "Марія",
          "lastName": "Чумак",
          "weight": "50",
          "id": "2979f135-637c-4cfd-bfb3-4d9a86d8d0d3",
          "present": false
      },
      {
          "tournamentCategoryIds": [
              "7ae3a387-953b-4d1c-abe9-1d8aafeae004",
              "d5e94274-26a8-48ce-8193-fc232d90a7d7"
          ],
          "firstName": "Наталія",
          "lastName": "Йолкіна ",
          "weight": "50",
          "id": "bf875b13-89bf-4a55-b295-0d5c3426eb62",
          "present": false
      },
      {
          "firstName": "Юлія",
          "lastName": "Облочинська",
          "weight": "65.3",
          "tournamentCategoryIds": [
              "7ae3a387-953b-4d1c-abe9-1d8aafeae004",
              "d5e94274-26a8-48ce-8193-fc232d90a7d7"
          ],
          "id": "6fbc29ac-1114-49e8-9a57-4bd6884edfae",
          "present": true
      },
      {
          "firstName": "Ірина",
          "lastName": "Ус ",
          "weight": "59",
          "tournamentCategoryIds": [
              "7ae3a387-953b-4d1c-abe9-1d8aafeae004",
              "d5e94274-26a8-48ce-8193-fc232d90a7d7"
          ],
          "id": "71ba4a36-9f9c-4ca0-b936-e7dac36483d6",
          "present": true
      },
      {
          "firstName": "Денис",
          "lastName": "Слюнин",
          "weight": "82.6",
          "tournamentCategoryIds": [
              "b75851f8-bc4a-409b-8eff-bca2f3d3af94",
              "5a38530a-cb13-45de-8893-f376fb842a84",
              "17e7bcd3-1ea3-4edd-9b33-0f8e17fb9105"
          ],
          "id": "b6bc50af-c2ad-47f2-8e8d-6213953dcd45",
          "present": true
      },
      {
          "firstName": "Іван",
          "lastName": "Комарь ",
          "weight": "84.7",
          "tournamentCategoryIds": [
              "17e7bcd3-1ea3-4edd-9b33-0f8e17fb9105",
              "b75851f8-bc4a-409b-8eff-bca2f3d3af94",
              "5a38530a-cb13-45de-8893-f376fb842a84",
              "fc01e05d-1e01-4131-a3a7-8c1de14c7c51"
          ],
          "id": "5c9212fc-b994-454d-bad3-a8f75c1941c4",
          "present": true
      },
      {
          "firstName": "В'ячеслав",
          "lastName": "Хіхлов ",
          "weight": "79",
          "tournamentCategoryIds": [
              "a8c8bf87-29b9-423d-b387-4c546de07fa6",
              "8fc3b2f4-c934-4ce5-bb80-3b384c33c973"
          ],
          "id": "538f625c-eeb0-4f19-98c5-9dec1aaa7bbc",
          "present": true
      },
      {
          "tournamentCategoryIds": [
              "a8c8bf87-29b9-423d-b387-4c546de07fa6",
              "8fc3b2f4-c934-4ce5-bb80-3b384c33c973"
          ],
          "firstName": "Віталій",
          "lastName": "Завершинський",
          "weight": "100",
          "id": "4009968d-ac34-4407-8068-7e689e5c523c",
          "present": false
      },
      {
          "firstName": "Олексій",
          "lastName": "Пушкарь ",
          "weight": "95",
          "tournamentCategoryIds": [
              "a8c8bf87-29b9-423d-b387-4c546de07fa6",
              "8fc3b2f4-c934-4ce5-bb80-3b384c33c973"
          ],
          "id": "a969d801-0973-4372-ad9d-a4018aa9c909",
          "present": true
      },
      {
          "firstName": "Андрій",
          "lastName": "Заяров ",
          "weight": "75",
          "tournamentCategoryIds": [
              "7145e7a5-809f-4581-96a9-09009f4ab0fd"
          ],
          "id": "cd523dc2-84b8-4a0a-b129-a591fa8a3a13",
          "present": true
      },
      {
          "firstName": "Дмитро",
          "lastName": "Жирний",
          "weight": "71.3",
          "tournamentCategoryIds": [
              "7145e7a5-809f-4581-96a9-09009f4ab0fd"
          ],
          "id": "ea1c1852-7967-46bf-89e5-9a92fc300b63",
          "present": true
      },
      {
          "firstName": "Павло",
          "lastName": "Ус ",
          "weight": "65",
          "tournamentCategoryIds": [
              "a8c8bf87-29b9-423d-b387-4c546de07fa6",
              "8fc3b2f4-c934-4ce5-bb80-3b384c33c973",
              "7145e7a5-809f-4581-96a9-09009f4ab0fd"
          ],
          "id": "20c24839-e49c-4733-bc96-71fcf3884d74",
          "present": true
      },
      {
          "firstName": "Богдан",
          "lastName": "Зуяков ",
          "weight": "103.3",
          "tournamentCategoryIds": [
              "7300f941-113a-4567-a9a2-5e633b555dca",
              "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
          ],
          "id": "355337a7-e112-4f73-8e27-2d89a9b5d39b",
          "present": true
      },
      {
          "firstName": "Олег",
          "lastName": "Гаврелець",
          "weight": "104.8",
          "tournamentCategoryIds": [
              "7300f941-113a-4567-a9a2-5e633b555dca",
              "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
          ],
          "id": "35a069c0-2414-46c3-8001-65d81b38be10",
          "present": true
      },
      {
          "firstName": "Артем",
          "lastName": "Попов",
          "weight": "87.5",
          "tournamentCategoryIds": [
              "7300f941-113a-4567-a9a2-5e633b555dca",
              "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
          ],
          "id": "b5ea0ff3-edb6-434d-9ed6-6576da0a0eaa",
          "present": true
      },
      {
          "firstName": "Костянтин",
          "lastName": "Брехов",
          "weight": "109.6",
          "tournamentCategoryIds": [
              "7300f941-113a-4567-a9a2-5e633b555dca",
              "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
          ],
          "id": "2f64c9d9-99ce-4dee-bdbc-9605f6535807",
          "present": true
      },
      {
          "tournamentCategoryIds": [
              "7300f941-113a-4567-a9a2-5e633b555dca",
              "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
          ],
          "firstName": "Дмитро",
          "lastName": "Пономарьов",
          "weight": "105",
          "id": "2fac3781-324e-4081-9d3b-ba5e08590e5d",
          "present": false
      },
      {
          "firstName": "Олександр",
          "lastName": "Власов",
          "weight": "122.3",
          "tournamentCategoryIds": [
              "7300f941-113a-4567-a9a2-5e633b555dca",
              "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
          ],
          "id": "12747830-f88c-493a-a16d-5c5f8baea9d0",
          "present": true
      },
      {
          "firstName": "Дмитро",
          "lastName": "Більдій",
          "weight": "95",
          "tournamentCategoryIds": [
              "a69cd04d-5492-42e4-9c2b-dc991a9e3d15",
              "179b369a-9fe2-4c0a-a1bb-5ce5ff16c8c9"
          ],
          "id": "bf6c19cb-ddc0-40a2-90bb-3f43dd95ed1b",
          "present": true
      },
      {
          "tournamentCategoryIds": [
              "179b369a-9fe2-4c0a-a1bb-5ce5ff16c8c9",
              "a69cd04d-5492-42e4-9c2b-dc991a9e3d15"
          ],
          "firstName": "Богдан",
          "lastName": "Шепа ",
          "weight": "95",
          "id": "cef3e4c4-fbdc-417a-b461-2af4147f0808",
          "present": false
      },
      {
          "firstName": "Віталій",
          "lastName": "Медвідь",
          "weight": "92.9",
          "tournamentCategoryIds": [
              "179b369a-9fe2-4c0a-a1bb-5ce5ff16c8c9",
              "a69cd04d-5492-42e4-9c2b-dc991a9e3d15"
          ],
          "id": "d8dbf172-20b8-464e-b35a-6b2d02cd980c",
          "present": true
      },
      {
          "firstName": "Микита",
          "lastName": "Попов ",
          "weight": "85.5",
          "tournamentCategoryIds": [
              "179b369a-9fe2-4c0a-a1bb-5ce5ff16c8c9",
              "a69cd04d-5492-42e4-9c2b-dc991a9e3d15"
          ],
          "id": "70c94d5a-1516-4133-b083-0a09916bbd86",
          "present": true
      },
      {
          "firstName": "Іван",
          "lastName": "Спесивцев ",
          "weight": "110",
          "tournamentCategoryIds": [
              "7300f941-113a-4567-a9a2-5e633b555dca",
              "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
          ],
          "id": "84f1a6d9-fecd-4bcb-ab78-1b1649449c7f",
          "present": true
      },
      {
          "firstName": "Вадим",
          "lastName": "Жаріков",
          "weight": "93",
          "tournamentCategoryIds": [
              "179b369a-9fe2-4c0a-a1bb-5ce5ff16c8c9",
              "a69cd04d-5492-42e4-9c2b-dc991a9e3d15"
          ],
          "id": "4c231c9c-798a-403b-8205-4aea7c8a50c5",
          "present": true
      },
      {
          "firstName": "Євгеній",
          "lastName": "Романенко",
          "weight": "95",
          "tournamentCategoryIds": [
              "179b369a-9fe2-4c0a-a1bb-5ce5ff16c8c9",
              "a69cd04d-5492-42e4-9c2b-dc991a9e3d15"
          ],
          "id": "e095f66c-10f9-4a03-bedb-30246599f1b0",
          "present": true
      },
      {
          "firstName": "Давид",
          "lastName": "Бороденков ",
          "weight": "87",
          "tournamentCategoryIds": [
              "179b369a-9fe2-4c0a-a1bb-5ce5ff16c8c9",
              "a69cd04d-5492-42e4-9c2b-dc991a9e3d15"
          ],
          "id": "e609534f-77c3-45bb-84f0-feef3e62be65",
          "present": true
      },
      {
          "tournamentCategoryIds": [
              "b75851f8-bc4a-409b-8eff-bca2f3d3af94",
              "5a38530a-cb13-45de-8893-f376fb842a84"
          ],
          "firstName": "Олексій",
          "lastName": "Євтухов",
          "weight": "85",
          "id": "a43ee110-456f-4755-bb79-fcf2b2af94e4",
          "present": false
      },
      {
          "firstName": "Олександр",
          "lastName": "Плішивий ",
          "weight": "82",
          "tournamentCategoryIds": [
              "b75851f8-bc4a-409b-8eff-bca2f3d3af94",
              "5a38530a-cb13-45de-8893-f376fb842a84"
          ],
          "id": "eb5fbd70-5d23-43cc-831e-ec903d4672d7",
          "present": true
      },
      {
          "firstName": "Давид",
          "lastName": "Попов ",
          "weight": "83.7",
          "tournamentCategoryIds": [
              "b75851f8-bc4a-409b-8eff-bca2f3d3af94",
              "5a38530a-cb13-45de-8893-f376fb842a84"
          ],
          "id": "8fcd2fe7-ac75-4a46-9f4e-4eb72a7d2b83",
          "present": true
      },
      {
          "firstName": "Максим",
          "lastName": "Мазурін",
          "weight": "84.9",
          "tournamentCategoryIds": [
              "b75851f8-bc4a-409b-8eff-bca2f3d3af94",
              "5a38530a-cb13-45de-8893-f376fb842a84"
          ],
          "id": "e4e67a6c-bcae-4ede-bed2-9c92270295a1",
          "present": true
      },
      {
          "firstName": "Іван",
          "lastName": "Мотаєв",
          "weight": "84.5",
          "tournamentCategoryIds": [
              "b75851f8-bc4a-409b-8eff-bca2f3d3af94",
              "5a38530a-cb13-45de-8893-f376fb842a84"
          ],
          "id": "8e08bf49-638f-4e61-8afc-7be1f8bbe133",
          "present": true
      },
      {
          "firstName": "Олексій",
          "lastName": "Фомініченко",
          "weight": "84.4",
          "tournamentCategoryIds": [
              "b75851f8-bc4a-409b-8eff-bca2f3d3af94",
              "5a38530a-cb13-45de-8893-f376fb842a84"
          ],
          "id": "53e3fbe6-86c8-44ad-b344-3029b00cf076",
          "present": true
      },
      {
          "firstName": "Євгеній",
          "lastName": "Черемісін ",
          "weight": "83.7",
          "tournamentCategoryIds": [
              "b75851f8-bc4a-409b-8eff-bca2f3d3af94",
              "5a38530a-cb13-45de-8893-f376fb842a84"
          ],
          "id": "1b8a98bd-2bf9-41e9-87ac-d990c81a2cd7",
          "present": true
      },
      {
          "firstName": "Артем",
          "lastName": "Шпаков ",
          "weight": "79.6",
          "tournamentCategoryIds": [
              "b75851f8-bc4a-409b-8eff-bca2f3d3af94",
              "5a38530a-cb13-45de-8893-f376fb842a84"
          ],
          "id": "aada8c9c-b735-4818-94eb-6818aa190693",
          "present": true
      },
      {
          "firstName": "Андрій",
          "lastName": "Зуяков ",
          "weight": "75.5",
          "tournamentCategoryIds": [
              "25b0f044-9a01-42b5-b377-16accd14b5b3",
              "5b5125b7-09a1-410d-9d5d-1b5196b1c01a"
          ],
          "id": "4131dd33-9f0e-4623-8e95-d59fbbcb161f",
          "present": true
      },
      {
          "tournamentCategoryIds": [
              "25b0f044-9a01-42b5-b377-16accd14b5b3",
              "5b5125b7-09a1-410d-9d5d-1b5196b1c01a"
          ],
          "firstName": "Дмитро",
          "lastName": "Новік ",
          "weight": "75",
          "id": "dd138442-3b90-47a4-82a7-ae264d2dacda",
          "present": false
      },
      {
          "firstName": "Андрій",
          "lastName": "Чукарин ",
          "weight": "73.7",
          "tournamentCategoryIds": [
              "25b0f044-9a01-42b5-b377-16accd14b5b3",
              "5b5125b7-09a1-410d-9d5d-1b5196b1c01a"
          ],
          "id": "67ead343-de74-4032-9682-d5b0ee831a7c",
          "present": true
      },
      {
          "firstName": "Владислав",
          "lastName": "Юрченко",
          "weight": "73.5",
          "tournamentCategoryIds": [
              "25b0f044-9a01-42b5-b377-16accd14b5b3",
              "5b5125b7-09a1-410d-9d5d-1b5196b1c01a"
          ],
          "id": "da1fdf6d-493e-4658-977f-95f55973ca0e",
          "present": true
      },
      {
          "tournamentCategoryIds": [
              "25b0f044-9a01-42b5-b377-16accd14b5b3",
              "5b5125b7-09a1-410d-9d5d-1b5196b1c01a"
          ],
          "firstName": "Евгеній",
          "lastName": "Каплун",
          "weight": "75",
          "id": "0f3e3c2b-b01d-4a2f-ac8f-8c33fde00ea5",
          "present": false
      },
      {
          "firstName": "Ілля",
          "lastName": "Мазніченко",
          "weight": "68.3",
          "tournamentCategoryIds": [
              "25b0f044-9a01-42b5-b377-16accd14b5b3",
              "5b5125b7-09a1-410d-9d5d-1b5196b1c01a"
          ],
          "id": "a04e619f-c5ac-48ba-baaa-2e3bfbcd3892",
          "present": true
      },
      {
          "tournamentCategoryIds": [
              "25b0f044-9a01-42b5-b377-16accd14b5b3",
              "5b5125b7-09a1-410d-9d5d-1b5196b1c01a"
          ],
          "firstName": "Олександр",
          "lastName": "Конюшенко",
          "weight": "75",
          "id": "47ec3269-280c-4b48-b517-14f497da8824",
          "present": false
      },
      {
          "firstName": "Олександр",
          "lastName": "Біловол ",
          "weight": "69.7",
          "tournamentCategoryIds": [
              "25b0f044-9a01-42b5-b377-16accd14b5b3",
              "5b5125b7-09a1-410d-9d5d-1b5196b1c01a"
          ],
          "id": "460bb6d1-4f6b-4cf9-a174-98b7bad141ae",
          "present": true
      },
      {
          "firstName": "Хаям",
          "lastName": "Багіров",
          "weight": "67.3",
          "tournamentCategoryIds": [
              "25b0f044-9a01-42b5-b377-16accd14b5b3",
              "5b5125b7-09a1-410d-9d5d-1b5196b1c01a"
          ],
          "id": "cadd8fdc-9c0d-4be7-aee0-f26a70595ab5",
          "present": true
      },
      {
          "firstName": "Дмитро",
          "lastName": "Рудич",
          "weight": "69.4",
          "tournamentCategoryIds": [
              "25b0f044-9a01-42b5-b377-16accd14b5b3",
              "5b5125b7-09a1-410d-9d5d-1b5196b1c01a"
          ],
          "id": "64c969d3-e0a2-4ff8-a32a-dc03a024b2c0",
          "present": true
      },
      {
          "firstName": "Тимур",
          "lastName": "Кувандіков",
          "weight": "73.8",
          "tournamentCategoryIds": [
              "25b0f044-9a01-42b5-b377-16accd14b5b3",
              "5b5125b7-09a1-410d-9d5d-1b5196b1c01a"
          ],
          "id": "f5daf1a7-3931-48db-b81c-987978799486",
          "present": true
      },
      {
          "firstName": "Артем",
          "lastName": "Босенко",
          "weight": "66.5",
          "tournamentCategoryIds": [
              "25b0f044-9a01-42b5-b377-16accd14b5b3",
              "5b5125b7-09a1-410d-9d5d-1b5196b1c01a"
          ],
          "id": "b2116fd3-d857-4d8b-8adf-49e29ac9285b",
          "present": true
      }
  ],
  "results": {
      "fc01e05d-1e01-4131-a3a7-8c1de14c7c51": [
          {
              "tournamentCategoryIds": [
                  "17e7bcd3-1ea3-4edd-9b33-0f8e17fb9105",
                  "fc01e05d-1e01-4131-a3a7-8c1de14c7c51"
              ],
              "firstName": "Володимир",
              "lastName": "Сємаєв",
              "weight": "84.6",
              "id": "9fef19be-7cf4-4c28-8eea-dbd4ca5cde11",
              "present": true,
              "stats": {
                  "0": {
                      "result": "win"
                  },
                  "1": {
                      "result": "win"
                  },
                  "2": {
                      "result": "win"
                  },
                  "3": {
                      "result": "win"
                  },
                  "4": {
                      "result": "idle"
                  }
              }
          },
          {
              "firstName": "Андрій",
              "lastName": "Кулик",
              "weight": "72.2",
              "tournamentCategoryIds": [
                  "17e7bcd3-1ea3-4edd-9b33-0f8e17fb9105",
                  "fc01e05d-1e01-4131-a3a7-8c1de14c7c51"
              ],
              "id": "fbedd4f4-8e6f-42ee-89b8-69acab31a064",
              "present": true,
              "stats": {
                  "0": {
                      "result": "win"
                  },
                  "1": {
                      "result": "lose"
                  },
                  "2": {
                      "result": "win"
                  },
                  "3": {
                      "result": "lose"
                  }
              }
          },
          {
              "tournamentCategoryIds": [
                  "fc01e05d-1e01-4131-a3a7-8c1de14c7c51",
                  "17e7bcd3-1ea3-4edd-9b33-0f8e17fb9105"
              ],
              "firstName": "Олександр",
              "lastName": "Семоненко",
              "weight": "65",
              "id": "a628452d-8cc3-4014-b718-7e94e11ddb4c",
              "present": true,
              "stats": {
                  "0": {
                      "result": "lose"
                  },
                  "1": {
                      "result": "win"
                  },
                  "2": {
                      "result": "lose"
                  }
              }
          },
          {
              "firstName": "Іван",
              "lastName": "Комарь ",
              "weight": "84.7",
              "tournamentCategoryIds": [
                  "17e7bcd3-1ea3-4edd-9b33-0f8e17fb9105",
                  "b75851f8-bc4a-409b-8eff-bca2f3d3af94",
                  "5a38530a-cb13-45de-8893-f376fb842a84",
                  "fc01e05d-1e01-4131-a3a7-8c1de14c7c51"
              ],
              "id": "5c9212fc-b994-454d-bad3-a8f75c1941c4",
              "present": true,
              "stats": {
                  "0": {
                      "result": "lose"
                  },
                  "1": {
                      "result": "lose"
                  }
              }
          }
      ],
      "a8c8bf87-29b9-423d-b387-4c546de07fa6": [
          {
              "firstName": "В'ячеслав",
              "lastName": "Хіхлов ",
              "weight": "79",
              "tournamentCategoryIds": [
                  "a8c8bf87-29b9-423d-b387-4c546de07fa6",
                  "8fc3b2f4-c934-4ce5-bb80-3b384c33c973"
              ],
              "id": "538f625c-eeb0-4f19-98c5-9dec1aaa7bbc",
              "present": true,
              "stats": {
                  "0": {
                      "result": "win"
                  },
                  "1": {
                      "result": "win"
                  },
                  "2": {
                      "result": "win"
                  },
                  "3": {
                      "result": "win"
                  },
                  "4": {
                      "result": "win"
                  },
                  "5": {
                      "result": "idle"
                  }
              }
          },
          {
              "firstName": "Олексій",
              "lastName": "Пушкарь ",
              "weight": "95",
              "tournamentCategoryIds": [
                  "a8c8bf87-29b9-423d-b387-4c546de07fa6",
                  "8fc3b2f4-c934-4ce5-bb80-3b384c33c973"
              ],
              "id": "a969d801-0973-4372-ad9d-a4018aa9c909",
              "present": true,
              "stats": {
                  "0": {
                      "result": "win"
                  },
                  "1": {
                      "result": "win"
                  },
                  "2": {
                      "result": "lose"
                  },
                  "3": {
                      "result": "win"
                  },
                  "4": {
                      "result": "lose"
                  }
              }
          },
          {
              "tournamentCategoryIds": [
                  "a8c8bf87-29b9-423d-b387-4c546de07fa6",
                  "8fc3b2f4-c934-4ce5-bb80-3b384c33c973"
              ],
              "firstName": "Віктор",
              "lastName": "Кіктенко",
              "weight": "90",
              "id": "28d177bb-b5e5-4efc-9534-0e30fde500a9",
              "present": true,
              "stats": {
                  "0": {
                      "result": "win"
                  },
                  "1": {
                      "result": "lose"
                  },
                  "2": {
                      "result": "win"
                  },
                  "3": {
                      "result": "lose"
                  }
              }
          },
          {
              "firstName": "Павло",
              "lastName": "Ус ",
              "weight": "65",
              "tournamentCategoryIds": [
                  "a8c8bf87-29b9-423d-b387-4c546de07fa6",
                  "8fc3b2f4-c934-4ce5-bb80-3b384c33c973",
                  "7145e7a5-809f-4581-96a9-09009f4ab0fd"
              ],
              "id": "20c24839-e49c-4733-bc96-71fcf3884d74",
              "present": true,
              "stats": {
                  "0": {
                      "result": "lose"
                  },
                  "1": {
                      "result": "win"
                  },
                  "2": {
                      "result": "lose"
                  }
              }
          },
          {
              "tournamentCategoryIds": [
                  "a8c8bf87-29b9-423d-b387-4c546de07fa6",
                  "8fc3b2f4-c934-4ce5-bb80-3b384c33c973"
              ],
              "firstName": "Олег",
              "lastName": "Капінус",
              "weight": "65",
              "id": "587e3c35-48a4-459c-a0f8-8512472c1403",
              "present": true,
              "stats": {
                  "0": {
                      "result": "lose"
                  },
                  "1": {
                      "result": "lose"
                  }
              }
          }
      ],
      "7ae3a387-953b-4d1c-abe9-1d8aafeae004": [
          {
              "firstName": "Юлія",
              "lastName": "Гадаєва",
              "weight": "63.4",
              "tournamentCategoryIds": [
                  "7ae3a387-953b-4d1c-abe9-1d8aafeae004",
                  "d5e94274-26a8-48ce-8193-fc232d90a7d7"
              ],
              "id": "2ca86aa2-661e-4948-b34a-6083518005c6",
              "present": true,
              "stats": {
                  "0": {
                      "result": "win"
                  },
                  "1": {
                      "result": "win"
                  },
                  "2": {
                      "result": "win"
                  },
                  "3": {
                      "result": "win"
                  },
                  "4": {
                      "result": "idle"
                  }
              }
          },
          {
              "firstName": "Ірина",
              "lastName": "Ус ",
              "weight": "59",
              "tournamentCategoryIds": [
                  "7ae3a387-953b-4d1c-abe9-1d8aafeae004",
                  "d5e94274-26a8-48ce-8193-fc232d90a7d7"
              ],
              "id": "71ba4a36-9f9c-4ca0-b936-e7dac36483d6",
              "present": true,
              "stats": {
                  "0": {
                      "result": "lose"
                  },
                  "1": {
                      "result": "win"
                  },
                  "2": {
                      "result": "win"
                  },
                  "3": {
                      "result": "lose"
                  }
              }
          },
          {
              "tournamentCategoryIds": [
                  "7ae3a387-953b-4d1c-abe9-1d8aafeae004",
                  "d5e94274-26a8-48ce-8193-fc232d90a7d7"
              ],
              "firstName": "Валерія",
              "lastName": "Пилюк",
              "weight": "69.2",
              "id": "b04be8e6-fa22-4420-8951-6b9ebf2cc314",
              "present": true,
              "stats": {
                  "0": {
                      "result": "win"
                  },
                  "1": {
                      "result": "lose"
                  },
                  "2": {
                      "result": "lose"
                  }
              }
          },
          {
              "firstName": "Юлія",
              "lastName": "Облочинська",
              "weight": "65.3",
              "tournamentCategoryIds": [
                  "7ae3a387-953b-4d1c-abe9-1d8aafeae004",
                  "d5e94274-26a8-48ce-8193-fc232d90a7d7"
              ],
              "id": "6fbc29ac-1114-49e8-9a57-4bd6884edfae",
              "present": true,
              "stats": {
                  "0": {
                      "result": "lose"
                  },
                  "1": {
                      "result": "lose"
                  }
              }
          }
      ],
      "7145e7a5-809f-4581-96a9-09009f4ab0fd": [
          {
              "firstName": "Дмитро",
              "lastName": "Жирний",
              "weight": "71.3",
              "tournamentCategoryIds": [
                  "7145e7a5-809f-4581-96a9-09009f4ab0fd"
              ],
              "id": "ea1c1852-7967-46bf-89e5-9a92fc300b63",
              "present": true,
              "stats": {
                  "0": {
                      "result": "win"
                  },
                  "1": {
                      "result": "win"
                  },
                  "2": {
                      "result": "win"
                  },
                  "3": {
                      "result": "win"
                  },
                  "4": {
                      "result": "idle"
                  }
              }
          },
          {
              "firstName": "Павло",
              "lastName": "Ус ",
              "weight": "65",
              "tournamentCategoryIds": [
                  "a8c8bf87-29b9-423d-b387-4c546de07fa6",
                  "8fc3b2f4-c934-4ce5-bb80-3b384c33c973",
                  "7145e7a5-809f-4581-96a9-09009f4ab0fd"
              ],
              "id": "20c24839-e49c-4733-bc96-71fcf3884d74",
              "present": true,
              "stats": {
                  "0": {
                      "result": "win"
                  },
                  "1": {
                      "result": "lose"
                  },
                  "2": {
                      "result": "win"
                  },
                  "3": {
                      "result": "lose"
                  }
              }
          },
          {
              "firstName": "Андрій",
              "lastName": "Заяров ",
              "weight": "75",
              "tournamentCategoryIds": [
                  "7145e7a5-809f-4581-96a9-09009f4ab0fd"
              ],
              "id": "cd523dc2-84b8-4a0a-b129-a591fa8a3a13",
              "present": true,
              "stats": {
                  "0": {
                      "result": "lose"
                  },
                  "1": {
                      "result": "win"
                  },
                  "2": {
                      "result": "lose"
                  }
              }
          },
          {
              "tournamentCategoryIds": [
                  "7145e7a5-809f-4581-96a9-09009f4ab0fd"
              ],
              "firstName": "Олексій",
              "lastName": "Повалкін",
              "weight": "70",
              "id": "3882bb16-c22e-4039-994f-e7035c615d13",
              "present": true,
              "stats": {
                  "0": {
                      "result": "lose"
                  },
                  "1": {
                      "result": "lose"
                  }
              }
          }
      ],
      "25b0f044-9a01-42b5-b377-16accd14b5b3": [
          {
              "firstName": "Тимур",
              "lastName": "Кувандіков",
              "weight": "73.8",
              "tournamentCategoryIds": [
                  "25b0f044-9a01-42b5-b377-16accd14b5b3",
                  "5b5125b7-09a1-410d-9d5d-1b5196b1c01a"
              ],
              "id": "f5daf1a7-3931-48db-b81c-987978799486",
              "present": true,
              "stats": {
                  "0": {
                      "result": "win"
                  },
                  "1": {
                      "result": "win"
                  },
                  "2": {
                      "result": "win"
                  },
                  "3": {
                      "result": "win"
                  },
                  "4": {
                      "result": "win"
                  },
                  "5": {
                      "result": "win"
                  },
                  "6": {
                      "result": "win"
                  },
                  "7": {
                      "result": "idle"
                  }
              }
          },
          {
              "firstName": "Владислав",
              "lastName": "Юрченко",
              "weight": "73.5",
              "tournamentCategoryIds": [
                  "25b0f044-9a01-42b5-b377-16accd14b5b3",
                  "5b5125b7-09a1-410d-9d5d-1b5196b1c01a"
              ],
              "id": "da1fdf6d-493e-4658-977f-95f55973ca0e",
              "present": true,
              "stats": {
                  "0": {
                      "result": "win"
                  },
                  "1": {
                      "result": "win"
                  },
                  "2": {
                      "result": "win"
                  },
                  "3": {
                      "result": "lose"
                  },
                  "4": {
                      "result": "win"
                  },
                  "5": {
                      "result": "win"
                  },
                  "6": {
                      "result": "lose"
                  }
              }
          },
          {
              "firstName": "Олександр",
              "lastName": "Біловол ",
              "weight": "69.7",
              "tournamentCategoryIds": [
                  "25b0f044-9a01-42b5-b377-16accd14b5b3",
                  "5b5125b7-09a1-410d-9d5d-1b5196b1c01a"
              ],
              "id": "460bb6d1-4f6b-4cf9-a174-98b7bad141ae",
              "present": true,
              "stats": {
                  "0": {
                      "result": "win"
                  },
                  "1": {
                      "result": "lose"
                  },
                  "2": {
                      "result": "win"
                  },
                  "3": {
                      "result": "win"
                  },
                  "4": {
                      "result": "win"
                  },
                  "5": {
                      "result": "lose"
                  }
              }
          },
          {
              "tournamentCategoryIds": [
                  "25b0f044-9a01-42b5-b377-16accd14b5b3",
                  "5b5125b7-09a1-410d-9d5d-1b5196b1c01a"
              ],
              "firstName": "Олександр",
              "lastName": "Циганій",
              "weight": "73.6",
              "id": "844d8167-2d7f-4f3e-9fd4-f89711edeafb",
              "present": true,
              "stats": {
                  "0": {
                      "result": "win"
                  },
                  "1": {
                      "result": "win"
                  },
                  "2": {
                      "result": "lose"
                  },
                  "3": {
                      "result": "win"
                  },
                  "4": {
                      "result": "lose"
                  }
              }
          },
          {
              "firstName": "Андрій",
              "lastName": "Зуяков ",
              "weight": "75.5",
              "tournamentCategoryIds": [
                  "25b0f044-9a01-42b5-b377-16accd14b5b3",
                  "5b5125b7-09a1-410d-9d5d-1b5196b1c01a"
              ],
              "id": "4131dd33-9f0e-4623-8e95-d59fbbcb161f",
              "present": true,
              "stats": {
                  "0": {
                      "result": "win"
                  },
                  "1": {
                      "result": "lose"
                  },
                  "2": {
                      "result": "win"
                  },
                  "3": {
                      "result": "lose"
                  }
              }
          },
          {
              "firstName": "Ілля",
              "lastName": "Мазніченко",
              "weight": "68.3",
              "tournamentCategoryIds": [
                  "25b0f044-9a01-42b5-b377-16accd14b5b3",
                  "5b5125b7-09a1-410d-9d5d-1b5196b1c01a"
              ],
              "id": "a04e619f-c5ac-48ba-baaa-2e3bfbcd3892",
              "present": true,
              "stats": {
                  "0": {
                      "result": "lose"
                  },
                  "1": {
                      "result": "win"
                  },
                  "2": {
                      "result": "win"
                  },
                  "3": {
                      "result": "lose"
                  }
              }
          },
          {
              "firstName": "Дмитро",
              "lastName": "Рудич",
              "weight": "69.4",
              "tournamentCategoryIds": [
                  "25b0f044-9a01-42b5-b377-16accd14b5b3",
                  "5b5125b7-09a1-410d-9d5d-1b5196b1c01a"
              ],
              "id": "64c969d3-e0a2-4ff8-a32a-dc03a024b2c0",
              "present": true,
              "stats": {
                  "0": {
                      "result": "win"
                  },
                  "1": {
                      "result": "lose"
                  },
                  "2": {
                      "result": "lose"
                  }
              }
          },
          {
              "firstName": "Андрій",
              "lastName": "Чукарин ",
              "weight": "73.7",
              "tournamentCategoryIds": [
                  "25b0f044-9a01-42b5-b377-16accd14b5b3",
                  "5b5125b7-09a1-410d-9d5d-1b5196b1c01a"
              ],
              "id": "67ead343-de74-4032-9682-d5b0ee831a7c",
              "present": true,
              "stats": {
                  "0": {
                      "result": "lose"
                  },
                  "1": {
                      "result": "win"
                  },
                  "2": {
                      "result": "lose"
                  }
              }
          },
          {
              "tournamentCategoryIds": [
                  "25b0f044-9a01-42b5-b377-16accd14b5b3",
                  "5b5125b7-09a1-410d-9d5d-1b5196b1c01a"
              ],
              "firstName": "В'ячеслав",
              "lastName": "Грінченко",
              "weight": "73.9",
              "id": "cde29451-66c5-4af3-a5c3-0c453543e190",
              "present": true,
              "stats": {
                  "0": {
                      "result": "lose"
                  },
                  "1": {
                      "result": "win"
                  },
                  "2": {
                      "result": "lose"
                  }
              }
          },
          {
              "tournamentCategoryIds": [
                  "25b0f044-9a01-42b5-b377-16accd14b5b3",
                  "5b5125b7-09a1-410d-9d5d-1b5196b1c01a"
              ],
              "firstName": "Данило",
              "lastName": "Бобровський",
              "weight": "75.4",
              "id": "9f09a533-7670-4f0c-b07d-bc2b59c3c7dd",
              "present": true,
              "stats": {
                  "0": {
                      "result": "lose"
                  },
                  "1": {
                      "result": "lose"
                  }
              }
          },
          {
              "firstName": "Артем",
              "lastName": "Босенко",
              "weight": "66.5",
              "tournamentCategoryIds": [
                  "25b0f044-9a01-42b5-b377-16accd14b5b3",
                  "5b5125b7-09a1-410d-9d5d-1b5196b1c01a"
              ],
              "id": "b2116fd3-d857-4d8b-8adf-49e29ac9285b",
              "present": true,
              "stats": {
                  "0": {
                      "result": "lose"
                  },
                  "1": {
                      "result": "lose"
                  }
              }
          },
          {
              "firstName": "Хаям",
              "lastName": "Багіров",
              "weight": "67.3",
              "tournamentCategoryIds": [
                  "25b0f044-9a01-42b5-b377-16accd14b5b3",
                  "5b5125b7-09a1-410d-9d5d-1b5196b1c01a"
              ],
              "id": "cadd8fdc-9c0d-4be7-aee0-f26a70595ab5",
              "present": true,
              "stats": {
                  "0": {
                      "result": "lose"
                  },
                  "1": {
                      "result": "lose"
                  }
              }
          }
      ],
      "8fc3b2f4-c934-4ce5-bb80-3b384c33c973": [
          {
              "firstName": "В'ячеслав",
              "lastName": "Хіхлов ",
              "weight": "79",
              "tournamentCategoryIds": [
                  "a8c8bf87-29b9-423d-b387-4c546de07fa6",
                  "8fc3b2f4-c934-4ce5-bb80-3b384c33c973"
              ],
              "id": "538f625c-eeb0-4f19-98c5-9dec1aaa7bbc",
              "present": true,
              "stats": {
                  "0": {
                      "result": "win"
                  },
                  "1": {
                      "result": "win"
                  },
                  "2": {
                      "result": "win"
                  },
                  "3": {
                      "result": "win"
                  },
                  "4": {
                      "result": "win"
                  },
                  "5": {
                      "result": "idle"
                  }
              }
          },
          {
              "firstName": "Олексій",
              "lastName": "Пушкарь ",
              "weight": "95",
              "tournamentCategoryIds": [
                  "a8c8bf87-29b9-423d-b387-4c546de07fa6",
                  "8fc3b2f4-c934-4ce5-bb80-3b384c33c973"
              ],
              "id": "a969d801-0973-4372-ad9d-a4018aa9c909",
              "present": true,
              "stats": {
                  "0": {
                      "result": "win"
                  },
                  "1": {
                      "result": "win"
                  },
                  "2": {
                      "result": "lose"
                  },
                  "3": {
                      "result": "win"
                  },
                  "4": {
                      "result": "lose"
                  }
              }
          },
          {
              "firstName": "Павло",
              "lastName": "Ус ",
              "weight": "65",
              "tournamentCategoryIds": [
                  "a8c8bf87-29b9-423d-b387-4c546de07fa6",
                  "8fc3b2f4-c934-4ce5-bb80-3b384c33c973",
                  "7145e7a5-809f-4581-96a9-09009f4ab0fd"
              ],
              "id": "20c24839-e49c-4733-bc96-71fcf3884d74",
              "present": true,
              "stats": {
                  "0": {
                      "result": "win"
                  },
                  "1": {
                      "result": "lose"
                  },
                  "2": {
                      "result": "win"
                  },
                  "3": {
                      "result": "lose"
                  }
              }
          },
          {
              "tournamentCategoryIds": [
                  "a8c8bf87-29b9-423d-b387-4c546de07fa6",
                  "8fc3b2f4-c934-4ce5-bb80-3b384c33c973"
              ],
              "firstName": "Віктор",
              "lastName": "Кіктенко",
              "weight": "90",
              "id": "28d177bb-b5e5-4efc-9534-0e30fde500a9",
              "present": true,
              "stats": {
                  "0": {
                      "result": "lose"
                  },
                  "1": {
                      "result": "win"
                  },
                  "2": {
                      "result": "lose"
                  }
              }
          },
          {
              "tournamentCategoryIds": [
                  "a8c8bf87-29b9-423d-b387-4c546de07fa6",
                  "8fc3b2f4-c934-4ce5-bb80-3b384c33c973"
              ],
              "firstName": "Олег",
              "lastName": "Капінус",
              "weight": "65",
              "id": "587e3c35-48a4-459c-a0f8-8512472c1403",
              "present": true,
              "stats": {
                  "0": {
                      "result": "lose"
                  },
                  "1": {
                      "result": "lose"
                  }
              }
          }
      ],
      "b75851f8-bc4a-409b-8eff-bca2f3d3af94": [
          {
              "firstName": "Давид",
              "lastName": "Попов ",
              "weight": "83.7",
              "tournamentCategoryIds": [
                  "b75851f8-bc4a-409b-8eff-bca2f3d3af94",
                  "5a38530a-cb13-45de-8893-f376fb842a84"
              ],
              "id": "8fcd2fe7-ac75-4a46-9f4e-4eb72a7d2b83",
              "present": true,
              "stats": {
                  "0": {
                      "result": "win"
                  },
                  "1": {
                      "result": "win"
                  },
                  "2": {
                      "result": "win"
                  },
                  "3": {
                      "result": "win"
                  },
                  "4": {
                      "result": "win"
                  },
                  "5": {
                      "result": "win"
                  },
                  "6": {
                      "result": "win"
                  },
                  "7": {
                      "result": "idle"
                  }
              }
          },
          {
              "firstName": "Іван",
              "lastName": "Мотаєв",
              "weight": "84.5",
              "tournamentCategoryIds": [
                  "b75851f8-bc4a-409b-8eff-bca2f3d3af94",
                  "5a38530a-cb13-45de-8893-f376fb842a84"
              ],
              "id": "8e08bf49-638f-4e61-8afc-7be1f8bbe133",
              "present": true,
              "stats": {
                  "0": {
                      "result": "win"
                  },
                  "1": {
                      "result": "win"
                  },
                  "2": {
                      "result": "win"
                  },
                  "3": {
                      "result": "lose"
                  },
                  "4": {
                      "result": "win"
                  },
                  "5": {
                      "result": "win"
                  },
                  "6": {
                      "result": "lose"
                  }
              }
          },
          {
              "firstName": "Олексій",
              "lastName": "Фомініченко",
              "weight": "84.4",
              "tournamentCategoryIds": [
                  "b75851f8-bc4a-409b-8eff-bca2f3d3af94",
                  "5a38530a-cb13-45de-8893-f376fb842a84"
              ],
              "id": "53e3fbe6-86c8-44ad-b344-3029b00cf076",
              "present": true,
              "stats": {
                  "0": {
                      "result": "lose"
                  },
                  "1": {
                      "result": "win"
                  },
                  "2": {
                      "result": "win"
                  },
                  "3": {
                      "result": "win"
                  },
                  "4": {
                      "result": "win"
                  },
                  "5": {
                      "result": "lose"
                  }
              }
          },
          {
              "firstName": "Олександр",
              "lastName": "Плішивий ",
              "weight": "82",
              "tournamentCategoryIds": [
                  "b75851f8-bc4a-409b-8eff-bca2f3d3af94",
                  "5a38530a-cb13-45de-8893-f376fb842a84"
              ],
              "id": "eb5fbd70-5d23-43cc-831e-ec903d4672d7",
              "present": true,
              "stats": {
                  "0": {
                      "result": "win"
                  },
                  "1": {
                      "result": "lose"
                  },
                  "2": {
                      "result": "win"
                  },
                  "3": {
                      "result": "win"
                  },
                  "4": {
                      "result": "lose"
                  }
              }
          },
          {
              "tournamentCategoryIds": [
                  "b75851f8-bc4a-409b-8eff-bca2f3d3af94",
                  "5a38530a-cb13-45de-8893-f376fb842a84"
              ],
              "firstName": "Іван",
              "lastName": "Бєлік",
              "weight": "80",
              "id": "8333b9db-eca2-4bbe-97c5-958d22bc1747",
              "present": true,
              "stats": {
                  "0": {
                      "result": "win"
                  },
                  "1": {
                      "result": "win"
                  },
                  "2": {
                      "result": "lose"
                  },
                  "3": {
                      "result": "lose"
                  }
              }
          },
          {
              "firstName": "Артем",
              "lastName": "Шпаков ",
              "weight": "79.6",
              "tournamentCategoryIds": [
                  "b75851f8-bc4a-409b-8eff-bca2f3d3af94",
                  "5a38530a-cb13-45de-8893-f376fb842a84"
              ],
              "id": "aada8c9c-b735-4818-94eb-6818aa190693",
              "present": true,
              "stats": {
                  "0": {
                      "result": "win"
                  },
                  "1": {
                      "result": "lose"
                  },
                  "2": {
                      "result": "win"
                  },
                  "3": {
                      "result": "lose"
                  }
              }
          },
          {
              "firstName": "Денис",
              "lastName": "Слюнин",
              "weight": "82.6",
              "tournamentCategoryIds": [
                  "b75851f8-bc4a-409b-8eff-bca2f3d3af94",
                  "5a38530a-cb13-45de-8893-f376fb842a84",
                  "17e7bcd3-1ea3-4edd-9b33-0f8e17fb9105"
              ],
              "id": "b6bc50af-c2ad-47f2-8e8d-6213953dcd45",
              "present": true,
              "stats": {
                  "0": {
                      "result": "win"
                  },
                  "1": {
                      "result": "lose"
                  },
                  "2": {
                      "result": "lose"
                  }
              }
          },
          {
              "firstName": "Євгеній",
              "lastName": "Черемісін ",
              "weight": "83.7",
              "tournamentCategoryIds": [
                  "b75851f8-bc4a-409b-8eff-bca2f3d3af94",
                  "5a38530a-cb13-45de-8893-f376fb842a84"
              ],
              "id": "1b8a98bd-2bf9-41e9-87ac-d990c81a2cd7",
              "present": true,
              "stats": {
                  "0": {
                      "result": "lose"
                  },
                  "1": {
                      "result": "win"
                  },
                  "2": {
                      "result": "lose"
                  }
              }
          },
          {
              "tournamentCategoryIds": [
                  "5a38530a-cb13-45de-8893-f376fb842a84",
                  "b75851f8-bc4a-409b-8eff-bca2f3d3af94"
              ],
              "firstName": "Євгеній",
              "lastName": "Шахов",
              "weight": "84.6",
              "id": "a71c2d3a-5cbb-473d-8c1f-f4957c320ca7",
              "present": true,
              "stats": {
                  "0": {
                      "result": "lose"
                  },
                  "1": {
                      "result": "win"
                  },
                  "2": {
                      "result": "lose"
                  }
              }
          },
          {
              "firstName": "Іван",
              "lastName": "Комарь ",
              "weight": "84.7",
              "tournamentCategoryIds": [
                  "17e7bcd3-1ea3-4edd-9b33-0f8e17fb9105",
                  "b75851f8-bc4a-409b-8eff-bca2f3d3af94",
                  "5a38530a-cb13-45de-8893-f376fb842a84",
                  "fc01e05d-1e01-4131-a3a7-8c1de14c7c51"
              ],
              "id": "5c9212fc-b994-454d-bad3-a8f75c1941c4",
              "present": true,
              "stats": {
                  "0": {
                      "result": "lose"
                  },
                  "1": {
                      "result": "lose"
                  }
              }
          },
          {
              "firstName": "Максим",
              "lastName": "Мазурін",
              "weight": "84.9",
              "tournamentCategoryIds": [
                  "b75851f8-bc4a-409b-8eff-bca2f3d3af94",
                  "5a38530a-cb13-45de-8893-f376fb842a84"
              ],
              "id": "e4e67a6c-bcae-4ede-bed2-9c92270295a1",
              "present": true,
              "stats": {
                  "0": {
                      "result": "lose"
                  },
                  "1": {
                      "result": "lose"
                  }
              }
          },
          {
              "tournamentCategoryIds": [
                  "b75851f8-bc4a-409b-8eff-bca2f3d3af94",
                  "5a38530a-cb13-45de-8893-f376fb842a84"
              ],
              "firstName": "Владислав",
              "lastName": "Сокотнюк",
              "weight": "85",
              "id": "488b3ce4-e772-4cff-a518-26d335f1d2ba",
              "present": true,
              "stats": {
                  "0": {
                      "result": "lose"
                  },
                  "1": {
                      "result": "lose"
                  }
              }
          }
      ],
      "17e7bcd3-1ea3-4edd-9b33-0f8e17fb9105": [
          {
              "tournamentCategoryIds": [
                  "17e7bcd3-1ea3-4edd-9b33-0f8e17fb9105",
                  "fc01e05d-1e01-4131-a3a7-8c1de14c7c51"
              ],
              "firstName": "Володимир",
              "lastName": "Сємаєв",
              "weight": "84.6",
              "id": "9fef19be-7cf4-4c28-8eea-dbd4ca5cde11",
              "present": true,
              "stats": {
                  "0": {
                      "result": "win"
                  },
                  "1": {
                      "result": "win"
                  },
                  "2": {
                      "result": "lose"
                  },
                  "3": {
                      "result": "win"
                  },
                  "4": {
                      "result": "win"
                  },
                  "5": {
                      "result": "win"
                  },
                  "6": {
                      "result": "idle"
                  }
              }
          },
          {
              "firstName": "Іван",
              "lastName": "Комарь ",
              "weight": "84.7",
              "tournamentCategoryIds": [
                  "17e7bcd3-1ea3-4edd-9b33-0f8e17fb9105",
                  "b75851f8-bc4a-409b-8eff-bca2f3d3af94",
                  "5a38530a-cb13-45de-8893-f376fb842a84",
                  "fc01e05d-1e01-4131-a3a7-8c1de14c7c51"
              ],
              "id": "5c9212fc-b994-454d-bad3-a8f75c1941c4",
              "present": true,
              "stats": {
                  "0": {
                      "result": "win"
                  },
                  "1": {
                      "result": "win"
                  },
                  "2": {
                      "result": "win"
                  },
                  "3": {
                      "result": "win"
                  },
                  "4": {
                      "result": "lose"
                  },
                  "5": {
                      "result": "lose"
                  }
              }
          },
          {
              "firstName": "Денис",
              "lastName": "Слюнин",
              "weight": "82.6",
              "tournamentCategoryIds": [
                  "b75851f8-bc4a-409b-8eff-bca2f3d3af94",
                  "5a38530a-cb13-45de-8893-f376fb842a84",
                  "17e7bcd3-1ea3-4edd-9b33-0f8e17fb9105"
              ],
              "id": "b6bc50af-c2ad-47f2-8e8d-6213953dcd45",
              "present": true,
              "stats": {
                  "0": {
                      "result": "lose"
                  },
                  "1": {
                      "result": "win"
                  },
                  "2": {
                      "result": "win"
                  },
                  "3": {
                      "result": "lose"
                  }
              }
          },
          {
              "tournamentCategoryIds": [
                  "fc01e05d-1e01-4131-a3a7-8c1de14c7c51",
                  "17e7bcd3-1ea3-4edd-9b33-0f8e17fb9105"
              ],
              "firstName": "Олександр",
              "lastName": "Семоненко",
              "weight": "65",
              "id": "a628452d-8cc3-4014-b718-7e94e11ddb4c",
              "present": true,
              "stats": {
                  "0": {
                      "result": "win"
                  },
                  "1": {
                      "result": "lose"
                  },
                  "2": {
                      "result": "lose"
                  }
              }
          },
          {
              "firstName": "Андрій",
              "lastName": "Кулик",
              "weight": "72.2",
              "tournamentCategoryIds": [
                  "17e7bcd3-1ea3-4edd-9b33-0f8e17fb9105",
                  "fc01e05d-1e01-4131-a3a7-8c1de14c7c51"
              ],
              "id": "fbedd4f4-8e6f-42ee-89b8-69acab31a064",
              "present": true,
              "stats": {
                  "0": {
                      "result": "lose"
                  },
                  "1": {
                      "result": "lose"
                  }
              }
          }
      ],
      "179b369a-9fe2-4c0a-a1bb-5ce5ff16c8c9": [
          {
              "firstName": "Микита",
              "lastName": "Попов ",
              "weight": "85.5",
              "tournamentCategoryIds": [
                  "179b369a-9fe2-4c0a-a1bb-5ce5ff16c8c9",
                  "a69cd04d-5492-42e4-9c2b-dc991a9e3d15"
              ],
              "id": "70c94d5a-1516-4133-b083-0a09916bbd86",
              "present": true,
              "stats": {
                  "0": {
                      "result": "win"
                  },
                  "1": {
                      "result": "win"
                  },
                  "2": {
                      "result": "win"
                  },
                  "3": {
                      "result": "win"
                  },
                  "4": {
                      "result": "win"
                  },
                  "5": {
                      "result": "win"
                  },
                  "6": {
                      "result": "win"
                  },
                  "7": {
                      "result": "idle"
                  }
              }
          },
          {
              "tournamentCategoryIds": [
                  "179b369a-9fe2-4c0a-a1bb-5ce5ff16c8c9",
                  "a69cd04d-5492-42e4-9c2b-dc991a9e3d15"
              ],
              "firstName": "Владіслав",
              "lastName": "Жегус",
              "weight": "89.9",
              "id": "937f489a-475b-48e9-86f9-4c074610c664",
              "present": true,
              "stats": {
                  "0": {
                      "result": "lose"
                  },
                  "1": {
                      "result": "win"
                  },
                  "2": {
                      "result": "win"
                  },
                  "3": {
                      "result": "win"
                  },
                  "4": {
                      "result": "win"
                  },
                  "5": {
                      "result": "win"
                  },
                  "6": {
                      "result": "lose"
                  }
              }
          },
          {
              "tournamentCategoryIds": [
                  "179b369a-9fe2-4c0a-a1bb-5ce5ff16c8c9",
                  "a69cd04d-5492-42e4-9c2b-dc991a9e3d15",
                  "7300f941-113a-4567-a9a2-5e633b555dca",
                  "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
              ],
              "firstName": "Ігор",
              "lastName": "Окара",
              "weight": "95.2",
              "id": "b0e84cc7-5e56-4092-b591-bf6be8701345",
              "present": true,
              "stats": {
                  "0": {
                      "result": "win"
                  },
                  "1": {
                      "result": "win"
                  },
                  "2": {
                      "result": "win"
                  },
                  "3": {
                      "result": "lose"
                  },
                  "4": {
                      "result": "win"
                  },
                  "5": {
                      "result": "lose"
                  }
              }
          },
          {
              "tournamentCategoryIds": [
                  "179b369a-9fe2-4c0a-a1bb-5ce5ff16c8c9",
                  "a69cd04d-5492-42e4-9c2b-dc991a9e3d15"
              ],
              "firstName": "Юрій",
              "lastName": "Біда",
              "weight": "94.5",
              "id": "49e90b47-31e2-4eb5-ad9a-2a38e8aa0fe6",
              "present": true,
              "stats": {
                  "0": {
                      "result": "win"
                  },
                  "1": {
                      "result": "lose"
                  },
                  "2": {
                      "result": "win"
                  },
                  "3": {
                      "result": "win"
                  },
                  "4": {
                      "result": "lose"
                  }
              }
          },
          {
              "firstName": "Вадим",
              "lastName": "Жаріков",
              "weight": "93",
              "tournamentCategoryIds": [
                  "179b369a-9fe2-4c0a-a1bb-5ce5ff16c8c9",
                  "a69cd04d-5492-42e4-9c2b-dc991a9e3d15"
              ],
              "id": "4c231c9c-798a-403b-8205-4aea7c8a50c5",
              "present": true,
              "stats": {
                  "0": {
                      "result": "win"
                  },
                  "1": {
                      "result": "win"
                  },
                  "2": {
                      "result": "lose"
                  },
                  "3": {
                      "result": "lose"
                  }
              }
          },
          {
              "firstName": "Андрій",
              "lastName": "Толбатов",
              "weight": "95.3",
              "tournamentCategoryIds": [
                  "179b369a-9fe2-4c0a-a1bb-5ce5ff16c8c9",
                  "a69cd04d-5492-42e4-9c2b-dc991a9e3d15",
                  "7300f941-113a-4567-a9a2-5e633b555dca",
                  "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
              ],
              "id": "d3b8ae2c-3258-40ce-8990-6b3478a9f03a",
              "present": true,
              "stats": {
                  "0": {
                      "result": "win"
                  },
                  "1": {
                      "result": "lose"
                  },
                  "2": {
                      "result": "win"
                  },
                  "3": {
                      "result": "lose"
                  }
              }
          },
          {
              "firstName": "Євгеній",
              "lastName": "Романенко",
              "weight": "95",
              "tournamentCategoryIds": [
                  "179b369a-9fe2-4c0a-a1bb-5ce5ff16c8c9",
                  "a69cd04d-5492-42e4-9c2b-dc991a9e3d15"
              ],
              "id": "e095f66c-10f9-4a03-bedb-30246599f1b0",
              "present": true,
              "stats": {
                  "0": {
                      "result": "lose"
                  },
                  "1": {
                      "result": "win"
                  },
                  "2": {
                      "result": "lose"
                  }
              }
          },
          {
              "firstName": "Віталій",
              "lastName": "Медвідь",
              "weight": "92.9",
              "tournamentCategoryIds": [
                  "179b369a-9fe2-4c0a-a1bb-5ce5ff16c8c9",
                  "a69cd04d-5492-42e4-9c2b-dc991a9e3d15"
              ],
              "id": "d8dbf172-20b8-464e-b35a-6b2d02cd980c",
              "present": true,
              "stats": {
                  "0": {
                      "result": "win"
                  },
                  "1": {
                      "result": "lose"
                  },
                  "2": {
                      "result": "lose"
                  }
              }
          },
          {
              "firstName": "Дмитро",
              "lastName": "Більдій",
              "weight": "95",
              "tournamentCategoryIds": [
                  "a69cd04d-5492-42e4-9c2b-dc991a9e3d15",
                  "179b369a-9fe2-4c0a-a1bb-5ce5ff16c8c9"
              ],
              "id": "bf6c19cb-ddc0-40a2-90bb-3f43dd95ed1b",
              "present": true,
              "stats": {
                  "0": {
                      "result": "lose"
                  },
                  "1": {
                      "result": "win"
                  },
                  "2": {
                      "result": "lose"
                  }
              }
          },
          {
              "firstName": "Давид",
              "lastName": "Бороденков ",
              "weight": "87",
              "tournamentCategoryIds": [
                  "179b369a-9fe2-4c0a-a1bb-5ce5ff16c8c9",
                  "a69cd04d-5492-42e4-9c2b-dc991a9e3d15"
              ],
              "id": "e609534f-77c3-45bb-84f0-feef3e62be65",
              "present": true,
              "stats": {
                  "0": {
                      "result": "lose"
                  },
                  "1": {
                      "result": "lose"
                  }
              }
          },
          {
              "tournamentCategoryIds": [
                  "179b369a-9fe2-4c0a-a1bb-5ce5ff16c8c9",
                  "a69cd04d-5492-42e4-9c2b-dc991a9e3d15"
              ],
              "firstName": "Максим",
              "lastName": "Зуй",
              "weight": "88.5",
              "id": "5c2e3dc0-c5ee-4fc9-9218-dace6401d748",
              "present": true,
              "stats": {
                  "0": {
                      "result": "lose"
                  },
                  "1": {
                      "result": "lose"
                  }
              }
          }
      ],
      "5b5125b7-09a1-410d-9d5d-1b5196b1c01a": [
          {
              "firstName": "Тимур",
              "lastName": "Кувандіков",
              "weight": "73.8",
              "tournamentCategoryIds": [
                  "25b0f044-9a01-42b5-b377-16accd14b5b3",
                  "5b5125b7-09a1-410d-9d5d-1b5196b1c01a"
              ],
              "id": "f5daf1a7-3931-48db-b81c-987978799486",
              "present": true,
              "stats": {
                  "0": {
                      "result": "win"
                  },
                  "1": {
                      "result": "win"
                  },
                  "2": {
                      "result": "win"
                  },
                  "3": {
                      "result": "win"
                  },
                  "4": {
                      "result": "win"
                  },
                  "5": {
                      "result": "win"
                  },
                  "6": {
                      "result": "win"
                  },
                  "7": {
                      "result": "idle"
                  }
              }
          },
          {
              "firstName": "Владислав",
              "lastName": "Юрченко",
              "weight": "73.5",
              "tournamentCategoryIds": [
                  "25b0f044-9a01-42b5-b377-16accd14b5b3",
                  "5b5125b7-09a1-410d-9d5d-1b5196b1c01a"
              ],
              "id": "da1fdf6d-493e-4658-977f-95f55973ca0e",
              "present": true,
              "stats": {
                  "0": {
                      "result": "lose"
                  },
                  "1": {
                      "result": "win"
                  },
                  "2": {
                      "result": "win"
                  },
                  "3": {
                      "result": "win"
                  },
                  "4": {
                      "result": "win"
                  },
                  "5": {
                      "result": "win"
                  },
                  "6": {
                      "result": "lose"
                  }
              }
          },
          {
              "firstName": "Ілля",
              "lastName": "Мазніченко",
              "weight": "68.3",
              "tournamentCategoryIds": [
                  "25b0f044-9a01-42b5-b377-16accd14b5b3",
                  "5b5125b7-09a1-410d-9d5d-1b5196b1c01a"
              ],
              "id": "a04e619f-c5ac-48ba-baaa-2e3bfbcd3892",
              "present": true,
              "stats": {
                  "0": {
                      "result": "win"
                  },
                  "1": {
                      "result": "win"
                  },
                  "2": {
                      "result": "lose"
                  },
                  "3": {
                      "result": "win"
                  },
                  "4": {
                      "result": "win"
                  },
                  "5": {
                      "result": "lose"
                  }
              }
          },
          {
              "tournamentCategoryIds": [
                  "25b0f044-9a01-42b5-b377-16accd14b5b3",
                  "5b5125b7-09a1-410d-9d5d-1b5196b1c01a"
              ],
              "firstName": "Олександр",
              "lastName": "Циганій",
              "weight": "73.6",
              "id": "844d8167-2d7f-4f3e-9fd4-f89711edeafb",
              "present": true,
              "stats": {
                  "0": {
                      "result": "win"
                  },
                  "1": {
                      "result": "win"
                  },
                  "2": {
                      "result": "win"
                  },
                  "3": {
                      "result": "lose"
                  },
                  "4": {
                      "result": "lose"
                  }
              }
          },
          {
              "firstName": "Андрій",
              "lastName": "Зуяков ",
              "weight": "75.5",
              "tournamentCategoryIds": [
                  "25b0f044-9a01-42b5-b377-16accd14b5b3",
                  "5b5125b7-09a1-410d-9d5d-1b5196b1c01a"
              ],
              "id": "4131dd33-9f0e-4623-8e95-d59fbbcb161f",
              "present": true,
              "stats": {
                  "0": {
                      "result": "win"
                  },
                  "1": {
                      "result": "lose"
                  },
                  "2": {
                      "result": "win"
                  },
                  "3": {
                      "result": "lose"
                  }
              }
          },
          {
              "firstName": "Андрій",
              "lastName": "Чукарин ",
              "weight": "73.7",
              "tournamentCategoryIds": [
                  "25b0f044-9a01-42b5-b377-16accd14b5b3",
                  "5b5125b7-09a1-410d-9d5d-1b5196b1c01a"
              ],
              "id": "67ead343-de74-4032-9682-d5b0ee831a7c",
              "present": true,
              "stats": {
                  "0": {
                      "result": "lose"
                  },
                  "1": {
                      "result": "win"
                  },
                  "2": {
                      "result": "win"
                  },
                  "3": {
                      "result": "lose"
                  }
              }
          },
          {
              "firstName": "Олександр",
              "lastName": "Біловол ",
              "weight": "69.7",
              "tournamentCategoryIds": [
                  "25b0f044-9a01-42b5-b377-16accd14b5b3",
                  "5b5125b7-09a1-410d-9d5d-1b5196b1c01a"
              ],
              "id": "460bb6d1-4f6b-4cf9-a174-98b7bad141ae",
              "present": true,
              "stats": {
                  "0": {
                      "result": "win"
                  },
                  "1": {
                      "result": "lose"
                  },
                  "2": {
                      "result": "lose"
                  }
              }
          },
          {
              "tournamentCategoryIds": [
                  "25b0f044-9a01-42b5-b377-16accd14b5b3",
                  "5b5125b7-09a1-410d-9d5d-1b5196b1c01a"
              ],
              "firstName": "Данило",
              "lastName": "Бобровський",
              "weight": "75.4",
              "id": "9f09a533-7670-4f0c-b07d-bc2b59c3c7dd",
              "present": true,
              "stats": {
                  "0": {
                      "result": "win"
                  },
                  "1": {
                      "result": "lose"
                  },
                  "2": {
                      "result": "lose"
                  }
              }
          },
          {
              "tournamentCategoryIds": [
                  "25b0f044-9a01-42b5-b377-16accd14b5b3",
                  "5b5125b7-09a1-410d-9d5d-1b5196b1c01a"
              ],
              "firstName": "В'ячеслав",
              "lastName": "Грінченко",
              "weight": "73.9",
              "id": "cde29451-66c5-4af3-a5c3-0c453543e190",
              "present": true,
              "stats": {
                  "0": {
                      "result": "lose"
                  },
                  "1": {
                      "result": "win"
                  },
                  "2": {
                      "result": "lose"
                  }
              }
          },
          {
              "firstName": "Дмитро",
              "lastName": "Рудич",
              "weight": "69.4",
              "tournamentCategoryIds": [
                  "25b0f044-9a01-42b5-b377-16accd14b5b3",
                  "5b5125b7-09a1-410d-9d5d-1b5196b1c01a"
              ],
              "id": "64c969d3-e0a2-4ff8-a32a-dc03a024b2c0",
              "present": true,
              "stats": {
                  "0": {
                      "result": "lose"
                  },
                  "1": {
                      "result": "lose"
                  }
              }
          },
          {
              "firstName": "Артем",
              "lastName": "Босенко",
              "weight": "66.5",
              "tournamentCategoryIds": [
                  "25b0f044-9a01-42b5-b377-16accd14b5b3",
                  "5b5125b7-09a1-410d-9d5d-1b5196b1c01a"
              ],
              "id": "b2116fd3-d857-4d8b-8adf-49e29ac9285b",
              "present": true,
              "stats": {
                  "0": {
                      "result": "lose"
                  },
                  "1": {
                      "result": "lose"
                  }
              }
          },
          {
              "firstName": "Хаям",
              "lastName": "Багіров",
              "weight": "67.3",
              "tournamentCategoryIds": [
                  "25b0f044-9a01-42b5-b377-16accd14b5b3",
                  "5b5125b7-09a1-410d-9d5d-1b5196b1c01a"
              ],
              "id": "cadd8fdc-9c0d-4be7-aee0-f26a70595ab5",
              "present": true,
              "stats": {
                  "0": {
                      "result": "lose"
                  },
                  "1": {
                      "result": "lose"
                  }
              }
          }
      ],
      "7300f941-113a-4567-a9a2-5e633b555dca": [
          {
              "tournamentCategoryIds": [
                  "179b369a-9fe2-4c0a-a1bb-5ce5ff16c8c9",
                  "a69cd04d-5492-42e4-9c2b-dc991a9e3d15",
                  "7300f941-113a-4567-a9a2-5e633b555dca",
                  "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
              ],
              "firstName": "Ігор",
              "lastName": "Окара",
              "weight": "95.2",
              "id": "b0e84cc7-5e56-4092-b591-bf6be8701345",
              "present": true,
              "stats": {
                  "0": {
                      "result": "win"
                  },
                  "1": {
                      "result": "win"
                  },
                  "2": {
                      "result": "win"
                  },
                  "3": {
                      "result": "win"
                  },
                  "4": {
                      "result": "win"
                  },
                  "5": {
                      "result": "win"
                  },
                  "6": {
                      "result": "win"
                  },
                  "7": {
                      "result": "idle"
                  }
              }
          },
          {
              "tournamentCategoryIds": [
                  "7300f941-113a-4567-a9a2-5e633b555dca",
                  "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
              ],
              "firstName": "Дмитро",
              "lastName": "Єрохін",
              "weight": "105",
              "id": "2a438433-61eb-4a50-8ca4-bbf535bffb74",
              "present": true,
              "stats": {
                  "0": {
                      "result": "win"
                  },
                  "1": {
                      "result": "win"
                  },
                  "2": {
                      "result": "lose"
                  },
                  "3": {
                      "result": "win"
                  },
                  "4": {
                      "result": "win"
                  },
                  "5": {
                      "result": "win"
                  },
                  "6": {
                      "result": "lose"
                  }
              }
          },
          {
              "firstName": "Артем",
              "lastName": "Попов",
              "weight": "87.5",
              "tournamentCategoryIds": [
                  "7300f941-113a-4567-a9a2-5e633b555dca",
                  "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
              ],
              "id": "b5ea0ff3-edb6-434d-9ed6-6576da0a0eaa",
              "present": true,
              "stats": {
                  "0": {
                      "result": "win"
                  },
                  "1": {
                      "result": "lose"
                  },
                  "2": {
                      "result": "win"
                  },
                  "3": {
                      "result": "win"
                  },
                  "4": {
                      "result": "win"
                  },
                  "5": {
                      "result": "lose"
                  }
              }
          },
          {
              "tournamentCategoryIds": [
                  "7300f941-113a-4567-a9a2-5e633b555dca",
                  "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
              ],
              "firstName": "Михайло",
              "lastName": "Шевченко",
              "weight": "150",
              "id": "0969a1bb-b05e-4c3f-a9e3-33fda9b16d37",
              "present": true,
              "stats": {
                  "0": {
                      "result": "win"
                  },
                  "1": {
                      "result": "win"
                  },
                  "2": {
                      "result": "win"
                  },
                  "3": {
                      "result": "lose"
                  },
                  "4": {
                      "result": "lose"
                  }
              }
          },
          {
              "firstName": "Богдан",
              "lastName": "Зуяков ",
              "weight": "103.3",
              "tournamentCategoryIds": [
                  "7300f941-113a-4567-a9a2-5e633b555dca",
                  "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
              ],
              "id": "355337a7-e112-4f73-8e27-2d89a9b5d39b",
              "present": true,
              "stats": {
                  "0": {
                      "result": "lose"
                  },
                  "1": {
                      "result": "win"
                  },
                  "2": {
                      "result": "win"
                  },
                  "3": {
                      "result": "win"
                  },
                  "4": {
                      "result": "lose"
                  }
              }
          },
          {
              "firstName": "Костянтин",
              "lastName": "Брехов",
              "weight": "109.6",
              "tournamentCategoryIds": [
                  "7300f941-113a-4567-a9a2-5e633b555dca",
                  "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
              ],
              "id": "2f64c9d9-99ce-4dee-bdbc-9605f6535807",
              "present": true,
              "stats": {
                  "0": {
                      "result": "win"
                  },
                  "1": {
                      "result": "win"
                  },
                  "2": {
                      "result": "lose"
                  },
                  "3": {
                      "result": "lose"
                  }
              }
          },
          {
              "tournamentCategoryIds": [
                  "7300f941-113a-4567-a9a2-5e633b555dca",
                  "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
              ],
              "firstName": "Олександр",
              "lastName": "Картишкін",
              "weight": "102",
              "id": "ed6e2d81-2ff6-436c-84a3-c7678daa63da",
              "present": true,
              "stats": {
                  "0": {
                      "result": "win"
                  },
                  "1": {
                      "result": "lose"
                  },
                  "2": {
                      "result": "win"
                  },
                  "3": {
                      "result": "lose"
                  }
              }
          },
          {
              "firstName": "Олег",
              "lastName": "Гаврелець",
              "weight": "104.8",
              "tournamentCategoryIds": [
                  "7300f941-113a-4567-a9a2-5e633b555dca",
                  "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
              ],
              "id": "35a069c0-2414-46c3-8001-65d81b38be10",
              "present": true,
              "stats": {
                  "0": {
                      "result": "lose"
                  },
                  "1": {
                      "result": "win"
                  },
                  "2": {
                      "result": "win"
                  },
                  "3": {
                      "result": "lose"
                  }
              }
          },
          {
              "firstName": "Олександр",
              "lastName": "Власов",
              "weight": "122.3",
              "tournamentCategoryIds": [
                  "7300f941-113a-4567-a9a2-5e633b555dca",
                  "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
              ],
              "id": "12747830-f88c-493a-a16d-5c5f8baea9d0",
              "present": true,
              "stats": {
                  "0": {
                      "result": "win"
                  },
                  "1": {
                      "result": "lose"
                  },
                  "2": {
                      "result": "lose"
                  }
              }
          },
          {
              "tournamentCategoryIds": [
                  "7300f941-113a-4567-a9a2-5e633b555dca",
                  "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
              ],
              "firstName": "Гліб",
              "lastName": "Кривоносов",
              "weight": "97.2",
              "id": "2c513f1a-8f98-4dc2-b83a-a7c48f86c0e6",
              "present": true,
              "stats": {
                  "0": {
                      "result": "win"
                  },
                  "1": {
                      "result": "lose"
                  },
                  "2": {
                      "result": "lose"
                  }
              }
          },
          {
              "firstName": "Іван",
              "lastName": "Спесивцев ",
              "weight": "110",
              "tournamentCategoryIds": [
                  "7300f941-113a-4567-a9a2-5e633b555dca",
                  "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
              ],
              "id": "84f1a6d9-fecd-4bcb-ab78-1b1649449c7f",
              "present": true,
              "stats": {
                  "0": {
                      "result": "lose"
                  },
                  "1": {
                      "result": "win"
                  },
                  "2": {
                      "result": "lose"
                  }
              }
          },
          {
              "tournamentCategoryIds": [
                  "7300f941-113a-4567-a9a2-5e633b555dca",
                  "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
              ],
              "firstName": "Володимир",
              "lastName": "Кривобок",
              "weight": "154",
              "id": "329dba25-a265-4e6c-b48c-dbdc2cf1b161",
              "present": true,
              "stats": {
                  "0": {
                      "result": "lose"
                  },
                  "1": {
                      "result": "win"
                  },
                  "2": {
                      "result": "lose"
                  }
              }
          },
          {
              "tournamentCategoryIds": [
                  "7300f941-113a-4567-a9a2-5e633b555dca",
                  "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
              ],
              "firstName": "Станіслав",
              "lastName": "Гулий",
              "weight": "105.7",
              "id": "fb756e7c-4c21-4060-9ddd-1a8e9e698e30",
              "present": true,
              "stats": {
                  "0": {
                      "result": "lose"
                  },
                  "1": {
                      "result": "lose"
                  }
              }
          },
          {
              "firstName": "Андрій",
              "lastName": "Толбатов",
              "weight": "95.3",
              "tournamentCategoryIds": [
                  "179b369a-9fe2-4c0a-a1bb-5ce5ff16c8c9",
                  "a69cd04d-5492-42e4-9c2b-dc991a9e3d15",
                  "7300f941-113a-4567-a9a2-5e633b555dca",
                  "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
              ],
              "id": "d3b8ae2c-3258-40ce-8990-6b3478a9f03a",
              "present": true,
              "stats": {
                  "0": {
                      "result": "lose"
                  },
                  "1": {
                      "result": "lose"
                  }
              }
          },
          {
              "tournamentCategoryIds": [
                  "7300f941-113a-4567-a9a2-5e633b555dca",
                  "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
              ],
              "firstName": "Юрій",
              "lastName": "Маляр",
              "weight": "106.5",
              "id": "20c08a4d-36e4-4960-a46a-74964621915f",
              "present": true,
              "stats": {
                  "0": {
                      "result": "lose"
                  },
                  "1": {
                      "result": "lose"
                  }
              }
          },
          {
              "tournamentCategoryIds": [
                  "7300f941-113a-4567-a9a2-5e633b555dca",
                  "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
              ],
              "firstName": "Олександр",
              "lastName": "Скрипник",
              "weight": "110.3",
              "id": "059c1bcb-4897-48c1-9298-a84b54a239b1",
              "present": true,
              "stats": {
                  "0": {
                      "result": "lose"
                  },
                  "1": {
                      "result": "lose"
                  }
              }
          }
      ],
      "d5e94274-26a8-48ce-8193-fc232d90a7d7": [
          {
              "firstName": "Юлія",
              "lastName": "Гадаєва",
              "weight": "63.4",
              "tournamentCategoryIds": [
                  "7ae3a387-953b-4d1c-abe9-1d8aafeae004",
                  "d5e94274-26a8-48ce-8193-fc232d90a7d7"
              ],
              "id": "2ca86aa2-661e-4948-b34a-6083518005c6",
              "present": true,
              "stats": {
                  "0": {
                      "result": "win"
                  },
                  "1": {
                      "result": "win"
                  },
                  "2": {
                      "result": "win"
                  },
                  "3": {
                      "result": "win"
                  },
                  "4": {
                      "result": "idle"
                  }
              }
          },
          {
              "firstName": "Юлія",
              "lastName": "Облочинська",
              "weight": "65.3",
              "tournamentCategoryIds": [
                  "7ae3a387-953b-4d1c-abe9-1d8aafeae004",
                  "d5e94274-26a8-48ce-8193-fc232d90a7d7"
              ],
              "id": "6fbc29ac-1114-49e8-9a57-4bd6884edfae",
              "present": true,
              "stats": {
                  "0": {
                      "result": "win"
                  },
                  "1": {
                      "result": "lose"
                  },
                  "2": {
                      "result": "win"
                  },
                  "3": {
                      "result": "lose"
                  }
              }
          },
          {
              "tournamentCategoryIds": [
                  "7ae3a387-953b-4d1c-abe9-1d8aafeae004",
                  "d5e94274-26a8-48ce-8193-fc232d90a7d7"
              ],
              "firstName": "Валерія",
              "lastName": "Пилюк",
              "weight": "69.2",
              "id": "b04be8e6-fa22-4420-8951-6b9ebf2cc314",
              "present": true,
              "stats": {
                  "0": {
                      "result": "lose"
                  },
                  "1": {
                      "result": "win"
                  },
                  "2": {
                      "result": "lose"
                  }
              }
          },
          {
              "firstName": "Ірина",
              "lastName": "Ус ",
              "weight": "59",
              "tournamentCategoryIds": [
                  "7ae3a387-953b-4d1c-abe9-1d8aafeae004",
                  "d5e94274-26a8-48ce-8193-fc232d90a7d7"
              ],
              "id": "71ba4a36-9f9c-4ca0-b936-e7dac36483d6",
              "present": true,
              "stats": {
                  "0": {
                      "result": "lose"
                  },
                  "1": {
                      "result": "lose"
                  }
              }
          }
      ],
      "5a38530a-cb13-45de-8893-f376fb842a84": [
          {
              "firstName": "Давид",
              "lastName": "Попов ",
              "weight": "83.7",
              "tournamentCategoryIds": [
                  "b75851f8-bc4a-409b-8eff-bca2f3d3af94",
                  "5a38530a-cb13-45de-8893-f376fb842a84"
              ],
              "id": "8fcd2fe7-ac75-4a46-9f4e-4eb72a7d2b83",
              "present": true,
              "stats": {
                  "0": {
                      "result": "win"
                  },
                  "1": {
                      "result": "win"
                  },
                  "2": {
                      "result": "win"
                  },
                  "3": {
                      "result": "win"
                  },
                  "4": {
                      "result": "win"
                  },
                  "5": {
                      "result": "win"
                  },
                  "6": {
                      "result": "lose"
                  },
                  "7": {
                      "result": "win"
                  },
                  "8": {
                      "result": "idle"
                  }
              }
          },
          {
              "firstName": "Іван",
              "lastName": "Комарь ",
              "weight": "84.7",
              "tournamentCategoryIds": [
                  "17e7bcd3-1ea3-4edd-9b33-0f8e17fb9105",
                  "b75851f8-bc4a-409b-8eff-bca2f3d3af94",
                  "5a38530a-cb13-45de-8893-f376fb842a84",
                  "fc01e05d-1e01-4131-a3a7-8c1de14c7c51"
              ],
              "id": "5c9212fc-b994-454d-bad3-a8f75c1941c4",
              "present": true,
              "stats": {
                  "0": {
                      "result": "win"
                  },
                  "1": {
                      "result": "win"
                  },
                  "2": {
                      "result": "win"
                  },
                  "3": {
                      "result": "lose"
                  },
                  "4": {
                      "result": "win"
                  },
                  "5": {
                      "result": "win"
                  },
                  "6": {
                      "result": "win"
                  },
                  "7": {
                      "result": "lose"
                  }
              }
          },
          {
              "tournamentCategoryIds": [
                  "b75851f8-bc4a-409b-8eff-bca2f3d3af94",
                  "5a38530a-cb13-45de-8893-f376fb842a84"
              ],
              "firstName": "Іван",
              "lastName": "Бєлік",
              "weight": "80",
              "id": "8333b9db-eca2-4bbe-97c5-958d22bc1747",
              "present": true,
              "stats": {
                  "0": {
                      "result": "win"
                  },
                  "1": {
                      "result": "lose"
                  },
                  "2": {
                      "result": "win"
                  },
                  "3": {
                      "result": "win"
                  },
                  "4": {
                      "result": "win"
                  },
                  "5": {
                      "result": "lose"
                  }
              }
          },
          {
              "firstName": "Іван",
              "lastName": "Мотаєв",
              "weight": "84.5",
              "tournamentCategoryIds": [
                  "b75851f8-bc4a-409b-8eff-bca2f3d3af94",
                  "5a38530a-cb13-45de-8893-f376fb842a84"
              ],
              "id": "8e08bf49-638f-4e61-8afc-7be1f8bbe133",
              "present": true,
              "stats": {
                  "0": {
                      "result": "win"
                  },
                  "1": {
                      "result": "lose"
                  },
                  "2": {
                      "result": "win"
                  },
                  "3": {
                      "result": "win"
                  },
                  "4": {
                      "result": "lose"
                  }
              }
          },
          {
              "firstName": "Олександр",
              "lastName": "Плішивий ",
              "weight": "82",
              "tournamentCategoryIds": [
                  "b75851f8-bc4a-409b-8eff-bca2f3d3af94",
                  "5a38530a-cb13-45de-8893-f376fb842a84"
              ],
              "id": "eb5fbd70-5d23-43cc-831e-ec903d4672d7",
              "present": true,
              "stats": {
                  "0": {
                      "result": "win"
                  },
                  "1": {
                      "result": "win"
                  },
                  "2": {
                      "result": "lose"
                  },
                  "3": {
                      "result": "lose"
                  }
              }
          },
          {
              "tournamentCategoryIds": [
                  "b75851f8-bc4a-409b-8eff-bca2f3d3af94",
                  "5a38530a-cb13-45de-8893-f376fb842a84"
              ],
              "firstName": "Владислав",
              "lastName": "Сокотнюк",
              "weight": "85",
              "id": "488b3ce4-e772-4cff-a518-26d335f1d2ba",
              "present": true,
              "stats": {
                  "0": {
                      "result": "lose"
                  },
                  "1": {
                      "result": "win"
                  },
                  "2": {
                      "result": "win"
                  },
                  "3": {
                      "result": "lose"
                  }
              }
          },
          {
              "firstName": "Олексій",
              "lastName": "Фомініченко",
              "weight": "84.4",
              "tournamentCategoryIds": [
                  "b75851f8-bc4a-409b-8eff-bca2f3d3af94",
                  "5a38530a-cb13-45de-8893-f376fb842a84"
              ],
              "id": "53e3fbe6-86c8-44ad-b344-3029b00cf076",
              "present": true,
              "stats": {
                  "0": {
                      "result": "win"
                  },
                  "1": {
                      "result": "lose"
                  },
                  "2": {
                      "result": "lose"
                  }
              }
          },
          {
              "tournamentCategoryIds": [
                  "5a38530a-cb13-45de-8893-f376fb842a84",
                  "b75851f8-bc4a-409b-8eff-bca2f3d3af94"
              ],
              "firstName": "Євгеній",
              "lastName": "Шахов",
              "weight": "84.6",
              "id": "a71c2d3a-5cbb-473d-8c1f-f4957c320ca7",
              "present": true,
              "stats": {
                  "0": {
                      "result": "lose"
                  },
                  "1": {
                      "result": "win"
                  },
                  "2": {
                      "result": "lose"
                  }
              }
          },
          {
              "firstName": "Денис",
              "lastName": "Слюнин",
              "weight": "82.6",
              "tournamentCategoryIds": [
                  "b75851f8-bc4a-409b-8eff-bca2f3d3af94",
                  "5a38530a-cb13-45de-8893-f376fb842a84",
                  "17e7bcd3-1ea3-4edd-9b33-0f8e17fb9105"
              ],
              "id": "b6bc50af-c2ad-47f2-8e8d-6213953dcd45",
              "present": true,
              "stats": {
                  "0": {
                      "result": "lose"
                  },
                  "1": {
                      "result": "win"
                  },
                  "2": {
                      "result": "lose"
                  }
              }
          },
          {
              "firstName": "Артем",
              "lastName": "Шпаков ",
              "weight": "79.6",
              "tournamentCategoryIds": [
                  "b75851f8-bc4a-409b-8eff-bca2f3d3af94",
                  "5a38530a-cb13-45de-8893-f376fb842a84"
              ],
              "id": "aada8c9c-b735-4818-94eb-6818aa190693",
              "present": true,
              "stats": {
                  "0": {
                      "result": "lose"
                  },
                  "1": {
                      "result": "lose"
                  }
              }
          },
          {
              "firstName": "Євгеній",
              "lastName": "Черемісін ",
              "weight": "83.7",
              "tournamentCategoryIds": [
                  "b75851f8-bc4a-409b-8eff-bca2f3d3af94",
                  "5a38530a-cb13-45de-8893-f376fb842a84"
              ],
              "id": "1b8a98bd-2bf9-41e9-87ac-d990c81a2cd7",
              "present": true,
              "stats": {
                  "0": {
                      "result": "lose"
                  },
                  "1": {
                      "result": "lose"
                  }
              }
          },
          {
              "firstName": "Максим",
              "lastName": "Мазурін",
              "weight": "84.9",
              "tournamentCategoryIds": [
                  "b75851f8-bc4a-409b-8eff-bca2f3d3af94",
                  "5a38530a-cb13-45de-8893-f376fb842a84"
              ],
              "id": "e4e67a6c-bcae-4ede-bed2-9c92270295a1",
              "present": true,
              "stats": {
                  "0": {
                      "result": "lose"
                  },
                  "1": {
                      "result": "lose"
                  }
              }
          }
      ],
      "a69cd04d-5492-42e4-9c2b-dc991a9e3d15": [
          {
              "firstName": "Віталій",
              "lastName": "Медвідь",
              "weight": "92.9",
              "tournamentCategoryIds": [
                  "179b369a-9fe2-4c0a-a1bb-5ce5ff16c8c9",
                  "a69cd04d-5492-42e4-9c2b-dc991a9e3d15"
              ],
              "id": "d8dbf172-20b8-464e-b35a-6b2d02cd980c",
              "present": true,
              "stats": {
                  "0": {
                      "result": "win"
                  },
                  "1": {
                      "result": "win"
                  },
                  "2": {
                      "result": "win"
                  },
                  "3": {
                      "result": "win"
                  },
                  "4": {
                      "result": "win"
                  },
                  "5": {
                      "result": "win"
                  },
                  "6": {
                      "result": "win"
                  },
                  "7": {
                      "result": "idle"
                  }
              }
          },
          {
              "firstName": "Микита",
              "lastName": "Попов ",
              "weight": "85.5",
              "tournamentCategoryIds": [
                  "179b369a-9fe2-4c0a-a1bb-5ce5ff16c8c9",
                  "a69cd04d-5492-42e4-9c2b-dc991a9e3d15"
              ],
              "id": "70c94d5a-1516-4133-b083-0a09916bbd86",
              "present": true,
              "stats": {
                  "0": {
                      "result": "win"
                  },
                  "1": {
                      "result": "lose"
                  },
                  "2": {
                      "result": "win"
                  },
                  "3": {
                      "result": "win"
                  },
                  "4": {
                      "result": "win"
                  },
                  "5": {
                      "result": "win"
                  },
                  "6": {
                      "result": "lose"
                  }
              }
          },
          {
              "firstName": "Андрій",
              "lastName": "Толбатов",
              "weight": "95.3",
              "tournamentCategoryIds": [
                  "179b369a-9fe2-4c0a-a1bb-5ce5ff16c8c9",
                  "a69cd04d-5492-42e4-9c2b-dc991a9e3d15",
                  "7300f941-113a-4567-a9a2-5e633b555dca",
                  "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
              ],
              "id": "d3b8ae2c-3258-40ce-8990-6b3478a9f03a",
              "present": true,
              "stats": {
                  "0": {
                      "result": "win"
                  },
                  "1": {
                      "result": "lose"
                  },
                  "2": {
                      "result": "win"
                  },
                  "3": {
                      "result": "win"
                  },
                  "4": {
                      "result": "win"
                  },
                  "5": {
                      "result": "lose"
                  }
              }
          },
          {
              "tournamentCategoryIds": [
                  "179b369a-9fe2-4c0a-a1bb-5ce5ff16c8c9",
                  "a69cd04d-5492-42e4-9c2b-dc991a9e3d15",
                  "7300f941-113a-4567-a9a2-5e633b555dca",
                  "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
              ],
              "firstName": "Ігор",
              "lastName": "Окара",
              "weight": "95.2",
              "id": "b0e84cc7-5e56-4092-b591-bf6be8701345",
              "present": true,
              "stats": {
                  "0": {
                      "result": "win"
                  },
                  "1": {
                      "result": "win"
                  },
                  "2": {
                      "result": "win"
                  },
                  "3": {
                      "result": "lose"
                  },
                  "4": {
                      "result": "lose"
                  }
              }
          },
          {
              "tournamentCategoryIds": [
                  "179b369a-9fe2-4c0a-a1bb-5ce5ff16c8c9",
                  "a69cd04d-5492-42e4-9c2b-dc991a9e3d15"
              ],
              "firstName": "Владіслав",
              "lastName": "Жегус",
              "weight": "89.9",
              "id": "937f489a-475b-48e9-86f9-4c074610c664",
              "present": true,
              "stats": {
                  "0": {
                      "result": "win"
                  },
                  "1": {
                      "result": "win"
                  },
                  "2": {
                      "result": "lose"
                  },
                  "3": {
                      "result": "lose"
                  }
              }
          },
          {
              "firstName": "Давид",
              "lastName": "Бороденков ",
              "weight": "87",
              "tournamentCategoryIds": [
                  "179b369a-9fe2-4c0a-a1bb-5ce5ff16c8c9",
                  "a69cd04d-5492-42e4-9c2b-dc991a9e3d15"
              ],
              "id": "e609534f-77c3-45bb-84f0-feef3e62be65",
              "present": true,
              "stats": {
                  "0": {
                      "result": "lose"
                  },
                  "1": {
                      "result": "win"
                  },
                  "2": {
                      "result": "win"
                  },
                  "3": {
                      "result": "lose"
                  }
              }
          },
          {
              "tournamentCategoryIds": [
                  "179b369a-9fe2-4c0a-a1bb-5ce5ff16c8c9",
                  "a69cd04d-5492-42e4-9c2b-dc991a9e3d15"
              ],
              "firstName": "Юрій",
              "lastName": "Біда",
              "weight": "94.5",
              "id": "49e90b47-31e2-4eb5-ad9a-2a38e8aa0fe6",
              "present": true,
              "stats": {
                  "0": {
                      "result": "lose"
                  },
                  "1": {
                      "result": "win"
                  },
                  "2": {
                      "result": "lose"
                  }
              }
          },
          {
              "firstName": "Вадим",
              "lastName": "Жаріков",
              "weight": "93",
              "tournamentCategoryIds": [
                  "179b369a-9fe2-4c0a-a1bb-5ce5ff16c8c9",
                  "a69cd04d-5492-42e4-9c2b-dc991a9e3d15"
              ],
              "id": "4c231c9c-798a-403b-8205-4aea7c8a50c5",
              "present": true,
              "stats": {
                  "0": {
                      "result": "win"
                  },
                  "1": {
                      "result": "lose"
                  },
                  "2": {
                      "result": "lose"
                  }
              }
          },
          {
              "tournamentCategoryIds": [
                  "179b369a-9fe2-4c0a-a1bb-5ce5ff16c8c9",
                  "a69cd04d-5492-42e4-9c2b-dc991a9e3d15"
              ],
              "firstName": "Максим",
              "lastName": "Зуй",
              "weight": "88.5",
              "id": "5c2e3dc0-c5ee-4fc9-9218-dace6401d748",
              "present": true,
              "stats": {
                  "0": {
                      "result": "lose"
                  },
                  "1": {
                      "result": "win"
                  },
                  "2": {
                      "result": "lose"
                  }
              }
          },
          {
              "firstName": "Дмитро",
              "lastName": "Більдій",
              "weight": "95",
              "tournamentCategoryIds": [
                  "a69cd04d-5492-42e4-9c2b-dc991a9e3d15",
                  "179b369a-9fe2-4c0a-a1bb-5ce5ff16c8c9"
              ],
              "id": "bf6c19cb-ddc0-40a2-90bb-3f43dd95ed1b",
              "present": true,
              "stats": {
                  "0": {
                      "result": "lose"
                  },
                  "1": {
                      "result": "lose"
                  }
              }
          },
          {
              "firstName": "Євгеній",
              "lastName": "Романенко",
              "weight": "95",
              "tournamentCategoryIds": [
                  "179b369a-9fe2-4c0a-a1bb-5ce5ff16c8c9",
                  "a69cd04d-5492-42e4-9c2b-dc991a9e3d15"
              ],
              "id": "e095f66c-10f9-4a03-bedb-30246599f1b0",
              "present": true,
              "stats": {
                  "0": {
                      "result": "lose"
                  },
                  "1": {
                      "result": "lose"
                  }
              }
          }
      ],
      "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8": [
          {
              "firstName": "Богдан",
              "lastName": "Зуяков ",
              "weight": "103.3",
              "tournamentCategoryIds": [
                  "7300f941-113a-4567-a9a2-5e633b555dca",
                  "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
              ],
              "id": "355337a7-e112-4f73-8e27-2d89a9b5d39b",
              "present": true,
              "stats": {
                  "0": {
                      "result": "win"
                  },
                  "1": {
                      "result": "win"
                  },
                  "2": {
                      "result": "win"
                  },
                  "3": {
                      "result": "win"
                  },
                  "4": {
                      "result": "win"
                  },
                  "5": {
                      "result": "win"
                  },
                  "6": {
                      "result": "lose"
                  },
                  "7": {
                      "result": "win"
                  },
                  "8": {
                      "result": "idle"
                  }
              }
          },
          {
              "firstName": "Олег",
              "lastName": "Гаврелець",
              "weight": "104.8",
              "tournamentCategoryIds": [
                  "7300f941-113a-4567-a9a2-5e633b555dca",
                  "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
              ],
              "id": "35a069c0-2414-46c3-8001-65d81b38be10",
              "present": true,
              "stats": {
                  "0": {
                      "result": "win"
                  },
                  "1": {
                      "result": "win"
                  },
                  "2": {
                      "result": "lose"
                  },
                  "3": {
                      "result": "win"
                  },
                  "4": {
                      "result": "win"
                  },
                  "5": {
                      "result": "win"
                  },
                  "6": {
                      "result": "win"
                  },
                  "7": {
                      "result": "lose"
                  }
              }
          },
          {
              "firstName": "Олександр",
              "lastName": "Власов",
              "weight": "122.3",
              "tournamentCategoryIds": [
                  "7300f941-113a-4567-a9a2-5e633b555dca",
                  "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
              ],
              "id": "12747830-f88c-493a-a16d-5c5f8baea9d0",
              "present": true,
              "stats": {
                  "0": {
                      "result": "win"
                  },
                  "1": {
                      "result": "lose"
                  },
                  "2": {
                      "result": "win"
                  },
                  "3": {
                      "result": "win"
                  },
                  "4": {
                      "result": "win"
                  },
                  "5": {
                      "result": "lose"
                  }
              }
          },
          {
              "tournamentCategoryIds": [
                  "7300f941-113a-4567-a9a2-5e633b555dca",
                  "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
              ],
              "firstName": "Дмитро",
              "lastName": "Єрохін",
              "weight": "105",
              "id": "2a438433-61eb-4a50-8ca4-bbf535bffb74",
              "present": true,
              "stats": {
                  "0": {
                      "result": "win"
                  },
                  "1": {
                      "result": "win"
                  },
                  "2": {
                      "result": "win"
                  },
                  "3": {
                      "result": "lose"
                  },
                  "4": {
                      "result": "lose"
                  }
              }
          },
          {
              "tournamentCategoryIds": [
                  "7300f941-113a-4567-a9a2-5e633b555dca",
                  "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
              ],
              "firstName": "Михайло",
              "lastName": "Шевченко",
              "weight": "150",
              "id": "0969a1bb-b05e-4c3f-a9e3-33fda9b16d37",
              "present": true,
              "stats": {
                  "0": {
                      "result": "lose"
                  },
                  "1": {
                      "result": "win"
                  },
                  "2": {
                      "result": "win"
                  },
                  "3": {
                      "result": "win"
                  },
                  "4": {
                      "result": "lose"
                  }
              }
          },
          {
              "firstName": "Іван",
              "lastName": "Спесивцев ",
              "weight": "110",
              "tournamentCategoryIds": [
                  "7300f941-113a-4567-a9a2-5e633b555dca",
                  "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
              ],
              "id": "84f1a6d9-fecd-4bcb-ab78-1b1649449c7f",
              "present": true,
              "stats": {
                  "0": {
                      "result": "win"
                  },
                  "1": {
                      "result": "win"
                  },
                  "2": {
                      "result": "lose"
                  },
                  "3": {
                      "result": "lose"
                  }
              }
          },
          {
              "firstName": "Артем",
              "lastName": "Попов",
              "weight": "87.5",
              "tournamentCategoryIds": [
                  "7300f941-113a-4567-a9a2-5e633b555dca",
                  "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
              ],
              "id": "b5ea0ff3-edb6-434d-9ed6-6576da0a0eaa",
              "present": true,
              "stats": {
                  "0": {
                      "result": "win"
                  },
                  "1": {
                      "result": "lose"
                  },
                  "2": {
                      "result": "win"
                  },
                  "3": {
                      "result": "lose"
                  }
              }
          },
          {
              "tournamentCategoryIds": [
                  "7300f941-113a-4567-a9a2-5e633b555dca",
                  "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
              ],
              "firstName": "Олександр",
              "lastName": "Картишкін",
              "weight": "102",
              "id": "ed6e2d81-2ff6-436c-84a3-c7678daa63da",
              "present": true,
              "stats": {
                  "0": {
                      "result": "lose"
                  },
                  "1": {
                      "result": "win"
                  },
                  "2": {
                      "result": "win"
                  },
                  "3": {
                      "result": "lose"
                  }
              }
          },
          {
              "firstName": "Андрій",
              "lastName": "Толбатов",
              "weight": "95.3",
              "tournamentCategoryIds": [
                  "179b369a-9fe2-4c0a-a1bb-5ce5ff16c8c9",
                  "a69cd04d-5492-42e4-9c2b-dc991a9e3d15",
                  "7300f941-113a-4567-a9a2-5e633b555dca",
                  "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
              ],
              "id": "d3b8ae2c-3258-40ce-8990-6b3478a9f03a",
              "present": true,
              "stats": {
                  "0": {
                      "result": "win"
                  },
                  "1": {
                      "result": "lose"
                  },
                  "2": {
                      "result": "lose"
                  }
              }
          },
          {
              "firstName": "Костянтин",
              "lastName": "Брехов",
              "weight": "109.6",
              "tournamentCategoryIds": [
                  "7300f941-113a-4567-a9a2-5e633b555dca",
                  "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
              ],
              "id": "2f64c9d9-99ce-4dee-bdbc-9605f6535807",
              "present": true,
              "stats": {
                  "0": {
                      "result": "win"
                  },
                  "1": {
                      "result": "lose"
                  },
                  "2": {
                      "result": "lose"
                  }
              }
          },
          {
              "tournamentCategoryIds": [
                  "7300f941-113a-4567-a9a2-5e633b555dca",
                  "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
              ],
              "firstName": "Станіслав",
              "lastName": "Гулий",
              "weight": "105.7",
              "id": "fb756e7c-4c21-4060-9ddd-1a8e9e698e30",
              "present": true,
              "stats": {
                  "0": {
                      "result": "lose"
                  },
                  "1": {
                      "result": "win"
                  },
                  "2": {
                      "result": "lose"
                  }
              }
          },
          {
              "tournamentCategoryIds": [
                  "7300f941-113a-4567-a9a2-5e633b555dca",
                  "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
              ],
              "firstName": "Олександр",
              "lastName": "Скрипник",
              "weight": "110.3",
              "id": "059c1bcb-4897-48c1-9298-a84b54a239b1",
              "present": true,
              "stats": {
                  "0": {
                      "result": "lose"
                  },
                  "1": {
                      "result": "win"
                  },
                  "2": {
                      "result": "lose"
                  }
              }
          },
          {
              "tournamentCategoryIds": [
                  "7300f941-113a-4567-a9a2-5e633b555dca",
                  "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
              ],
              "firstName": "Гліб",
              "lastName": "Кривоносов",
              "weight": "97.2",
              "id": "2c513f1a-8f98-4dc2-b83a-a7c48f86c0e6",
              "present": true,
              "stats": {
                  "0": {
                      "result": "lose"
                  },
                  "1": {
                      "result": "lose"
                  }
              }
          },
          {
              "tournamentCategoryIds": [
                  "7300f941-113a-4567-a9a2-5e633b555dca",
                  "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
              ],
              "firstName": "Юрій",
              "lastName": "Маляр",
              "weight": "106.5",
              "id": "20c08a4d-36e4-4960-a46a-74964621915f",
              "present": true,
              "stats": {
                  "0": {
                      "result": "lose"
                  },
                  "1": {
                      "result": "lose"
                  }
              }
          },
          {
              "tournamentCategoryIds": [
                  "179b369a-9fe2-4c0a-a1bb-5ce5ff16c8c9",
                  "a69cd04d-5492-42e4-9c2b-dc991a9e3d15",
                  "7300f941-113a-4567-a9a2-5e633b555dca",
                  "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
              ],
              "firstName": "Ігор",
              "lastName": "Окара",
              "weight": "95.2",
              "id": "b0e84cc7-5e56-4092-b591-bf6be8701345",
              "present": true,
              "stats": {
                  "0": {
                      "result": "lose"
                  },
                  "1": {
                      "result": "lose"
                  }
              }
          },
          {
              "tournamentCategoryIds": [
                  "7300f941-113a-4567-a9a2-5e633b555dca",
                  "2c6aa3a1-77d6-46d0-9d1d-7b6b080a64f8"
              ],
              "firstName": "Володимир",
              "lastName": "Кривобок",
              "weight": "154",
              "id": "329dba25-a265-4e6c-b48c-dbdc2cf1b161",
              "present": true,
              "stats": {
                  "0": {
                      "result": "lose"
                  },
                  "1": {
                      "result": "lose"
                  }
              }
          }
      ]
  },
  "postponedCategoriesProgress": {}
}