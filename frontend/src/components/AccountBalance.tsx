import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Copyright from './Copyright';
import { Alert, Box, Button, Grid, Paper, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import { useEffect, useState } from 'react';
import AlertDialog from './AlertDialog';
import { decipher } from '../utils/cipher';
import ArrowBack from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';

const AccountBalance = () => {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [balance, setBalance] = useState('');
    const [open, setOpen] = useState(false);
    const [alertText, setAlertText] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const token = localStorage.getItem('token');
                const privateRsaKey = localStorage.getItem('privateRsaKey');
                if (!token) {
                    setOpen(true);
                    setAlertText('You are not logged in');
                    return;
                }
                
                if (!privateRsaKey) {
                    setOpen(true);
                    setAlertText('No RSA private key provided');
                    return;
                }
                const response = await fetch('http://localhost:5000/api/auth/user/transactions', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                const responseData = await response.json();

                if (!response.ok) {
                    setOpen(true);
                    setAlertText(responseData.message);
                }
                const textBytes = Uint8Array.from(atob(responseData.text), c => c.charCodeAt(0));
                const secretKeyBytes = Uint8Array.from(atob(responseData.secret_key), c => c.charCodeAt(0));
                const ivBytes = Uint8Array.from(atob(responseData.iv), c => c.charCodeAt(0));

                const decryptedBytes = decipher(textBytes, secretKeyBytes, ivBytes, privateRsaKey);

                if (!decryptedBytes.success) {
                    setOpen(true);
                    setAlertText(decryptedBytes.error || 'An error occurred while decrypting the data');
                    return;
                }
                
                const decryptedText = new TextDecoder().decode(decryptedBytes.data);
                const data = JSON.parse(decryptedText);

                setTransactions(data.transactions);
                setBalance(data.account_balance);

                console.log(data)

            } catch (error) {
                console.error('Error fetching transactions:', error);
                setAlertText("Error fetching transactions");
                setOpen(true);
            }
        };

        fetchTransactions();
    }, []);

    const handleBackButton = () => {
        navigate(-1);
    }

  return (
       <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Paper
                  sx={{
                    p: 5,
                    display: 'flex',
                    flexDirection: 'column',
                    height: 100,
                  }}
                >
                    <Grid container spacing={3} alignItems={'center'}>
                            <Grid item xs={10}>
                                <Box sx={{mx: 8}}>
                                    <Typography component="h2" variant="h6" color="primary" gutterBottom>
                                        Account Balance
                                    </Typography>
                                    <Typography component="p" variant="h4" color="primary">
                                        ${balance}
                                    </Typography>
                                    </Box>

                                </Grid>
                                <Grid item xs={2}>
                                    <Button variant="contained"
                                            color='secondary' 
                                            startIcon={<ArrowBack />}
                                            onClick={handleBackButton}>
                                        Back
                                    </Button>
                                </Grid>
                    </Grid>
                </Paper>
              </Grid>
              <Grid item xs={12}>
                <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                    {transactions && transactions.length > 0 && (
                            <Table sx={{ mt: 3 }}>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Date</TableCell>
                                        <TableCell>Type</TableCell>
                                        <TableCell>Amount</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {transactions.map((transaction: {date: string, type: string, amount: number}, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{transaction.date}</TableCell>
                                            <TableCell>{transaction.type}</TableCell>
                                            <TableCell>${transaction.amount.toFixed(2)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                </Paper>
              </Grid>
            </Grid>
            <Copyright sx={{ pt: 4 }} />
            <AlertDialog open={open} setOpen={setOpen} alertText={alertText} />
          </Container>
  );
}

export default AccountBalance;

