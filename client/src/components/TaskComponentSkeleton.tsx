const TaskComponentSkeleton = () => {
     return (
    <div
      className={`bg-violet-400/20 max-w-sm w-full mx-auto shadow-md ring-1 ring-violet-300 rounded-xl transition-shadow h-[178px] flex flex-col`}
    >
      <div
        className="self-center animate-pulse bg-white w-[60%] h-[30px] mt-4 rounded"
      >
      </div>
      <div className="self-center animate-pulse bg-white/50 w-[60%] h-[60px] mt-4 rounded">
      </div>
    </div>
  );
}


export default TaskComponentSkeleton;
