import { Module, Req } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Administrator } from 'src/entities/modelAdministrator';
import { AdministratorController } from './administrator.controller';
import { AdministratorService } from './administrator.service';
import { Application } from 'src/entities/modelApplication';
import { Requirement } from 'src/entities/modelRequirements';
import { ApplicationsService } from 'src/postulations/applications.service';
import { Professor } from 'src/entities/modelProfessor';
import { Periodo } from 'src/entities/modelPeriodo';
import {Carrera} from '../entities/modelCarrera';
import {Asignatura} from '../entities/modelAsignatura';

@Module({
    imports: [
        SequelizeModule.forFeature([Administrator, Application, Requirement, Professor, Periodo, Carrera, Asignatura]),
    ],

    controllers: [AdministratorController],
    providers: [AdministratorService, ApplicationsService],
})
export class AdministratorModule { }
