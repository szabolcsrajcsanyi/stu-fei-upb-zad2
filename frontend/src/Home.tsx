import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Container, Grid, Typography } from '@mui/material';

const Home: React.FC = () => {
  return (
    <Container
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f4f4f4', // Optional background color
      }}
    >
      <Typography variant="h4" gutterBottom>
        Internetbanking
      </Typography>

      <Grid container direction="column" spacing={2} sx={{ width: '100%', maxWidth: '300px' }}>
        <Grid item>
          <Link to="/login" style={{ textDecoration: 'none' }}>
            <Button variant="contained" color="primary" fullWidth>
              Login
            </Button>
          </Link>
        </Grid>
        <Grid item>
          <Link to="/register" style={{ textDecoration: 'none' }}>
            <Button variant="outlined" color="primary" fullWidth>
              Register
            </Button>
          </Link>
        </Grid>
      </Grid>
    </Container>
  );
}

export default Home;
