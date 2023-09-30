import * as React from 'react';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import { CircularProgress } from '@mui/material';
import Button from '@mui/material/Button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';


export default function InitialPage() {
  const auth = useAuth();
  const navigate = useNavigate();

  // React.useEffect(() => {
  //   setTimeout(() => navigate('/signup'), 3000);
  // }, [])


  return (
    <Grid container component="main" sx={{ height: '100vh' }}>
      <Grid
        item
        xs={false}
        sm={8}
        md={12}
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundImage: 'url(https://source.unsplash.com/random)',
          backgroundRepeat: 'no-repeat',
          backgroundColor: (t) =>
            t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900],
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <CircularProgress></CircularProgress>
        <Button
          onClick={() => {
            auth.logout();
          }}
          variant="outlined"
        >
          Logout
        </Button>

      </Grid>
    </Grid>
  );
}