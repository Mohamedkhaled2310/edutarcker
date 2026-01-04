import { asyncWrapper } from '../middlewares/asyncWrapper.js';
import { models } from '../utils/db_instance.js';
import appError from '../utils/app_error.js';
import httpStatusText from '../utils/httpStatusText.js';

const { Report, Teacher } = models;

/**
 * GET /reports
 */
const getReports = asyncWrapper(async (req, res) => {
  const { status, type } = req.query;

  const where = {};
  if (status) where.status = status;
  if (type) where.type = type;

  const reports = await Report.findAll({
    where,
    include: [
      {
        model: Teacher,
        as: 'createdBy',
        attributes: ['id', 'name']
      }
    ],
    order: [['createdAt', 'DESC']]
  });

  res.status(200).json({
    success: true,
    data: reports.map(r => ({
      id: r.id,
      title: r.title,
      type: r.type,
      grade: r.grade,
      createdBy: r.createdBy?.name,
      createdAt: r.createdAt,
      status: r.status,
      summary: r.summary
    }))
  });
});

/**
 * POST /reports
 */
const createReport = asyncWrapper(async (req, res) => {
  const {
    title,
    type,
    grade,
    classId,
    periodStart,
    periodEnd,
    summary,
    content,
    data
  } = req.body;

  const report = await Report.create({
    title,
    type,
    grade,
    classId,
    periodStart,
    periodEnd,
    summary,
    content,
    data,
    createdById: req.user.id,
    status: 'pending'
  });

  res.status(201).json({
    success: true,
    message: 'تم إنشاء التقرير بنجاح',
    data: {
      id: report.id,
      reportNumber: report.reportNumber
    }
  });
});

/**
 * PUT /reports/:id/approve
 */
const approveReport = asyncWrapper(async (req, res, next) => {
  const { id } = req.params;

  const report = await Report.findByPk(id);
  if (!report) {
    return next(
      appError.create('التقرير غير موجود', 404, httpStatusText.FAIL)
    );
  }

  if (report.status === 'approved') {
    return next(
      appError.create('التقرير معتمد بالفعل', 400, httpStatusText.FAIL)
    );
  }

  await report.update({
    status: 'approved',
    approvedById: req.user.id,
    approvedAt: new Date()
  });

  res.status(200).json({
    success: true,
    message: 'تم اعتماد التقرير بنجاح'
  });
});

/**
 * GET /reports/:id/export
 */
const exportReport = asyncWrapper(async (req, res, next) => {
  const { id } = req.params;

  const report = await Report.findByPk(id);
  if (!report) {
    return next(
      appError.create('التقرير غير موجود', 404, httpStatusText.FAIL)
    );
  }

  await report.increment('downloadCount');

  // mock pdf
  const pdfContent = `
Report Number: ${report.reportNumber}
Title: ${report.title}
Type: ${report.type}
Grade: ${report.grade}
Status: ${report.status}
`;

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename=report-${report.reportNumber}.pdf`
  );

  res.send(Buffer.from(pdfContent));
});

export {
  getReports,
  createReport,
  approveReport,
  exportReport
};
