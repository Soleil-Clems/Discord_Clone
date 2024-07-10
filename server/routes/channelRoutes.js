const express = require('express');
const { createChannel, getAllChannels, getMessagesByChannel, getChannelById, joinRoom, updateChannel, deleteChannel, removeUserFromChannel, checkChannel, PrivateChannel } = require('../controllers/channelController');
const router = express.Router();

router.post('/', createChannel);
router.get('/', getAllChannels);
router.get('/messages', getMessagesByChannel);
router.patch('/join', joinRoom);
router.patch('/', updateChannel); // Use PATCH for partial updates
router.post('/delete', deleteChannel);
router.post('/private', PrivateChannel);
router.put('/removeUser', removeUserFromChannel);

module.exports = router;
