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
            subject: 'Postulación para Ayudantía fue Aprobada',
            text: `Hola ${nombre},\n\nPostulación para la ayudantía en: ${asignatura} ha sido aprobada.`,
            html: `
            <div style="font-family: Arial, sans-serif; color: #333;">
                <h2>Hola ${nombre},</h2>
                <p>¡Tenemos excelentes noticias!</p>
                <p>Nos complace informarte que tu postulación para la ayudantía en la asignatura <strong>${asignatura}</strong> ha sido <span style="color: #27ae60;"><strong>aprobada</strong></span>.</p>
                <p>Pronto recibirás más detalles sobre los siguientes pasos a seguir.</p>
                <p>Gracias por tu esfuerzo y dedicación.</p>
                <hr>
                <p><strong>Escuela de Informática - UTEM</strong></p>
                <p><a href="http://informatica.utem.cl/">http://informatica.utem.cl/</a></p>
                <p>Fono: 56 22787 7100</p>
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
        doc.on('end', () => { });

        postulantes.forEach((postulante) => {
            let nombre_carrera;
            let nombre_asignatura;
            let codigo_carrera = postulante.id_carrera;
            let codigo_asignatura = postulante.id_asignatura;

            if (codigo_carrera === 1) nombre_carrera = 'Ingeniería Civil en Computación mención Informática';
            if (codigo_carrera === 2) nombre_carrera = 'Ingeniería en Informática';
            if (codigo_carrera === 3) nombre_carrera = 'Ingeniería Civil en Ciencias de Datos';

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
