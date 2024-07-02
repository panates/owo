import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '@opra/nestjs';

@Injectable()
export class TestGlobalGuard implements CanActivate {
  static counter = 0;
  static publicCounter = 0;

  constructor(private readonly _reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this._reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) TestGlobalGuard.publicCounter++;
    else TestGlobalGuard.counter++;
    return true;
  }
}
