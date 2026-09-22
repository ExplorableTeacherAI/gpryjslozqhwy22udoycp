import { type ReactElement } from "react";
import { Block } from "@/components/templates";
import { StackLayout } from "@/components/layouts";
import {
    EditableH2,
    EditableParagraph,
    InlineFormula,
    InlineClozeChoice,
    InlineFeedback,
    InlineScrubbleNumber,
    InlineTrigger,
    InteractionHintSequence,
} from "@/components/atoms";
import { FormulaBlock, Figure, FigureSlider } from "@/components/molecules";
import { useVar, useSetVar } from "@/stores";
import { clamp, useSpring } from "@/lib/motion";
import { getVariableInfo, choicePropsFromDefinition, numberPropsFromDefinition } from "../variables";
import {
    INK_SOFT,
    INK_FAINT,
    PAPER_TINT,
    FILL_ORDER,
    MAX_ELECTRONS,
    ORBITALS_PER_ROOM,
    fillSubshells,
    lastFilledSubshell,
    type Subshell,
    roomColor,
} from "./electronModel";
import { StepButton } from "./electronFigureParts";

// ── Energy ladder ───────────────────────────────────────────────────────────
// Rungs are placed by the model's schematic energies; each shell has its own
// column so the 4s rung is seen to sit below the 3d rung.
const VIEW = { width: 560, height: 420 };
const LADDER_TOP = 48;
const LADDER_BOTTOM = VIEW.height - 64;
const COLUMN_X: Record<number, number> = { 1: 96, 2: 186, 3: 290, 4: 420 };
const SLOT = 20; // one orbital (desk) per slot
const SLOT_GAP = 4;

const rungY = (subshell: Subshell) => LADDER_BOTTOM - subshell.energy * (LADDER_BOTTOM - LADDER_TOP);
const rungWidth = (subshell: Subshell) => ORBITALS_PER_ROOM[subshell.room] * (SLOT + SLOT_GAP) - SLOT_GAP;

function Rung({ subshell, electrons, newest }: { subshell: Subshell; electrons: number; newest: boolean }) {
    const y = rungY(subshell);
    const x = COLUMN_X[subshell.n];
    const width = rungWidth(subshell);
    const pop = useSpring(newest ? 1 : 0, { stiffness: 260, damping: 22 });
    const orbitals = ORBITALS_PER_ROOM[subshell.room];

    return (
        <g>
            {/* Halo on the rung that just received an electron */}
            <line
                x1={x - 4}
                y1={y}
                x2={x + width + 4}
                y2={y}
                stroke={roomColor(subshell.room)}
                strokeWidth={10}
                strokeOpacity={0.28 * pop}
                strokeLinecap="round"
            />
            <line
                x1={x}
                y1={y}
                x2={x + width}
                y2={y}
                stroke={roomColor(subshell.room)}
                strokeWidth={electrons === subshell.capacity ? 3 : 2}
                strokeOpacity={electrons === subshell.capacity ? 1 : 0.6}
                strokeLinecap="round"
            />
            {Array.from({ length: orbitals }, (_, index) => {
                const slotX = x + index * (SLOT + SLOT_GAP);
                const inSlot = clamp(electrons - index * 2, 0, 2);
                return (
                    <g key={index}>
                        <rect x={slotX} y={y - SLOT - 2} width={SLOT} height={SLOT} rx="3" fill={PAPER_TINT} stroke={INK_FAINT} strokeWidth="1" />
                        {inSlot >= 1 && <circle cx={slotX + SLOT * 0.32} cy={y - SLOT / 2 - 2} r="3.5" fill={roomColor(subshell.room)} />}
                        {inSlot >= 2 && <circle cx={slotX + SLOT * 0.68} cy={y - SLOT / 2 - 2} r="3.5" fill={roomColor(subshell.room)} />}
                    </g>
                );
            })}
            <text
                x={x - 8}
                y={y - 6}
                textAnchor="end"
                fontSize="13"
                fill={roomColor(subshell.room)}
                fontWeight={newest ? 800 : 600}
                style={{ fontVariantNumeric: "tabular-nums" }}
            >
                {subshell.key}
            </text>
            <text x={x + width + 8} y={y - 6} fontSize="10" fill={INK_FAINT} style={{ fontVariantNumeric: "tabular-nums" }}>
                {`${electrons}/${subshell.capacity}`}
            </text>
        </g>
    );
}

function EnergyLadderDrawing() {
    const setVar = useSetVar();
    const count = useVar<number>("fillingElectronCount", 18);
    const occupancy = fillSubshells(count);
    const newest = lastFilledSubshell(count);
    const step = (delta: number) => setVar("fillingElectronCount", clamp(count + delta, 0, MAX_ELECTRONS));

    return (
        <svg viewBox={`0 0 ${VIEW.width} ${VIEW.height}`} className="block w-full select-none">
            {/* Energy axis */}
            <line x1={40} y1={LADDER_BOTTOM + 8} x2={40} y2={LADDER_TOP - 8} stroke={INK_FAINT} strokeWidth="1.5" strokeLinecap="round" />
            <polygon points={`${40},${LADDER_TOP - 14} ${35},${LADDER_TOP - 4} ${45},${LADDER_TOP - 4}`} fill={INK_FAINT} />
            <text x={40} y={LADDER_TOP - 22} textAnchor="middle" fontSize="11" fill={INK_SOFT}>
                energy
            </text>

            {/* Column headings: the shell each rung belongs to */}
            {Object.entries(COLUMN_X).map(([n, x]) => (
                <text key={n} x={x + 20} y={VIEW.height - 40} textAnchor="middle" fontSize="11" fill={INK_SOFT}>
                    {`shell ${n}`}
                </text>
            ))}

            {occupancy.map(({ subshell, electrons }) => (
                <Rung key={subshell.key} subshell={subshell} electrons={electrons} newest={newest?.key === subshell.key} />
            ))}

            {/* The crossing that matters: a dotted tie between 4s and 3d */}
            <line
                x1={COLUMN_X[4] + rungWidth(FILL_ORDER[5]) + 40}
                y1={rungY(FILL_ORDER[5])}
                x2={COLUMN_X[4] + rungWidth(FILL_ORDER[5]) + 40}
                y2={rungY(FILL_ORDER[6])}
                stroke={INK_FAINT}
                strokeWidth="1.5"
                strokeDasharray="2 3"
            />
            <text
                x={COLUMN_X[4] + rungWidth(FILL_ORDER[5]) + 46}
                y={(rungY(FILL_ORDER[5]) + rungY(FILL_ORDER[6])) / 2 + 4}
                fontSize="10"
                fill={INK_SOFT}
            >
                4s below 3d
            </text>

            {/* Readout, bottom-left, clear of the top rungs */}
            <text
                x={24}
                y={VIEW.height - 26}
                fontSize="12"
                fill={INK_SOFT}
                style={{ fontVariantNumeric: "tabular-nums" }}
            >
                {count === 0 ? "no electrons yet" : `${count} electron${count === 1 ? "" : "s"} · newest in ${newest?.key}`}
            </text>

            {/* In-picture controls, bottom-right */}
            <StepButton x={VIEW.width - 68} y={VIEW.height - 32} label="−" onClick={() => step(-1)} disabled={count <= 0} />
            <StepButton x={VIEW.width - 28} y={VIEW.height - 32} label="+" onClick={() => step(1)} disabled={count >= MAX_ELECTRONS} />
        </svg>
    );
}

function EnergyLadderFigure() {
    const setVar = useSetVar();
    return (
        <Figure
            id="filling-order-ladder"
            onReset={() => setVar("fillingElectronCount", 18)}
            caption="Every subshell is a rung at its true height, with one slot per orbital. Press + and each new electron drops onto the lowest rung that still has a free place."
        >
            <EnergyLadderDrawing />
            <div className="px-6 pb-5">
                <FigureSlider
                    varName="fillingElectronCount"
                    label="Electrons"
                    {...numberPropsFromDefinition(getVariableInfo("fillingElectronCount"))}
                    formatValue={(value) => `${value.toFixed(0)}`}
                />
            </div>
            <InteractionHintSequence
                hintKey="filling-order-ladder-add"
                steps={[{ gesture: "click", label: "Press + to drop in the next electron", position: { x: "86%", y: "70%" } }]}
            />
        </Figure>
    );
}

/** "Add one more electron": a trigger that snaps the count to one above its current value. */
function AddElectronTrigger() {
    const count = useVar<number>("fillingElectronCount", 18);
    const next = Math.min(MAX_ELECTRONS, count + 1);
    return (
        <InlineTrigger id="trigger-filling-order-add-one" varName="fillingElectronCount" value={next} icon="zap">
            drop in one more electron
        </InlineTrigger>
    );
}

function NewestSubshellReadout() {
    const count = useVar<number>("fillingElectronCount", 18);
    const newest = lastFilledSubshell(count);
    if (!newest) return <span>no subshell yet, the ladder is empty</span>;
    return (
        <span>
            the <span style={{ fontWeight: 700, color: roomColor(newest.room) }}>{newest.key}</span> rung
        </span>
    );
}

export const fillingOrderBlocks: ReactElement[] = [
    <StackLayout key="layout-filling-order-heading" maxWidth="xl">
        <Block id="filling-order-heading" padding="sm">
            <EditableH2 id="h2-filling-order-heading" blockId="filling-order-heading">
                5. The filling order
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-filling-order-principle" maxWidth="xl">
        <Block id="filling-order-principle" padding="sm">
            <EditableParagraph id="para-filling-order-principle" blockId="filling-order-principle">
                Electrons always take the lowest energy place that is still free. So to work out
                where the electrons of an atom go, all you need is the list of subshells sorted
                by energy, from lowest to highest. Before reading that list, build it yourself.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-filling-order-ladder" maxWidth="xl">
        <Block id="filling-order-ladder" padding="sm" hasVisualization>
            <EnergyLadderFigure />
        </Block>
    </StackLayout>,

    <StackLayout key="layout-filling-order-ladder-reading" maxWidth="xl">
        <Block id="filling-order-ladder-reading" padding="sm">
            <EditableParagraph id="para-filling-order-ladder-reading" blockId="filling-order-ladder-reading">
                With{" "}
                <InlineScrubbleNumber
                    id="scrub-filling-order-count"
                    varName="fillingElectronCount"
                    {...numberPropsFromDefinition(getVariableInfo("fillingElectronCount"))}
                />{" "}
                electrons on the ladder, the newest one sits on <NewestSubshellReadout />. The
                interesting moment is the nineteenth electron:{" "}
                <InlineTrigger id="trigger-filling-order-reset-eighteen" varName="fillingElectronCount" value={18} icon="refresh">
                    go back to 18 electrons
                </InlineTrigger>
                , then <AddElectronTrigger /> and watch where it lands. It skips the empty{" "}
                <InlineFormula latex="\clr{roomD}{3d}" colorMap={{ roomD: roomColor("d") }} /> rung and
                drops onto <InlineFormula latex="\clr{roomS}{4s}" colorMap={{ roomS: roomColor("s") }} />,
                because that rung is lower.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-filling-order-sequence" maxWidth="xl">
        <Block id="filling-order-sequence" padding="lg">
            <FormulaBlock
                latex="\clr{roomS}{1s} \;\rightarrow\; \clr{roomS}{2s} \;\rightarrow\; \clr{roomP}{2p} \;\rightarrow\; \clr{roomS}{3s} \;\rightarrow\; \clr{roomP}{3p} \;\rightarrow\; \clr{roomS}{4s} \;\rightarrow\; \clr{roomD}{3d} \;\rightarrow\; \clr{roomP}{4p}"
                colorMap={{ roomS: roomColor("s"), roomP: roomColor("p"), roomD: roomColor("d"), roomF: roomColor("f") }}
            />
        </Block>
    </StackLayout>,

    <StackLayout key="layout-filling-order-surprise" maxWidth="xl">
        <Block id="filling-order-surprise" padding="sm">
            <EditableParagraph id="para-filling-order-surprise" blockId="filling-order-surprise">
                Read that list again and one step looks wrong: <InlineFormula latex="\clr{roomS}{4s}" colorMap={{ roomS: roomColor("s") }} /> comes
                before <InlineFormula latex="\clr{roomD}{3d}" colorMap={{ roomD: roomColor("d") }} />. The order is not simply lowest shell number
                first, because the rooms on one floor spread out in energy far enough to overlap
                the floor above. The <InlineFormula latex="\clr{roomS}{4s}" colorMap={{ roomS: roomColor("s") }} /> room sits slightly lower in
                energy than the <InlineFormula latex="\clr{roomD}{3d}" colorMap={{ roomD: roomColor("d") }} /> room, so electrons take it first.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-filling-order-rule" maxWidth="xl">
        <Block id="filling-order-rule" padding="sm">
            <EditableParagraph id="para-filling-order-rule" blockId="filling-order-rule">
                A quick way to remember the sequence: subshells fill in order of the sum of the
                shell number and the room type, where <InlineFormula latex="\clr{roomS}{s}" colorMap={{ roomS: roomColor("s") }} /> counts as 0,{" "}
                <InlineFormula latex="\clr{roomP}{p}" colorMap={{ roomP: roomColor("p") }} /> as 1 and <InlineFormula latex="\clr{roomD}{d}" colorMap={{ roomD: roomColor("d") }} /> as 2. For{" "}
                <InlineFormula latex="\clr{roomS}{4s}" colorMap={{ roomS: roomColor("s") }} /> the sum is <InlineFormula latex="4 + 0 = 4" />, and
                for <InlineFormula latex="\clr{roomD}{3d}" colorMap={{ roomD: roomColor("d") }} /> it is <InlineFormula latex="3 + 2 = 5" />, so{" "}
                <InlineFormula latex="\clr{roomS}{4s}" colorMap={{ roomS: roomColor("s") }} /> fills first. When two subshells give the same sum,
                the one with the smaller shell number goes first.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-filling-order-question" maxWidth="xl">
        <Block id="filling-order-question" padding="sm">
            <EditableParagraph id="para-filling-order-question" blockId="filling-order-question">
                Potassium has 19 electrons. After the first 18 fill everything up to{" "}
                <InlineFormula latex="\clr{roomP}{3p}" colorMap={{ roomP: roomColor("p") }} />, its nineteenth electron goes into{" "}
                <InlineFeedback
                    varName="fillingNineteenthAnswer"
                    correctValue="4s"
                    position="terminal"
                    successMessage="(yes: 4s has the sum 4 + 0 = 4, lower than 3d's 3 + 2 = 5)"
                    failureMessage="(not quite)"
                    hint="Compare the sums: 4s gives 4 + 0, 3d gives 3 + 2"
                    reviewBlockId="filling-order-ladder"
                    reviewLabel="Drop the nineteenth electron on the ladder"
                >
                    <InlineClozeChoice
                        id="choice-filling-order-nineteenth"
                        varName="fillingNineteenthAnswer"
                        correctAnswer="4s"
                        options={["3d", "4s", "4p"]}
                        {...choicePropsFromDefinition(getVariableInfo("fillingNineteenthAnswer"))}
                    />
                </InlineFeedback>
                .
            </EditableParagraph>
        </Block>
    </StackLayout>,
];
