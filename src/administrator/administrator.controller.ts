import { Controller, Get, Put, Post, Param, HttpException, HttpStatus, Body, Patch, Delete, Res } from '@nestjs/common';
import { AdministratorService } from './administrator.service';
import { ApplicationsService } from '../postulations/applications.service'
import { Response } from 'express';
import { CreateAsignaturaDto } from 'src/entities/CreateAsignatura';
import { create } from 'domain';

@Controller('api/adminin')
export class AdministratorController {

    constructor(
        private readonly administratorService: AdministratorService,
        private readonly applicationsService: ApplicationsService
    ) { }

    @Patch('asignar-profesor')
    async assingProfessor(
        @Body('profesorId') profesorId: number,
        @Body('rutPostulante') rutPostulante: string,
        @Body('asignatura') asignatura: number,
        @Body('estado') estado: string,
        @Body('id_postulante') id_postulante: number,
    ) {
        console.log("ID POSTULANTE: ", id_postulante);
        try {
            const postulant = await this.administratorService.assingProfessor(profesorId, rutPostulante, asignatura, estado, id_postulante);
            return { mensaje: "Selección actualizada con éxito", postulant };
        } catch (error) {
            console.error(error);
            throw new HttpException({ message: 'Error updating postulant selection', error }, HttpStatus.INTERNAL_SERVER_ERROR);
        }

    }

    @Patch('seleccionar')
    async updatePostulantSelection(
        @Body('estado') estado: string,
        @Body('id_postulante') id_postulante: number,
        @Body('id_profesor') id_profesor: null | number,
    ) {
        try {
            const postulant = await this.administratorService.updateSelection(estado, id_postulante, id_profesor);
            return { mensaje: "Selección actualizada con éxito", postulant };
        } catch (error) {
            console.error(error);
            throw new HttpException({ message: 'Error updating postulant selection', error }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Get('asignaturas')
    async getAsignaturas() {
        try {
            return await this.administratorService.getAsignaturas();
        } catch (error) {
            console.error(error);
            throw new HttpException({ message: 'Error getting asignaturas', error: error.message }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Post('asignaturas')
    async createAsignaturaHandler(@Body () CreateAsignaturaDto: CreateAsignaturaDto) {
        try {
            const newAsignatura = await this.administratorService.createAsignatura(CreateAsignaturaDto);
            return newAsignatura;
        } catch (error) {
            console.error(error);
            throw new HttpException({ message: 'Error creating asignatura', error: error.message }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Delete('asignaturas/:id')
    async deleteAsignaturaHandler(@Param('id') id: number) {
        try {
            await this.administratorService.deleteAsignatura(id);
            return { mensaje: `Asignatura con ID ${id} eliminada con éxito` };
        } catch (error) {
            console.error(error);
            throw new HttpException({ message: 'Error deleting asignatura', error: error.message }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Patch('asignaturas/:id')
    async updateAsignaturaHandler(@Body () createAsignaturaDto: CreateAsignaturaDto, @Param('id') id: number) {
        try {
            const updatedAsignatura = await this.administratorService.updateAsignatura(createAsignaturaDto, id);
            return updatedAsignatura;
        } catch (error) {
            console.error(error);
            throw new HttpException({ message: 'Error updating asignatura', error: error.message }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    @Get('periodo')
    async getPeriodo() {
        try {
            return await this.administratorService.getPeriodo();
        } catch (error) {
            console.error(error);
            throw new HttpException({ message: 'Error getting periodo', error }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Get('profesores')
    async getAllProfessors() {
        try {
            return await this.administratorService.getAllProfessors();
        } catch (error) {
            console.error(error);
            throw new HttpException({ message: 'Error getting professors', error }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Get()
    async getAll() {
        try {
            return await this.administratorService.getAllApplications();
        } catch (error) {
            console.error(error);
            throw new HttpException({ message: 'Error getting administrators', error }, HttpStatus.INTERNAL_SERVER_ERROR);

        }
    }
    @Get(':rut')
    async getPostulantByRut(@Param('rut') rut: string) {
        try {
            return await this.administratorService.getPostulantByRut(rut);
        } catch (error) {
            console.error(error);
            throw new HttpException({ message: 'Error getting postulant by rut', error }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Put(':rut')
    async updatePostulantState(
        @Param('rut') rut: string,
        @Body('estado') estado: string,
        @Body('observacion') observacion: string,
    ) {
        try {
            return await this.administratorService.updateState(rut, estado, observacion);

        } catch (error) {
            console.error(error);
            throw new HttpException({ message: 'Error updating postulant state', error }, HttpStatus.INTERNAL_SERVER_ERROR);
        }

    }



    @Post('requisitos')
    async createRequirementHandler(@Body('requisito') requisito: string) {
        try {
            const newRequirement = await this.administratorService.createRequirement({ requisito });
            return newRequirement;
        } catch (error) {
            console.error(error);
            throw new HttpException({ message: 'Error creating requirement', error: error.message }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    @Get('requisitos')
    async getRequirementsHandler() {
        try {
            return await this.administratorService.getRequirements();
        } catch (error) {
            console.error(error);
            throw new HttpException({ message: 'Error getting requirements', error: error.message }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Delete('requisito/:id')
    async deleteRequirement(@Param('id') id: number) {
        try {
            await this.administratorService.deleteRequirement(id);
            return { mensaje: `Requerimiento con ID ${id} eliminado con éxito` };
        } catch (error) {
            console.error(error);
            throw new HttpException({ message: 'Error deleting requirement', error: error.message }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Post('create-csv')
    async generateCsv(@Res() res: Response) {
        try {
            const csvContent = await this.administratorService.generateCsv();
            res.type('text/csv');
            res.attachment('example.csv');
            res.send(csvContent);
        } catch (error) {
            console.error(error);
            res.status(500).send('Error al generar el CSV');
        }
    }






}
