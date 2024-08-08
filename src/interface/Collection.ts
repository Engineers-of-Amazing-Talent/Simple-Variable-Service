/**
 * Interface for performing CRUD for resources
 */
import {
  Repository,
  ModelInstance,
  isVariableInstance,
  VariableAttributes,
  ListItemAttributes,
  VariableInstance
} from '../model/';
import { IncludeOptions } from 'sequelize';

export interface readOptions {
  resourceId: string
  include?: string
  includeAs?: string
}

export type QueryResponse = {
  data?: JSONValue | null;
  record: ModelInstance;
}
export type QueryError = {
  message: string,
}

type JSONValue = | string | number | boolean | JSONObject | JSONArray;
interface JSONObject {
  [x: string]: JSONValue;
}
interface JSONArray extends Array<JSONValue> { }
 
export class Collection {
  repository: Repository;

  constructor(repository: Repository) {
    this.repository = repository;
  }

  static parseValue(type: string, value: string): string | number | boolean {
    switch(type) {
      case ('FLOAT'):
        return parseFloat(value);
      case ('INTEGER'):
        return parseInt(value);
      case ('BOOLEAN'):
        return Boolean(value);
      case ('STRING'):
      default:
        return value;
    }
  }

  static parseList(list: VariableInstance, json: JSONObject): JSONObject {
    const walk = (variable: VariableInstance, next: JSONObject): void => {
      if (variable.ListVariable) {
        for (let child of variable.ListVariable) {
          if (child.value) {
            json[child.key] = Collection.parseValue(child.type, child.value);
          }
          if (child.type === 'LIST') {
            let newChild = {}
            next[child.key] = newChild;
            Collection.parseList(child, newChild);
          }
        }
      }
    }
    walk(list, json);
    return json;
  }

  // traverse a list record and continue to query any nested list records found.
  static async traverseList(record: VariableInstance) {}

  async read(modelName: string, options: readOptions): Promise<QueryResponse | null> {
    try {
      const queryModel = this.repository.getModel<ModelInstance>(modelName);
      const queryOptions: IncludeOptions = {};
      
      if (options.include && options.includeAs) {
        const associationModel = this.repository.getModel(options.include);
        queryOptions.include = [{ model: associationModel, as: options.includeAs }];
      }
  
      const record = await queryModel.findByPk(options.resourceId, queryOptions);
      let data = null;
      if (record) {
        if (isVariableInstance(record)) {
          if (record.type === 'LIST') {
            data = Collection.parseList(record, {});
          } else {
            data = record.value;
          }
        }
        return {
          record,
          data
        }
      }
      return data;
    } catch (e) {
      console.error(e);
      throw new Error('Collection Interface: READ ERROR');
    }
  }

  async write(modelName: string, values: VariableAttributes | ListItemAttributes): Promise<QueryResponse> {
    try {
      const queryModel = this.repository.getModel<ModelInstance>(modelName);
      const record = await queryModel.create(values);
  
      return {
        record,
        data: isVariableInstance(record) ? record.value : null
      };
    } catch(e) {
      console.error(e);
      throw new Error('Collection Interface: WRITE ERROR');
    }
  }

  update() {}

  delete() {}
}