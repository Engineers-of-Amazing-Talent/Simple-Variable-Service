import { DataTypes, Model, Optional } from 'sequelize';
import { Schema } from './Repository';

export interface ListItemAttributes {
  listId: String,
  resourceId: String,
}

// Define the attributes for creating a new model instance, where id is optional
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
      type: DataTypes.UUIDV4,
      allowNull: false,
    },
    resourceId: {
      type: DataTypes.UUIDV4,
      allowNull: false
    }
  }
}
