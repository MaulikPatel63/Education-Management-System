const Course = require("../models/Course");
const User = require("../models/User");

const courseAdd = async (req, res) => {
  const { title, description, teacher, students } = req.body; // Accept teacher and students from the request

  try {
    // Find the teacher by email
    const teacherUser = await User.findOne({ email: teacher, role: "Teacher" });
    if (!teacherUser) {
      return res
        .status(404)
        .json({ success: false, message: "Teacher not found" });
    }

    // Find the students by their emails
    const studentUsers = await User.find({
      email: { $in: students },
      role: "Student",
    });
    const studentIds = studentUsers.map((user) => user._id); // Get the ObjectId of each student

    // Create the course
    const course = new Course({
      title,
      description,
      teacher: teacherUser._id, // Use the teacher's ObjectId
      students: studentIds, // Add the students' ObjectIds
    });

    await course.save();
    res.status(201).json({ success: true, data: course });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const coursesGet = async (req, res) => {
  try {
    const { page = 1, limit = 10, title } = req.query;

    const filter = {};
    if (title) {
      filter.title = { $regex: title, $options: "i" }; // Case-insensitive search for title
    }

    const courses = await Course.find(filter)
      .populate("teacher", "username email")
      .populate("students", "username email")
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Course.countDocuments(filter);
    return res
      .status(200)
      .json({
        success: true,
        count: courses.length,
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        data: courses,
      });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const courseGet = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate("teacher", "name email")
      .populate("students", "name email");

    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    res.status(200).json({ success: true, data: course });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const courseUpdate = async (req, res) => {
  try {
    const { title, description, teacher, students } = req.body; // Accept teacher and students from the request
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    // Update course fields if provided
    course.title = title || course.title;
    course.description = description || course.description;

    if (teacher) {
      const teacherUser = await User.findOne({ email: teacher });
      if (!teacherUser) {
        return res
          .status(404)
          .json({ success: false, message: "Teacher not found" });
      }
      course.teacher = teacherUser._id; // Update teacher ObjectId
    }

    if (students) {
      const studentUsers = await User.find({ email: { $in: students } });
      const studentIds = studentUsers.map((user) => user._id);
      course.students = studentIds; // Update students' ObjectIds
    }

    await course.save();
    res.status(200).json({ success: true, data: course });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const courseDelete = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    await course.remove();
    res.status(200).json({ success: true, message: "Course removed" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  courseAdd,
  coursesGet,
  courseGet,
  courseDelete,
  courseUpdate,
};
