import { IsNumber, IsString, IsEmail, IsBoolean, IsDate, IsEnum, IsOptional } from 'class-validator';

export enum EstadoPostulacion {
    Postulando = 'Postulando',
    Asignado = 'Asignado a',
    EvaluadoPositivamente = 'Evaluado Positivamente',
    EvaluadoNegativamente = 'Evaluado Negativamente',
}

export class CreateApplicationDto {
    @IsString()
    readonly nombre: string;
  
    @IsString()
    readonly rut: string;
  
    @IsEmail()
    readonly correo: string;
  
    @IsString()
    readonly estado: string;
  
    @IsDate()
    readonly fecha_postulacion: Date;
  
    @IsOptional()
    @IsDate()
    readonly fecha_asignacion?: Date;
  
    @IsOptional()
    @IsDate()
    readonly fecha_cambio_estado?: Date;
  
    @IsNumber()
    readonly id_carrera: number;
  
    @IsNumber()
    readonly id_asignatura: number;
  
    @IsOptional()
    @IsNumber()
    readonly id_profesor?: number;
  
    @IsNumber()
    readonly id_periodo: number;
}
