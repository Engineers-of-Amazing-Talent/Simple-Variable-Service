import { Sequelize, ModelAttributes, Model, ModelStatic } from 'sequelize';

export type Schema = {
  name: string,
  attributes: ModelAttributes
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

export class Repository {
  private db: Sequelize | null;
  public schemas: Schema[];
  public associations: Association[];

  constructor() {
    this.db = null;
    this.schemas = [];
    this.associations = [];
  }

  connect(params: ConnectionParams) {
    this.db = new Sequelize(params.url, params.options);
    this.schemas.forEach(schema => {
      if (typeof schema !== 'string') {
        this.createModel(schema);
      }
    });
    this.associations.forEach(association => {
      this.createManyToMany(association);
    });
  }

  async initialize() {
    if (this.db) {
      await this.db.sync();
    } else {
      throw new Error('DB initialization error: no database instance');
    }
  }

  async terminate() {
    if (this.db) {
      await this.db.drop();
    } else {
      throw new Error('DB initialization error: no database instance');
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
    this.db?.define(modelSchema.name, modelSchema.attributes);
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
}