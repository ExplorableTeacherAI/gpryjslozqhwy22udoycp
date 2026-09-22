import { type ReactElement, useState } from "react";
import { Block } from "@/components/templates";
import { StackLayout } from "@/components/layouts";
import {
    EditableH2,
    EditableParagraph,
    InlineFormula,
    InlineClozeChoice,
    InlineFeedback,
    InlineToggle,
    InteractionHintSequence,
    Table,
} from "@/components/atoms";
import { Figure } from "@/components/molecules";
import { useVar, useSetVar } from "@/stores";
import { useSpring } from "@/lib/motion";
import { getVariableInfo, choicePropsFromDefinition, togglePropsFromDefinition } from "../variables";
import { ACCENT, ACCENT_SOFT, INK, INK_SOFT, INK_FAINT, PAPER_TINT, roomsOnFloor } from "./electronModel";

// ── Building layout ─────────────────────────────────────────────────────────
const VIEW = { width: 560, height: 340 };
const FLOOR_COUNT = 4;
const FLOOR_HEIGHT = 56;
const FLOOR_GAP = 8;
const GROUND_Y = VIEW.height - 40;
const ROOM_X = 132;
const ROOM_WIDTH = 92;
const ROOM_GAP = 10;
const ROOM_HEIGHT = 34;
const ENERGY_STAGGER = 5; // each successive room sits a little higher: slightly more energy

const floorTop = (n: number) => GROUND_Y - n * (FLOOR_HEIGHT + FLOOR_GAP);

function Floor({ n, selected, onSelect }: { n: number; selected: boolean; onSelect: () => void }) {
    const [hover, setHover] = useState(false);
    const emphasis = useSpring(selected ? 1 : 0, { stiffness: 260, damping: 24 });
    const top = floorTop(n);
    const rooms = roomsOnFloor(n);
    const dimmed = !selected && !hover;

    return (
        <g
            onClick={onSelect}
            onPointerEnter={() => setHover(true)}
            onPointerLeave={() => setHover(false)}
            style={{ cursor: selected ? "default" : "pointer" }}
            opacity={dimmed ? 0.55 : 1}
        >
            {/* Floor slab: a meaningful boundary, not a frame */}
            <line
                x1={24}
                y1={top + FLOOR_HEIGHT}
                x2={VIEW.width - 24}
                y2={top + FLOOR_HEIGHT}
                stroke={INK_SOFT}
                strokeWidth={1.5 + emphasis}
                strokeLinecap="round"
            />
            {/* Hit area for the whole floor */}
            <rect x={24} y={top} width={VIEW.width - 48} height={FLOOR_HEIGHT} fill="transparent" />

            <text x={28} y={top + 22} fontSize="13" fill={INK} fontWeight={selected ? 700 : 500}>
                {`floor ${n}`}
            </text>
            <text x={28} y={top + 40} fontSize="11" fill={INK_SOFT} style={{ fontVariantNumeric: "tabular-nums" }}>
                {`n = ${n} · ${rooms.length} room${rooms.length === 1 ? "" : "s"}`}
            </text>

            {rooms.map((room, index) => {
                const x = ROOM_X + index * (ROOM_WIDTH + ROOM_GAP);
                const y = top + FLOOR_HEIGHT - ROOM_HEIGHT - 6 - index * ENERGY_STAGGER * emphasis;
                return (
                    <g key={room}>
                        <rect
                            x={x}
                            y={y}
                            width={ROOM_WIDTH}
                            height={ROOM_HEIGHT}
                            rx="6"
                            fill={selected ? ACCENT_SOFT : PAPER_TINT}
                            stroke={selected ? ACCENT : INK_FAINT}
                            strokeWidth={selected ? 2.5 : 1.5}
                        />
                        <text
                            x={x + ROOM_WIDTH / 2}
                            y={y + ROOM_HEIGHT / 2 + 5}
                            textAnchor="middle"
                            fontSize="15"
                            fill={INK}
                            fontWeight={selected ? 700 : 500}
                        >
                            {`${n}${room}`}
                        </text>
                    </g>
                );
            })}
            {/* The empty part of a floor shows where rooms would go on higher floors */}
            {selected && rooms.length < FLOOR_COUNT && (
                <text
                    x={ROOM_X + rooms.length * (ROOM_WIDTH + ROOM_GAP) + 4}
                    y={top + FLOOR_HEIGHT - 18}
                    fontSize="11"
                    fill={INK_FAINT}
                >
                    {`no ${["s", "p", "d", "f"][rooms.length]} room on this floor`}
                </text>
            )}
        </g>
    );
}

function SubshellFloorsDrawing() {
    const setVar = useSetVar();
    const selected = Number(useVar<string>("subshellFloor", "2"));

    return (
        <svg viewBox={`0 0 ${VIEW.width} ${VIEW.height}`} className="block w-full select-none">
            {/* Energy axis on the far right */}
            <line
                x1={VIEW.width - 30}
                y1={GROUND_Y - 6}
                x2={VIEW.width - 30}
                y2={floorTop(FLOOR_COUNT) + 6}
                stroke={INK_FAINT}
                strokeWidth="1.5"
                strokeLinecap="round"
            />
            <polygon
                points={`${VIEW.width - 30},${floorTop(FLOOR_COUNT)} ${VIEW.width - 35},${floorTop(FLOOR_COUNT) + 10} ${VIEW.width - 25},${floorTop(FLOOR_COUNT) + 10}`}
                fill={INK_FAINT}
            />
            <text
                x={VIEW.width - 30}
                y={floorTop(FLOOR_COUNT) - 8}
                textAnchor="middle"
                fontSize="11"
                fill={INK_SOFT}
            >
                energy
            </text>

            {/* Ground floor: the nucleus */}
            <rect x={24} y={GROUND_Y + 2} width={VIEW.width - 48} height={16} rx="4" fill={INK} />
            <text x={VIEW.width / 2} y={GROUND_Y + 14} textAnchor="middle" fontSize="11" fill="#FFFFFF" fontWeight={600}>
                nucleus — ground floor
            </text>

            {Array.from({ length: FLOOR_COUNT }, (_, index) => {
                const n = index + 1;
                return (
                    <Floor
                        key={n}
                        n={n}
                        selected={selected === n}
                        onSelect={() => setVar("subshellFloor", String(n))}
                    />
                );
            })}
        </svg>
    );
}

function SubshellFloorsFigure() {
    const setVar = useSetVar();
    return (
        <Figure
            id="subshells-floors"
            onReset={() => setVar("subshellFloor", "2")}
            caption="Click a floor to open it. Its rooms are named by floor number and letter, and each extra room sits a little higher in energy than the one before."
        >
            <SubshellFloorsDrawing />
            <InteractionHintSequence
                hintKey="subshells-floors-click"
                steps={[{ gesture: "click", label: "Click floor 3 to open it", position: { x: "12%", y: "30%" } }]}
            />
        </Figure>
    );
}

function FloorRoomsReadout() {
    const n = Number(useVar<string>("subshellFloor", "2"));
    const rooms = roomsOnFloor(n).map((room) => `${n}${room}`);
    const list = rooms.length === 1 ? rooms[0] : `${rooms.slice(0, -1).join(", ")} and ${rooms[rooms.length - 1]}`;
    return (
        <span>
            has {rooms.length} room{rooms.length === 1 ? "" : "s"}: <span style={{ fontWeight: 600, color: INK }}>{list}</span>
        </span>
    );
}

export const subshellsBlocks: ReactElement[] = [
    <StackLayout key="layout-subshells-heading" maxWidth="xl">
        <Block id="subshells-heading" padding="sm">
            <EditableH2 id="h2-subshells-heading" blockId="subshells-heading">
                3. Subshells — the rooms on each floor
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-subshells-definition" maxWidth="xl">
        <Block id="subshells-definition" padding="sm">
            <EditableParagraph id="para-subshells-definition" blockId="subshells-definition">
                A floor of a building is not one big open space — it is divided into rooms. In
                the same way, a shell is divided into subshells. The rooms have names rather than
                numbers: <InlineFormula latex="s" />, <InlineFormula latex="p" />,{" "}
                <InlineFormula latex="d" /> and <InlineFormula latex="f" />. Electrons in
                different rooms on the same floor have slightly different energies.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-subshells-floors" maxWidth="xl">
        <Block id="subshells-floors" padding="sm" hasVisualization>
            <SubshellFloorsFigure />
        </Block>
    </StackLayout>,

    <StackLayout key="layout-subshells-count-rule" maxWidth="xl">
        <Block id="subshells-count-rule" padding="sm">
            <EditableParagraph id="para-subshells-count-rule" blockId="subshells-count-rule">
                Here is the rule that decides how many rooms a floor has: shell number{" "}
                <InlineFormula latex="n" /> contains exactly <InlineFormula latex="n" />{" "}
                subshells. Click through the floors and count: floor{" "}
                <InlineToggle
                    id="toggle-subshells-floor"
                    varName="subshellFloor"
                    options={["1", "2", "3", "4"]}
                    {...togglePropsFromDefinition(getVariableInfo("subshellFloor"))}
                />{" "}
                <FloorRoomsReadout />. The rooms are always added in the order{" "}
                <InlineFormula latex="s" />, then <InlineFormula latex="p" />, then{" "}
                <InlineFormula latex="d" />, then <InlineFormula latex="f" />.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-subshells-naming" maxWidth="xl">
        <Block id="subshells-naming" padding="sm">
            <EditableParagraph id="para-subshells-naming" blockId="subshells-naming">
                A subshell is named by writing its floor number in front of its room letter. So{" "}
                <InlineFormula latex="2p" /> means the <InlineFormula latex="p" /> room on floor
                2, and <InlineFormula latex="3d" /> means the <InlineFormula latex="d" /> room on
                floor 3. That two-part name is already most of an electron's address.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-subshells-table" maxWidth="xl">
        <Block id="subshells-table" padding="sm">
            <Table
                columns={[
                    { header: "Shell", align: "center", width: 100 },
                    { header: "Number of subshells", align: "center", width: 180 },
                    { header: "Subshells on that shell", align: "left" },
                ]}
                rows={[
                    { cells: ["1", "1", "1s"] },
                    { cells: ["2", "2", "2s, 2p"] },
                    { cells: ["3", "3", "3s, 3p, 3d"] },
                    { cells: ["4", "4", "4s, 4p, 4d, 4f"] },
                ]}
                color="#6366f1"
                caption="Each shell contains as many subshells as its shell number."
            />
        </Block>
    </StackLayout>,

    <StackLayout key="layout-subshells-question" maxWidth="xl">
        <Block id="subshells-question" padding="sm">
            <EditableParagraph id="para-subshells-question" blockId="subshells-question">
                Without opening the floor in the picture, name the third room on floor 3. It is
                called{" "}
                <InlineFeedback
                    varName="subshellThirdRoomAnswer"
                    correctValue="3d"
                    position="terminal"
                    successMessage="— right: floor 3, and the third letter in the order s, p, d"
                    failureMessage="— not quite."
                    hint="The rooms are added in the order s, then p, then d"
                    reviewBlockId="subshells-floors"
                    reviewLabel="Open floor 3 to check"
                >
                    <InlineClozeChoice
                        id="choice-subshells-third-room"
                        varName="subshellThirdRoomAnswer"
                        correctAnswer="3d"
                        options={["3s", "3p", "3d", "3f"]}
                        {...choicePropsFromDefinition(getVariableInfo("subshellThirdRoomAnswer"))}
                    />
                </InlineFeedback>
                .
            </EditableParagraph>
        </Block>
    </StackLayout>,
];
