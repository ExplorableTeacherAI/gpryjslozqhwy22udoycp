import { type ReactElement, useEffect, useState } from "react";
import { Block } from "@/components/templates";
import { StackLayout } from "@/components/layouts";
import {
    EditableH2,
    EditableParagraph,
    InlineFormula,
    InlineClozeInput,
    InlineFeedback,
    InlineLinkedHighlight,
    InlineToggle,
    InteractionHintSequence,
} from "@/components/atoms";
import { Figure } from "@/components/molecules";
import { useVar, useSetVar } from "@/stores";
import { useSpring } from "@/lib/motion";
import {
    getVariableInfo,
    clozePropsFromDefinition,
    linkedHighlightPropsFromDefinition,
    togglePropsFromDefinition,
} from "../variables";
import { OrbitalShapesFigure } from "./orbitalShapesFigure";
import {
    INK,
    INK_SOFT,
    INK_FAINT,
    PAPER_TINT,
    N_COLOR,
    ORBITALS_PER_ROOM,
    roomCapacity,
    roomColor,
    roomColorSoft,
    type RoomLetter,
} from "./electronModel";

// ── Orbital boxes ───────────────────────────────────────────────────────────
const VIEW = { width: 560, height: 290 };
const BOX = 78;
const BOX_GAP = 14;
const BOX_Y = 96;
const ROOMS: RoomLetter[] = ["s", "p", "d"];
const REFUSE_COLOR = "#F7B23B"; // warm amber: "no room here", not an error
const EMPTY_BOXES = [0, 0, 0, 0, 0];

const asRoom = (value: string): RoomLetter => (ROOMS.includes(value as RoomLetter) ? (value as RoomLetter) : "p");
const asBoxes = (value: unknown): number[] =>
    Array.isArray(value) ? EMPTY_BOXES.map((_, index) => Number(value[index]) || 0) : EMPTY_BOXES;

function ElectronArrow({ x, y, up, color }: { x: number; y: number; up: boolean; color: string }) {
    const head = up ? y - 16 : y + 16;
    const tail = up ? y + 16 : y - 16;
    const barb = up ? head + 7 : head - 7;
    return (
        <g stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none">
            <line x1={x} y1={tail} x2={x} y2={head} />
            <polyline points={`${x - 6},${barb} ${x},${head} ${x + 6},${barb}`} />
        </g>
    );
}

function OrbitalBox({
    x,
    index,
    electrons,
    color,
    onAdd,
}: {
    x: number;
    index: number;
    electrons: number;
    color: string;
    onAdd: (index: number) => boolean;
}) {
    const [hover, setHover] = useState(false);
    const [refused, setRefused] = useState(false);
    const scale = useSpring(refused ? 1.08 : hover ? 1.04 : 1, { stiffness: 420, damping: 22 });

    useEffect(() => {
        if (!refused) return;
        const timer = setTimeout(() => setRefused(false), 450);
        return () => clearTimeout(timer);
    }, [refused]);

    const full = electrons >= 2;
    const center = { x: x + BOX / 2, y: BOX_Y + BOX / 2 };
    return (
        <g
            transform={`translate(${center.x} ${center.y}) scale(${scale}) translate(${-center.x} ${-center.y})`}
            onPointerEnter={() => setHover(true)}
            onPointerLeave={() => setHover(false)}
            onClick={() => {
                if (!onAdd(index)) setRefused(true);
            }}
            style={{ cursor: "pointer" }}
        >
            <rect
                x={x}
                y={BOX_Y}
                width={BOX}
                height={BOX}
                rx="8"
                fill={full ? `${color}2E` : PAPER_TINT}
                stroke={refused ? REFUSE_COLOR : full ? color : INK_SOFT}
                strokeWidth={refused ? 3 : 2}
            />
            {electrons >= 1 && <ElectronArrow x={x + BOX / 2 - 12} y={BOX_Y + BOX / 2} up color={color} />}
            {electrons >= 2 && <ElectronArrow x={x + BOX / 2 + 12} y={BOX_Y + BOX / 2} up={false} color={color} />}
            {refused && (
                <text x={x + BOX / 2} y={BOX_Y - 10} textAnchor="middle" fontSize="11" fill={REFUSE_COLOR} fontWeight={600}>
                    full — two per desk
                </text>
            )}
            <text
                x={x + BOX / 2}
                y={BOX_Y + BOX + 18}
                textAnchor="middle"
                fontSize="11"
                fill={INK_SOFT}
                style={{ fontVariantNumeric: "tabular-nums" }}
            >
                {`desk ${index + 1}`}
            </text>
        </g>
    );
}

function RoomTab({ room, selected, onSelect, x }: { room: RoomLetter; selected: boolean; onSelect: () => void; x: number }) {
    return (
        <g onClick={onSelect} style={{ cursor: selected ? "default" : "pointer" }}>
            <rect
                x={x}
                y={28}
                width={72}
                height={28}
                rx="14"
                fill={selected ? roomColor(room) : PAPER_TINT}
                stroke={roomColor(room)}
                strokeWidth="1.5"
            />
            <text x={x + 36} y={46} textAnchor="middle" fontSize="12" fill={selected ? "#FFFFFF" : roomColor(room)} fontWeight={600}>
                {`${room} room`}
            </text>
        </g>
    );
}

function OrbitalBoxesDrawing() {
    const setVar = useSetVar();
    const room = asRoom(useVar<string>("orbitalRoom", "p"));
    const boxes = asBoxes(useVar<number[]>("orbitalBoxes", EMPTY_BOXES));
    const deskCount = ORBITALS_PER_ROOM[room];
    const capacity = roomCapacity(room);
    const placed = boxes.slice(0, deskCount).reduce((sum, count) => sum + count, 0);

    const totalWidth = deskCount * BOX + (deskCount - 1) * BOX_GAP;
    const startX = (VIEW.width - totalWidth) / 2;

    // Returns false when the desk already holds two electrons.
    const addElectron = (index: number): boolean => {
        if (boxes[index] >= 2) return false;
        const next = [...boxes];
        next[index] = boxes[index] + 1;
        setVar("orbitalBoxes", next);
        return true;
    };

    return (
        <svg viewBox={`0 0 ${VIEW.width} ${VIEW.height}`} className="block w-full select-none">
            {ROOMS.map((letter, index) => (
                <RoomTab
                    key={letter}
                    room={letter}
                    x={24 + index * 80}
                    selected={room === letter}
                    onSelect={() => setVar("orbitalRoom", letter)}
                />
            ))}

            <text
                x={VIEW.width - 24}
                y={46}
                textAnchor="end"
                fontSize="12"
                fill={placed === capacity ? roomColor(room) : INK_SOFT}
                fontWeight={placed === capacity ? 700 : 400}
                style={{ fontVariantNumeric: "tabular-nums" }}
            >
                {`${placed} of ${capacity} electrons placed`}
            </text>

            {Array.from({ length: deskCount }, (_, index) => (
                <OrbitalBox
                    key={`${room}-${index}`}
                    x={startX + index * (BOX + BOX_GAP)}
                    index={index}
                    electrons={boxes[index]}
                    color={roomColor(room)}
                    onAdd={addElectron}
                />
            ))}

            <text
                x={VIEW.width / 2}
                y={VIEW.height - 40}
                textAnchor="middle"
                fontSize="12"
                fill={INK}
                style={{ fontVariantNumeric: "tabular-nums" }}
            >
                <tspan>the </tspan>
                <tspan fill={roomColor(room)} fontWeight={700}>{`${room} room`}</tspan>
                <tspan>{`: ${deskCount} desk${deskCount === 1 ? "" : "s"} × 2 electrons = ${capacity} electrons`}</tspan>
            </text>
            <text x={VIEW.width / 2} y={VIEW.height - 20} textAnchor="middle" fontSize="11" fill={INK_FAINT}>
                click a desk to seat an electron
            </text>
        </svg>
    );
}

function OrbitalBoxesFigure() {
    const setVar = useSetVar();
    return (
        <Figure
            id="orbitals-boxes"
            onReset={() => setVar("orbitalBoxes", EMPTY_BOXES)}
            caption="Each box is one orbital — one desk. Click a desk to seat an electron; the second electron sits with the opposite spin, and a third is refused. Switch rooms with the tabs."
        >
            <OrbitalBoxesDrawing />
            <InteractionHintSequence
                hintKey="orbitals-boxes-click"
                steps={[{ gesture: "click", label: "Click a desk to add an electron", position: { x: "50%", y: "40%" } }]}
            />
        </Figure>
    );
}

/** The room toggle, coloured like the room it currently shows. */
function RoomToggle() {
    const room = asRoom(useVar<string>("orbitalRoom", "p"));
    return (
        <InlineToggle
            id="toggle-orbitals-room"
            varName="orbitalRoom"
            options={["s", "p", "d"]}
            {...togglePropsFromDefinition(getVariableInfo("orbitalRoom"))}
            color={roomColor(room)}
            bgColor={roomColorSoft(room)}
        />
    );
}

function RoomDesksReadout() {
    const room = asRoom(useVar<string>("orbitalRoom", "p"));
    const desks = ORBITALS_PER_ROOM[room];
    return (
        <span>
            has <span style={{ fontWeight: 600, color: INK }}>{desks}</span> desk{desks === 1 ? "" : "s"}, so it holds{" "}
            <span style={{ fontWeight: 600, color: INK }}>{roomCapacity(room)}</span> electrons
        </span>
    );
}

export const orbitalsBlocks: ReactElement[] = [
    <StackLayout key="layout-orbitals-heading" maxWidth="xl">
        <Block id="orbitals-heading" padding="sm">
            <EditableH2 id="h2-orbitals-heading" blockId="orbitals-heading">
                4. Orbitals — the desks in each room
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-orbitals-definition" maxWidth="xl">
        <Block id="orbitals-definition" padding="sm">
            <EditableParagraph id="para-orbitals-definition" blockId="orbitals-definition">
                Inside every room there are desks, and an orbital is one of those desks. An
                orbital is not a track the electron runs along — it is a region of space where
                that electron is very likely to be found. An <InlineFormula latex="\clr{roomS}{s}" colorMap={{ roomS: roomColor("s") }} /> orbital
                is{" "}
                <InlineLinkedHighlight
                    id="highlight-orbitals-sphere"
                    varName="orbitalShapeHighlight"
                    highlightId="sphere"
                    showHint={false}
                    {...linkedHighlightPropsFromDefinition(getVariableInfo("orbitalShapeHighlight"))}
                    color={roomColor("s")}
                    bgColor={roomColorSoft("s")}
                >
                    a sphere
                </InlineLinkedHighlight>{" "}
                around the nucleus; a <InlineFormula latex="\clr{roomP}{p}" colorMap={{ roomP: roomColor("p") }} /> orbital is{" "}
                <InlineLinkedHighlight
                    id="highlight-orbitals-dumbbell"
                    varName="orbitalShapeHighlight"
                    highlightId="dumbbell"
                    showHint={false}
                    {...linkedHighlightPropsFromDefinition(getVariableInfo("orbitalShapeHighlight"))}
                    color={roomColor("p")}
                    bgColor={roomColorSoft("p")}
                >
                    a dumbbell
                </InlineLinkedHighlight>{" "}
                pointing along one direction; a <InlineFormula latex="\clr{roomD}{d}" colorMap={{ roomD: roomColor("d") }} /> orbital is{" "}
                <InlineLinkedHighlight
                    id="highlight-orbitals-cloverleaf"
                    varName="orbitalShapeHighlight"
                    highlightId="cloverleaf"
                    showHint={false}
                    {...linkedHighlightPropsFromDefinition(getVariableInfo("orbitalShapeHighlight"))}
                    color={roomColor("d")}
                    bgColor={roomColorSoft("d")}
                >
                    a cloverleaf
                </InlineLinkedHighlight>
                . Turn the shapes below to see them from every side.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-orbitals-shapes" maxWidth="xl">
        <Block id="orbitals-shapes" padding="sm" hasVisualization>
            <OrbitalShapesFigure />
        </Block>
    </StackLayout>,

    <StackLayout key="layout-orbitals-shapes-reading" maxWidth="xl">
        <Block id="orbitals-shapes-reading" padding="sm">
            <EditableParagraph id="para-orbitals-shapes-reading" blockId="orbitals-shapes-reading">
                Two things to notice while they turn. The three{" "}
                <InlineFormula latex="\clr{roomP}{p}" colorMap={{ roomP: roomColor("p") }} /> orbitals are one and the
                same{" "}
                <InlineLinkedHighlight
                    id="highlight-orbitals-dumbbell-again"
                    varName="orbitalShapeHighlight"
                    highlightId="dumbbell"
                    showHint={false}
                    {...linkedHighlightPropsFromDefinition(getVariableInfo("orbitalShapeHighlight"))}
                    color={roomColor("p")}
                    bgColor={roomColorSoft("p")}
                >
                    dumbbell
                </InlineLinkedHighlight>
                , pointing along <InlineFormula latex="x" />, <InlineFormula latex="y" /> or{" "}
                <InlineFormula latex="z" /> — which is why a{" "}
                <InlineFormula latex="\clr{roomP}{p}" colorMap={{ roomP: roomColor("p") }} /> room has exactly three
                desks. And four of the five{" "}
                <InlineFormula latex="\clr{roomD}{d}" colorMap={{ roomD: roomColor("d") }} /> orbitals are the same{" "}
                <InlineLinkedHighlight
                    id="highlight-orbitals-cloverleaf-again"
                    varName="orbitalShapeHighlight"
                    highlightId="cloverleaf"
                    showHint={false}
                    {...linkedHighlightPropsFromDefinition(getVariableInfo("orbitalShapeHighlight"))}
                    color={roomColor("d")}
                    bgColor={roomColorSoft("d")}
                >
                    cloverleaf
                </InlineLinkedHighlight>{" "}
                lying in different planes, with{" "}
                <InlineFormula latex="\clr{roomD}{d_{z^2}}" colorMap={{ roomD: roomColor("d") }} /> the odd one out —
                five desks in a <InlineFormula latex="\clr{roomD}{d}" colorMap={{ roomD: roomColor("d") }} /> room.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-orbitals-two-electrons" maxWidth="xl">
        <Block id="orbitals-two-electrons" padding="sm">
            <EditableParagraph id="para-orbitals-two-electrons" blockId="orbitals-two-electrons">
                The key rule is short: every orbital holds a maximum of two electrons, and those
                two must have opposite spins. Two electrons per desk, no exceptions — whether the
                desk is in an <InlineFormula latex="\clr{roomS}{s}" colorMap={{ roomS: roomColor("s") }} /> room or a <InlineFormula latex="\clr{roomD}{d}" colorMap={{ roomD: roomColor("d") }} />{" "}
                room. Try to break the rule below.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-orbitals-boxes" maxWidth="xl">
        <Block id="orbitals-boxes" padding="sm" hasVisualization>
            <OrbitalBoxesFigure />
        </Block>
    </StackLayout>,

    <StackLayout key="layout-orbitals-counting" maxWidth="xl">
        <Block id="orbitals-counting" padding="sm">
            <EditableParagraph id="para-orbitals-counting" blockId="orbitals-counting">
                That single rule explains every capacity number in this lesson. Rooms differ only
                in how many desks they contain: the{" "}
                <RoomToggle />{" "}
                room <RoomDesksReadout />. Multiply the number of desks by two and you get how
                many electrons the room holds.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-orbitals-shell-check" maxWidth="xl">
        <Block id="orbitals-shell-check" padding="sm">
            <EditableParagraph id="para-orbitals-shell-check" blockId="orbitals-shell-check">
                Check this against shell capacities from earlier. Shell 3 holds{" "}
                <InlineFormula latex="\clr{roomS}{3s}" colorMap={{ roomS: roomColor("s") }} /> plus <InlineFormula latex="\clr{roomP}{3p}" colorMap={{ roomP: roomColor("p") }} /> plus{" "}
                <InlineFormula latex="\clr{roomD}{3d}" colorMap={{ roomD: roomColor("d") }} />, which is{" "}
                <InlineFormula latex="2 + 6 + 10 = 18" /> electrons — exactly the{" "}
                <InlineFormula latex="2\clr{n}{n}^2" colorMap={{ n: N_COLOR }} /> answer for <InlineFormula latex="\clr{n}{n} = \clr{n}{3}" colorMap={{ n: N_COLOR }} />. The two
                rules agree because they are describing the same building.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-orbitals-question" maxWidth="xl">
        <Block id="orbitals-question" padding="sm">
            <EditableParagraph id="para-orbitals-question" blockId="orbitals-question">
                A <InlineFormula latex="\clr{roomF}{f}" colorMap={{ roomF: roomColor("f") }} /> room has 7 desks. Using the two-per-desk rule, the
                most electrons an <InlineFormula latex="\clr{roomF}{f}" colorMap={{ roomF: roomColor("f") }} /> subshell can hold is{" "}
                <InlineFeedback
                    varName="orbitalFRoomAnswer"
                    correctValue="14"
                    position="terminal"
                    successMessage="— exactly: 7 desks × 2 electrons = 14"
                    failureMessage="— not quite."
                    hint="Count the desks, then seat two electrons at each one"
                    reviewBlockId="orbitals-boxes"
                    reviewLabel="Seat electrons in a room"
                >
                    <InlineClozeInput
                        id="cloze-orbitals-f-capacity"
                        varName="orbitalFRoomAnswer"
                        correctAnswer="14"
                        {...clozePropsFromDefinition(getVariableInfo("orbitalFRoomAnswer"))}
                    />
                </InlineFeedback>
                .
            </EditableParagraph>
        </Block>
    </StackLayout>,
];
