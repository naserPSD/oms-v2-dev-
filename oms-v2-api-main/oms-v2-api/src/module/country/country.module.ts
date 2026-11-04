import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CountryController } from './country.controller';
import { CountryService } from './country.service';
import { Country } from './entities/country.entity';

@Module({
  controllers: [CountryController],
  providers: [CountryService],
  exports: [CountryService],
  imports: [TypeOrmModule.forFeature([Country])],
})
export class CountryModule {}
