import {
    Model,
    Table,
    Column,
    DataType,
    PrimaryKey,
    AutoIncrement,
    ForeignKey,
    BelongsTo
} from 'sequelize-typescript';
import { Carrera } from './modelCarrera'; 
import { Asignatura } from './modelAsignatura'; 
import { Professor } from './modelProfessor'; 
import { Periodo } from './modelPeriodo'; 

@Table({
    tableName: 'postulacion',
    timestamps: false,
})
export class Application extends Model<Application> {
    @PrimaryKey
    @AutoIncrement
    @Column
    id_postulante: number;
  
    @Column
    nombre: string;
  
    @Column
    rut: string;
  
    @Column
    correo: string;
  
    @Column
    estado: string;
  
    @Column
    fecha_postulacion: Date;
  
    @Column
    fecha_asignacion: Date;
  
    @Column
    fecha_cambio_estado: Date;

    @Column
    comentario: string;
  
    @ForeignKey(() => Carrera)
    @Column
    id_carrera: number;
  
    @ForeignKey(() => Asignatura)
    @Column
    id_asignatura: number;
  
    @ForeignKey(() => Professor)
    @Column
    id_profesor: number;
  
    @ForeignKey(() => Periodo)
    @Column
    id_periodo: number;

    @BelongsTo(() => Carrera, { as: 'carrera' })
    carrera: Carrera;

    @BelongsTo(() => Asignatura, {as: 'asignatura'})
    asignatura: Asignatura;

    
  
}