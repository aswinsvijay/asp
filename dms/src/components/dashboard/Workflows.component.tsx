import { Alert, Box, Button, Checkbox, CircularProgress, FormControlLabel, TextField } from '@mui/material';
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
                      // Avoiding referential equality to allow running same workflow again
                      setSelectedWorkflow({ ...workflow });
                    }}
                  >
                    Run
                  </Button>
                </div>
              ))}
            </Box>
          </div>
          <div className="flex flex-col flex-1 px-4 py-2 gap-2 overflow-auto">
            <WorkflowRun workflow={selectedWorkflow} />
          </div>
        </div>
      )}
    </div>
  );
};

const WorkflowRun: React.FC<{ workflow: Workflow | null }> = ({ workflow }) => {
  const [runStatus, setRunStatus] = useState<
    | { type: 'loading' }
    | {
        type: 'success' | 'error';
        text: string;
      }
    | null
  >(null);

  const runWorkflow = useCallback(async (workflow: Workflow, data: Record<string, unknown>) => {
    setRunStatus({ type: 'loading' });

    const [, error] = await tryApiCall('RunWorkflow', {
      pathParams: {
        workflowId: new Types.ObjectId(workflow.id),
      },
      queryParams: {},
      requestBody: data,
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
      void runWorkflow(workflow, {});
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
    <WorkflowInputs
      workflow={workflow}
      onSubmit={(data) => {
        void runWorkflow(workflow, data);
      }}
    />
  );
};

const WorkflowInputs: React.FC<{ workflow: Workflow; onSubmit: (data: Record<string, unknown>) => void }> = ({
  workflow,
  onSubmit,
}) => {
  const [data, setData] = useState<Record<string, unknown>>({});

  const updateData = useCallback((payload: Record<string, unknown>) => {
    setData((prev) => ({ ...prev, ...payload }));
  }, []);

  return (
    <>
      Enter values to pass to workflow
      {workflow.inputs.map((input) => {
        const props = {
          id: input.name,
          size: 'small',
          label: input.name,
        } as const;

        switch (input.type) {
          case 'string':
            return (
              <div key={input.name}>
                <TextField
                  {...props}
                  type="text"
                  fullWidth
                  value={typeof data[input.name] === 'string' ? (data[input.name] as string) : ''}
                  onChange={(e) => {
                    updateData({ [input.name]: e.target.value });
                  }}
                />
              </div>
            );
          case 'number':
            return (
              <div key={input.name}>
                <TextField
                  {...props}
                  type="number"
                  fullWidth
                  value={
                    typeof data[input.name] === 'number' || data[input.name] === undefined
                      ? ((data[input.name] as number | undefined) ?? '')
                      : ''
                  }
                  onChange={(e) => {
                    const value = e.target.value;
                    updateData({ [input.name]: value === '' ? undefined : Number(value) });
                  }}
                />
              </div>
            );
          case 'boolean':
            return (
              <div key={input.name}>
                <FormControlLabel
                  label={input.name}
                  control={
                    <Checkbox
                      {...props}
                      checked={Boolean(data[input.name])}
                      onChange={(e) => {
                        updateData({ [input.name]: e.target.checked });
                      }}
                    />
                  }
                />
              </div>
            );
          default:
            return null;
        }
      })}
      <Button
        variant="contained"
        onClick={() => {
          onSubmit(data);
        }}
      >
        Submit
      </Button>
    </>
  );
};
