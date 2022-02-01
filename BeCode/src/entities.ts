import { uptime } from 'process';
import * as sqlite from 'sqlite3';
import { UpdateDateColumn } from 'typeorm';
const sqlite3 = sqlite.verbose();

let db: sqlite.Database = new sqlite3.Database('chain.sqlite3', () => {});

export async function createDb() {
    console.log("createDb chain");
    db = await new sqlite3.Database('chain.sqlite3');
    console.log("createTable shipment");
    await db.run("CREATE TABLE IF NOT EXISTS shipment (referenceId TEXT, organizations TEXT, estimatedTimeArrival TEXT, shipmentWeight TEXT)");
    console.log("createTable organization");
    await db.run("CREATE TABLE IF NOT EXISTS organization (id TEXT, code TEXT)")
    db.configure("busyTimeout", 1000);
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

    static calculateTotalWeight(callback: any) {
        const sql = 'SELECT shipmentWeight FROM shipment;';
        return db.run(sql, callback);
    }

    static getShipment(referenceId: string, callback: any) {
        const sql = 'SELECT * FROM shipment WHERE referenceId = ?';
        return db.run(sql, referenceId, callback);
    }

    static async add(shipment: Shipment, errCallback: any, nullCallback: any, updateCallback: any) {
        this.getShipment(shipment.referenceId,(err: any, data: { rows: string | any[]; }) => {
            if (err) {
                return errCallback(err, undefined);
            }
            else if (data && data.rows.length >= 1) {
                return Shipment.update(shipment, updateCallback);
            }
            else {
                const sql = "INSERT INTO shipment(referenceId, organizations, estimatedTimeArrival, shipmentWeight) VALUES(?, ?, ?, ?)"
                return db.run(sql, shipment.referenceId, shipment.organizations.join(), shipment.estimatedTimeArrival, shipment.shipmentWeight, nullCallback);
            }
        });
    }

    static async update(shipment: Shipment, callback: any) {
        const sql = "UPDATE shipment SET organizations = ?";
        return db.run(sql, shipment.organizations.join(), callback);
    }
}

export class Organization {
    private id: string;
    private code: string;

    constructor(orgId: string, codeStr: string) {
        this.code = codeStr;
        this.id = orgId;
    }

    static async getOrganization(id: string, callback: any) {
        const sql = 'SELECT * FROM organization WHERE id = ?';
        return db.run(sql, id, callback);
    }

    static async add(organization: Organization, errorCallback: any, updateCallback: any, addCallback: any) {
        return this.getOrganization(organization.id, (err: any, data: { rows: number; }) => {
            if (err) {
                return errorCallback();
            }
            else if (data && data.rows >= 1) {
                return Organization.update(organization, updateCallback);
            }
            else {
                const sql = "INSERT INTO organization(id, code) VALUES(?, ?)"
                return db.run(sql, organization.id, organization.code, addCallback); 
            }
        });
    }

    static async update(organization: Organization, callback: any) {
        const sql = "UPDATE organization SET code = ?";
        return db.run(sql, organization.code, callback);
    }
}