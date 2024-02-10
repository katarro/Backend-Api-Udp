// Application module 
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Application } from '../entities/modelApplication';
import { ApplicationsController } from './applications.controller';
import { ApplicationsService } from './applications.service';
import { Requirement } from '../entities/modelRequirements';

@Module({
    // Importar los modelos de sequelize
    imports: [SequelizeModule.forFeature([Application]),SequelizeModule.forFeature([Requirement])],
    controllers: [ApplicationsController],
    providers: [ApplicationsService],
})
export class ApplicationsModule {}
