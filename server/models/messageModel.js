const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    channel: { type: mongoose.Schema.Types.ObjectId, ref: 'Channels' },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Messages', MessageSchema);
