import { useState } from "react";
import { useSpring } from "@/lib/motion";
import { INK, INK_SOFT, PAPER_TINT } from "./electronModel";

/** Round in-picture +/− button shared by the electron-counting figures. */
export function StepButton({
    x,
    y,
    label,
    onClick,
    disabled,
}: {
    x: number;
    y: number;
    label: string;
    onClick: () => void;
    disabled: boolean;
}) {
    const [hover, setHover] = useState(false);
    const scale = useSpring(hover && !disabled ? 1.12 : 1, { stiffness: 400, damping: 26 });
    return (
        <g
            transform={`translate(${x} ${y}) scale(${scale})`}
            opacity={disabled ? 0.35 : 1}
            style={{ cursor: disabled ? "default" : "pointer" }}
            onPointerEnter={() => setHover(true)}
            onPointerLeave={() => setHover(false)}
            onClick={() => !disabled && onClick()}
        >
            <circle r="16" fill={PAPER_TINT} stroke={INK_SOFT} strokeWidth="1.5" />
            <text y="5" textAnchor="middle" fontSize="16" fill={INK} fontWeight={600}>
                {label}
            </text>
        </g>
    );
}
