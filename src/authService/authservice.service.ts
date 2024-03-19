// Authservice
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Administrator } from 'src/entities/modelAdministrator';
import { Professor } from '../entities/modelProfessor';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import * as sgMail from '@sendgrid/mail';
import { ConfigService } from '@nestjs/config';
import { send } from 'process';

@Injectable()
export class AuthserviceService {

    constructor(
        @InjectModel(Professor) private professorModel: typeof Professor,
        @InjectModel(Administrator) private administratorModel: typeof Administrator,
        private jwtService: JwtService,
        private configService: ConfigService
    ) {
        sgMail.setApiKey(this.configService.get<string>('API_EMAIL')); // Usa la clave API de SendGrid desde las variables de entorno
    }

 
    async validateUser(email: string, pass: string): Promise<any> {

        const profesor = await this.professorModel.findOne({ where: { correo: email } });
        if (profesor && (await bcrypt.compare(pass, profesor.contrasena))) {
            return { id: profesor.id, userType: 'profesor', email: profesor.correo };
        }

        const administrador = await this.administratorModel.findOne({ where: { correo: email } });
        if (administrador && (await bcrypt.compare(pass, administrador.contrasena))) {
            return { id: administrador.id, userType: 'administrador', email: administrador.correo };
        }

        return null;
    }

    async login(user: any) {
        const payload = { email: user.email, sub: user.id, userType: user.userType };
        return {
            token: this.jwtService.sign(payload),
            userType: user.userType,
            email: user.email,
            id_profesor: user.id
        };
    }

    async sendEmail(correo: string, nombre: string, contrasena: string) {

        const msg = {
            to: correo,
            from: 'rcastillor@utem.cl',
            subject: 'Bienvenido a la plataforma',
            text: `Hola ${nombre},\n\nTu cuenta ha sido creada. Tu contraseña es: ${contrasena}`,
        };

        try {
            await sgMail.send(msg);
        } catch (error) {
            console.error('Error:', error);
            throw new Error('Error al enviar el correo');
        }
    }

    async registerProfessor(nombre: string, correo: string, rut: string): Promise<string> {
        const contrasena = crypto.randomBytes(3).toString('hex');
        //const contrasena = '123';
        const contrasenaHash = await bcrypt.hash(contrasena, 10);

        try {
            await this.sendEmail(correo, nombre, contrasena);
            await this.professorModel.create({
                nombre: nombre,
                correo: correo,
                contrasena: contrasenaHash,
                rut: rut
            });

            return 'Usuario registrado y correo enviado';
        } catch (error) {
            console.error('Error: ', error);
            throw new Error('Error al registrar el profesor');
        }
    }

    async resetPassword(correo: string): Promise<string> {

        let usuario: Professor | Administrator = await this.professorModel.findOne({ where: { correo } });

        if (!usuario) {
            usuario = await this.administratorModel.findOne({ where: { correo } });
        }

        if (!usuario) {
            throw new Error('Usuario no encontrado');
        }

        const nuevaContrasena = crypto.randomBytes(3).toString('hex');
        const contrasenaHash = await bcrypt.hash(nuevaContrasena, 10);
        usuario.contrasena = contrasenaHash;
        await usuario.save();

        const msg = {
            to: correo,
            from: 'rcastillor@utem.cl',
            subject: 'Restablecimiento de contraseña',
            text: `Hola,\n\nTu nueva contraseña temporal es: ${nuevaContrasena}\nPor favor cambia esta contraseña lo antes posible.`,
        };

        await sgMail.send(msg);
        return 'Correo con la nueva contraseña temporal enviado';
    }

    async changePassword(correo: string, contrasenaActual: string, contrasenaNueva: string): Promise<string> {
        let usuario = await this.professorModel.findOne({ where: { correo } }) ||
            await this.administratorModel.findOne({ where: { correo } });

        if (!usuario) {
            throw new Error('Usuario no encontrado');
        }

        const contraseñaValida = await bcrypt.compare(contrasenaActual, usuario.contrasena);
        if (!contraseñaValida) {
            throw new Error('Contraseña actual incorrecta');
        }

        const nuevaContrasenaHash = await bcrypt.hash(contrasenaNueva, 10);
        usuario.contrasena = nuevaContrasenaHash;
        await usuario.save();

        return 'Contraseña actualizada con éxito';
    }


}
