import { apiCall, ApiParameters } from '@/src/utils';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  TextField,
  Select,
  Typography,
} from '@mui/material';
import { useState } from 'react';

interface CreateWorkflowModalProps {
  onClose: () => void;
}
type InputConfig = ApiParameters<'CreateWorkflow'>['requestBody']['inputs'][number] & {
  id: string;
};

const inputTypes = ['string', 'number', 'date'] as const;

export const CreateWorkflowModal = ({ onClose }: CreateWorkflowModalProps) => {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');

  const [inputs, setInputs] = useState<InputConfig[]>([]);

  const updateInput = (id: string, update: Partial<InputConfig>) => {
    setInputs(inputs.map((inp) => (inp.id === id ? { ...inp, ...update } : inp)));
  };

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
        <Box display={'flex'} maxHeight={'100%'} flexDirection={'column'} gap={2} p={1} overflow={'hidden'}>
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
          <Box
            gap={1}
            sx={{
              border: '1px solid #e0e0e0',
              borderRadius: 1,
              padding: 1,
              backgroundColor: '#fafbfc',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              Inputs
            </Typography>
            <Box display={'flex'} flexDirection={'column'} px={1} gap={1} sx={{ flex: 1, overflow: 'auto' }}>
              {inputs.length === 0 && <Typography color="textSecondary">No inputs</Typography>}
              {inputs.map((input) => (
                <Box key={input.id}>
                  <Box display="flex" gap={2}>
                    <TextField
                      label="Name"
                      value={input.name}
                      size="small"
                      onChange={(e) => {
                        updateInput(input.id, { name: e.target.value });
                      }}
                      fullWidth
                    />
                    <Select
                      size="small"
                      sx={{ minWidth: 120 }}
                      labelId={`input-type-label-${input.id}`}
                      id={`input-type-select-${input.id}`}
                      value={input.type}
                      onChange={(e) => {
                        updateInput(input.id, { type: e.target.value });
                      }}
                    >
                      {inputTypes.map((type) => (
                        <MenuItem key={type} value={type}>
                          {type.toUpperCase()}
                        </MenuItem>
                      ))}
                    </Select>
                  </Box>
                </Box>
              ))}
            </Box>
            <Box p={1} sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                size="small"
                onClick={() => {
                  setInputs([
                    ...inputs,
                    {
                      id: Date.now().toString(),
                      name: '',
                      type: 'string',
                    },
                  ]);
                }}
              >
                Add
              </Button>
              <Button
                variant="outlined"
                size="small"
                color="info"
                onClick={() => {
                  // Implement a preview handler here or trigger a modal
                  // For now, just log preview
                  console.log('Preview workflow input:', inputs);
                }}
              >
                Preview
              </Button>
            </Box>
          </Box>
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
          disabled={!name.trim() || !url.trim()}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};
