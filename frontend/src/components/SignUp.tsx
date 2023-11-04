import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';

function Copyright(props: any) {
  return (
    <Typography variant="body2" color="text.secondary" align="center" {...props}>
      {'Copyright © '}
      <Link color="inherit" href="https://mui.com/">
        Your Website
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

const defaultTheme = createTheme();

const SignUp = () => {
  const [_firstName, setFirstName] = useState<string>('');
  const [_lastName, setLastName] = useState<string>('');
  const [_email, setEmail] = useState<string>('');
  const [_password, setPassword] = useState<string>('');
  const [isFirstNameValid, setIsFirstNameValid] = useState<boolean>(true);
  const [isLastNameValid, setIsLastNameValid] = useState<boolean>(true);
  const [isEmailValid, setIsEmailValid] = useState<boolean>(true);
  const [isPasswordValid, setIsPasswordValid] = useState<boolean>(true);
  const navigate = useNavigate();

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    setIsPasswordValid(passValid(newPassword));
  };

  const handleFirstNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const firstName = e.target.value;
    setFirstName(firstName);
    setIsFirstNameValid(isValidName(firstName));
  }

  const handleLastNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const lastName = e.target.value;
    setLastName(lastName);
    setIsLastNameValid(isValidName(lastName));
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const email = e.target.value;
    setEmail(email);
    setIsEmailValid(isValidEmail(email));
  }

  const isValidName = (name: string) => {
    const NAME_PATTERN: RegExp = /^[A-Za-z]+(?:['-][A-Za-z]+)*$/;
    return NAME_PATTERN.test(name);
  }

  const isValidEmail = (email: string) => {
    const EMAIL_PATTERN: RegExp = /^[a-zA-Z0-9]+@(?:[a-zA-Z0-9]+\.)+[A-Za-z]+$/;
    return EMAIL_PATTERN.test(email);
  }

  const passValid = (pass: string) => {
    const PASSWORD_PATTERN: RegExp = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
    return PASSWORD_PATTERN.test(pass);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const payload = {
      firstname: data.get('firstName') as string,
      lastname: data.get('lastName') as string,
      email: data.get('email') as string,
      password: data.get('password') as string,
    };

    if (!isValidName(payload.firstname) || 
        !isValidName(payload.lastname) ||
        !isValidEmail(payload.email) ||
        !passValid(payload.password)) {
      console.error('Validation failed');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to register');
      }

      const responseData = await response.json();
      console.log(responseData);

      navigate('/login');

    } catch (error) {
      console.error('There was an error!', error);
    }
  };

  return (
    <ThemeProvider theme={defaultTheme}>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Register  
          </Typography>
          <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  autoComplete="given-name"
                  name="firstName"
                  required
                  fullWidth
                  id="firstName"
                  label="First Name"
                  autoFocus
                  error={!isFirstNameValid}
                  onChange={handleFirstNameChange}
                  helperText={!isFirstNameValid && 'Please enter a valid first name'}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  id="lastName"
                  label="Last Name"
                  name="lastName"
                  autoComplete="family-name"
                  error={!isLastNameValid}
                  onChange={handleLastNameChange}
                  helperText={!isLastNameValid && 'Please enter a valid last name'}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  error={!isEmailValid}
                  onChange={handleEmailChange}
                  helperText={!isEmailValid && 'Please enter a valid email address'}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  autoComplete="new-password"
                  error={!isPasswordValid}
                  onChange={handlePasswordChange}
                  helperText={!isPasswordValid && 'Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number and one special character'}
                />
              </Grid>
            </Grid>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Sign Up
            </Button>
            <Grid container justifyContent="flex-end">
              <Grid item>
                <Link href="/login" variant="body2">
                  Already have an account? Sign in
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Box>
        <Copyright sx={{ mt: 5 }} />
      </Container>
    </ThemeProvider>
  );
}

export default SignUp;