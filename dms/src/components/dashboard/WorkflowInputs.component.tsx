import { Button, Checkbox, FormControlLabel, TextField } from '@mui/material';
import { ApiResponse } from '@/src/utils';
import { useCallback, useState } from 'react';

type Workflow = ApiResponse<'GetWorkflows'>['data'][number];

export const WorkflowInputs: React.FC<{ workflow: Workflow; onSubmit: (data: Record<string, unknown>) => void }> = ({
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
