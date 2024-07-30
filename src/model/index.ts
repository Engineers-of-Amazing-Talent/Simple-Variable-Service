// export * from './accessKey';
// export * from './permissions';
import { Repository } from './Repository';
import { variableSchema } from './variable';
import { listItemSchema } from './listItem';

const repository = new Repository();
repository.addModel(variableSchema);
repository.addModel(listItemSchema);

export * from './Repository';
export default repository;
