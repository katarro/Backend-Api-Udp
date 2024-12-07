import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { ApplicationsModule } from './postulations/applications.module';
import { AdministratorModule } from './administrator/administrator.module';
import { AuthserviceModule } from './authService/authservice.module';
import { Periodo } from './entities/modelPeriodo';
import { MailerModule } from '@nestjs-modules/mailer';
import { PugAdapter } from '@nestjs-modules/mailer/dist/adapters/pug.adapter';

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

    MailerModule.forRoot({
      transport: {
        host: String(process.env.MAIL_HOST),
        port: Number(process.env.MAIL_PORT),
        secure: false,
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASS,
        },
      },
      template: {
        dir: __dirname + './template/notification',
        adapter: new PugAdapter({ inlineCssEnabled: true }),
        options: {
          strict: true,
        },
      },
    }),

    ApplicationsModule,
    AdministratorModule,
    Periodo,
    AuthserviceModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
