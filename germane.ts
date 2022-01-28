import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
export class Organization {
    @PrimaryColumn()
    id: string;

    @Column()
    code: string;
}

@Entity()
export class Shipment {
    @PrimaryColumn()
    referenceId: string;
    
    organizations: string[];

    @Column()
    estimatedTimeArrival: string;
}