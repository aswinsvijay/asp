import React from 'react';
import { Box, Button, Stack, TextField, Typography } from '@mui/material';
import { AuthUtils, Colors } from '@/src/utils';
import { useRouter } from 'next/router';

const Login: React.FC = () => {
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [, setError] = React.useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async () => {
    // TODO: ESLint to enforce spacing
    setError(null);
    try {
      await AuthUtils.login(username, password);
      await router.push('/dashboard');
    } catch (error) {
      console.error(error);
      setError('Failed to login');
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Box
        bgcolor={Colors.BACKGROUND}
        display={'flex'}
        flexDirection={'column'}
        sx={{ width: '100%', maxWidth: 480, border: 1, borderColor: 'divider', borderRadius: 2, p: 4, gap: 2 }}
      >
        <Typography variant="h6" component="div" sx={{ textAlign: 'center' }}>
          Sign in
        </Typography>
        <Box>
          <Stack spacing={2}>
            <TextField
              label="Username"
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
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
            <Button
              variant="contained"
              fullWidth
              onClick={() => {
                void handleSubmit();
              }}
            >
              Login
            </Button>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
};

export default Login;
