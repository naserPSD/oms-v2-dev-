import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WebsiteContent } from './entities/website-content.entity';
import { WebsiteContentController } from './website-content.controller';
import { WebsiteContentService } from './website-content.service';

@Module({
  imports: [TypeOrmModule.forFeature([WebsiteContent])],
  controllers: [WebsiteContentController],
  providers: [WebsiteContentService],
  exports: [WebsiteContentService],
})
export class WebsiteContentModule {}
