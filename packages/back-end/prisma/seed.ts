import { PrismaClient } from '@prisma/client';
import { md5 } from 'src/common/utils/md5.util';

const prisma = new PrismaClient();

async function seed() {
  // 创建权限
  await prisma.permission.createMany({
    data: [
      { code: 'user:change_password', description: '用户--修改密码' },
      { code: 'user:view_meeting_rooms', description: '用户--会议室列表' },
      { code: 'user:book_meeting_room', description: '用户--预订会议室' },
      { code: 'user:view_booking_history', description: '用户--预订历史' },
      { code: 'user:edit_profile', description: '用户--个人信息修改' },
      { code: 'admin:manage_bookings', description: '管理员--预订管理' },
      { code: 'admin:manage_meeting_rooms', description: '管理员--会议室管理' },
      {
        code: 'admin:add_edit_meeting_rooms',
        description: '管理员--会议室添加/修改',
      },
      { code: 'admin:manage_users', description: '管理员--用户管理' },
      { code: 'admin:view_statistics', description: '管理员--统计' },
      { code: 'admin:edit_information', description: '管理员--信息修改' },
      { code: 'admin:change_password', description: '管理员--密码修改' },
    ],
  });

  // 创建角色
  await prisma.role.createMany({
    data: [
      { name: 'admin', description: '管理员' },
      { name: 'user', description: '普通用户' },
    ],
  });

  // 获取角色和权限的ID
  const adminRole = await prisma.role.findUnique({ where: { name: 'admin' } });
  const userRole = await prisma.role.findUnique({ where: { name: 'user' } });
  const allPermissions = await prisma.permission.findMany();

  // 分配权限给角色
  const adminPermissions = allPermissions.filter((p) =>
    p.code.startsWith('admin:'),
  );
  const userPermissions = allPermissions.filter((p) =>
    p.code.startsWith('user:'),
  );

  await prisma.rolePermission.createMany({
    data: [
      ...adminPermissions.map((p) => ({
        roleId: adminRole.id,
        permissionId: p.id,
      })),
      ...userPermissions.map((p) => ({
        roleId: userRole.id,
        permissionId: p.id,
      })),
    ],
  });

  // 创建用户
  await prisma.user.createMany({
    data: [
      {
        name: 'zhangsan',
        nickName: '张三',
        password: md5('123456'),
        email: 'zhangsan@example.com',
        isAdmin: true,
        roleId: adminRole.id,
      },
      {
        name: 'lisi',
        nickName: '李四',
        password: md5('123456'),
        email: 'lisi@example.com',
        isAdmin: false,
        roleId: userRole.id,
      },
    ],
  });
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
