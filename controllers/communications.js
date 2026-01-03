import { asyncWrapper } from '../middlewares/asyncWrapper.js';
import { models } from '../utils/db_instance.js';
import appError from '../utils/app_error.js';
import httpStatusText from '../utils/httpStatusText.js';

const { Communication, Teacher, Parent } = models;

/**
 * GET /communications/parent/:parentId
 */
const getParentCommunications = asyncWrapper(async (req, res, next) => {
  const { parentId } = req.params;

  const parent = await Parent.findByPk(parentId);
  if (!parent) {
    return next(appError.create('ولي الأمر غير موجود', 404, httpStatusText.FAIL));
  }

  const communications = await Communication.findAll({
    where: { parentId },
    include: [
      {
        model: Teacher,
        as: 'sentBy',
        attributes: ['id', 'name']
      }
    ],
    order: [['sentAt', 'DESC']]
  });

  const formatted = communications.map(c => ({
    id: c.id,
    type: c.type,
    template: c.templateId,
    message: c.message,
    sentAt: c.sentAt,
    sentBy: c.sentBy?.name,
    status: c.status
  }));

  res.status(200).json({
    success: true,
    data: formatted
  });
});

/**
 * POST /communications/send
 */
const sendCommunication = asyncWrapper(async (req, res, next) => {
  const { parentId, studentId, type, templateId, customMessage } = req.body;

  // Optional: you could lookup template by templateId, here we just use customMessage
  const messageText = customMessage || `تم إرسال رسالة باستخدام القالب ${templateId}`;

  const communication = await Communication.create({
    parentId,
    studentId,
    type,
    templateId,
    message: messageText,
    sentById: req.user.id,
    status: 'sent'
  });

  res.status(201).json({
    success: true,
    message: 'تم إرسال الرسالة بنجاح',
    data: {
      messageId: communication.id,
      status: communication.status
    }
  });
});

export { getParentCommunications, sendCommunication };
