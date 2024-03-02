import {
    Table,
    Column,
    Model,
    DataType,
    PrimaryKey,
    AutoIncrement,
    ForeignKey,
    BelongsTo,
    HasMany,
} from 'sequelize-typescript';
import { Carrera } from './modelCarrera'; // Asegúrate de tener este modelo creado y correctamente importado

@Table
export class Asignatura extends Model<Asignatura> {
    @PrimaryKey
    @AutoIncrement
    @Column
    id: number;

    @Column
    nombre: string;

    @ForeignKey(() => Carrera)
    @Column
    id_carrera: number;

    @BelongsTo(() => Carrera)
    carrera: Carrera;
}