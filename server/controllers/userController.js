const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const secretKey = 'yourSecretKey';


exports.register = async (req, res) => {

    try {
        const { username, password } = req.body;
        const nickname = username
        console.log(req.body)

        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            username,
            nickname,
            password: hashedPassword
        });

        await newUser.save();

        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};


exports.login = async (req, res) => {
    const { username, password } = req.body;

    try {

        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: 'Invalid username or password' });
        }

        // const isMatch = await bcrypt.compare(password, user.password);
        // if (!isMatch) {
        //     return res.status(400).json({ message: 'Invalid username or password' });
        // }

        const token = jwt.sign({ id: user._id }, secretKey, { expiresIn: '1h' });

        res.status(200).json({
            message: 'Login successful',
            user: {
                id: user._id,
                username: user.username,
                nickname: user.nickname,
                token: token
            }
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};


exports.updateUser = async (req, res) => {
    const userId = req.params.id;
    const { nickname } = req.body;

    try {

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        
        user.username = nickname || user.username;
     
        user.updatedAt = Date.now();

        await user.save();

        res.status(200).json({
            message: 'User updated successfully',
            user: {
                id: user._id,
                username: user.username,
                nickname: user.nickname
            }
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};
