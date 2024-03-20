## Endpoints

```

// POSTULACIONES
router.post("/api/postular", postulacionesRoutes);\n
router.get("/api/estado/:rut", postulacionesRoutes);
router.get("/api/requisitos", postulacionesRoutes);

// ADMINISTRADOR
#router.get("/api/adminin", adminRoutes);
#router.get("/api/adminin/:rut", adminRoutes);
#router.put("/api/adminin/:rut", adminRoutes);
#router.patch("/api/adminin/seleccionar",adminRoutes);
#router.post("/api/adminin/requisitos", adminRoutes);
#router.delete("/api/adminin/requisito/:id", adminRoutes);
#router.post("/api/create-pdf",adminRoutes);
# router.get("/api/adminin/asignaturas", adminRoutes);

// LOGIN
#router.post("/api/login", login);  
#router.post("/api/register-profesor", sendEmail);  
#router.post("/api/restablecer", restablecerPassword);  
#router.patch("/api/cambiar-contrasena",cambiarPassword);  
```



## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://kamilmysliwiec.com)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](LICENSE).
