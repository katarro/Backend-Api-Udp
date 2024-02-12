// AuthController
import { Body, Controller, HttpStatus, Post, Res } from '@nestjs/common';
import { Administrator } from '../entities/modelAdministrator';
import { AuthserviceService } from './authservice.service';
import { Response } from 'express';

@Controller('api')
export class AuthserviceController {

    constructor(private authService: AuthserviceService) { }

    @Post('login')
    async login(@Body() body: { email: string; password: string }, @Res() res: Response) {
        try {
            const user = await this.authService.validateUser(body.email, body.password);
            if (!user) {
                return res.status(HttpStatus.UNAUTHORIZED).send('Credenciales incorrectas');
            }

            const result = await this.authService.login(user);
            return res.json(result);
        } catch (error) {
            console.error('Error en el servidor:', error);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Error en el servidor');
        }
    }

    @Post('register-profesor')
    async registerProfessor(@Body() body: { nombre: string; correo: string }, @Res() res: Response) {
        try {
            const message = await this.authService.registerProfessor(body.nombre, body.correo);
            res.status(HttpStatus.OK).send(message);
        } catch (error) {
            console.error('Error en el servidor:', error);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Error al procesar la solicitud');
        }
    }

    @Post('restablecer')
    async resetPassword(@Body() body: { correo: string }, @Res() res: Response) {
        try {
            const message = await this.authService.resetPassword(body.correo);
            res.status(HttpStatus.OK).send(message);
        } catch (error) {
            if (error.message === 'Usuario no encontrado') {
                res.status(HttpStatus.NOT_FOUND).send(error.message);
            } else {
                console.error('Error en el servidor:', error);
                res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Error al procesar la solicitud');
            }
        }
    }

    @Post('cambiar-contrasena')
    async changePassword(@Body() body: { correo: string; contrasenaActual: string; contrasenaNueva: string }, @Res() res: Response) {
        try {
            const message = await this.authService.changePassword(body.correo, body.contrasenaActual, body.contrasenaNueva);
            res.status(HttpStatus.OK).send(message);
        } catch (error) {
            if (error.message === 'Usuario no encontrado') {
                res.status(HttpStatus.NOT_FOUND).send(error.message);
            } else if (error.message === 'Contraseña actual incorrecta') {
                res.status(HttpStatus.UNAUTHORIZED).send(error.message);
            } else {
                console.error('Error en el servidor:', error);
                res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Error al procesar la solicitud');
            }
        }
    }

}
