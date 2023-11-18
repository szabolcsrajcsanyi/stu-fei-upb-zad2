import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Box from '@mui/material/Box';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Copyright from './Copyright';
import AlertDialog from './AlertDialog';
import { Alert } from '@mui/material';

const defaultTheme = createTheme();

const AddFunds = () => {
  const [open, setOpen] = React.useState(false);
  const [alertText, setAlertText] = React.useState('');
  const [successAlert, setSuccessAlert] = React.useState(false);
  const [successAlertText, setSuccessAlertText] = React.useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const amountString = data.get('amount') as string;
    const amount = Number(amountString)

    if (isNaN(amount)) {
        setOpen(true);
        setAlertText("Invalid amount entered");
        return;
    }
    const payload = {
      amount: amount,
    };


    try {
      const token = localStorage.getItem('token');
      if (!token) {
          setOpen(true);
          setAlertText('You are not logged in');
          return;
      }
      const response = await fetch('http://localhost:5000/api/auth/add_balance', {
        method: 'POST',
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
            setSuccessAlertText('Funds has been added to your account');
        }

    } catch (error) {
        console.error('There was an error!', error);
        setOpen(true);
        setAlertText('Failed to add funds:' + (error as Error).message);
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
          <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
            <AttachMoneyIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Add funds to your wallet
          </Typography>
          {successAlert && <Alert severity="success">{successAlertText}</Alert>}
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="amount"
              label="Amount"
              name="amount"
              autoComplete="amount"
              autoFocus
            />
            <Button
              type="submit"
              color="success"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Add funds
            </Button>
            <Link href="/internetbanking" variant="body2">
              <Button
                color="warning"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
              >
                Back
              </Button>
            </Link>
            
          </Box>
        </Box>
        <Copyright sx={{ mt: 8, mb: 4 }} />
      </Container>

      <AlertDialog open={open} setOpen={setOpen} alertText={alertText} />
    </ThemeProvider>
  );
}

export default AddFunds;

