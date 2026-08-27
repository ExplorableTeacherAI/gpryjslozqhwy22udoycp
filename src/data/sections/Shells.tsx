import { type ReactElement } from "react";
import { Block } from "@/components/templates";
import { StackLayout } from "@/components/layouts";
import { EditableH2, EditableParagraph, InlineFormula } from "@/components/atoms";
import { FormulaBlock } from "@/components/molecules";
import { VisualOptionCards } from "@/components/organisms";

export const shellsBlocks: ReactElement[] = [
    <StackLayout key="layout-shells-heading" maxWidth="xl">
        <Block id="shells-heading" padding="sm">
            <EditableH2 id="h2-shells-heading" blockId="shells-heading">
                2. Shells — the floors of the building
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-shells-definition" maxWidth="xl">
        <Block id="shells-definition" padding="sm">
            <EditableParagraph id="para-shells-definition" blockId="shells-definition">
                A shell is one main energy level around the nucleus — one floor of our building.
                Shells are numbered <InlineFormula latex="n = 1" />,{" "}
                <InlineFormula latex="n = 2" />, <InlineFormula latex="n = 3" /> and so on,
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
                against that attraction, which takes energy — exactly like carrying a box up to a
                higher floor. This is why electrons settle into the lowest empty floors first.
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
            <FormulaBlock latex="\text{maximum electrons in shell } n = 2n^2" />
        </Block>
    </StackLayout>,

    <StackLayout key="layout-shells-capacity-worked" maxWidth="xl">
        <Block id="shells-capacity-worked" padding="sm">
            <EditableParagraph id="para-shells-capacity-worked" blockId="shells-capacity-worked">
                Step through it for the first three shells. Shell 1:{" "}
                <InlineFormula latex="2 \times 1^2 = 2" /> electrons. Shell 2:{" "}
                <InlineFormula latex="2 \times 2^2 = 8" /> electrons. Shell 3:{" "}
                <InlineFormula latex="2 \times 3^2 = 18" /> electrons. Notice that the capacity
                grows quickly, and that only the first two shells happen to stop at 2 and 8.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-shells-visual" maxWidth="xl">
        <Block id="shells-visual" padding="sm">
            <VisualOptionCards
                blockId="shells-visual"
                intro="Pick how your students will explore shells and how much each one holds."
                cards={[
                    {
                        id: "shell-stack-filler",
                        title: "A stack of shells that students fill with electrons one at a time",
                        looks: "Rings around a nucleus, each labelled with its shell number and how many of its places are taken, such as 2 of 8.",
                        manipulate: "Students add or remove electrons with a control and watch each shell fill up and then spill over into the next one.",
                        reveals: "A shell only accepts a fixed number of electrons, and the count for each shell follows two times n squared.",
                        recommended: true,
                    },
                    {
                        id: "capacity-bar-chart",
                        title: "A bar chart of how many electrons each shell can hold",
                        looks: "Four bars labelled shell 1 to shell 4 with heights 2, 8, 18 and 32, with the calculation shown above each bar.",
                        manipulate: "Students click a bar to see its capacity worked out step by step.",
                        reveals: "Capacity grows with the square of the shell number rather than in equal steps.",
                    },
                    {
                        id: "energy-ladder-shells",
                        title: "An energy ladder with the shells as rungs at different heights",
                        looks: "A vertical energy axis with shell 1 low down and higher shells stacked above it, getting closer together near the top.",
                        manipulate: "Students drag an electron up and down the ladder and see the energy needed to move it.",
                        reveals: "Higher shells mean higher energy, and the gaps between shells shrink as you go up.",
                    },
                ]}
            />
        </Block>
    </StackLayout>,
];
