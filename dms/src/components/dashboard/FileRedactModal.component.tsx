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
  Divider,
} from '@mui/material';
import { apiCall, downloadDocument, uploadFile } from '@/src/utils';
import { EntitySpan, ItemInfo } from '@/server/routerConfig/compiledRouterTypes.out';
import { Types } from 'mongoose';

interface FileRedactModalProps {
  parent: Types.ObjectId;
  selectedFile: ItemInfo;
  onClose: () => void;
}

export const FileRedactModal: React.FC<FileRedactModalProps> = ({ parent, selectedFile, onClose }) => {
  const effectRanRef = useRef(false);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [entities, setEntities] = useState<(EntitySpan & { redacted?: boolean })[]>([]);
  const editorRef = useRef<HTMLPreElement>(null);

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

        // Try to get file name from blob if available
        const content = await blob.text();
        setFileContent(content);

        const entitiesResponse = await apiCall('GetRedactionEntities', {
          pathParams: { fileId: new Types.ObjectId(selectedFile.id) },
          queryParams: {},
          requestBody: null,
        });

        setEntities(entitiesResponse.data);
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
  }, [selectedFile.id]);

  const handleClose = () => {
    setFileContent(null);
    setError(null);
    onClose();
  };

  const saveRedactedFile = async () => {
    if (!editorRef.current) {
      throw new Error('Editor element not found');
    }

    const content = editorRef.current.innerText;
    const file = new File([content], `REDACTED - ${selectedFile.name}`, {
      type: 'text/plain',
    });

    await uploadFile(file, parent);

    handleClose();
  };

  return (
    <Dialog open onClose={handleClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">{selectedFile.name}</Typography>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ height: '70vh', overflow: 'hidden' }}>
          {loading && (
            <Box display="flex" justifyContent="center" alignItems="center" sx={{ height: '100%' }}>
              <CircularProgress />
            </Box>
          )}
          {error && (
            <Box display="flex" justifyContent="center" alignItems="center" sx={{ height: '100%' }}>
              <Typography color="error">{error}</Typography>
            </Box>
          )}
          {!loading && !error && fileContent !== null && (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '3fr 1fr' },
                gap: 2,
                height: '100%',
                minHeight: 0,
                overflow: 'hidden',
              }}
            >
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
                  maxHeight: '100%',
                  minHeight: 0,
                }}
              >
                {(() => {
                  let indexInString = 0;
                  const toDisplay: React.ReactNode[] = [];

                  entities.forEach((entity, index) => {
                    if (indexInString < entity.start) {
                      toDisplay.push(fileContent.slice(indexInString, entity.start));
                    }

                    indexInString = entity.start;

                    toDisplay.push(
                      <span
                        key={index}
                        style={{ color: entity.redacted ? 'green' : 'red', cursor: 'pointer' }}
                        onClick={() => {
                          entity.redacted = !entity.redacted;
                          setEntities(JSON.parse(JSON.stringify(entities)) as typeof entities);
                        }}
                      >
                        {entity.redacted ? '[REDACTED]' : fileContent.slice(entity.start, entity.end)}
                      </span>
                    );

                    indexInString += entity.end - entity.start;
                  });

                  toDisplay.push(fileContent.slice(indexInString, fileContent.length));

                  return toDisplay;
                })()}
              </Box>
              <Box
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  backgroundColor: 'background.paper',
                  display: 'flex',
                  flexDirection: 'column',
                  maxHeight: '100%',
                  minHeight: 0,
                }}
              >
                <Box sx={{ p: 1.5 }}>
                  <Typography variant="caption" color="text.secondary">
                    Click any entity to toggle redaction
                  </Typography>
                </Box>
                <Divider />
                <Box sx={{ overflow: 'auto', p: 1, flex: 1, minHeight: 0 }}>
                  {entities.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      No entities found.
                    </Typography>
                  ) : (
                    entities.map((entity, index) => (
                      <Box
                        key={index}
                        onClick={() => {
                          entity.redacted = !entity.redacted;
                          setEntities(JSON.parse(JSON.stringify(entities)) as typeof entities);
                        }}
                        sx={{
                          p: 1,
                          mb: 1,
                          borderRadius: 1,
                          border: '1px solid',
                          borderColor: entity.redacted ? 'success.light' : 'error.light',
                          cursor: 'pointer',
                        }}
                      >
                        <Typography variant="body2" sx={{ fontFamily: 'monospace', wordBreak: 'break-word' }}>
                          <span style={{ textDecoration: entity.redacted ? 'line-through' : 'none' }}>
                            {fileContent.slice(entity.start, entity.end)}
                          </span>
                        </Typography>
                      </Box>
                    ))
                  )}
                </Box>
              </Box>
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button
          variant="contained"
          onClick={() => {
            setEntities((entities) =>
              entities.map((x) => {
                x.redacted = true;
                return x;
              })
            );
          }}
        >
          Redact all
        </Button>
        <Button
          variant="contained"
          onClick={() => {
            setEntities((entities) =>
              entities.map((x) => {
                x.redacted = false;
                return x;
              })
            );
          }}
        >
          Reset all
        </Button>
        <Button
          onClick={() => {
            void saveRedactedFile();
          }}
          variant="contained"
          color="success"
        >
          Save as new
        </Button>
        <Button onClick={handleClose} variant="outlined" color="error">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};
