interface ToastProps {
  msg: string | null;
  lvl: number;
}

const ToastComponent = ({ msg, lvl }: ToastProps) => {
  const alertTheme = "text-3xl text-red-600";
  const warningTheme = "text-3xl text-orange-600";
  const notificationTheme = "text-3xl text-violet-600";

  const theme = [alertTheme, warningTheme, notificationTheme];

  return (
    <div
      className={
        "fixed top-0 left-1/2 -translate-x-1/2 z-50 p-4 rounded-md bg-violet-300/90 border-violet-600 shadow-lg" +
        theme[lvl]
      }
    >
      {msg}
    </div>
  );
};

export default ToastComponent;
