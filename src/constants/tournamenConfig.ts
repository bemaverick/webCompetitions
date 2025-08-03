export const CATEGORY_OPEN_ID = 'open_weight_class';

export const WEIGHT_CATEGORIES_DEFAULT = [
  {
    id: '50',
    value: '50',
  }, {
    id: '55',
    value: '55',
  }, {
    id: '60',
    value: '60',
  }, {
    id: '65',
    value: '65',
  }, {
    id: '70',
    value: '70',
  }, {
    id: '75',
    value: '75',
  }, {
    id: '80',
    value: '80',
  }, {
    id: '85',
    value: '85',
  }, {
    id: '90',
    value: '90',
  }, {
    id: '90+',
    value: '90+',
  }, {
    id: '100',
    value: '100',
  }, {
    id: '110',
    value: '110',
  },{
    id: '110+',
    value: '110+',
  }, {
    id: CATEGORY_OPEN_ID, // means absolute category
  }
];

export const WEIGHT_CATEGORIES_DEFAULT_LBS = [
  {
    id: '139', 
    value: '139', // 63kg
  }, {
    id: '155',
    value: '155', // 70kg
  }, {
    id: '172',
    value: '172', // 78kg
  }, {
    id: '190',
    value: '190', // 86kg
  }, {
    id: '210',
    value: '210', // 95 kg
  }, {
    id: '231',
    value: '231', // 105kg
  }, {
    id: '231+',
    value: '231+', // 105kg+
  }, {
    id: CATEGORY_OPEN_ID, // means absolute category
  }
];

const OFFICIAL_CLASSIFICATION = { // WAF, EAF, UAF
  SENIOR: 'senior',
  MASTER: 'master', // 40+
  GRAND_MASTER: 'grand_master', // 50+
  SENIOR_GRAND_MASTER: 'senior_grand_master', // 60+ 
  SUB_JUNIOR_15: 'sub_junior_15', // 14-15
  JUNIOR_18: 'junior_18', // 16-18
  YOUTH_21: 'jouth_21', // 19-21
};

const NON_OFFICIAL_CLASSIFICATION = {
  AMATEUR: 'amateur',
}

export const CLASSIFICATION_LIST_DEFAULT = [
  {
    id: OFFICIAL_CLASSIFICATION.SENIOR,
    labelKey: 'classification.senior',
  }, {
    id: OFFICIAL_CLASSIFICATION.SUB_JUNIOR_15,
    labelKey: 'classification.subJunior',
  }, {
    id: OFFICIAL_CLASSIFICATION.JUNIOR_18,
    labelKey: 'classification.junior18',
  }, {
    id: OFFICIAL_CLASSIFICATION.YOUTH_21,
    labelKey: 'classification.youth21',
  }, {
    id: OFFICIAL_CLASSIFICATION.MASTER,
    labelKey: 'classification.master',
  }, {
    id: OFFICIAL_CLASSIFICATION.GRAND_MASTER,
    labelKey: 'classification.grandmaster',
  }, {
    id: NON_OFFICIAL_CLASSIFICATION.AMATEUR,
    labelKey: 'classification.amateur',
  }, 
];

export const TABLES_SELECT_CONFIG = [
  {
    key: '0',
    value: 1,
    titleKey: 'tables.count.one'
  }, {
    key: '1',
    value: 2,
    titleKey: 'tables.count.two'
  }, {
    key: '2',
    value: 3,
    titleKey: 'tables.count.three'
  }, {
    key: '3',
    value: 4,
    titleKey: 'tables.count.four'
  }, {
    key: '4',
    value: 5,
    titleKey: 'tables.count.five'
  }, {
    key: '5',
    value: 6,
    titleKey: 'tables.count.six'
  },
];

export const WEIGHT_UNIT_KG = 'kg';
export const WEIGHT_UNIT_LBS = 'lbs';

export const WEIGHT_UNITS = {
  [WEIGHT_UNIT_KG]: {
    value: WEIGHT_UNIT_KG,
    factor: 1,
  }, 
  [WEIGHT_UNIT_LBS]: {
    value: WEIGHT_UNIT_LBS,
    factor: 0.45359237,
  }
};

const STATUSES = {
  IDLE: 'idle',
};

export const CATEGORY_STATE = {
  ...STATUSES,
}

export const TABLE_INITIAL_STATE = {
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

export const HANDS = {
  RIGHT: 'right',
  LEFT: 'left'
};

export const SEX = {
  MEN: 'men',
  WOMEN: 'women'
};



export const FAKE_competitorsList = [
  { firstName: 'Сергій', lastName: 'Гоненко', weight: '70', category: '90_man_left', id: '1'},
  { firstName: 'Сергій', lastName: 'Мориконь', weight: '88', category: '90_man_left', id: '2'},
  { firstName: 'Антон', lastName: 'Леонов', weight: '88', category: '90_man_left', id: '3'},
  { firstName: 'Олексій', lastName: 'Лупійчук', weight: '90', category: '90_man_left', id: '4'},
  // { firstName: 'Іван', lastName: 'Драганчук', weight: '88', category: '90_man_left', id: '5'},
  // { firstName: 'Павло', lastName: 'Курильчик', weight: '93', category: '90_man_left', id: '6'},
  // { firstName: 'Тарас', lastName: 'Сергійчук', weight: '88', category: '90_man_left', id: '7'},
  // { firstName: 'Олег', lastName: 'Попов', weight: '90', category: '90_man_left', id: '8'},
  // { firstName: 'Сергій', lastName: 'Дьомін', weight: '88', category: '90_man_left', id: '9'},
  // { firstName: 'Микола', lastName: 'Попенко', weight: '88', category: '90_man_left', id: '10'},
  // { firstName: 'Степан', lastName: 'Савченко', weight: '87', category: '90_man_left', id: '11'},
  // { firstName: 'Платон', lastName: 'Раменко', weight: '88', category: '90_man_left', id: '12'},
  { firstName: 'Максим', lastName: 'Ванчугов', weight: '85', category: '90_man_left', id: '13'},
  { firstName: 'Сергій', lastName: 'Бахмат', weight: '88', category: '90_man_left', id: '14'},
  { firstName: 'Володимир', lastName: 'Костків', weight: '86', category: '90_man_left', id: '15'},
  { firstName: 'Анатолій', lastName: 'Ткаченко', weight: '90', category: '90_man_left', id: '16'},
  { firstName: 'Олександр', lastName: 'Омельченко', weight: '91', category: '90_man_left', id: '17'},
  { firstName: 'Олександр', lastName: 'Македонський', weight: '88', category: '110_man_right', id: '18'},
  { firstName: 'Павло', lastName: 'Мінтян', weight: '86', category: '110_man_right', id: '19'},
  { firstName: 'Святослав', lastName: 'Меденці', weight: '90', category: '110_man_right', id: '16'},
  { firstName: 'Владислав', lastName: 'Дзисяк', weight: '91', category: '110_man_right', id: '20'},
]
