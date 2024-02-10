import { IsNumber, IsString, IsEmail, IsBoolean, IsIn } from 'class-validator';

export class CreateApplicationDto {
    @IsString()
    nombre!: string;
    
    @IsString()
    rut!: string;
    
    @IsEmail()
    correo!: string;
    
    @IsNumber()
    codigo_carrera!: number; // Coincide con el tipo en el modelo Sequelize
    
    @IsString()
    asignatura!: string;
    
    @IsNumber()
    nota!: number;
    
    @IsString()
    @IsIn(['Pendiente', 'Rechazado', 'Aprobado'])
    estado!: 'Pendiente' | 'Rechazado' | 'Aprobado';
    
    @IsBoolean()
    pre_aprobacion!: boolean;
}
