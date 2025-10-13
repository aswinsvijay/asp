import React, { useState, useRef } from 'react';
import { apiCall, Spacing, useApiCall, useMemoizedParameters } from '@/src/utils';
import { Types } from 'mongoose';
import { Box, Button } from '@mui/material';
import { CustomIcon } from '../CustomIcon.component';

export const FilesComponent = () => {
  const [parent] = useState<Types.ObjectId | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    loading,
    error,
    data: response,
  } = useApiCall(
    'GetChildren',
    useMemoizedParameters(
      () => ({
        pathParams: {
          parentId: parent ?? new Types.ObjectId('0'.repeat(24)),
        },
        queryParams: {},
      }),
      [parent]
    )
  );

  const uploadFile = async (file: File) => {
    const formData = new FormData();

    formData.append('file', file);

    await apiCall('UploadFile', {
      pathParams: {},
      queryParams: {},
      requestBody: formData,
    });
  };

  const handleFileSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log('File selected:', file.name, file.size, file.type);

      void uploadFile(file);
    }
  };

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-red-500">Error loading files</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <input ref={fileInputRef} type="file" onChange={handleFileSelected} style={{ display: 'none' }} accept="*/*" />

      <Box p={Spacing.SMALL} className="flex-shrink-0 p-4 border-b border-gray-200">
        <Button startIcon={<CustomIcon name="Upload" />} variant="contained" onClick={handleFileUpload}>
          Upload File
        </Button>
      </Box>

      <div className="flex-1 p-4 overflow-auto">
        <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
          {response.data.map((item, index) => (
            <div
              key={index}
              className="p-3 border border-gray-200 rounded-lg hover:shadow-md transition-shadow duration-200"
            >
              <div className="text-sm font-medium text-gray-900 truncate">{item.name}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
