import React, { useState, useEffect } from 'react';
import { Box, Button, Container, Paper, TextField, Table, TableBody, TableCell, TableHead, TableRow, Typography, Alert } from '@mui/material';
import { decipher } from '../utils/cipher';
import AlertDialog from './AlertDialog';
import { Link } from 'react-router-dom';

const MakePayment: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [iban, setIban] = useState<string>('');
  const [amount, setAmount] = useState<number | string>('');
  const [open, setOpen] = useState(false);
  const [alertText, setAlertText] = useState('');
  const [successAlert, setSuccessAlert] = useState(false);
  const [successAlertText, setSuccessAlertText] = useState('');

  useEffect(() => {
    const fetchData = async () => {
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
        
        const response = await fetch('http://localhost:5000/api/auth/users_iban', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
        const data = await response.json();
        const textBytes = Uint8Array.from(atob(data.text), c => c.charCodeAt(0));
        const secretKeyBytes = Uint8Array.from(atob(data.secret_key), c => c.charCodeAt(0));
        const ivBytes = Uint8Array.from(atob(data.iv), c => c.charCodeAt(0));

        const decryptedBytes = decipher(textBytes, secretKeyBytes, ivBytes, rsaKey);

        if (!decryptedBytes.success) {
            setOpen(true);
            setAlertText(decryptedBytes.error || 'An error occurred while decrypting the data');
            return;
        }

        const decryptedText = new TextDecoder().decode(decryptedBytes.data);
        console.log(JSON.parse(decryptedText));
        setUsers(JSON.parse(decryptedText));
    };
    fetchData();
  }, []);

  const handlePayment = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        setOpen(true);
        setAlertText('You are not logged in');
      return;
    }
  
    if (!iban || Number(amount) <= 0) {
        setOpen(true);
        setAlertText('Please enter a valid IBAN and amount');
        return;
    }
  
    try {
      const response = await fetch('http://localhost:5000/api/auth/make_payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          iban: iban,
          amount: Number(amount),
        }),
      });
  
      const result = await response.json();
      if (!response.ok) {
        setOpen(true);
        setAlertText(result.message || 'Error occurred while making the payment');
        return
      }
  
      setSuccessAlert(true);
      setSuccessAlertText('Payment successful');
      setIban('');
      setAmount('');
  
    } catch (error) {
        console.error('Payment failed:', error);
        setOpen(true);
        setAlertText('Payment failed: ' + (error as Error).message);
    }
  };

  return (
    <Container>
      <Paper elevation={3} sx={{ padding: '2em', margin: '2em 0' }}>
        {successAlert && <Alert severity="success">{successAlertText}</Alert>}
        <Typography variant="h4" gutterBottom>
          Make Payment
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', margin: '1em 0' }}>
          <TextField
            label="IBAN"
            variant="outlined"
            value={iban}
            onChange={(e) => setIban(e.target.value)}
            sx={{ marginRight: '1em' }}
          />
          <TextField
            label="Amount"
            variant="outlined"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </Box>

        <Button variant="contained" color="primary" onClick={handlePayment}>
          Send Payment
        </Button>

        {users.length > 0 && (
          <Table sx={{ mt: 3 }}>
            <TableHead>
              <TableRow>
                <TableCell>First Name</TableCell>
                <TableCell>Last Name</TableCell>
                <TableCell>IBAN</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.firstname}</TableCell>
                  <TableCell>{user.lastname}</TableCell>
                  <TableCell>{user.iban}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        <Box display="flex" justifyContent="center" sx={{ mt: 3 }}>
            <Link to="/internetbanking" style={{ textDecoration: 'none' }}>
                <Button
                    variant="contained"
                    color="warning"
                    sx={{ margin: '1em', width: '200px' }}
                >
                    Back
                </Button>
            </Link>
        </Box>
      </Paper>
      <AlertDialog open={open} setOpen={setOpen} alertText={alertText} />
    </Container>
  );
};

export default MakePayment;
