import { DataTypes, Model, Optional } from 'sequelize';
import { Schema } from './Repository';

export interface VariableAttributes {
  type: string;
  key: string;
  value?: string;
}

export interface VariableCreationAttributes extends Optional<VariableAttributes, 'value'> { }

export interface VariableInstance extends Model<VariableAttributes, VariableCreationAttributes>, VariableAttributes {
  id: string;
}

const allowedTypes = ['STRING', 'BOOLEAN', 'INTEGER', 'FLOAT', 'LIST'];

export const variableSchema: Schema = {
  name: 'Variable',
  attributes: {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: {
          args: [allowedTypes],
          msg: `Type must be one of: ${allowedTypes.join(', ')}`
        }
      }
    },
    key: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    value: {
      type: DataTypes.TEXT('long'),
      allowNull: true,
      validate: {
        isNullable(value: unknown) {
          if (this.type !== 'LIST' && value === null) {
            throw new Error('Value can only be null if Type is set to List');
          }
        }
      }
    },
  }
}
