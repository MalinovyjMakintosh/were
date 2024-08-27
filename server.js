const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const User = require('./models/User');
require('dotenv').config(); // Для использования переменных окружения

const app = express();
app.use(express.json());
app.use(cors());

// Подключение к базе данных MongoDB
const mongoURI = process.env.MONGO_URI; // Убедитесь, что MONGO_URI установлен в переменных окружения
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Could not connect to MongoDB...', err));

// Маршрут для генерации реферальной ссылки
app.post('/generate-referral', async (req, res) => {
    const { username } = req.body;

    try {
        let user = await User.findOne({ username });

        if (user) {
            return res.json({ referralLink: `https://t.me/your_bot_username?startapp=${user.referralLink}` });
        }

        const referralLink = `ref_${new mongoose.Types.ObjectId()}`;
        user = new User({ username, referralLink });
        await user.save();

        res.json({ referralLink: `https://t.me/your_bot_username?startapp=${user.referralLink}` });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Маршрут для регистрации по реферальной ссылке
app.post('/register', async (req, res) => {
    const { username, referralCode } = req.body;

    try {
        let user = await User.findOne({ username });
        if (user) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const referrer = await User.findOne({ referralLink: referralCode });
        if (referrer) {
            referrer.referredCount = (referrer.referredCount || 0) + 1;
            await referrer.save();
        }

        const newUser = new User({ username });
        await newUser.save();

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Новый маршрут для обновления количества яблок
app.post('/update-apples', async (req, res) => {
    const { userId, appleCount } = req.body;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        user.appleCount = appleCount;
        await user.save();

        res.status(200).json({ message: 'Apple count updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
