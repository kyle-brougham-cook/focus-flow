import type React from "react";
import { api } from "../api/axios";
import { useEffect, useState } from "react";
import type { Task } from "../types/task";

const sendNewTask = async (form: FormData ) => {
  const payload = Object.fromEntries(form.entries());

  const response = await api.post('/tasks/', payload);

  if (response.data.error) {
    throw Error(`response was not okay: ${response.statusText}`);
  }
  return await response.data;
};

const sendUpdatedTask = async (form: FormData, id: string ) => {

  const payload = Object.fromEntries(form.entries());

  const response = await api.patch(`/tasks/${id}/`, payload);

  if (response.data.error)
    throw new Error(
      `response was not okay - sendUpdatedTask:${response.statusText}`
    );

  return await response.data
};

const NewTaskModal = ({
  update,
  taskId,
  task,
  setShownState,
  updateSetter,
  taskSetter,
}: {
  setShownState: React.Dispatch<React.SetStateAction<boolean>>;
  updateSetter: React.Dispatch<React.SetStateAction<boolean>>;
  taskSetter: React.Dispatch<React.SetStateAction<Task[]>>;
  update: boolean;
  taskId?: string;
  task?: Task;
}) => {
  const [isSubmiting, setIsSubmiting] = useState<boolean>(false);
  const [nameInputValue, setNameInputValue] = useState<string>("");
  const [descriptionInputValue, setDescriptionInputValue] = useState<string>("");
  const title = update ? "Edit Task" : "Create A New Task";

  useEffect(() => {
    if (update) {
      setNameInputValue(task!.name || "");
      setDescriptionInputValue(task!.description || "");
    }
  }, [update, task?.name, task?.description])

  return (
    <div
      key="newTaskCreator"
      className="flex-row bg-violet-200 h-120 m-auto rounded-lg fixed inset-0 z-50 w-100"
    >
      <h3 className="font-bold text-3xl text-violet-600">{title}</h3>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setIsSubmiting(true);
          try {
            if (update) {
              const newTask = await sendUpdatedTask(new FormData(e.currentTarget), taskId!)

              taskSetter(tasks => tasks.map(task => {
                if (task.id === taskId) {
                  return {...task, ...newTask}
                }
                return task;
              }))


            } else if (!update) {
              const newTask = await sendNewTask(new FormData(e.currentTarget))
              taskSetter(prev => [...prev, newTask])
            }

            setShownState(false);
          } finally {
            setIsSubmiting(false);
            updateSetter(false);
          }
        }}
        className="grid gap-4 justify-center"
      >
        <label className="text-2xl text-violet-500" htmlFor="taskName">
          Task Name
        </label>

        <input
          className="bg-white rounded h-8 p-1 text-violet-500"
          name="name"
          type="text"
          value={nameInputValue}
          onChange={(e) => setNameInputValue(e.target.value)}
          id="taskName"
          maxLength={60}
        />

        <label className="text-2xl text-violet-500" htmlFor="taskDescription">
          Task Description
        </label>

        <textarea
          className="bg-white rounded h-40 w-80 p-1 resize-none overflowY-auto text-violet-500"
          name="description"
          value={descriptionInputValue}
          onChange={(e) => setDescriptionInputValue(e.target.value)}
          id="taskDescription"
          maxLength={500}
        />

        <div className="flex justify-center gap-2 mt-18">
          <button
            className="text-2xl text-violet-500 border rounded p-1 hover:text-violet-700"
            type="submit"
            disabled={isSubmiting}
          >
            {update ? "Confirm" : "Create"}
          </button>
          <button
            className="text-2xl text-violet-500 border rounded p-1 hover:text-violet-700"
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setShownState((prev) => !prev);
              updateSetter(false);
            }}
          >
            Close
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewTaskModal;
