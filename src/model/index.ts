// export * from './accessKey';
// export * from './permissions';
import { Repository } from './Repository';
import { variableSchema } from './variable';
import { listItemSchema } from './listItem';

const repository = new Repository();
repository.addSchema(variableSchema);
repository.addSchema(listItemSchema);
repository.addJoinAssociation(variableSchema, variableSchema, {
  through: listItemSchema,
  as: 'ListVariable',
  foreignKey: 'listId',
  otherKey: 'resourceId'
});

export * from './Repository';
export default repository;
