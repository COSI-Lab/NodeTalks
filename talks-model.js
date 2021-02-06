var sequelize = require("sequelize");

module.exports = function(sequelize, DataTypes) {
  return sequelize.define(
    "talk",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: DataTypes.STRING },
      type: { type: DataTypes.STRING },
      desc: { type: DataTypes.STRING },
      link: { type: DataTypes.STRING },
      hidden: { type: DataTypes.BOOLEAN, defaultValue: false }
    },
    {
      timestamps: false,
      tableName: "talks"
    }
  );
};
