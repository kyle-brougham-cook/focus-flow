import type React from "react";
import { api } from "../api/axios";

const sendNewTask = async (form: FormData) => {
  const payload = Object.fromEntries(form.entries());

  const response = await api.post('/tasks/', payload);

  if (response.data.error) {
    throw Error(`response was not okay: ${response.statusText}`);
  }
  return console.log(await response.data);
};

const sendUpdatedTask = async (form: FormData, id: string) => {

  const payload = Object.fromEntries(form.entries());

  const response = await api.patch(`/tasks/${id}/`, payload);

  if (response.data.error)
    throw new Error(
      `response was not okay - sendUpdatedTask:${response.statusText}`
    );
  return console.log(await response.data);
};

const NewTaskModal = ({
  update,
  taskId,
  setShownState,
  onTaskCreated,
  updateSetter,
}: {
  setShownState: React.Dispatch<React.SetStateAction<boolean>>;
  onTaskCreated: () => void;
  updateSetter: React.Dispatch<React.SetStateAction<boolean>>;
  update: boolean;
  taskId?: string;
}) => {
  const title = update ? "Edit Task" : "Create A New Task";

  return (
    <div
      key="newTaskCreator"
      className="flex-row bg-violet-200 h-120 m-auto rounded-lg fixed inset-0 z-50 w-100"
    >
      <h3 className="font-bold text-3xl text-violet-600">{title}</h3>
      <form
        onSubmit={async (e) => {
          e.preventDefault();

          await (update
            ? sendUpdatedTask(new FormData(e.currentTarget), taskId!)
            : sendNewTask(new FormData(e.currentTarget)));
          if (update) updateSetter(false);
          onTaskCreated();
          setShownState(false);
        }}
        className="grid gap-4 justify-center"
      >
        <label className="text-2xl text-violet-500" htmlFor="taskName">
          Task Name
        </label>

        <input
          className="bg-white rounded h-8 p-1"
          name="name"
          type="text"
          id="taskName"
          maxLength={60}
        />

        <label className="text-2xl text-violet-500" htmlFor="taskDescription">
          Task Description
        </label>

        <textarea
          className="bg-white rounded h-40 w-80 p-1 resize-none overflowY-auto"
          name="description"
          id="taskDescription"
          maxLength={500}
        />

        <div className="flex justify-center gap-2 mt-18">
          <button
            className="text-2xl text-violet-500 border rounded p-1 hover:text-violet-700"
            type="submit"
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
