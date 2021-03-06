const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const User = require("./users.model");

const VolunteerSchema = {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: false,
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
};

const Volunteer = sequelize.define("Volunteer", VolunteerSchema, {
  timestamps: true,
});

User.hasMany(Volunteer, {
  onDelete: "CASCADE",
});
Volunteer.belongsTo(User);

module.exports = Volunteer;
