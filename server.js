require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const User = require('./models/User'); // Обязательно убедитесь, что путь правильный

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Could not connect to MongoDB...', err));

// Маршрут для инициализации пользователя при первом заходе в приложение
app.post('/init-user', async (req, res) => {
    const { telegramId } = req.body;

    try {
        // Проверить, существует ли пользователь
        let user = await User.findOne({ telegramId });

        if (user) {
            // Если пользователь уже существует, вернуть его данные
            return res.json({
                message: 'User already exists',
                referralLink: `https://t.me/your_bot_username?startapp=${user.referralLink}`,
                apples: user.apples,
            });
        }

        // Если пользователь не существует, создать нового
        const referralLink = `ref_${new mongoose.Types.ObjectId()}`;
        user = new User({ telegramId, referralLink });
        await user.save();

        res.status(201).json({
            message: 'User created successfully',
            referralLink: `https://t.me/your_bot_username?startapp=${user.referralLink}`,
            apples: user.apples,
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Маршрут для регистрации по реферальной ссылке
app.post('/register', async (req, res) => {
    const { telegramId, referralCode } = req.body;

    try {
        let user = await User.findOne({ telegramId });
        if (user) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const referrer = await User.findOne({ referralLink: referralCode });
        if (referrer) {
            referrer.referredCount += 1;
            await referrer.save();
        }

        const newUser = new User({ telegramId });
        await newUser.save();

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Маршрут для обновления количества яблок
app.post('/update-apples', async (req, res) => {
    const { telegramId, apples } = req.body;

    try {
        let user = await User.findOne({ telegramId });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        user.apples = apples;
        await user.save();

        res.status(200).json({ message: 'Apples count updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
