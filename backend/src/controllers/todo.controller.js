const todoModel = require("../models/todo.model");

const createTodo = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        message: "Title and description are required",
      });
    }

    const todo = await todoModel.create({
      title: title.trim(),
      description: description.trim(),
      user: req.userId,
    });

    return res.status(201).json({
      message: "Todo Created Successfully",
      todo,
    });
  } catch (error) {
    console.error("createTodo error:", error);
    return res.status(500).json({ message: "Failed to create todo" });
  }
};

const getAllTodos = async (req, res) => {
  try {
    // Each user only sees their own todos!
    const todos = await todoModel
      .find({ user: req.userId })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Todos fetched successfully",
      todos,
    });
  } catch (error) {
    console.error("getAllTodos error:", error);
    return res.status(500).json({ message: "Failed to fetch todos" });
  }
};

const delTodo = async (req, res) => {
  try {
    const { id } = req.params;

    // Only delete if it belongs to the authenticated user!
    const todo = await todoModel.findOneAndDelete({
      _id: id,
      user: req.userId,
    });

    if (!todo) {
      return res.status(404).json({
        message: "Todo not found or unauthorized",
      });
    }

    return res.status(200).json({
      message: "Todo deleted successfully",
    });
  } catch (error) {
    console.error("delTodo error:", error);
    return res.status(500).json({ message: "Failed to delete todo" });
  }
};

const updateTodo = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, completed } = req.body;

    const updateFields = {};
    if (title !== undefined) updateFields.title = title.trim();
    if (description !== undefined) updateFields.description = description.trim();
    if (completed !== undefined) updateFields.completed = completed;

    // Only update if it belongs to the authenticated user!
    const todo = await todoModel.findOneAndUpdate(
      { _id: id, user: req.userId },
      updateFields,
      { new: true }
    );

    if (!todo) {
      return res.status(404).json({
        message: "Todo not found or unauthorized",
      });
    }

    return res.status(200).json({
      message: "Updated successfully",
      todo,
    });
  } catch (error) {
    console.error("updateTodo error:", error);
    return res.status(500).json({ message: "Failed to update todo" });
  }
};

module.exports = { createTodo, getAllTodos, delTodo, updateTodo };

