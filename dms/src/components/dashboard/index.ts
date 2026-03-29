import { StatsComponent } from './Stats.component';
import { FilesComponent } from './Files.component';
import { RedactComponent } from './Redact.component';

export const DashboardViews = [
  {
    label: 'Files',
    Component: FilesComponent,
  },
  {
    label: 'Stats',
    Component: StatsComponent,
  },
  {
    label: 'Redact',
    Component: RedactComponent,
  },
] as const satisfies {
  label: string;
  Component: React.FC;
}[];
