import { DataTypes, Optional, Model } from "sequelize";
import { Schema } from './Repository';

export interface UserProfileAttributes {
  externalId: string;
}
export interface UserProfileCreationAttributes extends Optional<UserProfileAttributes, 'externalId'>{}
export interface UserProfileInstance extends Model<UserProfileAttributes, UserProfileCreationAttributes>, UserProfileAttributes{
  id: string
}

export const userProfileSchema: Schema = {
  name: 'UserProfile',
  attributes: {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true
    },
    externalId: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }
}
