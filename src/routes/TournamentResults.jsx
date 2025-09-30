import * as React from 'react';
import Box from '@mui/material/Box';
import _ from 'lodash';
import Tab from '@mui/material/Tab';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';

import FormControl from '@mui/material/FormControl';
import Toolbar from '@mui/material/Toolbar';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';

import List from '@mui/material/List';
import ListItemText from '@mui/material/ListItemText';

import ListItemIcon from '@mui/material/ListItemIcon';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListSubheader from '@mui/material/ListSubheader';
import { CompetitorRow } from '../components/Competitor';

import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';

import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate  } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { tournamentStore } from '../stores/tournament';
import { jsPDF } from "jspdf";
import { useIntl } from 'react-intl';
import { generateTournamentCategoryTitle } from '../utils/categoriesUtils';


const theme = createTheme();

const handTranslations = {
  left: 'ліва рука',
  right: 'права рука',
}

const genderTranslations = {
  men: 'чоловіки',
  women: 'жінки',
}

const CategoryItem = ({ title, subTitle, id, onClick, selected }) => {
  return (
    <ListItem divider disablePadding>
      <ListItemButton selected={selected} onClick={onClick}>
        <ListItemText
          primary={title}
          secondary={subTitle}
        />
      </ListItemButton>
    </ListItem>
  )
}

function createHeaders(keys) {
  var result = [];
  for (var i = 0; i < keys.length; i += 1) {
    result.push({
      id: keys[i],
      name: keys[i],
      prompt: keys[i],
      width: 65,
      align: "center",
      padding: 0
    });
  }
  return result;
}

var headers = createHeaders([
  "id",
  "game_group",
  "game_name",
]);

const demoData = {
  title: "Kyiv Armwrestling Open 2025",
  date:  "2025-09-06",
  categories: [
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

export default observer(function TournamentResults() {
  const [currentCategoryId, setCurrentCategoryId] = React.useState('');
  const intl = useIntl();

  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    console.log(event)
  };

  const generateResultPDF = ({ title, date, categories }) => {
    //  console.log('generateResultPDF');
    //  const items = [];
    //  _.map(tournamentStore.results, (category, id) => {
    //   category.map(el => {

    //     items.push({
    //       id: (id).toString(),
    //       game_group: el.firstName,
    //       game_name: el.lastName,
    //     })
    //   });
    //   console.log(items);
    //   console.log(headers)

    // }) 
    // const doc = new jsPDF({ putOnlyUsedFonts: true, orientation: "landscape" });
    // doc.addFont("../assets/PTSans-Regular.ttf", "PTSans", "normal");

    // doc.setFont("PTSans"); // set font
    // doc.setFontSize(10);
    // doc.table(1, 1, items, headers, { autoSize: true });
    // doc.save("a4.pdf")

      const doc = new jsPDF({ unit: "pt", format: "a4" });
      const pageWidth  = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      const margin = { top: 48, right: 48, bottom: 64, left: 48 };

      const titleSize = 16;
      const dateSize  = 11;
      const catSize   = 13;
      const itemSize  = 11;

      const lineGap        = 6;
      const catTitleGap    = 10;
      const catBlockGap    = 12;
      const dateBlockGap   = 18;

      // Відступи навколо розділювача (збільшені +6)
      const sepTopGap  = 22;  // було 16 → стало 22
      const sepBotGap  = 22;  // було 16 → стало 22

      const sepColorGray = 60;
      const sepLineWidth = 1;

      let y = margin.top;
      let isFirstPage = true;

      function drawHeader({ showDate }) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(titleSize);
        doc.text(title, pageWidth / 2, y, { align: "center" });
        y += titleSize + 4;

        if (showDate) {
          doc.setFont("helvetica", "normal");
          doc.setFontSize(dateSize);
          doc.text(date, pageWidth - margin.right, y, { align: "right" });
          y += dateBlockGap;
        } else {
          y += 8;
        }
      }

      function ensureSpace(neededHeight) {
        if (y + neededHeight > pageHeight - margin.bottom) {
          doc.addPage();
          y = margin.top;
          isFirstPage = false;
          drawHeader({ showDate: false });

          // 🟢 Відновлюємо стиль для списків (regular, 11pt)
          doc.setFont("helvetica", "normal");
          doc.setFontSize(itemSize);
        }
      }

      // --- Контент ---
      drawHeader({ showDate: true });

      categories.forEach((cat, catIndex) => {
        const catMaxWidth = pageWidth - margin.left - margin.right;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(catSize);

        const catLines = doc.splitTextToSize(cat.name, catMaxWidth);
        const catBlockHeight = catLines.length * (catSize + 2);
        ensureSpace(catBlockHeight + catTitleGap);

        catLines.forEach(line => {
          doc.text(line, margin.left, y);
          y += catSize + 2;
        });
        y += catTitleGap;

        // Учасники завжди однаковим стилем (звичайний regular)
        doc.setFont("helvetica", "normal");
        doc.setFontSize(itemSize);

        cat.results.forEach((athlete, idx) => {
          const text = `${idx + 1}. ${athlete}`;
          const itemLines = doc.splitTextToSize(text, catMaxWidth - 16);
          const itemHeight = itemLines.length * (itemSize + 2);

          ensureSpace(itemHeight + lineGap);

          const itemX = margin.left + 12;
          itemLines.forEach(line => {
            doc.text(line, itemX, y);
            y += itemSize + 2;
          });

          y += lineGap;
        });

        y += catBlockGap;

        // Розділювач
        if (catIndex < categories.length - 1) {
          ensureSpace(sepTopGap + sepLineWidth + sepBotGap);
          y += sepTopGap;

          doc.setDrawColor(sepColorGray);
          doc.setLineWidth(sepLineWidth);
          doc.line(margin.left, y, pageWidth - margin.right, y);

          y += sepBotGap;
        }
      });

      // --- Футер ---
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);

        // Лінія футера (на 6pt вище від тексту)
        doc.setDrawColor(180);
        doc.setLineWidth(0.5);
        const footerY = pageHeight - margin.bottom + 16;
        doc.line(margin.left, footerY - 16, pageWidth - margin.right, footerY - 16); // було -10 → стало -16

        // Нумерація по центру
        doc.setFont("helvetica", "italic");
        doc.setFontSize(10);
        const footerText = `Page ${i} of ${pageCount}`;
        doc.text(footerText, pageWidth / 2, footerY, { align: "center" });

        // Маленький текст праворуч
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.text("made with ARM-GRID", pageWidth - margin.right, footerY, { align: "right" });
      }

      doc.save("tournament_results.pdf");

   
  }


  return (
    <Stack sx={{ flexDirection: 'column', height: '100vh' }}>
      <Toolbar />
      {/* <Button
        sx={{ mt: 2, mb: 3, }}
        onClick={() => {
          generateResultPDF();
          // tournamentStore.removeResults();
          // Default export is a4 paper, portrait, using millimeters for units
          // try {
          //   const doc = new jsPDF();

          //   doc.text("Hello world!", 10, 10);
          //   doc.save("a4.pdf")
          // } catch (error) {
            
          // }
        }}
        variant='outlined'
      >
        Видалити
      </Button> */}
      <Stack sx={{ flexGrow: 1, overflow: 'hidden', flexDirection: 'row'}}>
        <Stack sx={{ flex: 2, overflow: 'scroll', p: 2, pt: 0 }}>
          <List
            sx={{ pt: 0}}
            dense={true}
          >
            {/* <ListSubheader
              disableGutters
              sx={{ display: 'flex', pt: 0, backgroundColor: '#fafafa', justifyContent: 'center', borderBottom: '2px solid #ddd', }}>
                Пошук по категорії
            </ListSubheader> */}
            {Object.keys(tournamentStore.results).map((tournamentCategoryId) => {
              const category = tournamentStore.newTournamentCategories[tournamentCategoryId];
              return (
                <CategoryItem
                  onClick={() => setCurrentCategoryId(tournamentCategoryId)}
                  selected={currentCategoryId === category.id}
                  key={tournamentCategoryId}
                  title={generateTournamentCategoryTitle(intl, category.config)}
                  subTitle={generateTournamentCategoryTitle(intl, category.config, 'handOnly')}
                />
              )
            })}
          </List>
        </Stack>
        <Divider orientation='vertical'></Divider>
        <CategoryDetailsView
          tournamentCategoryId={currentCategoryId}
          generateResultPDF={() => generateResultPDF(demoData)}
        />
      </Stack>
    </Stack>
  )
});


const CategoryDetailsView = observer((props) => {
  const intl = useIntl();
  const currentTournamentCategory = tournamentStore.newTournamentCategories[props.tournamentCategoryId];
  const results = tournamentStore.results[props.tournamentCategoryId] || [];


  // const categoryCompetitorsList = React.useMemo(() => {
  //   const results = tournamentStore.results[props.tournamentCategoryId] || [];
  //   return results;

  // }, [props.tournamentCategoryId]);
  
  return (
    <Stack sx={{ flex: 9, flexDirection: 'column', p: 2 }}>
        <Grid container justifyContent={'center'} sx={{ p: 2 }}>
          <Grid item xs={3}>
            <Button
              //sx={{ height: '40px', mt: 2 }}
              size='noraml'
              fullWidth
              variant='contained'
              onClick={props.generateResultPDF}
            >
              {intl.formatMessage({ id: 'button.create.pdf' })}
            </Button>
          </Grid>
        </Grid>
      {currentTournamentCategory && (
        <Typography variant="h6" component="h6" sx={{ p: 2, textAlign: 'center' }}>
          {generateTournamentCategoryTitle(intl, currentTournamentCategory.config, 'full')}
        </Typography>
      )}

      <Stack elevation={2} sx={{ flexGrow: 1, p: 2, overflow: 'hidden', border: '2px solid #eee', borderRadius: 1  }}>
        <Stack sx={{ flexGrow: 1, overflow: 'scroll', alignItems: 'center' }}>
          <Box>
            {results.map((competitor, index) => (
              <Typography variant="body1" component="p" sx={{ p: 0, textAlign: 'left' }}>
                {competitor ? `${index + 1}. ${competitor.lastName} ${competitor.firstName}` : `${index + 1}.`}
              </Typography>
            ))}
          </Box>
        </Stack>
      </Stack>
    </Stack>
  )
})