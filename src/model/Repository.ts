import { Sequelize, ModelAttributes, Options, Model, ModelStatic } from 'sequelize';
import { isVariableInstance, ModelInstance, VariableInstance } from './';

export type Schema = {
  name: string,
  attributes: ModelAttributes,
  options?: Options
}

export interface BaseAssociationParams {
  type: 'one-to-many' | 'many-to-many';
  as: string;
  foreignKey: string;
}
export interface BaseAssociation extends BaseAssociationParams {
  to: Schema;
  from: Schema;
}

export interface createAssociationParams {
  modelName: string;
  as: string;
  foreignKey: string;
}
export interface JoinParams {
  otherKey: string;
  through: Schema;
}

export interface JoinAssociationParams extends BaseAssociationParams, JoinParams { }
export interface JoinAssociation extends BaseAssociation, JoinParams { }

export type ConnectionParams = {
  url: string;
  options?: object
}

export type LinkedQueryParams = {
  as: string;
  include: string;
}

export class Repository {
  private db: Sequelize | null;
  public schemas: Schema[];
  public associations: Array<BaseAssociation | JoinAssociation>;

  constructor() {
    this.db = null;
    this.schemas = [];
    this.associations = [];
  }

  async connect(params: ConnectionParams): Promise<void> {
    try {
      this.db = new Sequelize(params.url, params.options);
      this.schemas.forEach(schema => {
        if (typeof schema !== 'string') {
          this.createModel(schema);
        }
      });
      this.associations.forEach(association => {
        if (association.type === 'many-to-many') {
          this.createManyToMany(association as JoinAssociation);
        } else {
          this.createOneToMany(association as BaseAssociation);
        }
      });
    } catch (e) {
      console.error(e);
      throw new Error('Repository Connection Error');
    }
  }

  async initialize() {
    if (this.db) {
      await this.db.sync();
    } else {
      throw new Error('DB initialization error: no database instance');
    }
  }

  async clean() {
    if (this.db) {
      await this.db.truncate();
    } else {
      throw new Error('DB cleaning error: no database instance');
    }
  }

  async terminate() {
    if (this.db) {
      await this.db.drop();
    } else {
      throw new Error('DB termination error: no database instance');
    }
  }

  close() {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }

  addSchema(schema: Schema): void {
    this.schemas.push(schema);
  }

  createModel(modelSchema: Schema): void {
    if (!this.db) {
      throw new Error('Create Model Error: db is not initialized');
    }
    this.db?.define(modelSchema.name, modelSchema.attributes, modelSchema.options);
  }

  createOneToMany(association: BaseAssociation) {
    const To = this.getModel(association.to.name);
    const From = this.getModel(association.from.name);
    
    To.hasMany(From, { as: association.as, foreignKey: association.foreignKey });
    From.belongsTo(To, { as: association.as, foreignKey: association.foreignKey });
  }

  createManyToMany(association: JoinAssociation) {
    const modelTo = this.getModel(association.to.name);
    const modelFrom = this.getModel(association.from.name);
    const modelThrough = this.getModel(association.through.name);

    modelTo.belongsToMany(modelFrom, {
      through: modelThrough,
      as: association.as,
      foreignKey: association.foreignKey,
      otherKey: association.otherKey
    });
  }

  getModel<T extends Model>(modelName: string): ModelStatic<T> {
    if (!this.db) {
      throw new Error('Repository not initialized');
    }

    const model = this.db.models[modelName] as ModelStatic<T>;
    if (!model) {
      throw new Error(`Model ${modelName} not found`);
    }

    return model;
  }

  addAssociation(schemaFrom: Schema, schemaTo: Schema, associationParams: BaseAssociationParams | JoinAssociationParams): void {
    this.associations.push({
      to: schemaTo,
      from: schemaFrom,
      ...associationParams
    });
  }

  async getLinkedInstances(modelName: string, id: string, params?: LinkedQueryParams): Promise<ModelInstance | null> {
    const Model = this.getModel<ModelInstance>(modelName);
    let includeOptions = {};
    if (params) {
      const IncludeModel = this.getModel<ModelInstance>(params.include);
      includeOptions = {
        include: [
          {
            model: IncludeModel,
            as: params.as,
          },
        ]
      }
    }
    const parent: ModelInstance | null = await Model.findByPk(id, includeOptions);
    if (!parent) {
      return null;
    }
    if (parent && isVariableInstance(parent)) {
      if (parent.ListVariable) {
        parent.ListVariable = (
          await Promise.all(
            parent.ListVariable.map(async (linkedInstance: any) => {
              const subLinkedInstances = await this.getLinkedInstances(modelName, linkedInstance.id, params);
              return subLinkedInstances;
            })
          )
        ).filter((instance): instance is VariableInstance => instance !== null);
      }
    }
    return parent;
  }
}