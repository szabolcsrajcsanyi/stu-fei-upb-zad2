import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Copyright from './Copyright';
import AlertDialog from './AlertDialog';
import { isValidCityStateName, isValidEmail, isValidName, isValidPhoneNumber, isValidPostalCode } from '../utils/validation';
import { Alert } from '@mui/material';

const defaultTheme = createTheme();

const EditProfile = () => {
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [addressLine1, setAddressLine1] = useState<string>('');
  const [addressLine2, setAddressLine2] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [state, setState] = useState<string>('');
  const [postalCode, setPostalCode] = useState<string>('');
  const [telephone, setTelephone] = useState<string>('');
  const [isFirstNameValid, setIsFirstNameValid] = useState<boolean>(true);
  const [isLastNameValid, setIsLastNameValid] = useState<boolean>(true);
  const [isEmailValid, setIsEmailValid] = useState<boolean>(true);
  const [isCityValid, setIsCityValid] = useState<boolean>(true);
  const [isStateValid, setIsStateValid] = useState<boolean>(true);
  const [isPostalCodeValid, setIsPostalCodeValid] = useState<boolean>(true);
  const [isTelephoneValid, setIsTelephoneValid] = useState<boolean>(true);
  const [open, setOpen] = React.useState(false);
  const [alertText, setAlertText] = React.useState('');
  const [successAlert, setSuccessAlert] = useState(false);
  const [successAlertText, setSuccessAlertText] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setOpen(true);
                setAlertText('You are not logged in');
                return;
            }
            const rsaKey = localStorage.getItem('privateRsaKey');
            if (!rsaKey) {
                setOpen(true);
                setAlertText('No RSA private key provided');
                return;
            }

            const response = await fetch('http://localhost:5000/api/auth/get_user_data', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            const data = await response.json();
            console.log(data)
            setFirstName(data.firstname);
            setLastName(data.lastname);
            setEmail(data.email);
            setAddressLine1(data.addressLine1);
            setAddressLine2(data.addressLine2);
            setCity(data.city);
            setState(data.state);
            setPostalCode(data.zipCode);
            setTelephone(data.telephone);
    };

    fetchUserData();
  }, []);

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
        !isValidCityStateName(payload.city) ||
        !isValidCityStateName(payload.state) ||
        !isValidPostalCode(payload.zipCode) ||
        !isValidPhoneNumber(payload.telephone)) {
        
      setAlertText('Validation failed');
      setOpen(true);
      return;
    }

    try {
        const token = localStorage.getItem('token');
        if (!token) {
            setOpen(true);
            setAlertText('You are not logged in');
        return;
        }
    
        const response = await fetch('http://localhost:5000/api/auth/update_user', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
        });

        const responseData = await response.json();

        if (!response.ok) {
            setOpen(true);
            setAlertText(responseData.message);
        } else {
            setSuccessAlert(true);
            setSuccessAlertText('Profile updated successfully');
        }

        } catch (error) {
            console.error('There was an error!', error);
            setOpen(true);
            setAlertText('Profile update failed:' + (error as Error).message);
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
          {successAlert && <Alert severity="success">{successAlertText}</Alert>}
          <Typography component="h1" variant="h5">
            Edit Personal Data
          </Typography>
          <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  autoComplete="given-name"
                  name="firstName"
                  required
                  fullWidth
                  value={firstName}
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
                  value={lastName}
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
                  value={email}
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
                  value={addressLine1}
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
                  value={addressLine2}
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
                  value={city}
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
                  value={state}
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
                  value={postalCode}
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
                  value={telephone}
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
              color="success" 
              sx={{ mt: 3, mb: 2 }}
            >
              Edit profile
            </Button>
            <Link to="/internetbanking" style={{ textDecoration: 'none' }}>
                <Button
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                >
                Back
                </Button>
            </Link>
          </Box>
        </Box>
        <Copyright sx={{ mt: 5 }} />
      </Container>

      <AlertDialog open={open} setOpen={setOpen} alertText={alertText} />
    </ThemeProvider>
  );
}

export default EditProfile;