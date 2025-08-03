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