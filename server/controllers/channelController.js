const Channel = require('../models/channelModel');
const User = require('../models/userModel');
const Message = require('../models/messageModel');
const mongoose = require("mongoose")
const socketIo = require('socket.io');

exports.createChannel = async (req, res) => {
    try {
        console.log(req.body)
        const { name, creator, users, messages } = req.body;
        const isChannel = true;
        const newChannel = new Channel({ name, creator, isChannel, users, messages });
        await newChannel.save();
        console.log("step passed")
        res.status(201).json(newChannel);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

exports.PrivateChannel = async (req, res) => {
    try {
        const { users, sender, content } = req.body;

        if (users.length !== 2) {
            return res.status(400).json({ message: 'Deux utilisateurs sont requis.' });
        }

        // Fetch users to get their ObjectIds
        const userRecords = await User.find({ username: { $in: users } });
        if (userRecords.length !== 2) {
            return res.status(404).json({ message: 'Un ou plusieurs utilisateurs n\'existent pas.' });
        }

        const userIds = userRecords.map(user => user._id);

        // Check if a private channel already exists between these two users
        let existingChannel = await Channel.findOne({
            isChannel: false,
            users: { $all: userIds, $size: 2 }
        });

        if (!existingChannel) {
            // If no existing channel, create a new one
            const newChannel = new Channel({
                senderOne: users[0],
                senderTwo: users[1],
                isChannel: false,
                users: userIds,
                messages: []
            });

            await newChannel.save();

            if (!newChannel) {
                return res.status(400).json({ message: "Échec de la création du canal privé." });
            }

            existingChannel = newChannel; // Set existingChannel to the newly created channel
        }

        // Create and save the new message
        const newMessage = new Message({
            channel: existingChannel._id,
            sender: sender,
            content: content
        });

        await newMessage.save();

        if (!newMessage) {
            return res.status(400).json({ message: "Échec de l'envoi du message." });
        }

        // Push the new message id into the existing channel's messages array
        existingChannel.messages.push(newMessage._id.toString());
        await existingChannel.save();

        res.status(201).json({ message: 'Message envoyé avec succès.', channel: existingChannel });
    } catch (err) {
        res.status(500).json({ message: 'Erreur serveur', error: err.message });
    }
};


exports.joinRoom = async (req, res) => {
    try {
        const { userId, channelId } = req.body
        const channel = await Channel.findById(channelId)

        if (!channel) {
            return res.status(404).json({ message: 'Channel not found' });
        }

        if (!channel.users.includes(userId)) {
            channel.users.push(userId)
            channel.save()

        }
        res.status(200).json({ message: 'User joined from channel successfully' });

    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message })
    }
}

exports.removeUserFromChannel = async (req, res) => {
    try {
        const { userId, room } = req.body;
        const channel = await Channel.findOne({ name: room });

        if (!channel) {
            return res.status(404).json({ message: 'Channel not found' });
        }

        if (!channel.users.includes(userId)) {
            return res.status(404).json({ message: 'User not found in this channel' });
        }

        channel.users = channel.users.filter(id => id.toString() !== userId);
        await channel.save();

        res.status(200).json({ message: 'User removed from channel successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};


exports.getAllChannels = async (req, res) => {
    try {

        const channels = await Channel.find()
            .populate('creator')
            .populate('users')
            .populate({
                path: 'messages',
                populate: {
                    path: 'sender',
                    model: 'Users',
                    select: 'username nickname' // You can specify which fields to include
                }
            });

        res.status(200).json(channels);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};


exports.getChannelById = async (req, res) => {
    try {
        const channel = await Channel.findById(req.params.id).populate('creator').populate('users').populate('messages');
        if (!channel) {
            return res.status(404).json({ message: 'Channel not found' });
        }
        res.status(200).json(channel);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

exports.updateChannel = async (req, res) => {
    try {
        const { creator, newName, channelId } = req.body;



        const channel = await Channel.findById(channelId);
        if (!channel) {
            return res.status(404).json({ message: 'Channel not found' });
        }


        if (channel.creator.toString() !== creator) {
            return res.status(403).json({ message: 'Not authorized' });
        }


        channel.name = newName;
        channel.updatedAt = Date.now();

        const updatedChannel = await channel.save();

        res.status(200).json(updatedChannel);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

exports.deleteChannel = async (req, res) => {
    try {
        const { creator, room } = req.body;
        console.log(req.body)

        const channel = await Channel.findOne({ name: room });

        if (!channel) {
            return res.status(404).json({ message: 'Channel not found' });
        }
        console.log(channel);

        if (creator !== channel.creator.toString()) {
            return res.status(403).json({ message: 'You are not authorized' });
        }

        // res.send("")
        await Channel.findByIdAndDelete(channel._id);
        // console.log(result)
        res.status(200).json({ message: 'Channel deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

exports.getMessagesByChannel = async (req, res) => {
    try {
        const { channelId } = req.body;

        const messages = await Message.find({ channel: channelId })
            .populate('sender', 'username')
            .populate('channel', 'name');

        if (!messages) {
            return res.status(404).json({ message: 'Messages not found for this channel' });
        }

        res.status(200).json(messages);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};


async function checkAndDeleteInactiveChannels() {
    try {
        const thirtySecondsAgo = new Date(Date.now() - 120 * 1000);

        const channels = await Channel.find();

        for (let i = 0; i < channels.length; i++) {
            const channel = channels[i];


            const recentMessage = await Message.findOne({
                channel: channel._id,
                createdAt: { $gte: thirtySecondsAgo }
            });

            


            if (!recentMessage) {
                await Channel.findByIdAndDelete(channel._id);
                await Message.deleteMany({ channel: channel._id });
              
                console.log(`Canal ${channel.name} supprimé car inactif.`);
            }
        }
    } catch (error) {
        console.error('Erreur lors de la vérification et de la suppression des canaux inactifs :', error);
    }
}


setInterval(checkAndDeleteInactiveChannels, 120 * 1000); 

