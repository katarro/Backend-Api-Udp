import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Administrator } from 'src/entities/modelAdministrator';
import { Application } from 'src/entities/modelApplication';
import { Requirement } from 'src/entities/modelRequirements';
import { AuthserviceController } from './authservice.controller';
import { AuthserviceService } from './authservice.service';
import { JwtModule } from '@nestjs/jwt';
import { Professor } from '../entities/modelProfessor';
import { ConfigModule } from '@nestjs/config';

@Module({
    imports: [
        ConfigModule.forRoot(),
        SequelizeModule.forFeature([Administrator, Application, Requirement, Professor]),
        JwtModule.register({
            // secret: process.env.SECRET_KEY,
            secret: 'secret',
            signOptions: { expiresIn: '1h' },
        }),
        ConfigModule
    ],
    controllers: [AuthserviceController],
    providers: [AuthserviceService],
})
export class AuthserviceModule { }
