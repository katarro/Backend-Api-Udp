import { Module, Req } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Administrator } from 'src/entities/modelAdministrator';
import { AdministratorController } from './administrator.controller';
import { AdministratorService } from './administrator.service';
import { Application } from 'src/entities/modelApplication';
import { Requirement } from 'src/entities/modelRequirements';

@Module({
    imports: [
        SequelizeModule.forFeature([Administrator]),
        SequelizeModule.forFeature([Application]),
        SequelizeModule.forFeature([Requirement]),
    ],
    controllers: [AdministratorController],
    providers: [AdministratorService],
})
export class AdministratorModule { }
