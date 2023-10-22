import * as React from 'react';
import { Grid, Typography, Divider } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

export const CompetitorRow = (props) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

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
        <MenuItem onClick={handleClose}>Profile</MenuItem>
        <MenuItem onClick={handleClose}>My account</MenuItem>
        <MenuItem onClick={handleClose}>Logout</MenuItem>
      </Menu>
      <Grid container columnSpacing={1} sx={{  pt:1, pb: 1, borderBottom: '1px solid rgba(0, 0, 0, 0.12)'  }}>
        <Grid item xs={3}> 
          <Typography variant="body1" gutterBottom>
            {props.position}. {props.lastName}
          </Typography>
        </Grid>
        <Grid item xs={3}> 
          <Typography variant="body1" gutterBottom>
            {props.firstName}
          </Typography>
        </Grid>
        <Grid item xs={1}> 
          <Typography variant="body1" gutterBottom>
            {props.weight}
          </Typography>
        </Grid>
        <Grid item xs={5}>
          <div style={{ display: 'flex', alignItems: 'center'}}>
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1}}>
              {props.categories.map((name) => (
                <Typography textAlign={'center'} component="p" variant="body1">
                  {name}
                </Typography>  
              ))}
            </div>
            <IconButton onClick={handleClick} aria-label="більше">
              <MoreVertIcon />
            </IconButton>
          </div>
        </Grid>
      </Grid>
    </>
  )





}