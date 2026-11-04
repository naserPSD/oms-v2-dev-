import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { TaskService } from './task.service';
import {
  CreateTaskDto,
  TaskResponseDto,
  UpdateTaskStatusDto,
} from './dto/task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import {
  CreateTaskWorkspaceDto,
  TaskWorkspaceResponseDto,
} from './dto/task-workspace.dto';
import { JwtAuthGuard } from '@core/guards/jwt-auth.guard';
import { TaskWorkspace } from './entities/task-workspace.entity';
import { User } from '@module/users/entities/user.entity';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiParam,
  ApiBody,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import {
  CreateTaskBoardDto,
  TaskBoardResponseDto,
} from './dto/task-boards.dto';
import {
  CreateTaskCardDto,
  TaskCardResponseDto,
  UpdateTaskCardSerialDto,
} from './dto/task-cards.dto';
import {
  CreateTaskCommentDto,
  TaskCommentResponseDto,
} from './dto/task-comments.dto';
import { dataloaderIntegration } from '@sentry/node';
import { TaskTag } from './entities/task-tags.entity';
import { CreateTaskTagDto } from './dto/task-tags.dto';
import { CreateTaskAssigneeDto } from './dto/task-assignees.dto';
import { Helpers } from '@core/utils/helpers';
import { TaskAssignee } from './entities/task-assignees.entity';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access_token')
@ApiTags('Task')
@Controller('api/v1/task')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  // @Get()
  // findAll() {
  //   return this.taskService.findAll();
  // }

  @Get('/get-all-workspaces')
  @ApiOperation({ summary: 'Get all workspaces' })
  @ApiQuery({
    name: 'params',
    required: false,
    description: 'Search parameters, e.g., { "search": "Workspace name" }',
    example: '{ "search": "Main Workspace" }',
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    description: 'Sort results by field, e.g., id:desc, name:asc',
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
  @ApiResponse({
    status: 200,
    description: 'Workspaces retrieved successfully',
    type: [TaskWorkspaceResponseDto], // You can create a simple response DTO if needed
  })
  async getAllWorkspaces(@Query() query: any) {
    const queryResult = await this.taskService.findAllWorkspaces(query);

    return {
      status: 'success',
      message: 'Workspaces retrieved successfully',
      data: queryResult.data,
      pagination: Helpers.makePaginationData(query, queryResult),
    };
  }

  @Get('/get-all-boards')
  @ApiOperation({ summary: 'Get all task boards' })
  @ApiQuery({
    name: 'params',
    required: false,
    description: 'Search parameters, e.g., { "search": "Board name" }',
    example: '{ "search": "Development Board" }',
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    description: 'Sort results by field, e.g., id:desc, name:asc',
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
  @ApiResponse({
    status: 200,
    description: 'Task boards retrieved successfully',
    type: [TaskBoardResponseDto],
  })
  async getAllBoards(@Query() query: any) {
    const queryResult = await this.taskService.findAllBoards(query);

    return {
      status: 'success',
      message: 'Task boards retrieved successfully',
      data: queryResult.data,
      pagination: Helpers.makePaginationData(query, queryResult),
    };
  }

  @Get('/get-all-task-cards')
  @ApiOperation({ summary: 'Get all task cards' })
  @ApiQuery({
    name: 'params',
    required: false,
    description: 'Search parameters, e.g., { "search": "Card name" }',
    example: '{ "search": "Design" }',
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    description: 'Sort results by field, e.g., id:desc, name:asc',
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
  @ApiResponse({
    status: 200,
    description: 'Task cards retrieved successfully',
    type: [TaskCardResponseDto],
  })
  async getAllTaskCards(@Query() query: any) {
    const queryResult = await this.taskService.findAllTaskCards(query);

    return {
      status: 'success',
      message: 'Task cards retrieved successfully',
      data: queryResult.data,
      pagination: Helpers.makePaginationData(query, queryResult),
    };
  }

  @Get('/get-all-tasks')
  @ApiOperation({ summary: 'Get all tasks' })
  @ApiQuery({
    name: 'params',
    required: false,
    description: 'Search parameters, e.g., { "search": "Task name" }',
    example: '{ "search": "Design database", "priorityId": 2 }',
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    description: 'Sort results by field, e.g., id:desc, name:asc',
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
  @ApiResponse({
    status: 200,
    description: 'Tasks retrieved successfully',
    type: [TaskResponseDto],
  })
  async getAllTasks(@Query() query: any) {
    const queryResult = await this.taskService.findAllTasks(query);

    return {
      status: 'success',
      message: 'Tasks retrieved successfully',
      data: queryResult.data,
      pagination: Helpers.makePaginationData(query, queryResult),
    };
  }

  //update TaskStatusId

  @Patch('/update-task-status')
  @ApiOperation({ summary: 'Update task status' })
  async updateTaskStatus(@Body() dto: UpdateTaskStatusDto) {
    const task = await this.taskService.updateTaskStatus(dto);
    return {
      status: 'success',
      message: 'Task status updated successfully',
      data: task,
    };
  }

  // Get all task comments
  @Get('/get-task-comments')
  @ApiOperation({ summary: 'Get all tasks Comment' })
  async getAllTaskComments() {
    const comments = await this.taskService.findAllTaskComments();
    return {
      status: 'success',
      message: 'All task comments retrieved successfully',
      data: comments,
    };
  }

  // Get all task tags

  // @Get('/get-task-tags')
  // @ApiOperation({ summary: 'Get all task tags' })
  // async getAllTaskTags() {
  //   const tags = await this.taskService.findAllTaskTags();
  //   return {
  //     status: 'success',
  //     message: 'All task tags retrieved successfully',
  //     data: tags,
  //   };
  // }

  @Get('/workspaces/:id')
  @ApiOperation({ summary: 'Get Task Workspace by ID' })
  @ApiParam({ name: 'id', type: 'number' })
  async getWorkspaceById(@Param('id') id: string) {
    const workspace = await this.taskService.findWorkspaceById(+id);
    return {
      status: 'success',
      message: 'Workspace retrieved successfully',
      data: workspace,
    };
  }

  @Post('/add-or-update-workspace')
  @ApiOperation({ summary: 'Add or Update Task Workspace' })
  async addOrUpdateWorkspace(@Body() dto: CreateTaskWorkspaceDto, @Req() req) {
    const user: User = req.user;
    dto.creatorId = user?.id;

    const workspace = await this.taskService.createOrUpdateWorkspace(dto);

    return {
      status: 'success',
      message: `Workspace ${dto.id ? 'updated' : 'added'} successfully`,
      data: workspace,
    };
  }

  @Delete('/delete-workspace/:id')
  @ApiOperation({ summary: 'Delete Task Workspace' })
  async deleteWorkspace(@Param('id') id: string) {
    await this.taskService.deleteWorkspace(+id);
    return {
      status: 'success',
      message: 'Workspace deleted successfully',
    };
  }

  @Patch('/workspaces/change-active-status/:id')
  @ApiOperation({ summary: 'Change Workspace Active Status' })
  async changeWorkspaceActiveStatus(@Param('id') id: string) {
    const result = await this.taskService.changeWorkspaceActiveStatus(+id);
    return {
      status: 'success',
      message: 'Workspace active status changed successfully',
      data: result,
    };
  }

  // @Get('/board/:workspaceId')
  // @ApiOperation({ summary: 'Get all boards of a workspace' })
  // @ApiParam({ name: 'workspaceId', type: 'number' })
  // async getAllBoardsByWorkspace(@Param('workspaceId') workspaceId: string) {
  //   const boards = await this.taskService.findBoardsByWorkspace(+workspaceId);
  //   return {
  //     status: 'success',
  //     message: 'Boards retrieved successfully',
  //     data: boards,
  //   };
  // }

  @Get('/task-board/:id')
  @ApiOperation({ summary: 'Get task-board by ID' })
  @ApiParam({ name: 'id', type: 'number' })
  async findTaskBoardById(@Param('id') id: string) {
    const board = await this.taskService.findTaskBoardById(+id);
    return {
      status: 'success',
      message: 'Task-Board retrieved successfully',
      data: board,
    };
  }

  @Post('/task-board/add-or-update-task-board')
  @ApiOperation({ summary: 'Add or update a task-board' })
  async addOrUpdateTaskBoard(@Body() dto: CreateTaskBoardDto, @Req() req: any) {
    const user: User = req.user;
    dto.creatorId = user?.id;

    const board = await this.taskService.createOrTaskUpdateBoard(dto);

    return {
      status: 'success',
      message: `Task-Board ${dto.id ? 'updated' : 'added'} successfully`,
      data: board,
    };
  }

  @Delete('/delete-task-board/:id')
  @ApiOperation({ summary: 'Delete a taskBoard' })
  async deleteTaskBoard(@Param('id') id: string) {
    await this.taskService.deleteTaskBoard(+id);
    return {
      status: 'success',
      message: 'Task-Board deleted successfully',
    };
  }

  @Patch('/task-board/change-active-status/:id')
  @ApiOperation({ summary: 'Change task-board active status' })
  async changeTaskBoardActiveStatus(@Param('id') id: string) {
    const board = await this.taskService.changeTaskBoardActiveStatus(+id);
    return {
      status: 'success',
      message: 'Task-Board active status changed successfully',
      data: board,
    };
  }

  @Get('/task-card/:id')
  @ApiOperation({ summary: 'Get task card by ID' })
  async getTaskCardById(@Param('id') id: number) {
    const card = await this.taskService.findTaskCardById(id);
    return {
      status: 'success',
      message: 'Task card retrieved successfully',
      data: card,
    };
  }

  @Post('/add-or-update-task-card')
  @ApiOperation({ summary: 'Add or update a task card' })
  async addOrUpdateTaskCard(@Body() dto: CreateTaskCardDto, @Req() req) {
    const user: User = req.user;
    dto.creatorId = user?.id;
    const card = await this.taskService.createOrUpdateTaskCard(dto);
    return {
      status: 'success',
      message: `Task card ${dto.id ? 'updated' : 'added'} successfully`,
      data: card,
    };
  }

  @Post('/update-task-cards-serial')
  @ApiOperation({ summary: 'Update task card serial' })
  @ApiBody({
    type: [UpdateTaskCardSerialDto],
    description: 'Array of task cards with updated serials',
  })
  async updateTaskCardsSerial(
    @Body() cards: UpdateTaskCardSerialDto[],
    @Req() req,
  ) {
    const card = await this.taskService.updateTaskCardsSerial(cards);
    return {
      status: 'success',
      message: `Task card serial updated successfully`,
      data: card,
    };
  }

  @Delete('/delete-task-card/:id')
  @ApiOperation({ summary: 'Delete a task card' })
  async deleteTaskCard(@Param('id') id: number) {
    await this.taskService.deleteTaskCard(id);
    return {
      status: 'success',
      message: `Task card with ID ${id} deleted successfully`,
    };
  }

  @Patch('/change-task-card-status/:id')
  @ApiOperation({ summary: 'Change active status of a task card' })
  async changeTaskCardStatus(@Param('id') id: number) {
    const card = await this.taskService.changeTaskCardActiveStatus(id);
    return {
      status: 'success',
      message: 'Task card status updated successfully',
      data: card,
    };
  }

  // Create or update task
  @Post('/add-or-update-task')
  @ApiOperation({ summary: 'Create or update a task' })
  @ApiBody({ type: CreateTaskDto })
  async addOrUpdateTask(@Body() dto: CreateTaskDto) {
    const saved = await this.taskService.createOrUpdateTask(dto);

    return {
      status: 'success',
      message: dto.id ? 'Task updated successfully' : 'Task added successfully',
      data: saved,
    };
  }

  // Get task by ID
  @Get('/get-task/:id')
  @ApiOperation({ summary: 'Get task by ID' })
  async getTask(@Param('id') id: number) {
    const task = await this.taskService.findTaskById(id);
    return { status: 'success', data: task };
  }

  // Delete task
  @Delete('/delete-task/:id')
  @ApiOperation({ summary: 'Delete a task' })
  async deleteTask(@Param('id') id: number) {
    await this.taskService.deleteTask(id);
    return { status: 'success', message: 'Task deleted successfully' };
  }

  @Patch('/task-change-status/:id')
  @ApiOperation({ summary: 'Change task active status' })
  async changeTaskStatus(@Param('id') id: number) {
    const task = await this.taskService.changeTaskActiveStatus(id);
    return { status: 'success', data: TaskResponseDto.fromEntity(task) };
  }

  // Get task comment by ID
  @Get('/task-comment/:id')
  @ApiOperation({ summary: 'Get task comment by ID' })
  async findById(@Param('id') id: number) {
    const comment = await this.taskService.findTaskCommentById(id);
    return {
      status: 'success',
      message: 'Task comment retrieved successfully',
      data: comment,
    };
  }

  // Create or update task comment
  @Post('/add-or-update-task-comment')
  @ApiOperation({ summary: 'Create or update a task comment' })
  async createOrUpdate(@Body() dto: CreateTaskCommentDto, @Req() req) {
    const user: User = req.user;
    dto.creatorId = user?.id;

    const comment = await this.taskService.createOrUpdateTaskComment(dto);
    return {
      status: 'success',
      message: dto.id
        ? 'Task comment updated successfully'
        : 'Task comment added successfully',
      data: comment,
    };
  }

  // Delete task comment
  @Delete('/delete-task-comment/:id')
  @ApiOperation({ summary: 'Delete a task comment' })
  async delete(@Param('id') id: number): Promise<{ message: string }> {
    await this.taskService.DeleteTaskComment(id);
    return { message: 'Task comment deleted successfully' };
  }

  @Get('/get-all-card-list')
  @ApiOperation({ summary: 'Get all card list' })
  async getAllCardList() {
    const cardList = await this.taskService.getAllCardList();
    return {
      status: 'success',
      message: 'All card list retrieved successfully',
      data: cardList,
    };
  }

  // Get all parent task list
  @Get('/get-all-parent-task-list')
  @ApiOperation({ summary: 'Get all parent task list' })
  async getAllParentTaskList() {
    const parentTaskList = await this.taskService.getAllParentTaskList();
    return {
      status: 'success',
      message: 'All parent task list retrieved successfully',
      data: parentTaskList,
    };
  }

  //pending task list

  @Get('/get-pending-task-list')
  @ApiOperation({ summary: 'Get all pending task lists' })
  async getPendingTaskList() {
    const pendingTaskList = await this.taskService.getPendingTaskList();
    return {
      status: 'success',
      message: 'All pending task list retrieved successfully',
      data: pendingTaskList,
    };
  }

  @Get('/get-workspace-list')
  @ApiOperation({ summary: 'Get all workspaces with pagination' })
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
  @ApiQuery({
    name: 'sort',
    required: false,
    description: 'Sort results by field, e.g., id:desc,name:asc',
  })
  @ApiQuery({
    name: 'fields',
    required: false,
    description: 'Limit fields returned, separate by comma',
  })
  @ApiResponse({
    status: 200,
    description: 'Workspaces retrieved successfully',
    // create DTO if needed
  })
  async getWorkspaceList(@Query() query: any) {
    const queryResult = await this.taskService.getWorkspacesList(query);

    return {
      status: 'success',
      message: 'Workspace list fetched successfully',
      data: queryResult.data,
      pagination: Helpers.makePaginationData(query, queryResult),
    };
  }

  @Get('/get-board-list-by-workspace-id/:id')
  @ApiOperation({ summary: 'Get board list by workspace ID' })
  async getBoardListByWorkspaceId(@Param('id') workspaceId: number) {
    const data = await this.taskService.getBoardListByWorkspaceId(workspaceId);
    return {
      success: true,
      message: 'Board list fetched successfully',
      data,
    };
  }

  @Get('/get-card-list-by-board-id/:id')
  @ApiOperation({ summary: 'Get all cards by board id' })
  async getCardListByBoardId(@Param('id') boardId: number) {
    const data = await this.taskService.getCardsByBoardId(boardId);
    return {
      success: true,
      message: 'Card list fetched successfully',
      data,
    };
  }

  //get task-list-by-card-id with pagination

  @Get('/get-task-list-by-card-id/:id')
  @ApiOperation({ summary: 'Get all tasks by card id with pagination' })
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
  @ApiQuery({
    name: 'sort',
    required: false,
    description: 'Sort results by field, e.g., id:desc,name:asc',
  })
  @ApiQuery({
    name: 'fields',
    required: false,
    description: 'Limit fields returned, separate by comma',
  })
  @ApiResponse({
    status: 200,
    description: 'Tasks retrieved successfully',
    type: [TaskResponseDto], // Create a DTO for response if needed
  })
  async getTaskListByCardId(@Param('id') cardId: number, @Query() query: any) {
    const queryResult = await this.taskService.getTasksByCardId(cardId, query);

    return {
      status: 'success',
      message: 'Task list fetched successfully',
      data: queryResult.data,
      pagination: Helpers.makePaginationData(query, queryResult),
    };
  }

  @Get('/get-tasks-by-workspace-Id/:id')
  @ApiOperation({ summary: 'Get tasks by Workspace ID' })
  async getTasksByWorkspaceId(@Param('id') workspaceId: string) {
    const tasks = await this.taskService.getTasksByWorkspaceId(+workspaceId);

    return {
      status: 'success',
      message: 'Tasks retrieved successfully',
      data: tasks,
    };
  }

  @Get('/get-task-cards-by-workspace-id/:id')
  @ApiOperation({ summary: 'Get task cards by Workspace ID' })
  async getTaskCardsByWorkspaceId(@Param('id') workspaceId: string) {
    const cards =
      await this.taskService.getTaskCardsByWorkspaceId(+workspaceId);

    return {
      status: 'success',
      message: 'Task cards retrieved successfully',
      data: cards,
    };
  }

  @Get('get-task-comments/:id')
  async getTaskComments(@Param('id', ParseIntPipe) id: number) {
    const data = await this.taskService.getTaskComments(id);

    return {
      status: 'success',
      message: 'Task comments retrieved successfully',
      data,
    };
  }
}

// Get tag by ID
// @Get('get-task-tag/:id')
// @ApiOperation({ summary: 'Get task tag by ID' })
// async getTaskTagById(@Param('id') id: number) {
//   const tag = await this.taskService.findTaskTagById(Number(id));
//   return {
//     status: 'success',
//     message: 'Task tag retrieved successfully',
//     data: tag,
//   };
// }

// Create or update tag
// @Post('add-or-update-task-tag')
// @ApiOperation({ summary: 'Create or update a task tag' })
// async addOrUpdateReference(@Body() dto: CreateTaskTagDto, @Req() req) {
//   const user: User = req.user;

//   dto.creatorId = user?.id;

//   const queryResult = await this.taskService.createOrUpdateTaskTag(dto);

//   return {
//     status: 'success',
//     message: dto.id
//       ? 'Task tag updated successfully'
//       : 'Task tag added successfully',
//     data: queryResult,
//   };
// }

// Delete tag
// @Delete('/delete-task-tag/:id')
// @ApiOperation({ summary: 'Delete a task tag' })
// async deleteTaskTag(@Param('id') id: string) {
//   const queryResult = await this.taskService.deleteTaskTag(+id);

//   return {
//     status: 'success',
//     message: 'Task tag deleted successfully',
//     data: queryResult,
//   };

// Get all task assignees

// @Get('/get-task-assignees')
// @ApiOperation({ summary: 'Get all task assignees' })
// async getAllTaskAssignees() {
//   const queryResult = await this.taskService.findAllTaskAssignees();
//   return {
//     status: 'success',
//     message: 'All task assignees retrieved successfully',
//     data: queryResult,
//   };

// @Post('/add-or-update-task-assignee')
// @ApiOperation({ summary: 'Create or update a task assignee' })
// async addOrUpdateTaskAssignee(
//   @Body() dto: CreateTaskAssigneeDto,
//   @Req() req,
// ) {
//   const user: User = req.user;

//   // AssignerId = logged-in user if not provided
//   dto.AssignerId = dto.AssignerId || user?.id;

//   const queryResult = await this.taskService.createOrUpdateTaskAssignee(dto);

//   return {
//     status: 'success',
//     message: dto.id
//       ? 'Task assignee updated successfully'
//       : 'Task assignee added successfully',
//     data: queryResult,
//   };
// }

// @Get('task-assignee/:id')
// @ApiOperation({ summary: 'Get a task assignee by ID' })
// async getTaskAssigneeById(@Param('id') id: string) {
//   const queryResult = await this.taskService.findTaskAssigneeById(+id);
//   return {
//     status: 'success',
//     message: 'Task assignee retrieved successfully',
//     data: queryResult,
//   };
// }

// @Delete('delete-task-assignee/:id')
// @ApiOperation({ summary: 'Delete a task assignee' })
// async deleteTaskAssignee(@Param('id') id: string) {
//   await this.taskService.deleteTaskAssignee(+id);
//   return {
//     status: 'success',
//     message: 'Task assignee deleted successfully',
//     data: {},
//   };
