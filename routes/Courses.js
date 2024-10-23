const router = require("express").Router();
const path = require("path");
const Joi = require("joi");

const {
  courseAdd,
  coursesGet,
  courseDelete,
  courseUpdate,
  courseGet,
} = require("../controllers/CourseController.js");

const validateRequest = require("../middleware/validate-request.js");

const { authMiddleware } = require("../middleware/authMiddleware.js");
router.use(authMiddleware);

//? course router
router.post("/course-add", AddValidation, courseAdd);
router.get("/course-get", coursesGet);
router.get("/course-get/:id", courseGet);
router.put("/course-update/:id", UpdateValidation, courseUpdate);
router.delete("/course-delete/:id", courseDelete);

function AddValidation(req, res, next) {
  const schema = Joi.object({
    title: Joi.string().min(3).max(255).required(), // Title is a string
    description: Joi.string().min(3).max(255).required(), // Description is a string
    teacher: Joi.string().required(), // Teacher is an ObjectId (string)
    students: Joi.array().items(Joi.string()).required(), // Students is an array of ObjectId strings
  });
  validateRequest(req, res, next, schema);
}
function UpdateValidation(req, res, next) {
  const schema = Joi.object({
    title: Joi.string().min(3).max(255).optional(), // Title is a string
    description: Joi.string().min(3).max(255).optional(), // Description is a string
    teacher: Joi.string().optional(), // Teacher is an ObjectId (string)
    students: Joi.array().items(Joi.string()).optional(), // Students is an array of ObjectId strings
  });
  validateRequest(req, res, next, schema);
}

module.exports = router;
