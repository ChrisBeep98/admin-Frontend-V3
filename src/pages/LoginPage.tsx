import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { verifyToken } from '../services/api';
import { Container, TextField, Button, Box, Typography, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();



  const handleLogin = async () => {
    setLoading(true);
    setError('');
    
    const isValid = await verifyToken(token);
    setLoading(false);

    if (isValid) {
      login(token);
      navigate('/'); // Redirect to dashboard after successful login
    } else {
      setError('Token inválido o error en la verificación.');
    }
  };

  return (
    <Container maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h5">
          Acceso de Administrador
        </Typography>
        <Box sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="token"
            label="Token de Acceso"
            name="token"
            autoFocus
            value={token}
            onChange={(e) => setToken(e.target.value)}
            error={!!error}
            helperText={error}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Ingresar'}
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default LoginPage;
