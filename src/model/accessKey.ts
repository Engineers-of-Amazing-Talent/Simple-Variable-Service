import { DataTypes, Model, Optional } from 'sequelize';
import crypto from 'node:crypto';
import { Schema } from './Repository';

export interface AccessKeyAttributes {
  hash: string;
  key: string;
  resourceId: string;
}

export interface AccesskeyCreationAttributes extends Optional<AccessKeyAttributes, 'hash'> { }

export interface AccessKeyInstance extends Model<AccessKeyAttributes, AccessKeyAttributes>, AccessKeyAttributes { }

export const generateHash = async (instance: AccessKeyInstance) => {
    const hash = await crypto.createHash('sha256')
      .update(instance.hash, 'utf8')
      .digest('hex');
    instance.hash = hash;
}

export const accessKeySchema: Schema = {
  name: 'AccessKey',
  attributes: {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true
    },
    hash: {
      type: DataTypes.STRING,
      allowNull: false
    },
    resourceId: {
      type: DataTypes.UUIDV4,
      allowNull: false
    }
  }
}