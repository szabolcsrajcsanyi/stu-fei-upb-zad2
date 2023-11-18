import React, { useState } from 'react';
import { check_private_RSA_validity, check_public_RSA_validity, decipher, generateRSAKeyPair } from '../utils/cipher';
import { Link, useNavigate } from 'react-router-dom';
import { Box, Button, Container, Typography, TextField, Paper, Alert } from '@mui/material';
import { Lock, Person, ExitToApp } from '@mui/icons-material';
import AlertDialog from './AlertDialog';
import jsPDF from 'jspdf';

interface Transaction {
  id: number;
  amount: number;
  sender_name: string;
  recipient_name: string;
  timestamp: string;
}


const InternetBanking: React.FC = () => {
  const navigate = useNavigate();
  const [generatedKeys, setGeneratedKeys] = useState<{ publicKey: string, privateKey: string } | null>(null);
  const [showRsaKeyInput, setShowRsaKeyInput] = useState<boolean>(false);
  const [privateRsaKey, setPrivateRsaKey] = useState<string>('');
  const [showPrivateRsaKeyInput, setShowPrivateRsaKeyInput] = useState<boolean>(false);
  const [rsaKey, setRsaKey] = useState<string>('');
  const [open, setOpen] = useState(false);
  const [alertText, setAlertText] = useState('');
  const [successAlert, setSuccessAlert] = useState(false);
  const [successAlertText, setSuccessAlertText] = useState('');
  

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };
  
  const clearRSAkeyPair = () => {
    setGeneratedKeys(null)
  }

  const generateRSAkeys = () => {
    const keys = generateRSAKeyPair();
    setGeneratedKeys(keys);
  }

  const handleSavePrivateRsaKey = () => {
    try {
      check_private_RSA_validity(privateRsaKey)
    } catch (error: any) {
      setAlertText("The provided private RSA key has invalid format");
      setOpen(true);
      console.error("An error occurred while saving Private RSA Key:", error);
      return;
    }

    localStorage.setItem('privateRsaKey', privateRsaKey);
    setSuccessAlert(true);
    setSuccessAlertText('Private RSA Key saved successfully!');
    setPrivateRsaKey('');
    setShowPrivateRsaKeyInput(false);
  };

  const togglePrivateRsaKeyInput = () => {
    setShowPrivateRsaKeyInput(!showPrivateRsaKeyInput);
  };

  const handleUploadRsaKey = async () => {
    const token = localStorage.getItem('token');

    try {
      check_public_RSA_validity(rsaKey)

      const response = await fetch('http://localhost:5000/api/auth/upload_key', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          rsa_pem: rsaKey
        })
      });

      const result = await response.json();
      if (!response.ok) {
        setAlertText(result.message)
        setOpen(true)
        return
      }
      console.log("Public RSA Key uploaded successfully:", result);
      setRsaKey('');
      setShowRsaKeyInput(false);

      setSuccessAlertText('Public RSA key uploaded successfully!')
      setSuccessAlert(true)
    } catch (error: any) {
      setAlertText("The provided public RSA key has invalid format");
      setOpen(true);
      console.error("An error occurred while uploading public RSA Key:", error);
    }
  };


  const fetchPdfData = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        setOpen(true);
        setAlertText('You are not logged in');
        return;
    }
    const privateRsaKey = localStorage.getItem('privateRsaKey');
    if (!privateRsaKey) {
        setOpen(true);
        setAlertText('No RSA private key provided');
        return;
    }

    try {
        const response = await fetch('http://localhost:5000/api/auth/get_transactions', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
        const data = await response.json();

        if (!response.ok) {
            setOpen(true);
            setAlertText(data.message);
            return;
        }

        console.log(data);

        const textBytes = Uint8Array.from(atob(data.text), c => c.charCodeAt(0));
        const secretKeyBytes = Uint8Array.from(atob(data.secret_key), c => c.charCodeAt(0));
        const ivBytes = Uint8Array.from(atob(data.iv), c => c.charCodeAt(0));

        const decryptedBytes = decipher(textBytes, secretKeyBytes, ivBytes, privateRsaKey);

        if (!decryptedBytes.success) {
            setOpen(true);
            setAlertText(decryptedBytes.error || 'An error occurred while decrypting the data');
            return;
        }
        
        const decryptedText = new TextDecoder().decode(decryptedBytes.data);
        const transactions = JSON.parse(decryptedText);

        const doc = new jsPDF();
        let y = 10;

        transactions.forEach((transaction: Transaction) => {
          doc.text(`ID: ${transaction.id}`, 10, y); y += 6;
          doc.text(`Amount: ${transaction.amount}`, 10, y); y += 6;
          doc.text(`Sender: ${transaction.sender_name}`, 10, y); y += 6;
          doc.text(`Recipient: ${transaction.recipient_name}`, 10, y); y += 6;
          doc.text(`Date: ${transaction.timestamp}`, 10, y); y += 10; // Add extra space before next transaction

          if (y > 280) { // Check to add a new page
            doc.addPage();
            y = 10;
          }
        });

        doc.save("transactions.pdf");


    } catch (error) {
      console.error('Error generating PDF:', error);
      setOpen(true);
      setAlertText('Failed to generate PDF');
    }
    
};

  return (
    <Container
      sx={{
        display: 'flex',
        flexDirection: 'column',
        py: 5,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f4f4f4',
      }}
    >
      <Paper
        elevation={3}
        sx={{
          width: '80%',
          padding: '2em',
          borderRadius: '8px',
          textAlign: 'center',
        }}
      >
        {successAlert && <Alert severity="success">{successAlertText}</Alert>}
        <Typography variant="h4" gutterBottom>
          <Lock fontSize="large" /> Internetbanking
        </Typography>
        <Typography variant="body1" gutterBottom>
          <Person fontSize="inherit" /> Welcome to the most secure and user-friendly internet banking experience.
        </Typography>

        <Box sx={{ mt: 2 }}>
          <Link to="/makepayment" style={{ textDecoration: 'none' }}>
            <Button 
              variant="contained" 
              color="primary" 
              sx={{ margin: '1em', width: '500px' }}
            >
              Make Payment
            </Button>
          </Link>
          <Link to="/accountbalance" style={{ textDecoration: 'none' }}>
            <Button 
              variant="outlined" 
              color="error" 
              sx={{ margin: '1em', width: '500px' }}
            >
              Account balance
            </Button>
          </Link>
          <Link to="/editprofile" style={{ textDecoration: 'none' }}>
            <Button 
              variant="outlined" 
              color="primary" 
              sx={{ margin: '1em', width: '500px' }}
            >
              Update profile
            </Button>
          </Link>
          <Button 
              variant="outlined" 
              color="secondary"
              onClick={fetchPdfData}
              sx={{ margin: '1em', width: '500px' }}
            >
              Account statement
            </Button>
          <Link to="/addfunds" style={{ textDecoration: 'none' }}>
            <Button 
              variant="outlined" 
              color="warning" 
              sx={{ margin: '1em', width: '500px' }}
            >
              Add amount
            </Button>
          </Link>
          <Button 
            variant="contained" 
            color="success" 
            onClick={() => setShowRsaKeyInput(!showRsaKeyInput)} 
            sx={{ margin: '1em', width: '500px' }}>
            Upload Public RSA
          </Button>
          {showRsaKeyInput && (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '1em' }}>
              <TextField
                label="Public RSA Key"
                variant="outlined"
                fullWidth
                multiline
                rows={8}
                value={rsaKey}
                onChange={(e) => setRsaKey(e.target.value)}
                sx={{ marginBottom: '1em' }}
              />
              <Button 
                variant="contained" 
                color="success" 
                onClick={handleUploadRsaKey} 
                sx={{ marginLeft: '1em' }}
                fullWidth
                >
                Upload
              </Button>
            </Box>
          )}
          <Button 
            variant="contained" 
            color="secondary" 
            onClick={togglePrivateRsaKeyInput} 
            sx={{ margin: '1em', width: '500px' }}>
            Save Private RSA Key
          </Button>

          {showPrivateRsaKeyInput && (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '1em' }}>
              <TextField
                label="Private RSA Key"
                variant="outlined"
                fullWidth
                multiline
                rows={8}
                value={privateRsaKey}
                onChange={(e) => setPrivateRsaKey(e.target.value)}
                sx={{ marginBottom: '1em' }}
              />
              <Button 
                variant="contained" 
                color="primary" 
                onClick={handleSavePrivateRsaKey} 
                fullWidth>
                Save
              </Button>
            </Box>
          )}

        <Button 
            variant="outlined" 
            color="success" 
            onClick={generateRSAkeys} 
            sx={{ margin: '1em', width: '500px' }}
            >
            Generate RSA key pairs
        </Button>

        {generatedKeys && (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '1em' }}>
            <TextField
              label="Generated Public RSA Key"
              variant="outlined"
              fullWidth
              multiline
              rows={8}
              value={generatedKeys.publicKey}
              InputProps={{
                readOnly: true,
              }}
              sx={{ marginBottom: '1em' }}
            />
            <TextField
              label="Generated Private RSA Key"
              variant="outlined"
              fullWidth
              multiline
              rows={8}
              value={generatedKeys.privateKey}
              InputProps={{
                readOnly: true,
              }}
              sx={{ marginBottom: '1em' }}
            />

              <Button
                variant="contained"
                color="warning"
                onClick={clearRSAkeyPair}
                sx={{ margin: '1em', width: '200px' }}>
                Clear keys
              </Button>
          </Box>
        )}

        </Box>
        <Box display="flex" justifyContent="center" sx={{ mt: 3 }}>
            <Button
                variant="contained"
                color="error"
                startIcon={<ExitToApp />}
                onClick={(handleLogout)}
                sx={{ margin: '1em'}}
            >
                Log Out
            </Button>
        </Box>
      </Paper>
      <AlertDialog open={open} setOpen={setOpen} alertText={alertText} />
    </Container>
  );
};

export default InternetBanking;