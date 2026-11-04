import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
  Patch,
  Query,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiBearerAuth,
  ApiTags,
  ApiQuery,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '@core/guards/jwt-auth.guard';
import {
  CreateEmpPayrollRunDto,
  EmployeePayrollSubmitDto,
} from './dto/employee-payroll-runs.dto';
import { PayrollService } from './payroll.service';
import { CreateEmpSalaryGradeDto } from './dto/employee-salary-grades.dto';
import {
  CreateEmpPromotionDto,
  EmpPromotionResponseDto,
} from './dto/employee-promotions.dto';
import { Helpers } from '@core/utils/helpers';
import { CreateEmpPayItemDto } from './dto/employee-pay-items.dto';
import {
  CreateEmpSalaryGradeRuleDto,
  EmpSalaryGradeRuleResponseDto,
} from './dto/employee-salary-grade-rules.dto';
import {
  CreateEmpSalaryStructureDto,
  EmpSalaryStructureResponseDto,
} from './dto/employee-salary-structure.dto';

import { CreateEmpPayrollMonthlyRecordDto } from './dto/employee-payroll-monthly-records.dto';
import { CreateOrUpdateEmpPaymentHistoryDto } from './dto/employee-payment-history.dto';
import { CreateEmpPayrollMonthlyBreakdownDto } from './dto/emp-payroll-monthly-breakdowns.dto';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access_token')
@ApiTags('Payroll Management')
@Controller('api/v1/payroll')
export class PayrollController {
  constructor(private readonly payrollService: PayrollService) {}

  //get all employee salary grade

  @Get('/salary-grades/get-all-list')
  @ApiOperation({ summary: 'Get all salary grades' })
  @ApiQuery({
    name: 'params',
    required: false,
    description: 'Search parameters like { "search": "Grade" }',
    example: '{ "search": "Senior" }',
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    description: 'Sort results by field, e.g., id:desc, minSalary:asc',
  })
  @ApiQuery({
    name: 'fields',
    required: false,
    description: 'Limit fields returned, e.g., gradeName,minSalary',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of result per page',
  })
  @ApiResponse({
    status: 200,
    description: 'Salary grades retrieved successfully',
  })
  async getAllSalaryGrades(@Query() query: any) {
    const result = await this.payrollService.findAllSalaryGrades(query);

    return {
      status: 'success',
      message: 'Salary grades retrieved successfully',
      data: result.data,
      pagination: Helpers.makePaginationData(query, result),
    };
  }

  @Get('/salary-grades/get-all-active-salary-grade-list')
  @ApiOperation({ summary: 'Get all active employee salary grade list' })
  async findActiveSalaryGradeList(@Query() query: any) {
    const queryResult = await this.payrollService.findActiveSalaryGradeList();
    return {
      status: 'success',
      message: 'Salary Grade retrieved successfully',
      data: queryResult,
    };
  }

  //add or update employee salary grade

  @Post('/salary-grades/add-or-update')
  @ApiOperation({ summary: 'Add or update employee salary grade' })
  async createOrUpdateSalaryGrade(@Body() dto: CreateEmpSalaryGradeDto) {
    const salaryGrade =
      await this.payrollService.createOrUpdateSalaryGrade(dto);
    return {
      status: 'success',
      message: 'Employee salary grade created successfully',
      data: salaryGrade,
    };
  }

  //get employee salary grade by id

  @Get('/salary-grades/get-by-id/:id')
  @ApiOperation({ summary: 'Get employee salary grade by ID' })
  async findSalaryGradeById(@Param('id', ParseIntPipe) id: number) {
    const salaryGrade = await this.payrollService.findSalaryGradeById(id);
    return {
      status: 'success',
      message: 'Employee salary grade retrieved successfully',
      data: salaryGrade,
    };
  }

  //delete employee salary grade by id

  @Delete('/salary-grades/delete-by-id/:id')
  @ApiOperation({ summary: 'Delete employee salary grade by ID' })
  async deleteSalaryGradeById(@Param('id', ParseIntPipe) id: number) {
    await this.payrollService.deleteSalaryGradeById(id);
    return {
      status: 'success',
      message: 'Employee salary grade deleted successfully',
    };
  }

  @Patch('/salary-grades/change-active-status/:id')
  @ApiOperation({ summary: 'Change Active Status' })
  async changeSalaryGradeActiveStatus(@Param('id') id: string) {
    const result = await this.payrollService.changeSalaryGradeActiveStatus(+id);
    return {
      status: 'success',
      message: 'Salary grade active status changed successfully',
      data: result,
    };
  }

  //Create or Update Pay Item

  @Post('/pay-item/add-or-update')
  @ApiOperation({ summary: 'Create or update Pay Item' })
  async createOrUpdateEmpPayItem(@Body() dto: CreateEmpPayItemDto) {
    const result = await this.payrollService.createOrUpdateEmpPayItem(dto);

    return {
      status: 'success',
      message: dto.id
        ? 'Pay Item updated successfully'
        : 'Pay Item created successfully',
      data: result,
    };
  }

  // Get all Pay Items with pagination
  @Get('/pay-item/get-all-list')
  @ApiOperation({ summary: 'Get all employee pay items' })
  @ApiQuery({
    name: 'params',
    required: false,
    description: 'Search parameters, e.g., {"search":"BASIC"}',
    example: '{"search":"BASIC"}',
  })
  @ApiQuery({ name: 'sort', required: false, description: 'Sort items' })
  @ApiQuery({ name: 'fields', required: false, description: 'Limit fields' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  async getAllEmpPayItems(@Query() query: any) {
    const queryResult = await this.payrollService.findAllEmpPayItems(query);

    return {
      status: 'success',
      message: 'Pay Items retrieved successfully',
      data: queryResult.data,
      pagination: Helpers.makePaginationData(query, queryResult),
    };
  }

  @Get('/pay-item/get-all-active-pay-list')
  @ApiOperation({ summary: 'Get all active employee pay items' })
  async findActivePayItemList(@Query() query: any) {
    const queryResult = await this.payrollService.findActivePayItemList();
    return {
      status: 'success',
      message: 'Salary Active Pay Items retrieved successfully',
      data: queryResult,
    };
  }

  // Get by ID
  @Get('/pay-item/get-by-id/:id')
  @ApiOperation({ summary: 'Get Pay Item by ID' })
  async getEmpPayItemById(@Param('id') id: number) {
    const result = await this.payrollService.findEmpPayItemById(id);
    return {
      status: 'success',
      message: 'Pay Item retrieved successfully',
      data: result,
    };
  }

  // Delete by ID
  @Delete('/pay-item/delete-by-id/:id')
  @ApiOperation({ summary: 'Delete Pay Item by ID' })
  async deleteEmpPayItem(@Param('id') id: number) {
    await this.payrollService.deleteEmpPayItemById(id);
    return {
      status: 'success',
      message: 'Pay Item deleted successfully',
    };
  }

  // Change active status
  @Patch('/pay-item/change-active-status/:id')
  @ApiOperation({ summary: 'Change Active Status of Pay Item' })
  async changeEmpPayItemActiveStatus(@Param('id') id: number) {
    const result = await this.payrollService.changeEmpPayItemActiveStatus(id);
    return {
      status: 'success',
      message: 'Pay Item active status changed successfully',
      data: result,
    };
  }

  @Patch('/pay-item/change-taxable-status/:id')
  @ApiOperation({ summary: 'Change Taxable Status of Pay Item' })
  async changeEmpPayItemTaxableStatus(@Param('id') id: number) {
    const result = await this.payrollService.changeEmpPayItemTaxableStatus(id);
    return {
      status: 'success',
      message: 'Pay Item taxable status changed successfully',
      data: result,
    };
  }

  @Post('/salary-grade-rules/add-or-update')
  @ApiOperation({ summary: 'Create or update salary grade rule' })
  @ApiResponse({ status: 200, type: EmpSalaryGradeRuleResponseDto })
  async createOrUpdate(@Body() dto: CreateEmpSalaryGradeRuleDto) {
    const rule = await this.payrollService.createOrUpdateGradeRule(dto);
    return {
      status: 'success',
      message: 'Salary Grade Rule saved',
      data: rule,
    };
  }

  @Get('/salary-grade-rules/get-all-list')
  @ApiOperation({ summary: 'Get all salary grade rules' })
  @ApiQuery({
    name: 'params',
    required: false,
    description: 'Search parameters',
  })
  @ApiQuery({ name: 'sort', required: false })
  @ApiQuery({ name: 'fields', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiResponse({ status: 200, type: [EmpSalaryGradeRuleResponseDto] })
  async getAll(@Query() query: any) {
    const queryResult = await this.payrollService.findAllGradeRules(query);
    return {
      status: 'success',
      message: 'Salary Grade Rules retrieved successfully',
      data: queryResult.data,
      pagination: Helpers.makePaginationData(query, queryResult),
    };
  }

  @Get('/salary-grade-rules/get-by-id/:id')
  @ApiOperation({ summary: 'Get salary grade rule by ID' })
  @ApiResponse({ status: 200, type: EmpSalaryGradeRuleResponseDto })
  async getById(@Param('id') id: number) {
    const rule = await this.payrollService.findGradeRuleById(+id);
    return {
      status: 'success',
      data: rule,
    };
  }
  @Get('/salary-grade-rules/get-by-query-params')
  @ApiOperation({ summary: 'Get salary grade rule by query params' })
  @ApiResponse({ status: 200, type: EmpSalaryGradeRuleResponseDto })
  async getByQueryParams(@Query() query: any) {
    const rule = await this.payrollService.findGradeRuleByQueryParams(query);
    return {
      status: 'success',
      data: rule,
    };
  }

  @Delete('/salary-grade-rules/delete-by-id/:id')
  @ApiOperation({ summary: 'Delete salary grade rule by ID' })
  async delete(@Param('id') id: number) {
    await this.payrollService.deleteGradeRuleById(+id);
    return {
      status: 'success',
      message: 'Salary Grade Rule deleted successfully',
    };
  }

  @Patch('/salary-grade-rules/change-active-status/:id')
  @ApiOperation({ summary: 'Change active status of salary grade rule' })
  @ApiResponse({ status: 200, type: EmpSalaryGradeRuleResponseDto })
  async changeActiveStatus(@Param('id') id: number) {
    const rule = await this.payrollService.changeGradeRuleActiveStatus(+id);
    return {
      status: 'success',
      message: 'Status updated',
      data: rule,
    };
  }

  // @Post('/salary-history/add-or-update')
  // @ApiOperation({ summary: 'Create or update salary history' })
  // async createOrUpdateSalaryHistory(dto) {
  //   const saved = await this.payrollService.createOrUpdateSalaryHistory(dto);
  //   return {
  //     status: 'success',
  //     message: 'Salary History saved successfully',
  //     data: saved,
  //   };
  // }

  @Post('/salary-structure/add-or-update')
  @ApiOperation({ summary: 'Create or Update Salary Structure' })
  async createOrUpdateSalaryStructure(
    @Body() dto: CreateEmpSalaryStructureDto,
  ) {
    const saved = await this.payrollService.createOrUpdateSalaryStructure(dto);
    return {
      status: 'success',
      message: 'Salary Structure saved successfully',
      data: saved,
    };
  }

  @Get('/salary-structure/get-all-list')
  @ApiOperation({ summary: 'Get all Salary Structures with pagination' })
  @ApiQuery({
    name: 'params',
    type: String,
    required: false,
    description:
      'Search parameters to filter results, e.g., { "search": "employee or grade name" }',
    example: '{ "search": "John" }',
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    description: 'Sort results by field, e.g., effectiveFrom:desc',
  })
  @ApiQuery({
    name: 'fields',
    required: false,
    description: 'Limit fields returned, separate by comma',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number for pagination',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of results per page',
  })
  async findAllSalaryStructures(@Query() query: any) {
    const salaryStructures =
      await this.payrollService.findAllSalaryStructures(query);

    return {
      status: 'success',
      message: 'Salary Structures retrieved successfully',
      data: salaryStructures.data,
      pagination: Helpers.makePaginationData(query, salaryStructures),
    };
  }

  @Get('/salary-structure/get-by-id/:id')
  @ApiOperation({ summary: 'Get Salary Structure by ID' })
  @ApiResponse({ status: 200, type: EmpSalaryStructureResponseDto })
  async findSalaryStructureById(@Param('id') id: number) {
    const structure = await this.payrollService.findSalaryStructureById(id);
    return {
      status: 'success',
      message: 'Salary Structure retrieved successfully',
      data: structure,
    };
  }

  @Get('/salary-structure/get-by-employee-id/:id')
  @ApiOperation({ summary: 'Get Salary Structure by Employee ID' })
  @ApiResponse({ status: 200, type: EmpSalaryStructureResponseDto })
  async findSalaryStructureByEmployeeId(@Param('id') id: number) {
    const structure =
      await this.payrollService.findSalaryStructureByEmployeeId(id);
    return {
      status: 'success',
      message: 'Salary Structure retrieved successfully',
      data: structure,
    };
  }

  @Delete('/salary-structure/delete-by-id/:id')
  @ApiOperation({ summary: 'Delete Salary Structure by ID' })
  async deleteSalaryStructureById(@Param('id') id: number) {
    await this.payrollService.deleteSalaryStructureById(id);
    return {
      status: 'success',
      message: 'Salary Structure deleted successfully',
    };
  }

  @Patch('/salary-structure/change-active-status/:id')
  @ApiOperation({ summary: 'Change Active Status of Salary Structure' })
  async changeSalaryStructureActiveStatus(@Param('id') id: number) {
    const updated =
      await this.payrollService.changeSalaryStructureActiveStatus(id);
    return {
      status: 'success',
      message: 'Salary Structure active status changed successfully',
      data: updated,
    };
  }

  // @Post('/salary-structure-details/add-or-update')
  // @ApiOperation({ summary: 'Create or update salary structure detail' })
  // async createOrUpdateSalaryStructureDetails(
  //   @Body() dto: CreateEmpSalaryStructureDetailsDto,
  // ) {
  //   const result =
  //     await this.payrollService.createOrUpdateSalaryStructureDetails(dto);
  //   return {
  //     status: 'success',
  //     message: 'Salary Structure Detail saved successfully',
  //     data: result,
  //   };
  // }

  // @Get('/salary-structure-details/get-all-list')
  // @ApiOperation({ summary: 'Get all salary structure details with pagination' })
  // @ApiQuery({
  //   name: 'params',
  //   required: false,
  //   type: String,
  //   description:
  //     'Search parameters to filter results, e.g., { "search": "employee or grade name" }',
  //   example: '{ "search": "John" }',
  // })
  // @ApiQuery({
  //   name: 'sort',
  //   required: false,
  //   description: 'Sort results by field, e.g., effectiveFrom:desc',
  // })
  // @ApiQuery({ name: 'fields', required: false, description: 'Limit fields' })
  // @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  // @ApiQuery({
  //   name: 'limit',
  //   required: false,
  //   description: 'Number of results',
  // })
  // @ApiResponse({ status: 200, type: [EmpSalaryStructureResponseDto] })
  // async findAll(@Query() query: any) {
  //   const queryResult =
  //     await this.payrollService.findAllSalaryStructureDetails(query);
  //   return {
  //     status: 'success',
  //     message: 'Salary Structure Details retrieved successfully',
  //     data: queryResult.data,
  //     pagination: Helpers.makePaginationData(query, queryResult),
  //   };
  // }

  // @Get('/salary-structure-details/get-by-id/:id')
  // @ApiOperation({ summary: 'Get salary structure detail by ID' })
  // @ApiResponse({ status: 200, type: EmpSalaryStructureDetailsResponseDto })
  // async findSalaryStructureDetailsById(@Param('id') id: number) {
  //   const detail = await this.payrollService.findSalaryStructureDetailsById(id);
  //   return {
  //     status: 'success',
  //     message: 'Salary Structure Detail retrieved successfully',
  //     data: detail,
  //   };
  // }

  // @Delete('/salary-structure-details/delete-by-id/:id')
  // @ApiOperation({ summary: 'Delete salary structure detail by ID' })
  // async deleteSalaryStructureDetailsById(@Param('id') id: number) {
  //   await this.payrollService.deleteSalaryStructureDetailsById(id);
  //   return {
  //     status: 'success',
  //     message: 'Salary Structure Detail deleted successfully',
  //   };
  // }

  // Add or update employee promotion
  @Post('/promotion/add-employee-promotion')
  @ApiOperation({ summary: 'Add employee promotion' })
  async createPromotion(@Body() dto: CreateEmpPromotionDto) {
    const promotion = await this.payrollService.createPromotion(dto);
    return {
      status: 'success',
      message: 'Employee promotion saved successfully',
      data: promotion,
    };
  }

  // Get all employee promotions
  @Get('/promotion/get-all-list')
  @ApiOperation({ summary: 'Get all employee promotions with pagination' })
  @ApiQuery({
    name: 'params',
    required: false,
    type: String,
    description:
      'Search parameters to filter results, e.g., { "search": "employee name" }',
    example: '{ "search": "John" }',
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    description: 'Sort results by field,',
  })
  @ApiQuery({ name: 'fields', required: false, description: 'Limit fields' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of results',
  })
  @ApiResponse({ status: 200, type: [EmpPromotionResponseDto] })
  async findAll(@Query() query: any) {
    const queryResult = await this.payrollService.findAllPromotions(query);
    return {
      status: 'success',
      message: 'Employee Promotions retrieved successfully',
      data: queryResult.data,
      pagination: Helpers.makePaginationData(query, queryResult),
    };
  }

  // Get promotion by ID
  @Get('/promotion/get-by-id/:id')
  @ApiOperation({ summary: 'Get employee promotion by ID' })
  async findPromotionById(@Param('id', ParseIntPipe) id: number) {
    const promotion = await this.payrollService.findPromotionById(id);
    return {
      status: 'success',
      message: 'Employee promotion retrieved successfully',
      data: promotion,
    };
  }

  // Delete promotion by ID
  @Delete('/promotion/delete-by-id/:id')
  @ApiOperation({ summary: 'Delete employee promotion by ID' })
  async deletePromotionById(@Param('id', ParseIntPipe) id: number) {
    await this.payrollService.deletePromotionById(id);
    return {
      status: 'success',
      message: 'Employee promotion deleted successfully',
    };
  }

  @Post('/payroll-runs/create-or-update')
  @ApiOperation({ summary: 'Create or Update Payroll Run' })
  async createOrUpdateEmployeePayroll(@Body() dto: CreateEmpPayrollRunDto) {
    const saved = await this.payrollService.createOrUpdateEmployeePayroll(dto);
    return {
      status: 'success',
      message: 'Payroll created successfully',
      data: saved,
    };
  }

  @Get('/payroll-runs/get-all-list')
  @ApiOperation({ summary: 'Get all Payroll Runs with pagination' })
  @ApiQuery({
    name: 'params',
    type: String,
    required: false,
    description:
      'Search parameters to filter results, e.g., { "search": "employee name" }',
    example: '{ "search": "John" }',
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    description: 'Sort results by field, e.g., effectiveFrom:desc',
  })
  @ApiQuery({
    name: 'fields',
    required: false,
    description: 'Limit fields returned, separate by comma',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number for pagination',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of results per page',
  })
  async findAllPayrollRuns(@Query() query: any) {
    const payrollRuns = await this.payrollService.findAllPayrollRuns(query);

    return {
      status: 'success',
      message: 'Payroll Runs retrieved successfully',
      data: payrollRuns.data,
      pagination: Helpers.makePaginationData(query, payrollRuns),
    };
  }

  // // Employee Payroll Submit
  // @Post('/payroll/employee-payroll-submit')
  // async employeePayrollSubmit(
  //   @Body() dto: EmployeePayrollSubmitDto,
  // ): Promise<any> {
  //   return this.payrollService.employeePayrollSubmit(dto);
  // }

  // @Post('/employee-payroll-employees/add-or-update')
  // @ApiOperation({ summary: 'Add or update employee payroll employee record' })
  // async createOrUpdatePayrollEmployee(
  //   @Body() dto: CreateEmpPayrollEmployeeDto,
  // ) {
  //   const payrollEmp =
  //     await this.payrollService.createOrUpdatePayrollEmployee(dto);
  //   return {
  //     status: 'success',
  //     message: 'Payroll employee record saved successfully',
  //     data: payrollEmp,
  //   };
  // }

  // @Get('/employee-payroll-employees/get-all-list')
  // @ApiOperation({ summary: 'Get all payroll employee records' })
  // @ApiQuery({
  //   name: 'params',
  //   required: false,
  //   description: 'Search parameters like { "search": "10001" }',
  //   example: '{ "search": "EMP-001" }',
  // })
  // @ApiQuery({
  //   name: 'sort',
  //   required: false,
  //   description: 'Sort results by field, e.g., id:desc, netSalary:asc',
  // })
  // @ApiQuery({
  //   name: 'fields',
  //   required: false,
  //   description: 'Limit fields returned, e.g., empCode,netSalary',
  // })
  // @ApiQuery({
  //   name: 'page',
  //   required: false,
  //   description: 'Page number',
  // })
  // @ApiQuery({
  //   name: 'limit',
  //   required: false,
  //   description: 'Number of result per page',
  // })
  // @ApiResponse({
  //   status: 200,
  //   description: 'Payroll employees retrieved successfully',
  // })
  // async getAllPayrollEmployees(@Query() query: any) {
  //   const result = await this.payrollService.findAllPayrollEmployees(query);

  //   return {
  //     status: 'success',
  //     message: 'Payroll employees retrieved successfully',
  //     data: result.data,
  //     pagination: Helpers.makePaginationData(query, result),
  //   };
  // }

  // @Get('/employee-payroll-employees/get-by-id/:id')
  // @ApiOperation({ summary: 'Get payroll employee record by ID' })
  // async findPayrollEmployeeById(@Param('id', ParseIntPipe) id: number) {
  //   const payrollEmp = await this.payrollService.findPayrollEmployeeById(id);
  //   return {
  //     status: 'success',
  //     message: 'Payroll employee record retrieved successfully',
  //     data: payrollEmp,
  //   };
  // }

  // @Delete('/employee-payroll-employees/delete-by-id/:id')
  // @ApiOperation({ summary: 'Delete payroll employee record by ID' })
  // async deletePayrollEmployeeById(@Param('id', ParseIntPipe) id: number) {
  //   await this.payrollService.deletePayrollEmployeeById(id);
  //   return {
  //     status: 'success',
  //     message: 'Payroll employee record deleted successfully',
  //   };
  // }

  // @Post('/payment-history/add-or-update')
  // @ApiOperation({ summary: 'Add or update employee payment history' })
  // async createOrUpdatePaymentHistory(
  //   @Body() dto: CreateOrUpdateEmpPaymentHistoryDto,
  // ) {
  //   const paymentHistory =
  //     await this.payrollService.createOrUpdatePaymentHistory(dto);
  //   return {
  //     status: 'success',
  //     message: 'Employee payment history saved successfully',
  //     data: paymentHistory,
  //   };
  // }

  @Get('/payment-history/get-all-list')
  @ApiOperation({ summary: 'Get all employee payment history' })
  @ApiQuery({
    name: 'params',
    required: false,
    description: 'Search/filter params',
    example: '{ "search": "TXN" }',
  })
  @ApiQuery({ name: 'sort', required: false })
  @ApiQuery({ name: 'fields', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiResponse({
    status: 200,
    description: 'Payment history retrieved successfully',
  })
  async findAllPaymentHistory(@Query() query: any) {
    const result = await this.payrollService.findAllPaymentHistory(query);
    return {
      status: 'success',
      message: 'Employee payment history retrieved successfully',
      data: result.data,
      pagination: Helpers.makePaginationData(query, result),
    };
  }

  @Get('/get-employee-payment-history-list-with-pagination/:employeeId')
  @ApiOperation({
    summary: 'Get employee payment history list with pagination',
  })
  @ApiParam({
    name: 'employeeId',
    required: true,
    description: 'Employee ID',
    example: 1,
  })
  @ApiQuery({
    name: 'params',
    required: false,
    description: 'Search/filter params',
    example: '{ "year": 2026, "month": 2, "search": "PR-2026" }',
  })
  @ApiQuery({ name: 'sort', required: false })
  @ApiQuery({ name: 'fields', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiResponse({
    status: 200,
    description: 'Employee payment history retrieved successfully',
  })
  async getPaymentHistoryByEmployee(
    @Param('employeeId') employeeId: number,
    @Query() query: any,
  ) {
    const result = await this.payrollService.getPaymentHistoryByEmployee(
      Number(employeeId),
      query,
    );

    return {
      status: 'success',
      message: 'Employee payment history retrieved successfully',
      data: result.data,
      pagination: Helpers.makePaginationData(query, result),
    };
  }

  @Get('/get-my-payment-history-list-with-pagination')
  @ApiOperation({ summary: 'Get my payment history list with pagination' })
  @ApiQuery({
    name: 'params',
    required: false,
    description: 'Search/filter params',
    example: '{ "year": 2026, "month": 2 }',
  })
  @ApiQuery({ name: 'sort', required: false })
  @ApiQuery({ name: 'fields', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiResponse({
    status: 200,
    description: 'Payment history retrieved successfully',
  })
  async getMyPaymentHistoryList(@Query() query: any) {
    const result = await this.payrollService.getMyPaymentHistoryList(query);

    return {
      status: 'success',
      message: 'Payment history retrieved successfully',
      data: result.data,
      pagination: Helpers.makePaginationData(query, result),
    };
  }

  @Get('/payment-history/get-by-id/:id')
  @ApiOperation({ summary: 'Get payment history by ID' })
  async findPaymentHistoryById(@Param('id', ParseIntPipe) id: number) {
    const history = await this.payrollService.findPaymentHistoryById(id);
    return {
      status: 'success',
      message: 'Payment history retrieved successfully',
      data: history,
    };
  }

  //basic salary by employee id

  @Get('/payment-history/get-basic-salary-by-employee-id/:employeeId')
  @ApiOperation({ summary: 'Get basic salary by employee ID' })
  async getBasicSalaryByEmployeeId(
    @Param('employeeId', ParseIntPipe) employeeId: number,
  ) {
    const basicSalary =
      await this.payrollService.getBasicSalaryByEmployeeId(employeeId);
    return {
      status: 'success',
      message: 'Basic salary retrieved successfully',
      data: basicSalary,
    };
  }

  //getSalaryHistoryByEmployeeId controller with pagination

  @Get('/payment-history/get-salary-history-by-employee-id/:employeeId')
  @ApiOperation({ summary: 'Get salary history by employee ID' })
  @ApiQuery({
    name: 'params',
    required: false,
    description: 'Search/filter params',
    example: '{ "year": 2026, "month": 2, "search": "PR-2026" }',
  })
  @ApiQuery({ name: 'sort', required: false })
  @ApiQuery({ name: 'fields', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiResponse({
    status: 200,
    description: 'Salary history retrieved successfully',
  })
  async getSalaryHistoryByEmployeeId(
    @Param('employeeId') employeeId: number,
    @Query() query: any,
  ) {
    const result = await this.payrollService.getSalaryHistoryByEmployeeId(
      Number(employeeId),
      query,
    );

    return {
      status: 'success',
      message: 'Salary history retrieved successfully',
      data: result.data,
      pagination: Helpers.makePaginationData(query, result),
    };
  }

  // getMySalaryHistory with pagination controller
  @Get('/payment-history/get-my-salary-history')
  @ApiOperation({ summary: 'Get my salary history' })
  @ApiQuery({
    name: 'params',
    required: false,
    description: 'Search/filter params',
    example: '{ "year": 2026, "month": 2 }',
  })
  @ApiQuery({ name: 'sort', required: false })
  @ApiQuery({ name: 'fields', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiResponse({
    status: 200,
    description: 'Salary history retrieved successfully',
  })
  async getMySalaryHistory(@Query() query: any) {
    const result = await this.payrollService.getMySalaryHistory(query);

    return {
      status: 'success',
      message: 'Salary history retrieved successfully',
      data: result.data,
      pagination: Helpers.makePaginationData(query, result),
    };
  }

  @Delete('/payment-history/delete-by-id/:id')
  @ApiOperation({ summary: 'Delete payment history by ID' })
  async deletePaymentHistoryById(@Param('id', ParseIntPipe) id: number) {
    await this.payrollService.deletePaymentHistoryById(id);
    return {
      status: 'success',
      message: 'Payment history deleted successfully',
    };
  }

  @Post('/employee-payroll-monthly-records/add-or-update')
  @ApiOperation({ summary: 'Add or update payroll monthly record' })
  async createOrUpdatePayrollMonthlyRecord(
    @Body() dto: CreateEmpPayrollMonthlyRecordDto,
  ) {
    const payrollMonthlyRecord =
      await this.payrollService.createOrUpdateEmpPayrollMonthlyRecord(dto);
    return {
      status: 'success',
      message: 'Employee Payroll monthly record saved successfully',
      data: payrollMonthlyRecord,
    };
  }

  //get emplyee payroll monthly record with pagination
  @Get('/employee-payroll-monthly-records/get-all-list-by-id/:id')
  @ApiOperation({ summary: 'Get all employee payroll monthly record' })
  @ApiQuery({
    name: 'params',
    required: false,
    description: 'Search/filter params',
    example: '{ "search": "TXN" }',
  })
  @ApiQuery({ name: 'sort', required: false })
  @ApiQuery({ name: 'fields', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiResponse({
    status: 200,
    description: 'Payroll monthly record retrieved successfully',
  })
  async findAllPayrollMonthlyRecord(
    @Param('id', ParseIntPipe) id: number,
    @Query() query: any,
  ) {
    const result = await this.payrollService.findAllEmpPayrollMonthlyRecords(
      id,
      query,
    );
    return {
      status: 'success',
      message: 'Employee payroll monthly record retrieved successfully',
      data: result,
      pagination: Helpers.makePaginationData(query, result.list),
    };
  }

  @Post('/employee-payroll-monthly-records/pay-now')
  @ApiOperation({ summary: 'Pay now Employee Salary' })
  async payNowEmployeeMonthlySalary(
    @Body() dto: CreateEmpPayrollMonthlyRecordDto,
  ) {
    const payrollMonthlyRecord =
      await this.payrollService.payNowEmployeeMonthlySalary(dto);
    return {
      status: 'success',
      message: 'Employee Payroll monthly record saved successfully',
      data: payrollMonthlyRecord,
    };
  }

  @Delete('/employee-payroll-monthly-records/delete-by-id/:id')
  @ApiOperation({ summary: 'Delete payroll monthly record by id' })
  async deletePayrollMonthlyRecordById(@Param('id', ParseIntPipe) id: number) {
    await this.payrollService.deletePayrollMonthlyRecordById(id);
    return {
      status: 'success',
      message: 'Employee Payroll monthly record deleted successfully',
    };
  }

  @Post('/employee-payroll-monthly-records/delete-bulk-by-ids')
  @ApiOperation({ summary: 'Delete bulk payroll monthly record by ids' })
  async deleteBulkPayrollMonthlyRecordById(@Body('ids') ids: number[]) {
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new BadRequestException('ids must be a non-empty array');
    }
    await this.payrollService.deleteBulkPayrollMonthlyRecordById(ids);
    return {
      status: 'success',
      message: 'Employee Payroll monthly record deleted successfully',
    };
  }

  @Post('/employee-payroll-monthly-records/pay-now-bulk-by-ids')
  @ApiOperation({ summary: 'Pay now bulk payroll monthly record by ids' })
  async payNowBulkPayrollMonthlyRecordById(@Body('ids') ids: number[]) {
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new BadRequestException('ids must be a non-empty array');
    }
    await this.payrollService.payNowBulkPayrollMonthlyRecordById(ids);
    return {
      status: 'success',
      message: 'Employee Payroll monthly record deleted successfully',
    };
  }

  //Employee Payroll Monthly breakdown
  @Post('/employee-payroll-monthly-breakdown/add-or-update')
  @ApiOperation({ summary: 'Add or update employee payroll monthly breakdown' })
  async createOrUpdatePayrollMonthlyBreakdown(
    @Body() dto: CreateEmpPayrollMonthlyBreakdownDto,
  ) {
    const payrollMonthlyBreakdown =
      await this.payrollService.createOrUpdateEmpPayrollMonthlyBreakdown(dto);
    return {
      status: 'success',
      message: 'Employee Payroll monthly breakdown saved successfully',
      data: payrollMonthlyBreakdown,
    };
  }

  //   @Get('/get-payRoll-monthly-record-by-id/:id')
  // @ApiOperation({ summary: 'Get payroll monthly breakdown by p ID' })

  // async findBreakdownById(@Param('id', ParseIntPipe) id: number) {
  //   const breakdown = await this.payrollService.findBreakdownWithPayrollRecordById(id);
  //   return {
  //     status: 'success',
  //     message: 'Payroll monthly breakdown retrieved successfully',
  //     data: breakdown,
  //   };
  // }

  @Get('/get-emp-payroll-breakdown-by-payroll-monthly-record-id/:id')
  @ApiOperation({
    summary: 'Get payroll monthly breakdown by payroll record ID',
  })
  async findBreakdownByPayrollRecordId(@Param('id', ParseIntPipe) id: number) {
    const breakdown =
      await this.payrollService.findBreakdownByPayrollRecordId(id);
    return {
      status: 'success',
      message: 'Payroll monthly breakdown retrieved successfully',
      data: breakdown,
    };
  }

  @Get('employee/get-employee-salary-grade-info/:employeeId')
  @ApiOperation({ summary: 'Get employee salary grade information' })
  async getEmployeeSalaryGradeInfo(@Param('employeeId') employeeId: number) {
    const data =
      await this.payrollService.getEmployeeSalaryGradeInfo(employeeId);
    return {
      message: 'Employee salary grade info retrieved successfully',
      data,
    };
  }

  @Get('/employee/my-salary-grade-info')
  @ApiOperation({ summary: 'Get Logged In Employee Salary Grade Info' })
  async getUserSalaryGradeInfo() {
    const data = await this.payrollService.getUserSalaryGradeInfo();

    return {
      status: 'success',
      message: 'Employee salary grade info fetched successfully',
      data,
    };
  }

  //getActiveEmployeesBirthdayInfo controller
  @Get('/get-active-employees-birthday-info')
  async getActiveEmployeesBirthdayInfo() {
    const data = await this.payrollService.getActiveEmployeesBirthdayInfo();
    return {
      status: 'success',
      message: 'Active employees birthday info fetched successfully',
      data,
    };
  }
}
