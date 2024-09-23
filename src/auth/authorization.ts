import { Request, Response, NextFunction } from 'express';
import repository, { UserProfileInstance, PermissionInstance } from '../model';

const capabilityMap = {
  WRITE: ['READ', 'WRITE', 'UPDATE'],
  OWNER: ['READ', 'WRITE', 'UPDATE', 'DELETE'],
  READ: ['READ'],
}
export type CapabilityParam = 'READ' | 'WRITE' | 'UPDATE' | 'DELETE';

export async function authorizeUser(user: UserProfileInstance, resourceId: string, capability: CapabilityParam): Promise<boolean> {
  try {
    const Permissions = repository.getModel<PermissionInstance>('Permission');
    const permission = await Permissions.findOne({ where: { resourceId, userId: user.id }});
    if (permission) {
      const capabilities = capabilityMap[permission.capability];
      return capabilities.includes(capability);
    } else {
      return false;
    }
  } catch (e) {
    throw new Error('Unable to authorize UserProfile with capability');
  }
}

export function handleCapability(request: Request, response: Response, next: NextFunction) {
  const getMethod = (method: string): CapabilityParam => {
    switch (method) {
      case 'GET':
        return "READ";
      case 'POST':
        return "WRITE";
      case 'PATCH':
      case 'PUT':
        return "UPDATE";
      case 'DELETE':
        return "DELETE";
      default:
        return "READ";
    } 
  }
  request.capability = getMethod(request.method);
  next();
}

export async function handleAuthorization(request: Request, response: Response, next: NextFunction) {
  const { profile, capability } = request;
  const { resourceId } = request.params;
  if (resourceId && profile && capability) {
    try {
      let isAuthorized: boolean = await authorizeUser(profile, resourceId, capability);
      isAuthorized === true ? next() : next({ message: `Missing Authorization for ${capability}`, status: 403 });
    } catch (e) {
      next({ message: `Missing Authorization for ${capability}`, status: 403 });
    }
  } else {
    next({ message: `Missing Authorization for ${capability}`, status: 403 });
  }
}
