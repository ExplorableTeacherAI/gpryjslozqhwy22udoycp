/**
 * Electron-configuration domain model shared by every figure in this lesson.
 * Every drawing derives from these tables — no visual quantity is hand-placed.
 */

export type RoomLetter = "s" | "p" | "d" | "f";

/** Orbitals (desks) per room type; capacity is twice this. */
export const ORBITALS_PER_ROOM: Record<RoomLetter, number> = { s: 1, p: 3, d: 5, f: 7 };

export const ROOM_ORDER: RoomLetter[] = ["s", "p", "d", "f"];

/** Room letter → the ℓ value used by the n + ℓ rule. */
export const ROOM_INDEX: Record<RoomLetter, number> = { s: 0, p: 1, d: 2, f: 3 };

export const roomCapacity = (room: RoomLetter): number => 2 * ORBITALS_PER_ROOM[room];

/** Maximum electrons in shell n: 2n². */
export const shellCapacity = (n: number): number => 2 * n * n;

/** The rooms on floor n, in the order they are added: s, p, d, f. */
export const roomsOnFloor = (n: number): RoomLetter[] => ROOM_ORDER.slice(0, n);

export interface Subshell {
    key: string;
    n: number;
    room: RoomLetter;
    capacity: number;
    /** Relative energy on a 0–1 scale, used for ladder heights. */
    energy: number;
}

/**
 * Subshells in filling order up to 4p (36 electrons, krypton). The energies are
 * schematic but keep the one ordering that matters here: 4s sits just below 3d.
 */
export const FILL_ORDER: Subshell[] = [
    { key: "1s", n: 1, room: "s", capacity: 2, energy: 0.0 },
    { key: "2s", n: 2, room: "s", capacity: 2, energy: 0.28 },
    { key: "2p", n: 2, room: "p", capacity: 6, energy: 0.36 },
    { key: "3s", n: 3, room: "s", capacity: 2, energy: 0.54 },
    { key: "3p", n: 3, room: "p", capacity: 6, energy: 0.62 },
    { key: "4s", n: 4, room: "s", capacity: 2, energy: 0.74 },
    { key: "3d", n: 3, room: "d", capacity: 10, energy: 0.82 },
    { key: "4p", n: 4, room: "p", capacity: 6, energy: 0.94 },
];

export const MAX_ELECTRONS = FILL_ORDER.reduce((sum, s) => sum + s.capacity, 0);

export interface Occupancy {
    subshell: Subshell;
    electrons: number;
}

/** Hand out `count` electrons along the filling order, lowest energy first. */
export const fillSubshells = (count: number): Occupancy[] => {
    let remaining = Math.max(0, Math.min(MAX_ELECTRONS, Math.round(count)));
    return FILL_ORDER.map((subshell) => {
        const electrons = Math.min(subshell.capacity, remaining);
        remaining -= electrons;
        return { subshell, electrons };
    });
};

/** The subshell that received the most recent electron, or null when count is 0. */
export const lastFilledSubshell = (count: number): Subshell | null => {
    const occupied = fillSubshells(count).filter((o) => o.electrons > 0);
    return occupied.length ? occupied[occupied.length - 1].subshell : null;
};

/** Written configuration such as "1s² 2s² 2p⁶ 3s² 3p⁴". */
const SUPERSCRIPTS = ["⁰", "¹", "²", "³", "⁴", "⁵", "⁶", "⁷", "⁸", "⁹"];
export const superscript = (value: number): string =>
    String(value).split("").map((digit) => SUPERSCRIPTS[Number(digit)]).join("");

export const configurationText = (count: number): string =>
    fillSubshells(count)
        .filter((o) => o.electrons > 0)
        .map((o) => `${o.subshell.key}${superscript(o.electrons)}`)
        .join(" ");

/**
 * Simple shell-capacity picture (2, 8, 18, 32) used in the Shells section
 * before the true filling order is introduced.
 */
export const fillShellsSimple = (count: number, shells = 4): number[] => {
    let remaining = Math.max(0, Math.round(count));
    return Array.from({ length: shells }, (_, index) => {
        const n = index + 1;
        const electrons = Math.min(shellCapacity(n), remaining);
        remaining -= electrons;
        return electrons;
    });
};

export interface ElementInfo {
    symbol: string;
    name: string;
}

/** Elements 1–36, indexed by atomic number (index 0 unused). */
export const ELEMENTS: ElementInfo[] = [
    { symbol: "", name: "" },
    { symbol: "H", name: "Hydrogen" },
    { symbol: "He", name: "Helium" },
    { symbol: "Li", name: "Lithium" },
    { symbol: "Be", name: "Beryllium" },
    { symbol: "B", name: "Boron" },
    { symbol: "C", name: "Carbon" },
    { symbol: "N", name: "Nitrogen" },
    { symbol: "O", name: "Oxygen" },
    { symbol: "F", name: "Fluorine" },
    { symbol: "Ne", name: "Neon" },
    { symbol: "Na", name: "Sodium" },
    { symbol: "Mg", name: "Magnesium" },
    { symbol: "Al", name: "Aluminium" },
    { symbol: "Si", name: "Silicon" },
    { symbol: "P", name: "Phosphorus" },
    { symbol: "S", name: "Sulfur" },
    { symbol: "Cl", name: "Chlorine" },
    { symbol: "Ar", name: "Argon" },
    { symbol: "K", name: "Potassium" },
    { symbol: "Ca", name: "Calcium" },
    { symbol: "Sc", name: "Scandium" },
    { symbol: "Ti", name: "Titanium" },
    { symbol: "V", name: "Vanadium" },
    { symbol: "Cr", name: "Chromium" },
    { symbol: "Mn", name: "Manganese" },
    { symbol: "Fe", name: "Iron" },
    { symbol: "Co", name: "Cobalt" },
    { symbol: "Ni", name: "Nickel" },
    { symbol: "Cu", name: "Copper" },
    { symbol: "Zn", name: "Zinc" },
    { symbol: "Ga", name: "Gallium" },
    { symbol: "Ge", name: "Germanium" },
    { symbol: "As", name: "Arsenic" },
    { symbol: "Se", name: "Selenium" },
    { symbol: "Br", name: "Bromine" },
    { symbol: "Kr", name: "Krypton" },
];

export const elementFor = (atomicNumber: number): ElementInfo =>
    ELEMENTS[Math.max(1, Math.min(ELEMENTS.length - 1, Math.round(atomicNumber)))];

/** Design tokens shared by the figures (see FIGURE_DESIGN_LANGUAGE.md). */
export const INK = "#334155";
export const INK_SOFT = "#64748B";
export const INK_FAINT = "#CBD5E1";
export const PAPER_TINT = "#F1F5F9";
export const ACCENT = "#62D0AD";
export const ACCENT_SOFT = "rgba(98, 208, 173, 0.18)";

/** One colour per shell, used wherever a shell is named: rings, electrons, labels, prose. */
export const SHELL_COLORS = ["#62D0AD", "#8E90F5", "#F7B23B", "#AC8BF9"];
export const shellColor = (n: number): string => SHELL_COLORS[(n - 1) % SHELL_COLORS.length];
export const shellColorSoft = (n: number): string => {
    const hex = shellColor(n);
    const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
    return `rgba(${r}, ${g}, ${b}, 0.18)`;
};
