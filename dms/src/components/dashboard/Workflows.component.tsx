import { Alert, Box, Button, CircularProgress } from '@mui/material';
import { ApiResponse, Spacing, tryApiCall, useApiCall, useMemoizedParameters } from '@/src/utils';
import { CustomIcon } from '../CustomIcon.component';
import { CreateWorkflowModal } from './CreateWorkflowModal.component';
import { useCallback, useEffect, useState } from 'react';
import { Types } from 'mongoose';

type Workflow = ApiResponse<'GetWorkflows'>['data'][number];

export const WorkflowsComponent = () => {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
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

      {response.data.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-gray-500">No workflows.</div>
        </div>
      ) : (
        <div className="flex flex-1 px-4 py-4 gap-2 overflow-auto">
          <div className="flex flex-col flex-1 px-4 gap-2 overflow-auto">
            <Box display={'flex'} flexDirection={'column'} gap={1}>
              {response.data.map((workflow) => (
                <div
                  key={workflow.id}
                  className="p-3 border border-gray-200 rounded-lg hover:shadow-md transition-shadow duration-200 flex items-center gap-1"
                >
                  <div className="text-sm font-medium text-gray-900 truncate flex-1">{workflow.name}</div>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<CustomIcon name="PlayArrow" />}
                    onClick={() => {
                      setSelectedWorkflow(workflow);
                    }}
                  >
                    Run
                  </Button>
                </div>
              ))}
            </Box>
          </div>
          <div className="flex flex-col flex-1 px-4 py-2 gap-2 overflow-auto">
            <WorkflowForm workflow={selectedWorkflow} />
          </div>
        </div>
      )}
    </div>
  );
};

const WorkflowForm: React.FC<{ workflow: Workflow | null }> = ({ workflow }) => {
  const [runStatus, setRunStatus] = useState<
    | { type: 'loading' }
    | {
        type: 'success' | 'error';
        text: string;
      }
    | null
  >(null);

  const runWorkflow = useCallback(async (workflow: Workflow, data: NonNullable<unknown>) => {
    setRunStatus({ type: 'loading' });

    const [, error] = await tryApiCall('RunWorkflow', {
      pathParams: {
        workflowId: new Types.ObjectId(workflow.id),
      },
      queryParams: {},
      requestBody: null,
    });

    if (error) {
      setRunStatus({ type: 'error', text: 'Workflow run failed' });
    } else {
      setRunStatus({ type: 'success', text: 'Workflow started successfully' });
    }
  }, []);

  useEffect(() => {
    setRunStatus(null);
    if (workflow && workflow.inputs.length === 0) {
      runWorkflow(workflow, {}).catch(() => undefined);
    }
  }, [workflow, runWorkflow]);

  if (!workflow) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Select a workflow</div>
      </div>
    );
  }

  if (runStatus) {
    switch (runStatus.type) {
      case 'loading':
        return (
          <div className="flex items-center justify-center h-full">
            <CircularProgress />
          </div>
        );
      case 'success':
      case 'error':
        return (
          <div className="flex items-center justify-center h-full">
            <Alert className="w-full" severity={runStatus.type}>
              {runStatus.text}
            </Alert>
          </div>
        );
    }
  }

  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-gray-500">Enter inputs</div>
    </div>
  );
};
