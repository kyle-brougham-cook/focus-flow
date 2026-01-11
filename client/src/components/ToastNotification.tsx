interface ToastProps {
  msg: string | null;
  lvl: number;
}

const ToastComponent = ({ msg, lvl }: ToastProps) => {
  const alertTheme = "text-red-600";
  const warningTheme = "text-orange-600";
  const notificationTheme = "text-violet-600";

  const theme = [alertTheme, warningTheme, notificationTheme];

  return (
    <div
      className={
        "flex justify-center items-center absolute z-999 w-94 h-50 left-74 rounded-md bg-violet-200/90 border-violet-600 text-3xl " +
        theme[lvl]
      }
    >
      {msg}
    </div>
  );
};

export default ToastComponent;
