import { DataTypes, Model, Optional } from 'sequelize';
import { Schema } from './Repository';

export interface VariableAttributes {
  id?: string,
  type: string;
  key: string;
  value?: string;
}

export interface VariableCreationAttributes extends Optional<VariableAttributes, 'value'> { }
export interface VariableInstance extends Model<VariableAttributes, VariableCreationAttributes>, VariableAttributes {
  id: string;
  ListVariable?: VariableInstance[],
}

const allowedTypes = ['STRING', 'BOOLEAN', 'INTEGER', 'FLOAT', 'LIST'];

function validateFloatValue(value: string) {
  if (!/^\d+\.\d+$/.test(value)) {
    throw new Error('Variable of type FLOAT must contain a value in decimal point format.');
  }
}

function validateIntegerValue(value: string) {
  if (!/^\d+$/.test(value)) {
    throw new Error('Variable of type INTEGER must contain an integer value.');
  }
}

function validateBooleanValue(value:string) {
  if (!/^(true|false)$/i.test(value)) {
    throw new Error('Value must be either "True" or "False" (case insensitive).');
  }
}

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
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        isNullable(value: string) {
          if (this.type !== 'LIST' && !value) {
            throw new Error('Value can only be null if Type is set to List');
          }
        },
        validateFloat (value: string) {
          if (this.type === 'FLOAT') {
            validateFloatValue(value);
          }
        },
        validateInteger(value: string) {
          if (this.type === 'INTEGER') {
            validateIntegerValue(value);
          }
        },
        validateBoolean(value: string) {
          if (this.type === 'BOOLEAN') {
            validateBooleanValue(value);
          }
        }
      }
    },
  }
}
