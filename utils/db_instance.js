import User from '../models/user.js'
import Student from '../models/student.js';
import Teacher from '../models/teacher.js';
import Parent from '../models/parent.js';
import Class from '../models/class.js';
import Subject from '../models/subject.js';
import Attendance from '../models/attendance.js';
import Grade from '../models/grade.js';
import BehaviorRecord from '../models/behaviorRecord.js';
import GuidanceCase from '../models/guidanceCase.js';
import Communication from '../models/communication.js';
import Notification from '../models/notification.js';
import Circular from '../models/circular.js';
import Report from '../models/report.js';


const models = {
  User,
  Student,
  Teacher,
  Parent,
  Class,
  Subject,
  Attendance,
  Grade,
  BehaviorRecord,
  GuidanceCase,
  Communication,
  Notification,
  Circular,
  Report
}

Object.values(models).forEach(model => {
  if (model.associate) {
    model.associate(models)
  }
});

export { models };
