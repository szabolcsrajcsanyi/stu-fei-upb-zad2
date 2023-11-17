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
import Copyright from './Copyright';
import AlertDialog from './AlertDialog';

const defaultTheme = createTheme();

const SignUp = () => {
  const [_firstName, setFirstName] = useState<string>('');
  const [_lastName, setLastName] = useState<string>('');
  const [_email, setEmail] = useState<string>('');
  const [_password, setPassword] = useState<string>('');
  const [addressLine1, setAddressLine1] = useState<string>('');
  const [addressLine2, setAddressLine2] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [state, setState] = useState<string>('');
  const [postalCode, setPostalCode] = useState<string>('');
  const [telephone, setTelephone] = useState<string>('');
  const [isFirstNameValid, setIsFirstNameValid] = useState<boolean>(true);
  const [isLastNameValid, setIsLastNameValid] = useState<boolean>(true);
  const [isEmailValid, setIsEmailValid] = useState<boolean>(true);
  const [isPasswordValid, setIsPasswordValid] = useState<boolean>(true);
  const [isCityValid, setIsCityValid] = useState<boolean>(true);
  const [isStateValid, setIsStateValid] = useState<boolean>(true);
  const [isPostalCodeValid, setIsPostalCodeValid] = useState<boolean>(true);
  const [isTelephoneValid, setIsTelephoneValid] = useState<boolean>(true);
  const [open, setOpen] = React.useState(false);
  const [alertText, setAlertText] = React.useState('');
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

  const handleAddressLine1Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddressLine1(e.target.value);
  };

  const handleAddressLine2Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddressLine2(e.target.value);
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const city = e.target.value;
    setCity(city);
    setIsCityValid(isValidCityStateName(city));
  };

  const handleStateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const state = e.target.value;
    setState(state);
    setIsStateValid(isValidCityStateName(state));
  };

  const handlePostalCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const postalCode = e.target.value;
    setPostalCode(postalCode);
    setIsPostalCodeValid(isValidPostalCode(postalCode));
  };

  const handleTelephoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const telephone = e.target.value;
    setTelephone(telephone);
    setIsTelephoneValid(isValidPhoneNumber(telephone));
  };

  const isValidName = (name: string): boolean => {
    const NAME_PATTERN: RegExp = /^[A-Za-z]+(?:['-][A-Za-z]+)*$/;
    return NAME_PATTERN.test(name);
  }

  const isValidEmail = (email: string): boolean => {
    const EMAIL_PATTERN: RegExp = /^[a-zA-Z0-9](?:[a-zA-Z0-9-.]*[a-zA-Z0-9])?@(?:[a-zA-Z0-9]+\.)+[A-Za-z]+$/;
    return EMAIL_PATTERN.test(email);
  }
  

  const passValid = (pass: string): boolean => {
    const PASSWORD_PATTERN: RegExp = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#.-]{8,}$/;
    return PASSWORD_PATTERN.test(pass);
  };

  const isValidCityStateName = (cityName: string): boolean => {
    const CITY_NAME_PATTERN: RegExp = /^[A-Za-z]+(?:[ \-'][A-Za-z]+)*$/;
    return CITY_NAME_PATTERN.test(cityName);
  };

  const isValidPostalCode = (postalCode: string): boolean => {
    const POSTAL_CODE_PATTERN: RegExp = /^\d{3} \d{2}$/;
    return POSTAL_CODE_PATTERN.test(postalCode);
  };

  const isValidPhoneNumber = (phoneNumber: string): boolean => {
    const PHONE_NUMBER_PATTERN: RegExp = /^\d{10}$/;
    return PHONE_NUMBER_PATTERN.test(phoneNumber);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const payload = {
      firstname: data.get('firstName') as string,
      lastname: data.get('lastName') as string,
      email: data.get('email') as string,
      password: data.get('password') as string,
      addressLine1: data.get('addressLine1') as string,
      addressLine2: data.get('addressLine2') as string,
      city: data.get('city') as string,
      state: data.get('state') as string,
      zipCode: data.get('zipcode') as string,
      telephone: data.get('telephone') as string,
    };

    console.log(payload)

    if (!isValidName(payload.firstname) || 
        !isValidName(payload.lastname) ||
        !isValidEmail(payload.email) ||
        !passValid(payload.password) ||
        !isValidCityStateName(payload.city) ||
        !isValidCityStateName(payload.state) ||
        !isValidPostalCode(payload.zipCode) ||
        !isValidPhoneNumber(payload.telephone)) {
        
      setAlertText('Validation failed');
      setOpen(true);
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

      const responseData = await response.json();

      if (!response.ok) {
        setOpen(true);
        setAlertText(responseData.message);
      } else {
        navigate('/login');
      }

    } catch (error) {
      console.error('There was an error!', error);
    }
  };

  return (
    <ThemeProvider theme={defaultTheme}>
      <Container component="main" maxWidth="sm">
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
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  name="addressLine1"
                  label="Address Line 1"
                  type="addressLine1"
                  id="addressLine1"
                  autoComplete="addressLine1"
                  // error={!isPasswordValid}
                  onChange={handleAddressLine1Change}
                  // helperText={!isPasswordValid && 'Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number and one special character'}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="addressLine2"
                  label="Address Line 2"
                  type="addressLine2"
                  id="addressLine2"
                  autoComplete="addressLine2"
                  // error={!isPasswordValid}
                  onChange={handleAddressLine2Change}
                  // helperText={!isPasswordValid && 'Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number and one special character'}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  name="city"
                  label="City"
                  type="city"
                  id="city"
                  autoComplete="city"
                  error={!isCityValid}
                  onChange={handleCityChange}
                  helperText={!isCityValid && 'Please enter a valid city name'}
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <TextField
                  required
                  fullWidth
                  name="state"
                  label="State"
                  type="state"
                  id="state"
                  autoComplete="state"
                  error={!isStateValid}
                  onChange={handleStateChange}
                  helperText={!isStateValid && 'Please enter a valid state name'}
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <TextField
                  required
                  fullWidth
                  name="zipcode"
                  label="Zip Code"
                  type="zipcode"
                  id="zipcode"
                  autoComplete="zipcode"
                  error={!isPostalCodeValid}
                  onChange={handlePostalCodeChange}
                  helperText={!isPostalCodeValid && 'Postal code most be in format "123 45"'}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  name="telephone"
                  label="Telephone number"
                  type="telephone"
                  id="telephone"
                  autoComplete="telephone"
                  error={!isTelephoneValid}
                  onChange={handleTelephoneChange}
                  helperText={!isTelephoneValid && 'Telephone number must be 10 digits long'}
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

      <AlertDialog open={open} setOpen={setOpen} alertText={alertText} />
    </ThemeProvider>
  );
}

export default SignUp;