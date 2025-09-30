import { HANDS, SEX, CATEGORY_STATE, CATEGORY_OPEN_ID } from "../constants/tournamenConfig"
import { tournamentStore } from "../stores/tournament";

export function createTournamentCategoryConfig(id, hand, sex, defaults) {
  return {
    id,
    config: {
      ...defaults,
      hand,
      sex,
    },
    state: CATEGORY_STATE.IDLE
  }
}

export function generateTournamentCategoryTitle(intl, tournamentCategoryConfig, mode = 'default') {
  const weightUnitLabel = intl.formatMessage({ id: `unit.weight.${tournamentStore.weightUnit.value}`});
  
  const { classification, weightCategory, hand, sex } = tournamentCategoryConfig;

  const classificationTitle = classification.labelKey
    ? intl.formatMessage({ id: classification.labelKey})
    : classification.label;
  const weightCategoryValue = weightCategory.id === CATEGORY_OPEN_ID
    ? intl.formatMessage({ id: "category.open" })
    : `${weightCategory.value} ${weightUnitLabel}`;
    
  const handTitle = intl.formatMessage({ id: `common.hand.${hand}`});
  const sexTitle = intl.formatMessage({ id: `common.sex.${sex}`});
  if (mode === 'handOnly') {
    return handTitle;
  }
  if (mode === 'full') {
    return `${classificationTitle} ${sexTitle} ${weightCategoryValue} ${handTitle}`;
  }
  return `${classificationTitle} ${sexTitle} ${weightCategoryValue}`;
}

export const categoryStateTranslationsKey = {
  [CATEGORY_STATE.IDLE]: 'common.state.idle',
  [CATEGORY_STATE.FINISHED]: 'common.state.finished',
  [CATEGORY_STATE.PAUSED]: 'common.state.paused',
  [CATEGORY_STATE.IN_PROGRESS]: 'common.state.inProgress',
};

export const categoryChipStyle = {
  [CATEGORY_STATE.IDLE]: 'warning',
  [CATEGORY_STATE.FINISHED]: 'success',
  [CATEGORY_STATE.PAUSED]: 'primary',
  [CATEGORY_STATE.IN_PROGRESS]: 'primary',
}