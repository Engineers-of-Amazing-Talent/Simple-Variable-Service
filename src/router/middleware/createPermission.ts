import repository, { PermissionInstance } from '../../model';

export async function createPermission(profileId: string, resourceId: string, capability: 'READ' | 'WRITE' | 'OWNER'
): Promise<PermissionInstance> {
  try {
    const Permissions = await repository.getModel<PermissionInstance>('Permission');
    const permission = await Permissions.create({
      resourceId,
      capability,
      userId: profileId
    });
    return permission;
  } catch (e) {
    throw new Error('Unable to create Permission');
  }
}
