// export * from './accessKey';
// export * from './permissions';
import { Repository } from './Repository';
import { variableSchema } from './variable';
import { listItemSchema } from './listItem';

const repository = new Repository();
repository.addModel(variableSchema);
repository.addModel(listItemSchema);

// inputs -> list of Schema to be joined via join, join. JoinOptions
// repository.createJoinAssociation(variableSchema, variableSchema, {through, as, })

export * from './Repository';
export default repository;
