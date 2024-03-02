import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { Administrator } from 'src/entities/modelAdministrator';
import { InjectModel } from '@nestjs/sequelize';
import { Application } from 'src/entities/modelApplication';
import { Requirement } from 'src/entities/modelRequirements';
import * as PDFDocument from 'pdfkit';
import { Professor } from 'src/entities/modelProfessor';
import { create } from 'domain';
import { CreateApplicationDto, EstadoPostulacion } from 'src/entities/CreateApplication';
import { Periodo } from 'src/entities/modelPeriodo';
@Injectable()
export class AdministratorService {

    constructor(
        @InjectModel(Administrator) private administratorModel: typeof Administrator,
        @InjectModel(Application) private application: typeof Application,
        @InjectModel(Requirement) private requirement: typeof Requirement,
        @InjectModel(Professor) private professorModel: typeof Professor,
        @InjectModel(Periodo) private periodoModel: typeof Periodo,
    ) { }

    async assingProfessor(profesorId: number, rutPostulante: string, asignatura: number, estado: string): Promise<Application>{

        
        const postulante = await this.application.findOne({
                where: {
                    rut: rutPostulante,
                    id_asignatura: asignatura,
                },
            });

        if (!postulante) {throw new NotFoundException(`Postulante con RUT ${rutPostulante} no encontrado.`);}

        postulante.estado = estado;
        postulante.id_profesor = profesorId;
        postulante.fecha_asignacion = new Date();
        postulante.fecha_cambio_estado = new Date();

        await postulante.save();
        return postulante;

    }

    async getPeriodo() {
        return await this.periodoModel.findAll();
    }

    async getRequirements(): Promise<Requirement[]> {
        return await this.requirement.findAll();
    }

    async getAllProfessors(): Promise<Administrator[]> {
        return await this.professorModel.findAll();
    }

    
    async getAllApplications(): Promise<Application[]> {
        return await this.application.findAll();
    }

    async updateState(rut: string, estado: string, observacion: string): Promise<Application> {
        const postulante = await this.application.findOne({ where: { rut } });

        if (!postulante) {
            throw new NotFoundException(`Postulante con RUT ${rut} no encontrado.`);
        }

        postulante.estado = estado;
        await postulante.save();

        // Aquí deberías llamar a tu función de envío de correo electrónico, por ejemplo:
        // this.emailService.sendEmail(estado, postulante.correo);

        return postulante;
    }

    async getPostulantByRut(rut: string): Promise<Application> {
        try {
            return await this.application.findOne({ where: { rut } })
        } catch (error) {
            throw new NotFoundException(`Postulante con RUT ${rut} no encontrado.`);
        }
    }

    async updateSelection(rut: string, estado: string): Promise<Application> {
        const postulant = await this.application.findOne({ where: { rut } });
        if (!postulant) {
            console.log(`No se encontró un postulante con el RUT: ${rut}`);
            throw new NotFoundException(`Postulante con RUT ${rut} no encontrado.`);
        }
        postulant.estado = estado;

        await postulant.save();
        return postulant;
    }

    async createRequirement(requirementData: { requisito: string }): Promise<Requirement> {
        try {
            return await this.requirement.create(requirementData);
        } catch (error) {
            throw new HttpException(`No se pudo crear el requerimiento: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async deleteRequirement(id: number): Promise<void> {
        try {
            const requirement = await this.requirement.findByPk(id);
            if (!requirement) {
                throw new NotFoundException(`No se encontró el requerimiento con el ID: ${id}`);
            }
            await requirement.destroy();
        } catch (error) {
            throw new HttpException(`No se pudo eliminar el requerimiento: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    async generatePdf(): Promise<Buffer> {
        const postulantes = await this.application.findAll({
            include: ['carrera', 'asignatura'], // Asegúrate de que estas asociaciones estén definidas en tu modelo
            where: { estado: EstadoPostulacion.Asignado },
        });

        const doc = new PDFDocument();
        const buffers: Buffer[] = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {});

        postulantes.forEach((postulante) => {
            let evaluacionFinal = postulante.estado;
            // Suponiendo que cada asignatura tiene una propiedad 'nombre' que quieres mostrar
            let nombreAsignatura = postulante.estado;
            let nombreCarrera = postulante.id_carrera.toString();

            doc.text(`Nombre: ${postulante.nombre}`);
            doc.text(`Rut: ${postulante.rut}`);
            doc.text(`Correo: ${postulante.correo}`);
            doc.text(`Estado: ${postulante.estado}`);
            doc.text(`Fecha de postulación: ${postulante.fecha_postulacion.toDateString()}`);
            doc.text(`Asignatura: ${nombreAsignatura}`);
            doc.text(`Evaluación de Profesor: ${evaluacionFinal}`);
            doc.text(`Carrera: ${nombreCarrera}`);

            doc.moveDown();
        });

        doc.end();

        return new Promise((resolve, reject) => {
            doc.on('end', () => {
                const pdfBuffer = Buffer.concat(buffers);
                resolve(pdfBuffer);
            });
            doc.on('error', reject); // Manejar posibles errores
        });
    }
}
