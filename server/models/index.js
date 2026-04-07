const sequelize = require('../config/database');
const User = require('./User');
const Booking = require('./Booking');

User.hasMany(Booking, { foreignKey: 'user_id', as: 'bookings' });
Booking.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

module.exports = { sequelize, User, Booking };
