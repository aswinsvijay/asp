import { apiCall, assertUnreachable } from '@/src/utils';
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
import React, { useCallback, useState } from 'react';
import { WorkflowInputs } from './WorkflowInputs.component';
import axios from 'axios';
import { useSnackbar } from 'notistack';
import { WorkflowFormInput } from '@/server/routerConfig/compiledRouterTypes.out';

interface CreateWorkflowModalProps {
  onClose: () => void;
}

const inputTypes = ['Document', 'Folder', 'String', 'Number', 'Boolean'] as const satisfies string[];

interface InputConfig {
  name: string;
  type: (typeof inputTypes)[number];
  id: string;
}

const _DesignerInput: React.FC<{
  input: InputConfig;
  updateInput: (id: string, update: Partial<InputConfig>) => void;
}> = ({ input, updateInput }) => {
  return (
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
        {inputTypes.map((displayName) => (
          <MenuItem key={displayName} value={displayName}>
            {displayName}
          </MenuItem>
        ))}
      </Select>
    </Box>
  );
};

const DesignerInput = React.memo(_DesignerInput);

const transformInput = (input: InputConfig): WorkflowFormInput => {
  switch (input.type) {
    case 'String': {
      return {
        name: input.name,
        type: 'string',
      };
    }
    case 'Number': {
      return {
        name: input.name,
        type: 'number',
      };
    }
    case 'Boolean': {
      return {
        name: input.name,
        type: 'boolean',
      };
    }
    case 'Document': {
      return {
        name: input.name,
        type: 'string',
        enumFrom: 'documents',
      };
    }
    case 'Folder': {
      return {
        name: input.name,
        type: 'string',
        enumFrom: 'folders',
      };
    }
    default: {
      return assertUnreachable(input.type, 'Unhandled input field type');
    }
  }
};

export const CreateWorkflowModal = ({ onClose }: CreateWorkflowModalProps) => {
  const [view, setView] = useState<'edit' | 'test'>('edit');
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [inputs, setInputs] = useState<InputConfig[]>([]);

  const { enqueueSnackbar } = useSnackbar();

  const updateInput = useCallback((id: string, update: Partial<InputConfig>) => {
    setInputs((inputs) => inputs.map((inp) => (inp.id === id ? { ...inp, ...update } : inp)));
  }, []);

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
        inputs: inputs.map(transformInput),
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
        {view === 'edit' && (
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
              <Box display={'flex'} flexDirection={'column'} p={1} gap={1} sx={{ flex: 1, overflow: 'auto' }}>
                {inputs.length === 0 && <Typography color="textSecondary">No inputs</Typography>}
                {inputs.map((input) => (
                  <DesignerInput key={input.id} input={input} updateInput={updateInput} />
                ))}
              </Box>
              <Box px={1} sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    setInputs([
                      ...inputs,
                      {
                        id: Date.now().toString(),
                        name: '',
                        type: 'String',
                      },
                    ]);
                  }}
                >
                  Add
                </Button>
              </Box>
            </Box>
          </Box>
        )}
        {view === 'test' && (
          <div className="flex flex-col flex-1 px-4 py-2 gap-2 overflow-auto">
            <WorkflowInputs
              workflow={{ id: '', name, inputs: inputs.map(transformInput) }}
              onSubmit={(data) => {
                axios({
                  url,
                  method: 'post',
                  data,
                })
                  .then(() => {
                    enqueueSnackbar({ variant: 'success', message: 'Successfully started workflow' });
                  })
                  .catch(() => {
                    enqueueSnackbar({ variant: 'error', message: 'Failed to start workflow' });
                  });
              }}
            />
          </div>
        )}
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" onClick={handleClose}>
          Cancel
        </Button>
        {url && inputs.length > 0 && (
          <Button
            variant="outlined"
            onClick={() => {
              setView(view === 'edit' ? 'test' : 'edit');
            }}
          >
            {view === 'edit' ? 'Test' : 'Edit'}
          </Button>
        )}
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
