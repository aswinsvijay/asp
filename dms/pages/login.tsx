import React, { useEffect } from 'react';
import { Box, Button, Stack, TextField, Typography } from '@mui/material';
import { AuthUtils, Colors, UNSAFE_CAST } from '@/src/utils';
import { useRouter } from 'next/router';
import { AxiosError } from 'axios';

const Login: React.FC = () => {
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [message, setMessage] = React.useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    setMessage(null);
  }, [username, password]);

  const handleSubmit = async () => {
    // TODO: ESLint to enforce spacing
    try {
      await AuthUtils.login(username, password);
      setMessage({ type: 'success', text: 'Login success, redirecting...' });
      await router.push('/dashboard');
    } catch (error) {
      let errorMessage = '';

      if (error instanceof AxiosError) {
        errorMessage = UNSAFE_CAST<{ message: string } | undefined>(error.response?.data)?.message ?? '';
      }

      console.error(error);
      setMessage({ type: 'error', text: errorMessage || 'Failed to login' });
    }
  };

  return (
    <>
      <Typography variant="h6" component="div" sx={{ textAlign: 'center' }}>
        Sign in
      </Typography>
      <Box
        component="form"
        onSubmit={(e) => {
          e.preventDefault();
          void handleSubmit();
        }}
      >
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
          <Button type="submit" color={message?.type ?? 'primary'} variant="contained" fullWidth>
            {message?.text ?? 'Login'}
          </Button>
        </Stack>
      </Box>
    </>
  );
};

const Register: React.FC = () => {
  const [name, setName] = React.useState('');
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    setError(null);
  }, [name, username, password, confirmPassword]);

  const handleSubmit = async () => {
    if (password !== confirmPassword) {
      setError('Password and Confirm password do not match');
      return;
    }

    try {
      await AuthUtils.register(name, username, password);
      router.reload();
    } catch (error) {
      let errorMessage = '';

      if (error instanceof AxiosError) {
        errorMessage = UNSAFE_CAST<{ message: string } | undefined>(error.response?.data)?.message ?? '';
      }

      console.error(error);
      setError(errorMessage || 'Failed to login');
    }
  };

  return (
    <>
      <Typography variant="h6" component="div" sx={{ textAlign: 'center' }}>
        Sign up
      </Typography>
      <Box
        component="form"
        onSubmit={(e) => {
          e.preventDefault();
          void handleSubmit();
        }}
      >
        <Stack spacing={2}>
          <TextField
            label="Name"
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
            }}
            fullWidth
            required
            autoFocus
          />
          <TextField
            label="Username"
            type="text"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
            }}
            fullWidth
            required
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
          <TextField
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
            }}
            fullWidth
            required
          />
          <Button type="submit" color={error ? 'error' : 'primary'} variant="contained" fullWidth>
            {error ?? 'Register'}
          </Button>
        </Stack>
      </Box>
    </>
  );
};

const views = [
  {
    id: 'login',
    label: 'Login',
    Component: Login,
  },
  {
    id: 'register',
    label: 'Register',
    Component: Register,
  },
] as const;

const Landing: React.FC = () => {
  const [currentView, setCurrentView] = React.useState<(typeof views)[number]['id']>('login');

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Box
        bgcolor={Colors.BACKGROUND}
        display={'flex'}
        flexDirection={'column'}
        sx={{ width: '100%', maxWidth: 480, border: 1, borderColor: 'divider', borderRadius: 2, p: 4, gap: 2 }}
      >
        <Box sx={{ display: 'flex', gap: 1 }}>
          {views.map(({ id, label }) => {
            return (
              <Button
                key={id}
                variant={currentView === id ? 'contained' : 'outlined'}
                onClick={() => {
                  setCurrentView(id);
                }}
                sx={{ flex: 1 }}
              >
                {label}
              </Button>
            );
          })}
        </Box>
        {views.map(({ id, Component }) => {
          return currentView === id && <Component key={id} />;
        })}
      </Box>
    </Box>
  );
};

export default Landing;
