import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { Administrator } from 'src/entities/modelAdministrator';
import { InjectModel } from '@nestjs/sequelize';
import { Application } from 'src/entities/modelApplication';
import { Requirement } from 'src/entities/modelRequirements';
import * as PDFDocument from 'pdfkit';
import { Professor } from 'src/entities/modelProfessor';
import { create } from 'domain';
import { CreateApplicationDto, EstadoPostulacion } from 'src/entities/CreateApplication';
import {CreateAsignaturaDto} from 'src/entities/CreateAsignatura';
import { Periodo } from 'src/entities/modelPeriodo';
import { Carrera } from '../entities/modelCarrera';
import { Asignatura } from '../entities/modelAsignatura';
import { Op } from 'sequelize';
import Sequelize from 'sequelize'
import * as sgMail from '@sendgrid/mail';

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

    async deleteAsignatura(id: number) {
        try {
            const asignatura = await this.asignaturaModel.findByPk(id);
            if (!asignatura) {
                throw new NotFoundException(`No se encontró la asignatura con el ID: ${id}`);
            }
            await asignatura.destroy();
        } catch (error) {
            throw new HttpException(`Error al eliminar la asignatura: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async updateAsignatura(body: CreateAsignaturaDto, id: number) {
        try {
            const asignatura = await this.asignaturaModel.findByPk(id);
            if (!asignatura) {
                throw new NotFoundException(`No se encontró la asignatura con el ID: ${id}`);
            }
            await asignatura.update(body);
            return asignatura;
        } catch (error) {
            throw new HttpException(`Error al actualizar la asignatura: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async createAsignatura(body: CreateAsignaturaDto) {
        try {
            return await this.asignaturaModel.create(body);
        } catch (error) {
            throw new HttpException(`Error al crear la asignatura: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getAsignaturas(){
        try {
            const asignaturas =  await this.asignaturaModel.findAll();
            console.log(asignaturas);
            return asignaturas;
            
        } catch (error) {
            throw new HttpException(`Error al obtener las asignaturas: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);            
        }
    }

    selectionAsignatura(id_asignatura: number): string {
        const asignaturas: { [key: number]: string } = {
            1: "Introducción a la Ingeniería",
            2: "Algoritmos y Programación",
            3: "Estructura de Datos",
            4: "Lenguajes de Programación",
            5: "Bases de Datos",
            6: "Sistemas de Información"
        };

        return asignaturas[id_asignatura] || "Asignatura no encontrada";
    }

    async sendEmail(correo: string, nombre: string, asignatura: string) {

        const msg = {
            to: correo,
            from: 'rcastillor@utem.cl',
            subject: 'Postulación de Ayudantia',
            text: `Hola ${nombre},\n\nPostulación de ayudantía en: ${asignatura} ha sido ha sido Aprobada`,
            html: `
            <div style="font-family: Arial, sans-serif; color: #333;">
                <h2>Hola ${nombre},</h2>
                <p>¡Tenemos excelentes noticias!</p>
                <p>Tu postulación de ayudantía para la asignatura <strong>${asignatura}</strong> ha sido <span style="color: #27ae60;"><strong>aprobada</strong></span>.</p>
                <p>Pronto recibirás más detalles sobre los siguientes pasos a seguir.</p>
                <hr>
                <p>Gracias por tu esfuerzo y dedicación,</p>
                <p><strong>Escuela de Ingenieria - UTEM</strong></p>
            </div>
        `,

        };

        try {
            await sgMail.send(msg);
        } catch (error) {
            throw new Error(`Error al enviar el correo ${error}`);
        }
    }


    async assingProfessor(profesorId: number, rutPostulante: string, asignatura: number, estado: string, id_postulante: number): Promise<Application> {


        const postulante = await this.application.findOne({
            where: {
                rut: rutPostulante,
                id_asignatura: asignatura,
                id_postulante: id_postulante
            },
        });

        if (!postulante) { throw new NotFoundException(`Postulante con RUT ${rutPostulante} no encontrado.`); }

        postulante.estado = estado;
        postulante.id_profesor = profesorId;
        postulante.fecha_asignacion = new Date();
        postulante.fecha_cambio_estado = new Date();

        let asignaturaNombre = this.selectionAsignatura(asignatura);

        if (estado === EstadoPostulacion.Asignado) {

            this.sendEmail(postulante.correo, postulante.nombre, asignaturaNombre);
        }

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

        return postulante;
    }

    async getPostulantByRut(rut: string): Promise<Application> {
        try {
            return await this.application.findOne({ where: { rut } })
        } catch (error) {
            throw new NotFoundException(`Postulante con RUT ${rut} no encontrado.`);
        }
    }



    async updateSelection(estado: string, id_postulante: number, id_profesor: null | number): Promise<Application> {
        const postulant = await this.application.findOne({ where: { id_postulante } });
        if (!postulant) {
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


    async generateCsv(): Promise<string> {
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

        let csvContent = 'Nombre,RUT,Carrera,Asignatura,Evaluación,Fecha de Postulación\n';

        postulantes.forEach((postulante) => {
            const nombre_carrera = this.getNombreCarrera(postulante.id_carrera);
            const nombre_asignatura = this.getNombreAsignatura(postulante.id_asignatura);

            const fechaPostulacion = new Date(postulante.fecha_postulacion);

            const fechaPostulacionStr = fechaPostulacion instanceof Date && !isNaN(fechaPostulacion.valueOf())
                ? fechaPostulacion.toISOString().split('T')[0]
                : '';

            const row = [
                `"${postulante.nombre}"`,
                postulante.rut,
                `"${nombre_carrera}"`,
                `"${nombre_asignatura}"`,
                postulante.estado,
                `"${fechaPostulacionStr}"` 
            ].join(',');

            csvContent += row + '\n';
        });

        return csvContent;
    }

    private getNombreCarrera(id_carrera: number): string {
        switch (id_carrera) {
            case 1: return 'Ingeniería Civil en Computación mención Informática';
            case 2: return 'Ingeniería en Informática';
            case 3: return 'Ingeniería Civil en Ciencias de Datos';
            default: return 'Carrera no encontrada';
        }
    }

    private getNombreAsignatura(id_asignatura: number): string {
        switch (id_asignatura) {
            case 1: return 'Introducción a la Ingeniería';
            case 2: return 'Algoritmos y Programación';
            case 3: return 'Estructura de Datos';
            case 4: return 'Lenguajes de Programación';
            case 5: return 'Bases de Datos';
            case 6: return 'Sistemas de Información';
            default: return 'Asignatura no encontrada';
        }
    }
}
