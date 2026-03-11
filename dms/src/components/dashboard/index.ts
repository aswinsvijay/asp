import { FilesComponent } from './Files.component';

export const DashboardViews = [
  {
    label: 'Dashboard',
    Component: () => null,
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
