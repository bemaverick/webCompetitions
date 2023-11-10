import * as React from 'react';
import { Grid, Typography, Divider } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

const getMedalEmoji = (position) => {
  if (position === 1) return '🥇';
  if (position === 2) return '🥈';
  if (position === 3) return '🥉'
  return '';
} 

export const CompetitorRow = (props) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
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
  const { columnSizes = [3, 3, 1, 5] } = props;


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
        <MenuItem onClick={onPressEdit}>Редагувати</MenuItem>
        <MenuItem onClick={onPressDelete}>Видалити</MenuItem>
      </Menu>
      <Grid container columnSpacing={1} sx={{  pt:1, pb: 1, borderBottom: '1px solid rgba(0, 0, 0, 0.12)'  }}>
        <Grid item xs={columnSizes[0]} sx={{ }}> 
          <Typography variant="body1">
            {withEmoji && getMedalEmoji(props.position)}{props.position}. {props.lastName}
          </Typography>
        </Grid>
        <Grid item xs={columnSizes[1]}> 
          <Typography variant="body1">
            {props.firstName}
          </Typography>
        </Grid>
        <Grid item xs={columnSizes[2]}> 
          <Typography variant="body1">
            {props.weight}
          </Typography>
        </Grid>
         {columnSizes[3] && (
          <Grid item xs={columnSizes[3]}>
            <div style={{ display: 'flex', }}>
              <div style={{ display: 'flex', flexDirection: 'column', flex: 1}}>
                {props.categories.map((name) => (
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