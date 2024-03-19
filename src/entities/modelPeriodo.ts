import { AutoIncrement, Column, Model, PrimaryKey, Table } from "sequelize-typescript";

@Table({
  tableName: 'periodo',
  timestamps: false
})

@Table
export class Periodo extends Model<Periodo> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column
  nombre: string;

  @Column
  fecha_desde: Date;

  @Column
  fecha_hasta: Date;

  @Column
  esta_activo: boolean;
}
