import React from "react";

interface WeaponProps {
  className?: string;
  icon?: string;
}

export function Weapon({ className = "", icon }: WeaponProps) {
  return (
    <div>
      <div
        className={`GameConsole-ControlPanel-weapons-weapon pixel-corners-gray-2 ${className}`}
      >
        <div className="GameConsole-ControlPanel-weapons-weapon-icon">
          {icon && <img src={icon} alt="Weapon icon" />}
        </div>
      </div>
    </div>
  );
}
