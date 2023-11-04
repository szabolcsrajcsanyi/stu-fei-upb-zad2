import React, { useState } from 'react';
import { decipher } from '../utils/cipher';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Container, Typography, Table, TableBody, TableCell, TableHead, TableRow, TextField, Paper } from '@mui/material';
import { Lock, Person, ExitToApp } from '@mui/icons-material';



const InternetBanking: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<any[]>([]);
  const [privateKey, setPrivateKey] = useState<string>('');
  const [showPrivateKeyInput, setShowPrivateKeyInput] = useState<boolean>(false);
  const [showRsaKeyInput, setShowRsaKeyInput] = useState<boolean>(false);
  const [rsaKey, setRsaKey] = useState<string>('');

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  function handleClearTable() {
    setData([]);

}

  const handleUploadRsaKey = async () => {
    const token = localStorage.getItem('token');

    try {
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
      if (response.ok) {
        console.log("RSA Key uploaded successfully:", result);
        setRsaKey('');
        setShowRsaKeyInput(false);
      } else {
        console.log(result)
      }
    } catch (error) {
      console.error("An error occurred while uploading RSA Key:", error);
    }
  };

  const fetchWithoutEncryption = async () => {
    const response = await fetch('http://localhost:5000/api/customers');
    const result = await response.json();
    setData(result);
    setShowPrivateKeyInput(false);
  };

  const toggleEncryptionInput = () => {
    setShowPrivateKeyInput(!showPrivateKeyInput);
  };

  const fetchWithEncryption = async () => {
    if (!privateKey) {
      alert('Please enter the private RSA key');
      return;
    }

    const token = localStorage.getItem('token');
    const response = await fetch('http://localhost:5000/api/auth/customers', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const result = await response.json();
    console.log(result)

    const textBytes = Uint8Array.from(atob(result.text), c => c.charCodeAt(0));
    const secretKeyBytes = Uint8Array.from(atob(result.secret_key), c => c.charCodeAt(0));
    const ivBytes = Uint8Array.from(atob(result.iv), c => c.charCodeAt(0));

    const decryptedBytes = decipher(textBytes, secretKeyBytes, ivBytes, privateKey);

    const decryptedText = new TextDecoder().decode(decryptedBytes);
    setData(JSON.parse(decryptedText));

    setPrivateKey('');
    setShowPrivateKeyInput(false);
  };

  return (
    <Container
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
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
        <Typography variant="h4" gutterBottom>
          <Lock fontSize="large" /> Internetbanking
        </Typography>
        <Typography variant="body1" gutterBottom>
          <Person fontSize="inherit" /> Welcome to the most secure and user-friendly internet banking experience.
        </Typography>

        <Box sx={{ mt: 2 }}>
          <Button 
            variant="contained" 
            color="success" 
            onClick={() => setShowRsaKeyInput(!showRsaKeyInput)} 
            sx={{ margin: '1em', width: '400px' }}>
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
            onClick={fetchWithoutEncryption} 
            sx={{ margin: '1em', width: '400px' }}
            >
            Get Customers (Without Encryption)
          </Button>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={toggleEncryptionInput} 
            sx={{ margin: '1em', width: '400px' }}
            >
            Get Customers (With Encryption)
          </Button>
        </Box>

        {showPrivateKeyInput && (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '1em' }}>
            <TextField
              label="Private RSA Key"
              variant="outlined"
              fullWidth
              multiline
              rows={8}
              value={privateKey}
              onChange={(e) => setPrivateKey(e.target.value)}
              sx={{ marginBottom: '1em' }}
            />
            <Button variant="contained" color="primary" onClick={fetchWithEncryption} fullWidth>
              Go
            </Button>
          </Box>
        )}

        {data.length > 0 && (
          <Table sx={{ mt: 3 }}>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>First Name</TableCell>
                <TableCell>Last Name</TableCell>
                <TableCell>IBAN</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((item) => (
                <TableRow key={item.ID}>
                  <TableCell>{item.ID}</TableCell>
                  <TableCell>{item.Name}</TableCell>
                  <TableCell>{item.Surname}</TableCell>
                  <TableCell>{item.IBAN}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        <Box display="flex" justifyContent="center" sx={{ mt: 3 }}>
            <Button
                variant="contained"
                color="warning"
                onClick={handleClearTable}
                sx={{ margin: '1em', width: '200px' }}
            >
                Clear Table
            </Button>

            <Box sx={{ mx: 7 }}></Box>

            <Button
                variant="contained"
                color="error"
                startIcon={<ExitToApp />}
                onClick={(handleLogout)}
                sx={{ margin: '1em', width: '200px' }}
            >
                Log Out
            </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default InternetBanking;