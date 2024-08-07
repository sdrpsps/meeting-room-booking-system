import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import type { CreateMeetingRoomDto } from './dto/create-meeting-room.dto';
import { UpdateMeetingRoomDto } from './dto/update-meeting-room.dto';

@Injectable()
export class MeetingRoomService {
  @Inject(PrismaService)
  private readonly prismaService: PrismaService;

  async findMeetingRoomByPage(
    pageNum: number,
    pageSize: number,
    name?: string,
    capacity?: number,
    equipment?: string,
  ) {
    const where: Prisma.MeetingRoomWhereInput = {};
    if (name) {
      where.name = { contains: name };
    }
    if (capacity) {
      where.capacity = { equals: capacity };
    }
    if (equipment) {
      where.equipment = { contains: equipment };
    }

    const [total, data] = await this.prismaService.$transaction([
      this.prismaService.meetingRoom.count({
        where,
      }),
      this.prismaService.meetingRoom.findMany({
        where,
        take: pageSize,
        skip: (pageNum - 1) * pageSize,
      }),
    ]);

    return {
      total,
      list: data.map((item) => ({
        ...item,
        createdAt: item.createdAt.toLocaleString(),
        updatedAt: item.updatedAt.toLocaleString(),
      })),
    };
  }

  async findOneById(id: number) {
    const room = await this.prismaService.meetingRoom.findFirst({
      where: { id },
    });

    if (!room) {
      throw new BadRequestException('会议室不存在');
    }

    return room;
  }

  async create(meetingRoomDto: CreateMeetingRoomDto) {
    const room = await this.prismaService.meetingRoom.findFirst({
      where: {
        name: meetingRoomDto.name,
      },
    });

    if (room) {
      throw new BadRequestException('会议室已存在');
    }

    await this.prismaService.meetingRoom.create({
      data: { ...meetingRoomDto, isBooked: false },
    });

    return '创建成功';
  }

  async update(meetingRoomDto: UpdateMeetingRoomDto) {
    const room = await this.prismaService.meetingRoom.findFirst({
      where: { id: meetingRoomDto.id },
    });

    if (!room) {
      throw new BadRequestException('会议室不存在');
    }

    const { id, ...rest } = meetingRoomDto;
    await this.prismaService.meetingRoom.update({
      where: { id },
      data: rest,
    });

    return '修改成功';
  }

  async delete(id: number) {
    const room = await this.prismaService.meetingRoom.findFirst({
      where: { id },
    });

    if (!room) {
      throw new BadRequestException('会议室不存在');
    }

    await this.prismaService.meetingRoom.delete({
      where: { id },
    });

    return '删除成功';
  }
}
