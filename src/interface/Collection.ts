/**
 * Interface for performing CRUD for resources
 */
import {
  Repository,
  ModelInstance,
  isVariableInstance,
  VariableInstance,
  LinkedQueryParams,
  ModelAttributes
} from '../model';

export interface readOptions {
  resourceId: string
  include?: string
  as?: string
}

export type QueryResponse = {
  data?: JSONValue | null;
  record: ModelInstance;
}
export type QueryError = {
  message: string,
}

type JSONValue = | string | number | Boolean | JSONObject | JSONArray;
interface JSONObject {
  [x: string]: JSONValue;
}
interface JSONArray extends Array<JSONValue> { }
 
function parseBoolean(value: string): Boolean {
  const lowercase = value.toLowerCase();
  if (lowercase === 'true') {
    return true;
  } else if (lowercase === 'false') {
    return false;
  } else {
    throw new Error('Collection Interface:Invalid boolean value');
  }
}

export class Collection {
  repository: Repository;

  constructor(repository: Repository) {
    this.repository = repository;
  }

  static parseValue(type: string, value: string): string | number | Boolean {
    switch(type) {
      case ('FLOAT'):
        return parseFloat(value);
      case ('INTEGER'):
        return parseInt(value);
      case ('BOOLEAN'):
        return parseBoolean(value);
      case ('STRING'):
      default:
        return value;
    }
  }

  static async parseList(list: VariableInstance, json: JSONObject): Promise<JSONObject> {
    const walk = async (variable: VariableInstance, next: JSONObject): Promise<void> => {
      if (variable.ListVariable) {
        for (let child of variable.ListVariable) {
          if (child.value && child.type !== 'LIST') {
            next[child.key] = Collection.parseValue(child.type, child.value);
          }
          if (child.type === 'LIST') {
            let newChild: JSONObject = {};
            // TODO: How do we handle list metadata? 
            // if (child.value) newChild.meta = child.value;
            next[child.key] = newChild;
            Collection.parseList(child, newChild);
          }
        }
      }
    }
    await walk(list, json);
    return json;
  }

  async read(modelName: string, options: readOptions): Promise<QueryResponse | null> {
    try {
      let queryOptions: LinkedQueryParams | undefined;
      let { as, include } = options;
      if (as &&  include) {
        queryOptions = { as, include };
      }
  
      const record = await this.repository.getLinkedInstances(modelName, options.resourceId, queryOptions);
      let data = null;
      if (record) {
        if (isVariableInstance(record)) {
          if (record.type === 'LIST') {
            data = await Collection.parseList(record, {});
          } else {
            data = Collection.parseValue(record.type, record.value as string);
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
      throw new Error('Collection Interface:READ ERROR');
    }
  }

  async write(modelName: string, values: ModelAttributes): Promise<QueryResponse> {
    try {
      const queryModel = this.repository.getModel<ModelInstance>(modelName);
      const record = await queryModel.create(values);

      return {
        record,
        data: isVariableInstance(record) ? Collection.parseValue(record.type, record.value as string) : null
      };
    } catch(e) {
      console.error(e);
      throw new Error('Collection Interface:WRITE ERROR');
    }
  }

  async update(modelName: string, id: string, values: ModelAttributes): Promise<{values: ModelAttributes, resourceId: string}> {
    try {
      const queryModel = this.repository.getModel<ModelInstance>(modelName);
      let query = await queryModel.update(values, { where: { id }});
      if (query[0]) {
        return {
          values,
          resourceId: id
        }
      } else {
        throw new Error('Collection Interface:UPDATE ERROR:not found')
      }
    } catch (e) {
      console.error(e);
      throw new Error('Collection Interface:UPDATE ERROR');
    }
  }

  async delete(modelName: string, id: string): Promise<number> {
    try {
      const queryModel = this.repository.getModel<ModelInstance>(modelName);
      let query = await queryModel.destroy({ where: { id }});
      if (query) {
        return 0;
      } else {
        throw new Error('Collection Interface:DELETE ERROR:not found');
      }
    } catch (e) {
      console.error(e);
      throw new Error('Collection Interface:DELETE ERROR');
    }
  }
}