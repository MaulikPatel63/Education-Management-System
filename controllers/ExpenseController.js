const Expense = require("../models/Expense.js");
const User = require("../models/User.js");
const fs = require("fs");
const csv = require("fast-csv");

const expenseAdd = async (req, res) => {
  try {
    let user = await User.findById(req.user._id);
    if (!user) {
      return res.status(400).json({ message: "User Does not exists" });
    }

    const expenses = Array.isArray(req.body)
      ? req.body.map((expense) => ({ ...expense, user: req.user._id })) // For multiple expenses
      : [{ ...req.body, user: req.user._id }]; // For a single expense

    // Insert all the expenses in one go using insertMany
    const newExpenses = await Expense.insertMany(expenses);

    return res
      .status(200)
      .json({ message: "Expense Created Successfully!", data: newExpenses });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Expense controller error", err: error.message });
  }
};

const expensesGet = async (req, res) => {
  try {
    const {
      category,
      paymentMethod,
      startDate,
      endDate,
      page = 1,
      limit = 10,
    } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    let query = { user: req.user._id };

    if (category) query.category = category;
    if (paymentMethod) query.paymentMethod = paymentMethod;
    if (startDate && endDate) {
      query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const expenses = await Expense.find(query)
      .sort({ date: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    const totalExpensesCount = await Expense.countDocuments(query);
    const totalAmount = expenses.reduce(
      (acc, expense) => acc + expense.amount,
      0
    );
    return res.status(200).json({
      message: "The expenses were retrieved successfully!",
      pagination: {
        total: totalExpensesCount,
        currentPage: pageNum,
        totalPages: Math.ceil(totalExpensesCount / limitNum),
      },
      data: expenses,
      totalAmount: totalAmount,
    });
  } catch (error) {
    res.status(400).json({ error: "Failed to fetch expenses" });
  }
};

const expenseUpdate = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedExpense = await Expense.findByIdAndUpdate(
      id,
      { ...req.body, updatedAt: new date() },
      {
        new: true,
      }
    );
    if (!updatedExpense) {
      return res.status(404).json({ message: "Expense not found" });
    }
    return res
      .status(200)
      .json({ message: "Expense Created Successfully!", data: updatedExpense });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal server error", err: error.message });
  }
};

const expenseDelete = async (req, res) => {
  try {
    const { id } = req.params;
    await Expense.findByIdAndDelete(id);
    return res.status(200).json({ message: "Expense Deleted Successfully!" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal server error", err: error.message });
  }
};

const expensesUpload = async (req, res) => {
  try {
    const results = [];
    const requiredFields = [
      "amount",
      "description",
      "date",
      "category",
      "paymentmethod",
    ];
    let isValid = true;
    let validationError = "";

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(400).json({ message: "User does not exist" });
    }

    const stream = fs
      .createReadStream(req.file.path)
      .pipe(csv.parse({ headers: true }))
      .on("data", (row) => {
        // Check if all required fields are present and not empty
        for (let field of requiredFields) {
          if (!row[field] || row[field].trim() === "") {
            isValid = false;
            validationError = `Missing or empty required field: ${field}`;
            break; // Stop validation if an error is found
          }
        }

        // If validation passes, push row to results
        if (isValid) {
          results.push({
            ...row,
            paymentmethod: row.paymentmethod.toLowerCase(),
            user: req.user._id,
          });
        } else {
          // Stop processing further rows if validation fails
          stream.destroy(new Error(validationError)); // Use the stream instance to destroy it
        }
      })
      .on("end", async () => {
        if (isValid) {
          // Handle your data here (e.g., save to database)
          const newExpenses = await Expense.insertMany(results);
          res.json({
            message: "Expenses uploaded and saved to database successfully!",
            data: newExpenses,
          });
        }
        // Clean up file after processing
        fs.unlinkSync(req.file.path);
      })
      .on("error", (err) => {
        return res
          .status(400)
          .json({ message: "CSV validation error", err: err.message });
      });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal server error", err: error.message });
  }
};

module.exports = {
  expenseAdd,
  expensesGet,
  expenseUpdate,
  expenseDelete,
  expensesUpload,
};
