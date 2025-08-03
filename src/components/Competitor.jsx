import * as React from 'react';
import { Grid, Typography, Divider } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import { useIntl } from 'react-intl';


const getMedalEmoji = (position) => {
  if (position === 1) return '🥇';
  if (position === 2) return '🥈';
  if (position === 3) return '🥉'
  return '';
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

  const { moreButtonVisible = true, withEmoji = false} = props; 
  const { columnConfig = {
    firstName: {
      visible: true,
      flex: 1.5
    },
    lastName: {
      visible: true,
      flex: 2
    },
    weight: {
      visible: true,
      flex: 1
    },
    present: {
      visible: true,
      flex: 2.5
    },
    categories: {
      visible: true,
      flex: 5
    },
  } } = props;

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
          <Grid item xs={columnConfig.firstName.flex} sx={{ }}> 
            <Typography variant="body1">
              {withEmoji && getMedalEmoji(props.position)}{props.position}. {props.firstName}
            </Typography>
          </Grid>
        )}
        {columnConfig.lastName?.visible && (
          <Grid item xs={columnConfig.lastName.flex}> 
            <Typography variant="body1">
              {props.lastName}
            </Typography>
          </Grid>
        )}
        {columnConfig.weight?.visible && (
          <Grid item xs={columnConfig.weight.flex}> 
            <Typography textAlign={'center'}  variant="body1">
              {props.weight}
            </Typography>
          </Grid>
        )}
        {columnConfig.present?.visible && (
          <Grid item xs={columnConfig.present.flex } sx={{ }}> 
            <Typography textAlign={'center'} variant="body1">
              {intl.formatMessage({ id: props.present ? 'common.confirmed' : 'common.unConfirmed'})}
            </Typography>
          </Grid>
        )}
        {columnConfig.categories?.visible && (
          <Grid item xs={columnConfig.categories.flex}>
            <div style={{ display: 'flex', }}>
              <div style={{ display: 'flex', flexDirection: 'column', flex: 1}}>
                {props.categories?.map((name) => (
                  <Typography key={name} textAlign={'center'} component="p" variant="body1">
                    {name}
                  </Typography>  
                ))}
              </div>
              {moreButtonVisible && (
                <IconButton sx={{ my: -1 }} onClick={handleClick} aria-label="більше">
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