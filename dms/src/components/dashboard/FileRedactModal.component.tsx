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
import { apiCall, getDocumentBlob } from '@/src/utils';
import { ItemInfo } from '@/server/routerConfig/compiledRouterTypes.out';
import { Types } from 'mongoose';

interface FileRedactModalProps {
  selectedFile: ItemInfo;
  onClose: () => void;
}

export const FileRedactModal: React.FC<FileRedactModalProps> = ({ selectedFile, onClose }) => {
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');

  useEffect(() => {
    const fetchFileContent = async () => {
      setLoading(true);
      setError(null);
      setFileContent(null);

      try {
        const blob = await getDocumentBlob(selectedFile);

        if (!blob) {
          throw new Error('Invalid file response');
        }

        // Try to get file name from blob if available
        const content = await blob.text();
        setFileContent(content);

        const entitiesResponse = await apiCall('GetRedactionEntities', {
          pathParams: { fileId: new Types.ObjectId(selectedFile.id) },
          queryParams: {},
        });

        const entities = entitiesResponse.data;

        console.log({ content, entities });
      } catch (err) {
        console.error('Error fetching file content:', err);
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
    setFileName('');
    onClose();
  };

  return (
    <Dialog open onClose={handleClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">{selectedFile.name}</Typography>
          {fileName && (
            <Typography variant="body2" color="text.secondary">
              {fileName}
            </Typography>
          )}
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ minHeight: '400px', maxHeight: '70vh', overflow: 'auto' }}>
          {loading && (
            <Box display="flex" justifyContent="center" alignItems="center" sx={{ minHeight: '400px' }}>
              <CircularProgress />
            </Box>
          )}
          {error && (
            <Box display="flex" justifyContent="center" alignItems="center" sx={{ minHeight: '400px' }}>
              <Typography color="error">{error}</Typography>
            </Box>
          )}
          {!loading && !error && fileContent !== null && (
            <Box
              component="pre"
              sx={{
                margin: 0,
                padding: 2,
                backgroundColor: '#f5f5f5',
                borderRadius: 1,
                fontFamily: 'monospace',
                fontSize: '0.875rem',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                overflow: 'auto',
              }}
            >
              {fileContent}
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} variant="contained">
          Redact all
        </Button>
        <Button onClick={handleClose} variant="contained">
          Clear all
        </Button>
        <Button onClick={handleClose} variant="contained" color="success">
          Save as new
        </Button>
        <Button onClick={handleClose} variant="outlined" color="error">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};
