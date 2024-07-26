import { Sequelize, DataTypes } from 'sequelize';

export type ConnectionParams = {
  environment: string;
}

export class IRepository {
  db: Sequelize | null

  constructor() {
    this.db = null;
  }

  connect(params: ConnectionParams) {
    new Sequelize()
  }

  close() {}
}