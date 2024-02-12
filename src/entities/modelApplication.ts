import { Table, Column, Model, PrimaryKey, AutoIncrement } from 'sequelize-typescript';

@Table({
    tableName: 'postulantes',
    timestamps: false,
})
export class Application extends Model<Application> {
    static find(arg0: { where: { rut: string; }; }) {
        throw new Error('Method not implemented.');
    }

    @PrimaryKey
    @AutoIncrement
    @Column
    id: number;

    @Column
    nombre: string;

    @Column
    rut: string;

    @Column
    correo: string;

    @Column
    codigo_carrera: number;

    @Column
    asignatura: string;

    @Column
    nota:number;

    @Column({ defaultValue: 'Pendiente' })
    estado: string;

    @Column({ defaultValue: false })
    pre_aprobacion: boolean;

    @Column
    observacion: string;

    @Column
    fecha_postulacion: Date;
}
