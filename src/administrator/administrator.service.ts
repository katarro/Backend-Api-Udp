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
import {Carrera} from '../entities/modelCarrera';
import {Asignatura} from '../entities/modelAsignatura';
import { Op } from 'sequelize';
import Sequelize from 'sequelize'
@Injectable()
export class AdministratorService {

    constructor(
        @InjectModel(Administrator) private administratorModel: typeof Administrator,
        @InjectModel(Application) private application: typeof Application,
        @InjectModel(Requirement) private requirement: typeof Requirement,
        @InjectModel(Professor) private professorModel: typeof Professor,
        @InjectModel(Periodo) private periodoModel: typeof Periodo,
        @InjectModel(Carrera) private carreraModel: typeof Carrera,
        @InjectModel(Asignatura) private asignaturaModel: typeof Asignatura
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

    async updateSelection( estado:string, id_postulante: number, id_profesor: null | number): Promise<Application> {
        const postulant = await this.application.findOne({ where: { id_postulante } });

        if (!postulant) {
            console.log(`No se encontró un postulante con el id: ${id_postulante}`);
            throw new NotFoundException(`Postulante con id ${id_postulante} no encontrado.`);
        }
        postulant.estado = estado;
        postulant.id_profesor = id_profesor;

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
            include: [
                { model: Carrera, as: 'carrera' },
                { model: Asignatura, as: 'asignatura' }

                ],

             where: {
                estado: {
                  [Op.or]: [
                    EstadoPostulacion.EvaluadoPositivamente,
                    EstadoPostulacion.EvaluadoNegativamente
                  ]
                }
            },
        });

        const doc = new PDFDocument();
        const buffers: Buffer[] = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {});

        postulantes.forEach((postulante) => {
            let nombre_carrera;
            let nombre_asignatura;
            let codigo_carrera = postulante.id_carrera;
            let codigo_asignatura = postulante.id_asignatura;
            
            if(codigo_carrera === 1) nombre_carrera = 'Ingeniería Civil en Computación mención Informática';
            if(codigo_carrera === 2) nombre_carrera = 'Ingeniería en Informática';
            if(codigo_carrera === 3) nombre_carrera = 'Ingeniería Civil en Ciencias de Datos';

            if (codigo_asignatura === 1) nombre_asignatura = 'Introducción a la Ingeniería';
            if (codigo_asignatura === 2) nombre_asignatura = 'Algoritmos y Programación';
            if (codigo_asignatura === 3) nombre_asignatura = 'Estructura de Datos';

            if (codigo_asignatura === 4) nombre_asignatura = 'Lenguajes de Programación';
            if (codigo_asignatura === 5) nombre_asignatura = 'Bases de Datos'; 
            if (codigo_asignatura === 6) nombre_asignatura = 'Sistemas de Información';




            doc.text(`Nombre: ${postulante.nombre}`);
            doc.text(`Rut: ${postulante.rut}`);
            doc.text(`Carrera: ${nombre_carrera}`);
            doc.text(`Asignatura: ${nombre_asignatura}`);
            doc.text(`Evaluación de Profesor: ${postulante.estado}`);

            doc.text(`Fecha de postulación: ${postulante.fecha_postulacion}`);

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
