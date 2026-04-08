import React, { useState, useRef, useMemo } from 'react';
import { Spacing, useApiCall, useMemoizedParameters, downloadDocument, uploadFile, rootFolder } from '@/src/utils';
import { Types } from 'mongoose';
import { Box, Breadcrumbs, Button, Link, Typography } from '@mui/material';
import { useSnackbar } from 'notistack';
import { CustomIcon } from '../CustomIcon.component';
import { ItemInfo } from '@/server/routerConfig/compiledRouterTypes.out';
import { TextFileViewerModal } from './TextFileViewerModal.component';
import { AudioViewerModal } from './AudioViewerModal.component';
import { FileRedactModal } from './FileRedactUI.component';
import { CreateFolderModal } from './CreateFolderModal.component';
import { FolderSummarizeModal } from './FolderSummarizeModal.component';

type FileItem = Extract<ItemInfo, { type: 'document' }>;

export const FilesComponent = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [path, setPath] = useState<ItemInfo[]>([]);
  const [widget, setWidget] = useState<'view' | 'redact' | 'folder_summarize' | null>(null);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [createFolderOpen, setCreateFolderOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const deepestParent = useMemo(() => {
    return new Types.ObjectId(path.at(-1)?.id ?? rootFolder);
  }, [path]);

  const {
    loading,
    error,
    data: response,
    reset,
  } = useApiCall(
    'GetChildren',
    useMemoizedParameters(
      () => ({
        pathParams: {
          parentId: deepestParent,
        },
        queryParams: {},
        requestBody: null,
      }),
      [deepestParent]
    )
  );

  const handleFileSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log('File selected:', file.name, file.size, file.type);

      void uploadFile(file, deepestParent)
        .then(() => {
          enqueueSnackbar({ variant: 'success', message: 'File uploaded' });
          reset();
        })
        .catch(() => {
          enqueueSnackbar({ variant: 'error', message: 'Error uploading file' });
        });
    }
  };

  const handleFileUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleView = (item: FileItem) => {
    setSelectedFile(item);
    setWidget('view');
  };

  const handleDownload = async (item: ItemInfo) => {
    try {
      const blob = await downloadDocument(item.id);

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

  const handleRedact = (item: FileItem) => {
    setSelectedFile(item);
    setWidget('redact');
  };

  const handleSummarizeFolder = () => {
    setWidget('folder_summarize');
  };

  const openCreateFolderModal = () => {
    setCreateFolderOpen(true);
  };

  const folders = useMemo(() => (response?.data ?? []).filter((item) => item.type === 'folder'), [response?.data]);
  const documents = useMemo(() => (response?.data ?? []).filter((item) => item.type === 'document'), [response?.data]);

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

      <CreateFolderModal
        parentId={deepestParent}
        open={createFolderOpen}
        onClose={() => {
          setCreateFolderOpen(false);
          reset();
        }}
      />

      {widget === 'folder_summarize' && (
        <FolderSummarizeModal
          folderId={deepestParent}
          onClose={() => {
            setWidget(null);
            reset();
          }}
        />
      )}

      {selectedFile && (
        <>
          {widget === 'view' && (
            <>
              {selectedFile.mimetype === 'text/plain' && (
                <TextFileViewerModal
                  parent={deepestParent}
                  selectedFile={selectedFile}
                  onClose={() => {
                    setWidget(null);
                    reset();
                  }}
                />
              )}
              {selectedFile.mimetype === 'audio/mpeg' && (
                <AudioViewerModal
                  parent={deepestParent}
                  selectedFile={selectedFile}
                  onClose={() => {
                    setWidget(null);
                    reset();
                  }}
                />
              )}
            </>
          )}
          {widget === 'redact' && (
            <FileRedactModal
              parent={deepestParent}
              file={{ type: 'stored', selectedFile: selectedFile }}
              onClose={() => {
                setWidget(null);
                reset();
              }}
            />
          )}
        </>
      )}

      <Box display={'flex'} p={Spacing.SMALL} gap={Spacing.SMALL} className="flex-shrink-0 border-b border-gray-200">
        <Breadcrumbs aria-label="breadcrumb">
          <Link
            component="button"
            underline="hover"
            color="inherit"
            onClick={() => {
              setPath([]);
            }}
            sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}
          >
            <CustomIcon name="Home" />
          </Link>
          {path.map((item, index) => {
            const label = item.name;

            return (
              <Link
                key={label}
                component="button"
                underline="hover"
                color="inherit"
                onClick={() => {
                  setPath((prev) => prev.slice(0, index + 1));
                }}
              >
                {label}
              </Link>
            );
          })}
        </Breadcrumbs>
      </Box>

      <Box
        display={'flex'}
        p={Spacing.SMALL}
        gap={Spacing.SMALL}
        className="flex-grow-0 flex-shrink-0 border-b border-gray-200"
        sx={{
          '& > button': {
            minWidth: 'unset',
            padding: 0.5,
          },
        }}
      >
        <Button variant="contained" onClick={handleFileUpload} title="Upload File">
          <CustomIcon name="Upload" />
        </Button>
        <Button variant="contained" onClick={openCreateFolderModal} title="Create Folder">
          <CustomIcon name="CreateNewFolder" />
        </Button>
        <Button
          variant="contained"
          color="info"
          onClick={() => {
            void navigator.clipboard.writeText(deepestParent.toString());
          }}
          title="Copy Folder ID"
        >
          <CustomIcon name="DatasetLinked" />
        </Button>
        <Button variant="contained" color="info" onClick={handleSummarizeFolder} title="Summarize Folder">
          <CustomIcon name="AutoAwesome" />
        </Button>
      </Box>

      <div className="flex flex-col flex-1 px-4 py-2 gap-2 overflow-auto">
        <div className="flex flex-col gap-6">
          {[
            { label: 'Folders', array: folders },
            { label: 'Files', array: documents },
          ].map(({ label, array }) => {
            return (
              array.length > 0 && (
                <Box key={label}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5 }}>
                    {label}
                  </Typography>
                  <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
                    {array.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 border border-gray-200 rounded-lg hover:shadow-md transition-shadow duration-200 flex flex-col gap-1"
                      >
                        <div className="text-md font-medium text-gray-900 truncate">{item.name}</div>
                        {item.type === 'document' && (
                          <>
                            <div className="text-xs font-medium text-gray-500 truncate">
                              {(item.extractFile?.class ?? item.class).toUpperCase()}
                            </div>
                            <div className="flex flex-col gap-2">
                              <Box display="flex" flexDirection="row" gap={1}>
                                <Button
                                  sx={{ flex: 1, minWidth: 0 }}
                                  size="small"
                                  variant="outlined"
                                  onClick={() => {
                                    handleView(item);
                                  }}
                                  className="flex-1"
                                >
                                  <CustomIcon name="RemoveRedEye" />
                                </Button>
                                <Button
                                  sx={{ flex: 1, minWidth: 0 }}
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
                                  sx={{ flex: 1, minWidth: 0 }}
                                  size="small"
                                  variant="outlined"
                                  onClick={() => {
                                    void navigator.clipboard.writeText(item.id);
                                  }}
                                  title="Copy Document ID"
                                >
                                  <CustomIcon name="DatasetLinked" />
                                </Button>
                              </Box>
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={() => {
                                  handleRedact(item);
                                }}
                                className="flex-1"
                              >
                                Redact
                              </Button>
                            </div>
                          </>
                        )}
                        {item.type === 'folder' && (
                          <div className="flex flex-col gap-2">
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => {
                                setPath((prev) => [...prev, item]);
                              }}
                              className="flex-1"
                            >
                              Open
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </Box>
              )
            );
          })}

          {folders.length === 0 && documents.length === 0 && (
            <Typography color="text.secondary" variant="body2">
              No items in this folder.
            </Typography>
          )}
        </div>
      </div>
    </div>
  );
};
