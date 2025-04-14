const Exchange = require('../models/Exchange');
const User = require('../models/User');
const { sendNotification } = require('../services/notificationService');

exports.createExchange = async (req, res) => {
  try {
    const { recipientId, skillsOffered, skillsNeeded, duration, frequency, preferredTime, notes } = req.body;
    const initiatorId = req.user._id;

    // Check if recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: 'Recipient not found' });
    }

    // Check for existing exchange
    const existingExchange = await Exchange.findOne({
      $or: [
        { initiator: initiatorId, recipient: recipientId },
        { initiator: recipientId, recipient: initiatorId }
      ],
      status: { $in: ['pending', 'active'] }
    });

    if (existingExchange) {
      return res.status(400).json({ message: 'A pending or active exchange already exists with this user' });
    }

    // Create new exchange
    const exchange = new Exchange({
      initiator: initiatorId,
      recipient: recipientId,
      skillsOffered,
      skillsNeeded,
      duration,
      frequency,
      preferredTime,
      notes,
      status: 'pending'
    });

    await exchange.save();

    // Get initiator's name for notification
    const initiator = await User.findById(initiatorId);
    
    // Send notification to recipient
    const notificationMessage = `${initiator.name} wants to exchange ${skillsOffered.map(s => s.name).join(', ')} for ${skillsNeeded.map(s => s.name).join(', ')}.`;
    await sendNotification(
      recipientId,
      notificationMessage,
      'exchange',
      exchange._id
    );

    res.status(201).json(exchange);
  } catch (error) {
    console.error('Error creating exchange:', error);
    res.status(500).json({ message: 'Error creating exchange' });
  }
}; 