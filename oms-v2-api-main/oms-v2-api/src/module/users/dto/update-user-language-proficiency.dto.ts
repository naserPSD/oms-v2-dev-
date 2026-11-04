import { PartialType } from '@nestjs/mapped-types';
import { CreateUserLanguageProficiencyDto } from './create-user-language-proficiency.dto';

export class UpdateUserLanguageProficiencyDto extends PartialType(
  CreateUserLanguageProficiencyDto,
) {}
