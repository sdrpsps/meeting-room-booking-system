import { SetMetadata } from '@nestjs/common';

export function RequireLogin() {
  return SetMetadata('required-login', true);
}
