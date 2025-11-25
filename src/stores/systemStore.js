// store.js

import { makeAutoObservable, autorun, action } from 'mobx';
import { v4 as uuidv4 } from 'uuid';
import _, { findLast } from 'lodash';
import { makePersistable } from 'mobx-persist-store';
import { CATEGORY_STATE, CLASSIFICATION_LIST_DEFAULT, HANDS, MATCH_RESULT, SEX, TABLE_INITIAL_STATE, TABLE_STATE, WEIGHT_CATEGORIES_DEFAULT, WEIGHT_UNIT_KG, WEIGHT_UNITS } from '../constants/tournamenConfig';
import { createTournamentCategoryConfig } from '../utils/categoriesUtils';

class SystemStore {
  constructor() {
    makeAutoObservable(this);

    makePersistable(
      this,
      {
        name: 'SystemStore',
        properties: [
          'appState'
        ],
        storage: window.localStorage
      }
    );
  }

  appState = 'competitionsList'; // competitionsList | competitionInProgress

  snackBar = {
    visible: false,
    message: '',
    style: 'error',
  };

  setAppState(state) {
    this.appState = state;
  }

  displaySnackbar(isVisible, message = '', style = 'error') {
    this.snackBar = {
      visible: isVisible,
      message,
      style,
    };
  }


}

export const systemStore = new SystemStore();

