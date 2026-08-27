import { type ReactElement } from "react";
import { Block } from "@/components/templates";
import { StackLayout } from "@/components/layouts";
import { EditableH2, EditableParagraph, InlineFormula } from "@/components/atoms";
import { FormulaBlock } from "@/components/molecules";
import { VisualOptionCards } from "@/components/organisms";

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
                raised number. So <InlineFormula latex="2p^4" /> means four electrons in the{" "}
                <InlineFormula latex="p" /> room on floor 2.
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
                Take sulfur, which has 16 electrons. Put 2 into{" "}
                <InlineFormula latex="1s" /> (14 left), 2 into <InlineFormula latex="2s" />{" "}
                (12 left), 6 into <InlineFormula latex="2p" /> (6 left), 2 into{" "}
                <InlineFormula latex="3s" /> (4 left), and the last 4 go into{" "}
                <InlineFormula latex="3p" />, which could have taken 6. Writing that out gives:
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-writing-configurations-sulfur" maxWidth="xl">
        <Block id="writing-configurations-sulfur" padding="lg">
            <FormulaBlock latex="\text{S} : \; 1s^2 \, 2s^2 \, 2p^6 \, 3s^2 \, 3p^4" />
        </Block>
    </StackLayout>,

    <StackLayout key="layout-writing-configurations-check" maxWidth="xl">
        <Block id="writing-configurations-check" padding="sm">
            <EditableParagraph id="para-writing-configurations-check" blockId="writing-configurations-check">
                Always check your answer by adding the raised numbers:{" "}
                <InlineFormula latex="2 + 2 + 6 + 2 + 4 = 16" />, which matches sulfur's electron
                count. Beyond calcium the <InlineFormula latex="3d" /> room starts to fill, and
                the same method still works — you simply carry on down the filling order.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-writing-configurations-visual" maxWidth="xl">
        <Block id="writing-configurations-visual" padding="sm">
            <VisualOptionCards
                blockId="writing-configurations-visual"
                intro="Pick how your students will practise building configurations for themselves."
                cards={[
                    {
                        id: "configuration-builder",
                        title: "A builder where students pick an element and hand out its electrons",
                        looks: "An element chosen from a list, a counter of electrons still to place, and the configuration being written out as it is built.",
                        manipulate: "Students click a subshell to drop the next electrons into it, and wrong choices are flagged straight away.",
                        reveals: "Following the filling order step by step produces the written configuration automatically.",
                        recommended: true,
                    },
                    {
                        id: "periodic-table-blocks",
                        title: "A periodic table coloured by the subshell being filled",
                        looks: "The first twenty elements laid out as in the periodic table, coloured by whether an s or a p subshell is filling.",
                        manipulate: "Students click any element to see its full configuration appear beside the table.",
                        reveals: "The shape of the periodic table is simply a map of which subshell is filling.",
                    },
                    {
                        id: "animated-fill-sequence",
                        title: "An animation that fills an element's orbitals one electron at a time",
                        looks: "Orbital boxes for each subshell with arrows appearing in them as the count rises, and the configuration written underneath.",
                        manipulate: "Students step forward and back through the electrons one at a time or play the whole sequence.",
                        reveals: "How the written configuration and the orbital picture describe the same arrangement.",
                    },
                ]}
            />
        </Block>
    </StackLayout>,
];
