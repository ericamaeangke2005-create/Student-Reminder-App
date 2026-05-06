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
  where,
  serverTimestamp,
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
  
  // Edit State
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editSubject, setEditSubject] = useState("");
  const [editDeadline, setEditDeadline] = useState("");

  useEffect(() => {
    if (!user) return;

    // NOTE: If you still see "Read failed", click the link in the 
    // browser console to auto-create the composite index.
    const tasksQuery = query(
      collection(db, "tasks"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc") 
    );

    const unsubscribe = onSnapshot(
      tasksQuery,
      (snapshot) => {
        setTasks(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      },
      (error) => {
        console.error("Firestore Error:", error);
        setStatusMessage({ 
            text: `Index needed: Please check console or wait for build.`, 
            type: "error" 
        });
      }
    );

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!statusMessage.text) return;
    const timeout = setTimeout(() => setStatusMessage({ text: "", type: "info" }), 5000);
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
      showNotification(`Login failed: ${error.message}`, "error");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setTasks([]);
      showNotification("Signed out successfully.", "success");
    } catch (error) {
      showNotification(`Sign out failed: ${error.message}`, "error");
    }
  };

  const createTask = async () => {
    if (!taskTitle || !subject || !deadline) {
      showNotification("Please fill all fields.", "error");
      return;
    }

    try {
      await addDoc(collection(db, "tasks"), {
        userId: user.uid,
        userEmail: user.email,
        task: taskTitle,
        subject,
        deadline,
        status: "Pending",
        createdAt: serverTimestamp(), // Use serverTimestamp for consistency
      });
      setTaskTitle("");
      setSubject("");
      setDeadline("");
      showNotification("Task added!", "success");
    } catch (error) {
      showNotification(`Error: ${error.message}`, "error");
    }
  };

  const completeTask = async (taskId) => {
    try {
      await updateDoc(doc(db, "tasks", taskId), { status: "Completed" });
      showNotification("Task completed!", "success");
    } catch (error) {
      showNotification("Update failed.", "error");
    }
  };

  const startEdit = (task) => {
    setEditingId(task.id);
    setEditTitle(task.task);
    setEditSubject(task.subject);
    setEditDeadline(task.deadline);
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  const saveEdit = async () => {
    if (!editTitle || !editSubject || !editDeadline) return;

    try {
      await updateDoc(doc(db, "tasks", editingId), {
        task: editTitle,
        subject: editSubject,
        deadline: editDeadline,
      });
      setEditingId(null);
      showNotification("Task updated!", "success");
    } catch (error) {
      showNotification("Edit failed.", "error");
    }
  };

  const deleteTask = async (taskId) => {
    if(window.confirm("Delete this task?")) {
        try {
          await deleteDoc(doc(db, "tasks", taskId));
          showNotification("Task removed.", "success");
        } catch (error) {
          showNotification("Delete failed.", "error");
        }
    }
  };

  const notificationClass =
    statusMessage.type === "success" ? "bg-green-600" :
    statusMessage.type === "error" ? "bg-red-600" : "bg-blue-600";

  if (loading) return <div className="flex items-center justify-center h-screen bg-black text-white">Loading...</div>;

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-gray-900 rounded-xl p-8 shadow-2xl text-center border border-gray-800">
          <h1 className="text-3xl font-bold mb-6">Student Reminder</h1>
          <button onClick={handleLogin} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-bold transition">
            Sign in with Google
          </button>
          {statusMessage.text && <p className={`mt-4 p-3 rounded-lg ${notificationClass}`}>{statusMessage.text}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-10">
      <header className="flex flex-col md:flex-row items-center justify-between gap-4 bg-gray-900 rounded-2xl p-6 mb-8 border border-gray-800">
        <div>
          <h1 className="text-2xl md:text-4xl font-bold text-blue-400">Assignment Tracker</h1>
          <p className="text-gray-400">Active User: {user.email}</p>
        </div>
        <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded-lg font-bold transition">Sign Out</button>
      </header>

      {statusMessage.text && (
        <div className={`mb-6 p-4 rounded-xl text-center font-bold animate-pulse ${notificationClass}`}>
          {statusMessage.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Add Section */}
        <div className="lg:col-span-1 bg-gray-900 p-6 rounded-3xl border border-gray-800 h-fit">
          <h2 className="text-xl font-bold mb-4">Add Assignment</h2>
          <input type="text" placeholder="Task Title" value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} className="w-full p-3 mb-3 rounded bg-gray-800 border-none text-white focus:ring-2 focus:ring-blue-500" />
          <input type="text" placeholder="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full p-3 mb-3 rounded bg-gray-800 border-none text-white focus:ring-2 focus:ring-blue-500" />
          <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="w-full p-3 mb-4 rounded bg-gray-800 border-none text-white focus:ring-2 focus:ring-blue-500" />
          <button onClick={createTask} className="w-full bg-green-600 hover:bg-green-700 py-3 rounded-xl font-bold transition">Add to List</button>
        </div>

        {/* List Section */}
        <div className="lg:col-span-2 bg-gray-900 p-6 rounded-3xl border border-gray-800 overflow-hidden">
          <h2 className="text-xl font-bold mb-4">Current Tasks</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-800 text-gray-500">
                  <th className="pb-3">Task</th>
                  <th className="pb-3">Subject</th>
                  <th className="pb-3">Deadline</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((t) => (
                  <tr key={t.id} className="border-b border-gray-800 hover:bg-gray-850 transition">
                    <td className="py-4 font-medium">{t.task}</td>
                    <td className="py-4 text-gray-400">{t.subject}</td>
                    <td className="py-4 text-gray-400">{t.deadline}</td>
                    <td className="py-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${t.status === "Completed" ? "bg-green-900 text-green-300" : "bg-yellow-900 text-yellow-300"}`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="py-4 text-right space-x-2">
                      {t.status !== "Completed" && (
                        <button onClick={() => completeTask(t.id)} className="text-blue-400 hover:text-blue-300 text-sm">Done</button>
                      )}
                      <button onClick={() => startEdit(t)} className="text-yellow-400 hover:text-yellow-300 text-sm">Edit</button>
                      <button onClick={() => deleteTask(t.id)} className="text-red-400 hover:text-red-300 text-sm">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Edit Modal / Section */}
      {editingId && (
        <div className="mt-8 p-6 bg-gray-900 rounded-3xl border border-yellow-600/30">
          <h2 className="text-xl font-bold mb-4 text-yellow-500">Edit Assignment</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="p-3 rounded bg-gray-800" />
            <input type="text" value={editSubject} onChange={(e) => setEditSubject(e.target.value)} className="p-3 rounded bg-gray-800" />
            <input type="date" value={editDeadline} onChange={(e) => setEditDeadline(e.target.value)} className="p-3 rounded bg-gray-800" />
          </div>
          <div className="mt-4 flex gap-3">
            <button onClick={saveEdit} className="bg-yellow-600 px-6 py-2 rounded-lg font-bold">Save Changes</button>
            <button onClick={() => setEditingId(null)} className="bg-gray-700 px-6 py-2 rounded-lg">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}