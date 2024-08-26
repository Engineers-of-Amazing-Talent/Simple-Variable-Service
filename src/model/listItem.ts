import { DataTypes, Model, Optional } from 'sequelize';
import { Schema } from './Repository';

export interface ListItemAttributes {
  listId: String,
  resourceId: String,
}

export interface ListItemCreationAttributes extends Optional<ListItemAttributes, 'listId' | 'resourceId'> { }
export interface ListItemInstance extends Model<ListItemAttributes, ListItemCreationAttributes>, ListItemAttributes {
  id: string;
}

export const listItemSchema: Schema = {
  name: 'ListItem',
  attributes: {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true
    },
    listId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    resourceId: {
      type: DataTypes.UUID,
      allowNull: false
    }
  }
}
