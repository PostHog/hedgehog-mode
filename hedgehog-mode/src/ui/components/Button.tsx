export function Button({
  children,
  onClick,
  disabled,
  active,
  className = "",
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
      } ${className}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}

export const IconChevron: React.FC<React.HTMLAttributes<SVGSVGElement>> = (
  props
) => {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
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

export const IconDone: React.FC<React.HTMLAttributes<SVGSVGElement>> = (
  props
) => {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
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

export const IconX: React.FC<React.HTMLAttributes<SVGSVGElement>> = (props) => {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
      <g
        id="SVGRepo_tracerCarrier"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></g>
      <g id="SVGRepo_iconCarrier">
        <path
          d="M19 5L5 19"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        ></path>
        <path
          d="M5 5L19 19"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
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
  className = "",
}: {
  onClick: () => void;
  rotation?: "90deg" | "180deg" | "270deg";
  disabled?: boolean;
  icon: "chevron" | "done" | "x";
  className?: string;
}) => {
  return (
    <Button onClick={onClick} disabled={disabled} className={className}>
      <div
        className={`IconButton ${rotation ? `IconButton--${rotation}` : ""}`}
      >
        {icon === "chevron" ? (
          <IconChevron />
        ) : icon === "done" ? (
          <IconDone />
        ) : (
          <IconX />
        )}
      </div>
    </Button>
  );
};
