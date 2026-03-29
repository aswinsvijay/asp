import React, { useState, useEffect, useRef } from 'react';
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
import { apiCall, downloadDocument, uploadFile, uploadTempFile } from '@/src/utils';
import { ItemInfo } from '@/server/routerConfig/compiledRouterTypes.out';
import { Types } from 'mongoose';

interface FileViewerModalProps {
  parent: Types.ObjectId;
  selectedFile: ItemInfo;
  onClose: () => void;
}

export const FileViewerModal: React.FC<FileViewerModalProps> = ({ parent, selectedFile, onClose }) => {
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(0);
  const editorRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    const fetchFileContent = async () => {
      setLoading(true);
      setError(null);
      setFileContent(null);

      try {
        let contentToSet: string;

        if (!isSummarizing) {
          const blob = await downloadDocument(selectedFile.id);

          if (!blob) {
            throw new Error('Invalid file response');
          }

          contentToSet = await blob.text();
        } else {
          if (!editorRef.current) {
            throw new Error('Editor element not found');
          }

          const content = editorRef.current.innerText;
          const file = new File([content], `SUMMARIZED - ${selectedFile.name}`, {
            type: 'text/plain',
          });

          const { id } = await uploadTempFile(file);

          const response = await apiCall('SummarizeTempFile', {
            pathParams: {
              fileId: new Types.ObjectId(id),
            },
            queryParams: {},
            requestBody: null,
          });

          contentToSet = response.data;
        }

        setFileContent(contentToSet);
      } catch (err) {
        console.error('Error fetching file content:', err);
        setError(err instanceof Error ? err.message : 'Failed to load file content');
      } finally {
        setLoading(false);
      }
    };

    void fetchFileContent();
  }, [isSummarizing, selectedFile]);

  const saveSummaryFile = async () => {
    if (!editorRef.current) {
      throw new Error('Editor element not found');
    }

    const content = editorRef.current.innerText;
    const file = new File([content], `SUMMARIZED - ${selectedFile.name}`, {
      type: 'text/plain',
    });

    await uploadFile(file, parent);

    handleClose();
  };

  const handleClose = () => {
    setFileContent(null);
    setError(null);
    onClose();
  };

  return (
    <Dialog open onClose={handleClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">{selectedFile.name}</Typography>
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
              {fileContent}
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        {isSummarizing !== 0 && (
          <Button
            onClick={() => {
              void saveSummaryFile();
            }}
            color="success"
            variant="contained"
          >
            Save as new
          </Button>
        )}
        <Button
          onClick={() => {
            setIsSummarizing((prev) => prev + 1);
          }}
          variant="contained"
        >
          {isSummarizing ? 'Summarize again' : 'Summarize'}
        </Button>
        <Button onClick={handleClose} variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};
