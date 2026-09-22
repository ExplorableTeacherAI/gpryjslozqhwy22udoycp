import { useState } from "react";
import { InteractionHintSequence } from "@/components/atoms";
import { Figure } from "@/components/molecules";
import { useVar, useSetVar } from "@/stores";
import { useSpring } from "@/lib/motion";
import {
    ACCENT,
    INK,
    INK_SOFT,
    INK_FAINT,
    PAPER_TINT,
    N_COLOR,
    ORBITALS_PER_ROOM,
    roomColor,
    roomColorSoft,
    roomsOnFloor,
    type RoomLetter,
} from "./electronModel";

// ── The apartment-building metaphor, drawn literally ────────────────────────
// Ground floor = nucleus, floors = shells, rooms = subshells, desks = orbitals.
// A few electrons are already seated, filled from the bottom up.
export type AddressLevel = "floor" | "room" | "desk";
const LEVELS: AddressLevel[] = ["floor", "room", "desk"];
export const asLevel = (value: string): AddressLevel => (LEVELS.includes(value as AddressLevel) ? (value as AddressLevel) : "floor");

const VIEW = { width: 560, height: 420 };
const FLOOR_COUNT = 3;
const FLOOR_HEIGHT = 80;
const BUILDING = { x: 104, width: 360 }; // outer walls
const WALL_RIGHT = BUILDING.x + BUILDING.width;
const LOBBY_TOP = VIEW.height - 96;       // ground floor ceiling
const GROUND_LINE = VIEW.height - 52;     // pavement
const ROOF_APEX = 46;
const STAIRS_WIDTH = 26;
const ROOM_X = BUILDING.x + STAIRS_WIDTH + 12;
const ROOM_PAD = 6;
const ROOM_GAP = 10;
const DESK = 26;
const DESK_GAP = 4;

/** Electrons already living in the building: seven, seated from the bottom up. */
const SEATED: Record<string, number> = { "1s-1": 2, "2s-1": 2, "2p-1": 2, "2p-2": 1 };

const floorTop = (n: number) => LOBBY_TOP - n * FLOOR_HEIGHT;
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

/** A small person standing (or sitting) with feet at (x, y). */
function Electron({ x, y, seated = false }: { x: number; y: number; seated?: boolean }) {
    const bodyHeight = seated ? 9 : 12;
    return (
        <g>
            <circle cx={x} cy={y - bodyHeight - 5} r="3.6" fill={ACCENT} />
            <rect x={x - 4} y={y - bodyHeight} width="8" height={bodyHeight} rx="3.5" fill={ACCENT} />
        </g>
    );
}

/** A desk with a chair; `count` electrons sit at it. */
function Desk({ x, floorY, count, selected, popped, hovered, onClick, onEnter, onLeave }: {
    x: number; floorY: number; count: number; selected: boolean; popped: boolean; hovered: boolean;
    onClick: () => void; onEnter: () => void; onLeave: () => void;
}) {
    const topY = floorY - 22;
    return (
        <g style={{ cursor: "pointer" }} onClick={onClick} onPointerEnter={onEnter} onPointerLeave={onLeave}>
            {/* highlight pad under the selected / hovered desk */}
            {selected && popped && (
                <rect x={x - 6} y={floorY - 48} width={DESK + 12} height={52} rx="7" fill="none" stroke={ACCENT} strokeWidth="8" strokeOpacity="0.28" />
            )}
            {(selected || hovered) && (
                <rect x={x - 2} y={floorY - 44} width={DESK + 4} height={44} rx="5" fill={ACCENT} fillOpacity={popped ? 0.4 : selected ? 0.22 : 0.1} stroke={selected ? INK : "none"} strokeWidth={popped ? 2.5 : 1.5} />
            )}
            {/* chair: a small back and seat behind the desk */}
            <line x1={x + DESK - 1} y1={topY - 16} x2={x + DESK - 1} y2={topY - 3} stroke={INK_SOFT} strokeWidth="2" strokeLinecap="round" />
            <line x1={x + DESK - 10} y1={topY - 3} x2={x + DESK - 1} y2={topY - 3} stroke={INK_SOFT} strokeWidth="2" strokeLinecap="round" />
            {/* people seated */}
            {count >= 1 && <Electron x={x + DESK / 2 - (count === 2 ? 5 : 0)} y={topY - 1} seated />}
            {count >= 2 && <Electron x={x + DESK / 2 + 5} y={topY - 1} seated />}
            {/* desk top and legs */}
            <rect x={x} y={topY} width={DESK} height="4" rx="1.5" fill={INK} />
            <line x1={x + 3} y1={topY + 4} x2={x + 3} y2={floorY} stroke={INK} strokeWidth="1.5" strokeLinecap="round" />
            <line x1={x + DESK - 3} y1={topY + 4} x2={x + DESK - 3} y2={floorY} stroke={INK} strokeWidth="1.5" strokeLinecap="round" />
            {/* hit area */}
            <rect x={x - 2} y={floorY - 44} width={DESK + 4} height={44} fill="transparent" />
        </g>
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

    const roofY = floorTop(FLOOR_COUNT);

    return (
        <svg viewBox={`0 0 ${VIEW.width} ${VIEW.height}`} className="block w-full select-none">
            {/* Pavement and outer shell of the building */}
            <line x1={24} y1={GROUND_LINE} x2={VIEW.width - 24} y2={GROUND_LINE} stroke={INK_SOFT} strokeWidth="2" strokeLinecap="round" />
            <rect x={BUILDING.x} y={roofY} width={BUILDING.width} height={GROUND_LINE - roofY} fill="#FFFFFF" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
            <polygon
                points={`${BUILDING.x - 6},${roofY} ${BUILDING.x + BUILDING.width / 2},${ROOF_APEX} ${WALL_RIGHT + 6},${roofY}`}
                fill={PAPER_TINT}
                stroke={INK}
                strokeWidth="2"
                strokeLinejoin="round"
            />
            <text x={BUILDING.x + BUILDING.width / 2} y={roofY - 12} textAnchor="middle" fontSize="11" fill={INK_SOFT}>
                one atom
            </text>

            {/* Stairwell: electrons come in at the bottom and fill upwards */}
            <g opacity={highlight ? 0.4 : 1}>
            <rect x={BUILDING.x} y={roofY} width={STAIRS_WIDTH} height={LOBBY_TOP - roofY} fill={PAPER_TINT} stroke="none" />
            <line x1={BUILDING.x + STAIRS_WIDTH} y1={roofY} x2={BUILDING.x + STAIRS_WIDTH} y2={LOBBY_TOP} stroke={INK_SOFT} strokeWidth="1.5" />
            {Array.from({ length: Math.floor((LOBBY_TOP - roofY) / 8) }, (_, i) => (
                <line
                    key={i}
                    x1={BUILDING.x + 4}
                    y1={LOBBY_TOP - 6 - i * 8}
                    x2={BUILDING.x + STAIRS_WIDTH - 4}
                    y2={LOBBY_TOP - 6 - i * 8}
                    stroke={INK_FAINT}
                    strokeWidth="1"
                />
            ))}
            <line x1={BUILDING.x + STAIRS_WIDTH / 2} y1={LOBBY_TOP - 12} x2={BUILDING.x + STAIRS_WIDTH / 2} y2={roofY + 18} stroke={ACCENT} strokeWidth="2.5" strokeLinecap="round" />
            <polygon
                points={`${BUILDING.x + STAIRS_WIDTH / 2},${roofY + 10} ${BUILDING.x + STAIRS_WIDTH / 2 - 5},${roofY + 20} ${BUILDING.x + STAIRS_WIDTH / 2 + 5},${roofY + 20}`}
                fill={ACCENT}
            />

            {/* Ground floor: the lobby, with the nucleus in it */}
            <line x1={BUILDING.x} y1={LOBBY_TOP} x2={WALL_RIGHT} y2={LOBBY_TOP} stroke={INK} strokeWidth="2" />
            <rect x={BUILDING.x + BUILDING.width / 2 - 14} y={GROUND_LINE - 30} width="28" height="30" rx="3" fill={PAPER_TINT} stroke={INK} strokeWidth="1.5" />
            <circle cx={BUILDING.x + BUILDING.width / 2 + 8} cy={GROUND_LINE - 15} r="1.5" fill={INK} />
            <circle cx={BUILDING.x + 80} cy={GROUND_LINE - 18} r="13" fill={INK} />
            <text x={BUILDING.x + 80} y={GROUND_LINE - 13} textAnchor="middle" fontSize="13" fill="#FFFFFF" fontWeight={700}>
                +
            </text>
            <text x={BUILDING.x + 100} y={GROUND_LINE - 14} fontSize="11" fill={INK} fontWeight={600}>
                nucleus
            </text>
            <text x={WALL_RIGHT - 10} y={GROUND_LINE - 14} textAnchor="end" fontSize="10" fill={INK_SOFT}>
                ground floor
            </text>
            {/* Outside labels for the lobby */}
            <text x={24} y={LOBBY_TOP + 20} fontSize="12" fill={INK} fontWeight={500}>
                ground
            </text>
            <text x={24} y={LOBBY_TOP + 35} fontSize="11" fill={INK_SOFT}>
                the nucleus
            </text>
            </g>

            {Array.from({ length: FLOOR_COUNT }, (_, index) => {
                const n = index + 1;
                const top = floorTop(n);
                const floorY = top + FLOOR_HEIGHT; // the slab this floor stands on
                const isSelectedFloor = n === selected.n;
                return (
                    <g key={n} opacity={highlight && !isSelectedFloor ? 0.4 : 1}>
                        {/* Floor slab */}
                        <line x1={BUILDING.x + STAIRS_WIDTH} y1={floorY} x2={WALL_RIGHT} y2={floorY} stroke={INK} strokeWidth="2" />
                        {/* Selected floor: soft band that pops on hover of "shell" */}
                        {isSelectedFloor && (
                            <rect
                                x={BUILDING.x + STAIRS_WIDTH + 1}
                                y={top + 2}
                                width={WALL_RIGHT - BUILDING.x - STAIRS_WIDTH - 2}
                                height={FLOOR_HEIGHT - 3}
                                fill={ACCENT}
                                fillOpacity={highlight === "floor" ? 0.18 : highlight ? 0 : 0.07}
                                {...hoverProps("floor")}
                            />
                        )}
                        {/* Floor label outside the wall, with a tick to the slab */}
                        <g opacity={isSelectedFloor ? dim("floor") : 1} {...(isSelectedFloor ? hoverProps("floor") : {})}>
                            <text x={24} y={top + FLOOR_HEIGHT / 2 + 1} fontSize="13" fill={INK} fontWeight={isSelectedFloor ? 700 : 500}>
                                {`floor ${n}`}
                            </text>
                            <text x={24} y={top + FLOOR_HEIGHT / 2 + 17} fontSize="11" fill={INK_SOFT}>
                                shell <tspan fill={N_COLOR} fontWeight={600}>{`n = ${n}`}</tspan>
                            </text>
                        </g>
                        {/* A window on the right wall per floor */}
                        <rect x={WALL_RIGHT - 1} y={top + 22} width="6" height="22" fill="#FFFFFF" stroke={INK} strokeWidth="1.5" />

                        {/* Floor-level view: people standing about on the floor */}
                        {!showRooms &&
                            Array.from({ length: electronsOnFloor(n) }, (_, e) => (
                                <Electron key={e} x={ROOM_X + 16 + e * 22} y={floorY - 1} />
                            ))}
                        {!showRooms && electronsOnFloor(n) === 0 && (
                            <text x={ROOM_X + 8} y={floorY - 12} fontSize="11" fill={INK_FAINT}>
                                empty so far
                            </text>
                        )}

                        {/* Rooms: partition walls with a name plate */}
                        {showRooms &&
                            roomsOnFloor(n).map((room, roomIndex) => {
                                const x = roomX(n, roomIndex);
                                const width = roomWidth(room);
                                const isSelectedRoom = isSelectedFloor && room === selected.room;
                                const ceiling = top + 8;
                                return (
                                    <g
                                        key={room}
                                        opacity={roomReveal * ((highlight === "room" || highlight === "desk") && !isSelectedRoom ? 0.4 : 1)}
                                        {...(isSelectedRoom ? hoverProps("room") : {})}
                                    >
                                        {/* Halo around the selected room while "subshell" is hovered */}
                                        {isSelectedRoom && highlight === "room" && (
                                            <rect x={x - 5} y={ceiling - 5} width={width + 10} height={floorY - ceiling + 10} rx="6" fill="none" stroke={roomColor(room)} strokeWidth="8" strokeOpacity="0.28" />
                                        )}
                                        <rect
                                            x={x}
                                            y={ceiling}
                                            width={width}
                                            height={floorY - ceiling}
                                            fill={isSelectedRoom && highlight !== "desk" ? roomColorSoft(room) : "#FFFFFF"}
                                            stroke={isSelectedRoom && highlight !== "desk" ? roomColor(room) : INK_SOFT}
                                            strokeWidth={isSelectedRoom && highlight !== "desk" ? (highlight === "room" ? 4 : 2.5) : 1.5}
                                        />
                                        {/* door in the room's left wall (hidden once the desks are shown) */}
                                        {!showDesks && (
                                            <rect x={x + 3} y={floorY - 24} width="9" height="24" rx="1.5" fill={PAPER_TINT} stroke={INK_SOFT} strokeWidth="1" />
                                        )}
                                        {/* name plate above the door */}
                                        <rect x={x + 3} y={ceiling + 4} width="24" height="14" rx="2" fill={isSelectedRoom && highlight !== "desk" ? roomColor(room) : PAPER_TINT} stroke={roomColor(room)} strokeWidth="1" opacity={highlight === "desk" ? 0.4 : 1} />
                                        <text x={x + 15} y={ceiling + 14.5} textAnchor="middle" fontSize="10" fill={isSelectedRoom && highlight !== "desk" ? "#FFFFFF" : roomColor(room)} fontWeight={700} opacity={highlight === "desk" ? 0.4 : 1}>
                                            {`${n}${room}`}
                                        </text>
                                        {/* Room-level view: people standing in the room */}
                                        {!showDesks &&
                                            Array.from({ length: electronsInRoom(n, room) }, (_, e) => (
                                                <Electron key={e} x={x + 18 + e * 14} y={floorY - 1} />
                                            ))}
                                        {/* Desks */}
                                        {showDesks &&
                                            Array.from({ length: ORBITALS_PER_ROOM[room] }, (_, deskIndex) => {
                                                const desk = deskIndex + 1;
                                                const key = deskKey(n, room, desk);
                                                const dx = x + ROOM_PAD + deskIndex * (DESK + DESK_GAP);
                                                const isSelectedDesk = isSelectedRoom && desk === selected.desk;
                                                return (
                                                    <g key={key} opacity={deskReveal * (highlight === "desk" && !isSelectedDesk ? 0.4 : 1)}>
                                                        <Desk
                                                            x={dx}
                                                            floorY={floorY - 1}
                                                            count={SEATED[key] ?? 0}
                                                            selected={isSelectedDesk}
                                                            popped={isSelectedDesk && highlight === "desk"}
                                                            hovered={hoverDesk === key}
                                                            onClick={() => setVar("addressDesk", key)}
                                                            onEnter={() => {
                                                                setHoverDesk(key);
                                                                if (isSelectedDesk) setVar("addressHighlight", "desk");
                                                            }}
                                                            onLeave={() => {
                                                                setHoverDesk(null);
                                                                if (isSelectedDesk) setVar("addressHighlight", "");
                                                            }}
                                                        />
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
                    {showRooms && <tspan opacity={dim("room")} fontWeight={highlight === "room" ? 800 : 600}> → room <tspan fill={roomColor(selected.room)}>{`${selected.n}${selected.room}`}</tspan></tspan>}
                    {showDesks && <tspan opacity={dim("desk")} fontWeight={highlight === "desk" ? 800 : 600}>{` → desk ${selected.desk}`}</tspan>}
                </text>
                <text x={VIEW.width - 24} y={VIEW.height - 22} textAnchor="end" fontSize="11" fill={INK_FAINT}>
                    {showDesks ? "click any desk to read its address" : `${showRooms ? "desk" : "room"} level not shown yet`}
                </text>
                <text x={24} y={VIEW.height - 22} fontSize="11" fill={INK_SOFT}>
                    electrons move in from the bottom and fill upwards
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
