/**
 * Interface for performing CRUD for resources
 */
import { Repository, ModelInstance, VariableAttributes, ListItemAttributes } from '../model/';
import { IncludeOptions } from 'sequelize';

export interface readOptions {
  resourceId: string
  include?: string
  includeAs?: string
}
 
export class Collection {
  repository: Repository;

  constructor(repository: Repository) {
    this.repository = repository;
  }

  async read(modelName: string, options: readOptions): Promise<ModelInstance | null> {
    const queryModel = this.repository.getModel<ModelInstance>(modelName);
    const queryOptions: IncludeOptions = {};
    
    if (options.include && options.includeAs) {
      const associationModel = this.repository.getModel(options.include);
      queryOptions.include = [{ model: associationModel, as: options.includeAs}]
    }

    const instance = await queryModel.findByPk(options.resourceId, queryOptions);
    return instance;
  }

  async write(modelName: string, values: VariableAttributes | ListItemAttributes): Promise<ModelInstance> {
    const queryModel = this.repository.getModel<ModelInstance>(modelName);
    const instance = await queryModel.create(values);

    return instance;
  }

  update() {}

  delete() {}
}