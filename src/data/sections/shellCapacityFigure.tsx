import { useEffect, useRef, useState } from "react";
import { InteractionHintSequence } from "@/components/atoms";
import { Figure, FigureSlider } from "@/components/molecules";
import { useVar, useSetVar } from "@/stores";
import { clamp, useSpring } from "@/lib/motion";
import { getVariableInfo, numberPropsFromDefinition } from "../variables";
import { INK, INK_SOFT, INK_FAINT, N_COLOR, shellCapacity, shellColor } from "./electronModel";

// ── Why 2n²: two n × n squares of electrons, beside the capacities as bars ──
const VIEW = { width: 560, height: 340 };
const MAX_N = 5;
const CELL = 27;
const DOT = 8;
const SQUARE_ORIGIN = { x: 44, y: 214 }; // bottom-left corner of the first square
const SQUARE_GAP = 34;                    // room for the "×2" between the squares
const BAR_X = 380;
const BAR_WIDTH = 26;
const BAR_GAP = 8;
const BAR_BASE = 244;
const BAR_MAX_HEIGHT = 170;

const fmt = (value: number) => value.toFixed(0);

/** Keeps the derived store value 2n² in step with n for `\val{}` in the formula. */
function useCapacitySync(n: number) {
    const setVar = useSetVar();
    useEffect(() => {
        setVar("shellCapacityValue", shellCapacity(n));
    }, [n, setVar]);
}

function DotSquare({ n, originX, color, popped }: { n: number; originX: number; color: string; popped: number }) {
    const side = n * CELL;
    return (
        <g>
            {/* the square's outline is the meaning: n along each side */}
            <rect
                x={originX}
                y={SQUARE_ORIGIN.y - side}
                width={side}
                height={side}
                rx="4"
                fill={color}
                fillOpacity={0.1 + popped * 0.06}
                stroke={color}
                strokeWidth={1.5 + popped}
            />
            {Array.from({ length: n * n }, (_, i) => {
                const col = i % n;
                const row = Math.floor(i / n);
                return (
                    <circle
                        key={i}
                        cx={originX + CELL / 2 + col * CELL}
                        cy={SQUARE_ORIGIN.y - CELL / 2 - row * CELL}
                        r={DOT / 2}
                        fill={color}
                    />
                );
            })}
        </g>
    );
}

function ShellCapacityDrawing() {
    const setVar = useSetVar();
    const n = clamp(Math.round(useVar<number>("shellNumber", 3)), 1, MAX_N);
    useCapacitySync(n);
    const color = shellColor(n);
    const capacity = shellCapacity(n);
    const [dragging, setDragging] = useState(false);
    const [hovered, setHovered] = useState(false);
    const svgRef = useRef<SVGSVGElement>(null);
    const handleScale = useSpring(dragging || hovered ? 1.15 : 1, { stiffness: 400, damping: 26 });
    const popped = useSpring(dragging ? 1 : 0, { stiffness: 300, damping: 24 });

    const side = n * CELL;
    const secondOriginX = SQUARE_ORIGIN.x + MAX_N * CELL + SQUARE_GAP;
    const handle = { x: secondOriginX + side, y: SQUARE_ORIGIN.y - side };

    // Dragging the corner of the second square resizes n: the pointer's
    // distance from that square's origin, in cells, is n (1:1 tracking).
    const handlePointerMove = (event: React.PointerEvent<SVGCircleElement>) => {
        if (!dragging || !svgRef.current) return;
        const rect = svgRef.current.getBoundingClientRect();
        const px = ((event.clientX - rect.left) / rect.width) * VIEW.width;
        const py = ((event.clientY - rect.top) / rect.height) * VIEW.height;
        const cellsAcross = (px - secondOriginX) / CELL;
        const cellsUp = (SQUARE_ORIGIN.y - py) / CELL;
        setVar("shellNumber", clamp(Math.round((cellsAcross + cellsUp) / 2), 1, MAX_N));
    };

    return (
        <svg ref={svgRef} viewBox={`0 0 ${VIEW.width} ${VIEW.height}`} className="block w-full select-none">
            <defs>
                <filter id="shell-capacity-handle-shadow" x="-50%" y="-50%" width="200%" height="200%">
                    <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#0F172A" floodOpacity="0.25" />
                </filter>
            </defs>

            {/* Two squares, n electrons along each side */}
            <DotSquare n={n} originX={SQUARE_ORIGIN.x} color={color} popped={popped} />
            <text
                x={SQUARE_ORIGIN.x + MAX_N * CELL + SQUARE_GAP / 2}
                y={SQUARE_ORIGIN.y - side / 2 + 5}
                textAnchor="middle"
                fontSize="14"
                fill={INK_SOFT}
            >
                and
            </text>
            <DotSquare n={n} originX={secondOriginX} color={color} popped={popped} />

            {/* n labelled along the bottom and the side, in n's colour */}
            <line x1={SQUARE_ORIGIN.x} y1={SQUARE_ORIGIN.y + 10} x2={SQUARE_ORIGIN.x + side} y2={SQUARE_ORIGIN.y + 10} stroke={N_COLOR} strokeWidth="2.5" strokeLinecap="round" />
            <text x={SQUARE_ORIGIN.x + side / 2} y={SQUARE_ORIGIN.y + 27} textAnchor="middle" fontSize="13" fill={N_COLOR} fontWeight={700} style={{ fontVariantNumeric: "tabular-nums" }}>
                {`n = ${fmt(n)}`}
            </text>
            <line x1={SQUARE_ORIGIN.x - 10} y1={SQUARE_ORIGIN.y} x2={SQUARE_ORIGIN.x - 10} y2={SQUARE_ORIGIN.y - side} stroke={N_COLOR} strokeWidth="2.5" strokeLinecap="round" />
            <text x={SQUARE_ORIGIN.x - 16} y={SQUARE_ORIGIN.y - side / 2 + 4} textAnchor="end" fontSize="13" fill={N_COLOR} fontWeight={700} style={{ fontVariantNumeric: "tabular-nums" }}>
                {fmt(n)}
            </text>

            {/* Live arithmetic under the squares, colours matching the formula */}
            <text x={SQUARE_ORIGIN.x} y={SQUARE_ORIGIN.y + 62} fontSize="15" fill={INK} style={{ fontVariantNumeric: "tabular-nums" }}>
                <tspan>2 squares of </tspan>
                <tspan fill={N_COLOR} fontWeight={700}>{`${fmt(n)} × ${fmt(n)}`}</tspan>
                <tspan> = 2 × </tspan>
                <tspan fill={N_COLOR} fontWeight={700}>{`${fmt(n)}²`}</tspan>
                <tspan> = </tspan>
                <tspan fill={N_COLOR} fontWeight={700}>{`${fmt(capacity)} electrons`}</tspan>
            </text>
            <text x={SQUARE_ORIGIN.x} y={SQUARE_ORIGIN.y + 84} fontSize="11" fill={INK_FAINT}>
                drag the corner of the right-hand square to change n
            </text>

            {/* Draggable corner handle on the second square */}
            <g transform={`translate(${handle.x} ${handle.y}) scale(${handleScale})`}>
                <circle r="11" fill={N_COLOR} filter="url(#shell-capacity-handle-shadow)" />
            </g>
            <circle
                cx={handle.x}
                cy={handle.y}
                r="22"
                fill="transparent"
                style={{ cursor: dragging ? "grabbing" : "grab", touchAction: "none" }}
                onPointerDown={(event) => {
                    event.currentTarget.setPointerCapture(event.pointerId);
                    setDragging(true);
                }}
                onPointerMove={handlePointerMove}
                onPointerUp={() => setDragging(false)}
                onPointerCancel={() => setDragging(false)}
                onPointerEnter={() => setHovered(true)}
                onPointerLeave={() => setHovered(false)}
            />

            {/* Capacity bars for every shell; click one to jump to that n */}
            <text x={BAR_X} y={44} fontSize="11" fill={INK_SOFT}>
                how the capacity grows
            </text>
            {Array.from({ length: MAX_N }, (_, i) => {
                const k = i + 1;
                const height = (shellCapacity(k) / shellCapacity(MAX_N)) * BAR_MAX_HEIGHT;
                const x = BAR_X + i * (BAR_WIDTH + BAR_GAP);
                const current = k === n;
                return (
                    <g key={k} style={{ cursor: "pointer" }} onClick={() => setVar("shellNumber", k)} opacity={current ? 1 : 0.4}>
                        <rect x={x} y={BAR_BASE - height} width={BAR_WIDTH} height={height} rx="4" fill={shellColor(k)} />
                        <text x={x + BAR_WIDTH / 2} y={BAR_BASE - height - 6} textAnchor="middle" fontSize="12" fill={current ? N_COLOR : INK} fontWeight={current ? 700 : 500} style={{ fontVariantNumeric: "tabular-nums" }}>
                            {fmt(shellCapacity(k))}
                        </text>
                        <text x={x + BAR_WIDTH / 2} y={BAR_BASE + 16} textAnchor="middle" fontSize="11" fill={current ? N_COLOR : INK_SOFT} fontWeight={current ? 700 : 500}>
                            {`n=${k}`}
                        </text>
                        {/* wide hit area including the label */}
                        <rect x={x - BAR_GAP / 2} y={BAR_BASE - BAR_MAX_HEIGHT - 20} width={BAR_WIDTH + BAR_GAP} height={BAR_MAX_HEIGHT + 44} fill="transparent" />
                    </g>
                );
            })}
            <line x1={BAR_X - 4} y1={BAR_BASE} x2={BAR_X + MAX_N * (BAR_WIDTH + BAR_GAP) - BAR_GAP + 4} y2={BAR_BASE} stroke={INK_SOFT} strokeWidth="1.5" strokeLinecap="round" />
        </svg>
    );
}

export function ShellCapacityFigure() {
    const setVar = useSetVar();
    return (
        <Figure
            id="shells-capacity-squares"
            onReset={() => setVar("shellNumber", 3)}
            caption="A shell's capacity is two squares of n × n electrons. Drag the corner to change n and watch the count jump: each extra row adds a whole new row and column, so the total grows with n squared."
        >
            <ShellCapacityDrawing />
            <div className="px-6 pb-5">
                <FigureSlider
                    varName="shellNumber"
                    label="Shell number n"
                    {...numberPropsFromDefinition(getVariableInfo("shellNumber"))}
                    formatValue={fmt}
                />
            </div>
            <InteractionHintSequence
                hintKey="shells-capacity-corner-drag"
                steps={[
                    {
                        gesture: "drag",
                        label: "Drag the blue corner to change n",
                        position: { x: "46%", y: "30%" },
                        dragPath: { type: "line", startOffset: { x: -14, y: 14 }, endOffset: { x: 14, y: -14 } },
                    },
                ]}
            />
        </Figure>
    );
}
