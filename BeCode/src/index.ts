import "reflect-metadata";
import express from 'express';
import bodyParser from "body-parser";
import { DatabaseContainer, Organization, Shipment } from "./entities";

const app = express()
app.use(bodyParser.json());
const port = 3405;
let dbContainer: DatabaseContainer = new DatabaseContainer();

app.post('/shipment', async (req: any, res: any) => {
   const shipment = req.body;
   let totalWeight = "0POUNDS";
   if (shipment.transportPacks.nodes[0]) {
       totalWeight = shipment.transportPacks.nodes[0].totalWeight.weight + shipment.transportPacks.nodes[0].totalWeight.unit;
   }
   const shipObj = new Shipment(shipment.referenceId, shipment.organizations, shipment.estimatedTimeArrival, totalWeight)

   let result = await Shipment.add(shipObj, dbContainer.getDb());
   console.log(result);
   res.send(result);
});

app.post('/organization', async (req: any, res: any) => {
   const org = req.body;
   const organization = new Organization(org.id, org.code);
   let theOrg = await Organization.add(organization, dbContainer.getDb());
   console.log(theOrg);
   res.send(theOrg);
});
  

app.get('/shipments/:shipmentId', async (req: any, res: any) => {
   const shipmentId = req.params["shipmentId"]
   let db = await dbContainer.getDb();
   let foundShipment = await Shipment.getShipment(shipmentId, db);
   console.log(foundShipment);
   res.send(foundShipment);
});

app.get('/organizations/:organizationId', async (req: any, res: any) => {
  const organizationId = req.params["organizationId"]
  let db = await dbContainer.getDb();
  let theOrg = Organization.getOrganization(organizationId, db);
  console.log(theOrg);
  res.send(theOrg);
});

app.get('/shipments/totalWeight/:unit', async (req: any, res: any) => {
  const desiredUnit = req.params["unit"]
  const shipment = await Shipment.calculateTotalWeight(desiredUnit, dbContainer.getDb());
  console.log(shipment);
  res.send(shipment);
})

app.listen(port, async () => {
    await dbContainer.createDb();
});

console.log(`Example app listening at http://localhost:${port}`)
