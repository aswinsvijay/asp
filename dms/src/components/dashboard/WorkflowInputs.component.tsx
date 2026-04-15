import { Button, Checkbox, FormControlLabel, MenuItem, TextField } from '@mui/material';
import { apiCall, ApiResponse } from '@/src/utils';
import React, { useCallback, useEffect, useState } from 'react';
import { WorkflowFormInput } from '@/server/routerConfig/compiledRouterTypes.out';

type Workflow = ApiResponse<'GetWorkflows'>['data'][number];

export const RenderInputField: React.FC<{
  data: Record<string, unknown>;
  updateData: (payload: Record<string, unknown>) => void;
  input: WorkflowFormInput;
}> = ({ data, updateData, input }) => {
  console.log('b', input);

  const props = {
    id: input.name,
    size: 'small',
    label: input.name,
  } as const;

  const [options, setOptions] = useState<ApiResponse<'GetWorkflowInputOptions'>['data'] | null>(null);

  useEffect(() => {
    const enumFrom = input.enumFrom;

    if (!enumFrom) {
      return;
    }

    const load = async () => {
      try {
        const result = await apiCall('GetWorkflowInputOptions', {
          pathParams: {
            type: enumFrom,
          },
          queryParams: {},
          requestBody: null,
        });

        setOptions(result.data);
      } catch {
      } finally {
      }
    };

    void load();
  });

  switch (input.type) {
    case 'string':
      if (options == undefined) {
        return (
          <div>
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
      } else {
        // options is not undefined, so show a dropdown or text if there are no options
        if (options.length === 0) {
          return (
            <div>
              <TextField
                {...props}
                fullWidth
                disabled
                value=""
                placeholder="No options available"
                helperText="No options available"
              />
            </div>
          );
        }
        return (
          <div>
            <TextField
              {...props}
              select
              fullWidth
              value={typeof data[input.name] === 'string' ? data[input.name] : ''}
              onChange={(e) => {
                updateData({ [input.name]: e.target.value });
              }}
            >
              {options.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.displayName}
                </MenuItem>
              ))}
            </TextField>
          </div>
        );
      }
    case 'number':
      return (
        <div>
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
        <div>
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
};

export const WorkflowInputs: React.FC<{ workflow: Workflow; onSubmit: (data: Record<string, unknown>) => void }> = ({
  workflow,
  onSubmit,
}) => {
  const [data, setData] = useState<Record<string, unknown>>({});

  const updateData = useCallback((payload: Record<string, unknown>) => {
    setData((prev) => ({ ...prev, ...payload }));
  }, []);

  useEffect(() => {
    setData({});
  }, [workflow.id]);

  return (
    <>
      Enter values to pass to workflow
      {workflow.inputs.map((input) => {
        return <RenderInputField key={input.name} input={input} data={data} updateData={updateData} />;
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
