const TaskComponentSkeleton = () => {
     return (
    <div
      className={`shadow-md bg-gray-50 ring-1 ring-violet-300 rounded-xl transition-shadow w-265px h-178px max-w-[265px] flex flex-col`}
    >
      <h3
        className={`pl-1 pr-1`}
      >
      </h3>
      <p className="h-20 mb-4 p-1">
      </p>
      <div className="flex flex-col sm:flex-row justify-center gap-2 w-full mt-2 p-2">
        <button
          className="h-[24px] w-[75.672px] flex-1 border border-violet-600 rounded transition"
         >
        </button>
        <button
          className="h-[24px] w-[75.672px] flex-1 border border-violet-600 rounded transition"
         >
        </button>
        <button 
           className="h-[24px] w-[75.672px] flex-1 border border-violet-600 rounded transition"
          >
        </button>
      </div>
    </div>
  );
}


export default TaskComponentSkeleton;