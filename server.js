const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // Импортируйте cors
const User = require('./models/User');

const app = express();
app.use(express.json());
app.use(cors()); // Включите cors

// Подключение к базе данных MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Could not connect to MongoDB...', err));


// Маршрут для генерации реферальной ссылки
app.post('/generate-referral', async (req, res) => {
    const { username } = req.body;

    try {
        // Найти пользователя по имени
        let user = await User.findOne({ username });

        // Если пользователь существует, вернуть его реферальную ссылку
        if (user) {
            return res.json({ referralLink: `https://t.me/your_bot_username?startapp=${user.referralLink}` });
        }

        // Если пользователь не существует, создать нового с реферальной ссылкой
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
            referrer.referredCount += 1;
            await referrer.save();
        }

        const newUser = new User({ username });
        await newUser.save();

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
