const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const LearningProgress = require('../models/LearningProgress');

// Get learning progress for a specific exchange
router.get('/:exchangeId', protect, async (req, res) => {
  try {
    const progress = await LearningProgress.findOne({ exchange: req.params.exchangeId })
      .populate('skill')
      .populate('exchange');
    
    if (!progress) {
      return res.status(404).json({ message: 'Learning progress not found' });
    }
    
    res.json(progress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add a milestone
router.post('/:exchangeId/milestones', protect, async (req, res) => {
  try {
    const progress = await LearningProgress.findOne({ exchange: req.params.exchangeId });
    if (!progress) {
      return res.status(404).json({ message: 'Learning progress not found' });
    }

    progress.milestones.push(req.body);
    await progress.save();
    res.status(201).json(progress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add a note
router.post('/:exchangeId/notes', protect, async (req, res) => {
  try {
    const progress = await LearningProgress.findOne({ exchange: req.params.exchangeId });
    if (!progress) {
      return res.status(404).json({ message: 'Learning progress not found' });
    }

    progress.notes.push(req.body);
    await progress.save();
    res.status(201).json(progress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add a resource
router.post('/:exchangeId/resources', protect, async (req, res) => {
  try {
    const progress = await LearningProgress.findOne({ exchange: req.params.exchangeId });
    if (!progress) {
      return res.status(404).json({ message: 'Learning progress not found' });
    }

    progress.resources.push(req.body);
    await progress.save();
    res.status(201).json(progress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update milestone completion status
router.put('/:exchangeId/milestones/:milestoneId', protect, async (req, res) => {
  try {
    const progress = await LearningProgress.findOne({ exchange: req.params.exchangeId });
    if (!progress) {
      return res.status(404).json({ message: 'Learning progress not found' });
    }

    const milestone = progress.milestones.id(req.params.milestoneId);
    if (!milestone) {
      return res.status(404).json({ message: 'Milestone not found' });
    }

    milestone.completed = req.body.completed;
    await progress.save();
    res.json(progress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update resource completion status
router.put('/:exchangeId/resources/:resourceId', protect, async (req, res) => {
  try {
    const progress = await LearningProgress.findOne({ exchange: req.params.exchangeId });
    if (!progress) {
      return res.status(404).json({ message: 'Learning progress not found' });
    }

    const resource = progress.resources.id(req.params.resourceId);
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    resource.completed = req.body.completed;
    await progress.save();
    res.json(progress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update overall progress
router.put('/:exchangeId/progress', protect, async (req, res) => {
  try {
    const progress = await LearningProgress.findOne({ exchange: req.params.exchangeId });
    if (!progress) {
      return res.status(404).json({ message: 'Learning progress not found' });
    }

    progress.progressPercentage = req.body.progressPercentage;
    progress.currentLevel = req.body.currentLevel;
    progress.totalHoursSpent = req.body.totalHoursSpent;
    await progress.save();
    res.json(progress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 