import { Column, Entity, OneToMany, PrimaryColumn } from "typeorm";

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

    @OneToMany(() => Organization, org => org.id)
    organizations: Organization[];

    @Column()
    estimatedTimeArrival: string;

    @Column("simple-json")
    transportPacks: {nodes: [{totalWeight: {weight: string, unit: string}}]}
}