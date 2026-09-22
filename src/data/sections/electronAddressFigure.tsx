import { useState } from "react";
import { InteractionHintSequence } from "@/components/atoms";
import { Figure } from "@/components/molecules";
import { useVar, useSetVar } from "@/stores";
import { useSpring } from "@/lib/motion";
import {
    ACCENT,
    ACCENT_SOFT,
    INK,
    INK_SOFT,
    INK_FAINT,
    PAPER_TINT,
    ORBITALS_PER_ROOM,
    roomsOnFloor,
    type RoomLetter,
} from "./electronModel";

// ── The apartment-building metaphor, drawn literally ────────────────────────
// Ground floor = nucleus, floors = shells, rooms = subshells, desks = orbitals.
// A few electrons are already seated, filled from the bottom up.
export type AddressLevel = "floor" | "room" | "desk";
const LEVELS: AddressLevel[] = ["floor", "room", "desk"];
export const asLevel = (value: string): AddressLevel => (LEVELS.includes(value as AddressLevel) ? (value as AddressLevel) : "floor");

const VIEW = { width: 560, height: 340 };
const FLOOR_COUNT = 3;
const FLOOR_HEIGHT = 74;
const FLOOR_GAP = 6;
const GROUND_Y = VIEW.height - 30;
const ROOM_X = 118;
const ROOM_PAD = 7;
const ROOM_GAP = 12;
const DESK = 26;
const DESK_GAP = 4;
const DESK_HEIGHT = 30;

/** Electrons already living in the building: seven, seated from the bottom up. */
const SEATED: Record<string, number> = { "1s-1": 2, "2s-1": 2, "2p-1": 2, "2p-2": 1 };

const floorTop = (n: number) => GROUND_Y - n * (FLOOR_HEIGHT + FLOOR_GAP);
const roomWidth = (room: RoomLetter) => ORBITALS_PER_ROOM[room] * (DESK + DESK_GAP) - DESK_GAP + ROOM_PAD * 2;
const roomX = (n: number, index: number) =>
    ROOM_X + roomsOnFloor(n).slice(0, index).reduce((x, room) => x + roomWidth(room) + ROOM_GAP, 0);

export interface DeskAddress {
    n: number;
    room: RoomLetter;
    desk: number;
}

export const parseDesk = (key: string): DeskAddress => {
    const match = /^([1-3])([spd])-([1-5])$/.exec(key);
    if (!match) return { n: 2, room: "p", desk: 2 };
    return { n: Number(match[1]), room: match[2] as RoomLetter, desk: Number(match[3]) };
};

const deskKey = (n: number, room: RoomLetter, desk: number) => `${n}${room}-${desk}`;

function ElectronDots({ cx, cy, count }: { cx: number; cy: number; count: number }) {
    if (count === 0) return null;
    const offsets = count === 1 ? [0] : [-5, 5];
    return (
        <>
            {offsets.map((dx) => (
                <circle key={dx} cx={cx + dx} cy={cy} r="3.5" fill={ACCENT} />
            ))}
        </>
    );
}

function AddressBuildingDrawing() {
    const setVar = useSetVar();
    const level = asLevel(useVar<string>("addressLevel", "floor"));
    const selected = parseDesk(useVar<string>("addressDesk", "2p-2"));
    const highlight = useVar<string>("addressHighlight", "");
    const [hoverDesk, setHoverDesk] = useState<string | null>(null);

    const showRooms = level !== "floor";
    const showDesks = level === "desk";
    const roomReveal = useSpring(showRooms ? 1 : 0, { stiffness: 220, damping: 24 });
    const deskReveal = useSpring(showDesks ? 1 : 0, { stiffness: 220, damping: 24 });

    const dim = (part: string) => (highlight && highlight !== part ? 0.4 : 1);
    const hoverProps = (part: string) => ({
        onPointerEnter: () => setVar("addressHighlight", part),
        onPointerLeave: () => setVar("addressHighlight", ""),
    });

    const electronsOnFloor = (n: number) =>
        Object.entries(SEATED).reduce((sum, [key, count]) => (parseDesk(key).n === n ? sum + count : sum), 0);
    const electronsInRoom = (n: number, room: RoomLetter) =>
        Object.entries(SEATED).reduce((sum, [key, count]) => {
            const address = parseDesk(key);
            return address.n === n && address.room === room ? sum + count : sum;
        }, 0);

    return (
        <svg viewBox={`0 0 ${VIEW.width} ${VIEW.height}`} className="block w-full select-none">
            {/* Ground floor: the nucleus */}
            <rect x={24} y={GROUND_Y + 2} width={VIEW.width - 48} height={18} rx="4" fill={INK} />
            <text x={VIEW.width / 2} y={GROUND_Y + 15} textAnchor="middle" fontSize="11" fill="#FFFFFF" fontWeight={600}>
                nucleus — the ground floor
            </text>

            {Array.from({ length: FLOOR_COUNT }, (_, index) => {
                const n = index + 1;
                const top = floorTop(n);
                const isSelectedFloor = n === selected.n;
                return (
                    <g key={n} opacity={isSelectedFloor ? dim("floor") : highlight ? 0.4 : 1}>
                        {/* Floor slab */}
                        <line
                            x1={24}
                            y1={top + FLOOR_HEIGHT}
                            x2={VIEW.width - 24}
                            y2={top + FLOOR_HEIGHT}
                            stroke={INK_SOFT}
                            strokeWidth="2"
                            strokeLinecap="round"
                        />
                        {/* Selected floor: soft band that pops on hover of "shell" */}
                        {isSelectedFloor && (
                            <rect
                                x={24}
                                y={top + 4}
                                width={VIEW.width - 48}
                                height={FLOOR_HEIGHT - 4}
                                rx="6"
                                fill={ACCENT}
                                fillOpacity={highlight === "floor" ? 0.16 : 0.06}
                                {...hoverProps("floor")}
                            />
                        )}
                        <g {...(isSelectedFloor ? hoverProps("floor") : {})}>
                            <text x={30} y={top + 28} fontSize="13" fill={INK} fontWeight={isSelectedFloor ? 700 : 500}>
                                {`floor ${n}`}
                            </text>
                            <text x={30} y={top + 46} fontSize="11" fill={INK_SOFT}>
                                {`shell n = ${n}`}
                            </text>
                        </g>

                        {/* Floor-level view: electrons shown loose on the floor */}
                        {!showRooms &&
                            Array.from({ length: electronsOnFloor(n) }, (_, e) => (
                                <circle key={e} cx={ROOM_X + 16 + e * 18} cy={top + FLOOR_HEIGHT - 18} r="5" fill={ACCENT} />
                            ))}
                        {!showRooms && electronsOnFloor(n) === 0 && (
                            <text x={ROOM_X + 8} y={top + FLOOR_HEIGHT - 14} fontSize="11" fill={INK_FAINT}>
                                empty so far
                            </text>
                        )}

                        {/* Rooms */}
                        {showRooms &&
                            roomsOnFloor(n).map((room, roomIndex) => {
                                const x = roomX(n, roomIndex);
                                const width = roomWidth(room);
                                const isSelectedRoom = isSelectedFloor && room === selected.room;
                                const y = top + 10;
                                const height = FLOOR_HEIGHT - 16;
                                return (
                                    <g key={room} opacity={roomReveal} {...(isSelectedRoom ? hoverProps("room") : {})}>
                                        <rect
                                            x={x}
                                            y={y}
                                            width={width}
                                            height={height}
                                            rx="6"
                                            fill={isSelectedRoom ? ACCENT_SOFT : PAPER_TINT}
                                            stroke={isSelectedRoom ? ACCENT : INK_FAINT}
                                            strokeWidth={isSelectedRoom ? (highlight === "room" ? 3.5 : 2.5) : 1.5}
                                        />
                                        <text
                                            x={x + ROOM_PAD}
                                            y={y + 14}
                                            fontSize="11"
                                            fill={INK}
                                            fontWeight={isSelectedRoom ? 700 : 500}
                                        >
                                            {`${n}${room}`}
                                        </text>
                                        {/* Room-level view: electrons loose in the room */}
                                        {!showDesks &&
                                            Array.from({ length: electronsInRoom(n, room) }, (_, e) => (
                                                <circle
                                                    key={e}
                                                    cx={x + ROOM_PAD + 8 + e * 14}
                                                    cy={y + height - 14}
                                                    r="4.5"
                                                    fill={ACCENT}
                                                />
                                            ))}
                                        {/* Desks */}
                                        {showDesks &&
                                            Array.from({ length: ORBITALS_PER_ROOM[room] }, (_, deskIndex) => {
                                                const desk = deskIndex + 1;
                                                const key = deskKey(n, room, desk);
                                                const dx = x + ROOM_PAD + deskIndex * (DESK + DESK_GAP);
                                                const dy = y + height - DESK_HEIGHT - 6;
                                                const isSelectedDesk = isSelectedRoom && desk === selected.desk;
                                                const hovered = hoverDesk === key;
                                                return (
                                                    <g
                                                        key={key}
                                                        opacity={deskReveal}
                                                        style={{ cursor: "pointer" }}
                                                        onClick={() => setVar("addressDesk", key)}
                                                        onPointerEnter={() => {
                                                            setHoverDesk(key);
                                                            if (isSelectedDesk) setVar("addressHighlight", "desk");
                                                        }}
                                                        onPointerLeave={() => {
                                                            setHoverDesk(null);
                                                            if (isSelectedDesk) setVar("addressHighlight", "");
                                                        }}
                                                    >
                                                        <rect
                                                            x={dx}
                                                            y={dy}
                                                            width={DESK}
                                                            height={DESK_HEIGHT}
                                                            rx="4"
                                                            fill={isSelectedDesk || hovered ? ACCENT_SOFT : "#FFFFFF"}
                                                            stroke={isSelectedDesk ? INK : INK_SOFT}
                                                            strokeWidth={isSelectedDesk ? (highlight === "desk" ? 3.5 : 2.5) : 1.2}
                                                        />
                                                        <ElectronDots cx={dx + DESK / 2} cy={dy + DESK_HEIGHT / 2} count={SEATED[key] ?? 0} />
                                                    </g>
                                                );
                                            })}
                                    </g>
                                );
                            })}
                    </g>
                );
            })}

            {/* Address card, top-left (clear of the shell's reset control) */}
            <g fontSize="12" fill={INK} style={{ fontVariantNumeric: "tabular-nums" }}>
                <text x={24} y={22} fontSize="11" fill={INK_SOFT}>
                    the marked electron's address
                </text>
                <text x={24} y={42} fontWeight={600}>
                    <tspan opacity={dim("floor")} fontWeight={highlight === "floor" ? 800 : 600}>{`floor ${selected.n}`}</tspan>
                    {showRooms && <tspan opacity={dim("room")} fontWeight={highlight === "room" ? 800 : 600}>{` → room ${selected.n}${selected.room}`}</tspan>}
                    {showDesks && <tspan opacity={dim("desk")} fontWeight={highlight === "desk" ? 800 : 600}>{` → desk ${selected.desk}`}</tspan>}
                </text>
                <text x={VIEW.width - 24} y={42} textAnchor="end" fontSize="11" fill={INK_FAINT}>
                    {showDesks ? "click any desk to read its address" : `${showRooms ? "desk" : "room"} level not shown yet`}
                </text>
            </g>
        </svg>
    );
}

export function AddressBuildingFigure() {
    const setVar = useSetVar();
    const level = asLevel(useVar<string>("addressLevel", "floor"));
    return (
        <Figure
            id="electrons-live-address-building"
            onReset={() => {
                setVar("addressLevel", "floor");
                setVar("addressDesk", "2p-2");
                setVar("addressHighlight", "");
            }}
            caption="The atom as an apartment building. Seven electrons already live here, seated from the bottom up. Use the level control below to open each floor into its rooms and each room into its desks, then click a desk to read its full address."
        >
            <AddressBuildingDrawing />
            <div className="flex items-center gap-2 px-6 pb-5 text-xs" style={{ color: INK_SOFT }}>
                <span>show the address down to the</span>
                {LEVELS.map((option) => (
                    <button
                        key={option}
                        type="button"
                        onClick={() => setVar("addressLevel", option)}
                        className="rounded-full px-3 py-1 text-xs font-semibold transition-colors"
                        style={{
                            backgroundColor: level === option ? INK : PAPER_TINT,
                            color: level === option ? "#FFFFFF" : INK,
                        }}
                    >
                        {option}
                    </button>
                ))}
            </div>
            <InteractionHintSequence
                hintKey="electrons-live-address-level"
                steps={[{ gesture: "click", label: "Open the floors into rooms, then desks", position: { x: "50%", y: "84%" } }]}
            />
        </Figure>
    );
}
