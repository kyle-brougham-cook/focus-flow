import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { Task } from "../types/task";
import TaskComponent from "./TaskComponent";
import NewTaskModal from "./NewTaskModal";
import MyIcon from "../assets/cog.svg";
import SettingsModal from "./SettingsModal";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/axios";
import TaskComponentSkeleton from "./TaskComponentSkeleton";

const Dashboard = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdate, setIsUpdate] = useState(false);
  const [isSettingsOpen, setIsSettinsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [taskId, setTaskId] = useState("");
  const { token } = useAuth();


  useEffect(() => {
    fetchTasks();
  }, [isOpen]);

  useEffect(() => {
    if (!token) return;
    fetchTasks();
  }, [token]);

  const fetchTasks = async () => {
    setIsLoading(true);

    const res = await api.get('/tasks/');

    const tasksArray = (await res.data) as Task[];
    setTasks(tasksArray);

    setIsLoading(false);
  };

  return (
    <>
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40 backdrop-blur-md bg-black/20 transition-opacity"
            onClick={() => setIsOpen(false)}
          />
          <NewTaskModal
            update={isUpdate}
            updateSetter={setIsUpdate}
            setShownState={setIsOpen}
            onTaskCreated={fetchTasks}
            taskId={taskId}
            task={tasks.find(t => t.id == taskId)}
          />
        </>
      )}
      <h1 className="mb-5 text-violet-500 text-center text-4xl md:text-7xl font-medium">
        <Link to="/">Focus Flow</Link>
      </h1>

      <div id="settings-outter-div">
        <img
          src={MyIcon}
          alt="Icon"
          className={`z-5 size-9 absolute top-5 right-5 md:top-16 md:right-14 ${
            isSettingsOpen ? "animate-[spin_1s_1]" : ""
          }`}
          onClick={() => setIsSettinsOpen(!isSettingsOpen)}
        />
        {isSettingsOpen && <SettingsModal />}
      </div>

      <div className="scrollbar scrollbar-thumb-violet-500 scrollbar-track-transparent overflow-y-scroll bg-violet-200 h-180 rounded-lg m-6 overflow-x-hidden">
        <button
          onClick={(e) => {
            e.preventDefault();
            setIsOpen(true);
          }}
          className="hover:bg-violet-500 cursor-pointer text-1xl text-white bg-violet-400 rounded pl-2 pr-2 mt-4 mb-4"
        >
          New Task
        </button>
        <div className="items-start justify-items-stretch grid grid-cols-1 gap-6 p-2 xl:grid-cols-4 lg:grid-cols-3 sm:grid-cols-2">
          {isLoading ? (
            Array.from({ length: 9 }).map((_, index) => (
              <TaskComponentSkeleton key={`taskSkeleton${index}`} />
            ))
          ) : (
            tasks.map((task) => (
            <TaskComponent
              key={task.id}
              task={task}
              refreshTasks={fetchTasks}
              toggle={setIsOpen}
              modelSetting={setIsUpdate}
              taskIdSetter={setTaskId}
            />
          ))
        )}

        </div>
      </div>
    </>
  );
};

export default Dashboard;
