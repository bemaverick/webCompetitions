import * as React from 'react';
import _ from 'lodash';
import { observer } from 'mobx-react-lite';
import { Toolbar, Stack} from '@mui/material';
import { tournamentStore } from '../stores/tournament';
import { generateResultsPdf } from '../lib/pdf';
import { ResultsByCategories } from '../components/ResultsByCategories';

export default observer(function TournamentResults() {
  const results = [];
  Object.keys(tournamentStore.results).map(categoryId => {
    const category = _.cloneDeep(tournamentStore.newTournamentCategories[categoryId]);
    results.push({
      category,
      categoryResults: tournamentStore.results[categoryId]
    })
  });

  return (
    <Stack sx={{ height: '100vh' }}>
      <Toolbar />
      <ResultsByCategories
        results={results}
        onClickGenerate={() => generateResultsPdf(tournamentStore.resultForPDF)}
      />
    </Stack>
  )
});

const demoData = {
  title: "Kyiv Armwrestling Open 2025",
  date:  "2025-09-06",
  categoriesResults: [
    {
      name: "Senior men 55 kg, left hand",
      results: ["Ivan Petrov","Mykola Ivanov","Сергій Ivanchenko","Oleksandr Kovalenko","Vadym Shevchenko"]
    },
    {
      name: "Senior men 60 kg, left hand",
      results: ["Devon Larratt","Levan Saginashvili","John Brzenk","Denis Cyplenkov","Rob Vigent Jr."]
    },
    {
      name: "Senior men 70 kg, right hand (long category name demo to show line wrapping) as dasd sad sad sad asdas",
      results: Array.from({ length: 30 }, (_, i) => `Учасник ${i + 1}`)
    }
  ]
};