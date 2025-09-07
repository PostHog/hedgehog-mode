export function Button({
  children,
  onClick,
  disabled,
  active,
  ...props
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
} & React.HTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`Button ${disabled ? "Button--disabled" : ""} ${
        active ? "Button--active" : ""
      }`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}

const Chevron = () => {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
      <g
        id="SVGRepo_tracerCarrier"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></g>
      <g id="SVGRepo_iconCarrier">
        <path
          d="M15 6L9 12L15 18"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        ></path>{" "}
      </g>
    </svg>
  );
};

const Done = () => {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
      <g
        id="SVGRepo_tracerCarrier"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></g>
      <g id="SVGRepo_iconCarrier">
        <path
          d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"
          fill="currentColor"
        ></path>
      </g>
    </svg>
  );
};

export const IconButton = ({
  onClick,
  rotation,
  disabled,
  icon,
}: {
  onClick: () => void;
  rotation?: "90deg" | "180deg" | "270deg";
  disabled?: boolean;
  icon: "chevron" | "done";
}) => {
  return (
    <Button onClick={onClick} disabled={disabled}>
      <div
        className={`IconButton ${rotation ? `IconButton--${rotation}` : ""}`}
      >
        {icon === "chevron" ? <Chevron /> : <Done />}
      </div>
    </Button>
  );
};
