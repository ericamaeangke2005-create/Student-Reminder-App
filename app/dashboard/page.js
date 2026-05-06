"use client";

import { useEffect, useState } from "react";
import { db, storage } from "@/firebase/firebase";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  onSnapshot,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [task, setTask] = useState("");
  const [subject, setSubject] = useState("");
  const [file, setFile] = useState(null);

  // REAL-TIME
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "tasks"), (snap) => {
      setTasks(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  // CREATE + FILE UPLOAD
  const addTask = async () => {
    let fileURL = "";

    if (file) {
      const storageRef = ref(storage, file.name);
      await uploadBytes(storageRef, file);
      fileURL = await getDownloadURL(storageRef);
    }

    await addDoc(collection(db, "tasks"), {
      task,
      subject,
      fileURL,
      status: "Pending",
      createdAt: new Date(),
    });

    setTask("");
    setSubject("");
    setFile(null);

    alert("Task Added!");
  };

  // UPDATE
  const completeTask = async (id) => {
    await updateDoc(doc(db, "tasks", id), {
      status: "Completed",
    });
  };

  // DELETE
  const deleteTask = async (id) => {
    await deleteDoc(doc(db, "tasks", id));
  };

  return (
    <div className="p-6 bg-black text-white min-h-screen">
      <h1 className="text-3xl mb-4">Dashboard</h1>

      {/* FORM */}
      <div className="bg-gray-900 p-4 rounded">
        <input
          value={task}
          onChange={(e) => setTask(e.target.value)}
          placeholder="Task"
          className="block p-2 w-full mb-2 text-black"
        />

        <input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Subject"
          className="block p-2 w-full mb-2 text-black"
        />

        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
          className="mb-2"
        />

        <button onClick={addTask} className="bg-green-500 px-4 py-2">
          Add Task
        </button>
      </div>

      {/* LIST */}
      <div className="mt-6">
        {tasks.map((t) => (
          <div key={t.id} className="bg-gray-800 p-3 mt-2 rounded">
            <p>{t.task}</p>
            <p>{t.subject}</p>
            <p>{t.status}</p>

            {t.fileURL && (
              <a href={t.fileURL} target="_blank" className="text-blue-400">
                View File
              </a>
            )}

            <button onClick={() => completeTask(t.id)} className="bg-blue-500 px-2 ml-2">
              Done
            </button>

            <button onClick={() => deleteTask(t.id)} className="bg-red-500 px-2 ml-2">
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}