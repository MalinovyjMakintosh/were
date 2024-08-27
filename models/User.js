const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    referralLink: { type: String },
    referredCount: { type: Number, default: 0 },
    appleCount: { type: Number, default: 0 } // Поле для хранения количества яблок
});

module.exports = mongoose.model('User', userSchema);
