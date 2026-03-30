import { uploadFile, useApiCall, useMemoizedParameters } from '@/src/utils';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';
import { Types } from 'mongoose';
import { useRef } from 'react';

interface FolderSummarizeModalProps {
  onClose: () => void;
  folderId: Types.ObjectId;
}

export const FolderSummarizeModal = ({ onClose, folderId }: FolderSummarizeModalProps) => {
  const editorRef = useRef<HTMLPreElement>(null);

  const {
    data: response,
    loading,
    error,
  } = useApiCall(
    'SummarizeFolder',
    useMemoizedParameters(
      () => ({
        pathParams: { folderId },
        queryParams: {},
        requestBody: null,
      }),
      [folderId]
    )
  );

  const handleClose = () => {
    onClose();
  };

  const saveSummaryFile = async () => {
    if (!editorRef.current) {
      throw new Error('Editor element not found');
    }

    const content = editorRef.current.innerText;
    const file = new File([content], `Folder summary.txt`, {
      type: 'text/plain',
    });

    await uploadFile(file, folderId);

    handleClose();
  };

  return (
    <Dialog open onClose={handleClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Folder summary</Typography>
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
              <Typography color="error">{error.message}</Typography>
            </Box>
          )}
          {!loading && !error && (
            <Box
              component="pre"
              ref={editorRef}
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
              {response.data}
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => {
            void saveSummaryFile();
          }}
          color="success"
          variant="contained"
        >
          Save as new
        </Button>
        <Button onClick={handleClose} variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};
