"use client";

import { MouseEventHandler, ReactNode } from "react";

export function NavButton({
    icon,
    label,
    onClick,
    children,
}: {
    icon: string;
    label: string;
    onClick?: MouseEventHandler<HTMLButtonElement>;
    children?: ReactNode;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            // why have I not found this blur feature styling earlier
            className="
        w-full flex flex-col items-center justify-center
        gap-1 p-2 rounded-md
        text-gray-700 hover:bg-gray-100 transition
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary
      "
        >
            <i className={`${icon} text-xl leading-none`} />
            <span className="text-[11px]">{label}</span>
            {children}
        </button>
    );
}
