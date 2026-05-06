"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/authcontext";
import { auth, db } from "@/firebase/firebase";
import { GoogleAuthProvider, signInWithPopup, signInWithRedirect, signOut } from "firebase/auth";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";

export default function Home() {
  const { user, loading } = useAuth();
  const [name, setName] = useState("");
  const [greeting, setGreeting] = useState("");
  const [tasks, setTasks] = useState([]);
  const [taskTitle, setTaskTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [deadline, setDeadline] = useState("");
  const [statusMessage, setStatusMessage] = useState({ text: "", type: "info" });
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editSubject, setEditSubject] = useState("");
  const [editDeadline, setEditDeadline] = useState("");

  useEffect(() => {
    if (!user) return;

    const tasksQuery = query(collection(db, "tasks"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(
      tasksQuery,
      (snapshot) => {
        setTasks(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      },
      (error) => {
        setStatusMessage({ text: `Read failed: ${error.message}`, type: "error" });
      }
    );

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!statusMessage.text) return;
    const timeout = setTimeout(() => setStatusMessage({ text: "", type: "info" }), 4000);
    return () => clearTimeout(timeout);
  }, [statusMessage]);

  const showNotification = (text, type = "success") => {
    setStatusMessage({ text, type });
  };

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);

      if (isMobile) {
        await signInWithRedirect(auth, provider);
      } else {
        await signInWithPopup(auth, provider);
        showNotification("Signed in successfully.", "success");
      }
    } catch (error) {
      console.error("Login failed", error);
      showNotification(`Login failed: ${error.message}`, "error");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setTasks([]);
      showNotification("Signed out successfully.", "success");
    } catch (error) {
      console.error("Sign out failed", error);
      showNotification(`Sign out failed: ${error.message}`, "error");
    }
  };

  const greet = () => {
    if (name.trim() !== "") {
      setGreeting(`Hello ${name}! Don't forget your assignments.`);
    } else {
      setGreeting("");
    }
  };

  const createTask = async () => {
    if (!taskTitle || !subject || !deadline) {
      showNotification("Please fill all fields before adding.", "error");
      return;
    }

    try {
      await addDoc(collection(db, "tasks"), {
        task: taskTitle,
        subject,
        deadline,
        status: "Pending",
        createdAt: new Date(),
      });
      setTaskTitle("");
      setSubject("");
      setDeadline("");
      showNotification("Task created successfully.", "success");
    } catch (error) {
      console.error("Create task failed", error);
      showNotification(`Create failed: ${error.message}`, "error");
    }
  };

  const completeTask = async (taskId) => {
    try {
      await updateDoc(doc(db, "tasks", taskId), { status: "Completed" });
      showNotification("Task marked completed.", "success");
    } catch (error) {
      console.error("Complete task failed", error);
      showNotification(`Update failed: ${error.message}`, "error");
    }
  };

  const startEdit = (task) => {
    setEditingId(task.id);
    setEditTitle(task.task);
    setEditSubject(task.subject);
    setEditDeadline(task.deadline);
  };

  const saveEdit = async () => {
    if (!editTitle || !editSubject || !editDeadline) {
      showNotification("Please fill all fields to update.", "error");
      return;
    }

    try {
      await updateDoc(doc(db, "tasks", editingId), {
        task: editTitle,
        subject: editSubject,
        deadline: editDeadline,
      });
      setEditingId(null);
      setEditTitle("");
      setEditSubject("");
      setEditDeadline("");
      showNotification("Task updated successfully.", "success");
    } catch (error) {
      console.error("Save edit failed", error);
      showNotification(`Update failed: ${error.message}`, "error");
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle("");
    setEditSubject("");
    setEditDeadline("");
  };

  const deleteTask = async (taskId) => {
    try {
      await deleteDoc(doc(db, "tasks", taskId));
      showNotification("Task deleted successfully.", "success");
    } catch (error) {
      console.error("Delete task failed", error);
      showNotification(`Delete failed: ${error.message}`, "error");
    }
  };

  const notificationClass =
    statusMessage.type === "success"
      ? "bg-green-500"
      : statusMessage.type === "error"
      ? "bg-red-500"
      : "bg-blue-500";

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black text-white">
        Loading authentication...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-gray-900 rounded-xl p-8 shadow-xl text-center">
          <h1 className="text-3xl font-bold mb-6">Student Assignment Reminder</h1>
          <p className="mb-6 text-gray-300">Sign in with Google to manage your assignments.</p>
          <button
            onClick={handleLogin}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition"
          >
            Sign in with Google
          </button>
          {statusMessage.text && (
            <p className={`mt-4 p-3 rounded ${notificationClass}`}>{statusMessage.text}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8 lg:p-12 text-base md:text-lg lg:text-xl">
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-gray-900 rounded-xl p-6 shadow-lg">
        <div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold break-words">Student Assignment Reminder</h1>
          <p className="mt-3 text-gray-300 text-lg break-words">Welcome back, {user.displayName || user.email}.</p>
        </div>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-semibold transition"
        >
          Sign Out
        </button>
      </header>

      {statusMessage.text && (
        <div className={`mt-6 p-4 rounded-lg ${notificationClass}`}>{statusMessage.text}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
        <div className="bg-blue-800 rounded-3xl shadow-lg p-6">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 break-words">Student Greeting</h2>
          <label className="block mb-1 font-medium break-words">Your Name:</label>
          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border border-white-400 p-3 rounded w-full mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400 text-black"
          />
          <button
            onClick={greet}
            className="bg-blue-500 hover:bg-blue-700 text-white py-3 px-6 rounded w-full font-bold transition mb-4"
          >
            Get Greeting
          </button>
          <p className="text-green-400 font-semibold text-lg break-words">{greeting}</p>
        </div>

        <div className="bg-blue-800 rounded-3xl shadow-lg p-6">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 break-words">Add Assignment</h2>
          <label className="block mb-1 font-medium break-words">Assignment Title:</label>
          <input
            type="text"
            placeholder="Enter assignment title"
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
            className="border border-gray-400 p-3 rounded w-full mb-4 focus:outline-none focus:ring-2 focus:ring-green-400 text-black"
          />
          <label className="block mb-1 font-medium break-words">Subject:</label>
          <input
            type="text"
            placeholder="Enter subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="border border-gray-400 p-3 rounded w-full mb-4 focus:outline-none focus:ring-2 focus:ring-green-400 text-black"
          />
          <label className="block mb-1 font-medium break-words">Deadline:</label>
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="border border-gray-400 p-3 rounded w-full mb-4 focus:outline-none focus:ring-2 focus:ring-green-400 text-black"
          />
          <button
            onClick={createTask}
            className="bg-green-500 hover:bg-green-700 text-white py-3 px-6 rounded w-full font-bold transition"
          >
            Add Task
          </button>
        </div>
      </div>

      <div className="bg-gray-900 rounded-3xl shadow-lg p-6 mt-8 overflow-x-auto">
        <h2 className="text-2xl md:text-3xl font-bold mb-4 break-words">Assignment List</h2>
        <table className="w-full border-collapse min-w-[500px] md:min-w-full text-left break-words">
          <thead>
            <tr className="bg-gray-700 text-gray-200">
              <th className="p-3 break-words">Assignment</th>
              <th className="p-3 break-words">Subject</th>
              <th className="p-3 break-words">Deadline</th>
              <th className="p-3 break-words">Status</th>
              <th className="p-3 break-words">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-3 text-center text-gray-400 break-words">
                  No assignments yet. Add one above!
                </td>
              </tr>
            ) : (
              tasks.map((t) => (
                <tr key={t.id} className="border-b border-gray-700 hover:bg-gray-800">
                  <td className="p-3 break-words">{t.task}</td>
                  <td className="p-3 break-words">{t.subject}</td>
                  <td className="p-3 break-words">{t.deadline}</td>
                  <td
                    className={`p-3 font-semibold break-words ${
                      t.status === "Completed" ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {t.status}
                  </td>
                  <td className="p-3 space-x-2 break-words">
                    <button
                      onClick={() => completeTask(t.id)}
                      className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded font-semibold transition"
                    >
                      Complete
                    </button>
                    <button
                      onClick={() => startEdit(t)}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-4 rounded font-semibold transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteTask(t.id)}
                      className="bg-red-500 hover:bg-red-700 text-white py-2 px-4 rounded font-semibold transition"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {editingId && (
        <div className="bg-gray-800 rounded-3xl shadow-lg p-6 mt-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 break-words">Edit Assignment</h2>
          <label className="block mb-1 font-medium break-words">Assignment Title:</label>
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="border border-gray-400 p-3 rounded w-full mb-4 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-black"
          />
          <label className="block mb-1 font-medium break-words">Subject:</label>
          <input
            type="text"
            value={editSubject}
            onChange={(e) => setEditSubject(e.target.value)}
            className="border border-gray-400 p-3 rounded w-full mb-4 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-black"
          />
          <label className="block mb-1 font-medium break-words">Deadline:</label>
          <input
            type="date"
            value={editDeadline}
            onChange={(e) => setEditDeadline(e.target.value)}
            className="border border-gray-400 p-3 rounded w-full mb-4 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-black"
          />
          <div className="flex flex-col md:flex-row gap-4">
            <button
              onClick={saveEdit}
              className="bg-yellow-500 hover:bg-yellow-600 text-white py-3 px-6 rounded w-full font-bold transition"
            >
              Save Update
            </button>
            <button
              onClick={cancelEdit}
              className="bg-gray-700 hover:bg-gray-600 text-white py-3 px-6 rounded w-full font-bold transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}