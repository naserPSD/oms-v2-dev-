import { AwsS3Module } from '@config/aws-s3.module';
import { UsersModule } from '@module/users/users.module';
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Media } from './entities/media.entity';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';
import { AwsS3Service } from '@config/aws-s3.service';
import { MediaSubscriber } from './subscribers/media.subscriber';

@Module({
  imports: [
    TypeOrmModule.forFeature([Media]),
    AwsS3Module,
    forwardRef(() => UsersModule),
  ],
  controllers: [MediaController],
  providers: [MediaService, AwsS3Service, MediaSubscriber],
  exports: [MediaService, TypeOrmModule],
})
export class MediaModule {}
