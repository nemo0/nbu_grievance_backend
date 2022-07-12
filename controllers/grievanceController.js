const { logger } = require('../middleware/logEvents');
const Grievance = require('../model/Grievance');
const User = require('../model/User');
const { sendMail } = require('../utils/email');

const { prioritize } = require('../utils/priority');

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
    const priority = prioritize(req.body.description);
    const result = await Grievance.create({
      grievanceTitle: req.body.title,
      grievanceDescription: req.body.description,
      grievanceStatus: 'Open',
      grievanceType: req.body.type,
      grievancePriority: priority,
      grievanceDate: new Date(),
      grievanceUpdatedAt: new Date(),
      grievanceUpdatedBy: req.body.createdBy,
      grievanceDepartment: req.body.department,
      grievanceCreatedBy: req.user,
    });
    const user = await User.findOne({ username: req.user }).exec();
    await sendMail(req.body.title, user.email, req.body.description);
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
  const isAdmin = await Object.keys(grievanceCreator.roles).includes('Admin');

  if (!grievance) {
    return res
      .status(204)
      .json({ message: `No grievance matches ID ${req.params.id}.` });
  } else if (isAdmin) {
    res.json(grievance);
  } else if (grievance.grievanceCreatedBy === req.user) {
    res.json(grievance);
  }
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

const getGrievanceByMyDepartment = async (req, res) => {
  const myProfile = await User.findOne({ username: req.user }).exec();
  const department = myProfile.department;
  console.log(department);
  const grievances = await Grievance.find({
    grievanceDepartment: department,
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
  const user = await User.findOne({ username: req.user }).exec();
  const subject = `Comment Added for ${grievance.grievanceTitle}`;
  await sendMail(subject, user.email, comment.comment);

  res.json(result);
};

const closeGrievance = async (req, res) => {
  if (!req.params.id) {
    return res.status(400).json({ message: 'Grievance ID required.' });
  }
  const grievance = await Grievance.findOne({ _id: req.params.id }).exec();
  if (!grievance) {
    return res
      .status(204)
      .json({ message: `No grievance matches ID ${req.body.id}.` });
  }
  grievance.grievanceStatus = 'Closed';
  const result = await grievance.save();
  const grievanceCreator = await User.findOne({
    username: grievance.grievanceCreatedBy,
  }).exec();
  const subject = `Grievance Closed for ${grievance.grievanceTitle}`;
  const message = `Grievance Closed for ${grievance.grievanceTitle}. Please check the grievance status or contact support if you have any questions.`;
  await sendMail(subject, grievanceCreator.email, message);
  res.json(result);
};

const myGrievances = async (req, res) => {
  // const user = await findUserByName(req.user);
  const grievances = await Grievance.find({
    grievanceCreatedBy: req.user,
  }).exec();
  if (!grievances)
    return res.status(204).json({ message: 'No grievances found.' });
  return res.status(200).json(grievances);
};

const sendMailToCreator = async (req, res) => {
  if (!req.params.id)
    return res.status(400).json({ message: 'Grievance ID required.' });
  const grievance = await Grievance.findOne({ _id: req.params.id }).exec();
  const grievanceCreator = await User.findOne({
    username: grievance.grievanceCreatedBy,
  }).exec();
  const creatorEmail = grievanceCreator.email;
  const subject = 'An Update About a Grievance';
  const message = `You received an update from the Grievance ${grievance.grievanceTitle}`;
  try {
    console.log(creatorEmail);
    await sendMail(subject, creatorEmail, message);
    res.json({
      message: 'Email sent.',
      referenceGrievance: grievance._id,
      creatorEmail: creatorEmail,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Error sending email.' });
  }
};

module.exports = {
  getAllGrievances,
  createNewGrievance,
  updateGrievance,
  deleteGrievance,
  getGrievance,
  getGrievanceByStatus,
  getGrievanceByMyDepartment,
  getGrievanceByPriority,
  getGrievanceByType,
  addComment,
  closeGrievance,
  myGrievances,
  sendMailToCreator,
};
