import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import Nav from "../components/Nav";

const TodosList = () => {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Edit states
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  // Filter state: "all" | "pending" | "completed"
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { user } = useAuth();

  const fetchTodos = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get("/todos");
      setTodos(res.data.todos || []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load your todos. Please refresh."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  // Delete
  const delHandler = async (id) => {
    try {
      await api.delete(`/todos/${id}`);
      setTodos((prev) => prev.filter((todo) => todo._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete todo");
    }
  };

  // Toggle completion
  const toggleComplete = async (todo) => {
    try {
      const nextStatus = !todo.completed;
      // Optimistic update
      setTodos((prev) =>
        prev.map((t) => (t._id === todo._id ? { ...t, completed: nextStatus } : t))
      );
      await api.patch(`/todos/${todo._id}`, { completed: nextStatus });
    } catch (err) {
      console.error("Toggle error:", err);
      // Revert on error
      fetchTodos();
    }
  };

  // Start editing
  const editHandler = (todo) => {
    setEditingId(todo._id);
    setEditTitle(todo.title);
    setEditDescription(todo.description);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle("");
    setEditDescription("");
  };

  // Save edit
  const updateHandler = async (id) => {
    if (!editTitle.trim() || !editDescription.trim()) return;

    setSavingEdit(true);
    try {
      const res = await api.patch(`/todos/${id}`, {
        title: editTitle.trim(),
        description: editDescription.trim(),
      });

      setTodos((prev) =>
        prev.map((todo) =>
          todo._id === id
            ? {
                ...todo,
                title: res.data.todo?.title || editTitle.trim(),
                description: res.data.todo?.description || editDescription.trim(),
              }
            : todo
        )
      );

      cancelEdit();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update todo");
    } finally {
      setSavingEdit(false);
    }
  };

  // Computed filtered list
  const filteredTodos = todos
    .filter((todo) => {
      if (filter === "completed") return todo.completed;
      if (filter === "pending") return !todo.completed;
      return true;
    })
    .filter((todo) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        todo.title.toLowerCase().includes(q) ||
        todo.description.toLowerCase().includes(q)
      );
    });

  const totalCount = todos.length;
  const completedCount = todos.filter((t) => t.completed).length;
  const pendingCount = totalCount - completedCount;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Nav />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Top Header section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                My Todos
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                {user?.username}'s personal workspace
              </span>
            </div>
            <p className="text-slate-400 text-sm mt-1">
              Private list — only accessible by your account.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              id="goto-create-todo-btn"
              to="/add"
              className="py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all cursor-pointer"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span>Create New Todo</span>
            </Link>
          </div>
        </div>

        {/* Stats and Filter bar */}
        <div className="mt-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Filter Pills */}
          <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800 w-fit">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                filter === "all"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              All ({totalCount})
            </button>
            <button
              onClick={() => setFilter("pending")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                filter === "pending"
                  ? "bg-amber-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Pending ({pendingCount})
            </button>
            <button
              onClick={() => setFilter("completed")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                filter === "completed"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Completed ({completedCount})
            </button>
          </div>

          {/* Search box */}
          <div className="relative w-full md:w-64">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-500">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search todos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mt-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="mt-12 flex flex-col items-center justify-center py-16 text-slate-400">
            <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
            <p className="mt-4 text-sm font-medium">Fetching your personal todos...</p>
          </div>
        ) : filteredTodos.length === 0 ? (
          /* Empty State */
          <div className="mt-12 text-center py-16 px-4 bg-slate-900/50 border border-dashed border-slate-800 rounded-3xl max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto text-indigo-400 mb-4">
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.75}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-white">No todos found</h3>
            <p className="text-slate-400 text-sm mt-1 max-w-sm mx-auto">
              {searchQuery || filter !== "all"
                ? "No todos match your search or filter criteria."
                : "You don't have any todos yet. Get started by creating your first task!"}
            </p>
            <Link
              to="/add"
              className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/25 transition-all"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span>Create Todo</span>
            </Link>
          </div>
        ) : (
          /* Todos Grid */
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredTodos.map((todo) => {
              const isEditing = editingId === todo._id;

              return (
                <div
                  key={todo._id}
                  className={`flex flex-col justify-between bg-slate-900/70 backdrop-blur-md rounded-2xl border transition-all duration-200 p-5 shadow-xl hover:border-slate-700/80 ${
                    todo.completed
                      ? "border-emerald-500/20 bg-slate-900/40"
                      : "border-slate-800"
                  }`}
                >
                  {isEditing ? (
                    /* EDIT MODE */
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                          Title
                        </label>
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-950 border border-indigo-500 rounded-lg text-sm text-white focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                          Description
                        </label>
                        <textarea
                          rows={3}
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-950 border border-indigo-500 rounded-lg text-sm text-white focus:outline-none resize-none"
                        />
                      </div>

                      <div className="flex items-center gap-2 pt-2">
                        <button
                          onClick={() => updateHandler(todo._id)}
                          disabled={savingEdit}
                          className="flex-1 py-2 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-md transition-all cursor-pointer disabled:opacity-50"
                        >
                          {savingEdit ? "Saving..." : "Save Changes"}
                        </button>
                        <button
                          onClick={cancelEdit}
                          type="button"
                          className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* DISPLAY MODE */
                    <div className="flex flex-col h-full justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-3">
                          <button
                            onClick={() => toggleComplete(todo)}
                            title={todo.completed ? "Mark pending" : "Mark completed"}
                            className="mt-1 shrink-0 cursor-pointer"
                          >
                            <div
                              className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                                todo.completed
                                  ? "bg-emerald-500 border-emerald-400 text-white"
                                  : "border-slate-600 hover:border-indigo-400 bg-slate-950/50"
                              }`}
                            >
                              {todo.completed && (
                                <svg
                                  className="w-3.5 h-3.5 stroke-[3]"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              )}
                            </div>
                          </button>

                          <div className="flex-1 min-w-0">
                            <h2
                              className={`text-base font-bold break-words transition-all ${
                                todo.completed
                                  ? "line-through text-slate-500"
                                  : "text-white"
                              }`}
                            >
                              {todo.title}
                            </h2>
                            <p
                              className={`mt-2 text-sm break-words whitespace-pre-line leading-relaxed ${
                                todo.completed
                                  ? "text-slate-500"
                                  : "text-slate-300"
                              }`}
                            >
                              {todo.description}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Card Footer Actions */}
                      <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between gap-2">
                        <span
                          className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                            todo.completed
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          }`}
                        >
                          {todo.completed ? "Completed" : "In Progress"}
                        </span>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => editHandler(todo)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors cursor-pointer"
                            title="Edit Todo"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                              />
                            </svg>
                          </button>

                          <button
                            onClick={() => delHandler(todo._id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                            title="Delete Todo"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default TodosList;
