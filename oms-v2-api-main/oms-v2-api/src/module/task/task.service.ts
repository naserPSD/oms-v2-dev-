import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateTaskDto, UpdateTaskStatusDto } from './dto/task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { TaskWorkspace } from './entities/task-workspace.entity';
import { CreateTaskWorkspaceDto } from './dto/task-workspace.dto';
import { UserContextService } from '@module/auth/user-context.service';
import { TaskBoard } from './entities/task-boards.entity';
import { CreateTaskBoardDto } from './dto/task-boards.dto';
import { Status } from '@module/status/entities/status.entity';
import { TaskCard } from './entities/task-cards.entity';
import {
  CreateTaskCardDto,
  UpdateTaskCardSerialDto,
} from './dto/task-cards.dto';
import { Task } from './entities/task.entity';
import { TaskComment } from './entities/task-comments.entity';
import { CreateTaskCommentDto } from './dto/task-comments.dto';
import { TaskTag } from './entities/task-tags.entity';
import { CreateTaskTagDto } from './dto/task-tags.dto';
import { TaskAssignee } from './entities/task-assignees.entity';
import { CreateTaskAssigneeDto } from './dto/task-assignees.dto';
import { RequestContext } from '@common/request-context';
import { AppUser } from '@module/users/entities/app-user.entity';
import { APIFeatures } from '@core/utils/apiFeatures';
import { Employee } from '@module/hr-management/entities/employees.entity';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(TaskWorkspace)
    private readonly workspaceRepo: Repository<TaskWorkspace>,

    @InjectRepository(TaskBoard)
    private readonly boardRepo: Repository<TaskBoard>,

    @InjectRepository(Status)
    private readonly statusRepo: Repository<Status>,

    @InjectRepository(TaskCard)
    private readonly cardRepo: Repository<TaskCard>,

    @InjectRepository(Task)
    private readonly taskRepo: Repository<Task>,

    @InjectRepository(TaskComment)
    private readonly commentRepo: Repository<TaskComment>,

    @InjectRepository(AppUser)
    private readonly appUserRepo: Repository<AppUser>,

    @InjectRepository(TaskTag)
    private readonly tagRepo: Repository<TaskTag>,

    @InjectRepository(TaskAssignee)
    private readonly assigneeRepo: Repository<TaskAssignee>,

    @InjectRepository(Employee)
    private readonly employeeRepo: Repository<Employee>,

    private readonly userContextService: UserContextService,
  ) {}

  create(createTaskDto: CreateTaskDto) {
    return 'This action adds a new task';
  }

  findAll() {
    return `This action returns all task`;
  }

  findOne(id: number) {
    return `This action returns a #${id} task`;
  }

  update(id: number, updateTaskDto: UpdateTaskDto) {
    return `This action updates a #${id} task`;
  }

  remove(id: number) {
    return `This action removes a #${id} task`;
  }

  // TaskWorkspace methods

  async createOrUpdateWorkspace(
    dto: CreateTaskWorkspaceDto,
  ): Promise<TaskWorkspace> {
    const user = this.userContextService.getUser();
    const appUser = await this.appUserRepo.findOne({
      where: { userId: user.id },
    });
    if (!appUser) {
      throw new NotFoundException('App User not found');
    }

    dto.appId = appUser.appId;
    dto.creatorId = user.id;

    let workspace: TaskWorkspace;

    if (dto.id) {
      const existing = await this.workspaceRepo.findOne({
        where: { id: dto.id },
      });
      if (!existing) {
        throw new NotFoundException(`Workspace with ID ${dto.id} not found`);
      }

      this.workspaceRepo.merge(existing, dto);
      workspace = existing;
    } else {
      // Create new workspace
      workspace = this.workspaceRepo.create({ ...dto });
    }

    const saved = await this.workspaceRepo.save(workspace);
    return saved;
  }

  async findAllWorkspaces(
    queryString: any,
  ): Promise<{ data: TaskWorkspace[]; total: number }> {
    const userId = RequestContext.get('userId');
    const appUser = await this.appUserRepo.findOne({ where: { userId } });
    if (!appUser) throw new NotFoundException('App User not found');

    const query = this.workspaceRepo.createQueryBuilder('workspace');

    const params = queryString?.params ? JSON.parse(queryString.params) : {};
    if (params.search) {
      const search = `%${params.search.trim()}%`;
      query.andWhere('workspace.name LIKE :search', { search });
    }

    query.andWhere('workspace.appId = :appId', { appId: appUser.appId });

    const features = new APIFeatures(query, queryString)
      .sort()
      .limitFields()
      .paginate();

    const featureData = await features.getQuery().getMany();
    const total = await query.getCount();

    return { data: featureData, total };
  }

  async findAllWorkspacesByCreator(
    creatorId: number,
  ): Promise<TaskWorkspace[]> {
    return this.workspaceRepo.find({
      where: { creatorId },
    });
  }

  async findAllBoards(
    queryString: any,
  ): Promise<{ data: TaskBoard[]; total: number }> {
    const userId = RequestContext.get('userId');
    const appUser = await this.appUserRepo.findOne({ where: { userId } });
    if (!appUser) throw new NotFoundException('App User not found');

    const query = this.boardRepo.createQueryBuilder('board');

    // Join workspace if needed
    query.leftJoin('board.workspace', 'workspace');
    query.leftJoin('board.viewType', 'viewType');

    query.addSelect([
      'workspace.id',
      'workspace.name',
      'workspace.description',
      'workspace.isActive',

      'viewType.id',
      'viewType.name',
      'viewType.code',
      'viewType.colorName',
    ]);

    // Parse params
    const params = queryString?.params ? JSON.parse(queryString.params) : {};

    if (params.search) {
      const search = `%${params.search.trim()}%`;
      query.andWhere('board.name LIKE :search', { search });
    }

    query.andWhere('board.appId = :appId', { appId: appUser.appId });

    const features = new APIFeatures(query, queryString)
      .sort()
      .limitFields()
      .paginate();

    const featureData = await features.getQuery().getMany();
    const total = await query.getCount();

    return { data: featureData, total };
  }

  async findWorkspaceById(id: number): Promise<TaskWorkspace> {
    const userId = RequestContext.get('userId');
    const workspace = await this.workspaceRepo.findOne({
      where: {
        id,
        creatorId: userId,
      },
    });
    if (!workspace) {
      throw new NotFoundException(`Workspace with ID ${id} not found`);
    }
    return workspace;
  }

  async deleteWorkspace(id: number): Promise<void> {
    const result = await this.workspaceRepo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Workspace with ID ${id} not found`);
    }
  }

  async changeWorkspaceActiveStatus(id: number): Promise<TaskWorkspace> {
    const workspace = await this.workspaceRepo.findOne({ where: { id } });
    if (!workspace) {
      throw new NotFoundException(`Workspace with ID ${id} not found`);
    }
    workspace.isActive = !workspace.isActive;
    return this.workspaceRepo.save(workspace);
  }

  // --- Board Methods ---
  async createOrTaskUpdateBoard(dto: CreateTaskBoardDto): Promise<TaskBoard> {
    const userId = RequestContext.get('userId');
    const appUser = await this.appUserRepo.findOne({ where: { userId } });
    if (!appUser) throw new NotFoundException('App User not found');
    dto.appId = appUser.appId;

    const workSpace = await this.workspaceRepo.findOne({
      where: { id: dto.workspaceId },
    });
    if (!workSpace) throw new NotFoundException('Workspace not found');

    dto.workspaceId = workSpace.id;

    const viewType = await this.statusRepo.findOne({
      where: { id: dto.viewTypeId },
    });

    if (!viewType) throw new NotFoundException('View Type not found');

    dto.viewTypeId = viewType.id;

    dto.creatorId = userId;

    let savedBoard: TaskBoard;
    if (dto.id) {
      const board = await this.boardRepo.findOne({ where: { id: dto.id } });
      if (!board) throw new NotFoundException('Board not found');
      this.boardRepo.merge(board, dto);
      savedBoard = board;
    } else {
      savedBoard = this.boardRepo.create({ ...dto });
    }

    return this.boardRepo.save(savedBoard);
  }

  async findBoardsByWorkspace(workspaceId: number): Promise<TaskBoard[]> {
    return this.boardRepo.find({ where: { workspaceId } });
  }
  async findBoardsByWorkspaceIds(workspaceIds: number[]): Promise<TaskBoard[]> {
    if (!workspaceIds.length) return [];
    return this.boardRepo.find({
      where: { workspaceId: In(workspaceIds) },
    });
  }

  async findTaskBoardById(id: number): Promise<TaskBoard> {
    const taskBoard = await this.boardRepo.findOne({ where: { id } });
    if (!taskBoard) throw new NotFoundException('Task board not found');
    return taskBoard;
  }

  async deleteTaskBoard(id: number): Promise<void> {
    const result = await this.boardRepo.delete(id);
    if (result.affected === 0) throw new NotFoundException('Board not found');
  }

  async changeTaskBoardActiveStatus(id: number): Promise<TaskBoard> {
    const board = await this.boardRepo.findOne({ where: { id } });
    if (!board) throw new NotFoundException('Board not found');
    board.active = !board.active;
    return this.boardRepo.save(board);
  }

  //Task Cards Method

  async findAllTaskCards(
    queryString: any,
  ): Promise<{ data: TaskCard[]; total: number }> {
    const userId = RequestContext.get('userId');
    const appUser = await this.appUserRepo.findOne({ where: { userId } });
    if (!appUser) throw new NotFoundException('App User not found');

    const query = this.cardRepo.createQueryBuilder('card');
    query.leftJoin('card.board', 'board');
    query.leftJoin('card.workspace', 'workspace');
    query.leftJoin('board.viewType', 'viewType');

    query.addSelect([
      'board.id',
      'board.name',
      'board.workspace',
      'board.viewType',

      //'workspace.id',
      'workspace.name',
      'workspace.description',
      'workspace.isActive',

      //'viewType.id',
      'viewType.name',
      'viewType.code',
      'viewType.colorName',
    ]);

    const params = queryString?.params ? JSON.parse(queryString.params) : {};

    if (params.search) {
      const search = `%${params.search.trim()}%`;
      query.andWhere('card.name LIKE :search', { search });
    }

    query.andWhere('card.appId = :appId', { appId: appUser.appId });

    const features = new APIFeatures(query, queryString)
      .searching()
      .sort()
      .limitFields()
      .paginate();

    const featureData = await features.getQuery().getMany();
    const total = await query.getCount();

    return { data: featureData, total };
  }

  // Get task card by ID
  async findTaskCardById(id: number): Promise<TaskCard> {
    const card = await this.cardRepo.findOne({ where: { id } });
    if (!card) throw new NotFoundException('Task Card not found');
    return card;
  }

  // Add or update task card
  async createOrUpdateTaskCard(dto: CreateTaskCardDto): Promise<TaskCard> {
    const userId = RequestContext.get('userId');
    const appUser = await this.appUserRepo.findOne({ where: { userId } });
    if (!appUser) throw new NotFoundException('App User not found');
    dto.appId = appUser.appId;
    const board = await this.boardRepo.findOne({ where: { id: dto.boardId } });
    if (!board) throw new NotFoundException('Task Board not found');
    dto.boardId = board.id;
    dto.creatorId = userId;

    let savedCard: TaskCard;
    if (dto.id) {
      const card = await this.cardRepo.findOne({ where: { id: dto.id } });
      if (!card) throw new NotFoundException('Task Card not found');

      this.cardRepo.merge(card, dto);
      savedCard = card;
    } else {
      savedCard = this.cardRepo.create({ ...dto });
    }
    return this.cardRepo.save(savedCard);
  }

  // Update task card serial
  async updateTaskCardsSerial(cards: UpdateTaskCardSerialDto[]): Promise<any> {
    const userId = RequestContext.get('userId');

    if (!cards.length) {
      throw new NotFoundException('No Task Cards provided for update');
    }

    for (const cardDto of cards) {
      const card = await this.cardRepo.findOne({ where: { id: cardDto.id } });
      if (!card) throw new NotFoundException('Task Card not found');
      card.serial = cardDto.serial as number | null;
      await this.cardRepo.save(card);
    }
  }

  // Delete task card
  async deleteTaskCard(id: number): Promise<void> {
    const result = await this.cardRepo.delete(id);
    if (result.affected === 0)
      throw new NotFoundException('Task Card not found');
  }

  // Change active status of task card
  async changeTaskCardActiveStatus(id: number): Promise<TaskCard> {
    const card = await this.cardRepo.findOne({ where: { id } });
    if (!card) throw new NotFoundException('Task Card not found');

    card['isActive'] = !card['isActive'];
    return await this.cardRepo.save(card);
  }

  // --- Task Methods ---

  async createOrUpdateTask(dto: CreateTaskDto): Promise<any> {
    const userId = RequestContext.get('userId');
    const appId = RequestContext.get('activeAppId');

    dto.appId = appId;

    const card = await this.cardRepo.findOne({
      where: { id: dto.cardId },
      relations: ['board'],
    });
    if (!card) throw new NotFoundException('Task Card not found');
    dto.cardId = card.id;

    if (!dto.boardId && card.boardId) {
      dto.boardId = card.boardId;
    }

    if (!dto.workspaceId && card.board?.workspaceId) {
      dto.workspaceId = card.board.workspaceId;
    }

    if (dto.parentTaskId && Number(dto.parentTaskId) > 0) {
      const parentTask = await this.taskRepo.findOne({
        where: { id: Number(dto.parentTaskId) },
      });
      dto.parentTaskId = parentTask ? parentTask.id : null;
    } else {
      dto.parentTaskId = null;
    }

    if (dto.priorityId && Number(dto.priorityId) > 0) {
      const priority = await this.statusRepo.findOne({
        where: { id: Number(dto.priorityId) },
      });
      dto.priorityId = priority ? priority.id : null;
    } else {
      dto.priorityId = null;
    }

    let existingTask: Task | null = null;
    if (dto.id && Number(dto.id) > 0) {
      existingTask = await this.taskRepo.findOne({
        where: { id: Number(dto.id) },
      });
      if (!existingTask) throw new NotFoundException('Task not found');
    }

    if (!existingTask) {
      dto.creatorId = userId;
    } else {
      dto.creatorId = existingTask.creatorId || userId;
    }

    const targetStatusId =
      dto.taskStatusId || existingTask?.taskStatusId || 223;
    const taskStatus = await this.statusRepo.findOne({
      where: { id: targetStatusId },
    });
    if (taskStatus) {
      dto.taskStatusId = taskStatus.id;
    } else if (existingTask?.taskStatusId) {
      dto.taskStatusId = existingTask.taskStatusId;
    }

    let savedTask: Task;

    if (existingTask) {
      savedTask = this.taskRepo.merge(existingTask, dto);
    } else {
      savedTask = this.taskRepo.create({ ...dto });
    }

    savedTask = await this.taskRepo.save(savedTask);
    const findTask = await this.taskRepo.findOne({
      where: { id: savedTask.id, appId },
      relations: ['card', 'card.board'],
    });

    const assignerEmployee = await this.employeeRepo.findOne({
      where: { userId: userId, appId },
    });

    let savedAssignees: any[] = [];
    if (dto.taskAssignees && Array.isArray(dto.taskAssignees)) {
      await this.assigneeRepo.delete({ taskId: savedTask.id, appId });

      if (dto.taskAssignees.length > 0) {
        const taskAssignees = await Promise.all(
          dto.taskAssignees.map(async (item) => {
            const role = item.taskRoleId
              ? await this.statusRepo.findOne({ where: { id: item.taskRoleId } })
              : null;

            return this.assigneeRepo.create({
              appId,
              taskId: savedTask.id,
              assignedOnId: item.assignedOnId,
              assignerId: assignerEmployee?.id as number,
              assignedAt: new Date(),
              confirmedAt: null,
              taskRoleId: role?.id,
              workspaceId: findTask?.card?.board?.workspaceId ?? null,
              cardId: savedTask.cardId,
              boardId: card.boardId ?? null,
              code: `ASSIGNEE_${savedTask.id}_${item.assignedOnId}_${Date.now()}`,
            });
          }),
        );

        savedAssignees = await this.assigneeRepo.save(taskAssignees);
      }
    }

    let savedTags: any[] = [];
    if (dto.taskTags && Array.isArray(dto.taskTags)) {
      await this.tagRepo.delete({ taskId: savedTask.id, appId });

      if (dto.taskTags.length > 0) {
        const taskTags = dto.taskTags.map((tagName) =>
          this.tagRepo.create({
            appId,
            taskId: savedTask.id,
            name: tagName,
            creatorId: userId,
          }),
        );

        savedTags = await this.tagRepo.save(taskTags);
      }
    }

    return { savedTask, taskAssignees: savedAssignees, taskTags: savedTags };
  }

  async findAllTasks(
    queryString: any,
  ): Promise<{ data: Task[]; total: number }> {
    const userId = RequestContext.get('userId');

    const appId = RequestContext.get('activeAppId');

    if (!appId) throw new BadRequestException('app id not found');
    if (!userId) throw new BadRequestException('user id not found');

    const employee = await this.employeeRepo.findOne({
      where: { appId, userId },
      select: ['id'],
    });

    const employeeId = employee?.id;

    const query = this.taskRepo.createQueryBuilder('task');

    query.leftJoin('task.workspace', 'workspace');
    query.leftJoin('task.board', 'board');
    query.leftJoin('task.card', 'card');
    query.leftJoin('task.parentTask', 'parentTask');
    query.leftJoin('task.priority', 'priority');
    query.leftJoin('task.taskStatus', 'taskStatus');
    query.leftJoin('task.assignees', 'assignees');
    query.leftJoin('task.tags', 'tags');
    query.leftJoin('task.comments', 'comments');
    query.leftJoin('comments.creator', 'creator');
    query.leftJoin('creator.profile', 'creatorProfile');
    query.leftJoin('creatorProfile.profilePicture', 'creatorProfilePicture');

    query.leftJoin('assignees.assignedOn', 'assignedOn');
    query.leftJoin('assignedOn.user', 'user');
    query.leftJoin('user.profile', 'profile');
    query.leftJoin('profile.profilePicture', 'profilePicture');

    //query.where('task.appId = :appId', { appId: appUser.appId });

    query.addSelect([
      'workspace.id',
      'workspace.name',
      'workspace.description',
      'workspace.isActive',

      'board.id',
      'board.name',
      'board.active',

      'card.id',
      'card.name',
      'card.color',

      'parentTask.id',
      'parentTask.name',

      'priority.id',
      'priority.name',
      'priority.code',
      'priority.colorName',

      'taskStatus.id',
      'taskStatus.name',
      'taskStatus.code',
      'taskStatus.colorName',

      // assignees
      'assignees.id',
      'assignees.taskRoleId',
      'assignees.assignedOnId',

      'assignedOn.id',

      'user.id',
      'user.firstName',
      'user.lastName',
      'user.email',
      'user.isActive',
      'profile.id',
      'profile.phoneCountryId',
      'profile.phone',
      'profile.gender',
      'profilePicture.id',
      'profilePicture.filename',

      'tags.id',
      'tags.name',

      'comments.id',
      'comments.comment',
      'creator.id',
      'creator.firstName',
      'creator.lastName',
      'creator.email',
      'creator.isActive',
      'creatorProfile.id',
      'creatorProfile.phoneCountryId',
      'creatorProfile.phone',
      'creatorProfile.gender',
      'creatorProfilePicture.id',
      'creatorProfilePicture.filename',
    ]);

    const params = queryString?.params ? JSON.parse(queryString.params) : {};

    query.where('task.appId = :appId', { appId });

    if (params.search) {
      const search = `%${params.search.trim()}%`;
      query.andWhere(
        '(task.name LIKE :search OR task.description LIKE :search)',
        { search },
      );
    }

    if (params.workspaceId) {
      query.andWhere('task.workspaceId = :workspaceId', {
        workspaceId: params.workspaceId,
      });
    }

    if (params.boardId) {
      query.andWhere('task.boardId = :boardId', { boardId: params.boardId });
    }

    if (params.priorityId) {
      query.andWhere('task.priorityId = :priorityId', {
        priorityId: params.priorityId,
      });
    }

    if (params.cardId) {
      query.andWhere('task.cardId = :cardId', { cardId: params.cardId });
    }

    if (params.assigneeId) {
      query.andWhere('assignees.assignedOnId = :assigneeId', {
        assigneeId: params.assigneeId,
      });
    }

    if (params.onlyMyTasks && employeeId) {
      query.andWhere(
        '(assignees.assignedOnId = :employeeId OR assignees.assignerId = :employeeId OR task.creatorId = :userId)',
        { employeeId, userId },
      );
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

  //update taskStatus

  async updateTaskStatus(dto: UpdateTaskStatusDto): Promise<Task> {
    const task = await this.taskRepo.findOne({ where: { id: dto.id } });

    if (!task) throw new NotFoundException('Task not found');

    const status = await this.statusRepo.findOne({
      where: { id: dto.taskStatusId },
    });

    if (!status) {
      throw new NotFoundException('Task status not found');
    }

    task.taskStatusId = status.id;

    if (status.code === 'task_completed') {
      task.completedAt = new Date();
    } else {
      task.completedAt = null;
    }

    return await this.taskRepo.save(task);
  }

  async findTaskById(id: number): Promise<Task[]> {
    const task = await this.taskRepo.findOne({ where: { id } });
    if (!task) throw new NotFoundException('Task not found');
    const query = this.taskRepo.createQueryBuilder('task');

    query.leftJoin('task.card', 'card');
    query.leftJoin('task.parentTask', 'parentTask');
    query.leftJoin('task.priority', 'priority');
    query.leftJoin('task.taskStatus', 'taskStatus');
    query.leftJoin('task.assignees', 'assignees');
    query.leftJoin('task.tags', 'tags');
    query.leftJoin('task.comments', 'comments');
    query.leftJoin('comments.creator', 'creator');
    query.leftJoin('creator.profile', 'creatorProfile');
    query.leftJoin('creatorProfile.profilePicture', 'creatorProfilePicture');

    query.leftJoin('assignees.assignedOn', 'assignedOn');
    query.leftJoin('assignedOn.user', 'user');
    query.leftJoin('user.profile', 'profile');
    query.leftJoin('profile.profilePicture', 'profilePicture');

    //query.where('task.appId = :appId', { appId: appUser.appId });

    query.addSelect([
      'card.id',
      'card.name',
      'card.color',

      'parentTask.id',
      'parentTask.name',

      'priority.id',
      'priority.name',
      'priority.code',
      'priority.colorName',

      'taskStatus.id',
      'taskStatus.name',
      'taskStatus.code',
      'taskStatus.colorName',

      // assignees
      'assignees.id',
      'assignees.taskRoleId',
      'assignees.assignedOnId',

      'assignedOn.id',

      'user.id',
      'user.firstName',
      'user.lastName',
      'user.email',
      'user.isActive',
      'profile.id',
      'profile.phoneCountryId',
      'profile.phone',
      'profile.gender',
      'profilePicture.id',
      'profilePicture.filename',

      'tags.id',
      'tags.name',

      'comments.id',
      'comments.comment',
      'creator.id',
      'creator.firstName',
      'creator.lastName',
      'creator.email',
      'creator.isActive',
      'creatorProfile.id',
      'creatorProfile.phoneCountryId',
      'creatorProfile.phone',
      'creatorProfile.gender',
      'creatorProfilePicture.id',
      'creatorProfilePicture.filename',
    ]);

    const tasks = await query.getMany();
    return tasks;
  }

  async deleteTask(id: number): Promise<void> {
    const result = await this.taskRepo.delete(id);
    if (result.affected === 0) throw new NotFoundException('Task not found');
  }

  async changeTaskActiveStatus(id: number): Promise<Task> {
    const task = await this.taskRepo.findOne({ where: { id } });
    if (!task) throw new NotFoundException('Task not found');
    task.completedAt = task.completedAt ? null : new Date();
    return this.taskRepo.save(task);
  }

  //Task Comments Methods

  async findAllTaskComments(): Promise<TaskComment[]> {
    const comments = await this.commentRepo.find();

    for (const comment of comments) {
      const task = await this.taskRepo.findOne({
        where: { id: comment.taskId },
      });
      if (task) {
        comment.taskInfo = {
          name: task.name ?? null,
          description: task.description ?? null,
        };
      }
    }
    return comments;
  }

  async findTaskCommentById(id: number): Promise<TaskComment> {
    const comment = await this.commentRepo.findOne({ where: { id } });
    if (!comment) throw new NotFoundException('Task comment not found');

    const task = await this.taskRepo.findOne({ where: { id: comment.taskId } });
    if (task) {
      comment.taskInfo = {
        name: task.name ?? null,
        description: task.description ?? null,
      };
    }

    return comment;
  }

  async createOrUpdateTaskComment(
    dto: CreateTaskCommentDto,
  ): Promise<TaskComment> {
    const userId = RequestContext.get('userId');
    const appUser = await this.appUserRepo.findOne({ where: { userId } });
    if (!appUser) throw new NotFoundException('App User not found');

    dto.appId = appUser.appId;
    dto.creatorId = userId;

    const task = await this.taskRepo.findOne({ where: { id: dto.taskId } });
    if (!task) throw new NotFoundException('Task not found');
    dto.taskId = task.id;

    let savedComment: TaskComment;
    if (dto.id) {
      const comment = await this.commentRepo.findOne({ where: { id: dto.id } });
      if (!comment) throw new NotFoundException('Task comment not found');
      this.commentRepo.merge(comment, dto);
      savedComment = comment;
    } else {
      savedComment = this.commentRepo.create({ ...dto });
    }
    return this.commentRepo.save(savedComment);
  }

  async DeleteTaskComment(id: number): Promise<void> {
    const result = await this.commentRepo.delete(id);
    if (result.affected === 0)
      throw new NotFoundException('Task comment not found');
  }

  //cardId Lists

  async getAllCardList(): Promise<TaskCard[]> {
    const appId = RequestContext.get('activeAppId');
    const query = this.cardRepo.createQueryBuilder('card');

    query.select(['card.id', 'card.name', 'card.color']);
    query.where('card.appId = :appId', { appId });

    const list = await query.getMany();
    const newList: any = [];
    list.forEach((item) => {
      const newItem = {
        value: item.id,
        label: item.name,
        color: item.color,
      };
      newList.push(newItem);
    });
    return newList;
  }

  //parent Task Lists

  async getAllParentTaskList(): Promise<Task[]> {
    const appId = RequestContext.get('activeAppId');
    const query = this.taskRepo.createQueryBuilder('task');

    query.select(['task.id', 'task.name']);
    query.where('task.appId = :appId', { appId });

    const list = await query.getMany();
    const newList: any = [];
    list.forEach((item) => {
      const newItem = {
        value: item.id,
        label: item.name,
      };
      newList.push(newItem);
    });
    return newList;
  }

  //get pending task list

  async getPendingTaskList(): Promise<Task[]> {
    const appId = RequestContext.get('activeAppId');
    const query = this.taskRepo.createQueryBuilder('task');

    query.leftJoin('task.card', 'card');
    query.leftJoin('task.parentTask', 'parentTask');
    query.leftJoin('task.priority', 'priority');
    query.leftJoin('task.taskStatus', 'taskStatus');
    query.leftJoin('task.assignees', 'assignees');
    query.leftJoin('task.tags', 'tags');
    query.leftJoin('task.comments', 'comments');
    query.leftJoin('comments.creator', 'creator');
    query.leftJoin('creator.profile', 'creatorProfile');
    query.leftJoin('creatorProfile.profilePicture', 'creatorProfilePicture');

    query.leftJoin('assignees.assignedOn', 'assignedOn');
    query.leftJoin('assignedOn.user', 'user');
    query.leftJoin('user.profile', 'profile');
    query.leftJoin('profile.profilePicture', 'profilePicture');

    //query.where('task.appId = :appId', { appId: appUser.appId });

    query.addSelect([
      'card.id',
      'card.name',
      'card.color',

      'parentTask.id',
      'parentTask.name',

      'priority.id',
      'priority.name',
      'priority.code',
      'priority.colorName',

      'taskStatus.id',
      'taskStatus.name',
      'taskStatus.code',
      'taskStatus.colorName',

      // assignees
      'assignees.id',
      'assignees.taskRoleId',
      'assignees.assignedOnId',

      'assignedOn.id',

      'user.id',
      'user.firstName',
      'user.lastName',
      'user.email',
      'user.isActive',
      'profile.id',
      'profile.phoneCountryId',
      'profile.phone',
      'profile.gender',
      'profilePicture.id',
      'profilePicture.filename',

      'tags.id',
      'tags.name',

      'comments.id',
      'comments.comment',
      'creator.id',
      'creator.firstName',
      'creator.lastName',
      'creator.email',
      'creator.isActive',
      'creatorProfile.id',
      'creatorProfile.phoneCountryId',
      'creatorProfile.phone',
      'creatorProfile.gender',
      'creatorProfilePicture.id',
      'creatorProfilePicture.filename',
    ]);
    query.where('task.appId = :appId', { appId });
    query.andWhere('task.taskStatusId = :taskStatusId', { taskStatusId: 223 });

    query.orderBy('task.createdAt', 'DESC');

    const tasks = await query.getMany();
    return tasks;
  }

  ///get-workspance-list without pagination

  async getWorkspacesList(
    queryString: any,
  ): Promise<{ data: TaskWorkspace[]; total: number }> {
    const appId = RequestContext.get('activeAppId');
    const query = this.workspaceRepo.createQueryBuilder('workspace');

    query.leftJoin('workspace.boards', 'boards');
    query.leftJoin('boards.viewType', 'viewType');

    query.select([
      'workspace.id',
      'workspace.name',

      'boards.id',
      'boards.name',

      'viewType.id',
      'viewType.name',
      'viewType.code',
      'viewType.colorName',
    ]);

    query.where('workspace.appId = :appId', { appId });

    // ✅ pagination / sorting / filtering (same pattern as demo)
    const features = new APIFeatures(query, queryString)
      .sort()
      .limitFields()
      .paginate();

    const data = await features.getQuery().getMany();
    const total = await query.getCount();

    return { data, total };
  }

  async getBoardListByWorkspaceId(workspaceId: number): Promise<TaskBoard[]> {
    const query = this.boardRepo.createQueryBuilder('board');

    query.leftJoin('board.viewType', 'viewType');
    query.leftJoin('board.cards', 'cards');

    query.select([
      'board.id',
      'board.name',

      'viewType.id',
      'viewType.name',
      'viewType.code',
      'viewType.colorName',

      'cards.id',
      'cards.name',
      'cards.color',
      'cards.serial',
    ]);

    query.where('board.workspaceId = :workspaceId', { workspaceId });
    query.orderBy('board.createdAt', 'DESC');

    const list = await query.getMany();
    return list;
  }

  async getCardsByBoardId(boardId: number): Promise<TaskCard[]> {
    const query = this.cardRepo.createQueryBuilder('card');

    query.leftJoin('card.board', 'board');
    query.leftJoin('board.viewType', 'viewType');

    query.select([
      'card.id',
      'card.name',
      'card.color',
      'card.serial',

      'viewType.id',
      'viewType.name',
      'viewType.code',
      'viewType.colorName',
    ]);

    query.where('card.boardId = :boardId', { boardId });

    const list = await query.getMany();
    return list;
  }

  async getTasksByCardId(
    cardId: number,
    queryString: any,
  ): Promise<{ data: Task[]; total: number }> {
    const appId = RequestContext.get('activeAppId');
    const query = this.taskRepo.createQueryBuilder('task');

    query.leftJoin('task.card', 'card');
    query.leftJoin('task.priority', 'priority');
    query.leftJoin('task.taskStatus', 'taskStatus');

    query.addSelect([
      //  'task.id',
      // 'task.name',
      // 'task.description',

      'card.id',
      'card.name',
      'card.color',
      'card.serial',

      'taskStatus.id',
      'taskStatus.name',
      'taskStatus.code',
      'taskStatus.colorName',

      'priority.id',
      'priority.name',
      'priority.code',
      'priority.colorName',
    ]);

    query.where('task.cardId = :cardId', { cardId });
    query.andWhere('card.appId = :appId', { appId: appId });

    const params = queryString?.params ? JSON.parse(queryString.params) : {};

    if (params.search) {
      const search = `%${params.search.trim()}%`;
      query.andWhere('task.name LIKE :search', { search });
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

  async getTasksByWorkspaceId(workspaceId: number): Promise<Task[]> {
    const appId = RequestContext.get('activeAppId');
    const query = this.taskRepo.createQueryBuilder('task');
    query.leftJoin('task.taskStatus', 'taskStatus');

    query.select([
      'task.id',
      'task.name',
      'task.description',
      'task.dueDate',
      'taskStatus.id',
      'taskStatus.name',
      'taskStatus.code',
      'taskStatus.colorName',
    ]);

    query.where('task.workspaceId = :workspaceId', { workspaceId });
    query.andWhere('task.appId = :appId', { appId });

    const tasks = await query.getMany();
    return tasks;
  }

  async getTaskCardsByWorkspaceId(workspaceId: number): Promise<TaskCard[]> {
    const appId = RequestContext.get('activeAppId');
    const query = this.cardRepo.createQueryBuilder('card');

    query.select(['card.id', 'card.name', 'card.color', 'card.serial']);

    query.where('card.workspaceId = :workspaceId', { workspaceId });
    query.andWhere('card.appId = :appId', { appId });
    query.andWhere('card.isActive = :isActive', { isActive: 1 });
    query.orderBy('card.createdAt', 'DESC');
    query.orderBy('card.serial', 'ASC');

    const cards = await query.getMany();
    return cards;
  }

  async getTaskComments(taskId: number): Promise<any[]> {
    const appId = RequestContext.get('activeAppId');

    if (!appId) {
      throw new BadRequestException('app id not found');
    }

    const task = await this.taskRepo.findOne({
      where: { id: taskId, appId },
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${taskId} not found`);
    }

    const comments = await this.commentRepo
      .createQueryBuilder('comment')
      .leftJoin('comment.task', 'task')
      .leftJoin('task.priority', 'priority')
      .leftJoin('task.taskStatus', 'taskStatus')
      .leftJoin('comment.creator', 'creator')
      .addSelect([
        'task.id',
        'task.name',
        'task.description',
        'task.serial',
        'task.completedAt',

        'priority.id',
        'priority.name',
        'priority.code',
        'priority.colorName',

        'taskStatus.id',
        'taskStatus.name',
        'taskStatus.code',
        'taskStatus.colorName',

        'comment.id',
        'comment.comment',
        'comment.createdAt',

        'creator.id',
        'creator.firstName',
        'creator.lastName',
        'creator.email',
      ])
      .where('comment.taskId = :taskId', { taskId })
      .andWhere('comment.appId = :appId', { appId })
      .orderBy('comment.createdAt', 'DESC')
      .getMany();

    return comments;
  }

  //  async findActivePayItemList(): Promise<EmpPayItem[]> {
  //     const query = this.empPayItemRepo.createQueryBuilder('item');
  //     const appId = RequestContext.get('activeAppId');

  //     query
  //       .select(['item.id', 'item.itemName', 'item.itemCode'])
  //       .where('item.isActive = :isActive', { isActive: true })
  //       .andWhere('item.appId = :appId', { appId });

  //     const list = await query.getMany();
  //     const newList: any = [];
  //     list.forEach((item) => {
  //       const newItem = {
  //         value: item.id,
  //         label: item.itemName,
  //         itemCode: item.itemCode,
  //       };
  //       newList.push(newItem);
  //     });
  //     return newList;
  //   }

  // Get all tags
  // async findAllTaskTags(): Promise<TaskTag[]> {
  //   const tags = await this.tagRepo.find();
  //   for (const tag of tags) {
  //     const task = await this.taskRepo.findOne({ where: { id: tag.taskId } });
  //     if (task) {
  //       tag.taskInfo = {
  //         name: task.name ?? null,
  //         description: task.description ?? null,
  //       };
  //     }
  //   }
  //   return tags;
  // }

  //  Get tag by ID
  // async findTaskTagById(id: number): Promise<TaskTag> {
  //   const tag = await this.tagRepo.findOne({ where: { id } });
  //   if (!tag) throw new NotFoundException('Task tag not found');
  //   const task = await this.taskRepo.findOne({ where: { id: tag.taskId } });
  //   if (task) {
  //     tag.taskInfo = {
  //       name: task.name ?? null,
  //       description: task.description ?? null,
  //     };
  //   }

  //   return tag;
  // }

  // // Create or update tag
  // async createOrUpdateTaskTag(dto: CreateTaskTagDto): Promise<TaskTag> {
  //   const userId = RequestContext.get('userId');

  //   const appUser = await this.appUserRepo.findOne({ where: { userId } });
  //   if (!appUser) throw new NotFoundException('App User not found');

  //   dto.appId = appUser.appId;
  //   dto.creatorId = userId;

  //   const task = await this.taskRepo.findOne({ where: { id: dto.taskId } });
  //   if (!task) throw new NotFoundException('Task not found');
  //   dto.taskId = task.id;

  //   let savedTag: TaskTag;

  //   if (dto.id) {
  //     // update
  //     const tag = await this.tagRepo.findOne({ where: { id: dto.id } });
  //     if (!tag) throw new NotFoundException('Task tag not found');
  //     this.tagRepo.merge(tag, dto);
  //     savedTag = tag;
  //   } else {
  //     // create
  //     savedTag = this.tagRepo.create({ ...dto });
  //   }
  //   return this.tagRepo.save(savedTag);
  // }

  // // Delete tag
  // async deleteTaskTag(id: number): Promise<void> {
  //   const result = await this.tagRepo.delete(id);
  //   if (result.affected === 0)
  //     throw new NotFoundException('Task tag not found');
  // }

  // Task Assignees Methods

  // async findAllTaskAssignees(): Promise<TaskAssignee[]> {
  //   const assignees = await this.assigneeRepo.find();

  //   for (const assignee of assignees) {
  //     // Fetch related workspace
  //     if (assignee.workspaceId) {
  //       const workspace = await this.workspaceRepo.findOne({
  //         where: { id: assignee.workspaceId },
  //       });
  //       if (workspace) {
  //         assignee.workspaceInfo = {
  //           name: workspace.name ?? null,
  //           description: workspace.description ?? null,
  //         };
  //       }
  //     }

  //     // Fetch related board
  //     if (assignee.boardId) {
  //       const board = await this.boardRepo.findOne({
  //         where: { id: assignee.boardId },
  //       });
  //       if (board) {
  //         assignee.boardName = board.name ?? null;
  //       }
  //     }

  //     // Fetch related task
  //     if (assignee.taskId) {
  //       const task = await this.taskRepo.findOne({
  //         where: { id: assignee.taskId },
  //       });
  //       if (task) {
  //         assignee.taskInfo = {
  //           name: task.name ?? null,
  //           description: task.description ?? null,
  //         };
  //       }
  //     }
  //   }

  //   return assignees;
  // }

  // async findTaskAssigneeById(id: number): Promise<TaskAssignee> {
  //   const assignee = await this.assigneeRepo.findOne({ where: { id } });
  //   if (!assignee) throw new NotFoundException('Task assignee not found');
  //   // Fetch related workspace
  //   if (assignee.workspaceId) {
  //     const workspace = await this.workspaceRepo.findOne({
  //       where: { id: assignee.workspaceId },
  //     });
  //     if (workspace) {
  //       assignee.workspaceInfo = {
  //         name: workspace.name ?? null,
  //         description: workspace.description ?? null,
  //       };
  //     }
  //   }

  //   // Fetch related board
  //   if (assignee.boardId) {
  //     const board = await this.boardRepo.findOne({
  //       where: { id: assignee.boardId },
  //     });
  //     if (board) {
  //       assignee.boardName = board.name ?? null;
  //     }
  //   }

  //   // Fetch related task
  //   if (assignee.taskId) {
  //     const task = await this.taskRepo.findOne({
  //       where: { id: assignee.taskId },
  //     });
  //     if (task) {
  //       assignee.taskInfo = {
  //         name: task.name ?? null,
  //         description: task.description ?? null,
  //       };
  //     }
  //   }
  //   return assignee;
  // }

  // async createOrUpdateTaskAssignee(
  //   dto: CreateTaskAssigneeDto,
  // ): Promise<TaskAssignee> {
  //   const userId = RequestContext.get('userId');
  //   const appUser = await this.appUserRepo.findOne({ where: { userId } });
  //   if (!appUser) throw new NotFoundException('App User not found');
  //   dto.appId = appUser.appId;

  //   const assigner = await this.statusRepo.findOne({
  //     where: { id: dto.AssignerId },
  //   });
  //   if (!assigner) throw new NotFoundException('Assigner not found');
  //   dto.AssignerId = assigner.id;

  //   const workSpace = await this.workspaceRepo.findOne({
  //     where: { id: dto.workspaceId ?? undefined },
  //   });
  //   if (!workSpace) throw new NotFoundException('WorkSpace not found');
  //   dto.workspaceId = workSpace.id;

  //   const board = await this.boardRepo.findOne({
  //     where: { id: dto.boardId ?? undefined },
  //   });
  //   if (!board) throw new NotFoundException('Board not found');
  //   dto.boardId = board.id;

  //   const card = await this.cardRepo.findOne({
  //     where: { id: dto.cardId ?? undefined },
  //   });

  //   if (!card) throw new NotFoundException('Card not found');
  //   dto.cardId = card.id;

  //   const task = await this.taskRepo.findOne({
  //     where: { id: dto.taskId ?? undefined },
  //   });
  //   if (!task) throw new NotFoundException('Task not found');
  //   dto.taskId = task.id;

  //   const taskRole = await this.statusRepo.findOne({
  //     where: { id: dto.taskRoleId ?? undefined },
  //   });

  //   if (!taskRole) throw new NotFoundException('Task Role not found');
  //   dto.taskRoleId = taskRole.id;

  //   const assignedOn = await this.statusRepo.findOne({
  //     where: { id: dto.assignedOnId ?? undefined },
  //   });

  //   if (!assignedOn) throw new NotFoundException('Assigned On not found');
  //   dto.assignedOnId = assignedOn.id;

  //   let savedAssignee: TaskAssignee;

  //   if (dto.id) {
  //     const assignee = await this.assigneeRepo.findOne({
  //       where: { id: dto.id },
  //     });
  //     if (!assignee) throw new NotFoundException('Task assignee not found');
  //     this.assigneeRepo.merge(assignee, dto);
  //     savedAssignee = assignee;
  //   } else {
  //     savedAssignee = this.assigneeRepo.create({ ...dto });
  //   }
  //   return this.assigneeRepo.save(savedAssignee);
  // }

  // async deleteTaskAssignee(id: number): Promise<void> {
  //   const result = await this.assigneeRepo.delete(id);
  //   if (result.affected === 0)
  //     throw new NotFoundException('Task assignee not found');
  // }
}
