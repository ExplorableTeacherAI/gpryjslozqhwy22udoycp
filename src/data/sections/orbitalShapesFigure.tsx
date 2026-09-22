import { useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Billboard, Line, Text } from "@react-three/drei";
import * as THREE from "three";
import { InteractionHintSequence } from "@/components/atoms";
import { Figure } from "@/components/molecules";
import { useVar, useSetVar } from "@/stores";
import { clamp } from "@/lib/motion";
import { INK, INK_SOFT, ROOM_COLORS } from "./electronModel";

// ── Orbital shapes in 3D ────────────────────────────────────────────────────
// Each orbital is the surface r = |Y(θ, φ)| of its real angular function,
// drawn on its own x/y/z axes (chemistry convention: z up). Dragging anywhere
// rotates every orbital in place, so their orientations can be compared.
export type OrbitalFamily = "sphere" | "dumbbell" | "cloverleaf";

interface OrbitalSpec {
    key: string;
    label: string;
    family: OrbitalFamily;
    position: [number, number];
    /** Real angular function, normalised so the largest |value| is 1. */
    angular: (theta: number, phi: number) => number;
}

const FAMILY_COLOR: Record<OrbitalFamily, string> = {
    sphere: ROOM_COLORS.s,
    dumbbell: ROOM_COLORS.p,
    cloverleaf: ROOM_COLORS.d,
};

const ORBITALS: OrbitalSpec[] = [
    { key: "s", label: "s", family: "sphere", position: [0, 4.3], angular: () => 1 },
    { key: "px", label: "px", family: "dumbbell", position: [-3.2, 0.4], angular: (t, p) => Math.sin(t) * Math.cos(p) },
    { key: "py", label: "py", family: "dumbbell", position: [0, 0.4], angular: (t, p) => Math.sin(t) * Math.sin(p) },
    { key: "pz", label: "pz", family: "dumbbell", position: [3.2, 0.4], angular: (t) => Math.cos(t) },
    { key: "dxy", label: "dxy", family: "cloverleaf", position: [-6.4, -3.6], angular: (t, p) => Math.sin(t) ** 2 * Math.sin(2 * p) },
    { key: "dyz", label: "dyz", family: "cloverleaf", position: [-3.2, -3.6], angular: (t, p) => Math.sin(2 * t) * Math.sin(p) },
    { key: "dxz", label: "dxz", family: "cloverleaf", position: [0, -3.6], angular: (t, p) => Math.sin(2 * t) * Math.cos(p) },
    { key: "dx2y2", label: "dx²-y²", family: "cloverleaf", position: [3.2, -3.6], angular: (t, p) => Math.sin(t) ** 2 * Math.cos(2 * p) },
    { key: "dz2", label: "dz²", family: "cloverleaf", position: [6.4, -3.6], angular: (t) => (3 * Math.cos(t) ** 2 - 1) / 2 },
];

const LOBE_RADIUS = 1.05;
const AXIS_LENGTH = 1.45;
const SEGMENTS = 72;

/** Chemistry (x, y, z) with z up → three.js (x, z, −y), keeping the handedness. */
const toScene = (x: number, y: number, z: number): [number, number, number] => [x, z, -y];

/** Builds the surface r(θ, φ) = LOBE_RADIUS · |angular(θ, φ)| as a BufferGeometry. */
function buildOrbitalGeometry(angular: OrbitalSpec["angular"]): THREE.BufferGeometry {
    const positions: number[] = [];
    const indices: number[] = [];
    for (let i = 0; i <= SEGMENTS; i++) {
        const theta = (i / SEGMENTS) * Math.PI;
        for (let j = 0; j <= SEGMENTS; j++) {
            const phi = (j / SEGMENTS) * Math.PI * 2;
            const r = LOBE_RADIUS * Math.abs(angular(theta, phi));
            const x = r * Math.sin(theta) * Math.cos(phi);
            const y = r * Math.sin(theta) * Math.sin(phi);
            const z = r * Math.cos(theta);
            positions.push(...toScene(x, y, z));
        }
    }
    const row = SEGMENTS + 1;
    for (let i = 0; i < SEGMENTS; i++) {
        for (let j = 0; j < SEGMENTS; j++) {
            const a = i * row + j;
            const b = a + row;
            indices.push(a, b, a + 1, b, b + 1, a + 1);
        }
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    return geometry;
}

function Axes({ dimmed }: { dimmed: boolean }) {
    const color = dimmed ? "#CBD5E1" : INK_SOFT;
    const axes: Array<{ name: string; end: [number, number, number] }> = [
        { name: "x", end: toScene(AXIS_LENGTH, 0, 0) },
        { name: "y", end: toScene(0, AXIS_LENGTH, 0) },
        { name: "z", end: toScene(0, 0, AXIS_LENGTH) },
    ];
    return (
        <group>
            {axes.map((axis) => (
                <group key={axis.name}>
                    <Line
                        points={[axis.end.map((v) => -v) as [number, number, number], axis.end]}
                        color={color}
                        lineWidth={1.2}
                    />
                    {/* Billboard: the letter always faces the viewer, so it never reads mirrored */}
                    <Billboard position={axis.end.map((v) => v * 1.16) as [number, number, number]}>
                        <Text fontSize={0.26} color={dimmed ? "#CBD5E1" : INK} anchorX="center" anchorY="middle">
                            {axis.name}
                        </Text>
                    </Billboard>
                </group>
            ))}
        </group>
    );
}

function Orbital({
    spec,
    rotation,
    highlight,
    onHover,
}: {
    spec: OrbitalSpec;
    rotation: React.MutableRefObject<{ yaw: number; pitch: number }>;
    highlight: string;
    onHover: (family: OrbitalFamily | "") => void;
}) {
    const group = useRef<THREE.Group>(null);
    const geometry = useMemo(() => buildOrbitalGeometry(spec.angular), [spec]);
    const dimmed = highlight !== "" && highlight !== spec.family;
    const color = FAMILY_COLOR[spec.family];

    // Every orbital shares the same rotation, applied about its own centre.
    useFrame(() => {
        if (!group.current) return;
        group.current.rotation.set(rotation.current.pitch, rotation.current.yaw, 0, "YXZ");
    });

    return (
        <group position={[spec.position[0], spec.position[1], 0]}>
            <group ref={group}>
                <Axes dimmed={dimmed} />
                <mesh
                    geometry={geometry}
                    onPointerOver={(event) => {
                        event.stopPropagation();
                        onHover(spec.family);
                    }}
                    onPointerOut={() => onHover("")}
                >
                    <meshStandardMaterial
                        color={color}
                        roughness={0.55}
                        metalness={0.05}
                        transparent
                        opacity={dimmed ? 0.25 : 0.95}
                        emissive={color}
                        emissiveIntensity={highlight === spec.family ? 0.35 : 0.08}
                        side={THREE.DoubleSide}
                    />
                </mesh>
            </group>
            <Text
                position={[0, -AXIS_LENGTH - 0.3, 0]}
                fontSize={0.34}
                color={dimmed ? "#CBD5E1" : INK}
                anchorX="center"
                anchorY="middle"
            >
                {spec.label}
            </Text>
        </group>
    );
}

function SpinWhenIdle({ rotation, spinning, dragging }: { rotation: React.MutableRefObject<{ yaw: number; pitch: number }>; spinning: boolean; dragging: boolean }) {
    useFrame((_, delta) => {
        if (spinning && !dragging) rotation.current.yaw += delta * 0.35;
    });
    return null;
}

function OrbitalShapesScene({ resetRef }: { resetRef: React.MutableRefObject<(() => void) | null> }) {
    const setVar = useSetVar();
    const highlight = useVar<string>("orbitalShapeHighlight", "");
    const spinning = useVar<boolean>("orbitalSpinning", true);
    // Face-on to start: z up, x across, y towards the viewer.
    const rotation = useRef({ yaw: 0, pitch: 0 });
    const [dragging, setDragging] = useState(false);
    const last = useRef<{ x: number; y: number } | null>(null);
    resetRef.current = () => {
        rotation.current = { yaw: 0, pitch: 0 };
    };

    return (
        <div
            className="w-full"
            style={{ height: 480, cursor: dragging ? "grabbing" : "grab", touchAction: "none" }}
            onPointerDown={(event) => {
                event.currentTarget.setPointerCapture(event.pointerId);
                last.current = { x: event.clientX, y: event.clientY };
                setDragging(true);
            }}
            onPointerMove={(event) => {
                if (!dragging || !last.current) return;
                const dx = event.clientX - last.current.x;
                const dy = event.clientY - last.current.y;
                last.current = { x: event.clientX, y: event.clientY };
                rotation.current.yaw += dx * 0.01;
                rotation.current.pitch = clamp(rotation.current.pitch + dy * 0.01, -1.4, 1.4);
            }}
            onPointerUp={() => setDragging(false)}
            onPointerCancel={() => setDragging(false)}
        >
            <Canvas orthographic camera={{ position: [0, 0, 20], zoom: 31, near: 0.1, far: 100 }} dpr={[1, 2]} style={{ background: "#FFFFFF" }}>
                <ambientLight intensity={0.85} />
                <directionalLight position={[4, 8, 10]} intensity={1.1} />
                <directionalLight position={[-6, -3, 4]} intensity={0.35} />
                <SpinWhenIdle rotation={rotation} spinning={spinning} dragging={dragging} />
                {ORBITALS.map((spec) => (
                    <Orbital
                        key={spec.key}
                        spec={spec}
                        rotation={rotation}
                        highlight={highlight}
                        onHover={(family) => setVar("orbitalShapeHighlight", family)}
                    />
                ))}
            </Canvas>
        </div>
    );
}

export function OrbitalShapesFigure() {
    const setVar = useSetVar();
    const resetRotation = useRef<(() => void) | null>(null);
    return (
        <Figure
            id="orbitals-shapes"
            playable
            playVarName="orbitalSpinning"
            onReset={() => {
                setVar("orbitalSpinning", true);
                setVar("orbitalShapeHighlight", "");
                resetRotation.current?.();
            }}
            caption="The one s orbital, the three p orbitals and the five d orbitals, each on its own x, y, z axes, seen face-on with z pointing up. They turn slowly by themselves; drag anywhere to turn them yourself, or pause them. Every p orbital is the same dumbbell pointing along a different axis, and four of the d orbitals are the same cloverleaf in different planes; only dz² looks different."
        >
            <OrbitalShapesScene resetRef={resetRotation} />
            <InteractionHintSequence
                hintKey="orbitals-shapes-orbit"
                steps={[{ gesture: "orbit-3d", label: "Drag to rotate the orbitals", position: { x: "50%", y: "40%" } }]}
            />
        </Figure>
    );
}
