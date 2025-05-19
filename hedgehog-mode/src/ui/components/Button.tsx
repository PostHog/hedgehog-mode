export function Button({
  children,
  onClick,
  disabled,
  active,
  className,
  ...props
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
  className?: string;
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

export const ArrowButton = ({
  onClick,
  direction,
  disabled,
}: {
  onClick: () => void;
  direction: "left" | "right";
  disabled?: boolean;
}) => {
  return (
    <Button onClick={onClick} disabled={disabled}>
      <div
        className={`ArrowIcon ${
          direction === "right" ? "ArrowIcon--right" : ""
        }`}
      >
        <Chevron />
      </div>
    </Button>
  );
};
