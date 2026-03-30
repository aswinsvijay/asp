import { Box, Button } from '@mui/material';
import { Spacing, useApiCall, useMemoizedParameters } from '@/src/utils';
import { CustomIcon } from '../CustomIcon.component';
import { CreateWorkflowModal } from './CreateWorkflowModal.component';
import { useState } from 'react';

export const WorkflowsComponent = () => {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const {
    loading,
    error,
    data: response,
    reset,
  } = useApiCall(
    'GetWorkflows',
    useMemoizedParameters(
      () => ({
        pathParams: {},
        queryParams: {},
        requestBody: null,
      }),
      []
    )
  );

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
        <div className="text-red-500">Error loading workflows</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {createModalOpen && (
        <CreateWorkflowModal
          onClose={() => {
            setCreateModalOpen(false);
            reset();
          }}
        />
      )}

      <Box
        display={'flex'}
        p={Spacing.SMALL}
        gap={Spacing.SMALL}
        className="flex-grow-0 flex-shrink-0 border-b border-gray-200"
      >
        <Button
          variant="contained"
          onClick={() => {
            setCreateModalOpen(true);
          }}
          title="Create Workflow"
        >
          <CustomIcon name="Add" />
        </Button>
      </Box>

      {response.data.length === 0 && (
        <div className="flex items-center justify-center h-full">
          <div className="text-gray-500">No workflows.</div>
        </div>
      )}

      <div className="flex flex-col flex-1 px-4 py-2 gap-2 overflow-auto">
        <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
          {response.data.map((workflow) => (
            <div
              key={workflow.id}
              className="p-3 border border-gray-200 rounded-lg hover:shadow-md transition-shadow duration-200 flex flex-col gap-1"
            >
              <div className="text-sm font-medium text-gray-900 truncate">{workflow.name}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
