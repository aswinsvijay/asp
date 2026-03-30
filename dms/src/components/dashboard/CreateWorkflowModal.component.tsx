import { apiCall, ApiParameters } from '@/src/utils';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';
import { useState } from 'react';

interface CreateWorkflowModalProps {
  onClose: () => void;
}

export const CreateWorkflowModal = ({ onClose }: CreateWorkflowModalProps) => {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [inputs, setInputs] = useState<ApiParameters<'CreateWorkflow'>['requestBody']['inputs']>([]);

  const handleClose = () => {
    setName('');
    setUrl('');
    setInputs([]);
    onClose();
  };

  const createWorkflow = async () => {
    await apiCall('CreateWorkflow', {
      pathParams: {},
      queryParams: {},
      requestBody: {
        name,
        callback_url: url,
        inputs,
      },
    });

    handleClose();
  };

  return (
    <Dialog open onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Create Workflow</DialogTitle>
      <DialogContent
        sx={{
          height: '70vh',
        }}
      >
        <Box display={'flex'} flexDirection={'column'} gap={2} p={1}>
          <TextField
            autoFocus
            fullWidth
            label="Workflow name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
            }}
          />
          <TextField
            autoFocus
            fullWidth
            label="URL"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
            }}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" onClick={handleClose}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={() => {
            void createWorkflow();
          }}
          disabled={!name.trim()}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};
