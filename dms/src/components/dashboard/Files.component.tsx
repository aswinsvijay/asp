import React, { useState, useRef } from 'react';
import { apiCall, Spacing, useApiCall, useMemoizedParameters } from '@/src/utils';
import { Types } from 'mongoose';
import { Box, Button } from '@mui/material';
import { CustomIcon } from '../CustomIcon.component';
import { ItemInfo } from '@/server/routerConfig/compiledRouterTypes.out';
import { FileViewerModal } from './FileViewerModal.component';

const uploadFile = async (file: File) => {
  const formData = new FormData();

  formData.append('file', file);

  await apiCall('UploadFile', {
    pathParams: {},
    queryParams: {},
    requestBody: formData,
  });
};

const getDocumentBlob = async (item: ItemInfo) => {
  const blob = await apiCall('DownloadFile', {
    pathParams: {
      fileId: new Types.ObjectId(item.id),
    },
    queryParams: {},
    requestConfig: {
      responseType: 'blob',
    },
  });

  if (!(blob instanceof Blob)) {
    return null;
  }

  return blob;
};

const handleFileSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (file) {
    console.log('File selected:', file.name, file.size, file.type);

    void uploadFile(file);
  }
};

export const FilesComponent = () => {
  const [parent] = useState<Types.ObjectId | null>(null);
  const [widget, setWidget] = useState<'view' | 'redact' | null>(null);
  const [selectedFile, setSelectedFile] = useState<ItemInfo | null>(null);
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

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleView = (item: ItemInfo) => {
    try {
      setSelectedFile(item);
      setWidget('view');
    } catch (viewError) {
      console.error('Error viewing file:', viewError);
    }
  };

  const handleDownload = async (item: ItemInfo) => {
    try {
      const blob = await getDocumentBlob(item);

      if (!blob) {
        return;
      }

      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = item.name;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (downloadError) {
      console.error('Error downloading file:', downloadError);
    }
  };

  const handleRedact = async (item: ItemInfo) => {
    try {
      const blob = await getDocumentBlob(item);

      if (!blob) {
        return;
      }

      const fileContent = await blob.text();

      const response = await apiCall('GetRedactionEntities', {
        pathParams: { fileId: new Types.ObjectId(item.id) },
        queryParams: {},
      });

      console.log('Redacted file:', { fileContent, entities: response.data });
    } catch (redactError) {
      console.error('Error redacting file:', redactError);
    }
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

      {selectedFile && (
        <>
          {widget === 'view' ? (
            <FileViewerModal
              selectedFile={selectedFile}
              onClose={() => {
                setWidget(null);
              }}
            />
          ) : null}
          {widget === 'redact' ? null : null}
        </>
      )}

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
              className="p-3 border border-gray-200 rounded-lg hover:shadow-md transition-shadow duration-200 flex flex-col gap-1"
            >
              <div className="text-sm font-medium text-gray-900 truncate">{item.name}</div>
              {item.type === 'document' && (
                <div className="flex flex-col gap-2">
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => {
                      handleView(item);
                    }}
                    className="flex-1"
                  >
                    View
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => {
                      void handleDownload(item);
                    }}
                    className="flex-1"
                  >
                    <CustomIcon name="Download" />
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => {
                      void handleRedact(item);
                    }}
                    className="flex-1"
                  >
                    Redact
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
