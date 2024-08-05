import { PickType } from '@nestjs/mapped-types';
import { IsNotEmpty, MaxLength } from 'class-validator';
import { CreateMeetingRoomDto } from './create-meeting-room.dto';

export class UpdateMeetingRoomDto extends PickType(CreateMeetingRoomDto, [
  'name',
  'location',
  'capacity',
]) {
  @IsNotEmpty({
    message: 'id 不能为空',
  })
  id: number;

  @MaxLength(50, {
    message: '设备最长为 50 字符',
  })
  equipment: string;

  @MaxLength(100, {
    message: '描述最长为 100 字符',
  })
  description: string;
}
