// Application controller
import { Controller, Get, Post, Body, HttpException, HttpStatus, Param, Res } from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from '../entities/CreateApplication';
import { Response } from 'express';
import { InternalServerErrorException } from '@nestjs/common';


@Controller('api')
export class ApplicationsController {

    constructor(private readonly applicationsService: ApplicationsService) { }

    @Post('postular')
    async registerApplication(
        @Body() createApplicationDto: CreateApplicationDto
    ) {
        try {
            const application = await this.applicationsService.createApplication(createApplicationDto);
            return { message: 'Usuario Registrado Exitosamente', application, ok:true };
        } catch (error) {
            console.error(error);

            if (error instanceof HttpException) {
                // Re-lanza el mismo error HttpException que el servicio lanzó

                throw error;
            }
            throw new HttpException({ message: 'Usuario ya registrado en la Asignatura', error: error.message }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Get('estado/:rut')
    async getStateApplication(@Param('rut') rut: string, @Res() res: Response) {
        try {
            const application = await this.applicationsService.getStateApplication(rut);
            if (!application) {
                return res.status(HttpStatus.NOT_FOUND).json({ message: 'Application not found' });
            }
            return res.status(HttpStatus.OK).json(application);
        } catch (error) {

        }
    }

    @Get('requisitos')
    async getRequirements(@Res() res: Response) {
        try {
            const requirements = await this.applicationsService.getRequirements();
            return res.status(HttpStatus.OK).json(requirements);
        } catch (error) {
            throw new HttpException({ message: 'Error getting requirements', error }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Get('/profesor/:id')
    async getApplicationsByProfesor(@Param('id') profesorId: number) {
        try {
            return await this.applicationsService.getApplicationsByProfesorId(profesorId);
        } catch (error) {
            throw new InternalServerErrorException('Error al obtener las postulaciones.');
        }
    }

}
