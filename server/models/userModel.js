const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    nickname: { type: String, required: true },
    password: { type: String },
    channels: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Channel' }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Users', UserSchema);
