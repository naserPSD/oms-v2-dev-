import { UserRegisterRequestDto } from '@module/auth/dto/user-register-request.dto';
import { StatusGroup } from '@module/status-group/entities/status-group.entity';
import { Status } from '@module/status/entities/status.entity';
import { User } from '@module/users/entities/user.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { GoogleUserDto } from '@core/guards/google-auth/google-user.dto';
import { Country } from '@module/country/entities/country.entity';
import { CacheService } from 'src/redis/cache.service';
import { CommonResponseDto } from '@core/utils/common-response-dto';
import { UserContextService } from '@module/auth/user-context.service';
import { RequestContext } from '@common/request-context';

@Injectable()
export class HelperService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Status) private statusRepo: Repository<Status>,
    @InjectRepository(StatusGroup)
    private statusGroupRepo: Repository<StatusGroup>,
    @InjectRepository(Country) private countryRepo: Repository<Country>,

    private readonly userContextService: UserContextService,
    private readonly cacheService: CacheService,
  ) {}

  async findUserByEmail(email: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { email } });
  }

  async findUserById(id: number): Promise<User | null> {
    return this.userRepo.findOne({ where: { id } });
  }

  async findStatusById(id: number): Promise<Status | null> {
    return this.statusRepo.findOne({ where: { id } });
  }

  async findStatusByName(name: string): Promise<Status | null> {
    return this.statusRepo.findOne({ where: { name } });
  }

  async findStatusByCode(code: string): Promise<Status | null> {
    return this.statusRepo.findOne({ where: { code } });
  }

  async findStatusByIdOrCode(idOrCode: any): Promise<Status | null> {
    const where = isNaN(+idOrCode) // Check if idOrCode is a number
      ? { code: idOrCode }
      : { statusId: +idOrCode };
    return this.statusRepo.findOne({ where });
  }

  async findStatusGroupByIdOrCode(
    idOrCode: string,
  ): Promise<StatusGroup | null> {
    const where = isNaN(+idOrCode) // Check if idOrCode is a number
      ? { code: idOrCode }
      : { statusGroupId: +idOrCode };
    return this.statusGroupRepo.findOne({ where });
  }

  async findStatusesByStatusGroupIdOrCode(
    idOrCode: string,
  ): Promise<StatusGroup | null> {
    const where = isNaN(+idOrCode) // Check if idOrCode is a number
      ? { code: idOrCode }
      : { statusGroupId: +idOrCode };
    return this.statusGroupRepo.findOne({ where, relations: ['statuses'] });
  }

  async validatedGoogleUser(googleUser: GoogleUserDto) {
    const existingUser = await this.findUserByEmail(googleUser.email);
    if (existingUser) {
      if (existingUser.emailVerifiedAt == null) {
        existingUser.emailVerifiedAt = new Date();
        await this.userRepo.save(existingUser);
      }
      return existingUser;
    }

    const hashedPassword = await bcrypt.hash('12345678', 10); // Use env-stored default if possible

    const newUser = this.userRepo.create({
      firstName: googleUser.firstName,
      lastName: googleUser.lastName,
      email: googleUser.email,
      password: hashedPassword,
      emailVerifiedAt: new Date(),
    });

    return await this.userRepo.save(newUser);
  }

  async getCountryList() {
    const cacheKey = `countryList`;
    const cached = await this.cacheService.get(cacheKey);
    if (cached) return cached;

    const newData = await this.countryRepo.find({
      order: {
        name: 'ASC',
      },
      select: [
        'id',
        'name',
        'fullName',
        'citizenship',
        'countryCode',
        'callingCode',
        'language',
        'flag',
      ],
    });

    await this.cacheService.set(cacheKey, newData);
    return newData;
  }

  //   async getGroupList() {
  //     return this.statusGroupRepo.find({
  //       order: {
  //         name: 'ASC',
  //       },
  //       select: ['id', 'name', 'code'],
  //       relations: ['statuses'],
  //       where: { isActive: true },
  //     });
  //   }

  async getStatusGroupList() {
    const cacheKey = `statusGroupList`;
    await this.cacheService.del(cacheKey);
    const cached = await this.cacheService.get(cacheKey);
    if (cached) return cached;
    const groups = await this.statusGroupRepo
      .createQueryBuilder('group')
      .leftJoinAndSelect('group.statuses', 'status')
      .where('group.isActive = :isActive', { isActive: true })
      .where('status.isActive = :isActive', { isActive: true })
      .orderBy('group.name', 'ASC')
      .addOrderBy('status.serial', 'ASC') // Order statuses by name
      .addOrderBy('status.name', 'ASC') // Order statuses by name
      // .select([
      //   'group.id',
      //   'group.name',
      //   'group.code',
      //   'status.id',
      //   'status.name',
      //   'status.code',
      // ])
      .getMany();
    // .getRawMany();

    // return groups;

    const formattedGroups = groups.map((group) => ({
      id: group.id,
      name: group.name,
      code: group.code,
      statuses: group.statuses.map((status) => ({
        // ...status,
        id: status.id,
        name: status.name,
        code: status.code,
        colorName: status.colorName,
        value: status.id,
        label: status.name,
      })),
    }));

    await this.cacheService.set(cacheKey, formattedGroups);
    return formattedGroups;
  }

  async getAppId() {
    const userId = RequestContext.get('userId');
    const appId = this.cacheService.get(`appId:${userId}`);

    return appId;
  }
}
