export const dynamic = "force-dynamic";
import ClientsClient from "../_components/ClientsClient";
import { getAllClients } from "../services/clientsServices";
import { getAllWorkers } from "../services/workersServices"


export const metadata = {
  title: 'Materials — DZ Wood Kitchen',
  description: 'Clients management.',
};

export default async function ClientPage() {
  const clients = await getAllClients()
  const workers = await getAllWorkers()

  console.log(clients)


  return <ClientsClient clientsData={clients} workersData={workers} />;
}
