const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Booking = sequelize.define(
  'Booking',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    from_city: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    to_city: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    transport: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [['train', 'flight', 'bus', 'taxi']],
      },
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    company: {
      type: DataTypes.STRING,
    },
    duration: {
      type: DataTypes.STRING,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: 'bookings',
    timestamps: false,
  }
);

module.exports = Booking;
