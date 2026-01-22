const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    full_name: {
      type: DataTypes.STRING,
      allowNull: true,   // 🔥 CHANGED
    },

    email: {
      type: DataTypes.STRING,
      allowNull: true,   // 🔥 CHANGED
    },

    organization: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    password: {
      type: DataTypes.STRING,
      allowNull: true,   // 🔥 CHANGED
    },

    role: {
      type: DataTypes.STRING,
      allowNull: true,   // 🔥 CHANGED
      defaultValue: "user",
    },

    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "users",
    timestamps: true,
  }
);

module.exports = User;
