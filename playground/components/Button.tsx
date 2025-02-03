export const Button = ({
  children,
  ...props
}: {
  children: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  return (
    <button
      className="p-2 text-white transition-colors bg-orange-500 border rounded-md hover:bg-orange-600"
      {...props}
    >
      {children}
    </button>
  );
};
