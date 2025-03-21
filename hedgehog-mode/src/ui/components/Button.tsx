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
      <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
      <g
        id="SVGRepo_tracerCarrier"
        stroke-linecap="round"
        stroke-linejoin="round"
      ></g>
      <g id="SVGRepo_iconCarrier">
        {" "}
        <path
          d="M15 6L9 12L15 18"
          stroke="#000000"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
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
