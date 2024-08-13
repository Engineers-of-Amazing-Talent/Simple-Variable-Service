import { Sequelize, ModelAttributes, Model, ModelStatic } from 'sequelize';
import { isVariableInstance, ModelInstance, VariableInstance } from '.';

export type Schema = {
  name: string,
  attributes: ModelAttributes
}

export interface OneWayParams {
  modelName: string,
  as: string;
  foreignKey: string;
}

export interface AssociationParams {
  through: Schema;
  as: string;
  foreignKey: string,
  otherKey: string,
}

export interface Association extends AssociationParams {
  to: Schema,
  from: Schema,
}

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
  public associations: Association[];

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
        this.createManyToMany(association);
      });
    } catch(e) {
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
    this.db?.define(modelSchema.name, modelSchema.attributes);
  }

  createOneToMany(to: OneWayParams, from: OneWayParams) {
    const To = this.getModel(to.modelName);
    const From = this.getModel(from.modelName);

    To.hasMany(From, { as : to.as, foreignKey: to.foreignKey });
    From.belongsTo(To, { as: from.as, foreignKey: from.foreignKey });
  }

  createManyToMany(association: Association) {
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

  addJoinAssociation(schemaFrom: Schema, schemaTo: Schema, associationParams: AssociationParams): void {
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
    // Recursive case: Fetch linked variables of the linked variables
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
