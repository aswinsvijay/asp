import React from 'react';
import { Box, Button, Stack, TextField, Typography } from '@mui/material';

const Login: React.FC = () => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Box sx={{ width: '100%', maxWidth: 480, border: 1, borderColor: 'divider', borderRadius: 2, p: 4 }}>
        <Typography variant="h6" component="div" sx={{ mb: 2, textAlign: 'center' }}>
          Sign in
        </Typography>
        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <TextField
              label="Username"
              type="text"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
              }}
              fullWidth
              required
              autoFocus
            />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
              }}
              fullWidth
              required
            />
            <Button type="submit" variant="contained" fullWidth>
              Login
            </Button>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
};

export default Login;
