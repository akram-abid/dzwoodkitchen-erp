import ClientsClient from "../_components/ClientsClient";
import { getAllClients } from "../services/clientsServices";

export const metadata = {
  title: 'Materials — DZ Wood Kitchen',
  description: 'Clients management.',
};

export default async function ClientPage() {
  const clients = await getAllClients()

  console.log(clients)


  return <ClientsClient clientsData={clients} />;
}