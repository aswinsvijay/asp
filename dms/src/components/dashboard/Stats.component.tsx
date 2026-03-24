import { Box, Typography } from '@mui/material';
import { ApiResponse, Spacing, useApiCall, useMemoizedParameters } from '@/src/utils';

interface ClassStat {
  label: string;
  value: number;
}

export const DocumentClassChart = ({ data }: { data: ApiResponse<'GetFileStats'>['data']['documentClasses'] }) => {
  const stats: ClassStat[] = Object.entries(data)
    .map(([label, value]) => ({
      label: label.toUpperCase(),
      value,
    }))
    .sort((a, b) => b.value - a.value);

  const maxValue = Math.max(...stats.map((item) => item.value), 0);

  if (stats.length === 0 || maxValue === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100%">
        <Typography color="text.secondary">No classified documents yet</Typography>
      </Box>
    );
  }

  return (
    <Box p={Spacing.MEDIUM} display="flex" flexDirection="column" gap={Spacing.SMALL} height="100%" overflow="auto">
      <Typography variant="h6">Document Class Distribution</Typography>

      <Box display="flex" flexDirection="column" gap={Spacing.SMALL}>
        {stats.map((item) => {
          const widthPercent = (item.value / maxValue) * 100;

          return (
            <Box key={item.label} display="flex" flexDirection="column" gap={0.5}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="body2">{item.label}</Typography>
                <Typography variant="body2" color="textSecondary">
                  {item.value}
                </Typography>
              </Box>
              <Box
                sx={{
                  width: '100%',
                  height: 24,
                  backgroundColor: '#f3f4f6',
                  borderRadius: 1,
                  overflow: 'hidden',
                }}
              >
                <Box
                  sx={{
                    height: '100%',
                    width: `${widthPercent.toString()}%`,
                    backgroundColor: '#1976d2',
                    borderRadius: 1,
                    transition: 'width 250ms ease-in-out',
                  }}
                />
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export const DocumentSizeChart = ({ data }: { data: ApiResponse<'GetFileStats'>['data']['documentSizes'] }) => {
  const buckets = [...data].sort((a, b) => a.groupDetails.min - b.groupDetails.min);
  const maxCount = Math.max(...buckets.map((b) => b.count), 0);

  if (buckets.length === 0 || maxCount === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100%">
        <Typography color="text.secondary">No documents yet</Typography>
      </Box>
    );
  }

  return (
    <Box p={Spacing.MEDIUM} display="flex" flexDirection="column" gap={Spacing.SMALL} height="100%" overflow="auto">
      <Typography variant="h6">Document Size Distribution</Typography>

      <Box display="flex" flexDirection="column" gap={Spacing.SMALL}>
        {buckets.map((bucket) => {
          const widthPercent = (bucket.count / maxCount) * 100;
          const label = bucket.groupDetails.label;

          return (
            <Box key={label} display="flex" flexDirection="column" gap={0.5}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="body2">{label}</Typography>
                <Typography variant="body2" color="textSecondary">
                  {bucket.count}
                </Typography>
              </Box>
              <Box
                sx={{
                  width: '100%',
                  height: 24,
                  backgroundColor: '#f3f4f6',
                  borderRadius: 1,
                  overflow: 'hidden',
                }}
              >
                <Box
                  sx={{
                    height: '100%',
                    width: `${widthPercent.toString()}%`,
                    backgroundColor: '#1976d2',
                    borderRadius: 1,
                    transition: 'width 250ms ease-in-out',
                  }}
                />
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export const StatsComponent = () => {
  const {
    loading,
    error,
    data: response,
  } = useApiCall(
    'GetFileStats',
    useMemoizedParameters(
      () => ({
        pathParams: {},
        queryParams: {},
      }),
      []
    )
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100%">
        <Typography color="text.secondary">Loading stats...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100%">
        <Typography color="error">Error loading stats</Typography>
      </Box>
    );
  }

  return (
    <Box
      p={Spacing.MEDIUM}
      display="grid"
      gridTemplateColumns="repeat(2, minmax(0, 1fr))"
      gridTemplateRows="repeat(2, minmax(0, 1fr))"
      gap={Spacing.SMALL}
      height="100%"
      overflow="hidden"
    >
      <Box border="1px solid #e5e7eb" borderRadius={Spacing.SMALL} minHeight={0}>
        <DocumentClassChart data={response.data.documentClasses} />
      </Box>
      <Box border="1px solid #e5e7eb" borderRadius={Spacing.SMALL} minHeight={0}>
        <DocumentSizeChart data={response.data.documentSizes} />
      </Box>

      {['Widget 3', 'Widget 4'].map((title) => (
        <Box
          key={title}
          border="1px solid #e5e7eb"
          borderRadius={Spacing.SMALL}
          display="flex"
          alignItems="center"
          justifyContent="center"
          minHeight={0}
          p={Spacing.MEDIUM}
        >
          <Typography color="text.secondary">{title}</Typography>
        </Box>
      ))}
    </Box>
  );
};
