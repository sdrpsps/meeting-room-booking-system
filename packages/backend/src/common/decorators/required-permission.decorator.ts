import { SetMetadata } from '@nestjs/common';

export function RequirePermission(...permissions: string[]) {
  return SetMetadata('required-permission', permissions);
}
