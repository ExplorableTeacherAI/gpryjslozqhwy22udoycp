import { type ReactElement, useRef, useState } from "react";
import { Block } from "@/components/templates";
import { StackLayout } from "@/components/layouts";
import {
    EditableH1,
    EditableH2,
    EditableParagraph,
    InlineLinkedHighlight,
    InlineScrubbleNumber,
    InlineToggle,
    InteractionHintSequence,
} from "@/components/atoms";
import { Figure, FigureSlider } from "@/components/molecules";
import { useVar, useSetVar } from "@/stores";
import { clamp, useSpring } from "@/lib/motion";
import {
    getVariableInfo,
    linkedHighlightPropsFromDefinition,
    numberPropsFromDefinition,
    togglePropsFromDefinition,
} from "../variables";
import { ACCENT, INK, INK_SOFT } from "./electronModel";
import { AddressBuildingFigure } from "./electronAddressFigure";

// ── Atom zoom model ─────────────────────────────────────────────────────────
// Lengths are in picometres. The view half-width shrinks exponentially with the
// zoom so that dragging feels even from the whole atom down to the nucleus.
const VIEW = { width: 560, height: 360 };
const CENTER = { x: VIEW.width / 2, y: VIEW.height / 2 };
const HALF_EXTENT_PX = VIEW.height / 2 - 24; // ≥24px interior padding
const ATOM_RADIUS_PM = 100;
const NUCLEUS_RADIUS_PM = 0.003; // ≈ 3 fm
const WIDE_HALF_PM = 130;
const NARROW_HALF_PM = 0.012; // the nucleus fills a quarter of the view

const halfExtentPm = (zoomPercent: number): number =>
    WIDE_HALF_PM * Math.pow(NARROW_HALF_PM / WIDE_HALF_PM, clamp(zoomPercent, 0, 100) / 100);

const formatLength = (pm: number): string =>
    pm >= 1 ? `${pm >= 10 ? pm.toFixed(0) : pm.toFixed(1)} pm` : `${(pm * 1000).toFixed(pm * 1000 >= 10 ? 0 : 1)} fm`;

const SCALE_BAR_CHOICES = [100, 50, 20, 10, 5, 2, 1, 0.5, 0.2, 0.1, 0.05, 0.02, 0.01, 0.005];

// Stepped density rings stand in for the probability cloud (no gradients).
const CLOUD_RINGS = [
    { fraction: 1.0, opacity: 0.08 },
    { fraction: 0.72, opacity: 0.06 },
    { fraction: 0.48, opacity: 0.06 },
    { fraction: 0.28, opacity: 0.07 },
];

function AtomZoomDrawing() {
    const setVar = useSetVar();
    const zoom = useVar<number>("atomZoom", 0);
    const highlight = useVar<string>("atomHighlight", "");
    const [dragging, setDragging] = useState(false);
    const dragStart = useRef<{ y: number; zoom: number } | null>(null);
    const svgRef = useRef<SVGSVGElement>(null);

    const halfPm = halfExtentPm(zoom);
    const pxPerPm = HALF_EXTENT_PX / halfPm;
    const cloudRadiusPx = ATOM_RADIUS_PM * pxPerPm;
    const nucleusRadiusPx = NUCLEUS_RADIUS_PM * pxPerPm;
    const nucleusVisible = nucleusRadiusPx >= 1.5;
    const cloudEdgeVisible = cloudRadiusPx <= HALF_EXTENT_PX;

    const scaleBarPm =
        SCALE_BAR_CHOICES.find((length) => length * pxPerPm <= 150 && length * pxPerPm >= 60) ??
        SCALE_BAR_CHOICES[SCALE_BAR_CHOICES.length - 1];
    const scaleBarPx = scaleBarPm * pxPerPm;

    const dim = (id: string) => (highlight && highlight !== id ? 0.4 : 1);
    const nucleusHalo = useSpring(highlight === "nucleus" ? 1 : 0, { stiffness: 300, damping: 24 });
    const cloudHalo = useSpring(highlight === "cloud" ? 1 : 0, { stiffness: 300, damping: 24 });

    // Dragging upward zooms in: direct 1:1 tracking from the pointer offset.
    const handlePointerMove = (event: React.PointerEvent<SVGSVGElement>) => {
        if (!dragging || !dragStart.current || !svgRef.current) return;
        const rect = svgRef.current.getBoundingClientRect();
        const dy = ((event.clientY - dragStart.current.y) / rect.height) * VIEW.height;
        setVar("atomZoom", Math.round(clamp(dragStart.current.zoom - dy * 0.45, 0, 100)));
    };

    const hoverProps = (id: string) => ({
        onPointerEnter: () => setVar("atomHighlight", id),
        onPointerLeave: () => setVar("atomHighlight", ""),
    });

    return (
        <svg
            ref={svgRef}
            viewBox={`0 0 ${VIEW.width} ${VIEW.height}`}
            className="block w-full select-none"
            style={{ cursor: dragging ? "grabbing" : "ns-resize", touchAction: "none" }}
            onPointerDown={(event) => {
                event.currentTarget.setPointerCapture(event.pointerId);
                dragStart.current = { y: event.clientY, zoom };
                setDragging(true);
            }}
            onPointerMove={handlePointerMove}
            onPointerUp={() => setDragging(false)}
            onPointerCancel={() => setDragging(false)}
        >
            <defs>
                <clipPath id="atom-zoom-clip">
                    <rect x="0" y="0" width={VIEW.width} height={VIEW.height} />
                </clipPath>
            </defs>

            <g clipPath="url(#atom-zoom-clip)">
                {/* Electron cloud: stepped density, one accent hue */}
                <g opacity={dim("cloud")} {...hoverProps("cloud")}>
                    {CLOUD_RINGS.map((ring) => (
                        <circle
                            key={ring.fraction}
                            cx={CENTER.x}
                            cy={CENTER.y}
                            r={cloudRadiusPx * ring.fraction}
                            fill={ACCENT}
                            fillOpacity={ring.opacity + cloudHalo * 0.04}
                        />
                    ))}
                    {cloudEdgeVisible && (
                        <circle
                            cx={CENTER.x}
                            cy={CENTER.y}
                            r={cloudRadiusPx}
                            fill="none"
                            stroke={ACCENT}
                            strokeWidth={1.5 + cloudHalo * 1.5}
                            strokeDasharray="4 4"
                        />
                    )}
                </g>

                {/* Nucleus: drawn at true scale, so it is invisible until zoomed in */}
                <g opacity={dim("nucleus")} {...hoverProps("nucleus")}>
                    <circle
                        cx={CENTER.x}
                        cy={CENTER.y}
                        r={Math.max(nucleusRadiusPx, 0.4)}
                        fill={INK}
                    />
                    {nucleusHalo > 0.01 && (
                        <circle
                            cx={CENTER.x}
                            cy={CENTER.y}
                            r={Math.max(nucleusRadiusPx, 4) + 8}
                            fill="none"
                            stroke={INK}
                            strokeWidth={2}
                            strokeOpacity={0.28 * nucleusHalo}
                        />
                    )}
                    {/* 24px hit target so the nucleus can be hovered even when tiny */}
                    <circle cx={CENTER.x} cy={CENTER.y} r={Math.max(nucleusRadiusPx, 12)} fill="transparent" />
                </g>
            </g>

            {/* Direct labels with leaders */}
            <g fontSize="12" fill={INK} opacity={dim("nucleus")} {...hoverProps("nucleus")}>
                <line
                    x1={CENTER.x + Math.max(nucleusRadiusPx, 2) + 4}
                    y1={CENTER.y - Math.max(nucleusRadiusPx, 2) - 4}
                    x2={CENTER.x + 60}
                    y2={CENTER.y - 48}
                    stroke={INK_SOFT}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                />
                <text x={CENTER.x + 64} y={CENTER.y - 52} fontWeight={highlight === "nucleus" ? 600 : 400}>
                    nucleus
                </text>
                <text x={CENTER.x + 64} y={CENTER.y - 37} fill={INK_SOFT} fontSize="11">
                    {nucleusVisible ? `about ${formatLength(2 * NUCLEUS_RADIUS_PM)} across` : "too small to draw at this zoom"}
                </text>
            </g>

            <g fontSize="12" fill={INK} opacity={dim("cloud")} {...hoverProps("cloud")}>
                {cloudEdgeVisible ? (
                    <>
                        <line
                            x1={CENTER.x - cloudRadiusPx * 0.7}
                            y1={CENTER.y + cloudRadiusPx * 0.7}
                            x2={CENTER.x - cloudRadiusPx * 0.7 - 30}
                            y2={CENTER.y + cloudRadiusPx * 0.7 + 30}
                            stroke={INK_SOFT}
                            strokeWidth="1.5"
                            strokeLinecap="round"
                        />
                        <text
                            x={CENTER.x - cloudRadiusPx * 0.7 - 34}
                            y={CENTER.y + cloudRadiusPx * 0.7 + 44}
                            textAnchor="end"
                            fontWeight={highlight === "cloud" ? 600 : 400}
                        >
                            electron cloud
                        </text>
                    </>
                ) : (
                    <text x={24} y={40} fontWeight={highlight === "cloud" ? 600 : 400}>
                        electron cloud fills the whole picture
                    </text>
                )}
            </g>

            {/* Scale bar, bottom-left */}
            <g fill={INK} fontSize="12" style={{ fontVariantNumeric: "tabular-nums" }}>
                <line
                    x1={24}
                    y1={VIEW.height - 28}
                    x2={24 + scaleBarPx}
                    y2={VIEW.height - 28}
                    stroke={INK}
                    strokeWidth="2"
                    strokeLinecap="round"
                />
                <line x1={24} y1={VIEW.height - 34} x2={24} y2={VIEW.height - 22} stroke={INK} strokeWidth="2" strokeLinecap="round" />
                <line x1={24 + scaleBarPx} y1={VIEW.height - 34} x2={24 + scaleBarPx} y2={VIEW.height - 22} stroke={INK} strokeWidth="2" strokeLinecap="round" />
                <text x={24 + scaleBarPx / 2} y={VIEW.height - 38} textAnchor="middle">
                    {formatLength(scaleBarPm)}
                </text>
            </g>

            {/* Readout, top-right */}
            <text
                x={VIEW.width - 24}
                y={40}
                textAnchor="end"
                fontSize="12"
                fill={INK_SOFT}
                style={{ fontVariantNumeric: "tabular-nums" }}
            >
                {`picture is ${formatLength(2 * halfPm)} across`}
            </text>
            <text x={VIEW.width - 24} y={VIEW.height - 28} textAnchor="end" fontSize="11" fill={INK_SOFT}>
                drag up to zoom in, down to zoom out
            </text>
        </svg>
    );
}

function AtomZoomFigure() {
    const setVar = useSetVar();
    return (
        <Figure
            id="electrons-live-zoom"
            onReset={() => setVar("atomZoom", 0)}
            caption="Drag upward on the picture, or use the slider, to zoom from the whole atom in to its nucleus. The scale bar shows how wide the picture really is."
        >
            <AtomZoomDrawing />
            <div className="px-6 pb-5">
                <FigureSlider
                    varName="atomZoom"
                    label="Zoom"
                    {...numberPropsFromDefinition(getVariableInfo("atomZoom"))}
                    formatValue={(value) => `${value.toFixed(0)} %`}
                />
            </div>
            <InteractionHintSequence
                hintKey="electrons-live-zoom-drag"
                steps={[
                    {
                        gesture: "drag-vertical",
                        label: "Drag upward to zoom in",
                        position: { x: "30%", y: "45%" },
                        dragPath: { type: "line", startOffset: { x: 0, y: 24 }, endOffset: { x: 0, y: -24 } },
                    },
                ]}
            />
        </Figure>
    );
}

function ZoomWidthReadout() {
    const zoom = useVar<number>("atomZoom", 0);
    return (
        <span style={{ fontVariantNumeric: "tabular-nums", fontWeight: 600, color: INK }}>
            {formatLength(2 * halfExtentPm(zoom))}
        </span>
    );
}

function NucleusVisibilityText() {
    const zoom = useVar<number>("atomZoom", 0);
    const nucleusPx = NUCLEUS_RADIUS_PM * (HALF_EXTENT_PX / halfExtentPm(zoom));
    if (nucleusPx < 1.5) {
        return <span>the nucleus is still too small to draw as anything more than a point</span>;
    }
    if (nucleusPx < 20) {
        return <span>the nucleus has just become a visible dot, and the cloud already fills everything</span>;
    }
    return <span>the nucleus finally looks like an object, and the cloud is far outside the frame</span>;
}

export const whereElectronsLiveBlocks: ReactElement[] = [
    <StackLayout key="layout-electrons-live-title" maxWidth="xl">
        <Block id="electrons-live-title" padding="md">
            <EditableH1 id="h1-electrons-live-title" blockId="electrons-live-title">
                Introduction to Electron Configurations
            </EditableH1>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-electrons-live-intro" maxWidth="xl">
        <Block id="electrons-live-intro" padding="sm">
            <EditableParagraph id="para-electrons-live-intro" blockId="electrons-live-intro">In this lesson we going to learn</EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-electrons-live-heading" maxWidth="xl">
        <Block id="electrons-live-heading" padding="sm">
            <EditableH2 id="h2-electrons-live-heading" blockId="electrons-live-heading">
                1. Where do electrons live?
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-electrons-live-opening" maxWidth="xl">
        <Block id="electrons-live-opening" padding="sm">
            <EditableParagraph id="para-electrons-live-opening" blockId="electrons-live-opening">
                Every atom has a tiny, heavy centre called the{" "}
                <InlineLinkedHighlight
                    id="highlight-electrons-live-nucleus"
                    varName="atomHighlight"
                    highlightId="nucleus"
                    {...linkedHighlightPropsFromDefinition(getVariableInfo("atomHighlight"))}
                >
                    nucleus
                </InlineLinkedHighlight>
                , and around it sit the electrons. The nucleus is packed into an incredibly small
                space, while the{" "}
                <InlineLinkedHighlight
                    id="highlight-electrons-live-cloud"
                    varName="atomHighlight"
                    highlightId="cloud"
                    showHint={false}
                    {...linkedHighlightPropsFromDefinition(getVariableInfo("atomHighlight"))}
                >
                    electron cloud
                </InlineLinkedHighlight>{" "}
                takes up almost all the room. Almost everything an atom does in chemistry — what
                it bonds with, how it reacts — depends on where those electrons are.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-electrons-live-zoom" maxWidth="xl">
        <Block id="electrons-live-zoom" padding="sm" hasVisualization>
            <AtomZoomFigure />
        </Block>
    </StackLayout>,

    <StackLayout key="layout-electrons-live-zoom-reading" maxWidth="xl">
        <Block id="electrons-live-zoom-reading" padding="sm">
            <EditableParagraph id="para-electrons-live-zoom-reading" blockId="electrons-live-zoom-reading">
                The picture starts at the size of a whole atom and the nucleus is drawn at its true
                size — a point you cannot see. With the zoom at{" "}
                <InlineScrubbleNumber
                    id="scrub-electrons-live-zoom"
                    varName="atomZoom"
                    {...numberPropsFromDefinition(getVariableInfo("atomZoom"))}
                    formatValue={(value) => `${value.toFixed(0)} %`}
                />
                {" "}the picture is <ZoomWidthReadout /> across, and <NucleusVisibilityText />. The
                atom is roughly thirty thousand times wider than its nucleus: if the nucleus were a
                marble in the middle of a football pitch, the electron cloud would reach the stands.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-electrons-live-building" maxWidth="xl">
        <Block id="electrons-live-building" padding="sm">
            <EditableParagraph id="para-electrons-live-building" blockId="electrons-live-building">
                A useful picture is an apartment building. The nucleus is the ground floor, and
                the electrons live on the floors above it. Electrons are not scattered randomly:
                there are only certain places they are allowed to be, and those places fill up in
                a fixed order, from the bottom of the building upwards.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-electrons-live-address-building" maxWidth="xl">
        <Block id="electrons-live-address-building" padding="sm" hasVisualization>
            <AddressBuildingFigure />
        </Block>
    </StackLayout>,

    <StackLayout key="layout-electrons-live-addresses" maxWidth="xl">
        <Block id="electrons-live-addresses" padding="sm">
            <EditableParagraph id="para-electrons-live-addresses" blockId="electrons-live-addresses">
                Over the next few sections we will build up the full address of an electron, one
                level of detail at a time: first the floor it lives on (the{" "}
                <InlineLinkedHighlight
                    id="highlight-electrons-live-shell"
                    varName="addressHighlight"
                    highlightId="floor"
                    showHint={false}
                    {...linkedHighlightPropsFromDefinition(getVariableInfo("addressHighlight"))}
                >
                    shell
                </InlineLinkedHighlight>
                ), then the room on that floor (the{" "}
                <InlineLinkedHighlight
                    id="highlight-electrons-live-subshell"
                    varName="addressHighlight"
                    highlightId="room"
                    showHint={false}
                    {...linkedHighlightPropsFromDefinition(getVariableInfo("addressHighlight"))}
                >
                    subshell
                </InlineLinkedHighlight>
                ), then the exact desk in that room (the{" "}
                <InlineLinkedHighlight
                    id="highlight-electrons-live-orbital"
                    varName="addressHighlight"
                    highlightId="desk"
                    showHint={false}
                    {...linkedHighlightPropsFromDefinition(getVariableInfo("addressHighlight"))}
                >
                    orbital
                </InlineLinkedHighlight>
                ). The building above is drawn down to the{" "}
                <InlineToggle
                    id="toggle-electrons-live-address-level"
                    varName="addressLevel"
                    options={["floor", "room", "desk"]}
                    {...togglePropsFromDefinition(getVariableInfo("addressLevel"))}
                />{" "}
                level so far. Once you can read that address, writing an electron configuration is
                just writing the addresses down in order.
            </EditableParagraph>
        </Block>
    </StackLayout>,
];
