import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import { useIntl } from 'react-intl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo_black_transparent.png'
import GoogleIcon from '@mui/icons-material/Google'; // 

import { useAuth } from '../contexts/AuthContext';

export function Copyright(props) {
  return (
    <Typography variant="body2" color="text.secondary" align="center" {...props}>
      {'Copyright © '}
      <Link color="inherit">
        Arm-Grid
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}


export default function SignInSide() {

  const auth = useAuth();
  const navigate = useNavigate();
  const intl = useIntl();


  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const res = await auth.signInWithGoogle();
      console.log('res of auth');      
    } catch (error) {
      console.log('error', error);      
    }
    navigate('/');
  };


  return (
    <Grid container component="main" sx={{ height: '100vh' }}>
      <CssBaseline />
      <Grid
        item
        xs={false}
        sm={4}
        md={7}
        sx={{
          justifyContent: 'center',
          alignItems: 'center',
          display: 'flex',
          flexDirection: 'column',
          // backgroundImage: 'url(https://source.unsplash.com/random)',
          backgroundRepeat: 'no-repeat',
          backgroundColor: (t) =>
            t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900],
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          pb: 20
        }}
      >
        <Box
          component="img"
          sx={{
            maxHeight: { xs: 233, md: 167 },
            maxWidth: { xs: 350, md: 250 },
          }}
          alt="ARM GRID logo"
          src={logo}
        />
        <Typography Typography sx={{ px: 4, pb: 2 }} variant="h1" component="h1">
          {intl.formatMessage({ id: 'app.name' })}
        </Typography>

        <Typography sx={{ px: 4 }} variant="h5" component="h5">
          {intl.formatMessage({ id: 'app.name.description' })}
        </Typography>
      </Grid>
      <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
        <Box
          sx={{
            my: 8,
            mx: 4,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
         //   alignItems: 'center',
          }}
        >
          <Avatar sx={{ m: 1, alignSelf: 'center', bgcolor: 'secondary.main' }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography sx={{ alignSelf: 'center' }} component="h3" variant="h4">
            {intl.formatMessage({ id: 'common.signIn' })}
          </Typography>
          <Box
            sx={{ mt: 1 }}>
            {/* <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
            />
            <FormControlLabel
              control={<Checkbox value="remember" color="primary" />}
              label="Remember me"
            /> */}
            <Button
               variant="outlined"  
              //type="submit"
              startIcon={<GoogleIcon />}
              fullWidth
              sx={{ mt: 3, mb: 2 }}
              onClick={handleSubmit}
            >
              {intl.formatMessage({ id: 'button.auth.google.signIn' })}
            </Button>
            {/* <Grid container>
              <Grid item xs>
                <Link href="#" variant="body2">
                  Forgot password?
                </Link>
              </Grid>
              <Grid item>
                <Link href="/signup" variant="body2">
                  {"Don't have an account? Sign Up"}
                </Link>
              </Grid>
            </Grid> */}
            <Copyright sx={{ mt: 5 }} />
          </Box>
        </Box>
      </Grid>
    </Grid>
  );
}