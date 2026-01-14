import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import mongoose from 'mongoose';
import StudyGroup from '../models/StudyGroup.model';

export const createStudyGroup = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    // Check if database is connected
    if (mongoose.connection.readyState !== 1) {
      console.log('Database not connected, cannot create study group');
      return res.status(503).json({ message: 'Database not available. Please try again later.' });
    }

    const { name, subject, topic, maxMembers } = req.body;
    const group = await StudyGroup.create({
      name,
      subject,
      topic,
      members: [req.user._id],
      moderator: req.user._id,
      maxMembers: maxMembers || 10
    });
    return res.status(201).json({ group });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const joinGroup = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    console.log('Join group request received');
    console.log('Group ID:', req.params.groupId);
    console.log('User from request:', req.user);
    
    // Check if database is connected
    if (mongoose.connection.readyState !== 1) {
      console.log('Database not connected, cannot join group');
      return res.status(503).json({ message: 'Database not available. Please try again later.' });
    }

    const { groupId } = req.params;
    const group = await StudyGroup.findById(groupId);
    
    if (!group) {
      console.log('Group not found:', groupId);
      return res.status(404).json({ message: 'Group not found' });
    }

    console.log('Group found:', group);
    console.log('Current members:', group.members);
    console.log('Max members:', group.maxMembers);

    if (group.members.length >= group.maxMembers) {
      console.log('Group is full');
      return res.status(400).json({ message: 'Group is full' });
    }

    if (!group.members.includes(req.user._id)) {
      console.log('Adding user to group:', req.user._id);
      group.members.push(req.user._id);
      await group.save();
      console.log('User added successfully');
    } else {
      console.log('User already in group');
    }

    return res.json({ group });
  } catch (error: any) {
    console.error('Error in joinGroup:', error);
    return res.status(500).json({ message: error.message });
  }
};

export const getGroups = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    // Check if database is connected
    if (mongoose.connection.readyState !== 1) {
      console.log('Database not connected, returning empty groups array');
      return res.json({ groups: [] });
    }

    const groups = await StudyGroup.find({ isActive: true })
      .populate('members', 'name email')
      .populate('moderator', 'name email')
      .sort({ createdAt: -1 });
    
    return res.json({ groups });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const sendMessage = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    // Check if database is connected
    if (mongoose.connection.readyState !== 1) {
      console.log('Database not connected, cannot send message');
      return res.status(503).json({ message: 'Database not available. Please try again later.' });
    }

    const { groupId } = req.params;
    const { content } = req.body;
    
    const group = await StudyGroup.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    group.messages.push({ senderId: req.user._id, content, timestamp: new Date(), isAIModerated: false });
    await group.save();

    return res.json({ message: group.messages[group.messages.length - 1] });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const getGroupDetails = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    // Check if database is connected
    if (mongoose.connection.readyState !== 1) {
      console.log('Database not connected, cannot get group details');
      return res.status(503).json({ message: 'Database not available. Please try again later.' });
    }

    const { groupId } = req.params;
    console.log('Getting group details for ID:', groupId);
    
    const group = await StudyGroup.findById(groupId)
      .populate('members', 'name email')
      .populate('moderator', 'name email');
    
    console.log('Group found:', !!group);
    
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    console.log('Group details retrieved successfully');
    return res.json({ group });
  } catch (error: any) {
    console.error('Error in getGroupDetails:', error);
    return res.status(500).json({ message: error.message });
  }
};

export const getMessages = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    // Check if database is connected
    if (mongoose.connection.readyState !== 1) {
      console.log('Database not connected, returning empty messages array');
      return res.json({ messages: [] });
    }

    const { groupId } = req.params;
    console.log('Getting messages for group ID:', groupId);
    
    const group = await StudyGroup.findById(groupId)
      .populate('messages.senderId', 'name email')
      .select('messages');
    
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    console.log('Messages retrieved:', group.messages.length);
    return res.json({ messages: group.messages });
  } catch (error: any) {
    console.error('Error in getMessages:', error);
    return res.status(500).json({ message: error.message });
  }
};

export const leaveGroup = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    console.log('Leave group request received');
    console.log('Group ID:', req.params.groupId);
    console.log('User from request:', req.user);
    
    // Check if database is connected
    if (mongoose.connection.readyState !== 1) {
      console.log('Database not connected, cannot leave group');
      return res.status(503).json({ message: 'Database not available. Please try again later.' });
    }

    const { groupId } = req.params;
    const group = await StudyGroup.findById(groupId);
    
    if (!group) {
      console.log('Group not found:', groupId);
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if user is the moderator
    if (group.moderator.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Moderator cannot leave the group. Transfer moderator role first.' });
    }

    // Remove user from members array
    const memberIndex = group.members.indexOf(req.user._id);
    if (memberIndex > -1) {
      console.log('Removing user from group:', req.user._id);
      group.members.splice(memberIndex, 1);
      await group.save();
      console.log('User removed successfully');
    } else {
      console.log('User not in group');
    }

    return res.json({ group });
  } catch (error: any) {
    console.error('Error in leaveGroup:', error);
    return res.status(500).json({ message: error.message });
  }
};
