import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { ApplicationsModule } from './postulations/applications.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: process.env.POSTGRESQL_ADDON_HOST,
      port: +process.env.POSTGRESQL_ADDON_PORT,
      username: process.env.POSTGRESQL_ADDON_USER,
      password: process.env.POSTGRESQL_ADDON_PASSWORD,
      database: process.env.POSTGRESQL_ADDON_DB,
      autoLoadModels: true,
      synchronize: true,
      pool: {
        max: 3, 
        min: 0, 
        acquire: 30000,  
        idle: 10000, 
      },
    }),
    // Agregar los modulos de otros servicios
    ApplicationsModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
