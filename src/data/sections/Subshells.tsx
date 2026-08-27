import { type ReactElement } from "react";
import { Block } from "@/components/templates";
import { StackLayout } from "@/components/layouts";
import { EditableH2, EditableParagraph, InlineFormula, Table } from "@/components/atoms";
import { VisualOptionCards } from "@/components/organisms";

export const subshellsBlocks: ReactElement[] = [
    <StackLayout key="layout-subshells-heading" maxWidth="xl">
        <Block id="subshells-heading" padding="sm">
            <EditableH2 id="h2-subshells-heading" blockId="subshells-heading">
                3. Subshells — the rooms on each floor
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-subshells-definition" maxWidth="xl">
        <Block id="subshells-definition" padding="sm">
            <EditableParagraph id="para-subshells-definition" blockId="subshells-definition">
                A floor of a building is not one big open space — it is divided into rooms. In
                the same way, a shell is divided into subshells. The rooms have names rather than
                numbers: <InlineFormula latex="s" />, <InlineFormula latex="p" />,{" "}
                <InlineFormula latex="d" /> and <InlineFormula latex="f" />. Electrons in
                different rooms on the same floor have slightly different energies.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-subshells-count-rule" maxWidth="xl">
        <Block id="subshells-count-rule" padding="sm">
            <EditableParagraph id="para-subshells-count-rule" blockId="subshells-count-rule">
                Here is the rule that decides how many rooms a floor has: shell number{" "}
                <InlineFormula latex="n" /> contains exactly <InlineFormula latex="n" />{" "}
                subshells. So shell 1 has one room, shell 2 has two rooms, and shell 3 has three
                rooms. The rooms are always added in the order{" "}
                <InlineFormula latex="s" />, then <InlineFormula latex="p" />, then{" "}
                <InlineFormula latex="d" />.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-subshells-naming" maxWidth="xl">
        <Block id="subshells-naming" padding="sm">
            <EditableParagraph id="para-subshells-naming" blockId="subshells-naming">
                A subshell is named by writing its floor number in front of its room letter. So{" "}
                <InlineFormula latex="2p" /> means the <InlineFormula latex="p" /> room on floor
                2, and <InlineFormula latex="3d" /> means the <InlineFormula latex="d" /> room on
                floor 3. That two-part name is already most of an electron's address.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-subshells-table" maxWidth="xl">
        <Block id="subshells-table" padding="sm">
            <Table
                columns={[
                    { header: "Shell", align: "center", width: 100 },
                    { header: "Number of subshells", align: "center", width: 180 },
                    { header: "Subshells on that shell", align: "left" },
                ]}
                rows={[
                    { cells: ["1", "1", "1s"] },
                    { cells: ["2", "2", "2s, 2p"] },
                    { cells: ["3", "3", "3s, 3p, 3d"] },
                    { cells: ["4", "4", "4s, 4p, 4d, 4f"] },
                ]}
                color="#6366f1"
                caption="Each shell contains as many subshells as its shell number."
            />
        </Block>
    </StackLayout>,

    <StackLayout key="layout-subshells-visual" maxWidth="xl">
        <Block id="subshells-visual" padding="sm">
            <VisualOptionCards
                blockId="subshells-visual"
                intro="Pick how your students will see a shell split into its subshells."
                cards={[
                    {
                        id: "floor-plan-rooms",
                        title: "A floor plan where each shell opens up into its rooms",
                        looks: "A row of floors stacked one above the other; choosing a floor shows the rooms on it, labelled 1s, 2s, 2p and so on.",
                        manipulate: "Students click a floor number to open it and see how many rooms appear and what they are called.",
                        reveals: "Shell number n always contains n subshells, added in the order s, p, d.",
                        recommended: true,
                    },
                    {
                        id: "expanding-tree",
                        title: "A branching tree from atom to shells to subshells",
                        looks: "A tree starting at the atom, branching to each shell, and branching again to the subshells belonging to that shell.",
                        manipulate: "Students expand and collapse each branch to reveal the subshells underneath it.",
                        reveals: "Subshells sit inside shells, so every subshell name carries its shell number with it.",
                    },
                    {
                        id: "subshell-energy-strip",
                        title: "Energy levels where each shell splits into closely spaced lines",
                        looks: "A vertical energy scale where a single line for each shell separates into several nearby lines labelled s, p and d.",
                        manipulate: "Students toggle the split on and off to compare the simple shell picture with the detailed one.",
                        reveals: "Electrons on the same floor do not all have the same energy; the room they are in matters too.",
                    },
                ]}
            />
        </Block>
    </StackLayout>,
];
