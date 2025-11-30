import { Module } from '@nestjs/common';
import { IngestController } from './ingest/ingest.controller';
import { IngestService } from './ingest/ingest.service';
import { IngestModule } from './ingest/ingest.module';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigModule } from '@nestjs/config';
import { UserController } from './user/user.controller';
import { UserService } from './user/user.service';
import { UserModule } from './user/user.module';
import { MovieModule } from './movie/movie.module';
import { MovieController } from './movie/movie.controller';
import { MovieService } from './movie/movie.service';

@Module({
  imports: [
    IngestModule,
    MulterModule.register({
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max
      },
    }),
    ConfigModule.forRoot({ isGlobal: true }),
    UserModule,
    MovieModule,
  ],
  controllers: [IngestController, UserController, MovieController],
  providers: [IngestService, UserService, MovieService],
})
export class AppModule {}
