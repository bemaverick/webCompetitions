import * as React from 'react';
import { Grid, Typography, Tooltip, Chip } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import CreateIcon from '@mui/icons-material/Create';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import { useIntl } from 'react-intl';
import { ATHLETES_LIST_SOURCE } from '../constants/tournamenConfig';


const getMedalEmoji = (position) => {
  if (position === 1) return '🥇';
  if (position === 2) return '🥈';
  if (position === 3) return '🥉'
  return '';
} 

const sourceChipIcons = {
  [ATHLETES_LIST_SOURCE.CREATED]: <CreateIcon fontSize="small"/>,
  [ATHLETES_LIST_SOURCE.IMPORTED]: <CloudDownloadIcon fontSize="small"/>
}
const sourceChipLabel = {
  [ATHLETES_LIST_SOURCE.CREATED]: 'common.manual',
  [ATHLETES_LIST_SOURCE.IMPORTED]: 'common.imported'
}
const sourceChipTooltip = {
  [ATHLETES_LIST_SOURCE.CREATED]: 'hint.athlete.source.created',
  [ATHLETES_LIST_SOURCE.IMPORTED]: 'hint.athlete.source.imported'
}

const sourceChipColor = {
  [ATHLETES_LIST_SOURCE.CREATED]: 'primary',
  [ATHLETES_LIST_SOURCE.IMPORTED]: 'secondary'
}

export const CompetitorRow = (props) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const intl = useIntl();
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const onPressDelete = () => {
    handleClose();
    props.onDelete();
  }

  const onPressEdit = () => {
    handleClose();
    props.onEdit();
  }

  const { moreButtonVisible = true, withEmoji = false } = props; 
  const { columnConfig = {
    firstName: {
      visible: true,
      flex: 1.5
    },
    lastName: {
      visible: true,
      flex: 1.5
    },
    weight: {
      visible: true,
      flex: 0.5
    },
    present: {
      visible: true,
      flex: 2
    },
    source: {
      visible: true,
      flex: 1
    },
    categories: {
      visible: true,
      flex: 5.5
    },
  } } = props;

  if (!ATHLETES_LIST_SOURCE[props.source]) { //tmp to prevent from layout break
    columnConfig.source.visible = false;
    columnConfig.categories.flex = 6.5;
  }

  return (
    <>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
      >
        <MenuItem onClick={onPressEdit}>{intl.formatMessage({ id: 'buttons.edit'})}</MenuItem>
        <MenuItem onClick={onPressDelete}>{intl.formatMessage({ id: 'buttons.delete'})}</MenuItem>
      </Menu>
      <Grid container columnSpacing={1} sx={{  pt:1, pb: 1, borderBottom: '1px solid rgba(0, 0, 0, 0.12)'  }}>
        {columnConfig.firstName?.visible && (
          <Grid item xs={columnConfig.firstName.flex}> 
            <Typography variant="body2">
              {withEmoji && getMedalEmoji(props.position)}{props.position}. {`  ${props.firstName}`}
            </Typography>
          </Grid>
        )}
        {columnConfig.lastName?.visible && (
          <Grid item xs={columnConfig.lastName.flex}> 
            <Typography variant="body2">
              {props.lastName}
            </Typography>
          </Grid>
        )}
        {columnConfig.weight?.visible && (
          <Grid item xs={columnConfig.weight.flex}> 
            <Typography textAlign={'center'}  variant="body2">
              {`${props.weight}`}
            </Typography>
          </Grid>
        )}
        {columnConfig.present?.visible && (
          <Grid item xs={columnConfig.present.flex } sx={{ }}> 
            <Typography textAlign={'center'} variant="body2">
              {intl.formatMessage({ id: props.present ? 'common.confirmed' : 'common.unConfirmed'})}
            </Typography>
          </Grid>
        )}
        {columnConfig.source?.visible && !!ATHLETES_LIST_SOURCE[props.source] && (
          <Grid item xs={columnConfig.source.flex}> 
           <Tooltip title={intl.formatMessage({ id: sourceChipTooltip[props.source] })}>
            <Chip
              size="small"
              icon={sourceChipIcons[props.source]}
              label={intl.formatMessage({ id: sourceChipLabel[props.source] })}
              variant="outlined"
              color={sourceChipColor[props.source]}
            />
          </Tooltip>
          </Grid>
        )}
        {columnConfig.categories?.visible && (
          <Grid item xs={columnConfig.categories.flex}>
            <div style={{ display: 'flex' }}>
              <div style={{ display: 'flex', flexDirection: 'row', flex: 1 }}>
                  <Typography component="span" variant="body2">
                    {props.categories?.map(category => `[${category}]`).join(' ')}
                  </Typography> 
                &nbsp;
              </div>
              {moreButtonVisible && (
                <IconButton sx={{ my: -1 }} onClick={handleClick} aria-label="more">
                  <MoreVertIcon fontSize='small' />
                </IconButton>
              )}
            </div>
          </Grid>
        )}
      </Grid>
    </>
  );
};

CompetitorRow.defaultProps = {

}