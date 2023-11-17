import React, { useState } from 'react';
import { check_private_RSA_validity, check_public_RSA_validity, decipher, generateRSAKeyPair } from '../utils/cipher';
import { Link, useNavigate } from 'react-router-dom';
import { Box, Button, Container, Typography, Table, TableBody, TableCell, TableHead, TableRow, TextField, Paper, Alert } from '@mui/material';
import { Lock, Person, ExitToApp } from '@mui/icons-material';
import AlertDialog from './AlertDialog';

const InternetBanking: React.FC = () => {
  const navigate = useNavigate();
  const [generatedKeys, setGeneratedKeys] = useState<{ publicKey: string, privateKey: string } | null>(null);
  const [data, setData] = useState<any[]>([]);
  const [privateKey, setPrivateKey] = useState<string>('');
  const [showPrivateKeyInput, setShowPrivateKeyInput] = useState<boolean>(false);
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

  const handleClearTable = () => {
    setData([]);
    setSuccessAlert(true);
    setSuccessAlertText("Customers' list has been cleared!")
  }

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

  const fetchWithoutEncryption = async () => {
    const response = await fetch('http://localhost:5000/api/customers');
    const result = await response.json();
    console.log(result)
    setData(result);
    setShowPrivateKeyInput(false);
    setSuccessAlertText('Customers fetched without encryption successfully!')
    setSuccessAlert(true)
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
    try {
      const response = await fetch('http://localhost:5000/api/auth/customers', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const result = await response.json();

      if (!response.ok) {
        setAlertText(result.message)
        setOpen(true)
        return;
      }
      console.log(result)

      const textBytes = Uint8Array.from(atob(result.text), c => c.charCodeAt(0));
      const secretKeyBytes = Uint8Array.from(atob(result.secret_key), c => c.charCodeAt(0));
      const ivBytes = Uint8Array.from(atob(result.iv), c => c.charCodeAt(0));

      const decryptedBytes = decipher(textBytes, secretKeyBytes, ivBytes, privateKey);

      if (!decryptedBytes.success) {
        setOpen(true);
        setAlertText(decryptedBytes.error || 'An error occurred while decrypting the data');
        return;
    }

      const decryptedText = new TextDecoder().decode(decryptedBytes.data);
      setData(JSON.parse(decryptedText));

      setPrivateKey('');
      setShowPrivateKeyInput(false);

      setSuccessAlertText('Customers fetched with encryption successfully!')
      setSuccessAlert(true)

    } catch (error: any) {
        setAlertText('You provided the wrong private RSA key');
        setOpen(true);
        console.error("An error occurred during fetchWithEncryption:", error);

    }
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
          {/* <Button 
            variant="contained" 
            color="secondary" 
            onClick={fetchWithoutEncryption} 
            sx={{ margin: '1em', width: '500px' }}
            >
            Get Customers (Without Encryption)
          </Button>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={toggleEncryptionInput} 
            sx={{ margin: '1em', width: '500px' }}
            >
            Get Customers (With Encryption)
          </Button>

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
        )} */}

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
      <AlertDialog open={open} setOpen={setOpen} alertText={alertText} />
    </Container>
  );
};

export default InternetBanking;