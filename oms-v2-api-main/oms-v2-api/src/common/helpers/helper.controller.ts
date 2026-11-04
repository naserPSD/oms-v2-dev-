import { Controller, Get, UseGuards } from '@nestjs/common';
// import { Crud } from '@nestjsx/crud';
import { HelperService } from './helper.service';
import { ApiBearerAuth, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '@core/guards/jwt-auth.guard';
import { CommonResponseDto } from '@core/utils/common-response-dto';
// import { HelperEntity } from './helper.entity';
// import { RouteMetadata } from 'nestjs-gis'

// @RouteMetadata()
// @Crud({
//     model:{type:HelperEntity},
//     params:{
//     }
// })

interface Dropdown {
  countryList: any;
  statusGroupList: any;
}

// @UseGuards(JwtAuthGuard)
// @ApiBearerAuth('access_token')
@Controller('api/v1/helper')
export class HelperController {
  constructor(private readonly service: HelperService) {}

  @Get('/get-common-dropdown-list')
  async getCommonDropdownList() {
    const dropdown: Partial<Dropdown> = {};

    dropdown.countryList = await this.service.getCountryList();
    dropdown.statusGroupList = await this.service.getStatusGroupList();

    return dropdown;
  }
}
