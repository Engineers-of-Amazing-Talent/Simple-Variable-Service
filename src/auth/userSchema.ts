import { DataTypes, Optional, Model } from 'sequelize';
import { Schema } from '../model';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const SECRET = process.env.AUTH_SECRET || 'svsdeveloper';

export interface UserAttributes {
  id?: string;
  password: string;
  email: string;
  username?: string;
  token?: string;
}

export interface UserCreationAttributes extends Optional<UserAttributes, 'email' | 'password' | 'username'> { }
export interface UserInstance extends Model<UserAttributes, UserCreationAttributes>, UserAttributes {
  id: string;
  token: string;
}

const userSchema: Schema = {
  name: 'User',
  attributes: {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    username: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    token: {
      type: DataTypes.VIRTUAL,
      get(this: UserInstance): string {
        return jwt.sign({ sub: this.id }, SECRET);
      }
    }
  },
  options: {
    hooks: {
      beforeCreate: async (user: UserInstance) => {
        if (user.password) {
          const saltRounds = 10;
          const hashedPassword = await bcrypt.hash(user.password, saltRounds);
          user.password = hashedPassword;
        }
      },
      beforeUpdate: async (user: UserInstance) => {
        if (user.changed('password')) {
          const saltRounds = 10;
          const hashedPassword = await bcrypt.hash(user.password, saltRounds);
          user.password = hashedPassword;
        }
      },
    }
  }
}

export default userSchema;
