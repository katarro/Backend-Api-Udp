// Application controller
import { Controller, Get, Post, Body, HttpException, HttpStatus, Param, Res } from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from '../entities/CreateApplication';
import { Response } from 'express';

@Controller('api')
export class ApplicationsController {

    constructor(private readonly applicationsService: ApplicationsService) { }

    @Post('postular')
    async registerApplication(
        @Body() createApplicationDto: CreateApplicationDto
    ) {
        try {
            // create es una función que se encuentra en el archivo applications.service.ts
            const application = await this.applicationsService.createApplication(createApplicationDto);
            return { message: 'Application successfully registered', application };
        } catch (error) {
            throw new HttpException({ message: 'Error registering application', error }, HttpStatus.INTERNAL_SERVER_ERROR);
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

}
