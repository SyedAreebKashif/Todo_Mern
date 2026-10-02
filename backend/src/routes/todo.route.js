const express = require("express");
const router = express.Router();
const {
  createTodo,
  getAllTodos,
  delTodo,
  updateTodo,
} = require("../controllers/todo.controller");

router.post("/", createTodo);
router.get("/", getAllTodos);
router.delete("/:id", delTodo);
router.patch("/:id", updateTodo);
router.put("/:id", updateTodo);

module.exports = router;

