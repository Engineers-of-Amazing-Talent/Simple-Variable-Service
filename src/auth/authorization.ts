import { Request, Response, NextFunction } from 'express';
import repository, { UserProfileInstance, PermissionInstance } from '../model';

const capabilityMap = {
  WRITE: ['READ', 'WRITE', 'UPDATE'],
  OWNER: ['READ', 'WRITE', 'UPDATE', 'DELETE'],
  READ: ['READ'],
}
type capabilityParam = 'READ' | 'WRITE' | 'UPDATE' | 'DELETE';

export async function authorizeUser(user: UserProfileInstance, resourceId: string, capability: capabilityParam): Promise<boolean> {
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

export async function handleAuthorization(request: Request, response: Response, next: NextFunction) {
  next();
}
