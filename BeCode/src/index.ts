import { Connection, createConnection, getManager } from "typeorm";
import "reflect-metadata";
import express from 'express';
import bodyParser from "body-parser";
import { createDb, Organization, Shipment } from "entities";

const app = express()
app.use(bodyParser.json());
const port = 3405;
let connection: Connection;

app.post('/shipment', async (req: any, res: any) => {
   console.log("Shipment entered!");
   const shipment = req.body;
   const totalWeight = shipment.transportPacks.nodes[0].totalWeight.weight + shipment.transportPacks.nodes[0].totalWeight.unit;
   const shipObj = new Shipment(shipment.referenceId, shipment.organizations, shipment.estimatedTimeArrival, totalWeight)
   const errorCallback = (err: any, data: any) => {
    if (err) {
      res.status(500, 'Error in executing load');
    }
   }

   const nullCallback = (err: any, data: any) => {
     if (err) {
       res.status(500, 'Error');
     }
     else {
       res.status(200, data);
     }
   }

   const updateCallback = (err: any, data: any) => {
     if (err) {
       res.status(500, "Error");
     }
     else {
       res.status(200, data);
     }
   }

   Shipment.add(shipObj, errorCallback, nullCallback, updateCallback);
});

app.post('/organization', async (req: any, res: any) => {
   console.log("Organization loaded!");
   const org = req.body;
   const organization = new Organization(org.id, org.code);
   const errorCallback = (err: any, data: any) => {
    if (err) {
      res.status(500, 'Error in executing load');
    }
   }

   const updateCallback = (err: any, data: any) => {
      if (err) {
         res.status(500, "Error");
      }
      else {
         res.status(200, data);
      } 
    }

    const addCallback = (err: any, data: any) => {
      if (err) {
         res.status(500, "Error");
      }
      else {
         res.status(200, data);
      } 
    }

   Organization.add(organization, errorCallback, updateCallback, addCallback);
});
  

app.get('/shipments/:shipmentId', async (req: any, res: any) => {
   console.log("Handle shipments");
   const shipmentId = req.params["shipmentId"]
   Shipment.getShipment(shipmentId, (err: { message: any; }, result: any) => {
     if (err) {
       res.status(500).send(err.message);
     }
     else {
       res.status(200).send(result.rows);
     }
  });
});

app.get('/organizations/:organizationId', async (req: any, res: any) => {
  const organizationId = req.params["organizationId"]
  Organization.getOrganization(organizationId, (err: { message: any; }, result: { rows: any; }) => {
    if (err) {
      res.status(500).send(err.message);
    }
    else {
      res.status(200).send(result.rows);
    }
  })
});

app.get('/shipments/:unit', async (req: any, res: any) => {
  const desiredUnit = req.params["unit"]
  Shipment.calculateTotalWeight(desiredUnit, (err: { message: any; }, data: { rows: any; }) => {
    if (err) {
       res.status(500).send(err.message);
    }
    else {
      const resultData = data.rows;
      let sumData = 0.0;
      resultData.forEach((row) => {
          const theRow = row.split(/[^0-9]/);
          let value = Number(theRow[0]);
          const unit = theRow[1];
          if (unit != desiredUnit) {
            if (unit == 'POUNDS' && desiredUnit == 'KILOGRAMS') {
              value *= 0.453592;
            }
            else if (unit == 'POUNDS' && desiredUnit == 'OUNCES') {
              value *= 16;
            }
            else if (unit == 'KILOGRAMS' && desiredUnit == 'POUNDS') {
              value *= 2.205;
            }
            else if (unit == 'KILOGRAMS' && desiredUnit == 'OUNCES') {
              value *= 35.274;
            }
            else if (unit == 'OUNCES' && desiredUnit == 'POUNDS') {
              value *= 0.0625;
            }
            else if (unit == 'OUNCES' && desiredUnit == 'KILOGRAMS') {
              value *= 0.0283495;
            }
          }
          sumData += value
      });
      return sumData;
    }
  });
})

app.listen(port, async () => {
    createDb();   
});

console.log(`Example app listening at http://localhost:${port}`)
