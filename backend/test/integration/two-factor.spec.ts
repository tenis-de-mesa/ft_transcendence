import * as request from 'supertest';
import * as session from 'express-session';
import * as passport from 'passport';
import {
  ExecutionContext,
  HttpStatus,
  INestApplication,
  UnauthorizedException,
  ValidationPipe,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { isBase64 } from 'class-validator';
import { authenticator } from 'otplib';
import { TypeOrmConfigModule } from '../../src/config/typeorm-config.module';
import { UsersModule } from '../../src/users/users.module';
import { AuthModule } from '../../src/auth/auth.module';
import { TfaModule } from '../../src/auth/tfa/tfa.module';
import { AuthenticatedGuard } from '../../src/auth/guards';
import { AuthProvider, UserEntity } from '../../src/core/entities';
import { UsersService } from '../../src/users/users.service';
import { EventEmitterModule } from '@nestjs/event-emitter';

describe('Two-factor authentication Integration Test Suite', () => {
  let app: INestApplication;
  let usersService: UsersService;
  let mockUser: UserEntity;
  let tfaSecret: string;

  describe('With authenticated user', () => {
    beforeAll(async () => {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [
          EventEmitterModule.forRoot(),
          TypeOrmConfigModule,
          UsersModule,
          AuthModule,
          TfaModule,
        ],
      })
        .overrideGuard(AuthenticatedGuard)
        .useValue({
          canActivate: async (context: ExecutionContext) => {
            const request = context.switchToHttp().getRequest();
            request.user = await usersService.getUserById(mockUser.id);
            return true;
          },
        })
        .compile();
      app = moduleFixture.createNestApplication();

      app.use(
        session({
          secret: process.env.SESSION_SECRET,
          resave: false,
          saveUninitialized: false,
        }),
      );
      app.use(passport.initialize());
      app.use(passport.session());

      app.useGlobalPipes(new ValidationPipe());

      usersService = app.get(UsersService);

      await app.init();
    });

    afterAll(async () => {
      await app.close();
    });

    beforeEach(async () => {
      mockUser = await usersService.createUser({
        login: 'test',
        intraId: 42,
        provider: AuthProvider.INTRA,
      });
    });

    afterEach(async () => {
      await usersService.deleteUser(mockUser.id);
    });

    describe('GET /auth/tfa/generate', () => {
      it('should generate a QR code for enabling TFA', async () => {
        // Arrange

        // Act
        const response = await request(app.getHttpServer()).get(
          '/auth/tfa/generate',
        );

        // Assert
        expect(response.status).toBe(HttpStatus.OK);
        expect(response.body).toHaveProperty('secret');
        tfaSecret = response.body.secret;
        expect(response.body).toHaveProperty('qrCode');
        const qrCode = response.body.qrCode;
        expect(tfaSecret).toMatch(/^[A-Z0-9]{16}$/);
        expect(isBase64(qrCode)).toBe(true);
      });

      it('should not generate a QR code if TFA is already enabled', async () => {
        // Arrange
        await usersService.updateUser(mockUser.id, {
          tfaEnabled: true,
        });

        // Act
        const response = await request(app.getHttpServer()).get(
          '/auth/tfa/generate',
        );

        // Assert
        expect(response.status).toBe(HttpStatus.FORBIDDEN);
        expect(response.body.message).toBe(
          'Two factor authentication is already enabled',
        );
      });
    });

    describe('POST /auth/tfa/enable', () => {
      beforeEach(async () => {
        const generateResponse = await request(app.getHttpServer()).get(
          '/auth/tfa/generate',
        );

        tfaSecret = generateResponse.body.secret;
      });

      it('should enable TFA and return recovery codes', async () => {
        // Arrange
        const otp = authenticator.generate(tfaSecret);

        // Act
        const response = await request(app.getHttpServer())
          .post('/auth/tfa/enable')
          .send({ tfaCode: otp });

        const user = await usersService.getUserById(mockUser.id);

        // Assert
        expect(response.status).toBe(HttpStatus.CREATED);
        expect(user.tfaEnabled).toBe(true);
        expect(response.body).toHaveLength(12);
        expect(Array.isArray(response.body)).toBe(true);
        response.body.forEach((code: string) => {
          expect(code.length).toBe(12);
          expect(/^[0-9A-Fa-f]+$/.test(code)).toBe(true);
        });
      });

      it('should not enable TFA if code is invalid', async () => {
        // Arrange
        const tfaCode = '000000';

        // Act
        const response = await request(app.getHttpServer())
          .post('/auth/tfa/enable')
          .send({ tfaCode });

        const user = await usersService.getUserById(mockUser.id);

        // Assert
        expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
        expect(user.tfaEnabled).toBe(false);
        expect(response.body.message).toBe(
          'Invalid two factor authentication code',
        );
      });

      it('should not enable TFA if code is not provided', async () => {
        // Arrange

        // Act
        const response = await request(app.getHttpServer()).post(
          '/auth/tfa/enable',
        );

        const user = await usersService.getUserById(mockUser.id);

        // Assert
        expect(response.status).toBe(HttpStatus.BAD_REQUEST);
        expect(user.tfaEnabled).toBe(false);
        expect(response.body.message[0]).toBe('tfaCode should not be empty');
        expect(response.body.message[1]).toBe('tfaCode must be a string');
      });

      it('should not enable TFA if TFA is already enabled', async () => {
        // Arrange
        await usersService.updateUser(mockUser.id, {
          tfaEnabled: true,
        });

        // Act
        const response = await request(app.getHttpServer())
          .post('/auth/tfa/enable')
          .send({ tfaCode: authenticator.generate(tfaSecret) });

        // Assert
        expect(response.status).toBe(HttpStatus.FORBIDDEN);
        expect(response.body.message).toBe(
          'Two factor authentication is already enabled',
        );
      });

      it('should not enable TFA if TFA secret is not generated', async () => {
        // Arrange
        await usersService.updateUser(mockUser.id, {
          tfaSecret: null,
        });

        // Act
        const response = await request(app.getHttpServer())
          .post('/auth/tfa/enable')
          .send({ tfaCode: authenticator.generate(tfaSecret) });

        // Assert
        expect(response.status).toBe(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toBe(
          'Two factor authentication secret must be generated first',
        );
      });
    });

    describe('POST /auth/tfa/disable', () => {
      beforeEach(async () => {
        const generateResponse = await request(app.getHttpServer()).get(
          '/auth/tfa/generate',
        );

        tfaSecret = generateResponse.body.secret;

        await request(app.getHttpServer())
          .post('/auth/tfa/enable')
          .send({ tfaCode: authenticator.generate(tfaSecret) });
      });

      it('should disable TFA', async () => {
        // Arrange
        const otp = authenticator.generate(tfaSecret);

        // Act
        const response = await request(app.getHttpServer())
          .post('/auth/tfa/disable')
          .send({ tfaCode: otp });

        const user = await usersService.getUserById(mockUser.id);

        // Assert
        expect(response.status).toBe(HttpStatus.CREATED);
        expect(user.tfaEnabled).toBe(false);
        expect(user.tfaSecret).toBe(null);
        expect(user.tfaRecoveryCodes).toBe(null);
      });

      it('should not disable TFA if code is invalid', async () => {
        // Arrange
        const tfaCode = '000000';

        // Act
        const response = await request(app.getHttpServer())
          .post('/auth/tfa/disable')
          .send({ tfaCode });

        const user = await usersService.getUserById(mockUser.id);

        // Assert
        expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
        expect(user.tfaEnabled).toBe(true);
        expect(response.body.message).toBe(
          'Invalid two factor authentication code',
        );
      });

      it('should not disable TFA if code is not provided', async () => {
        // Arrange

        // Act
        const response = await request(app.getHttpServer()).post(
          '/auth/tfa/disable',
        );

        const user = await usersService.getUserById(mockUser.id);

        // Assert
        expect(response.status).toBe(HttpStatus.BAD_REQUEST);
        expect(user.tfaEnabled).toBe(true);
        expect(response.body.message[0]).toBe('tfaCode should not be empty');
        expect(response.body.message[1]).toBe('tfaCode must be a string');
      });

      it('should not disable TFA if TFA is already disabled', async () => {
        // Arrange
        await usersService.updateUser(mockUser.id, {
          tfaEnabled: false,
        });

        // Act
        const response = await request(app.getHttpServer())
          .post('/auth/tfa/disable')
          .send({ tfaCode: authenticator.generate(tfaSecret) });

        // Assert
        expect(response.status).toBe(HttpStatus.FORBIDDEN);
        expect(response.body.message).toBe(
          'Two factor authentication is disabled',
        );
      });
    });

    describe('POST /auth/tfa/authenticate', () => {
      beforeEach(async () => {
        const generateResponse = await request(app.getHttpServer()).get(
          '/auth/tfa/generate',
        );

        tfaSecret = generateResponse.body.secret;

        await request(app.getHttpServer())
          .post('/auth/tfa/enable')
          .send({ tfaCode: authenticator.generate(tfaSecret) });

        await request(app.getHttpServer()).get('/auth/logout');
      });

      it('should authenticate with TFA', async () => {
        // Arrange
        const otp = authenticator.generate(tfaSecret);

        // Act
        const response = await request(app.getHttpServer())
          .post('/auth/tfa/authenticate')
          .send({ tfaCode: otp });

        // Assert
        expect(response.status).toBe(HttpStatus.CREATED);
      });

      it('should not authenticate with TFA if code is invalid', async () => {
        // Arrange
        const tfaCode = '000000';

        // Act
        const response = await request(app.getHttpServer())
          .post('/auth/tfa/authenticate')
          .send({ tfaCode });

        // Assert
        expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
        expect(response.body.message).toBe(
          'Invalid two factor authentication code',
        );
      });

      it('should not authenticate with TFA if code is not provided', async () => {
        // Arrange

        // Act
        const response = await request(app.getHttpServer()).post(
          '/auth/tfa/authenticate',
        );

        // Assert
        expect(response.status).toBe(HttpStatus.BAD_REQUEST);
        expect(response.body.message[0]).toBe('tfaCode should not be empty');
        expect(response.body.message[1]).toBe('tfaCode must be a string');
      });

      it('should not authenticate with TFA if TFA is not enabled', async () => {
        // Arrange
        await usersService.updateUser(mockUser.id, {
          tfaEnabled: false,
        });

        // Act
        const response = await request(app.getHttpServer())
          .post('/auth/tfa/authenticate')
          .send({ tfaCode: authenticator.generate(tfaSecret) });

        // Assert
        expect(response.status).toBe(HttpStatus.FORBIDDEN);
        expect(response.body.message).toBe(
          'Two factor authentication is disabled',
        );
      });
    });

    describe('POST /auth/tfa/recover', () => {
      let recoveryCodes: string[];

      beforeEach(async () => {
        const generateResponse = await request(app.getHttpServer()).get(
          '/auth/tfa/generate',
        );

        tfaSecret = generateResponse.body.secret;

        const enableResponse = await request(app.getHttpServer())
          .post('/auth/tfa/enable')
          .send({ tfaCode: authenticator.generate(tfaSecret) });

        recoveryCodes = enableResponse.body;

        await request(app.getHttpServer()).get('/auth/logout');
      });

      it('should recover TFA with all recovery codes', async () => {
        // Arrange
        let responses: request.Response[] = [];

        // Act
        for (const code of recoveryCodes) {
          responses.push(
            await request(app.getHttpServer())
              .post('/auth/tfa/recover')
              .send({ tfaCode: code }),
          );
          await request(app.getHttpServer()).get('/auth/logout');
        }

        // Assert
        responses.forEach((response) => {
          expect(response.status).toBe(HttpStatus.CREATED);
        });
      });

      it('should not recover TFA with invalid recovery code', async () => {
        // Arrange
        const recoveryCode = '0123456789ab';

        // Act
        const response = await request(app.getHttpServer())
          .post('/auth/tfa/recover')
          .send({ recoveryCode });

        // Assert
        expect(response.status).toBe(HttpStatus.BAD_REQUEST);
        expect(response.body.message[0]).toBe('tfaCode should not be empty');
        expect(response.body.message[1]).toBe('tfaCode must be a string');
      });

      it('should not recover TFA if code is not provided', async () => {
        // Arrange

        // Act
        const response = await request(app.getHttpServer()).post(
          '/auth/tfa/recover',
        );

        // Assert
        expect(response.status).toBe(HttpStatus.BAD_REQUEST);
        expect(response.body.message[0]).toBe('tfaCode should not be empty');
        expect(response.body.message[1]).toBe('tfaCode must be a string');
      });

      it('should not recover TFA with recovery code if TFA is not enabled', async () => {
        // Arrange
        await usersService.updateUser(mockUser.id, {
          tfaEnabled: false,
        });

        // Act
        const response = await request(app.getHttpServer())
          .post('/auth/tfa/recover')
          .send({ tfaCode: recoveryCodes[0] });

        // Assert
        expect(response.status).toBe(HttpStatus.FORBIDDEN);
        expect(response.body.message).toBe(
          'Two factor authentication is disabled',
        );
      });
    });

    describe('POST /auth/tfa/regenerate-recovery-codes', () => {
      beforeEach(async () => {
        const generateResponse = await request(app.getHttpServer()).get(
          '/auth/tfa/generate',
        );

        tfaSecret = generateResponse.body.secret;

        await request(app.getHttpServer())
          .post('/auth/tfa/enable')
          .send({ tfaCode: authenticator.generate(tfaSecret) });
      });

      it('should regenerate recovery codes', async () => {
        // Arrange
        const tfaCode = authenticator.generate(tfaSecret);

        // Act
        const response = await request(app.getHttpServer())
          .post('/auth/tfa/regenerate-recovery-codes')
          .send({ tfaCode });

        // Assert
        expect(response.status).toBe(HttpStatus.CREATED);
        expect(response.body).toHaveLength(12);
        expect(Array.isArray(response.body)).toBe(true);
        response.body.forEach((code: string) => {
          expect(code.length).toBe(12);
          expect(/^[0-9A-Fa-f]+$/.test(code)).toBe(true);
        });
      });

      it('should not regenerate recovery codes if code is invalid', async () => {
        // Arrange
        const tfaCode = '000000';

        // Act
        const response = await request(app.getHttpServer())
          .post('/auth/tfa/regenerate-recovery-codes')
          .send({ tfaCode });

        // Assert
        expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
        expect(response.body.message).toBe(
          'Invalid two factor authentication code',
        );
      });

      it('should not regenerate recovery codes if code is not provided', async () => {
        // Arrange

        // Act
        const response = await request(app.getHttpServer()).post(
          '/auth/tfa/regenerate-recovery-codes',
        );

        // Assert
        expect(response.status).toBe(HttpStatus.BAD_REQUEST);
        expect(response.body.message[0]).toBe('tfaCode should not be empty');
        expect(response.body.message[1]).toBe('tfaCode must be a string');
      });

      it('should not regenerate recovery codes if TFA is not enabled', async () => {
        // Arrange
        const tfaCode = authenticator.generate(tfaSecret);
        await usersService.updateUser(mockUser.id, {
          tfaEnabled: false,
        });

        // Act
        const response = await request(app.getHttpServer())
          .post('/auth/tfa/regenerate-recovery-codes')
          .send({ tfaCode });

        // Assert
        expect(response.status).toBe(HttpStatus.FORBIDDEN);
        expect(response.body.message).toBe(
          'Two factor authentication is disabled',
        );
      });
    });
  });

  describe('Without authenticated user', () => {
    beforeAll(async () => {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [
          EventEmitterModule.forRoot(),
          TypeOrmConfigModule,
          UsersModule,
          AuthModule,
          TfaModule,
        ],
      })
        .overrideGuard(AuthenticatedGuard)
        .useValue({
          canActivate: async () => {
            throw new UnauthorizedException('User is not logged in');
          },
        })
        .compile();
      app = moduleFixture.createNestApplication();

      await app.init();
    });

    afterAll(async () => {
      await app.close();
    });

    describe('GET /auth/tfa/generate', () => {
      it('should not generate a QR code if user is not authenticated', async () => {
        // Arrange

        // Act
        const response = await request(app.getHttpServer()).get(
          '/auth/tfa/generate',
        );

        // Assert
        expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
        expect(response.body.message).toBe('User is not logged in');
      });
    });

    describe('POST /auth/tfa/enable', () => {
      it('should not enable TFA if user is not authenticated', async () => {
        // Arrange
        const tfaCode = '000000';

        // Act
        const response = await request(app.getHttpServer())
          .post('/auth/tfa/enable')
          .send({ tfaCode });

        // Assert
        expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
        expect(response.body.message).toBe('User is not logged in');
      });
    });

    describe('POST /auth/tfa/disable', () => {
      it('should not disable TFA if user is not authenticated', async () => {
        // Arrange
        const tfaCode = '000000';

        // Act
        const response = await request(app.getHttpServer())
          .post('/auth/tfa/disable')
          .send({ tfaCode });

        // Assert
        expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
        expect(response.body.message).toBe('User is not logged in');
      });
    });

    describe('POST /auth/tfa/authenticate', () => {
      it('should not authenticate with TFA if user is not authenticated', async () => {
        // Arrange
        const tfaCode = '000000';

        // Act
        const response = await request(app.getHttpServer())
          .post('/auth/tfa/authenticate')
          .send({ tfaCode });

        // Assert
        expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
        expect(response.body.message).toBe('User is not logged in');
      });
    });

    describe('POST /auth/tfa/recover', () => {
      it('should not recover TFA with recovery code if user is not authenticated', async () => {
        // Arrange
        const recoveryCode = '0123456789ab';

        // Act
        const response = await request(app.getHttpServer())
          .post('/auth/tfa/recover')
          .send({ recoveryCode });

        // Assert
        expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
        expect(response.body.message).toBe('User is not logged in');
      });
    });

    describe('POST /auth/tfa/regenerate-recovery-codes', () => {
      it('should not regenerate recovery codes if user is not authenticated', async () => {
        // Arrange
        const tfaCode = '000000';

        // Act
        const response = await request(app.getHttpServer())
          .post('/auth/tfa/regenerate-recovery-codes')
          .send({ tfaCode });

        // Assert
        expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
        expect(response.body.message).toBe('User is not logged in');
      });
    });
  });
});
