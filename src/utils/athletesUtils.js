import { ATHLETE_STATUS } from "../constants/tournamenConfig";

export const athletesStatusTransationKeys = {
  [ATHLETE_STATUS.REGISTERED]: 'common.athlete.status.registered',
  [ATHLETE_STATUS.CHECKED_IN]: 'common.athlete.status.checkedIn',
};

export const athletesStatusHintTransationKeys = {
  [ATHLETE_STATUS.REGISTERED]: 'hint.participant.registered',
  [ATHLETE_STATUS.CHECKED_IN]: 'hint.participant.checkedIn',
};