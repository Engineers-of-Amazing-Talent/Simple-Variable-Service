import { Sequelize, ModelAttributes, Model, ModelStatic } from 'sequelize';

export type Schema = {
  name: string,
  attributes: ModelAttributes
}

export type Association = {}

export type ConnectionParams = {
  url: string;
  options?: object
}

export class Repository {
  db: Sequelize | null;
  schemas: Schema[];
  associations: Association[];

  constructor() {
    this.db = null;
    this.schemas = [];
    this.associations = [];
  }

  connect(params: ConnectionParams) {
    this.db = new Sequelize(params.url, params.options);
    this.schemas.forEach(model => {
      if (typeof model !== 'string') {
        this.addModel(model);
      }
    });
  }

  close() {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }

  addModel(schema: Schema): void {
    if (!this.db) {
      this.schemas.push(schema);
    } else {
      this.db.define(schema.name, schema.attributes);
    }
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

  createJoinAssociations() {}
}