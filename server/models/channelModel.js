const mongoose = require('mongoose');

const ChannelSchema = new mongoose.Schema({
    name: { type: String, required: false, unique: false },
    senderOne: { type: String, required: false, unique: false },
    senderTwo: { type: String, required: false, unique: false },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required:false },
    isChannel:{type:Boolean, required:true},
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Users' }],
    messages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Messages' }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Channels', ChannelSchema);
