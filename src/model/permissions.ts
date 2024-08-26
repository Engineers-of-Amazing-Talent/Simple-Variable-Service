import { DataTypes, Model, Optional } from "sequelize";
import { Schema } from './Repository';

export interface PermissionAttributes {
  capability: 'READ' | 'WRITE' | 'OWNER',
  userId: string,
  resourceId: string,
}

export interface PermissionCreationAttributes extends Optional<PermissionAttributes, 'capability'>{}
export interface PermissionInstance extends Model<PermissionAttributes, PermissionCreationAttributes>, PermissionAttributes {
  id: string
}

const allowedCapabilities = ['READ', 'WRITE', 'OWNER'];

export const permissionSchema: Schema = {
  name: 'Permission',
  attributes: {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true
    },
    capability: {
      type: DataTypes.STRING,
      defaultValue: 'READ',
      allowNull: false,
      validate: {
        isIn: {
          args: [allowedCapabilities],
          msg: `Type must be one of: ${allowedCapabilities.join(', ')}`
        }
      }
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    resourceId: {
      type: DataTypes.UUID,
      allowNull: false
    }
  }
}