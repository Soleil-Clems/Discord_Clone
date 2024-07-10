const Message = require('../models/messageModel');
const Channel = require('../models/channelModel');

exports.sendMessage = async (req, res) => {
    try {
        const { channelId, senderId, content } = req.body;

       
        const channel = await Channel.findById(channelId);
        if (!channel) {
            return res.status(404).json({ message: 'Channel not found' });
        }

        
        const newMessage = new Message({
            channel: channelId,
            sender: senderId,
            content: content
        });

        
        await newMessage.save();

        
        channel.messages.push(newMessage._id);
        await channel.save();

        res.status(201).json({ message: 'Message sent successfully', messageData: newMessage });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};
