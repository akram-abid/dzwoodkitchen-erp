import WorkersClient from '../_components/WorkersClient';

import { getAllWorkers } from '../services/workersServices';

export const metadata = {
  title: 'Workers — DZ Wood Kitchen',
  description: 'Worker management, daily attendance, and skill tracking',
};

export default async function WorkersPage() {

  const workers = await getAllWorkers()

  return <WorkersClient workersData={workers} />;
}