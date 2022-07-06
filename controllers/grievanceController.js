const { logger } = require('../middleware/logEvents');
const Grievance = require('../model/Grievance');
const User = require('../model/User');

const getAllGrievances = async (req, res) => {
  const grievances = await Grievance.find();
  if (!grievances)
    return res.status(204).json({ message: 'No grievances found.' });
  res.json(grievances);
};

const createNewGrievance = async (req, res) => {
  if (!req.body.title || !req.body.description) {
    return res
      .status(400)
      .json({ message: 'Title and description are required' });
  }

  try {
    const comments = req.body.comments;
    const result = await Grievance.create({
      grievanceTitle: req.body.title,
      grievanceDescription: req.body.description,
      grievanceStatus: 'open',
      grievanceType: req.body.type,
      grievancePriority: req.body.priority,
      grievanceDate: new Date(),
      grievanceUpdatedAt: new Date(),
      grievanceUpdatedBy: req.body.createdBy,
      grievanceDepartment: req.body.department,
      grievanceCreatedBy: req.user,
    });
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ message: err });
    console.error(err);
  }
};

const updateGrievance = async (req, res) => {
  if (!req.params.id) {
    return res.status(400).json({ message: 'ID parameter is required.' });
  }

  const grievance = await Grievance.findOne({ _id: req.params.id }).exec();
  if (!grievance) {
    return res
      .status(204)
      .json({ message: `No grievance matches ID ${req.body.id}.` });
  }
  const grievanceComments = grievance.grievanceComments.map((comment) => {
    const commentMapped = {
      comment: comment.comment,
      commentDate: comment.commentDate,
      commentBy: req.user._id,
    };
    return commentMapped;
  });
  console.log(grievanceComments);
  if (req.body?.title) grievance.grievanceTitle = req.body.title;
  if (req.body?.description)
    grievance.grievanceDescription = req.body.description;
  if (req.body?.status) grievance.grievanceStatus = req.body.status;
  if (req.body?.type) grievance.grievanceType = req.body.type;
  if (req.body?.priority) grievance.grievancePriority = req.body.priority;
  if (req.body?.date) grievance.grievanceDate = req.body.date;
  if (req.body?.updatedAt) grievance.grievanceUpdatedAt = req.body.updatedAt;
  if (req.body?.updatedBy) grievance.grievanceUpdatedBy = req.body.updatedBy;
  if (req.body?.department) grievance.grievanceDepartment = req.body.department;
  if (req.body?.createdBy) grievance.grievanceCreatedBy = req.user;
  if (req.body?.updatedBy) grievance.grievanceUpdatedBy = req.body.updatedBy;
  if (req.body?.comments) grievance.grievanceComments = grievanceComments;
  const result = await grievance.save();
  res.json(result);
};

const deleteGrievance = async (req, res) => {
  if (!req.params.id)
    return res.status(400).json({ message: 'Grievance ID required.' });

  const grievance = await Grievance.findOne({ _id: req.params.id }).exec();
  if (!grievance) {
    return res
      .status(204)
      .json({ message: `No grievance matches ID ${req.params.id}.` });
  }
  const result = await grievance.deleteOne(); //{ _id: req.body.id }
  res.json(result);
};

const getGrievance = async (req, res) => {
  if (!req?.params?.id)
    return res.status(400).json({ message: 'Grievance ID required.' });

  const grievance = await Grievance.findOne({ _id: req.params.id }).exec();
  const grievanceCreator = await User.findOne({
    username: grievance.grievanceCreatedBy,
  }).exec();
  if (!grievance) {
    return res
      .status(204)
      .json({ message: `No grievance matches ID ${req.body.id}.` });
  } else if (
    grievance.grievanceCreatedBy !== req.user ||
    !grievanceCreator.roles['Admin']
  ) {
    return res
      .status(403)
      .json({ message: `You are not authorized to view this grievance.` });
  }
  res.json(grievance);
};

const getGrievanceByStatus = async (req, res) => {
  if (!req.body.status)
    return res.status(400).json({ message: 'Status parameter is required.' });

  const grievances = await Grievance.find({
    grievanceStatus: req.body.status,
  }).exec();
  if (!grievances)
    return res.status(204).json({ message: 'No grievances found.' });
  res.json(grievances);
};

const getGrievanceByDepartment = async (req, res) => {
  if (!req.body.department)
    return res
      .status(400)
      .json({ message: 'Department parameter is required.' });

  const grievances = await Grievance.find({
    grievanceDepartment: req.body.department,
  }).exec();
  if (!grievances)
    return res.status(204).json({ message: 'No grievances found.' });
  res.json(grievances);
};

const getGrievanceByPriority = async (req, res) => {
  if (!req.body.priority)
    return res.status(400).json({ message: 'Priority parameter is required.' });

  const grievances = await Grievance.find({
    grievancePriority: req.body.priority,
  }).exec();
  if (!grievances)
    return res.status(204).json({ message: 'No grievances found.' });
  res.json(grievances);
};

const getGrievanceByType = async (req, res) => {
  if (!req.body.type)
    return res.status(400).json({ message: 'Type parameter is required.' });

  const grievances = await Grievance.find({
    grievanceType: req.body.type,
  }).exec();
  if (!grievances)
    return res.status(204).json({ message: 'No grievances found.' });
  res.json(grievances);
};

const getComments = async (req, res) => {
  if (!req.params.id)
    return res.status(400).json({ message: 'Grievance ID required.' });

  const grievance = await Grievance.findOne({ _id: req.params.id }).exec();
  if (!grievance) {
    return res
      .status(204)
      .json({ message: `No grievance matches ID ${req.body.id}.` });
  }
  const comments = grievance.grievanceComments.map(async (comment) => {
    // const user = await User.findOne({ _id: comment._id }).exec();
    const commentUser = await User.findById(comment._id).exec();
    console.log(comment);
    console.log(commentUser);
    if (comment.user === req.user) {
      const comment = {
        _id: comment._id,
        user: commentUser.username,
      };
      return comment;
    }
  });
  res.json(comments);
};

const addComment = async (req, res) => {
  if (!req.params.id)
    return res.status(400).json({ message: 'Grievance ID required.' });

  const grievance = await Grievance.findOne({ _id: req.params.id }).exec();
  if (!grievance) {
    return res
      .status(204)
      .json({ message: `No grievance matches ID ${req.body.id}.` });
  }
  const commentByUserId = await User.findOne({ username: req.user }).exec();
  const comment = {
    comment: req.body.comment,
    commentDate: new Date(),
    commentBy: commentByUserId._id,
    commentByName: req.user,
  };
  grievance.grievanceComments.push(comment);
  const result = await grievance.save();
  res.json(result);
};

module.exports = {
  getAllGrievances,
  createNewGrievance,
  updateGrievance,
  deleteGrievance,
  getGrievance,
  getGrievanceByStatus,
  getGrievanceByDepartment,
  getGrievanceByPriority,
  getGrievanceByType,
  getComments,
  addComment,
};
