import FleetClient from "../_components/FleetClient";
import { getAllVehicles } from "../services/vehiclesServices";

export const metadata = {
  title: 'Workers — DZ Wood Kitchen',
  description: 'Worker management, daily attendance, and skill tracking',
};

export default async function WorkersPage() {
  const vehicles = await getAllVehicles();

  console.log("vehicles: ", vehicles)
  return <FleetClient initialVehicles={vehicles} />;
}