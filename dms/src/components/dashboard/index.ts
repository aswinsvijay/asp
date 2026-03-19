import { StatsComponent } from './Stats.component';
import { FilesComponent } from './Files.component';

export const DashboardViews = [
  {
    label: 'Dashboard',
    Component: StatsComponent,
  },
  {
    label: 'Files',
    Component: FilesComponent,
  },
  {
    label: 'Redact',
    Component: () => null,
  },
] as const satisfies {
  label: string;
  Component: React.FC;
}[];
