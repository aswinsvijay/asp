import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  CircularProgress,
} from '@mui/material';
import { downloadDocument } from '@/src/utils';
import { ItemInfo } from '@/server/routerConfig/compiledRouterTypes.out';
import { Types } from 'mongoose';

interface AudioViewerModalProps {
  parent: Types.ObjectId;
  selectedFile: ItemInfo;
  onClose: () => void;
}

export const AudioViewerModal: React.FC<AudioViewerModalProps> = ({ selectedFile, onClose }) => {
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFileContent = async () => {
      setLoading(true);
      setError(null);
      setFileContent(null);

      try {
        const blob = await downloadDocument(selectedFile.id);

        if (!blob) {
          throw new Error('Invalid file response');
        }

        setFileContent(URL.createObjectURL(blob));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load file content');
      } finally {
        setLoading(false);
      }
    };

    void fetchFileContent();
  }, [selectedFile]);

  const handleClose = () => {
    setFileContent(null);
    setError(null);
    onClose();
  };

  return (
    <Dialog open onClose={handleClose} maxWidth="lg">
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">{selectedFile.name}</Typography>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Box
          display="flex"
          flexDirection={'column'}
          justifyContent="center"
          alignItems="center"
          sx={{ width: '400px' }}
        >
          {loading && (
            <Box display="flex" justifyContent="center" alignItems="center">
              <CircularProgress />
            </Box>
          )}
          {error && (
            <Box display="flex" justifyContent="center" alignItems="center">
              <Typography color="error">{error}</Typography>
            </Box>
          )}
          {!loading && !error && fileContent !== null && (
            <Box display="flex" justifyContent="center" alignItems="center">
              <audio controls src={fileContent}>
                Your browser does not support the audio element.
              </audio>
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};
