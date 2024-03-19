import { IsNumber, IsString, IsEmail, IsBoolean, IsDate, IsEnum, IsOptional } from 'class-validator';

export class CreateAsignaturaDto{
    @IsString()
    readonly nombre: string;

    @IsString()
    readonly codigo_carrera: string;
}