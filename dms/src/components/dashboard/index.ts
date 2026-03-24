import { StatsComponent } from './Stats.component';
import { FilesComponent } from './Files.component';

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
    Component: () => null,
  },
] as const satisfies {
  label: string;
  Component: React.FC;
}[];
