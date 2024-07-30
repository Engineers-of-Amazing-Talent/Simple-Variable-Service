// export * from './accessKey';
// export * from './permissions';
import { listItemSchema } from './listItem';
import { Repository } from './Repository';
import { variableSchema } from './variable';
export { listItemSchema } from './listItem';

const repository = new Repository();
repository.addModel(variableSchema);
repository.addModel(listItemSchema);

export default repository;
