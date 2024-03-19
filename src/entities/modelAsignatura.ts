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
import { IsNotEmpty } from 'class-validator';

@Table({
    tableName: 'asignatura',
    timestamps: false,
})
@Table
export class Asignatura extends Model<Asignatura> {
    @PrimaryKey
    @AutoIncrement
    @Column
    @IsNotEmpty()
    id: number;

    @Column
    @IsNotEmpty()
    
    nombre: string;

    @ForeignKey(() => Carrera)
    @Column
    @IsNotEmpty()
    codigo_carrera: string;

    @BelongsTo(() => Carrera)
    carrera: Carrera;
}