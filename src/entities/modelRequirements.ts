import { Table, Column, Model, PrimaryKey, AutoIncrement } from 'sequelize-typescript';

@Table({
    tableName: 'requisitos',
    timestamps: false,
})
export class Requirement extends Model<Requirement> {

    @PrimaryKey
    @AutoIncrement
    @Column
    id: number;

    @Column
    requisito: string;

}
