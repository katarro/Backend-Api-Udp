import { IsOptional, IsString } from 'class-validator';

export class CreateEmailServerDto {
  @IsString()
  correo: string;

  @IsString()
  nombre: string;

  @IsString()
  contraseña: string;

  @IsString()
  @IsOptional()
  rut?: string;
}
