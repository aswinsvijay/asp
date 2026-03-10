import { apiCall } from '@/src/utils';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';
import { useState } from 'react';

interface CreateFolderModalProps {
  open: boolean;
  onClose: () => void;
}

export const CreateFolderModal = ({ open, onClose }: CreateFolderModalProps) => {
  const [name, setName] = useState('');

  const handleClose = () => {
    setName('');
    onClose();
  };

  const createFolder = async () => {
    await apiCall('CreateFolder', { pathParams: {}, queryParams: {}, requestBody: { name } });

    handleClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Create Folder</DialogTitle>
      <DialogContent>
        <Box pt={1}>
          <TextField
            autoFocus
            fullWidth
            label="Folder name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
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
            void createFolder();
          }}
          disabled={!name.trim()}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};
