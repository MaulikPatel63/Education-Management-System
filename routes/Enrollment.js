const router = require("express").Router();
const path = require("path");
const Joi = require("joi");

const {
  EnrollmentAdd,
  EnrollmentsGet,
  EnrollmentDelete,
  EnrollmentUpdate,
  EnrollmentGet,
} = require("../controllers/EnrollmentController.js");

const validateRequest = require("../middleware/validate-request.js");

const { authMiddleware } = require("../middleware/authMiddleware.js");
router.use(authMiddleware);

//? Enrollment router
router.post("/enrollment-add", AddValidation, EnrollmentAdd);
router.get("/enrollment-get", EnrollmentsGet);
router.get("/enrollment-get/:id", EnrollmentGet);
router.put("/enrollment-update/:id", UpdateValidation, EnrollmentUpdate);
router.delete("/enrollment-delete/:id", EnrollmentDelete);

function AddValidation(req, res, next) {
  const schema = Joi.object({
    studentId: Joi.string().required(), // Student is an ObjectId (string)
    courseId: Joi.string().required(), // Course is an ObjectId (string)
  });
  validateRequest(req, res, next, schema);
}
function UpdateValidation(req, res, next) {
  const schema = Joi.object({
    status: Joi.string()
    .valid('enrolled', 'completed', 'dropped').optional(),
    studentId: Joi.string().optional(),
    courseId: Joi.string().optional(),
  });
  validateRequest(req, res, next, schema);
}

module.exports = router;
