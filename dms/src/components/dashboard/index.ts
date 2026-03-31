import { StatsComponent } from './Stats.component';
import { FilesComponent } from './Files.component';
import { RedactComponent } from './Redact.component';
import { WorkflowsComponent } from './Workflows.component';

export const DashboardViews = [
  {
    label: 'Files',
    Component: FilesComponent,
  },
  {
    label: 'Insights',
    Component: StatsComponent,
  },
  {
    label: 'Redact',
    Component: RedactComponent,
  },
  {
    label: 'Workflows',
    Component: WorkflowsComponent,
  },
] as const satisfies {
  label: string;
  Component: React.FC;
}[];
