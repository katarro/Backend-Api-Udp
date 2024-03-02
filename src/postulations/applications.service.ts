//ApplicationsService
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateApplicationDto } from '../entities/CreateApplication';
import { InjectModel } from '@nestjs/sequelize';
import { Application } from '../entities/modelApplication';
import { Requirement } from '../entities/modelRequirements';

@Injectable()
export class ApplicationsService {

    constructor(
        @InjectModel(Application) private applicationModel: typeof Application,
        @InjectModel(Requirement) private requirementModel: typeof Requirement
    ) { }

    async createApplication(createApplicationDto: CreateApplicationDto) {
        console.log(createApplicationDto)
        const { rut, id_asignatura } = createApplicationDto;

        // Primero, verifica si el usuario ya ha postulado a la misma asignatura
        const existingApplication = await this.applicationModel.findOne({
            where: { rut, id_asignatura }
        });

        // Si existe una postulación previa, lanza una excepción
        if (existingApplication) {
            throw new HttpException(
                'El usuario ya ha postulado a esta asignatura',
                HttpStatus.BAD_REQUEST
            );
        }

        // Si no hay una postulación previa, procede a crear una nueva
        try {
            return await this.applicationModel.create(createApplicationDto);
        } catch (error) {
            // Aquí puedes manejar errores específicos de la creación
            throw new HttpException('Error creating application', HttpStatus.BAD_REQUEST);
        }
    }


    async getStateApplication(rut: string) {
        try {
            return await this.applicationModel.findOne({ where: { rut } });
        } catch (error) {
            throw new HttpException('Error getting application', HttpStatus.BAD_REQUEST);
        }
    }

    async getRequirements() {
        try {
            return await this.requirementModel.findAll();

        } catch (error) {
            throw new HttpException('Error getting requirements', HttpStatus.BAD_REQUEST);
        }
    }
}
