const router = require("express").Router();
const path = require("path");
const Joi = require("joi");

const {
  GradeAdd,
  GradesGet,
  GradeDelete,
  GradeUpdate,
  GradeGet,
} = require("../controllers/GradeController.js");

const validateRequest = require("../middleware/validate-request.js");

const { authMiddleware } = require("../middleware/authMiddleware.js");
router.use(authMiddleware);

//? Grade router
router.post("/grade-add", AddValidation, GradeAdd);
router.get("/grade-get", GradesGet);
router.get("/grade-get/:id", GradeGet);
router.put("/grade-update/:id", UpdateValidation, GradeUpdate);
router.delete("/grade-delete/:id", GradeDelete);

function AddValidation(req, res, next) {
  const schema = Joi.object({
    studentId: Joi.string().required(), // Must be a valid ObjectId (string)
    courseId: Joi.string().required(), // Must be a valid ObjectId (string)
    grade: Joi.number().min(0).max(100).required(), // Grade must be between 0 and 100
    feedback: Joi.string().optional(), // Feedback is optional
  });
  validateRequest(req, res, next, schema);
}
function UpdateValidation(req, res, next) {
  const schema = Joi.object({
    status: Joi.string().valid("enrolled", "completed", "dropped").optional(),
    studentId: Joi.string().optional(),
    courseId: Joi.string().optional(),
  });
  validateRequest(req, res, next, schema);
}

module.exports = router;
