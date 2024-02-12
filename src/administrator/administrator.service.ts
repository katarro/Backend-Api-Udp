import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { Administrator } from 'src/entities/modelAdministrator';
import { InjectModel } from '@nestjs/sequelize';
import { Application } from 'src/entities/modelApplication';
import { Requirement } from 'src/entities/modelRequirements';
import * as PDFDocument from 'pdfkit';

@Injectable()
export class AdministratorService {

    constructor(
        @InjectModel(Administrator) private administratorModel: typeof Administrator,
        @InjectModel(Application) private application: typeof Application,
        @InjectModel(Requirement) private requirement: typeof Requirement
    ) { }

    async getAll(): Promise<Administrator[]> {
        return await this.administratorModel.findAll();
    }

    async updateState(rut: string, estado: string, observacion: string): Promise<Application> {
        const postulante = await this.application.findOne({ where: { rut } });

        if (!postulante) {
            throw new NotFoundException(`Postulante con RUT ${rut} no encontrado.`);
        }

        postulante.estado = estado;
        postulante.observacion = observacion;
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

    async updateSelection(rut: string, pre_aprobacion: boolean): Promise<Application> {
        const postulant = await this.application.findOne({ where: { rut } });
        if (!postulant) {
            console.log(`No se encontró un postulante con el RUT: ${rut}`);
            throw new NotFoundException(`Postulante con RUT ${rut} no encontrado.`);
        }

        postulant.pre_aprobacion = pre_aprobacion;
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
            where: { pre_aprobacion: true },
        });

        const doc = new PDFDocument();
        const buffers = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
            let pdfData = Buffer.concat(buffers);
            return pdfData;
        });

        postulantes.forEach((postulante) => {
            // Asegúrate de cambiar 'tu_columna' por el nombre real de la columna que deseas imprimir
            var evaluacionFinal;
            var carrera;
            postulante.dataValues.pre_aprobacion ? (evaluacionFinal = "Si") : "No";

            if (postulante.dataValues.codigo_carrera === 21030) {
                carrera = " Ingeniería en Informática";
            }
            if (postulante.dataValues.codigo_carrera === 21041) {
                carrera = " Ingeniería Civil en Computación mención Informática";
            }
            if (postulante.dataValues.codigo_carrera === 21049) {
                carrera = " Ingeniería Civil en Ciencias de Datos";
            }

            doc.text("Nombre: " + postulante.dataValues.nombre);
            doc.text("Rut: " + postulante.dataValues.rut);
            doc.text("Asignatura: " + postulante.dataValues.asignatura);
            doc.text("Evaluación de Profesor: " + evaluacionFinal);
            doc.text(
                "Carrera: " + postulante.dataValues.codigo_carrera + "-" + carrera
            );

            doc.moveDown();
        });

        doc.end();
        return new Promise((resolve, reject) => {
            doc.on('end', () => {
                const pdfBuffer = Buffer.concat(buffers);
                resolve(pdfBuffer);
            });
        });
    }

}
