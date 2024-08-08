// export * from './accessKey';
// export * from './permissions';
import { Repository } from './Repository';
import { variableSchema, VariableInstance, VariableCreationAttributes } from './variable';
import { listItemSchema, ListItemInstance, ListItemCreationAttributes } from './listItem';

export type ModelInstance = VariableInstance | ListItemInstance;
export type ModelAttributes = VariableCreationAttributes | ListItemCreationAttributes;
export * from './Repository';
export * from './variable';
export * from './listItem';

export function isVariableInstance(instance: ModelInstance): instance is VariableInstance {
  return (instance as VariableInstance).type !== undefined && (instance as VariableInstance).key !== undefined;
}

export function isListItemInstance(instance: ModelInstance): instance is ListItemInstance {
  return (instance as ListItemInstance).listId !== undefined && (instance as ListItemInstance).resourceId !== undefined;
}

const repository = new Repository();
repository.addSchema(variableSchema);
repository.addSchema(listItemSchema);
repository.addJoinAssociation(variableSchema, variableSchema, {
  through: listItemSchema,
  as: 'ListVariable',
  foreignKey: 'listId',
  otherKey: 'resourceId'
});

export default repository;
