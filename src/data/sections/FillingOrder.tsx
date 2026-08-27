import { type ReactElement } from "react";
import { Block } from "@/components/templates";
import { StackLayout } from "@/components/layouts";
import { EditableH2, EditableParagraph, InlineFormula } from "@/components/atoms";
import { FormulaBlock } from "@/components/molecules";
import { VisualOptionCards } from "@/components/organisms";

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
                by energy, from lowest to highest.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-filling-order-sequence" maxWidth="xl">
        <Block id="filling-order-sequence" padding="lg">
            <FormulaBlock latex="1s \;\rightarrow\; 2s \;\rightarrow\; 2p \;\rightarrow\; 3s \;\rightarrow\; 3p \;\rightarrow\; 4s \;\rightarrow\; 3d \;\rightarrow\; 4p" />
        </Block>
    </StackLayout>,

    <StackLayout key="layout-filling-order-surprise" maxWidth="xl">
        <Block id="filling-order-surprise" padding="sm">
            <EditableParagraph id="para-filling-order-surprise" blockId="filling-order-surprise">
                Read that list again and one step looks wrong: <InlineFormula latex="4s" /> comes
                before <InlineFormula latex="3d" />. The order is not simply lowest shell number
                first, because the rooms on one floor spread out in energy far enough to overlap
                the floor above. The <InlineFormula latex="4s" /> room sits slightly lower in
                energy than the <InlineFormula latex="3d" /> room, so electrons take it first.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-filling-order-rule" maxWidth="xl">
        <Block id="filling-order-rule" padding="sm">
            <EditableParagraph id="para-filling-order-rule" blockId="filling-order-rule">
                A quick way to remember the sequence: subshells fill in order of the sum of the
                shell number and the room type, where <InlineFormula latex="s" /> counts as 0,{" "}
                <InlineFormula latex="p" /> as 1 and <InlineFormula latex="d" /> as 2. For{" "}
                <InlineFormula latex="4s" /> the sum is <InlineFormula latex="4 + 0 = 4" />, and
                for <InlineFormula latex="3d" /> it is <InlineFormula latex="3 + 2 = 5" /> — so{" "}
                <InlineFormula latex="4s" /> fills first. When two subshells give the same sum,
                the one with the smaller shell number goes first.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-filling-order-visual" maxWidth="xl">
        <Block id="filling-order-visual" padding="sm">
            <VisualOptionCards
                blockId="filling-order-visual"
                intro="Pick how your students will discover the order subshells fill in."
                cards={[
                    {
                        id: "energy-ladder-order",
                        title: "An energy ladder where every subshell sits at its true height",
                        looks: "A vertical energy scale with a labelled rung for each subshell, so the 4s rung visibly sits just below the 3d rung.",
                        manipulate: "Students add electrons one at a time and each one drops onto the lowest free rung.",
                        reveals: "The filling order comes straight from energy, which is why 4s is taken before 3d.",
                        recommended: true,
                    },
                    {
                        id: "diagonal-arrows",
                        title: "The classic diagonal-arrow chart for the filling sequence",
                        looks: "A grid of subshells arranged by shell number with diagonal arrows sweeping across it in the filling order.",
                        manipulate: "Students follow the arrows step by step, and each subshell lights up in the sequence it is used.",
                        reveals: "The sequence is easy to reproduce from memory, including the jump from 4s to 3d.",
                    },
                    {
                        id: "sort-the-subshells",
                        title: "A sorting activity where students order the subshells themselves",
                        looks: "Scattered subshell labels above an empty numbered line waiting to be filled in.",
                        manipulate: "Students drag the labels into the order they think is correct and get feedback on each placement.",
                        reveals: "Where their intuition about the order breaks down, especially around 4s and 3d.",
                    },
                ]}
            />
        </Block>
    </StackLayout>,
];
