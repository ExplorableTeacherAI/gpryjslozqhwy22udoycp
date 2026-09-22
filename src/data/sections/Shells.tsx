import { type ReactElement } from "react";
import { Block } from "@/components/templates";
import { StackLayout } from "@/components/layouts";
import {
    EditableH2,
    EditableParagraph,
    InlineFormula,
    InlineClozeChoice,
    InlineFeedback,
    InlineLinkedHighlight,
    InlineScrubbleNumber,
    InteractionHintSequence,
} from "@/components/atoms";
import { FormulaBlock, Figure, FigureSlider } from "@/components/molecules";
import { useVar, useSetVar } from "@/stores";
import { clamp, useSpring } from "@/lib/motion";
import {
    getVariableInfo,
    choicePropsFromDefinition,
    linkedHighlightPropsFromDefinition,
    numberPropsFromDefinition,
    scrubVarsFromDefinitions,
} from "../variables";
import { INK, INK_SOFT, INK_FAINT, N_COLOR, fillShellsSimple, shellCapacity, shellColor, shellColorSoft } from "./electronModel";
import { ShellCapacityFigure } from "./shellCapacityFigure";
import { StepButton } from "./electronFigureParts";

// ── Shell picture ───────────────────────────────────────────────────────────
const VIEW = { width: 560, height: 360 };
const CENTER = { x: 230, y: 180 };
const SHELL_RADII = [46, 88, 134];
const SHELL_COUNT = SHELL_RADII.length;
const MAX_SIMPLE = SHELL_RADII.reduce((sum, _r, index) => sum + shellCapacity(index + 1), 0); // 28
const ELECTRON_RADIUS = 6;
const LABEL_X = 420;

const shellId = (n: number) => `shell-${n}`;

function ShellRing({ n, electrons, newestIndex }: { n: number; electrons: number; newestIndex: number | null }) {
    const setVar = useSetVar();
    const highlight = useVar<string>("shellHighlight", "");
    const capacity = shellCapacity(n);
    const radius = SHELL_RADII[n - 1];
    const id = shellId(n);
    const isTarget = highlight === id;
    const pop = useSpring(isTarget ? 1 : 0, { stiffness: 300, damping: 24 });
    const opacity = highlight && !isTarget ? 0.38 : 1;
    const full = electrons === capacity;
    const color = shellColor(n);
    const labelY = 64 + (SHELL_COUNT - n) * 30; // one label row per ring, outermost on top

    return (
        <g
            opacity={opacity}
            onPointerEnter={() => setVar("shellHighlight", id)}
            onPointerLeave={() => setVar("shellHighlight", "")}
            style={{ cursor: "default" }}
        >
            {/* Halo appears on hover; the ring itself thickens */}
            <circle
                cx={CENTER.x}
                cy={CENTER.y}
                r={radius}
                fill="none"
                stroke={color}
                strokeWidth={2 + pop * 6}
                strokeOpacity={0.28 * pop}
            />
            <circle
                cx={CENTER.x}
                cy={CENTER.y}
                r={radius}
                fill="none"
                stroke={color}
                strokeWidth={(full ? 2.5 : 1.5) + pop * 1.5}
                strokeDasharray={full ? undefined : "3 5"}
                strokeLinecap="round"
            />
            {Array.from({ length: electrons }, (_, index) => {
                const angle = -Math.PI / 2 + (index / capacity) * Math.PI * 2;
                const isNewest = newestIndex === index;
                return (
                    <circle
                        key={index}
                        cx={CENTER.x + radius * Math.cos(angle)}
                        cy={CENTER.y + radius * Math.sin(angle)}
                        r={isNewest ? ELECTRON_RADIUS + 2 : ELECTRON_RADIUS}
                        fill={color}
                        stroke={isNewest ? INK : "none"}
                        strokeWidth={isNewest ? 1.5 : 0}
                    />
                );
            })}
            {/* Label column on the right, one row per ring, leader to the ring's 45° point */}
            <line
                x1={CENTER.x + radius * Math.SQRT1_2 + 4}
                y1={CENTER.y - radius * Math.SQRT1_2 - 4}
                x2={LABEL_X - 8}
                y2={labelY - 4}
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeOpacity="0.7"
            />
            <text
                x={LABEL_X}
                y={labelY}
                fontSize="12"
                fill={color}
                fontWeight={isTarget ? 700 : 600}
                style={{ fontVariantNumeric: "tabular-nums" }}
            >
                {`shell ${n}: ${electrons} of ${capacity}`}
            </text>
            {/* Invisible wide band so the ring can be hovered comfortably */}
            <circle cx={CENTER.x} cy={CENTER.y} r={radius} fill="none" stroke="transparent" strokeWidth={22} />
        </g>
    );
}

function ShellFillDrawing() {
    const setVar = useSetVar();
    const count = useVar<number>("shellElectronCount", 11);
    const perShell = fillShellsSimple(count, SHELL_COUNT);
    // The newest electron is the last one placed: the last dot of the outermost occupied shell.
    const outermost = perShell.reduce((last, electrons, index) => (electrons > 0 ? index : last), -1);
    const step = (delta: number) => setVar("shellElectronCount", clamp(count + delta, 1, MAX_SIMPLE));

    return (
        <svg viewBox={`0 0 ${VIEW.width} ${VIEW.height}`} className="block w-full select-none">
            {/* Nucleus: the ground floor */}
            <circle cx={CENTER.x} cy={CENTER.y} r="11" fill={INK} />
            <text x={CENTER.x} y={CENTER.y + 4} textAnchor="middle" fontSize="9" fill="#FFFFFF" fontWeight={600}>
                +
            </text>

            {SHELL_RADII.map((_radius, index) => (
                <ShellRing
                    key={index}
                    n={index + 1}
                    electrons={perShell[index]}
                    newestIndex={outermost === index ? perShell[index] - 1 : null}
                />
            ))}

            {/* Readout, top-right */}
            <text
                x={VIEW.width - 24}
                y={40}
                textAnchor="end"
                fontSize="12"
                fill={INK_SOFT}
                style={{ fontVariantNumeric: "tabular-nums" }}
            >
                {`${count} electron${count === 1 ? "" : "s"} placed`}
            </text>

            {/* In-picture controls, bottom-right */}
            <text x={VIEW.width - 92} y={VIEW.height - 28} textAnchor="end" fontSize="11" fill={INK_FAINT}>
                add or remove an electron
            </text>
            <StepButton x={VIEW.width - 68} y={VIEW.height - 32} label="−" onClick={() => step(-1)} disabled={count <= 1} />
            <StepButton x={VIEW.width - 28} y={VIEW.height - 32} label="+" onClick={() => step(1)} disabled={count >= MAX_SIMPLE} />
        </svg>
    );
}

function ShellFillFigure() {
    const setVar = useSetVar();
    return (
        <Figure
            id="shells-fill"
            onReset={() => {
                setVar("shellElectronCount", 11);
                setVar("shellHighlight", "");
            }}
            caption="Press + to add electrons one at a time. Each shell takes electrons until it is full, then the next shell starts. Hover a ring to pick it out."
        >
            <ShellFillDrawing />
            <div className="px-6 pb-5">
                <FigureSlider
                    varName="shellElectronCount"
                    label="Electrons"
                    {...numberPropsFromDefinition(getVariableInfo("shellElectronCount"))}
                    formatValue={(value) => `${value.toFixed(0)}`}
                />
            </div>
            <InteractionHintSequence
                hintKey="shells-fill-add"
                steps={[{ gesture: "click", label: "Press + to add an electron", position: { x: "92%", y: "70%" } }]}
            />
        </Figure>
    );
}

function ShellCountReadout({ n }: { n: number }) {
    const count = useVar<number>("shellElectronCount", 11);
    const electrons = fillShellsSimple(count, SHELL_COUNT)[n - 1];
    return (
        <span style={{ fontVariantNumeric: "tabular-nums", fontWeight: 700, color: shellColor(n) }}>
            {electrons}
        </span>
    );
}

function ShellNumberReadout() {
    const n = useVar<number>("shellNumber", 3);
    return <span style={{ fontWeight: 700, color: N_COLOR, fontVariantNumeric: "tabular-nums" }}>{n}</span>;
}

function ShellNumberCapacityReadout() {
    const n = useVar<number>("shellNumber", 3);
    return (
        <span style={{ fontWeight: 700, color: N_COLOR, fontVariantNumeric: "tabular-nums" }}>
            {shellCapacity(n)}
        </span>
    );
}

export const shellsBlocks: ReactElement[] = [
    <StackLayout key="layout-shells-heading" maxWidth="xl">
        <Block id="shells-heading" padding="sm">
            <EditableH2 id="h2-shells-heading" blockId="shells-heading">Shells: the floors of the building</EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-shells-definition" maxWidth="xl">
        <Block id="shells-definition" padding="sm">
            <EditableParagraph id="para-shells-definition" blockId="shells-definition">
                A shell is one main energy level around the nucleus, one floor of our building.
                Shells are numbered <InlineFormula latex="\clr{n}{n} = \clr{n}{1}" colorMap={{ n: N_COLOR }} />,{" "}
                <InlineFormula latex="\clr{n}{n} = \clr{n}{2}" colorMap={{ n: N_COLOR }} />, <InlineFormula latex="\clr{n}{n} = \clr{n}{3}" colorMap={{ n: N_COLOR }} /> and so on,
                starting from the floor closest to the nucleus. The bigger the number, the
                further out the shell sits and the more energy an electron there has.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-shells-energy-idea" maxWidth="xl">
        <Block id="shells-energy-idea" padding="sm">
            <EditableParagraph id="para-shells-energy-idea" blockId="shells-energy-idea">
                Why does a further shell mean more energy? The nucleus is positive and electrons
                are negative, so they attract. Moving an electron further out means pulling
                against that attraction, which takes energy, exactly like carrying a box up to a
                higher floor. This is why electrons settle into the lowest empty floors first.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-shells-fill" maxWidth="xl">
        <Block id="shells-fill" padding="sm" hasVisualization>
            <ShellFillFigure />
        </Block>
    </StackLayout>,

    <StackLayout key="layout-shells-fill-reading" maxWidth="xl">
        <Block id="shells-fill-reading" padding="sm">
            <EditableParagraph id="para-shells-fill-reading" blockId="shells-fill-reading">
                Watch where each new electron lands. With{" "}
                <InlineScrubbleNumber
                    id="scrub-shells-electron-count"
                    varName="shellElectronCount"
                    {...numberPropsFromDefinition(getVariableInfo("shellElectronCount"))}
                />{" "}
                electrons in the atom,{" "}
                <InlineLinkedHighlight
                    id="highlight-shells-one"
                    varName="shellHighlight"
                    highlightId="shell-1"
                    {...linkedHighlightPropsFromDefinition(getVariableInfo("shellHighlight"))}
                    color={shellColor(1)}
                    bgColor={shellColorSoft(1)}
                >
                    shell 1
                </InlineLinkedHighlight>{" "}
                holds <ShellCountReadout n={1} />,{" "}
                <InlineLinkedHighlight
                    id="highlight-shells-two"
                    varName="shellHighlight"
                    highlightId="shell-2"
                    showHint={false}
                    {...linkedHighlightPropsFromDefinition(getVariableInfo("shellHighlight"))}
                    color={shellColor(2)}
                    bgColor={shellColorSoft(2)}
                >
                    shell 2
                </InlineLinkedHighlight>{" "}
                holds <ShellCountReadout n={2} /> and{" "}
                <InlineLinkedHighlight
                    id="highlight-shells-three"
                    varName="shellHighlight"
                    highlightId="shell-3"
                    showHint={false}
                    {...linkedHighlightPropsFromDefinition(getVariableInfo("shellHighlight"))}
                    color={shellColor(3)}
                    bgColor={shellColorSoft(3)}
                >
                    shell 3
                </InlineLinkedHighlight>{" "}
                holds <ShellCountReadout n={3} />. A ring turns solid the moment it is full, and
                only then does the next ring start to take electrons.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-shells-capacity" maxWidth="xl">
        <Block id="shells-capacity" padding="sm">
            <EditableParagraph id="para-shells-capacity" blockId="shells-capacity">
                Higher floors are bigger, so they have room for more electrons. The maximum
                number of electrons a shell can hold depends only on its number:
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-shells-capacity-formula" maxWidth="xl">
        <Block id="shells-capacity-formula" padding="lg">
            <FormulaBlock
                latex="\text{maximum electrons in shell } \clr{n}{n} = 2\clr{n}{n}^2 \qquad \text{so for } \clr{n}{n} = \scrub{shellNumber}: \; 2 \times \scrub{shellNumber}^2 = \val{shellCapacityValue}"
                colorMap={{ n: N_COLOR, shellCapacityValue: N_COLOR }}
                variables={scrubVarsFromDefinitions(["shellNumber"])}
            />
        </Block>
    </StackLayout>,

    <StackLayout key="layout-shells-capacity-squares" maxWidth="xl">
        <Block id="shells-capacity-squares" padding="sm" hasVisualization>
            <ShellCapacityFigure />
        </Block>
    </StackLayout>,

    <StackLayout key="layout-shells-capacity-worked" maxWidth="xl">
        <Block id="shells-capacity-worked" padding="sm">
            <EditableParagraph id="para-shells-capacity-worked" blockId="shells-capacity-worked">
                Drag <InlineFormula latex="\clr{n}{n}" colorMap={{ n: N_COLOR }} /> in the formula, or
                the corner of the square. With <InlineFormula latex="\clr{n}{n}" colorMap={{ n: N_COLOR }} />{" "}
                at{" "}
                <InlineScrubbleNumber
                    id="scrub-shells-number"
                    varName="shellNumber"
                    {...numberPropsFromDefinition(getVariableInfo("shellNumber"))}
                />
                , each square holds <ShellNumberReadout /> × <ShellNumberReadout /> electrons, and two of them
                make <ShellNumberCapacityReadout />. Going up one shell does not add a fixed number of
                places; it adds a whole new row and column to each square, which is why the
                capacities run 2, 8, 18, 32 and only the first two happen to look small.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-shells-capacity-question" maxWidth="xl">
        <Block id="shells-capacity-question" padding="sm">
            <EditableParagraph id="para-shells-capacity-question" blockId="shells-capacity-question">
                The squares stop at <InlineFormula latex="\clr{n}{n} = \clr{n}{5}" colorMap={{ n: N_COLOR }} />,
                but the rule keeps going. Picture shell 6 as two squares of 6 × 6 electrons: the
                most electrons shell 6 can hold is{" "}
                <InlineFeedback
                    varName="shellSixCapacityAnswer"
                    correctValue="72"
                    position="terminal"
                    successMessage="(exactly: two squares of 6 × 6 is 2 × 36 = 72)"
                    failureMessage="(not quite)"
                    hint="Square the shell number first (6 × 6), then double it; 36 is only one square, and 12 forgets to square"
                    reviewBlockId="shells-capacity-squares"
                    reviewLabel="Drag n to 5 and imagine one more row"
                >
                    <InlineClozeChoice
                        id="choice-shells-six-capacity"
                        varName="shellSixCapacityAnswer"
                        correctAnswer="72"
                        options={["12", "36", "64", "72"]}
                        {...choicePropsFromDefinition(getVariableInfo("shellSixCapacityAnswer"))}
                    />
                </InlineFeedback>
                .
            </EditableParagraph>
        </Block>
    </StackLayout>,
];
