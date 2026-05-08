import { collection, doc, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import { format, fromUnixTime, getUnixTime } from "date-fns";
import { firestoreDB, firestoreTournamentsPath } from "../../firebase";

const tournamentsRef = collection(firestoreDB, firestoreTournamentsPath);

export const getTournamentPayload = ({
  tournamentId,
  userId,
  tournamentName,
  tournamentDate,
  tablesCount,
  weightUnit,
}) => {
  const dateObject = fromUnixTime(tournamentDate / 1000);
  const formattedDate = format(dateObject, 'dd-MM-yyyy');

  return {
    tournament: {
      name: tournamentName || 'Unnamed Tournament',
      date: formattedDate,
      tablesCount,
      weightUnit,
    },
    id: tournamentId,
    createdAt: serverTimestamp(),
    user: {
      uid: userId,
    },
  };
};

export const saveNewTournament = async ({
  userId,
  tournamentName,
  tournamentDate,
  tablesCount,
  weightUnit,
}) => {
  const tournamentRef = doc(tournamentsRef);
  const tournamentPayload = getTournamentPayload({
    tournamentId: tournamentRef.id,
    userId,
    tournamentName,
    tournamentDate,
    tablesCount,
    weightUnit,
  });

  await setDoc(tournamentRef, tournamentPayload);

  return {
    id: tournamentRef.id,
    ref: tournamentRef,
    data: tournamentPayload,
  };
};

export const updateTournament = async ({
  tournamentId,
  userId,
  tournamentName,
  tournamentDate,
  tablesCount,
  weightUnit,
}) => {
  const tournamentRef = doc(tournamentsRef, tournamentId);
  console.log('tournamentPayload', tournamentDate)
  const tournamentPayload = getTournamentPayload({
    tournamentId,
    userId,
    tournamentName,
    tournamentDate,
    tablesCount,
    weightUnit,
  });
  console.log('tournamentDate', tournamentDate)
  const { createdAt, ...tournamentDataWithoutCreatedAt } = tournamentPayload;

  await updateDoc(tournamentRef, tournamentDataWithoutCreatedAt);

  return {
    id: tournamentId,
    ref: tournamentRef,
    data: tournamentDataWithoutCreatedAt,
  };
};
