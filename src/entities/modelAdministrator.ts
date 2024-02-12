import { Table, Model, PrimaryKey, AutoIncrement, Column } from "sequelize-typescript";

@Table({
    tableName: 'administradores',
    timestamps: false,
})
export class Administrator extends Model<Administrator>{

    @PrimaryKey
    @AutoIncrement
    @Column
    id: number;

    @Column
    correo: string;

    @Column
    contrasena: string;

}