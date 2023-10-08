// store.js

import { makeAutoObservable, autorun, toJS } from 'mobx';
import { v4 as uuidv4 } from 'uuid';
import _ from 'lodash';


const FAKE_tournamentCategories = {
  '90_man_left': [],
  '90_man_right': [],
  '110_man_left': [],
  '110_man_right': [],
}
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
class TournamentStore {
  constructor() {
    makeAutoObservable(this);
  }

  tournamentName = '';

  tournamentDate = new Date();

  tablesCount = 3;

  currentTableIndex = 0;

  //groupA[competitorIndex].results[roundId].result === win || false
  tables = {
    0: {
      category: '',
      state: 'idle',
      rounds: {
        0: {
          groupA: [],
          groupB: []
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
          groupB: []
        },
        1: {
          groupA: [],
          groupB: []
        }
      },
      selectedRound: 0
    },
    2: {
      category: '',
      state: 'idle',
      rounds: {
        0: []
      },
      selectedRound: 0
    }
  }

  weightCategories = [];

  classificationCategories = [];

  tournamentCategories = FAKE_tournamentCategories;

  competitorsList = FAKE_competitorsList;

  setTournamentName = (name) => this.tournamentName = name;

  setTournamentDate = (date) => this.tournamentDate = date;

  setTablesCount = (tablesCount) => {
    this.tablesCount = tablesCount;
    for (let i = 0; i < tablesCount; i ++ ) {
      this.tables[i] = {
        state: 'idle',
        category: '',
        competitorTable: []
      } 
    }
    console.log(toJS(this.tables));
  };

  setCurrentTableIndex = (index) => this.currentTableIndex = index;

  setSelectedRoundIndex = (index) => this.currentTable.selectedRound = index;


  addWeightCategory = (weightCategory) => {
    this.weightCategories = [...this.weightCategories, weightCategory];
  };

  addClassificationCategory = (clasiffications) => {
    this.classificationCategories = [...this.classificationCategories, clasiffications];
  };

  addCategory = ({weight, classification, hand }) => {
    this.tournamentCategories = {
      ...this.tournamentCategories,
      [`${weight}_${classification}_${hand}`]: []
    }
    console.log('tournamentCategories', this.tournamentCategories)
  }

  addCompetitor = ({ firstName, lastName, weight, category }) => {
    const newCompetitor = {
      firstName, 
      lastName, 
      weight, 
      category,
      id: uuidv4(),
    }
    this.competitorsList = [newCompetitor, ...this.competitorsList]
  }

  setTableCategory = (tableId, category) => {
    this.tables[tableId].category = category;
  }

  setTableStatus = (tableId, state) => {
    this.tables[tableId].state = state;
    if (state === 'started') {
      this.setupFirstRound(tableId);
    }
  }

  setupFirstRound = () => {
    const actualCategory = this.competitorsList.filter(({ category }) => category === this.currentTable.category);
    const groupA = actualCategory.map((competitor) => ({...competitor, stats: { 0: { result: 'idle' }}}))
    this.currentTable.rounds[0].groupA = _.shuffle(groupA);
    this.currentTable.selectedRound = 0;
    this.currentRound.groupB = [];
  }

  startNextRound = () => {
    const nextRoundIndex = +this.currentRoundIndex + 1; //fix this
    const newRoundGroupA = [];
    let newRoundGroupB = [];


    this.currentGroupA.map((competitor, index) => {
      const isLastPairIncomplete = (index === this.currentGroupA.length - 1) && this.currentGroupA.length % 2 === 1;
      const isCompetitorWinner = competitor.stats[this.currentRoundIndex].result === 'win';
      const isCompetitorLoser = competitor.stats[this.currentRoundIndex].result === 'lose';
      const numberOfLoses = Object.values(competitor.stats).reduce((prev, current) => prev + (current.result === 'lose' ? 1 : 0), 0);
      // this for final and superfinal when competitor from groupB moved to groupA
      console.log(competitor.lastName, numberOfLoses, JSON.stringify(competitor.stats))


      if (numberOfLoses === 2) {
        return;
      }

      if (isLastPairIncomplete) {
        newRoundGroupA.unshift({
          ...competitor,
          //stats: { ...competitor.stats, [nextRoundIndex]: { result: 'idle' }}
          stats
        });
        return;
      }
      if (isCompetitorWinner) {
        newRoundGroupA.push({
          ...competitor,
          stats: { ...competitor.stats, [nextRoundIndex]: { result: 'idle' }}
        })
      }
      if (isCompetitorLoser) {
        newRoundGroupB.push({
          ...competitor,
          stats: { ...competitor.stats, [nextRoundIndex]: { result: 'idle' }}
        })
      }
    });

    this.currentGroupB.map((competitor, index) => { 
      console.log('inside group B')
      const isLastPairIncomplete = (index === this.currentGroupB.length - 1) && this.currentGroupB.length % 2 === 1;
      const isCompetitorWinner = competitor.stats[this.currentRoundIndex].result === 'win';
      //const isCompetitorLoser = competitor.stats[this.currentRoundIndex].result === 'lose';
      if (isLastPairIncomplete) {
        newRoundGroupB.unshift({
          ...competitor,
          stats: { ...competitor.stats, [nextRoundIndex]: { result: 'idle' }}
        });
        return;
      }
      if (isCompetitorWinner) {
        newRoundGroupB.push({
          ...competitor,
          stats: { ...competitor.stats, [nextRoundIndex]: { result: 'idle' }}
        })
      }
      // if (isCompetitorWinner) {
      //   newRoundGroupB.push({
      //     ...competitor,
      //     stats: { ...competitor.stats, [nextRoundIndex]: { result: 'idle' }}
      //   })
      // }
    });

    if (newRoundGroupB.length === 1) { //this means competitor should go to final or its last battle
      console.log('group B with one competitor')
      newRoundGroupA.push(_.cloneDeep(newRoundGroupB[0]));
      newRoundGroupB = [];
      // let numberOfLoses = Object.values(newRoundGroupB[0].stats).reduce((prev, current) => prev + (current.result === 'lose' ? 1 : 0), 0);
      // console.log('numberOfLoses', numberOfLoses, JSON.stringify(toJS(newRoundGroupB[0])))
      // if (numberOfLoses === 1) {
      //   newRoundGroupA.push(newRoundGroupB[0]);
      //   newRoundGroupB = [];
      // }
      // } else {
      //   newRoundGroupA.push(newRoundGroupB[0]);
      //   newRoundGroupB.shift();
      // }
    } 


     console.log('nextRound', nextRoundIndex)
     console.log('groupA', toJS(newRoundGroupA))
     console.log('groupB',  toJS(newRoundGroupB))


     this.currentTable.rounds[nextRoundIndex] = { groupA: newRoundGroupA, groupB: newRoundGroupB };
     this.currentTable.selectedRound = nextRoundIndex;
  }

  markWinner = (competitorId, group) => {
    let currentGroup;
    if (group === 'groupA') {
      currentGroup = this.currentGroupA
    }
    if (group === 'groupB') {
      currentGroup = this.currentGroupB
    }
    // console.log('mark', toJS(currentGroup))
    const selectedCompetitorIndex = currentGroup.findIndex(competitor => competitor.id === competitorId);
    // console.log('currentGroup[selectedCompetitorIndex]', selectedCompetitorIndex);
    //index of another competitor in pair
    const pairedCompetitorIndex = selectedCompetitorIndex % 2 == 0
      ? selectedCompetitorIndex + 1
      : selectedCompetitorIndex - 1;
    
    currentGroup[selectedCompetitorIndex].stats = {
      ...currentGroup[selectedCompetitorIndex].stats,
      [this.currentRoundIndex]: {
        result: "win"
      }
    };
    if (pairedCompetitorIndex < currentGroup.length) {
      currentGroup[pairedCompetitorIndex].stats = {
        ...currentGroup[selectedCompetitorIndex].stats,
        [this.currentRoundIndex]: {
          result: "lose"
        }
      };
    }
    //console.log('currentGroup[selectedCompetitorIndex]', selectedCompetitorIndex);
  }

  get
  currentTable() {
    return this.tables[this.currentTableIndex];
  }
  
  get
  currentRoundIndex() {
    return this.currentTable.selectedRound;
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


}



export const tournamentStore = new TournamentStore();

autorun(() => {
  console.log("Energy level:", tournamentStore)
})