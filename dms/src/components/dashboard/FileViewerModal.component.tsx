import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
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
import { apiCall, downloadDocument } from '@/src/utils';
import { ItemInfo } from '@/server/routerConfig/compiledRouterTypes.out';
import { Types } from 'mongoose';

interface FileViewerModalProps {
  selectedFile: ItemInfo;
  onClose: () => void;
}

const modalViews = [
  { id: 'content', buttonLabel: 'Content' },
  { id: 'summmary', buttonLabel: 'Summarize' },
] as const satisfies { id: string; buttonLabel: string }[];

export const FileViewerModal: React.FC<FileViewerModalProps> = ({ selectedFile, onClose }) => {
  const effectRanRef = useRef(false);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [viewIndex, setViewIndex] = useState(0);

  const getNextViewIndex = useCallback(() => (viewIndex + 1) % modalViews.length, [viewIndex]);

  const setNextView = () => {
    effectRanRef.current = false;
    setViewIndex(getNextViewIndex());
  };

  const currentViewId = useMemo(() => modalViews[viewIndex]?.id, [viewIndex]);

  useEffect(() => {
    const fetchFileContent = async () => {
      setLoading(true);
      setError(null);
      setFileContent(null);

      try {
        let contentToSet: string;

        if (currentViewId === 'content') {
          const blob = await downloadDocument(selectedFile.id);

          if (!blob) {
            throw new Error('Invalid file response');
          }

          contentToSet = await blob.text();
        } else if (currentViewId === 'summmary') {
          const response = await apiCall('SummarizeFile', {
            pathParams: {
              fileId: new Types.ObjectId(selectedFile.id),
            },
            queryParams: {},
            requestBody: null,
          });

          contentToSet = response.data;
        } else {
          contentToSet = '';
        }

        setFileContent(contentToSet);
      } catch (err) {
        console.error('Error fetching file content:', err);
        setError(err instanceof Error ? err.message : 'Failed to load file content');
      } finally {
        setLoading(false);
      }
    };

    if (!effectRanRef.current) {
      effectRanRef.current = true;
      void fetchFileContent();
    }
  }, [currentViewId, selectedFile.id]);

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
        <Button onClick={setNextView} variant="contained">
          {modalViews[getNextViewIndex()]?.buttonLabel}
        </Button>
        <Button onClick={handleClose} variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};
