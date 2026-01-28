import { api } from "../api/axios";
import type { Task } from "../types/task";


interface Props {
  task: Task;
  taskIdSetter: (value: string) => void;
  toggle: (value: boolean) => void;
  modelSetting: (value: boolean) => void;
  refreshTasks: () => void;
}

const doneTask = async (id: string, bool: boolean) => {
  const req = await api.patch('/task/done/', {
    id: id,
    bool: bool,
  });

  if (req.data.error)
    throw new Error(
      `there was an error in the response from our "done" api point: ${req.statusText}`
    );
};

const deleteTask = async (id: string) => {
  const taskId = Number(id);

  const req = await api.delete(`/task/delete/${taskId}`);

  if (req.data.error)
    throw new Error(
      `There was an issue in reaching the delete task api: ${req.statusText}`
    );
};

const TaskComponent = ({
  task,
  refreshTasks,
  toggle,
  modelSetting,
  taskIdSetter,
}: Props) => {
  return (
    <div
      key={task.id}
      className={`shadow-md ${
        task.done ? "line-through" : ""
      } bg-gray-50 ring-1 ring-violet-300 rounded-xl hover:shadow-xl transition-shadow w-full max-w-sm mx-auto flex flex-col`}
    >
      <h3
        className={`text-2xl font-bold text-violet-700 truncate pl-1 pr-1 hover:`}
      >
        {task.name}
      </h3>
      <p className="break-words scrollbar scrollbar-thumb-violet-500 scrollbar-track-transparent h-20 text-1xl text-gray-600 mb-4 overflow-y-scroll overflow-x-hidden p-1">
        {task.description}
      </p>
      <div className="flex flex-col sm:flex-row justify-center gap-2 w-full mt-2 p-2">
        <button
          className="flex-1 border border-violet-600 text-violet-600 rounded hover:bg-violet-100 transition"
          onClick={async () => {
            await doneTask(task.id, task.done);
            refreshTasks();
          }}
        >
          Done
        </button>
        <button
          className="flex-1 border border-violet-600 text-violet-600 rounded hover:bg-violet-100 transition"
          onClick={() => {
            modelSetting(true);
            taskIdSetter(task.id);
            toggle(true);
          }}
        >
          Edit
        </button>
        <button
          className="flex-1 border border-violet-600 text-violet-600 rounded hover:bg-violet-100 transition"
          onClick={async () => {
            await deleteTask(task.id);
            refreshTasks();
          }}
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default TaskComponent;
