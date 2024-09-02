const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    telegramId: { type: String, required: true, unique: true },
    referralLink: { type: String, unique: true },
    referredCount: { type: Number, default: 0 }, // Количество приглашенных пользователей
    apples: { type: Number, default: 0 } // Количество яблок
});

const User = mongoose.model('User', userSchema);

module.exports = User;
