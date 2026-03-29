import React, { useMemo, useState } from 'react';
import { Box, Button, CircularProgress, TextField, Typography } from '@mui/material';
import { rootFolder, Spacing, uploadTempFile } from '@/src/utils';
import { FileRedactInline } from './FileRedactUI.component';
import { Types } from 'mongoose';

export const RedactComponent = () => {
  const [text, setText] = useState('');
  const [tempFileId, setTempFileId] = useState<Types.ObjectId | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    try {
      const file = new File([text], 'redact-draft.txt', { type: 'text/plain' });
      const { id } = await uploadTempFile(file);
      setTempFileId(new Types.ObjectId(id));
    } catch (err) {
      console.error('Upload temp file failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload');
    } finally {
      setSaving(false);
    }
  };

  const fileBlob = useMemo(() => new Blob([text], { type: 'text/plain' }), [text]);

  return (
    <Box display="flex" flexDirection="column" height="100%" p={Spacing.MEDIUM} gap={Spacing.SMALL} minHeight={0}>
      {tempFileId === null ? (
        <>
          <Typography variant="h6">Enter text to redact</Typography>
          <TextField
            multiline
            minRows={14}
            fullWidth
            value={text}
            onChange={(e) => {
              setText(e.target.value);
            }}
            placeholder="Paste or type your document text..."
            sx={{ flex: 1 }}
          />
          {error !== null && (
            <Typography color="error" variant="body2">
              {error}
            </Typography>
          )}
          <Box>
            <Button
              variant="contained"
              onClick={() => void handleSave()}
              disabled={saving}
              startIcon={saving ? <CircularProgress size={18} color="inherit" /> : undefined}
            >
              {saving ? 'Saving…' : 'Redact'}
            </Button>
          </Box>
        </>
      ) : (
        <FileRedactInline
          file={{ type: 'temp', id: tempFileId, blob: fileBlob }}
          parent={rootFolder}
          onClose={() => undefined}
        />
      )}
    </Box>
  );
};
