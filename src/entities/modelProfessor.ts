import { AutoIncrement, Column, Model, PrimaryKey, Table } from "sequelize-typescript";

@Table({
    tableName: 'profesor',
    timestamps: false
})
export class Professor extends Model<Professor> {
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

    @Column
    rut: string;
  }
  