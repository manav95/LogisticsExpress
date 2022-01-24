import { Organization, Shipment } from "entities";
import { createConnection, getManager } from "typeorm";

const express = require('express')
const bodyParser = require("body-parser");

const app = express()
app.use(bodyParser.json());
const port = 3000

app.post('/shipment', async (req: any, res: any) => {
   const shipments = req.body;
   const connection = await createConnection({
      type: "sqlite",
      database: "test",
      entities: [
        Shipment,
        Organization
      ],
      synchronize: true,
      logging: false
   });
   const entities = await connection.manager.save(shipments);
   if (entities) {
    res.status(200).send("Entities saved: " + entities);
   }
   
})

app.post('/organization', async (req: any, res: any) => {
   const organization = req.body;
   const connection = await createConnection({
      type: "sqlite",
      database: "test",
      entities: [
        Organization
      ],
      synchronize: true,
      logging: false
   });
   const org = await connection.manager.save(organization);
   if (org) {
    res.status(200).send("Organization saved: " + org);
   }
})

app.get('/shipments/:shipmentId', async (req: any, res: any) => {
   const shipmentId = req.params["shipmentId"]
   const connection = await createConnection({
    type: "sqlite",
    database: "test",
    entities: [
      Shipment,
      Organization
    ],
    synchronize: true,
    logging: false
   });
  const shipment = await connection.getRepository(Shipment).findOne({referenceId: shipmentId});
  if (shipment) {
    res.status(200).send(shipment);
  }
  else {
    res.status(200).send("No shipment belonging to that id was found.");
  }
})

app.get('/organizations/:organizationId', async (req: any, res: any) => {
   const organizationId = req.params["organizationId"]
   const connection = await createConnection({
    type: "sqlite",
    database: "test",
    entities: [
      Organization
    ],
    synchronize: true,
    logging: false
   });
  const organization = await connection.getRepository(Organization).findOne({id: organizationId});
  if (organization) {
    res.status(200).send(organization);
  }
  else {
    res.status(200).send("No organization belonging to that id was found.");
  }
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
