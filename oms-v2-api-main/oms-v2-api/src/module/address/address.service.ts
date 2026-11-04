import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CreateAddressDto,
  CreateAddressWithNameSchema,
} from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Address, AddressType } from './entities/address.entity';
import { User } from '@module/users/entities/user.entity';

@Injectable()
export class AddressService {
  constructor(
    @InjectRepository(Address)
    private addressRepo: Repository<Address>,

    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async create(createAddressDto: CreateAddressDto): Promise<Address> {
    return this.addressRepo.save(createAddressDto);
  }

  async update(
    id: number,
    updateAddressDto: UpdateAddressDto,
  ): Promise<Address | null> {
    const findAddress = await this.addressRepo.findOne({
      where: { id },
    });

    if (!findAddress) {
      throw new NotFoundException(`Office with ID ${id} not found`);
    }

    await this.addressRepo.update(id, updateAddressDto);
    return await this.addressRepo.findOne({ where: { id } });
  }

  findAll() {
    return `This action returns all address`;
  }

  async findOne(id: number): Promise<Address | null> {
    return await this.addressRepo.findOne({ where: { id } });
  }

  remove(id: number) {
    return `This action removes a #${id} address`;
  }
  async createForUser(id: number, dto: Partial<Address>) {
    const address = this.addressRepo.create({
      ...dto,
      module: 'user',
      module_id: id,
    });
    return this.addressRepo.save(address);
  }

  async findByUserId(id: number) {
    return this.addressRepo.find({
      where: {
        module: 'user',
        module_id: id,
      },
    });
  }
  async store_address(name: string, body: any) {
    const parsed = CreateAddressWithNameSchema.safeParse({ name, ...body });

    if (!parsed.success) {
      throw new BadRequestException(parsed.error.flatten().fieldErrors);
    }
    if (name === 'user') {
      const user = await this.userRepo.findOne({ where: { id: body.user_id } });

      if (!user) {
        throw new BadRequestException({ user_id: ['User not found'] });
      }
      const address = this.addressRepo.create({
        ...body,
        module: 'user',
        module_id: body.user_id,
      });
      return this.addressRepo.save(address);
    } else if (name === 'office') {
      const address = this.addressRepo.create({
        ...body,
        module_id: body.officeId ?? null,
        addressType: body.addressType ?? AddressType.COMMERCIAL,
      });
      const saveAddress = await this.addressRepo.save(address);
      return saveAddress;
    } else {
      throw new BadRequestException(
        'Invalid address type. Expected one of: user, shipping, etc.',
      );
    }
  }
}
