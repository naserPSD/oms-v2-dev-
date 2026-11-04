import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CreateEmpPayrollRunDto,
  EmployeePayrollSubmitDto,
} from './dto/employee-payroll-runs.dto';
import { EmpPayrollRun } from './entities/employee-payroll-runs.entity';
import { RequestContext } from '@common/request-context';
import { Status } from '@module/status/entities/status.entity';
import {
  DeepPartial,
  EntityManager,
  IsNull,
  Not,
  Repository,
  DataSource,
} from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { AppUser } from '@module/users/entities/app-user.entity';
import { EmpSalaryGrade } from './entities/employee-salary-grades.entity';
import { CreateEmpSalaryGradeDto } from './dto/employee-salary-grades.dto';
import { EmpPromotion } from './entities/employee-promotions.entity';
import { CreateEmpPromotionDto } from './dto/employee-promotions.dto';
import { Employee } from '@module/hr-management/entities/employees.entity';
import { Designation } from '@module/application/entities/designations.entity';
import { APIFeatures } from '@core/utils/apiFeatures';
import { CreateEmpPayItemDto } from './dto/employee-pay-items.dto';
import { EmpPayItem } from './entities/employee-pay-items.entity';
import { CreateEmpSalaryGradeRuleDto } from './dto/employee-salary-grade-rules.dto';
import { EmpSalaryGradeRule } from './entities/employee-salary-grade-rules.entity';
import { EmpSalaryStructure } from './entities/employee-salary-structure.entity';
import { CreateEmpSalaryStructureDto } from './dto/employee-salary-structure.dto';
import { EmpSalaryStructureDetails } from './entities/employee-salary-structure-details.entity';
import { EmpPayrollMonthlyRecords } from './entities/employee-payroll-monthly-records.entity';
import { CreateEmpPayrollMonthlyRecordDto } from './dto/employee-payroll-monthly-records.dto';
import { EmpPaymentHistory } from './entities/employee-payment-history.entity';
import { CreateOrUpdateEmpPaymentHistoryDto } from './dto/employee-payment-history.dto';
import { In } from 'typeorm';
import { EmpSalaryHistory } from './entities/emp-salary-history.entity';
import { approvalStatus } from '@core/utils/enum-fields';
import { CreateEmpSalaryHistoryDto } from './dto/emp-salary-history.dto';
import { EmpPayrollMonthlyBreakdown } from './entities/emp-payroll-monthly-breakdowns.entity';
import { CreateEmpPayrollMonthlyBreakdownDto } from './dto/emp-payroll-monthly-breakdowns.dto';
import { EmpAttendance } from '@module/hr-management/entities/employee-attendance.entity';
import { EmpAttendancePenalty } from '@module/hr-management/entities/emp-attendance-penalties.entity';
import { CheckInApproveReconciliationDto } from '@module/hr-management/dto/Attendance-reconciliation.dto';
import { UsersService } from '@module/users/users.service';

@Injectable()
export class PayrollService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Status)
    private statusRepository: Repository<Status>,

    @InjectRepository(EmpPayrollRun)
    private empPayrollRunRepo: Repository<EmpPayrollRun>,

    @InjectRepository(AppUser)
    private appUserRepo: Repository<AppUser>,

    private readonly usersService: UsersService,

    @InjectRepository(EmpSalaryGrade)
    private readonly empSalaryGradeRepo: Repository<EmpSalaryGrade>,

    @InjectRepository(EmpPromotion)
    private readonly empPromotionRepo: Repository<EmpPromotion>,

    @InjectRepository(Employee)
    private readonly employeeRepo: Repository<Employee>,

    @InjectRepository(Designation)
    private readonly designationRepo: Repository<Designation>,

    @InjectRepository(EmpPayItem)
    private readonly empPayItemRepo: Repository<EmpPayItem>,

    @InjectRepository(Status)
    private readonly statusRepo: Repository<Status>,

    @InjectRepository(EmpSalaryGradeRule)
    private readonly empSalaryGradeRuleRepo: Repository<EmpSalaryGradeRule>,

    @InjectRepository(EmpSalaryStructure)
    private readonly empSalaryStructureRepo: Repository<EmpSalaryStructure>,

    @InjectRepository(EmpSalaryStructureDetails)
    private readonly empSalaryStructureDetailsRepo: Repository<EmpSalaryStructureDetails>,

    @InjectRepository(EmpSalaryHistory)
    private readonly empSalaryHistoryRepo: Repository<EmpSalaryHistory>,

    @InjectRepository(EmpPayrollMonthlyRecords)
    private readonly empPayrollMonthlyRecordsRepo: Repository<EmpPayrollMonthlyRecords>,

    @InjectRepository(EmpPaymentHistory)
    private readonly paymentHistoryRepo: Repository<EmpPaymentHistory>,

    @InjectRepository(EmpPayrollMonthlyBreakdown)
    private readonly empPayrollMonthlyBreakdownRepo: Repository<EmpPayrollMonthlyBreakdown>,

    @InjectRepository(EmpAttendancePenalty)
    private readonly empAttendancePenaltyRepo: Repository<EmpAttendancePenalty>,
  ) {}

  //create or update salary grades

  async createOrUpdateSalaryGrade(
    dto: CreateEmpSalaryGradeDto,
  ): Promise<EmpSalaryGrade> {
    const userId = RequestContext.get('userId');
    const appId = RequestContext.get('activeAppId');
    dto.appId = appId ?? undefined;

    if (dto.maxSalary < dto.minSalary) {
      throw new BadRequestException({
        maxSalary: [`Maximum salary cannot be less than minimum salary`],
      });
    }

    const existingCode = await this.empSalaryGradeRepo.findOne({
      where: {
        gradeCode: dto.gradeCode,
        ...(appId ? { appId } : {}),
      },
    });

    if (existingCode && existingCode.id !== dto.id) {
      throw new BadRequestException({
        gradeCode: [`Grade code '${dto.gradeCode}' already exists`],
      });
    }

    let salaryGrade: EmpSalaryGrade;
    if (dto.id) {
      const existingGrade = await this.empSalaryGradeRepo.findOne({
        where: { id: dto.id, ...(appId ? { appId } : {}) },
      });
      if (!existingGrade) throw new NotFoundException('Salary Grade not found');
      salaryGrade = existingGrade;
      this.empSalaryGradeRepo.merge(salaryGrade, dto);
    } else {
      salaryGrade = this.empSalaryGradeRepo.create({ ...dto });
    }

    const saved = await this.empSalaryGradeRepo.save(salaryGrade);
    return saved;
  }

  // get all salary grades
  async findAllSalaryGrades(
    queryString: any,
  ): Promise<{ data: EmpSalaryGrade[]; total: number }> {
    const appId = RequestContext.get('activeAppId');
    const query = this.empSalaryGradeRepo.createQueryBuilder('grade');
    query.orderBy('grade.minSalary', 'ASC');

    const params = queryString?.params ? JSON.parse(queryString.params) : {};

    if (params.search) {
      const search = `%${params.search.trim()}%`;
      query.andWhere('grade.gradeName LIKE :search', { search });
    }

    // if (params.isActive) {
    //   const search = `%${params.search.trim()}%`;
    //   query.andWhere('grade.isActive = :isActive', {
    //     isActive: params.isActive === 'true',
    //   });
    // }

    query.andWhere('grade.appId = :appId', { appId: appId });
    query.orderBy('grade.level', 'ASC');

    const features = new APIFeatures(query, queryString)
      .searching()
      // .sort()
      .limitFields()
      .paginate();

    const featureData = await features.getQuery().getMany();
    const total = await query.getCount();

    return { data: featureData, total };
  }

  //without pagination

  async findActiveSalaryGradeList(): Promise<EmpSalaryGrade[]> {
    const query = this.empSalaryGradeRepo.createQueryBuilder('grade');
    const appId = RequestContext.get('activeAppId');

    query
      .select([
        'grade.id',
        'grade.gradeName',
        'grade.gradeCode',
        'grade.minSalary',
        'grade.maxSalary',
      ])
      .where('grade.isActive = :isActive', { isActive: true })
      .andWhere('grade.appId = :appId', { appId });

    const list = await query.getMany();
    const newList: any = [];
    list.forEach((item) => {
      const newItem = {
        value: item.id,
        label: `${item.gradeName} (${item.minSalary} - ${item.maxSalary})`,
        gradeCode: item.gradeCode,
        minSalary: item.minSalary,
        maxSalary: item.maxSalary,
      };
      newList.push(newItem);
    });
    return newList;
  }

  // get salary grade by id
  async findSalaryGradeById(id: number): Promise<EmpSalaryGrade> {
    const appId = RequestContext.get('activeAppId');
    const salaryGrade = await this.empSalaryGradeRepo.findOne({
      where: { id, ...(appId ? { appId } : {}) },
    });
    if (!salaryGrade) throw new NotFoundException('Salary Grade not found');
    return salaryGrade;
  }

  // delete salary grade by id
  async deleteSalaryGradeById(id: number): Promise<void> {
    const appId = RequestContext.get('activeAppId');
    const salaryGrade = await this.empSalaryGradeRepo.findOne({
      where: { id, ...(appId ? { appId } : {}) },
    });
    if (!salaryGrade) throw new NotFoundException('Salary Grade not found');
    await this.empSalaryGradeRepo.remove(salaryGrade);
  }

  // Change active status
  async changeSalaryGradeActiveStatus(id: number) {
    const appId = RequestContext.get('activeAppId');
    const findItem = await this.empSalaryGradeRepo.findOne({
      where: { id, ...(appId ? { appId } : {}) },
    });
    if (!findItem)
      throw new NotFoundException(`Salary Grade with ID ${id} not found`);

    findItem.isActive = !findItem.isActive;
    return this.empSalaryGradeRepo.save(findItem);
  }

  // Create or update employee pay items

  async createOrUpdateEmpPayItem(dto: CreateEmpPayItemDto): Promise<any> {
    const userId = RequestContext.get('userId');
    const appId = RequestContext.get('activeAppId');

    dto.appId = appId ?? undefined;

    const existingCode = await this.empPayItemRepo.findOne({
      where: {
        itemCode: dto.itemCode,
        appId: appId,
        id: dto.id !== undefined ? Not(dto.id) : undefined,
      },
    });

    if (existingCode) {
      throw new BadRequestException({
        itemCode: [`Item code '${dto.itemCode}' already exists`],
      });
    }

    let payItem: EmpPayItem;
    if (dto.id) {
      const existingPayItem = await this.empPayItemRepo.findOne({
        where: { id: dto.id, ...(appId ? { appId } : {}) },
      });
      if (!existingPayItem) throw new NotFoundException('Pay Item not found');
      await this.empPayItemRepo.update({ id: dto.id, ...(appId ? { appId } : {}) }, dto);
      return await this.empPayItemRepo.findOne({
        where: { id: dto.id, ...(appId ? { appId } : {}) },
      });
    } else {
      payItem = this.empPayItemRepo.create({
        ...dto,
      });
      return await this.empPayItemRepo.save(payItem);
    }
  }

  // Get all employee pay items

  async findAllEmpPayItems(
    queryString: any,
  ): Promise<{ data: EmpPayItem[]; total: number }> {
    const userId = RequestContext.get('userId');
    const appId = RequestContext.get('activeAppId');

    const query = this.empPayItemRepo.createQueryBuilder('payItems');
    query.leftJoin('payItems.payItemType', 'payItemType');
    query.leftJoin('payItems.payItemCategory', 'payItemCategory');
    query.leftJoin('payItems.recurrenceType', 'recurrenceType');
    query.leftJoin('payItems.calculationMethod', 'calculationMethod');

    query.addSelect([
      'payItemType.id',
      'payItemType.name',
      'payItemType.code',
      'payItemType.colorName',

      'payItemCategory.id',
      'payItemCategory.name',
      'payItemCategory.code',
      'payItemCategory.colorName',

      'recurrenceType.id',
      'recurrenceType.name',
      'recurrenceType.code',
      'recurrenceType.colorName',

      'calculationMethod.id',
      'calculationMethod.name',
      'calculationMethod.code',
      'calculationMethod.colorName',
    ]);

    query.andWhere('payItems.appId = :appId', { appId: appId });
    query.orderBy('payItems.sortOrder', 'ASC');

    const params = queryString?.params ? JSON.parse(queryString.params) : {};

    if (params.search) {
      const search = `%${params.search.trim()}%`;
      query.andWhere(
        'payItems.itemName LIKE :search OR payItems.itemCode LIKE :search',
        { search },
      );
    }

    // if (params.isActive !== undefined) {
    //   query.andWhere('payItems.isActive = :isActive', {
    //     isActive: params.isActive === 'true',
    //   });
    // }

    const features = new APIFeatures(query, queryString)
      .searching()
      // .sort()
      .limitFields()
      .paginate();

    const featureData = await features.getQuery().getMany();
    const total = await query.getCount();

    return { data: featureData, total };
  }

  async findActivePayItemList(): Promise<EmpPayItem[]> {
    const query = this.empPayItemRepo.createQueryBuilder('item');
    const appId = RequestContext.get('activeAppId');

    query
      .select([
        'item.id',
        'item.itemName',
        'item.itemCode',
        'item.payItemTypeId',
        'item.payItemCategoryId',
      ])
      .where('item.isActive = :isActive', { isActive: true })
      .andWhere('item.appId = :appId', { appId });

    query.orderBy('item.sortOrder', 'ASC');

    const list = await query.getMany();
    const newList: any = [];
    list.forEach((item) => {
      const newItem = {
        value: item.id,
        label: item.itemName,
        itemCode: item.itemCode,
        payItemTypeId: item.payItemTypeId,
        payItemCategoryId: item.payItemCategoryId,
      };
      newList.push(newItem);
    });
    return newList;
  }

  // Get employee pay item by ID
  async findEmpPayItemById(id: number): Promise<EmpPayItem> {
    const appId = RequestContext.get('activeAppId');
    const payItem = await this.empPayItemRepo.findOne({
      where: { id, ...(appId ? { appId } : {}) },
    });
    if (!payItem) throw new NotFoundException('Pay Item not found');
    return payItem;
  }

  // Delete employee pay item by ID
  async deleteEmpPayItemById(id: number): Promise<void> {
    const appId = RequestContext.get('activeAppId');
    const payItem = await this.empPayItemRepo.findOne({
      where: { id, ...(appId ? { appId } : {}) },
    });
    if (!payItem) throw new NotFoundException('Pay Item not found');
    await this.empPayItemRepo.remove(payItem);
  }

  // Change employee pay item active status
  async changeEmpPayItemActiveStatus(id: number) {
    const appId = RequestContext.get('activeAppId');
    const findItem = await this.empPayItemRepo.findOne({
      where: { id, ...(appId ? { appId } : {}) },
    });
    if (!findItem)
      throw new NotFoundException(`Pay Item with ID ${id} not found`);

    findItem.isActive = !findItem.isActive;
    return this.empPayItemRepo.save(findItem);
  }

  // Change isTaxable status
  async changeEmpPayItemTaxableStatus(id: number): Promise<EmpPayItem> {
    const appId = RequestContext.get('activeAppId');
    const payItem = await this.empPayItemRepo.findOne({
      where: { id, ...(appId ? { appId } : {}) },
    });
    if (!payItem)
      throw new NotFoundException(`Pay Item with ID ${id} not found`);

    payItem.isTaxable = !payItem.isTaxable;
    return this.empPayItemRepo.save(payItem);
  }

  // Create or update grade rule
  async createOrUpdateGradeRule(
    dto: CreateEmpSalaryGradeRuleDto,
  ): Promise<EmpSalaryGradeRule> {
    const userId = RequestContext.get('userId');
    const appId = RequestContext.get('activeAppId');

    dto.appId = appId ?? undefined;

    if (dto.maxBasic < dto.minBasic) {
      throw new BadRequestException(
        'Maximum basic cannot be less than minimum basic',
      );
    }

    let rule: EmpSalaryGradeRule;
    if (dto.id) {
      const existing = await this.empSalaryGradeRuleRepo.findOne({
        where: { id: dto.id, ...(appId ? { appId } : {}) },
      });
      if (!existing) throw new NotFoundException('Salary Grade Rule not found');
      rule = existing;
      this.empSalaryGradeRuleRepo.merge(rule, dto);
    } else {
      rule = this.empSalaryGradeRuleRepo.create({
        ...dto,
      });
    }

    // Clean date inputs safely
    const effectiveFrom =
      dto.effectiveFrom && dto.effectiveFrom.trim() !== ''
        ? new Date(dto.effectiveFrom)
        : null;

    const effectiveTo =
      dto.effectiveTo && dto.effectiveTo.trim() !== ''
        ? new Date(dto.effectiveTo)
        : null;

    // Validate effectiveFrom (cannot be null or invalid)
    if (!effectiveFrom || isNaN(effectiveFrom.getTime())) {
      throw new BadRequestException({
        effectiveFrom: ['Effective from date is required'],
      });
    }

    // Validate effectiveTo only if provided
    if (effectiveTo && isNaN(effectiveTo.getTime())) {
      throw new BadRequestException({
        effectiveTo: ['Effective to date is required'],
      });
    }

    rule.effectiveFrom = effectiveFrom;
    rule.effectiveTo = effectiveTo;

    return this.empSalaryGradeRuleRepo.save(rule);
  }

  // Get all with pagination
  async findAllGradeRules(
    queryString: any,
  ): Promise<{ data: EmpSalaryGradeRule[]; total: number }> {
    const appId = RequestContext.get('activeAppId');

    const query = this.empSalaryGradeRuleRepo.createQueryBuilder('rule');

    query.leftJoin('rule.grade', 'grade');
    query.leftJoin('rule.payItem', 'payItem');
    query.leftJoin('rule.calculationMethod', 'calculationMethod');

    query.addSelect([
      'grade.id',
      'grade.gradeName',
      'grade.minSalary',
      'grade.maxSalary',
      'grade.gradeCode',
      'grade.description',

      'payItem.id',
      'payItem.itemName',
      'payItem.itemCode',
      'payItem.isTaxable',
      'payItem.isActive',

      'calculationMethod.id',
      'calculationMethod.name',
      'calculationMethod.code',
      'calculationMethod.colorName',
    ]);

    query.andWhere('rule.appId = :appId', { appId });

    const params = queryString?.params ? JSON.parse(queryString.params) : {};
    if (params.search) {
      const search = `%${params.search.trim()}%`;
      query.andWhere(
        'rule.percentage LIKE :search OR rule.minBasic LIKE :search OR rule.maxBasic LIKE :search',
        { search },
      );
    }

    const features = new APIFeatures(query, queryString)
      .searching()
      .sort()
      .limitFields()
      .paginate();

    const data = await features.getQuery().getMany();
    const total = await query.getCount();

    return { data, total };
  }

  // Get by ID
  async findGradeRuleById(id: number): Promise<EmpSalaryGradeRule> {
    const appId = RequestContext.get('activeAppId');
    const rule = await this.empSalaryGradeRuleRepo.findOne({
      where: { id, ...(appId ? { appId } : {}) },
    });
    if (!rule) throw new NotFoundException('Salary Grade Rule not found');
    return rule;
  }

  async findGradeRuleByQueryParams(queryString: any): Promise<any> {
    const appId = RequestContext.get('activeAppId');

    const response = {
      payItemId: 0,
      fixedAmount: 0.0,
      percentage: 0.0,
      calculatedAmount: 0.0,
      payItemType: '',
    };

    const params = queryString?.params ? JSON.parse(queryString.params) : {};
    if (!params) return response;

    if (params.payItemId) {
      response.payItemId = params.payItemId;
    }

    const payItemQuery = this.empPayItemRepo
      .createQueryBuilder('payItem')
      .leftJoinAndSelect('payItem.payItemType', 'payItemType')
      .andWhere('payItem.isActive = :isActive', { isActive: true })
      .andWhere('payItem.id = :payItemId', {
        payItemId: params.payItemId,
      });

    if (appId) {
      payItemQuery.andWhere('payItem.appId = :appId', { appId });
    }

    const payItem = await payItemQuery.getOne();

    if (!payItem) return response;

    if (payItem) {
      response.payItemType =
        payItem.payItemType?.code === 'pay_item_type_earning' ||
        payItem.payItemTypeId === 194
          ? 'Earning'
          : 'Deduction';
    }
    const query = this.empSalaryGradeRuleRepo.createQueryBuilder('rule');
    query.andWhere('rule.isActive = :isActive', { isActive: true });
    if (appId) {
      query.andWhere('rule.appId = :appId', { appId });
    }

    if (params.gradeId) {
      query.andWhere('rule.gradeId = :gradeId', { gradeId: params.gradeId });
    }

    if (params.payItemId) {
      query.andWhere('rule.payItemId = :payItemId', {
        payItemId: params.payItemId,
      });
    }

    if (params.calculationMethodId) {
      query.andWhere('rule.calculationMethodId = :calculationMethodId', {
        calculationMethodId: params.calculationMethodId,
      });
    }

    if (params.search) {
      const search = `%${params.search.trim()}%`;
      query.andWhere(
        'rule.percentage LIKE :search OR rule.minBasic LIKE :search OR rule.maxBasic LIKE :search',
        { search },
      );
    }

    query.orderBy('rule.id', 'DESC');

    const gradeRule = await query.getOne();

    if (gradeRule) {
      response.payItemId = gradeRule.payItemId;
      response.fixedAmount = gradeRule.fixedAmount
        ? gradeRule.fixedAmount
        : 0.0;
      response.percentage = gradeRule.percentage ? gradeRule.percentage : 0.0;
      // response.calculatedAmount = gradeRule.calculatedAmount;
      return response;
    }

    if (payItem) {
      response.payItemId = payItem.id;
      if (payItem.calculationMethodId === 205) {
        response.percentage = payItem.calcValue ? payItem.calcValue : 0.0;
      }
      if (payItem.calculationMethodId === 204) {
        response.fixedAmount = payItem.calcValue ? payItem.calcValue : 0.0;
      }
      // response.calculatedAmount = payItem.calculatedAmount;
      return response;
    }

    // if (!rule) throw new NotFoundException('Salary Grade Rule not found');

    return response;
  }

  // Delete
  async deleteGradeRuleById(id: number): Promise<void> {
    const appId = RequestContext.get('activeAppId');
    const rule = await this.empSalaryGradeRuleRepo.findOne({
      where: { id, ...(appId ? { appId } : {}) },
    });
    if (!rule) throw new NotFoundException('Salary Grade Rule not found');
    await this.empSalaryGradeRuleRepo.remove(rule);
  }

  // Change active status
  async changeGradeRuleActiveStatus(id: number): Promise<EmpSalaryGradeRule> {
    const appId = RequestContext.get('activeAppId');
    const rule = await this.empSalaryGradeRuleRepo.findOne({
      where: { id, ...(appId ? { appId } : {}) },
    });
    if (!rule) throw new NotFoundException('Salary Grade Rule not found');

    rule.isActive = !rule.isActive;
    return this.empSalaryGradeRuleRepo.save(rule);
  }

  //Create or Update Salary History
  async createOrUpdateSalaryHistory(
    dto: CreateEmpSalaryHistoryDto,
  ): Promise<EmpSalaryHistory> {
    const userId = RequestContext.get('userId');
    const appId = RequestContext.get('activeAppId');

    dto.appId = appId ?? undefined;
    dto.createdBy = userId ?? undefined;

    let history: EmpSalaryHistory;

    if (dto.id) {
      const existing = await this.empSalaryHistoryRepo.findOne({
        where: { id: dto.id, ...(appId ? { appId } : {}) },
      });

      if (!existing) throw new NotFoundException('Salary history not found');

      this.empSalaryHistoryRepo.merge(existing, dto);
      history = existing;
    } else {
      history = this.empSalaryHistoryRepo.create({
        ...dto,
      });
    }

    return this.empSalaryHistoryRepo.save(history);
  }

  // Create or Update Salary Structure
  async createOrUpdateSalaryStructure(
    dto: CreateEmpSalaryStructureDto,
  ): Promise<any> {
    const userId = RequestContext.get('userId');
    const appId = RequestContext.get('activeAppId');

    dto.appId = appId;
    dto.createdBy = userId;

    if (dto.gradeId && dto.basicSalary !== undefined) {
      const grade = await this.empSalaryGradeRepo.findOne({
        where: { id: dto.gradeId, ...(appId ? { appId } : {}) },
      });
      if (
        grade &&
        (Number(dto.basicSalary) < Number(grade.minSalary) ||
          Number(dto.basicSalary) > Number(grade.maxSalary))
      ) {
        throw new BadRequestException({
          basicSalary: [
            `Basic salary must be between ${grade.minSalary} and ${grade.maxSalary} for salary grade '${grade.gradeName}'`,
          ],
        });
      }
    }

    let salaryStructure: EmpSalaryStructure;

    if (dto.id) {
      const existing = await this.empSalaryStructureRepo.findOne({
        where: { id: dto.id, ...(appId ? { appId } : {}) },
      });

      if (!existing) throw new NotFoundException('Salary Structure not found');

      const oldGradeId = existing.gradeId;
      const oldBasicSalary = existing.basicSalary ?? 0;
      const oldGrossSalary = existing.grossSalary ?? 0;
      const oldNetSalary = existing.netSalary ?? 0;
      // const oldCurrency = existing.currency ?? 'INR';
      const oldCurrency = existing.currency ?? null;

      await this.createSalaryStructureHistory(existing, dto);
      this.empSalaryStructureRepo.merge(existing, dto);
      salaryStructure = await this.empSalaryStructureRepo.save(existing);
    } else {
      // Deactivate any currently active salary structure for this employee under this tenant
      if (dto.empId) {
        const existingActiveStructures = await this.empSalaryStructureRepo.find({
          where: {
            empId: dto.empId,
            isActive: true,
            ...(appId ? { appId } : {}),
          },
        });
        for (const activeStruct of existingActiveStructures) {
          activeStruct.isActive = false;
          if (dto.effectiveFrom) {
            const dayBefore = new Date(dto.effectiveFrom);
            dayBefore.setDate(dayBefore.getDate() - 1);
            activeStruct.effectiveTo = dayBefore;
          }
          await this.empSalaryStructureRepo.save(activeStruct);
        }
      }

      salaryStructure = this.empSalaryStructureRepo.create(dto);
      salaryStructure.approvedBy = userId;
      salaryStructure.approvedAt = new Date();
      salaryStructure.isApproved = true;
      salaryStructure.isActive = true;
      salaryStructure = await this.empSalaryStructureRepo.save(salaryStructure);
      await this.createSalaryStructureHistory(salaryStructure);
    }

    // Handle Salary Structure Details
    if (dto.empSalaryStructureDetails?.length) {
      await this.empSalaryStructureDetailsRepo.delete({
        appId,
        salaryStructureId: salaryStructure.id,
      });

      const details = dto.empSalaryStructureDetails.map((item) =>
        this.empSalaryStructureDetailsRepo.create({
          appId,
          salaryStructureId: salaryStructure.id,
          payItemId: item.payItemId,
          amount: item.amount,
          percentage: item.percentage,
          calculatedAmount: item.calculatedAmount,
        }),
      );

      await this.empSalaryStructureDetailsRepo.save(details);
    }

    return {
      salaryStructure,
      empSalaryStructureDetails: dto.empSalaryStructureDetails ?? [],
    };
  }

  async createSalaryStructureHistory(
    salaryStructure: EmpSalaryStructure,
    newSalaryStructure: any = null,
  ) {
    const userId = RequestContext.get('userId');
    const appId = RequestContext.get('activeAppId');

    if (salaryStructure && newSalaryStructure) {
      const oldGradeId = salaryStructure.gradeId;
      const oldBasicSalary = salaryStructure.basicSalary ?? 0;
      const oldGrossSalary = salaryStructure.grossSalary ?? 0;
      const oldNetSalary = salaryStructure.netSalary ?? 0;
      const oldCurrency = salaryStructure.currency ?? null;

      let salaryEventTypeId = 210; //joined
      if (
        newSalaryStructure.gradeId &&
        newSalaryStructure.gradeId !== oldGradeId
      ) {
        salaryEventTypeId = 211; // Promotion
      } else if (
        newSalaryStructure.basicSalary &&
        newSalaryStructure.basicSalary > oldBasicSalary
      ) {
        salaryEventTypeId = 212; // Increment
      }

      await this.createOrUpdateSalaryHistory({
        id: 0,
        appId,
        empId: salaryStructure.empId,
        salaryStructureId: salaryStructure.id,
        salaryEventTypeId,
        oldGradeId,
        newGradeId: newSalaryStructure.gradeId ?? oldGradeId,
        oldBasicSalary,
        newBasicSalary: newSalaryStructure.basicSalary ?? oldBasicSalary,
        oldGrossSalary,
        newGrossSalary: newSalaryStructure.grossSalary ?? oldGrossSalary,
        oldNetSalary,
        newNetSalary: newSalaryStructure.netSalary ?? oldNetSalary,
        oldCurrency,
        newCurrency: newSalaryStructure.currency ?? oldCurrency,
        effectiveFrom:
          newSalaryStructure.effectiveFrom ?? salaryStructure.effectiveFrom,
        effectiveTo:
          newSalaryStructure.effectiveTo ?? salaryStructure.effectiveTo,
        createdBy: userId,
        changedBy: userId,
      });
    }

    if (salaryStructure && !newSalaryStructure) {
      await this.createOrUpdateSalaryHistory({
        id: 0,
        appId,
        empId: salaryStructure.empId,
        salaryStructureId: salaryStructure.id,
        salaryEventTypeId: 210, // Joining
        newGradeId: salaryStructure.gradeId,
        newBasicSalary: salaryStructure.basicSalary,
        newGrossSalary: salaryStructure.grossSalary ?? 0,
        newNetSalary: salaryStructure.netSalary ?? 0,
        newCurrency: salaryStructure.currency ?? 'INR',
        effectiveFrom: salaryStructure.effectiveFrom,
        effectiveTo: salaryStructure.effectiveTo ?? null,
        createdBy: userId,
        changedBy: userId,
      });
    }
  }

  async findAllSalaryStructures(
    queryString: any,
  ): Promise<{ data: EmpSalaryStructure[]; total: number }> {
    const appId = RequestContext.get('activeAppId');

    const query = this.empSalaryStructureRepo
      .createQueryBuilder('structure')
      .leftJoin('structure.employee', 'employee')
      .leftJoin('employee.designation', 'designation')
      .leftJoin('designation.department', 'department')
      .leftJoin('employee.office', 'office')
      .leftJoin('office.officeType', 'officeType')
      .leftJoin('employee.officeShift', 'officeShift')
      .leftJoin('employee.employmentStatus', 'employmentStatus')
      .leftJoin('employee.employeeStatus', 'employeeStatus')
      .leftJoin('employee.user', 'user')
      .leftJoin('user.profile', 'userProfile')
      .leftJoin('userProfile.profilePicture', 'profilePicture')
      .leftJoin('userProfile.phoneCountry', 'phoneCountry')
      .leftJoin('structure.grade', 'grade')
      .leftJoinAndSelect('structure.salaryStructureDetails', 'details')
      .leftJoinAndSelect('details.payItem', 'payItem')

      .where('structure.appId = :appId', { appId })
      .orderBy('structure.effectiveFrom', 'DESC');

    query.addSelect([
      'employee.id',
      'employee.designationId',
      'designation.id',
      'designation.name',
      'department.id',
      'department.name',
      'office.name',
      'officeType.id',
      'officeType.name',

      'officeShift.name',
      'officeShift.startTime',
      'officeShift.endTime',
      'employmentStatus.name',
      'employmentStatus.code',
      'employmentStatus.colorName',

      'user.firstName',
      'user.lastName',
      'user.email',
      'user.isActive',
      'userProfile.id',
      'userProfile.phoneCountryId',
      'phoneCountry.callingCode',
      'userProfile.phone',
      'userProfile.gender',
      'profilePicture.id',
      'profilePicture.filename',

      'grade.id',
      'grade.gradeName',
      'grade.minSalary',
      'grade.maxSalary',
      'grade.gradeCode',
    ]);

    const params = queryString?.params ? JSON.parse(queryString.params) : {};
    if (params.search) {
      const search = `%${params.search.trim()}%`;
      query.andWhere(
        'user.firstName LIKE :search OR user.lastName LIKE :search OR employee.employeeCode LIKE :search',
        { search },
      );
    }

    if (params.status) {
      query.andWhere('structure.isActive = :isActive', {
        isActive: params.status === 'true',
      });
    }

    if (params.gradeId) {
      query.andWhere('structure.gradeId = :gradeId', {
        gradeId: params.gradeId,
      });
    }

    if (params.effectiveFrom && params.effectiveTo) {
      query.andWhere(
        'DATE(structure.effectiveFrom) >= :effectiveFrom AND DATE(structure.effectiveTo) <= :effectiveTo',
        {
          effectiveFrom: params.effectiveFrom,
          effectiveTo: params.effectiveTo,
        },
      );
    }

    if (params.effectiveFrom && !params.effectiveTo) {
      query.andWhere('DATE(structure.effectiveFrom) >= :effectiveFrom', {
        effectiveFrom: params.effectiveFrom,
      });
    }

    if (params.officeId) {
      query.andWhere('employee.officeId = :officeId', {
        officeId: params.officeId,
      });
    }

    if (params.designationId) {
      query.andWhere('employee.designationId = :designationId', {
        designationId: params.designationId,
      });
    }

    if (params.departmentId) {
      query.andWhere('designation.departmentId = :departmentId', {
        departmentId: params.departmentId,
      });
    }

    const features = new APIFeatures(query, queryString)
      //.searching()
      .sort()
      .limitFields()
      .paginate();

    const data = await features.getQuery().getMany();
    const total = await query.getCount();

    return { data, total };
  }

  // Get Salary Structure by ID
  async findSalaryStructureById(id: number): Promise<EmpSalaryStructure> {
    const appId = RequestContext.get('activeAppId');
    const structure = await this.empSalaryStructureRepo.findOne({
      where: { id, ...(appId ? { appId } : {}) },
    });
    if (!structure) throw new NotFoundException('Salary Structure not found');
    return structure;
  }

  async findSalaryStructureByEmployeeId(id: number): Promise<any> {
    const appId = RequestContext.get('activeAppId');

    const structure =
      (await this.empSalaryStructureRepo.findOne({
        where: { empId: id, isActive: true, ...(appId ? { appId } : {}) },
        order: { id: 'DESC' },
      })) ||
      (await this.empSalaryStructureRepo.findOne({
        where: { empId: id, ...(appId ? { appId } : {}) },
        order: { id: 'DESC' },
      }));

    if (!structure) throw new NotFoundException('Salary Structure not found');

    const details = await this.empSalaryStructureDetailsRepo.find({
      where: { salaryStructureId: structure.id, ...(appId ? { appId } : {}) },
      relations: ['payItem'],
    });

    return { ...structure, salaryStructureDetails: details };
  }

  async findSalaryStructureWithDetailsById(
    id: number,
  ): Promise<EmpSalaryStructure> {
    const appId = RequestContext.get('activeAppId');
    const structure = await this.empSalaryStructureRepo.findOne({
      where: { id, ...(appId ? { appId } : {}) },
    });
    if (!structure) throw new NotFoundException('Salary Structure not found');
    return structure;
  }

  // Delete Salary Structure
  async deleteSalaryStructureById(id: number): Promise<void> {
    const appId = RequestContext.get('activeAppId');
    const structure = await this.empSalaryStructureRepo.findOne({
      where: { id, ...(appId ? { appId } : {}) },
    });
    if (!structure) throw new NotFoundException('Salary Structure not found');
    await this.empSalaryStructureRepo.remove(structure);
  }

  // Change Active Status
  async changeSalaryStructureActiveStatus(
    id: number,
  ): Promise<EmpSalaryStructure> {
    const appId = RequestContext.get('activeAppId');
    const structure = await this.empSalaryStructureRepo.findOne({
      where: { id, ...(appId ? { appId } : {}) },
    });
    if (!structure)
      throw new NotFoundException(`Salary Structure with ID ${id} not found`);

    structure.isActive = !structure.isActive;
    return await this.empSalaryStructureRepo.save(structure);
  }

  // Create or update salary structure detail
  // async createOrUpdateSalaryStructureDetails(
  //   dto: CreateEmpSalaryStructureDetailsDto,
  // ): Promise<EmpSalaryStructureDetails> {
  //   const userId = RequestContext.get('userId');
  //   const appUser = await this.appUserRepo.findOne({ where: { userId } });
  //   if (!appUser) throw new NotFoundException('App User not found');

  //   dto.appId = appUser.appId ?? undefined;

  //   const salaryStructure = await this.empSalaryStructureRepo.findOne({
  //     where: { id: dto.salaryStructureId },
  //   });

  //   if (!salaryStructure)
  //     throw new NotFoundException('Salary Structure not found');
  //   dto.salaryStructureId = salaryStructure.id;

  //   const payItem = await this.empPayItemRepo.findOne({
  //     where: { id: dto.payItemId },
  //   });
  //   if (!payItem) throw new NotFoundException('Pay Item not found');
  //   dto.payItemId = payItem.id;

  //   let detail: EmpSalaryStructureDetails;

  //   if (dto.id) {
  //     const existing = await this.empSalaryStructureDetailsRepo.findOne({
  //       where: { id: dto.id },
  //     });
  //     if (!existing)
  //       throw new NotFoundException(
  //         `Salary Structure Detail with ID ${dto.id} not found`,
  //       );

  //     detail = existing;
  //     this.empSalaryStructureDetailsRepo.merge(detail, dto);
  //   } else {
  //     detail = this.empSalaryStructureDetailsRepo.create(dto);
  //   }

  //   return await this.empSalaryStructureDetailsRepo.save(detail);
  // }

  // Get all salary structure details with pagination
  // async findAllSalaryStructureDetails(
  //   queryString: any,
  // ): Promise<{ data: EmpSalaryStructureDetails[]; total: number }> {
  //   const userId = RequestContext.get('userId');
  //   const appUser = await this.appUserRepo.findOne({ where: { userId } });
  //   if (!appUser) throw new NotFoundException('App User not found');
  //   const query =
  //     this.empSalaryStructureDetailsRepo.createQueryBuilder('detail');

  //   query.leftJoin('detail.salaryStructure', 'salaryStructure');
  //   query.leftJoin('detail.payItem', 'payItem');

  //   query.addSelect([
  //     'salaryStructure.id',
  //     'salaryStructure.basicSalary',
  //     'salaryStructure.isActive',
  //     'salaryStructure.remarks',

  //     'payItem.id',
  //     'payItem.itemCode',
  //     'payItem.itemName',
  //     'payItem.isActive',
  //   ]);

  //   query.andWhere('detail.appId = :appId', { appId: appUser.appId });

  //   const params = queryString?.params ? JSON.parse(queryString.params) : {};
  //   if (params.search) {
  //     const search = `%${params.search.trim()}%`;
  //     query.andWhere(
  //       'detail.amount LIKE :search OR detail.calculatedAmount LIKE :search',
  //       { search },
  //     );
  //   }

  //   const features = new APIFeatures(query, queryString)
  //     .searching()
  //     .sort()
  //     .limitFields()
  //     .paginate();

  //   const data = await features.getQuery().getMany();
  //   const total = await query.getCount();

  //   return { data, total };
  // }

  // Get detail by ID
  // async findSalaryStructureDetailsById(
  //   id: number,
  // ): Promise<EmpSalaryStructureDetails> {
  //   const detail = await this.empSalaryStructureDetailsRepo.findOne({
  //     where: { id },
  //   });
  //   if (!detail)
  //     throw new NotFoundException(
  //       `Salary Structure Detail with ID ${id} not found`,
  //     );
  //   return detail;
  // }

  //  Delete detail by ID
  // async deleteSalaryStructureDetailsById(id: number): Promise<void> {
  //   const detail = await this.empSalaryStructureDetailsRepo.findOne({
  //     where: { id },
  //   });
  //   if (!detail)
  //     throw new NotFoundException(
  //       `Salary Structure Detail with ID ${id} not found`,
  //     );
  //   await this.empSalaryStructureDetailsRepo.remove(detail);
  // }

  async createPromotion(dto: CreateEmpPromotionDto): Promise<EmpPromotion> {
    const userId = RequestContext.get('userId');
    const appId = RequestContext.get('activeAppId');

    if (!appId) throw new BadRequestException('Active app not found');

    dto.appId = appId ?? undefined;

    return this.dataSource.transaction(async (manager) => {
      const empRepo = manager.getRepository(Employee);
      const promoRepo = manager.getRepository(EmpPromotion);
      const salaryStructureRepo = manager.getRepository(EmpSalaryStructure);
      const salaryStructureDetailsRepo = manager.getRepository(
        EmpSalaryStructureDetails,
      );
      const gradeRepo = manager.getRepository(EmpSalaryGrade);
      const statusRepo = manager.getRepository(Status);
      const desigRepo = manager.getRepository(Designation);

      const employee = await empRepo.findOne({
        where: { id: dto.employeeId, appId },
      });
      if (!employee) throw new NotFoundException('Employee not found');

      // Date validation
      if (
        dto.promotionDate &&
        dto.effectiveDate &&
        new Date(dto.effectiveDate) < new Date(dto.promotionDate)
      ) {
        throw new BadRequestException(
          'Effective date must be on or after the Promotion/Action date',
        );
      }

      // Identify the movement action type
      const eventStatus = dto.actionStatusId
        ? await statusRepo.findOne({ where: { id: dto.actionStatusId } })
        : null;
      const eventCode = eventStatus?.code || '';

      const isPromotion =
        eventCode === 'employee_events_promotion' ||
        eventCode === 'salary_event_type_promotion' ||
        dto.actionStatusId === 235;

      const isDemotion =
        eventCode === 'employee_events_demotion' ||
        eventCode === 'salary_event_type_demotion' ||
        dto.actionStatusId === 269 ||
        dto.actionStatusId === 219;

      const isIncrement =
        eventCode === 'employee_events_salary_increment' ||
        eventCode === 'salary_event_type_salary_increment' ||
        dto.actionStatusId === 236 ||
        dto.actionStatusId === 213;

      const isDecrement =
        eventCode === 'employee_events_salary_decrement' ||
        dto.actionStatusId === 270;

      const isPromotionWithoutIncrement =
        eventCode === 'oyee_events_promotion_without_increment' ||
        eventCode.includes('promotion_without_increment') ||
        dto.actionStatusId === 237;

      const oldDesignationId = employee.designationId ?? null;
      const oldGradeId = employee.currentGradeId ?? null;
      const oldBasicSalary = employee.currentBasicSalary
        ? Number(employee.currentBasicSalary)
        : null;

      let newDesignationId = dto.newDesignationId ?? employee.designationId;
      let newGradeId = dto.newGradeId ?? employee.currentGradeId;
      let newBasicSalary =
        dto.newBasicSalary !== undefined && dto.newBasicSalary !== null
          ? Number(dto.newBasicSalary)
          : oldBasicSalary;

      // Scenario validations
      if (isPromotion) {
        if (!newDesignationId) {
          throw new BadRequestException('New designation is required for Promotion');
        }
        if (
          oldDesignationId &&
          Number(newDesignationId) === Number(oldDesignationId)
        ) {
          throw new BadRequestException(
            'New designation must be different from current designation for a Promotion',
          );
        }
        if (
          oldBasicSalary !== null &&
          newBasicSalary !== null &&
          Number(newBasicSalary) < Number(oldBasicSalary)
        ) {
          throw new BadRequestException(
            'New basic salary cannot be lower than current basic salary for a Promotion. Consider Demotion or Decrement if decreasing.',
          );
        }
      } else if (isDemotion) {
        if (!newDesignationId) {
          throw new BadRequestException('New designation is required for Demotion');
        }
        if (
          oldDesignationId &&
          Number(newDesignationId) === Number(oldDesignationId)
        ) {
          throw new BadRequestException(
            'New designation must be different from current designation for a Demotion',
          );
        }
        if (!dto.reason || dto.reason.trim().length === 0) {
          throw new BadRequestException(
            'A reason is mandatory for an employee Demotion',
          );
        }
      } else if (isIncrement) {
        // In increment, designation does not change
        newDesignationId = oldDesignationId;
        if (newBasicSalary === null || newBasicSalary === undefined) {
          throw new BadRequestException(
            'New basic salary is required for Salary Increment',
          );
        }
        if (
          oldBasicSalary !== null &&
          Number(newBasicSalary) <= Number(oldBasicSalary)
        ) {
          throw new BadRequestException(
            'New basic salary must be strictly greater than current basic salary for an Increment',
          );
        }
      } else if (isDecrement) {
        // In decrement, designation does not change
        newDesignationId = oldDesignationId;
        if (newBasicSalary === null || newBasicSalary === undefined) {
          throw new BadRequestException(
            'New basic salary is required for Salary Decrement',
          );
        }
        if (
          oldBasicSalary !== null &&
          Number(newBasicSalary) >= Number(oldBasicSalary)
        ) {
          throw new BadRequestException(
            'New basic salary must be strictly lower than current basic salary for a Decrement',
          );
        }
        if (!dto.reason || dto.reason.trim().length === 0) {
          throw new BadRequestException(
            'A reason is mandatory for a salary Decrement',
          );
        }
      } else if (isPromotionWithoutIncrement) {
        if (!newDesignationId) {
          throw new BadRequestException(
            'New designation is required for Promotion without Increment',
          );
        }
        if (
          oldDesignationId &&
          Number(newDesignationId) === Number(oldDesignationId)
        ) {
          throw new BadRequestException(
            'New designation must be different from current designation for a Promotion',
          );
        }
        // Basic salary and Grade stay same as current
        newGradeId = oldGradeId;
        newBasicSalary = oldBasicSalary;
      }

      // Check Grade Bounds for the effective grade
      const targetGradeId = newGradeId ?? oldGradeId;
      if (targetGradeId && newBasicSalary !== null) {
        const grade = await gradeRepo.findOne({
          where: { id: targetGradeId, appId },
        });
        if (grade) {
          if (
            Number(newBasicSalary) < Number(grade.minSalary) ||
            Number(newBasicSalary) > Number(grade.maxSalary)
          ) {
            throw new BadRequestException(
              `New basic salary (${newBasicSalary}) must be within the salary range of grade '${grade.gradeName}' (${grade.minSalary} - ${grade.maxSalary})`,
            );
          }
        }
      }

      // Create promotion history record
      const promotion = promoRepo.create({
        appId,
        employeeId: employee.id,
        actionStatusId: dto.actionStatusId ?? null,
        oldDesignationId,
        newDesignationId,
        oldGradeId,
        newGradeId,
        oldBasicSalary,
        newBasicSalary,
        promotionDate: dto.promotionDate,
        effectiveDate: dto.effectiveDate,
        endDate: dto.endDate ?? null,
        reason: dto.reason ?? null,
        approvedBy: userId,
      });

      const saved = await promoRepo.save(promotion);

      // Update employee profile
      await empRepo.update(
        { id: employee.id, appId },
        {
          designationId: newDesignationId,
          currentGradeId: newGradeId,
          currentBasicSalary: newBasicSalary ?? undefined,
        },
      );

      // Salary Structure handling:
      // If basic salary changed or grade changed, create a new salary structure and deactivate old
      let newSalaryStructure: EmpSalaryStructure | null = null;
      let latestOldStructure: EmpSalaryStructure | null = null;

      const salaryOrGradeChanged =
        (newBasicSalary !== null &&
          Number(newBasicSalary) !== Number(oldBasicSalary)) ||
        (newGradeId !== null && Number(newGradeId) !== Number(oldGradeId));

      if (salaryOrGradeChanged && newBasicSalary !== null) {
        // Find existing active salary structures and deactivate them
        const existingActiveStructures = await salaryStructureRepo.find({
          where: { empId: employee.id, appId, isActive: true },
          order: { id: 'DESC' },
        });

        const dayBefore = new Date(dto.effectiveDate);
        dayBefore.setDate(dayBefore.getDate() - 1);

        for (const activeStruct of existingActiveStructures) {
          activeStruct.isActive = false;
          activeStruct.effectiveTo = dayBefore;
          await salaryStructureRepo.save(activeStruct);
        }

        latestOldStructure = existingActiveStructures[0] || null;

        // Create new salary structure
        newSalaryStructure = await salaryStructureRepo.save(
          salaryStructureRepo.create({
            appId,
            empId: employee.id,
            gradeId: newGradeId,
            effectiveFrom: new Date(dto.effectiveDate),
            basicSalary: newBasicSalary,
            currency: latestOldStructure?.currency ?? 'BDT',
            approvedBy: userId,
            isApproved: true,
            approvedAt: new Date(),
            isActive: true,
            createdBy: userId,
            grossSalary: 0,
            totalDeductions: 0,
            netSalary: 0,
          } as DeepPartial<EmpSalaryStructure>),
        );

        // Fetch details from the old structure if available to clone
        const oldDetails = latestOldStructure
          ? await salaryStructureDetailsRepo.find({
              where: { salaryStructureId: latestOldStructure.id },
              relations: [
                'payItem',
                'payItem.payItemCategory',
                'payItem.payItemType',
              ],
            })
          : [];

        let calculatedGross = 0;
        let calculatedDeductions = 0;

        if (oldDetails.length > 0) {
          for (const oldDetail of oldDetails) {
            const isBasic =
              oldDetail.payItem?.payItemCategory?.code ===
              'pay_item_category_basic';
            const percentage = Number(oldDetail.percentage ?? 0);
            const isPercentage = percentage > 0;

            let calculatedAmount = Number(oldDetail.calculatedAmount ?? 0);
            if (isBasic) {
              calculatedAmount = Number(newBasicSalary);
            } else if (isPercentage) {
              calculatedAmount = Number(newBasicSalary) * (percentage / 100);
            }

            calculatedAmount = Number(calculatedAmount.toFixed(2));

            const newDetail = salaryStructureDetailsRepo.create({
              appId,
              salaryStructureId: newSalaryStructure.id,
              payItemId: oldDetail.payItemId,
              amount: isBasic ? Number(newBasicSalary) : oldDetail.amount,
              percentage: oldDetail.percentage,
              calculatedAmount,
            });
            await salaryStructureDetailsRepo.save(newDetail);

            const isDeduction =
              oldDetail.payItem?.payItemType?.code ===
              'pay_item_type_deduction';
            if (isDeduction) {
              calculatedDeductions += calculatedAmount;
            } else {
              calculatedGross += calculatedAmount;
            }
          }
        } else {
          // If no previous detail lines existed, default gross to basicSalary
          calculatedGross = Number(newBasicSalary);
        }

        newSalaryStructure.grossSalary = Number(calculatedGross.toFixed(2));
        newSalaryStructure.totalDeductions = Number(
          calculatedDeductions.toFixed(2),
        );
        newSalaryStructure.netSalary = Number(
          (calculatedGross - calculatedDeductions).toFixed(2),
        );
        newSalaryStructure.updatedAt = new Date();
        await salaryStructureRepo.save(newSalaryStructure);
      }

      if (!latestOldStructure) {
        latestOldStructure = await salaryStructureRepo.findOne({
          where: { empId: employee.id, appId, isActive: true },
          order: { id: 'DESC' },
        });
      }

      // Persist to EmpSalaryHistory so both the company user (/hr-dashboard/employee/:id)
      // and the employee (/my-profile) can see this movement in their Employee History tab
      const salaryHistoryRepo = manager.getRepository(EmpSalaryHistory);
      const basicDiff =
        oldBasicSalary !== null && newBasicSalary !== null
          ? Number(newBasicSalary) - Number(oldBasicSalary)
          : 0;
      const basicPercent =
        oldBasicSalary && oldBasicSalary > 0
          ? Number(((basicDiff / oldBasicSalary) * 100).toFixed(2))
          : 0;

      const movementReason =
        dto.reason ??
        (isPromotion
          ? 'Employee Promotion'
          : isDemotion
            ? 'Employee Demotion'
            : isIncrement
              ? 'Salary Increment'
              : isDecrement
                ? 'Salary Decrement'
                : 'Promotion without Increment');

      const salaryHistory = salaryHistoryRepo.create({
        appId,
        empId: employee.id,
        salaryStructureId:
          newSalaryStructure?.id ?? latestOldStructure?.id ?? null,
        salaryEventTypeId: dto.actionStatusId ?? null,
        changeReason: movementReason,
        oldGradeId,
        oldBasicSalary,
        oldGrossSalary: latestOldStructure?.grossSalary ?? null,
        oldNetSalary: latestOldStructure?.netSalary ?? null,
        newGradeId,
        newBasicSalary,
        newGrossSalary:
          newSalaryStructure?.grossSalary ??
          latestOldStructure?.grossSalary ??
          null,
        newNetSalary:
          newSalaryStructure?.netSalary ??
          latestOldStructure?.netSalary ??
          null,
        basicIncrementAmount: basicDiff,
        basicIncrementPercentage: basicPercent,
        effectiveFrom: new Date(dto.effectiveDate),
        effectiveTo: dto.endDate ? new Date(dto.endDate) : null,
        approvedBy: userId,
        approvedAt: new Date(),
      } as DeepPartial<EmpSalaryHistory>);
      await salaryHistoryRepo.save(salaryHistory);

      // Generate Clear User Notification
      let notifMessage = '';
      const newDesig = newDesignationId
        ? await desigRepo.findOne({ where: { id: newDesignationId } })
        : null;

      if (isPromotion) {
        notifMessage = `Congratulations! You have been promoted to ${
          newDesig?.name ?? 'your new role'
        }${
          newBasicSalary && newBasicSalary > (oldBasicSalary ?? 0)
            ? ` with basic salary ${newBasicSalary}`
            : ''
        } effective ${dto.effectiveDate}.`;
      } else if (isDemotion) {
        notifMessage = `Notice: Your designation has been changed to ${
          newDesig?.name ?? 'new role'
        } effective ${dto.effectiveDate}.`;
      } else if (isIncrement) {
        notifMessage = `Congratulations! Your basic salary has been incremented to ${newBasicSalary} effective ${dto.effectiveDate}.`;
      } else if (isDecrement) {
        notifMessage = `Notice: Your basic salary has been adjusted to ${newBasicSalary} effective ${dto.effectiveDate}.`;
      } else if (isPromotionWithoutIncrement) {
        notifMessage = `Congratulations! You have been promoted to ${
          newDesig?.name ?? 'your new role'
        } effective ${dto.effectiveDate}.`;
      } else {
        notifMessage = `Your employment status record has been updated effective ${dto.effectiveDate}.`;
      }

      if (notifMessage) {
        await this.usersService.createUserNotification(
          employee.id,
          notifMessage,
        );
      }

      return saved;
    });
  }
  // find all promotions with pagination

  async findAllPromotions(
    queryString: any,
  ): Promise<{ data: EmpPromotion[]; total: number }> {
    const appId = RequestContext.get('activeAppId');

    const query = this.empPromotionRepo
      .createQueryBuilder('promotion')
      .leftJoin('promotion.employee', 'employee')
      .leftJoin('employee.user', 'user')
      .leftJoin('user.profile', 'userProfile')
      .leftJoin('userProfile.profilePicture', 'profilePicture')
      .leftJoin('userProfile.phoneCountry', 'phoneCountry')
      .leftJoin('promotion.newDesignation', 'newDesignation')
      .leftJoin('promotion.oldDesignation', 'oldDesignation')
      .leftJoin('promotion.oldGrade', 'oldGrade')
      .leftJoin('promotion.newGrade', 'newGrade')
      .leftJoin('promotion.actionStatus', 'actionStatus')
      .addSelect([
        'employee.id',
        'employee.employeeCode',

        'user.firstName',
        'user.lastName',
        'user.email',
        'user.isActive',
        'userProfile.id',
        'userProfile.phoneCountryId',
        'phoneCountry.callingCode',
        'userProfile.phone',
        'userProfile.gender',
        'profilePicture.id',
        'profilePicture.filename',

        'newDesignation.id',
        'newDesignation.name',
        'newDesignation.level',

        'oldDesignation.id',
        'oldDesignation.name',
        'oldDesignation.level',

        'oldGrade.id',
        'oldGrade.gradeCode',
        'oldGrade.gradeName',
        'oldGrade.level',

        'newGrade.id',
        'newGrade.gradeCode',
        'newGrade.gradeName',
        'newGrade.level',

        'actionStatus.id',
        'actionStatus.name',
        'actionStatus.code',
        'actionStatus.colorName',
      ])
      .where('promotion.appId = :appId', { appId });

    const params = queryString?.params ? JSON.parse(queryString.params) : {};

    if (params.employeeId) {
      query.andWhere('employee.id = :employeeId', {
        employeeId: params.employeeId,
      });
    }

    console.log(params.employeeId);

    if (params.actionStatusId) {
      query.andWhere('actionStatus.id = :actionStatusId', {
        actionStatusId: params.actionStatusId,
      });
    }

    if (params.oldDesignationId) {
      query.andWhere('oldDesignation.id = :oldDesignationId', {
        oldDesignationId: params.oldDesignationId,
      });
    }

    if (params.newDesignationId) {
      query.andWhere('newDesignation.id = :newDesignationId', {
        newDesignationId: params.newDesignationId,
      });
    }

    if (params.oldGradeId) {
      query.andWhere('oldGrade.id = :oldGradeId', {
        oldGradeId: params.oldGradeId,
      });
    }

    if (params.newGradeId) {
      query.andWhere('newGrade.id = :newGradeId', {
        newGradeId: params.newGradeId,
      });
    }

    if (params.promotionDateFrom) {
      query.andWhere('promotion.promotionDate >= :from', {
        from: params.promotionDateFrom,
      });
    }
    if (params.promotionDateTo) {
      query.andWhere('promotion.promotionDate <= :to', {
        to: params.promotionDateTo,
      });
    }

    if (params.search) {
      const search = `%${params.search.trim()}%`;
      query.andWhere(
        `(user.firstName LIKE :search OR
      user.lastName LIKE :search OR
      employee.employeeCode LIKE :search OR
      oldDesignation.name LIKE :search OR
      newDesignation.name LIKE :search OR
      oldGrade.gradeCode LIKE :search OR
      newGrade.gradeCode LIKE :search OR
      actionStatus.name LIKE :search)`,
        { search },
      );
    }

    const features = new APIFeatures(query, queryString)
      .searching()
      .sort()
      .limitFields()
      .paginate();

    const data = await features.getQuery().getMany();
    const total = await query.getCount();
    return { data, total };
  }

  async findPromotionById(id: number): Promise<EmpPromotion> {
    const appId = RequestContext.get('activeAppId');
    const promotion = await this.empPromotionRepo.findOne({
      where: { id, ...(appId ? { appId } : {}) },
      relations: [
        'employee',
        'oldDesignation',
        'newDesignation',
        'oldGrade',
        'newGrade',
        'actionStatus',
      ],
    });
    if (!promotion) throw new NotFoundException('Promotion not found');
    return promotion;
  }

  async deletePromotionById(id: number): Promise<void> {
    const appId = RequestContext.get('activeAppId');
    const result = await this.empPromotionRepo.delete({
      id,
      ...(appId ? { appId } : {}),
    });
    if (result.affected === 0)
      throw new NotFoundException('Promotion record not found');
  }

  //get basic salary by active employee id

  async getBasicSalaryByEmployeeId(empId: number) {
    const appId = RequestContext.get('activeAppId');

    const salaryStructure = await this.empSalaryStructureRepo.findOne({
      where: { empId, isActive: true, appId },
    });

    if (!salaryStructure)
      throw new NotFoundException(
        'Active salary structure not found for employee',
      );

    const query = this.empSalaryStructureRepo
      .createQueryBuilder('salaryStructure')
      .leftJoin('salaryStructure.employee', 'employee')
      .leftJoin('salaryStructure.grade', 'grade')
      .leftJoin('employee.user', 'user')
      .leftJoin('user.profile', 'userProfile')
      .leftJoin('userProfile.profilePicture', 'profilePicture')
      .leftJoin('userProfile.phoneCountry', 'phoneCountry')

      .addSelect([
        'employee.id',
        'employee.employeeCode',

        'user.firstName',
        'user.lastName',
        'user.email',
        'user.isActive',
        'userProfile.id',
        'userProfile.phoneCountryId',
        'phoneCountry.callingCode',
        'userProfile.phone',
        'userProfile.gender',
        'profilePicture.id',
        'profilePicture.filename',

        'grade.id',
        'grade.gradeCode',
        'grade.gradeName',
        'grade.level',
      ])
      .where('salaryStructure.empId = :empId', { empId })
      .andWhere('salaryStructure.isActive = :isActive', { isActive: true })
      .andWhere('salaryStructure.appId = :appId', { appId })
      .orderBy('salaryStructure.createdAt', 'DESC')
      .getOne();

    if (!query) {
      throw new NotFoundException(
        'Active salary structure not found for employee',
      );
    }
    return query;
  }

  //get salary history by employee id with pagination

  async getSalaryHistoryByEmployeeId(
    empId: number,
    queryString: any,
  ): Promise<{ data: EmpSalaryHistory[]; total: number }> {
    const appId = RequestContext.get('activeAppId');

    const query = this.empSalaryHistoryRepo
      .createQueryBuilder('salaryHistory')
      .leftJoin('salaryHistory.employee', 'employee')
      .leftJoin('employee.user', 'user')
      .leftJoin('user.profile', 'userProfile')
      .leftJoin('userProfile.profilePicture', 'profilePicture')
      .leftJoin('userProfile.phoneCountry', 'phoneCountry')
      .leftJoin('salaryHistory.salaryStructure', 'salaryStructure')
      .leftJoin('salaryHistory.salaryEventType', 'salaryEventType')
      .leftJoin('salaryHistory.oldGrade', 'oldGrade')
      .leftJoin('salaryHistory.newGrade', 'newGrade')

      .addSelect([
        'employee.id',
        'employee.employeeCode',

        'user.firstName',
        'user.lastName',
        'user.email',
        'user.isActive',
        'userProfile.id',
        'userProfile.phoneCountryId',
        'phoneCountry.callingCode',
        'userProfile.phone',
        'userProfile.gender',
        'profilePicture.id',
        'profilePicture.filename',

        'salaryStructure.id',
        'salaryStructure.gradeId',

        'salaryEventType.id',
        'salaryEventType.name',
        'salaryEventType.code',
        'salaryEventType.colorName',

        'oldGrade.id',
        'oldGrade.gradeCode',
        'oldGrade.gradeName',
        'oldGrade.level',

        'newGrade.id',
        'newGrade.gradeCode',
        'newGrade.gradeName',
        'newGrade.level',
      ])
      .where('salaryHistory.empId = :empId', { empId })
      .andWhere('salaryHistory.appId = :appId', { appId })
      .orderBy('salaryHistory.createdAt', 'DESC');

    const params = queryString?.params ? JSON.parse(queryString.params) : {};

    if (params.search) {
      const search = `%${params.search.trim()}%`;
      query.andWhere(
        'user.firstName LIKE :search OR user.lastName LIKE :search OR user.email LIKE :search OR emp.employeeCode LIKE :search',
        { search },
      );
    }

    if (params.gradeId) {
      query.andWhere('salaryHistory.gradeId = :gradeId', {
        gradeId: params.gradeId,
      });
    }

    if (params.salaryEventTypeId) {
      query.andWhere('salaryHistory.salaryEventTypeId = :salaryEventTypeId', {
        salaryEventTypeId: params.salaryEventTypeId,
      });
    }

    if (params.empId) {
      query.andWhere('salaryHistory.empId = :empId', { empId: params.empId });
    }

    if (params.effectiveFrom) {
      query.andWhere('salaryHistory.effectiveFrom = :effectiveFrom', {
        effectiveFrom: params.effectiveFrom,
      });
    }

    if (params.effectiveTo) {
      query.andWhere('salaryHistory.effectiveTo = :effectiveTo', {
        effectiveTo: params.effectiveTo,
      });
    }

    const features = new APIFeatures(query, queryString)
      .searching()
      .sort()
      .limitFields()
      .paginate();

    const data = await features.getQuery().getMany();
    const total = await query.getCount();
    return { data, total };
  }

  //get salary history by login user with pagination

  async getMySalaryHistory(
    queryString: any,
  ): Promise<{ data: EmpSalaryHistory[]; total: number }> {
    const appId = RequestContext.get('activeAppId');
    const userId = RequestContext.get('userId');

    // find employeeId of logged-in user
    const employee = await this.employeeRepo.findOne({
      where: { userId, appId },
      select: ['id'],
    });
    if (!employee)
      throw new NotFoundException('Employee not found for this user');

    const query = this.empSalaryHistoryRepo
      .createQueryBuilder('salaryHistory')
      .leftJoin('salaryHistory.employee', 'employee')
      .leftJoin('employee.user', 'user')
      .leftJoin('user.profile', 'userProfile')
      .leftJoin('userProfile.profilePicture', 'profilePicture')
      .leftJoin('userProfile.phoneCountry', 'phoneCountry')
      .leftJoin('salaryHistory.salaryStructure', 'salaryStructure')
      .leftJoin('salaryHistory.salaryEventType', 'salaryEventType')
      .leftJoin('salaryHistory.oldGrade', 'oldGrade')
      .leftJoin('salaryHistory.newGrade', 'newGrade')
      .addSelect([
        'employee.id',
        'employee.employeeCode',

        'user.firstName',
        'user.lastName',
        'user.email',
        'user.isActive',
        'userProfile.id',
        'userProfile.phoneCountryId',
        'phoneCountry.callingCode',
        'userProfile.phone',
        'userProfile.gender',
        'profilePicture.id',
        'profilePicture.filename',

        'salaryStructure.id',
        'salaryStructure.gradeId',

        'oldGrade.id',
        'oldGrade.gradeCode',
        'oldGrade.gradeName',
        'oldGrade.level',

        'newGrade.id',
        'newGrade.gradeCode',
        'newGrade.gradeName',
        'newGrade.level',

        'salaryEventType.id',
        'salaryEventType.name',
        'salaryEventType.code',
        'salaryEventType.colorName',
      ])
      .where('salaryHistory.empId = :empId', { empId: employee.id })
      .andWhere('salaryHistory.appId = :appId', { appId })
      .orderBy('salaryHistory.createdAt', 'DESC');

    const params = queryString?.params ? JSON.parse(queryString.params) : {};

    if (params.search) {
      const search = `%${params.search.trim()}%`;
      query.andWhere(
        `(user.firstName LIKE :search OR
        user.lastName LIKE :search OR
        user.email LIKE :search OR
        employee.employeeCode LIKE :search)`,
        { search },
      );
    }

    // filters (keep only the ones you allow for "my" history)
    if (params.gradeId) {
      query.andWhere('salaryStructure.gradeId = :gradeId', {
        gradeId: params.gradeId,
      });
    }

    if (params.salaryEventTypeId) {
      query.andWhere('salaryEventType.id = :salaryEventTypeId', {
        salaryEventTypeId: params.salaryEventTypeId,
      });
    }

    // date range example (adjust column names!)
    if (params.effectiveFrom) {
      query.andWhere('salaryStructure.effectiveDate >= :effectiveFrom', {
        effectiveFrom: params.effectiveFrom,
      });
    }
    if (params.effectiveTo) {
      query.andWhere('salaryStructure.effectiveDate <= :effectiveTo', {
        effectiveTo: params.effectiveTo,
      });
    }

    const features = new APIFeatures(query, queryString)
      .searching()
      .sort()
      .limitFields()
      .paginate();

    const qb = features.getQuery();
    const data = await qb.getMany();
    const total = await qb.clone().getCount();

    return { data, total };
  }

  // Get all with pagination
  async findAllPaymentHistory(
    queryString: any,
  ): Promise<{ data: EmpPaymentHistory[]; total: number }> {
    const appId = RequestContext.get('activeAppId');
    const query = this.paymentHistoryRepo.createQueryBuilder('payment');

    query.andWhere('payment.appId = :appId', { appId });
    query.leftJoin('payment.employee', 'employee');
    query.leftJoin('payment.paymentMethod', 'paymentMethod');
    query.leftJoin('payment.paymentStatus', 'paymentStatus');

    query.addSelect([
      'employee.id',

      'paymentMethod.id',
      'paymentMethod.name',
      'paymentMethod.code',
      'paymentMethod.colorName',

      'paymentStatus.id',
      'paymentStatus.name',
      'paymentStatus.code',
      'paymentStatus.colorName',
    ]);

    const params = queryString?.params ? JSON.parse(queryString.params) : {};
    if (params.search) {
      const search = `%${params.search.trim()}%`;
      query.andWhere(
        'employee.empName LIKE :search OR payment.transactionRef LIKE :search',
        { search },
      );
    }

    const features = new APIFeatures(query, queryString)
      .searching()
      .sort()
      .limitFields()
      .paginate();

    const data = await features.getQuery().getMany();
    const total = await query.getCount();

    return { data, total };
  }

  // Get by ID
  async findPaymentHistoryById(id: number): Promise<EmpPaymentHistory> {
    const history = await this.paymentHistoryRepo.findOne({ where: { id } });
    if (!history) throw new NotFoundException('Payment history not found');
    return history;
  }

  // Delete
  async deletePaymentHistoryById(id: number): Promise<void> {
    const history = await this.paymentHistoryRepo.findOne({ where: { id } });
    if (!history) throw new NotFoundException('Payment history not found');
    await this.paymentHistoryRepo.remove(history);
  }

  // Create or Update Employee Payroll
  async createOrUpdateEmployeePayroll(
    dto: CreateEmpPayrollRunDto,
    forceReRun = false,
  ): Promise<EmpPayrollRun> {
    return await this.dataSource.transaction(async (manager) => {
      const userId = RequestContext.get('userId');
      const appId = RequestContext.get('activeAppId');
      dto.appId = appId;
      /* ---------------------------------------------------
       * 1. Prevent duplicate payroll
       * --------------------------------------------------- */
      const exists = await manager.findOne(EmpPayrollRun, {
        where: {
          appId: appId, // Use the declared variable here
          payPeriodMonth: dto.payPeriodMonth,
          payPeriodYear: dto.payPeriodYear,
        },
      });

      if (exists) {
        // throw new BadRequestException({
        //   payPeriodMonth: ['Payroll already exists for this month & year'],
        // });

        if (!dto.forceReRun) {
          throw new BadRequestException({
            payPeriodMonth: ['Payroll already exists for this month & year'],
            payPeriodMonthExist: true,
          });
        } else {
          await this.rollbackPayroll(manager, exists.id);
        }
      }

      /* ---------------------------------------------------
       * 2. Create payroll run
       * --------------------------------------------------- */

      const payrollRun = manager.create(EmpPayrollRun, {
        appId: dto.appId as number | undefined,
        remarks: dto.remarks,
        payPeriodMonth: dto.payPeriodMonth,
        payPeriodYear: dto.payPeriodYear,
        payrollCode: `PR-${appId}-${dto.payPeriodYear}-${String(
          dto.payPeriodMonth,
        ).padStart(2, '0')}`,
        paymentStatusId: 182,
        processedBy: userId,
        processedAt: new Date(),
      });

      const savedRun = await manager.save(payrollRun);

      /* ---------------------------------------------------
       * 3. Fetch active employees + salary structure
       * --------------------------------------------------- */
      const employees = await manager
        .getRepository(Employee)
        .createQueryBuilder('e')
        .innerJoinAndSelect(
          'e.salaryStructures',
          'salaryStructures',
          'salaryStructures.isActive = 1 AND salaryStructures.appId = :appId',
          { appId },
        )
        .leftJoinAndSelect(
          'salaryStructures.salaryStructureDetails',
          'salaryStructureDetails',
        )
        .where('e.appId = :appId', { appId })
        .andWhere('salaryStructures.isActive = :isActive', { isActive: true })
        .andWhere('e.employeeStatusId IN (:...status)', {
          status: [131, 132],
        })
        .getMany();

      let totalPayable = 0;
      const totalPaid = 0;

      /* ---------------------------------------------------
       * 4. Process each employee
       * --------------------------------------------------- */
      for (const emp of employees) {
        const structure = emp.salaryStructures[0];

        /* ---------- Attendance summary ---------- */
        const monthStart = new Date(
          dto.payPeriodYear,
          dto.payPeriodMonth - 1,
          1,
        );

        const monthEnd = new Date(dto.payPeriodYear, dto.payPeriodMonth, 0);

        const attendance = await manager
          .getRepository(EmpAttendance)
          .createQueryBuilder('a')
          .where('a.empId = :empId', { empId: emp.id })
          .andWhere('a.attendanceDate BETWEEN :s AND :e', {
            s: monthStart,
            e: monthEnd,
          })
          .getMany();

        const workingDays = monthEnd.getDate();
        const absentDays = attendance.filter(
          (a) => a.attendanceStatusId === 43, // Absent status ID
        ).length;
        const presentDays = Math.max(0, workingDays - absentDays);
        const paidDays = presentDays;

        /* ---------- Salary calculation ---------- */
        const grossSalary = Number(structure.grossSalary ?? 0);
        const dailyGross = workingDays > 0 ? grossSalary / workingDays : 0;
        const absenceDeduction = Number((dailyGross * absentDays).toFixed(2));
        const actualEarnings = Math.max(0, Number((grossSalary - absenceDeduction).toFixed(2)));

        const regularDeductions = Number(structure.totalDeductions ?? 0);
        const totalDeductions = Number((regularDeductions + absenceDeduction).toFixed(2));
        const netSalary = Math.max(0, Number((actualEarnings - regularDeductions).toFixed(2)));

        const totalPenaltyAmount = await this.empAttendancePenaltyRepo
          .find({
            where: {
              appId,
              empId: emp.id,
              month: dto.payPeriodMonth,
              year: dto.payPeriodYear,
            },
          })
          .then((penalties) => {
            return penalties.reduce((total, penalty) => {
              return total + (penalty?.amount ?? 0);
            }, 0);
          });

        const payable = Math.max(0, Number((netSalary - totalPenaltyAmount).toFixed(2)));

        /* ---------------------------------------------------
         * 5. Save monthly payroll record
         * --------------------------------------------------- */
        const record = manager.create(EmpPayrollMonthlyRecords, {
          appId,
          payrollRunId: savedRun.id,
          empId: emp.id,
          month: dto.payPeriodMonth,
          year: dto.payPeriodYear,
          salaryStructureId: structure.id,
          basicSalary: structure.basicSalary,
          totalEarnings: actualEarnings,
          totalDeductions,
          netSalary,
          workingDays,
          presentDays,
          absentDays,
          paidDays,
          extraAmount: 0,
          penaltiesAmount: totalPenaltyAmount,
          payable,
          penaltyApply: totalPenaltyAmount > 0,
          paid: 0,
          due: payable,
          paymentStatusId: 182,
        });

        const savedRecord = await manager.save(record);

        /* ---------------------------------------------------
         * 6. Salary breakdown (pay items)
         * --------------------------------------------------- */
        for (const item of structure?.salaryStructureDetails) {
          await manager.save(
            manager.create(EmpPayrollMonthlyBreakdown, {
              appId,
              empId: emp.id,
              monthlyRecordId: savedRecord.id,
              payItemId: item.payItemId,
              month: dto.payPeriodMonth,
              year: dto.payPeriodYear,
              amount: item.amount,
              effectiveFrom: item.effectiveFrom,
              effectiveTo: item.effectiveTo,
            }),
          );
        }

        totalPayable += payable;
      }

      /* ---------------------------------------------------
       * 7. Update payroll run totals
       * --------------------------------------------------- */
      savedRun.totalEmployees = employees.length;
      savedRun.payable = totalPayable;
      savedRun.paid = totalPaid;
      savedRun.due = totalPayable - totalPaid;

      await manager.save(savedRun);

      return savedRun;
    });
  }

  private async rollbackPayroll(manager: EntityManager, payrollRunId: number) {
    const records = await manager.find(EmpPayrollMonthlyRecords, {
      where: { payrollRunId },
      select: ['id'],
    });

    const recordIds = records.map((r) => r.id);
    if (recordIds.length > 0) {
      await manager
        .createQueryBuilder()
        .delete()
        .from(EmpPayrollMonthlyBreakdown)
        .where('monthlyRecordId IN (:...recordIds)', { recordIds })
        .execute();
    }

    await manager.delete(EmpPayrollMonthlyRecords, {
      payrollRunId,
    });

    await manager.delete(EmpPayrollRun, {
      id: payrollRunId,
    });
  }

  async findAllPayrollRuns(
    queryString: any,
  ): Promise<{ data: any[]; total: number }> {
    const appId = RequestContext.get('activeAppId');

    const query = this.empPayrollRunRepo
      .createQueryBuilder('payrollRun')
      .leftJoin('payrollRun.paymentStatus', 'paymentStatus')
      .where('payrollRun.appId = :appId', { appId });

    query.addSelect([
      'paymentStatus.name',
      'paymentStatus.code',
      'paymentStatus.colorName',
    ]);

    const features = new APIFeatures(query, queryString)
      .searching()
      .sort()
      .limitFields()
      .paginate();

    const data = await features
      .getQuery()
      .orderBy('payrollRun.payPeriodYear', 'DESC')
      .addOrderBy('payrollRun.payPeriodMonth', 'DESC')
      .getMany();

    const total = await query.getCount();

    // Recalculate payroll run payment status from actual monthly records.
    // This prevents stale parent status such as "Completed" from being shown
    // when one or more employee salaries are still unpaid/partially paid.
    const runIds = data.map((run) => run.id);

    if (runIds.length > 0) {
      const summaries = await this.empPayrollMonthlyRecordsRepo
        .createQueryBuilder('monthly')
        .select('monthly.payrollRunId', 'payrollRunId')
        .addSelect('COALESCE(SUM(monthly.payable), 0)', 'payable')
        .addSelect('COALESCE(SUM(monthly.paid), 0)', 'paid')
        .where('monthly.payrollRunId IN (:...runIds)', { runIds })
        .groupBy('monthly.payrollRunId')
        .getRawMany();

      const summaryMap = new Map(
        summaries.map((summary) => [
          Number(summary.payrollRunId),
          {
            payable: Number(summary.payable) || 0,
            paid: Number(summary.paid) || 0,
          },
        ]),
      );

      for (const run of data) {
        const summary = summaryMap.get(run.id);

        if (!summary) {
          continue;
        }

        const payable = summary.payable;
        const paid = summary.paid;
        const due = Math.max(payable - paid, 0);

        run.payable = payable;
        run.paid = paid;
        run.due = due;

        if (payable > 0 && due === 0) {
          run.paymentStatus = {
            id: 187,
            name: 'Paid',
            code: 'payment_status_paid',
            colorName: 'success',
          } as any;
        } else if (paid > 0) {
          run.paymentStatus = {
            id: 189,
            name: 'Partially Paid',
            code: 'payment_status_partially_paid',
            colorName: 'info',
          } as any;
        } else {
          run.paymentStatus = {
            id: 182,
            name: 'Pending',
            code: 'payment_status_pending',
            colorName: 'warning',
          } as any;
        }

        run.paymentStatusId = run.paymentStatus.id;
      }
    }

    return { data, total };
  }

  // Create or Update
  async createOrUpdateEmpPayrollMonthlyRecord(
    dto: CreateEmpPayrollMonthlyRecordDto,
  ): Promise<EmpPayrollMonthlyRecords> {
    const appId = RequestContext.get('activeAppId');
    dto.appId = appId ?? dto.appId;

    let record: EmpPayrollMonthlyRecords;

    if (dto.id) {
      const existing = await this.empPayrollMonthlyRecordsRepo.findOne({
        where: { id: dto.id },
      });
      if (!existing)
        throw new NotFoundException(
          `Payroll Monthly Record with ID ${dto.id} not found`,
        );
      this.empPayrollMonthlyRecordsRepo.merge(existing, dto);
      record = existing;
    } else {
      record = this.empPayrollMonthlyRecordsRepo.create({ ...dto });
    }

    return this.empPayrollMonthlyRecordsRepo.save(record);
  }

  // Get all with pagination
  async findAllEmpPayrollMonthlyRecords(
    payrollRunId: number,
    queryString: any,
  ): Promise<any> {
    const appId = RequestContext.get('activeAppId');

    const payrollRunItem = await this.empPayrollRunRepo.findOne({
      where: { id: payrollRunId },
    });

    if (!payrollRunItem) {
      throw new NotFoundException(
        `Payroll Run with ID ${payrollRunId} not found`,
      );
    }

    const query =
      this.empPayrollMonthlyRecordsRepo.createQueryBuilder('record');

    query.leftJoin('record.payrollRun', 'payrollRun');
    query.leftJoin('record.paymentStatus', 'paymentStatus');
    query.leftJoin('record.salaryStructure', 'salaryStructure');
    query.leftJoin('salaryStructure.grade', 'grade');
    query.leftJoinAndSelect('record.breakdowns', 'breakdowns');
    query.leftJoinAndSelect('breakdowns.payItem', 'payItem');
    query.leftJoin('record.employee', 'emp');
    query.leftJoin('emp.designation', 'designation');
    query.leftJoin('emp.user', 'user');
    query.leftJoin('user.profile', 'userProfile');
    query.leftJoin('userProfile.profilePicture', 'profilePicture');
    query.leftJoin('userProfile.phoneCountry', 'phoneCountry');

    query.addSelect([
      'payrollRun.id',
      'payrollRun.payrollCode',
      'payrollRun.payPeriodMonth',
      'payrollRun.payPeriodYear',
      'payrollRun.payPeriodStart',
      'payrollRun.payPeriodEnd',
      'payrollRun.paymentDate',
      'payrollRun.paymentStatusId',

      'emp.id',
      'emp.employeeCode',
      'emp.joiningDate',
      // 'emp.userId',

      'user.firstName',
      'user.lastName',
      'user.email',
      'user.isActive',
      'userProfile.id',
      'userProfile.phoneCountryId',
      'phoneCountry.callingCode',
      'userProfile.phone',
      'userProfile.gender',
      'profilePicture.id',
      'profilePicture.filename',

      'paymentStatus.id',
      'paymentStatus.name',
      'paymentStatus.code',
      'paymentStatus.colorName',

      'designation.id',
      'designation.name',
      'designation.level',

      'grade.id',
      'grade.gradeName',
      'grade.level',
      'grade.minSalary',
      'grade.maxSalary',

      'salaryStructure.id',
      // 'salaryStructure.basicSalary',
      'salaryStructure.effectiveFrom',
      'salaryStructure.effectiveTo',
      // 'salaryStructure.grossSalary',
    ]);

    query.andWhere('record.appId = :appId', { appId });
    query.andWhere('record.payrollRunId = :payrollRunId', { payrollRunId });

    const params = queryString?.params ? JSON.parse(queryString.params) : {};

    if (params.search) {
      const search = `%${params.search.trim()}%`;
      query.andWhere(
        'user.firstName LIKE :search OR user.lastName LIKE :search OR user.email LIKE :search OR emp.employeeCode LIKE :search',
        { search },
      );
    }

    if (params.designationId) {
      query.andWhere('emp.designationId = :designationId', {
        designationId: Number(params.designationId),
      });
    }

    if (params.month) {
      query.andWhere('record.month = :month', {
        month: Number(params.month),
      });
    }

    if (params.year) {
      query.andWhere('record.year = :year', {
        year: Number(params.year),
      });
    }

    if (params.paymentStatusId) {
      query.andWhere('record.paymentStatusId = :paymentStatusId', {
        paymentStatusId: Number(params.paymentStatusId),
      });
    }

    if (params.officeId) {
      query.andWhere('emp.officeId = :officeId', {
        officeId: Number(params.officeId),
      });
    }

    if (params.officeShiftId) {
      query.andWhere('emp.officeShiftId = :officeShiftId', {
        officeShiftId: Number(params.officeShiftId),
      });
    }

    if (params.gradeId) {
      query.andWhere('emp.currentGradeId = :gradeId', {
        gradeId: Number(params.gradeId),
      });
    }

    const features = new APIFeatures(query, queryString)
      // .searching()
      // .sort()
      .limitFields()
      .paginate();

    const data = await features
      .getQuery()
      .orderBy('user.firstName', 'ASC')
      .getMany();
    const total = await query.getCount();

    return { list: { data, total }, summary: payrollRunItem };
  }

  async getPaymentHistoryByEmployee(
    employeeId: number,
    queryString: any,
  ): Promise<{ data: any[]; total: number }> {
    const appId = RequestContext.get('activeAppId');

    if (!appId) {
      throw new BadRequestException('app id not found');
    }

    const employee = await this.employeeRepo.findOne({
      where: { id: employeeId, appId },
      select: ['id'],
    });

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${employeeId} not found`);
    }

    const query =
      this.empPayrollMonthlyRecordsRepo.createQueryBuilder('record');

    query.leftJoin('record.salaryStructure', 'salaryStructure');
    query.leftJoin('salaryStructure.grade', 'grade');
    query.leftJoin('record.paymentStatus', 'paymentStatus');

    query.addSelect([
      'grade.id',
      'grade.gradeCode',
      'grade.gradeName',
      'grade.level',
      'grade.minSalary',
      'grade.maxSalary',

      'salaryStructure.id',
      'salaryStructure.grossSalary',
      'salaryStructure.effectiveFrom',
      'salaryStructure.effectiveTo',

      'paymentStatus.id',
      'paymentStatus.name',
      'paymentStatus.code',
      'paymentStatus.colorName',
    ]);

    // required filters
    query.andWhere('record.appId = :appId', { appId });
    query.andWhere('record.empId = :employeeId', { employeeId });
    query.orderBy('record.createdAt', 'DESC');

    const params = queryString?.params ? JSON.parse(queryString.params) : {};

    if (params.year) {
      query.andWhere('record.year = :year', { year: params.year });
    }

    if (params.month) {
      query.andWhere('record.month = :month', { month: params.month });
    }

    const features = new APIFeatures(query, queryString)
      .searching()
      .sort()
      .limitFields()
      .paginate();

    const data = await features.getQuery().getMany();

    const total = await query.getCount();

    return { data, total };
  }

  async getMyPaymentHistoryList(
    queryString: any,
  ): Promise<{ data: any[]; total: number }> {
    const appId = RequestContext.get('activeAppId');
    const userId = RequestContext.get('userId');

    if (!appId) throw new BadRequestException('app id not found');
    if (!userId) throw new BadRequestException('user id not found');

    const employee = await this.employeeRepo.findOne({
      where: { userId, appId },
      select: ['id'],
    });

    if (!employee) {
      throw new NotFoundException('Employee profile not found for this user');
    }

    const query =
      this.empPayrollMonthlyRecordsRepo.createQueryBuilder('record');

    query.leftJoin('record.salaryStructure', 'salaryStructure');
    query.leftJoin('salaryStructure.grade', 'grade');
    query.leftJoin('record.paymentStatus', 'paymentStatus');

    query.addSelect([
      'grade.id',
      'grade.gradeCode',
      'grade.gradeName',
      'grade.level',
      'grade.minSalary',
      'grade.maxSalary',

      'salaryStructure.id',
      'salaryStructure.grossSalary',
      'salaryStructure.effectiveFrom',
      'salaryStructure.effectiveTo',

      'paymentStatus.id',
      'paymentStatus.name',
      'paymentStatus.code',
      'paymentStatus.colorName',
    ]);

    query.andWhere('record.appId = :appId', { appId });
    query.andWhere('record.empId = :empId', { empId: employee.id });
    query.andWhere('record.paymentStatusId IN (:...paidStatusIds)', {
      paidStatusIds: [187, 189],
    });
    query.orderBy('record.createdAt', 'DESC');

    const params = queryString?.params ? JSON.parse(queryString.params) : {};

    if (params.year)
      query.andWhere('record.year = :year', { year: params.year });
    if (params.month)
      query.andWhere('record.month = :month', { month: params.month });

    if (params.search) {
      const search = `%${params.search.trim()}%`;
      query.andWhere(
        `(payrollRun.payrollCode LIKE :searchtug84
        OR record.remarks LIKE :search)`,
        { search },
      );
    }

    const features = new APIFeatures(query, queryString)
      // .searching()
      .sort()
      .limitFields()
      .paginate();

    const data = await features.getQuery().getMany();

    const total = await query.getCount();

    return { data, total };
  }

  // Pay now Employee Salary(soykot_podder Update this function to transaction)
  async payNowEmployeeMonthlySalary(
    dto: CreateEmpPayrollMonthlyRecordDto,
  ): Promise<EmpPayrollMonthlyRecords> {
    if (!dto.id) {
      throw new BadRequestException('Employee Payroll Record ID is required');
    }

    return this.dataSource.transaction(async (manager) => {
      const recordRepo = manager.getRepository(EmpPayrollMonthlyRecords);
      const runRepo = manager.getRepository(EmpPayrollRun);

      const existing = await recordRepo.findOne({
        where: { id: dto.id },
      });

      if (!existing) {
        throw new NotFoundException(
          `Payroll Monthly Record with ID ${dto.id} not found`,
        );
      }

      const oldPaid = Number(existing.paid) || 0;
      const payable = Number(existing.payable) || 0;
      const payingAmount = Number(dto.payingAmount) || 0;

      if (payingAmount <= 0) {
        throw new BadRequestException('Payment amount must be greater than 0');
      }

      const currentDue = payable - oldPaid;

      if (currentDue <= 0) {
        throw new BadRequestException(
          'This salary has already been fully paid',
        );
      }

      if (payingAmount > currentDue) {
        throw new BadRequestException(
          `Payment amount cannot exceed due amount of ${currentDue}`,
        );
      }

      // Calculate new employee payment
      const newPaid = oldPaid + payingAmount;
      const newDue = payable - newPaid;

      existing.paid = newPaid;
      existing.due = newDue;

      if (newDue === 0) {
        existing.paymentStatusId = 187; // Paid
      } else {
        existing.paymentStatusId = 189; // Partially Paid
      }

      const savedRecord = await recordRepo.save(existing);

      // Update Payroll Run
      if (savedRecord.payrollRunId) {
        const payrollRun = await runRepo.findOne({
          where: { id: savedRecord.payrollRunId },
        });

        if (payrollRun) {
          const monthlyRecords = await recordRepo.find({
            where: {
              payrollRunId: payrollRun.id,
            },
          });

          const totalPayable = monthlyRecords.reduce(
            (sum, record) => sum + Number(record.payable || 0),
            0,
          );

          const totalPaid = monthlyRecords.reduce(
            (sum, record) => sum + Number(record.paid || 0),
            0,
          );

          const totalDue = Math.max(totalPayable - totalPaid, 0);

          payrollRun.payable = totalPayable;
          payrollRun.paid = totalPaid;
          payrollRun.due = totalDue;

          if (totalDue === 0 && totalPayable > 0) {
            payrollRun.paymentStatusId = 187; // Paid
          } else if (totalPaid > 0) {
            payrollRun.paymentStatusId = 189; // Partially Paid
          } else {
            payrollRun.paymentStatusId = 182; // Unpaid
          }

          await runRepo.save(payrollRun);
        }
      }

      return savedRecord;
    });
  }

  async deletePayrollMonthlyRecordById(id: number): Promise<void> {
    const findItem = await this.empPayrollMonthlyRecordsRepo.findOne({
      where: { id },
    });

    if (!findItem) throw new NotFoundException('Payroll Record not found');

    if (findItem.paymentStatusId === 187 || findItem.paymentStatusId === 189) {
      throw new NotFoundException('You cannot delete paid record');
    }

    if (findItem.payrollRunId) {
      const payrollRun = await this.empPayrollRunRepo.findOne({
        where: { id: findItem.payrollRunId },
      });

      if (payrollRun) {
        payrollRun.payable =
          Number(payrollRun.payable) - Number(findItem.payable);
        // payrollRun.paid = Number(payrollRun.paid) + Number(findItem.payable);
        payrollRun.due = Number(payrollRun.payable) - Number(payrollRun.paid);
        await this.empPayrollRunRepo.update(payrollRun.id, payrollRun);
      }
    }
    await this.empPayrollMonthlyRecordsRepo.remove(findItem);
  }

  async deleteBulkPayrollMonthlyRecordById(ids: number[]): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      // 1. Fetch all records at once
      const records = await manager.find(EmpPayrollMonthlyRecords, {
        where: { id: In(ids) },
      });

      if (records.length !== ids.length) {
        throw new NotFoundException('Some payroll records not found');
      }

      // 2. Validation
      const hasPaid = records.some(
        (r) => r.paymentStatusId === 187 || r.paymentStatusId === 189,
      );
      if (hasPaid) {
        throw new BadRequestException('You cannot delete paid records');
      }

      // 3. Group by payrollRunId
      const payrollRunMap = new Map<number, number>();

      for (const record of records) {
        if (!record.payrollRunId) continue;

        payrollRunMap.set(
          record.payrollRunId,
          (payrollRunMap.get(record.payrollRunId) || 0) +
            Number(record.payable),
        );
      }

      // 4. Update payroll runs (ONCE per run)
      for (const [payrollRunId, totalPayable] of payrollRunMap.entries()) {
        const payrollRun = await manager.findOne(EmpPayrollRun, {
          where: { id: payrollRunId },
        });

        if (!payrollRun) continue;

        payrollRun.payable = Number(payrollRun.payable) - totalPayable;
        payrollRun.due = payrollRun.payable - payrollRun.paid;

        await manager.save(payrollRun);
      }

      // 5. Delete records in bulk
      await manager.delete(EmpPayrollMonthlyRecords, ids);
    });
  }

  async payNowBulkPayrollMonthlyRecordById(ids: number[]): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      // 1. Fetch all records at once
      const records = await manager.find(EmpPayrollMonthlyRecords, {
        where: {
          id: In(ids),
          paymentStatusId: Not(In([187])), // not Paid
        },
      });

      if (records.length === 0) {
        throw new NotFoundException('No unpaid records found');
      }

      // Group by payrollRunId
      const payrollRunMap = new Map<number, number>();

      for (const record of records) {
        if (!record.payrollRunId) continue; // skip if no payroll run

        const dueAmount = Number(record.due);
        record.paymentStatusId = 187; //Paid
        record.paid = Number(record.paid) + dueAmount;
        record.due = 0;

        payrollRunMap.set(
          record.payrollRunId,
          (payrollRunMap.get(record.payrollRunId) || 0) + dueAmount,
        );

        // await this.empPayrollMonthlyRecordsRepo.save(record);
        await manager.save(EmpPayrollMonthlyRecords, record);
      }

      // Update payroll runs (ONCE per run)
      for (const [payrollRunId, totalDue] of payrollRunMap.entries()) {
        const payrollRun = await manager.findOne(EmpPayrollRun, {
          where: { id: payrollRunId },
        });

        if (!payrollRun) continue;

        payrollRun.paid = Number(payrollRun.paid) + totalDue;
        payrollRun.due = payrollRun.payable - payrollRun.paid;
        if (Number(payrollRun.due) === 0) {
          payrollRun.paymentStatusId = 187; //Paid
        } else {
          payrollRun.paymentStatusId = 189; //Partially Paid
        }

        await manager.save(payrollRun);
      }
    });
  }

  // Get by ID
  async findEmpPayrollMonthlyRecordById(
    id: number,
  ): Promise<EmpPayrollMonthlyRecords> {
    const record = await this.empPayrollMonthlyRecordsRepo.findOne({
      where: { id },
    });
    if (!record)
      throw new NotFoundException(
        `Payroll Monthly Record with ID ${id} not found`,
      );
    return record;
  }

  // Delete
  async deleteEmpPayrollMonthlyRecordById(id: number): Promise<void> {
    const record = await this.empPayrollMonthlyRecordsRepo.findOne({
      where: { id },
    });
    if (!record)
      throw new NotFoundException(
        `Payroll Monthly Record with ID ${id} not found`,
      );
    await this.empPayrollMonthlyRecordsRepo.remove(record);
  }

  // Create or update
  async createOrUpdateEmpPayrollMonthlyBreakdown(
    dto: CreateEmpPayrollMonthlyBreakdownDto,
  ): Promise<EmpPayrollMonthlyBreakdown> {
    const appId = RequestContext.get('activeAppId');
    dto.appId = appId ?? dto.appId;

    let record: EmpPayrollMonthlyBreakdown;

    if (dto.id) {
      const existing = await this.empPayrollMonthlyBreakdownRepo.findOne({
        where: { id: dto.id },
      });
      if (!existing)
        throw new NotFoundException(
          `Monthly Breakdown with ID ${dto.id} not found`,
        );
      this.empPayrollMonthlyBreakdownRepo.merge(existing, dto);
      record = existing;
    } else {
      record = this.empPayrollMonthlyBreakdownRepo.create({ ...dto });
    }

    return this.empPayrollMonthlyBreakdownRepo.save(record);
  }

  //find employee payroll breakdown by payroll record id

  async findBreakdownByPayrollRecordId(payrollRecordId: number): Promise<any> {
    const payrollRecord = await this.empPayrollMonthlyRecordsRepo.findOne({
      where: { id: payrollRecordId },
    });

    if (!payrollRecord)
      throw new NotFoundException(
        `Payroll Monthly Record with ID ${payrollRecordId} not found`,
      );

    const breakdowns = await this.empPayrollMonthlyBreakdownRepo.find({
      where: {
        appId: payrollRecord.appId !== null ? payrollRecord.appId : undefined,
        empId: payrollRecord.empId !== null ? payrollRecord.empId : undefined,
        month: payrollRecord.month,
        year: payrollRecord.year,
      },
    });
    return {
      payrollRecord,
      breakdowns,
    };
  }

  async getEmployeeSalaryGradeInfo(employeeId: number): Promise<any> {
    const activeAppId = RequestContext.get('activeAppId');

    const employee = await this.employeeRepo.findOne({
      where: {
        id: employeeId,
        appId: activeAppId,
        joiningDate: Not(IsNull()),
        employeeStatusId: In([130, 132]), // joined and rejoined
      },
    });

    if (!employee) {
      throw new NotFoundException(
        `Employee not found for employee ID ${employeeId}`,
      );
    }

    const salaryStructureQuery =
      this.empSalaryStructureRepo.createQueryBuilder('structure');
    salaryStructureQuery.leftJoinAndSelect('structure.grade', 'grade');
    salaryStructureQuery.where('structure.appId = :appId', {
      appId: activeAppId,
    });
    salaryStructureQuery.andWhere('structure.empId = :empId', {
      empId: employeeId,
    });
    salaryStructureQuery.andWhere('structure.isActive = :isActive', {
      isActive: true,
    });
    // salaryStructureQuery.andWhere('structure.gradeId = :gradeId', { gradeId: employee.currentGradeId });

    const salaryStructure = await salaryStructureQuery.getOne();

    // const salaryStructure = await this.empSalaryStructureRepo.findOne({
    //   where: {
    //     empId: employeeId,
    //     appId: activeAppId,
    //     isActive: true,
    //     gradeId: employee.currentGradeId as number,
    //   },
    // });

    if (!salaryStructure) {
      throw new NotFoundException(
        `Employee salary structure not found for employee ID ${employeeId}`,
      );
    }

    const query =
      this.empSalaryStructureDetailsRepo.createQueryBuilder('structureDetails');
    query.leftJoinAndSelect('structureDetails.payItem', 'payItem');
    query.leftJoinAndSelect('payItem.payItemType', 'payItemType');

    query
      .andWhere('structureDetails.appId = :appId', {
        appId: activeAppId,
      })
      .andWhere('structureDetails.salaryStructureId = :salaryStructureId', {
        salaryStructureId: salaryStructure.id,
      });

    const details = await query.orderBy('payItem.sortOrder', 'ASC').getMany();

    return {
      structure: salaryStructure,
      details,
    };
  }

  async getUserSalaryGradeInfo(): Promise<any> {
    const appId = RequestContext.get('activeAppId');
    const userId = RequestContext.get('userId');

    const employee = await this.employeeRepo.findOne({
      where: {
        userId,
        appId: appId,
        joiningDate: Not(IsNull()),
        employeeStatusId: In([130, 132]), // joined and rejoined
      },
    });

    if (!employee) {
      throw new NotFoundException(
        `Employee not found for employee ID ${userId}`,
      );
    }

    const salaryStructureQuery =
      this.empSalaryStructureRepo.createQueryBuilder('structure');
    salaryStructureQuery.leftJoinAndSelect('structure.grade', 'grade');
    salaryStructureQuery.where('structure.appId = :appId', {
      appId: appId,
    });
    salaryStructureQuery.andWhere('structure.empId = :empId', {
      empId: employee.id,
    });
    salaryStructureQuery.andWhere('structure.isActive = :isActive', {
      isActive: true,
    });

    const salaryStructure = await salaryStructureQuery.getOne();

    if (!salaryStructure) {
      throw new NotFoundException(
        `Employee salary structure not found for employee ID ${employee.id}`,
      );
    }

    const query =
      this.empSalaryStructureDetailsRepo.createQueryBuilder('structureDetails');
    query.leftJoinAndSelect('structureDetails.payItem', 'payItem');
    query.leftJoinAndSelect('payItem.payItemType', 'payItemType');

    query
      .andWhere('structureDetails.appId = :appId', {
        appId: appId,
      })
      .andWhere('structureDetails.salaryStructureId = :salaryStructureId', {
        salaryStructureId: salaryStructure.id,
      });

    const details = await query.orderBy('payItem.sortOrder', 'ASC').getMany();

    return {
      structure: salaryStructure,
      details,
    };
  }

  async getActiveEmployeesBirthdayInfo(): Promise<any[]> {
    const appId = RequestContext.get('activeAppId');

    const data = await this.employeeRepo
      .createQueryBuilder('employee')
      .leftJoin('employee.user', 'user')
      .leftJoin('user.profile', 'profile')
      .select([
        'employee.id AS employeeId',
        'user.firstName AS firstName',
        'user.lastName AS lastName',
        'profile.dateOfBirth AS dateOfBirth',
      ])
      .where('employee.appId = :appId', { appId })
      .andWhere('user.isActive = :isActive', { isActive: true })
      .getRawMany();

    return data;
  }
}
