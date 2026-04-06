import type React from "react";
import { api } from "../api/axios";
import type { Task } from "../types/task";


interface Props {
  tasksSetter: React.Dispatch<React.SetStateAction<Task[]>>
  task: Task;
  taskIdSetter: (value: string) => void;
  toggle: (value: boolean) => void;
  modelSetting: (value: boolean) => void;
}

const doneTask = async (id: string) => {
  const req = await api.patch(`/tasks/${id}/done/`);

  if (req.data.error)
    throw new Error(
      `there was an error in the response from our "done" api point: ${req.statusText}`
    );

  return await req.data
};

const deleteTask = async (id: string) => {
  const taskId = Number(id);

  const req = await api.delete(`/tasks/${taskId}/delete/`);

  if (req.data.error)
    throw new Error(
      `There was an issue in reaching the delete task api: ${req.statusText}`
    );
};

const TaskComponent = ({
  task,
  toggle,
  modelSetting,
  taskIdSetter,
  tasksSetter,
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
      <p className="break-words scrollbar scrollbar-thumb-violet-500 scrollbar-track-transparent h-20 text-1xl text-violet-500 mb-4 overflow-y-scroll overflow-x-hidden p-1">
        {task.description}
      </p>
      <div className="flex flex-col sm:flex-row justify-center gap-2 w-full mt-2 p-2">
        <button
          className="flex-1 border border-violet-600 text-violet-600 rounded hover:bg-violet-100 transition"
          onClick={async () => {
            try {
              const resp = await doneTask(task.id);
              tasksSetter(tasks => tasks.map(taskOld => {

                if (taskOld.id === task.id) {
                  return {...taskOld, ...resp}
                }
                return taskOld
              }
              ))
            } catch (error: any) {
              console.log({"Error": `setting the task to done failed due to error: ${error}`})
            }


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
            try {
              await deleteTask(task.id);
              tasksSetter(tasks => tasks.filter(oldTask => oldTask.id !== task.id))
            } catch (error: any) {
              console.log({"Error": `deleting the task failed due to error: ${error}`})
            }

          }}
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default TaskComponent;
