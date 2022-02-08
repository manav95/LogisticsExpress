import { open, Database } from 'sqlite';
import sqlite3 from 'sqlite3';

export class DatabaseContainer {
    db: Database;

    async createDb() {
        console.log("createDb chain");
        //ts-ignore
        this.db = await open({
           filename: '/tmp/database.db',
           driver: sqlite3.Database

        });
    
        console.log("createTable shipment");
        await this.db.exec("CREATE TABLE IF NOT EXISTS shipment (referenceId TEXT, organizations TEXT, estimatedTimeArrival TEXT, shipmentWeight TEXT)");
        console.log("createTable organization");
        await this.db.exec("CREATE TABLE IF NOT EXISTS organization (id TEXT, code TEXT)")
        this.db.configure("busyTimeout", 1000);

        return this.db;
    }
     
    getDb() {
        return this.db;
    }
}

export class Shipment {
    private referenceId: string;
    private organizations: string[];
    private estimatedTimeArrival: string;
    private shipmentWeight: string;
    

    constructor(refId: string, orgs: string[], eta: string, weight: string) {
        this.referenceId = refId;
        this.organizations = orgs;
        this.estimatedTimeArrival = eta;
        this.shipmentWeight = weight;
    }

    static async calculateTotalWeight(desiredUnit: string, db: Database) {
        const sql = 'SELECT shipmentWeight FROM shipment;';
        let weightData = await db.all(sql);
        let sumData = 0.0;
        console.log("Weight");
        console.log(weightData);
        weightData.forEach(row => {
          const theRow = row["shipmentWeight"];
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

    static async getShipment(referenceId: string, db: Database) {
        const sql = 'SELECT * FROM shipment WHERE referenceId = ?';
        let shipment = await db.get(sql, referenceId);
        return shipment;
    }

    static async add(ship: Shipment, db: Database) {
        const shipment = await db.run('INSERT INTO shipment VALUES (?, ?, ?, ?)', ship.referenceId, ship.organizations.join(','), ship.estimatedTimeArrival, ship.shipmentWeight);
        return shipment;
    }

    static async update(shipment: Shipment, db: Database) {
        const sql = "UPDATE shipment SET organizations = ?";
        let theShipment = await db.run(sql, shipment.organizations.join());
        return theShipment;
    }
}

export class Organization {
    private id: string;
    private code: string;

    constructor(orgId: string, codeStr: string) {
        this.code = codeStr;
        this.id = orgId;
    }

    static async getOrganization(id: string, db: Database) {
        const sql = 'SELECT * FROM organization WHERE id = ?';
        let theOrg = await db.get(sql, id);
        return theOrg;
    }

    static async add(organization: Organization, db: Database) {
        let addedResult = await db.run('INSERT INTO organization VALUES (?, ?)', organization.id, organization.code);
        return addedResult;
    }

    static async update(organization: Organization, db: Database) {
        const sql = "UPDATE organization SET code = ?";
        let updatedOrg = await db.run(sql, organization.code);
        return updatedOrg;
    }
}