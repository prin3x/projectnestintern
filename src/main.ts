import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { useContainer } from 'class-validator';
import * as helmet from 'helmet';
import { ConfigService } from 'nestjs-config';
import { appLoggerDevelopment, appLoggerProduction } from './app/app.logger';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  let appLogger = appLoggerDevelopment;

  if (configService.get('app.environment') !== 'development')
    appLogger = appLoggerProduction;

  app.useLogger(appLogger);
  app.use(helmet());
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    })
  );

  const logger = new Logger('NestApplication');
  const cors = configService.get('app.cors');
  const name = configService.get('app.name');
  const version = configService.get('app.version');
  const environment = configService.get('app.environment');
  const port = configService.get('app.port');

  if (cors) app.enableCors();

  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  await app.listen(port, () => {
    logger.log(`${name} - ${version}`);
    logger.log(`On ${environment} environment`);
    logger.log(`Enable CORS ${cors}`);
    logger.log(`Started on port ${port}`);
  });
}
bootstrap();
