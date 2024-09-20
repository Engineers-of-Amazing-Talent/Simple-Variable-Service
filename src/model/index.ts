// export * from './accessKey';
import { Repository } from './Repository';
import { permissionSchema } from './permissions';
import { userProfileSchema } from './userProfile';
import { variableSchema, VariableInstance, VariableCreationAttributes } from './variable';
import { listItemSchema, ListItemInstance, ListItemCreationAttributes } from './listItem';
// authentication model;
import { userSchema } from '../auth';

export type ModelInstance = VariableInstance | ListItemInstance;
export type ModelAttributes = VariableCreationAttributes | ListItemCreationAttributes;
export * from './Repository';
export * from './variable';
export * from './listItem';
export * from './permissions';
export * from './userProfile';

export function isVariableInstance(instance: ModelInstance): instance is VariableInstance {
  return (instance as VariableInstance).type !== undefined && (instance as VariableInstance).key !== undefined;
}

export function isListItemInstance(instance: ModelInstance): instance is ListItemInstance {
  return (instance as ListItemInstance).listId !== undefined && (instance as ListItemInstance).resourceId !== undefined;
}

const repository = new Repository();
repository.addSchema(variableSchema);
repository.addSchema(listItemSchema);
repository.addSchema(permissionSchema);
repository.addSchema(userProfileSchema);
repository.addSchema(userSchema);

repository.addAssociation(userProfileSchema, permissionSchema, {
  type: 'one-to-many',
  as: 'permissions',
  foreignKey: 'userProfileId'
});
repository.addAssociation(variableSchema, variableSchema, {
  type: 'many-to-many',
  through: listItemSchema,
  as: 'ListVariable',
  foreignKey: 'listId',
  otherKey: 'resourceId'
});

export default repository;
