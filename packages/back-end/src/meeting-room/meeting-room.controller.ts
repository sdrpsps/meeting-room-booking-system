import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { CreateMeetingRoomDto } from './dto/create-meeting-room.dto';
import { UpdateMeetingRoomDto } from './dto/update-meeting-room.dto';
import { MeetingRoomService } from './meeting-room.service';

@Controller('meeting-room')
export class MeetingRoomController {
  constructor(private readonly meetingRoomService: MeetingRoomService) {}

  @Get('list')
  list(
    @Query('pageNum', new DefaultValuePipe(1), ParseIntPipe) pageNum: number,
    @Query('pageSize', new DefaultValuePipe(2), ParseIntPipe) pageSize: number,
    @Query('name') name?: string,
    @Query('capacity') capacity?: string,
    @Query('equipment') equipment?: string,
  ) {
    return this.meetingRoomService.findMeetingRoomByPage(
      pageNum,
      pageSize,
      name,
      +capacity,
      equipment,
    );
  }

  @Get(':id')
  async info(@Param('id', ParseIntPipe) id: number) {
    return await this.meetingRoomService.findOneById(id);
  }

  @Post('create')
  async create(@Body() meetingRoomDto: CreateMeetingRoomDto) {
    return await this.meetingRoomService.create({
      ...meetingRoomDto,
      capacity: +meetingRoomDto.capacity,
    });
  }

  @Put('update')
  async update(@Body() meetingRoomDto: UpdateMeetingRoomDto) {
    return await this.meetingRoomService.update({
      ...meetingRoomDto,
      id: +meetingRoomDto.id,
      capacity: +meetingRoomDto.capacity,
    });
  }

  @Delete('delete/:id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.meetingRoomService.delete(id);
  }
}
