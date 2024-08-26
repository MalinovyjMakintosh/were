const mongoose = require('mongoose');

// Определение схемы пользователя
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    referralLink: { type: String, unique: true },
    referredCount: { type: Number, default: 0 } // Количество приглашенных пользователей
});

// Создание модели пользователя
const User = mongoose.model('User', userSchema);

module.exports = User;
