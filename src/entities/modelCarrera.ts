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
import { Asignatura } from './modelAsignatura'; // Asegúrate de tener este modelo creado y correctamente importado
import { Application } from './modelApplication'; // Asegúrate de tener este modelo creado y correctamente importado

@Table
export class Carrera extends Model<Carrera> {
    @PrimaryKey
    @AutoIncrement
    @Column
    id: number;

    @Column
    nombre: string;

    @Column
    codigo: string;

    @HasMany(() => Asignatura)
    asignaturas: Asignatura[];

    @HasMany(() => Application)
    postulaciones: Application[];
}