import { type ReactElement, useEffect, useState } from "react";
import { Block } from "@/components/templates";
import { StackLayout } from "@/components/layouts";
import {
    EditableH2,
    EditableParagraph,
    InlineFormula,
    InlineClozeInput,
    InlineFeedback,
    InlineScrubbleNumber,
    InteractionHintSequence,
} from "@/components/atoms";
import { FormulaBlock, Figure, FigureSlider } from "@/components/molecules";
import { useVar, useSetVar } from "@/stores";
import { clamp, useSpring } from "@/lib/motion";
import { getVariableInfo, clozePropsFromDefinition, numberPropsFromDefinition } from "../variables";
import {
    ACCENT,
    INK,
    INK_SOFT,
    INK_FAINT,
    PAPER_TINT,
    ORBITALS_PER_ROOM,
    elementFor,
    fillSubshells,
    superscript,
    type Subshell,
    roomColor,
    roomColorSoft,
} from "./electronModel";
import { StepButton } from "./electronFigureParts";

// ── Configuration builder ───────────────────────────────────────────────────
const VIEW = { width: 560, height: 420 };
const ROW_TOP = 52;
const ROW_STEP = 34;
const ROW_LABEL_X = 236;
const SLOT_X = 248;
const SLOT = 22;
const SLOT_GAP = 4;
const MAX_Z = 36;
const REFUSE_COLOR = "#F7B23B";

const rowY = (index: number) => ROW_TOP + index * ROW_STEP;
const rowWidth = (subshell: Subshell) => ORBITALS_PER_ROOM[subshell.room] * (SLOT + SLOT_GAP) - SLOT_GAP;

function SubshellRow({
    index,
    subshell,
    electrons,
    isNext,
    onClick,
}: {
    index: number;
    subshell: Subshell;
    electrons: number;
    isNext: boolean;
    onClick: (index: number) => boolean;
}) {
    const [hover, setHover] = useState(false);
    const [refused, setRefused] = useState(false);
    const glow = useSpring(isNext ? 1 : 0, { stiffness: 260, damping: 22 });
    const y = rowY(index);
    const width = rowWidth(subshell);
    const full = electrons === subshell.capacity;

    useEffect(() => {
        if (!refused) return;
        const timer = setTimeout(() => setRefused(false), 600);
        return () => clearTimeout(timer);
    }, [refused]);

    return (
        <g
            onClick={() => {
                if (!onClick(index)) setRefused(true);
            }}
            onPointerEnter={() => setHover(true)}
            onPointerLeave={() => setHover(false)}
            style={{ cursor: "pointer" }}
        >
            {/* Hit area spanning the row */}
            <rect
                x={ROW_LABEL_X - 40}
                y={y - 16}
                width={width + 120}
                height={ROW_STEP - 2}
                rx="8"
                fill={hover && !refused ? PAPER_TINT : "transparent"}
                stroke={refused ? REFUSE_COLOR : "none"}
                strokeWidth="2"
            />
            {/* Soft pointer to the subshell that should be filled next */}
            <circle cx={ROW_LABEL_X - 30} cy={y} r={4} fill={roomColor(subshell.room)} opacity={glow} />
            <text
                x={ROW_LABEL_X}
                y={y + 5}
                textAnchor="end"
                fontSize="14"
                fill={roomColor(subshell.room)}
                fontWeight={full || isNext ? 800 : 600}
                style={{ fontVariantNumeric: "tabular-nums" }}
            >
                {subshell.key}
            </text>
            {Array.from({ length: ORBITALS_PER_ROOM[subshell.room] }, (_, slotIndex) => {
                const slotX = SLOT_X + slotIndex * (SLOT + SLOT_GAP);
                const inSlot = clamp(electrons - slotIndex * 2, 0, 2);
                return (
                    <g key={slotIndex}>
                        <rect
                            x={slotX}
                            y={y - SLOT / 2}
                            width={SLOT}
                            height={SLOT}
                            rx="4"
                            fill={inSlot > 0 ? roomColorSoft(subshell.room) : PAPER_TINT}
                            stroke={inSlot > 0 ? roomColor(subshell.room) : INK_FAINT}
                            strokeWidth="1.2"
                        />
                        {inSlot >= 1 && <circle cx={slotX + SLOT * 0.32} cy={y} r="3.5" fill={roomColor(subshell.room)} />}
                        {inSlot >= 2 && <circle cx={slotX + SLOT * 0.68} cy={y} r="3.5" fill={roomColor(subshell.room)} />}
                    </g>
                );
            })}
            <text
                x={SLOT_X + width + 10}
                y={y + 4}
                fontSize="11"
                fill={electrons > 0 ? INK : INK_FAINT}
                style={{ fontVariantNumeric: "tabular-nums" }}
            >
                {electrons > 0 ? `${subshell.key}${superscript(electrons)}` : `holds ${subshell.capacity}`}
            </text>
            {refused && (
                <text x={SLOT_X + width + 60} y={y + 4} fontSize="11" fill={REFUSE_COLOR} fontWeight={600}>
                    {full ? "already full" : "not yet — lower rungs first"}
                </text>
            )}
        </g>
    );
}

function ConfigurationBuilderDrawing() {
    const setVar = useSetVar();
    const atomicNumber = clamp(Math.round(useVar<number>("atomicNumber", 16)), 1, MAX_Z);
    const placedRaw = useVar<number>("builderPlaced", 0);
    const placed = clamp(placedRaw, 0, atomicNumber);
    const element = elementFor(atomicNumber);
    const occupancy = fillSubshells(placed);
    const remaining = atomicNumber - placed;
    const nextIndex = remaining > 0 ? occupancy.findIndex((o) => o.electrons < o.subshell.capacity) : -1;
    const done = remaining === 0;
    const doneGlow = useSpring(done ? 1 : 0, { stiffness: 200, damping: 20 });

    // A new element starts the hand-out from scratch.
    useEffect(() => {
        setVar("builderPlaced", 0);
    }, [atomicNumber, setVar]);

    // Returns false when the clicked subshell is not the one to fill next.
    const handleRowClick = (index: number): boolean => {
        if (index !== nextIndex) return false;
        const { subshell, electrons } = occupancy[index];
        setVar("builderPlaced", placed + Math.min(subshell.capacity - electrons, remaining));
        return true;
    };

    const stepElement = (delta: number) => setVar("atomicNumber", clamp(atomicNumber + delta, 1, MAX_Z));

    return (
        <svg viewBox={`0 0 ${VIEW.width} ${VIEW.height}`} className="block w-full select-none">
            {/* Element card */}
            <text x={100} y={112} textAnchor="middle" fontSize="56" fill={INK} fontWeight={700}>
                {element.symbol}
            </text>
            <text x={100} y={140} textAnchor="middle" fontSize="14" fill={INK}>
                {element.name}
            </text>
            <text x={100} y={160} textAnchor="middle" fontSize="12" fill={INK_SOFT} style={{ fontVariantNumeric: "tabular-nums" }}>
                {`atomic number ${atomicNumber}`}
            </text>
            <StepButton x={60} y={196} label="−" onClick={() => stepElement(-1)} disabled={atomicNumber <= 1} />
            <StepButton x={140} y={196} label="+" onClick={() => stepElement(1)} disabled={atomicNumber >= MAX_Z} />
            <text x={100} y={200} textAnchor="middle" fontSize="10" fill={INK_FAINT}>
                element
            </text>

            {/* Electrons still to hand out */}
            <text x={100} y={262} textAnchor="middle" fontSize="12" fill={INK_SOFT}>
                still to place
            </text>
            <text
                x={100}
                y={300}
                textAnchor="middle"
                fontSize="34"
                fill={done ? ACCENT : INK}
                fontWeight={700}
                style={{ fontVariantNumeric: "tabular-nums" }}
            >
                {remaining}
            </text>
            <text x={100} y={322} textAnchor="middle" fontSize="11" fill={INK_FAINT}>
                {`of ${atomicNumber} electrons`}
            </text>

            {/* Subshell rows in filling order */}
            <text x={ROW_LABEL_X - 40} y={ROW_TOP - 24} fontSize="11" fill={INK_SOFT}>
                click the subshell that fills next
            </text>
            {occupancy.map(({ subshell, electrons }, index) => (
                <SubshellRow
                    key={subshell.key}
                    index={index}
                    subshell={subshell}
                    electrons={electrons}
                    isNext={index === nextIndex}
                    onClick={handleRowClick}
                />
            ))}

            {/* The written configuration grows as rows are filled */}
            <line x1={24} y1={VIEW.height - 62} x2={VIEW.width - 24} y2={VIEW.height - 62} stroke={INK_FAINT} strokeWidth="1.5" strokeLinecap="round" />
            <text x={24} y={VIEW.height - 40} fontSize="11" fill={INK_SOFT}>
                {done ? "complete configuration" : "configuration so far"}
            </text>
            <text
                x={24}
                y={VIEW.height - 16}
                fontSize="18"
                fill={INK}
                fontWeight={600}
                style={{ fontVariantNumeric: "tabular-nums" }}
            >
                {placed === 0 ? (
                    "—"
                ) : (
                    <>
                        <tspan>{`${element.symbol}: `}</tspan>
                        {occupancy
                            .filter((o) => o.electrons > 0)
                            .map((o) => (
                                <tspan key={o.subshell.key} fill={roomColor(o.subshell.room)}>
                                    {`${o.subshell.key}${superscript(o.electrons)} `}
                                </tspan>
                            ))}
                    </>
                )}
            </text>
            <text
                x={VIEW.width - 24}
                y={VIEW.height - 16}
                textAnchor="end"
                fontSize="12"
                fill={ACCENT}
                fontWeight={700}
                opacity={doneGlow}
            >
                {`✓ adds up to ${atomicNumber}`}
            </text>
        </svg>
    );
}

function ConfigurationBuilderFigure() {
    const setVar = useSetVar();
    return (
        <Figure
            id="writing-configurations-builder"
            onReset={() => {
                setVar("atomicNumber", 16);
                setVar("builderPlaced", 0);
            }}
            caption="Choose an element, then hand out its electrons by clicking the subshells in filling order. Each click fills a subshell as far as the electrons allow, and the configuration writes itself underneath."
        >
            <ConfigurationBuilderDrawing />
            <div className="px-6 pb-5">
                <FigureSlider
                    varName="atomicNumber"
                    label="Atomic number"
                    {...numberPropsFromDefinition(getVariableInfo("atomicNumber"))}
                    formatValue={(value) => `${value.toFixed(0)} · ${elementFor(value).symbol}`}
                />
            </div>
            <InteractionHintSequence
                hintKey="writing-configurations-builder-click"
                steps={[{ gesture: "click", label: "Click 1s to fill it first", position: { x: "46%", y: "14%" } }]}
            />
        </Figure>
    );
}

// ── Worked example: driven by the same atomicNumber as the builder ──
function useWorkedElement() {
    const atomicNumber = clamp(Math.round(useVar<number>("atomicNumber", 16)), 1, MAX_Z);
    return { atomicNumber, element: elementFor(atomicNumber), name: elementFor(atomicNumber).name.toLowerCase() };
}

function WorkedElementName() {
    const { name } = useWorkedElement();
    return <span style={{ fontWeight: 600, color: INK }}>{name}</span>;
}

/** "Put 2 into 1s (14 left), 2 into 2s (12 left), … and the last 4 go into 3p, which could have taken 6." */
function WorkedHandOut() {
    const { atomicNumber } = useWorkedElement();
    const steps = fillSubshells(atomicNumber).filter((o) => o.electrons > 0);
    let remaining = atomicNumber;
    return (
        <span style={{ fontVariantNumeric: "tabular-nums" }}>
            {steps.map((o, index) => {
                remaining -= o.electrons;
                const isLast = index === steps.length - 1;
                const name = <span style={{ fontWeight: 600, color: roomColor(o.subshell.room) }}>{o.subshell.key}</span>;
                if (!isLast) {
                    return (
                        <span key={o.subshell.key}>
                            {index === 0 ? "Put " : ", "}
                            {o.electrons} into {name} ({remaining} left)
                        </span>
                    );
                }
                const full = o.electrons === o.subshell.capacity;
                return (
                    <span key={o.subshell.key}>
                        {steps.length === 1 ? "Put " : ", and the last "}
                        {o.electrons} {steps.length === 1 ? "into" : o.electrons === 1 ? "goes into" : "go into"} {name}
                        {full ? ", filling it exactly" : `, which could have taken ${o.subshell.capacity}`}
                    </span>
                );
            })}
        </span>
    );
}

function WorkedConfigurationFormula() {
    const { atomicNumber, element } = useWorkedElement();
    const terms = fillSubshells(atomicNumber)
        .filter((o) => o.electrons > 0)
        .map((o) => `\\clr{room${o.subshell.room.toUpperCase()}}{${o.subshell.key}^{${o.electrons}}}`)
        .join(" \\, ");
    return (
        <FormulaBlock
            latex={`\\text{${element.symbol}} : \\; ${terms}`}
            colorMap={{ roomS: roomColor("s"), roomP: roomColor("p"), roomD: roomColor("d"), roomF: roomColor("f") }}
        />
    );
}

function WorkedElectronCount() {
    const { atomicNumber } = useWorkedElement();
    return <span style={{ fontWeight: 600, color: INK, fontVariantNumeric: "tabular-nums" }}>{atomicNumber}</span>;
}

function ElementNameReadout() {
    const atomicNumber = clamp(Math.round(useVar<number>("atomicNumber", 16)), 1, MAX_Z);
    return <span style={{ fontWeight: 600, color: INK }}>{elementFor(atomicNumber).name.toLowerCase()}</span>;
}

function ConfigurationReadout() {
    const atomicNumber = clamp(Math.round(useVar<number>("atomicNumber", 16)), 1, MAX_Z);
    return (
        <span style={{ fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
            {fillSubshells(atomicNumber)
                .filter((o) => o.electrons > 0)
                .map((o, index) => (
                    <span key={o.subshell.key} style={{ color: roomColor(o.subshell.room) }}>
                        {index > 0 ? " " : ""}
                        {`${o.subshell.key}${superscript(o.electrons)}`}
                    </span>
                ))}
        </span>
    );
}

function ConfigurationSumReadout() {
    const atomicNumber = clamp(Math.round(useVar<number>("atomicNumber", 16)), 1, MAX_Z);
    const counts = fillSubshells(atomicNumber)
        .filter((o) => o.electrons > 0)
        .map((o) => o.electrons);
    return (
        <span style={{ fontVariantNumeric: "tabular-nums" }}>
            {counts.join(" + ")} = <span style={{ fontWeight: 600, color: INK }}>{atomicNumber}</span>
        </span>
    );
}

export const writingConfigurationsBlocks: ReactElement[] = [
    <StackLayout key="layout-writing-configurations-heading" maxWidth="xl">
        <Block id="writing-configurations-heading" padding="sm">
            <EditableH2 id="h2-writing-configurations-heading" blockId="writing-configurations-heading">
                6. Writing a configuration
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-writing-configurations-notation" maxWidth="xl">
        <Block id="writing-configurations-notation" padding="sm">
            <EditableParagraph id="para-writing-configurations-notation" blockId="writing-configurations-notation">
                An electron configuration is just the list of occupied addresses, written in
                filling order, with the number of electrons in each subshell written as a small
                raised number. So <InlineFormula latex="\clr{roomP}{2p^4}" colorMap={{ roomP: roomColor("p") }} /> means four electrons in the{" "}
                <InlineFormula latex="\clr{roomP}{p}" colorMap={{ roomP: roomColor("p") }} /> room on floor 2.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-writing-configurations-method" maxWidth="xl">
        <Block id="writing-configurations-method" padding="sm">
            <EditableParagraph id="para-writing-configurations-method" blockId="writing-configurations-method">
                The method is always the same three steps. First, find how many electrons the
                neutral atom has — that is its atomic number. Second, hand them out along the
                filling order, filling each subshell to its limit of 2, 6 or 10 before moving on.
                Third, write down the subshells you used, in order, with their counts.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-writing-configurations-worked" maxWidth="xl">
        <Block id="writing-configurations-worked" padding="sm">
            <EditableParagraph id="para-writing-configurations-worked" blockId="writing-configurations-worked">
                Take <WorkedElementName />, atomic number{" "}
                <InlineScrubbleNumber
                    id="scrub-writing-configurations-worked-atomic-number"
                    varName="atomicNumber"
                    {...numberPropsFromDefinition(getVariableInfo("atomicNumber"))}
                />
                , so it has that many electrons. <WorkedHandOut />. Writing that out gives:
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-writing-configurations-sulfur" maxWidth="xl">
        <Block id="writing-configurations-sulfur" padding="lg">
            <WorkedConfigurationFormula />
        </Block>
    </StackLayout>,

    <StackLayout key="layout-writing-configurations-builder-intro" maxWidth="xl">
        <Block id="writing-configurations-builder-intro" padding="sm">
            <EditableParagraph id="para-writing-configurations-builder-intro" blockId="writing-configurations-builder-intro">
                Now do the handing-out yourself. The builder below holds <WorkedElementName />'s{" "}
                <WorkedElectronCount /> electrons — the same element as the example, so changing
                one changes the other. Click{" "}
                <InlineFormula latex="\clr{roomS}{1s}" colorMap={{ roomS: roomColor("s") }} /> first, then keep
                clicking the next subshell in the filling order — a click on the wrong subshell is
                refused, and the configuration is written underneath as you go.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-writing-configurations-builder" maxWidth="xl">
        <Block id="writing-configurations-builder" padding="sm" hasVisualization>
            <ConfigurationBuilderFigure />
        </Block>
    </StackLayout>,

    <StackLayout key="layout-writing-configurations-check" maxWidth="xl">
        <Block id="writing-configurations-check" padding="sm">
            <EditableParagraph id="para-writing-configurations-check" blockId="writing-configurations-check">
                Always check your answer by adding the raised numbers. For atomic number{" "}
                <InlineScrubbleNumber
                    id="scrub-writing-configurations-atomic-number"
                    varName="atomicNumber"
                    {...numberPropsFromDefinition(getVariableInfo("atomicNumber"))}
                />
                , which is <ElementNameReadout />, the full configuration is{" "}
                <ConfigurationReadout />, and the raised numbers add to <ConfigurationSumReadout />.
                Beyond calcium the <InlineFormula latex="\clr{roomD}{3d}" colorMap={{ roomD: roomColor("d") }} /> room starts to fill, and the same
                method still works — you simply carry on down the filling order.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-writing-configurations-question" maxWidth="xl">
        <Block id="writing-configurations-question" padding="sm">
            <EditableParagraph id="para-writing-configurations-question" blockId="writing-configurations-question">
                Chlorine has one more electron than sulfur, 17 in all. Without using the builder,
                its configuration ends in <InlineFormula latex="\clr{roomP}{3p}" colorMap={{ roomP: roomColor("p") }} /> with a raised number of{" "}
                <InlineFeedback
                    varName="chlorineLastCountAnswer"
                    correctValue="5"
                    position="terminal"
                    successMessage="— right: sulfur's 3p⁴ gains one more electron, and 3p still has room for it"
                    failureMessage="— not quite."
                    hint="Sulfur ends in 3p⁴ and the 3p room holds up to 6"
                    reviewBlockId="writing-configurations-builder"
                    reviewLabel="Build chlorine to check"
                >
                    <InlineClozeInput
                        id="cloze-writing-configurations-chlorine"
                        varName="chlorineLastCountAnswer"
                        correctAnswer="5"
                        {...clozePropsFromDefinition(getVariableInfo("chlorineLastCountAnswer"))}
                    />
                </InlineFeedback>
                .
            </EditableParagraph>
        </Block>
    </StackLayout>,
];
