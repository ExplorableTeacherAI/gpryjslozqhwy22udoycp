/**
 * Variables Configuration
 * =======================
 * 
 * CENTRAL PLACE TO DEFINE ALL SHARED VARIABLES
 * 
 * This file defines all variables that can be shared across sections.
 * AI agents should read this file to understand what variables are available.
 * 
 * USAGE:
 * 1. Define variables here with their default values and metadata
 * 2. Use them in any section with: const x = useVar('variableName', defaultValue)
 * 3. Update them with: setVar('variableName', newValue)
 */

import { type VarValue } from '@/stores';

/**
 * Variable definition with metadata
 */
export interface VariableDefinition {
    /** Default value */
    defaultValue: VarValue;
    /** Human-readable label */
    label?: string;
    /** Description for AI agents */
    description?: string;
    /** Variable type hint */
    type?: 'number' | 'text' | 'boolean' | 'select' | 'array' | 'object' | 'spotColor' | 'linkedHighlight';
    /** Unit (e.g., 'Hz', '°', 'm/s') - for numbers */
    unit?: string;
    /** Minimum value (for number sliders) */
    min?: number;
    /** Maximum value (for number sliders) */
    max?: number;
    /** Step increment (for number sliders) */
    step?: number;
    /** Display color for InlineScrubbleNumber / InlineSpotColor (e.g. '#D81B60') */
    color?: string;
    /** Options for 'select' type variables */
    options?: string[];
    /** Placeholder text for text inputs */
    placeholder?: string;
    /**
     * Correct answer for cloze input validation.
     * Accepts a single string, pipe-separated alternates (e.g. "first | 1 | 1st"),
     * or an array of accepted answers (e.g. ["first", "1", "1st"]).
     */
    correctAnswer?: string | string[];
    /** Whether cloze matching is case sensitive */
    caseSensitive?: boolean;
    /** Background color for inline components */
    bgColor?: string;
    /** Schema hint for object types (for AI agents) */
    schema?: string;
}

/**
 * =====================================================
 * 🎯 DEFINE YOUR VARIABLES HERE
 * =====================================================
 * 
 * SUPPORTED TYPES:
 * 
 * 1. NUMBER (slider):
 *    { defaultValue: 5, type: 'number', min: 0, max: 10, step: 1 }
 * 
 * 2. TEXT (free text):
 *    { defaultValue: 'Hello', type: 'text', placeholder: 'Enter text...' }
 * 
 * 3. SELECT (dropdown):
 *    { defaultValue: 'sine', type: 'select', options: ['sine', 'cosine', 'tangent'] }
 * 
 * 4. BOOLEAN (toggle):
 *    { defaultValue: true, type: 'boolean' }
 * 
 * 5. ARRAY (list of numbers):
 *    { defaultValue: [1, 2, 3], type: 'array' }
 * 
 * 6. OBJECT (complex data):
 *    { defaultValue: { x: 5, y: 10 }, type: 'object', schema: '{ x: number, y: number }' }
 */
export const variableDefinitions: Record<string, VariableDefinition> = {
    // ─────────────────────────────────────────
    // Section 1 — Where do electrons live?
    // ─────────────────────────────────────────
    atomZoom: {
        defaultValue: 0,
        type: 'number',
        label: 'Zoom into the atom',
        description: '0 shows the whole atom, 100 zooms all the way in to the nucleus',
        unit: '%',
        min: 0,
        max: 100,
        step: 1,
        color: '#62D0AD',
    },
    atomHighlight: {
        defaultValue: '',
        type: 'linkedHighlight',
        label: 'Atom part highlight',
        description: 'Which part of the atom picture is highlighted: nucleus or cloud',
        color: '#62D0AD',
        bgColor: 'rgba(98, 208, 173, 0.18)',
    },

    addressLevel: {
        defaultValue: 'floor',
        type: 'select',
        label: 'Address detail level',
        description: 'How much of an electron address the building shows: floor, room or desk',
        options: ['floor', 'room', 'desk'],
        color: '#D946EF',
    },
    addressDesk: {
        defaultValue: '2p-2',
        type: 'text',
        label: 'Selected desk',
        description: 'The desk whose address is shown, as <shell><room>-<desk number>',
    },
    addressHighlight: {
        defaultValue: '',
        type: 'linkedHighlight',
        label: 'Address part highlight',
        description: 'Which part of the selected address is highlighted: floor, room or desk',
        color: '#62D0AD',
        bgColor: 'rgba(98, 208, 173, 0.18)',
    },

    // ─────────────────────────────────────────
    // Section 2 — Shells
    // ─────────────────────────────────────────
    shellElectronCount: {
        defaultValue: 11,
        type: 'number',
        label: 'Electrons in the atom',
        description: 'How many electrons are placed into the shells (simple capacity picture)',
        min: 1,
        max: 28,
        step: 1,
        color: '#62D0AD',
    },
    shellHighlight: {
        defaultValue: '',
        type: 'linkedHighlight',
        label: 'Shell highlight',
        description: 'Which shell ring is highlighted: shell-1, shell-2, shell-3',
        color: '#62D0AD',
        bgColor: 'rgba(98, 208, 173, 0.18)',
    },
    shellNumber: {
        defaultValue: 3,
        type: 'number',
        label: 'Shell number n',
        description: 'The shell number n in the capacity formula 2n²',
        min: 1,
        max: 5,
        step: 1,
        color: '#62CCF9',
    },
    shellCapacityValue: {
        defaultValue: 18,
        type: 'number',
        label: 'Shell capacity 2n²',
        description: 'Derived: 2 × shellNumber², kept in sync by the capacity figure',
        min: 2,
        max: 50,
        step: 1,
    },
    shellSixCapacityAnswer: {
        defaultValue: '',
        type: 'select',
        label: 'Shell 6 capacity answer',
        description: 'Student answer for the maximum electrons in shell 6 (2 × 6² = 72); distractors are 2 × 6, 6² and 2 × 6 × 6 − 8',
        placeholder: '???',
        correctAnswer: '72',
        options: ['12', '36', '64', '72'],
        color: '#D81B60',
    },

    // ─────────────────────────────────────────
    // Section 3 — Subshells
    // ─────────────────────────────────────────
    subshellFloor: {
        defaultValue: '2',
        type: 'select',
        label: 'Selected floor',
        description: 'Which shell (floor) is opened up to show its rooms',
        options: ['1', '2', '3', '4'],
        color: '#62CCF9',
    },
    subshellThirdRoomAnswer: {
        defaultValue: '',
        type: 'select',
        label: 'Third room on floor 3',
        description: 'Student answer for the name of the third room on floor 3',
        placeholder: '???',
        correctAnswer: '3d',
        options: ['3s', '3p', '3d', '3f'],
        color: '#D81B60',
    },

    // ─────────────────────────────────────────
    // Section 4 — Orbitals
    // ─────────────────────────────────────────
    orbitalSpinning: {
        defaultValue: true,
        type: 'boolean',
        label: 'Orbitals spinning',
        description: 'Play state of the 3D orbital-shape figure: slowly rotates all orbitals while true',
    },
    orbitalShapeHighlight: {
        defaultValue: '',
        type: 'linkedHighlight',
        label: 'Orbital shape highlight',
        description: 'Which orbital shape panel is highlighted: sphere, dumbbell or cloverleaf',
        color: '#62D0AD',
        bgColor: 'rgba(98, 208, 173, 0.18)',
    },
    orbitalRoom: {
        defaultValue: 'p',
        type: 'select',
        label: 'Room type',
        description: 'Which room type is shown as orbital boxes: s, p or d',
        options: ['s', 'p', 'd'],
        color: '#D946EF',
    },
    orbitalBoxes: {
        defaultValue: [0, 0, 0, 0, 0],
        type: 'array',
        label: 'Electrons per orbital box',
        description: 'How many electrons (0-2) sit in each of the five possible orbital boxes',
    },
    orbitalFRoomAnswer: {
        defaultValue: '',
        type: 'text',
        label: 'f room capacity answer',
        description: 'Student answer for how many electrons an f room (7 desks) holds',
        placeholder: '???',
        correctAnswer: '14',
        color: '#3B82F6',
    },

    // ─────────────────────────────────────────
    // Section 5 — Filling order
    // ─────────────────────────────────────────
    fillingElectronCount: {
        defaultValue: 18,
        type: 'number',
        label: 'Electrons on the ladder',
        description: 'How many electrons have been dropped onto the energy ladder',
        min: 0,
        max: 36,
        step: 1,
        color: '#62D0AD',
    },
    fillingNineteenthAnswer: {
        defaultValue: '',
        type: 'select',
        label: 'Nineteenth electron answer',
        description: 'Student answer for the subshell the nineteenth electron takes',
        placeholder: '???',
        correctAnswer: '4s',
        options: ['3d', '4s', '4p'],
        color: '#D81B60',
    },

    // ─────────────────────────────────────────
    // Section 6 — Writing a configuration
    // ─────────────────────────────────────────
    workedElement: {
        defaultValue: 'sulfur',
        type: 'select',
        label: 'Worked-example element',
        description: 'Which element the worked configuration example walks through',
        options: ['sulfur', 'oxygen', 'sodium', 'chlorine', 'calcium', 'iron'],
        color: '#D946EF',
    },
    atomicNumber: {
        defaultValue: 16,
        type: 'number',
        label: 'Atomic number',
        description: 'Atomic number (= electrons in the neutral atom) of the element being built',
        min: 1,
        max: 36,
        step: 1,
        color: '#62D0AD',
    },
    builderPlaced: {
        defaultValue: 0,
        type: 'number',
        label: 'Electrons handed out',
        description: 'How many of the element\'s electrons the student has placed so far',
        min: 0,
        max: 36,
        step: 1,
    },
    chlorineLastCountAnswer: {
        defaultValue: '',
        type: 'text',
        label: 'Chlorine 3p count answer',
        description: 'Student answer for the raised number on 3p in chlorine',
        placeholder: '???',
        correctAnswer: '5',
        color: '#3B82F6',
    },
};

/**
 * Get all variable names (for AI agents to discover)
 */
export const getVariableNames = (): string[] => {
    return Object.keys(variableDefinitions);
};

/**
 * Get a variable's default value
 */
export const getDefaultValue = (name: string): VarValue => {
    return variableDefinitions[name]?.defaultValue ?? 0;
};

/**
 * Get a variable's metadata
 */
export const getVariableInfo = (name: string): VariableDefinition | undefined => {
    return variableDefinitions[name];
};

/**
 * Get all default values as a record (for initialization)
 */
export const getDefaultValues = (): Record<string, VarValue> => {
    const defaults: Record<string, VarValue> = {};
    for (const [name, def] of Object.entries(variableDefinitions)) {
        defaults[name] = def.defaultValue;
    }
    return defaults;
};

/**
 * Get number props for InlineScrubbleNumber from a variable definition.
 * Use with getVariableInfo(name) in blocks.tsx, or getExampleVariableInfo(name) in exampleBlocks.tsx.
 */
export function numberPropsFromDefinition(def: VariableDefinition | undefined): {
    defaultValue?: number;
    min?: number;
    max?: number;
    step?: number;
    color?: string;
} {
    if (!def || def.type !== 'number') return {};
    return {
        defaultValue: def.defaultValue as number,
        min: def.min,
        max: def.max,
        step: def.step,
        ...(def.color ? { color: def.color } : {}),
    };
}

/**
 * Get cloze input props for InlineClozeInput from a variable definition.
 * Use with getVariableInfo(name) in blocks.tsx, or getExampleVariableInfo(name) in exampleBlocks.tsx.
 */
/**
 * Get cloze choice props for InlineClozeChoice from a variable definition.
 * Use with getVariableInfo(name) in blocks.tsx.
 */
export function choicePropsFromDefinition(def: VariableDefinition | undefined): {
    placeholder?: string;
    color?: string;
    bgColor?: string;
} {
    if (!def || def.type !== 'select') return {};
    return {
        ...(def.placeholder ? { placeholder: def.placeholder } : {}),
        ...(def.color ? { color: def.color } : {}),
        ...(def.bgColor ? { bgColor: def.bgColor } : {}),
    };
}

/**
 * Get toggle props for InlineToggle from a variable definition.
 * Use with getVariableInfo(name) in blocks.tsx.
 */
export function togglePropsFromDefinition(def: VariableDefinition | undefined): {
    color?: string;
    bgColor?: string;
} {
    if (!def || def.type !== 'select') return {};
    return {
        ...(def.color ? { color: def.color } : {}),
        ...(def.bgColor ? { bgColor: def.bgColor } : {}),
    };
}

export function clozePropsFromDefinition(def: VariableDefinition | undefined): {
    placeholder?: string;
    color?: string;
    bgColor?: string;
    caseSensitive?: boolean;
} {
    if (!def || def.type !== 'text') return {};
    return {
        ...(def.placeholder ? { placeholder: def.placeholder } : {}),
        ...(def.color ? { color: def.color } : {}),
        ...(def.bgColor ? { bgColor: def.bgColor } : {}),
        ...(def.caseSensitive !== undefined ? { caseSensitive: def.caseSensitive } : {}),
    };
}

/**
 * Get spot-color props for InlineSpotColor from a variable definition.
 * Extracts the `color` field.
 *
 * @example
 * <InlineSpotColor
 *     varName="radius"
 *     {...spotColorPropsFromDefinition(getVariableInfo('radius'))}
 * >
 *     radius
 * </InlineSpotColor>
 */
export function spotColorPropsFromDefinition(def: VariableDefinition | undefined): {
    color: string;
} {
    return {
        color: def?.color ?? '#8B5CF6',
    };
}

/**
 * Get linked-highlight props for InlineLinkedHighlight from a variable definition.
 * Extracts the `color` and `bgColor` fields.
 *
 * @example
 * <InlineLinkedHighlight
 *     varName="activeHighlight"
 *     highlightId="radius"
 *     {...linkedHighlightPropsFromDefinition(getVariableInfo('activeHighlight'))}
 * >
 *     radius
 * </InlineLinkedHighlight>
 */
export function linkedHighlightPropsFromDefinition(def: VariableDefinition | undefined): {
    color?: string;
    bgColor?: string;
} {
    return {
        ...(def?.color ? { color: def.color } : {}),
        ...(def?.bgColor ? { bgColor: def.bgColor } : {}),
    };
}

/**
 * Build the `variables` prop for FormulaBlock from variable definitions.
 *
 * Takes an array of variable names and returns the config map expected by
 * `<FormulaBlock variables={...} />`.
 *
 * @example
 * import { scrubVarsFromDefinitions } from './variables';
 *
 * <FormulaBlock
 *     latex="\scrub{mass} \times \scrub{accel}"
 *     variables={scrubVarsFromDefinitions(['mass', 'accel'])}
 * />
 */
export function scrubVarsFromDefinitions(
    varNames: string[],
): Record<string, { min?: number; max?: number; step?: number; color?: string }> {
    const result: Record<string, { min?: number; max?: number; step?: number; color?: string }> = {};
    for (const name of varNames) {
        const def = variableDefinitions[name];
        if (!def) continue;
        result[name] = {
            ...(def.min !== undefined ? { min: def.min } : {}),
            ...(def.max !== undefined ? { max: def.max } : {}),
            ...(def.step !== undefined ? { step: def.step } : {}),
            ...(def.color ? { color: def.color } : {}),
        };
    }
    return result;
}
