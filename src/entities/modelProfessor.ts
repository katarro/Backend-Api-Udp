import { AutoIncrement, Column, Model, PrimaryKey, Table } from "sequelize-typescript";
import { Col } from "sequelize/types/utils";

@Table({
    tableName: 'profesores',
    timestamps: false
})
export class Professor extends Model<Professor>{

    @PrimaryKey
    @AutoIncrement
    @Column
    id: number;

    @Column
    nombre: string;

    @Column
    correo: string;

    @Column
    contrasena: string;
}