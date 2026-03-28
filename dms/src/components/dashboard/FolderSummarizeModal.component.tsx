import { useApiCall, useMemoizedParameters } from '@/src/utils';
import { Dialog } from '@mui/material';
import { Types } from 'mongoose';

interface FolderSummarizeModalProps {
  onClose: () => void;
  folderId: Types.ObjectId;
}

export const FolderSummarizeModal = ({ onClose, folderId }: FolderSummarizeModalProps) => {
  const handleClose = () => {
    onClose();
  };

  const { data: response } = useApiCall(
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

  return (
    <Dialog open onClose={handleClose} fullWidth maxWidth="sm">
      {JSON.stringify(response)}
    </Dialog>
  );
};
