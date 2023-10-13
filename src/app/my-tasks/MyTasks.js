"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  getUserTasks,
  deleteTask as deleteTaskService,
  updateTask as updateTaskService,
} from "@/services/taskService";
import { AiOutlineMoneyCollect, AiOutlineCalendar } from "react-icons/ai";

const MyTasks = () => {
  const { data: session, status } = useSession();
  const [userTasks, setUserTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const userEmail = session?.user?.email;

  useEffect(() => {
    const fetchUserTasks = async () => {
      try {
        setLoading(true);
        setError(null);
        const tasks = await getUserTasks(userEmail);
        setUserTasks(tasks);
      } catch (error) {
        console.error("Error fetching user tasks:", error);
        setError("Failed to fetch tasks. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (status === "authenticated") {
      fetchUserTasks();
    }
  }, [userEmail, status]);
  const handleDeleteTask = async (taskId) => {
    try {
      // Call the deleteTaskService to delete the task on the server-side
      await deleteTaskService(taskId);

      // If deletion is successful, update the local state to remove the deleted task
      setUserTasks((prevTasks) =>
        prevTasks.filter((task) => task._id !== taskId)
      );
    } catch (error) {
      // If there's an error during deletion, log the error and set an error message
      console.error("Error deleting task:", error);
      setError("Failed to delete the task. Please try again later.");
    }
  };

  const handleUpdateTask = async (taskId) => {
    try {
      const updatedTask = await updateTaskService(taskId);
      setUserTasks((prevTasks) =>
        prevTasks.map((task) => (task._id === taskId ? updatedTask : task))
      );
    } catch (error) {
      console.error("Error updating task:", error);
      if (error.response && error.response.status === 404) {
        setError("Task not found. Please refresh the page.");
      } else {
        setError("Failed to update the task. Please try again later.");
      }
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-8 text-4xl font-bold text-center text-blue-500">
        My Tasks
      </h1>
      {loading && (
        <div className="my-8 text-center text-gray-700">Loading tasks...</div>
      )}
      {error && (
        <div className="my-8 text-center text-red-500">Error: {error}</div>
      )}
      {!loading && userTasks.length === 0 && (
        <div className="my-8 text-center text-gray-700">No tasks found.</div>
      )}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {userTasks.map((task) => (
          <div
            key={task._id}
            className="p-6 bg-white rounded shadow-lg transition duration-300 ease-in-out transform hover:scale-105 relative"
          >
            <h2 className="mb-2 text-xl font-semibold text-blue-500">
              {task.title}
            </h2>
            <p className="mb-4 text-gray-600">
              <AiOutlineMoneyCollect className="inline-block mr-2" />
              {task.budget}
              <br />
              <AiOutlineCalendar className="inline-block mr-2" />
              {new Date(task.selectedDate).toLocaleDateString()}
            </p>
            <div
              className={`absolute top-2 right-2 text-sm font-semibold ${
                task.status === "OPEN"
                  ? "text-green-500"
                  : task.status === "ASSIGNED"
                  ? "text-yellow-500"
                  : task.status === "COMPLETED"
                  ? "text-red-500"
                  : "text-gray-500"
              }`}
            >
              {task.status &&
              typeof task.status === "string" &&
              task.status.length > 0
                ? task.status.charAt(0).toUpperCase() + task.status.slice(1)
                : ""}
            </div>
            <div className="flex buttons">
              <button
                className="px-4 py-1 mr-2 text-sm text-white transition duration-300 ease-in-out bg-red-500 rounded-full hover:bg-red-600"
                onClick={() => handleDeleteTask(task._id)}
              >
                Delete
              </button>
              {!task.completed && (
                <button
                  className="px-2 py-1 text-sm text-white transition duration-300 ease-in-out bg-blue-600 rounded-full hover:bg-green-600"
                  onClick={() => handleUpdateTask(task._id)}
                >
                  Mark as Completed
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyTasks;
