import { type ReactElement } from "react";
import { Block } from "@/components/templates";
import { StackLayout } from "@/components/layouts";
import { EditableH2, EditableParagraph, InlineFormula, Table } from "@/components/atoms";
import { VisualOptionCards } from "@/components/organisms";

export const orbitalsBlocks: ReactElement[] = [
    <StackLayout key="layout-orbitals-heading" maxWidth="xl">
        <Block id="orbitals-heading" padding="sm">
            <EditableH2 id="h2-orbitals-heading" blockId="orbitals-heading">
                4. Orbitals — the desks in each room
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-orbitals-definition" maxWidth="xl">
        <Block id="orbitals-definition" padding="sm">
            <EditableParagraph id="para-orbitals-definition" blockId="orbitals-definition">
                Inside every room there are desks, and an orbital is one of those desks. An
                orbital is not a track the electron runs along — it is a region of space where
                that electron is very likely to be found. An <InlineFormula latex="s" /> orbital
                is a sphere around the nucleus; a <InlineFormula latex="p" /> orbital is a
                dumbbell shape pointing along one direction.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-orbitals-two-electrons" maxWidth="xl">
        <Block id="orbitals-two-electrons" padding="sm">
            <EditableParagraph id="para-orbitals-two-electrons" blockId="orbitals-two-electrons">
                The key rule is short: every orbital holds a maximum of two electrons, and those
                two must have opposite spins. Two electrons per desk, no exceptions — whether the
                desk is in an <InlineFormula latex="s" /> room or a <InlineFormula latex="d" />{" "}
                room.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-orbitals-counting" maxWidth="xl">
        <Block id="orbitals-counting" padding="sm">
            <EditableParagraph id="para-orbitals-counting" blockId="orbitals-counting">
                That single rule explains every capacity number in this lesson. Rooms differ only
                in how many desks they contain: an <InlineFormula latex="s" /> room has 1 desk, a{" "}
                <InlineFormula latex="p" /> room has 3, and a <InlineFormula latex="d" /> room has
                5. Multiply the number of desks by two and you get how many electrons the room
                holds.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-orbitals-table" maxWidth="xl">
        <Block id="orbitals-table" padding="sm">
            <Table
                columns={[
                    { header: "Subshell", align: "center", width: 110 },
                    { header: "Orbitals", align: "center", width: 110 },
                    { header: "Electrons it holds", align: "center", width: 160 },
                    { header: "Shape of each orbital", align: "left" },
                ]}
                rows={[
                    { cells: ["s", "1", "2", "A sphere around the nucleus"] },
                    { cells: ["p", "3", "6", "Three dumbbells at right angles"] },
                    { cells: ["d", "5", "10", "Five more complicated cloverleaf shapes"] },
                ]}
                color="#6366f1"
                caption="Two electrons per orbital gives every subshell its capacity."
            />
        </Block>
    </StackLayout>,

    <StackLayout key="layout-orbitals-shell-check" maxWidth="xl">
        <Block id="orbitals-shell-check" padding="sm">
            <EditableParagraph id="para-orbitals-shell-check" blockId="orbitals-shell-check">
                Check this against shell capacities from earlier. Shell 3 holds{" "}
                <InlineFormula latex="3s" /> plus <InlineFormula latex="3p" /> plus{" "}
                <InlineFormula latex="3d" />, which is{" "}
                <InlineFormula latex="2 + 6 + 10 = 18" /> electrons — exactly the{" "}
                <InlineFormula latex="2n^2" /> answer for <InlineFormula latex="n = 3" />. The two
                rules agree because they are describing the same building.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-orbitals-visual" maxWidth="xl">
        <Block id="orbitals-visual" padding="sm">
            <VisualOptionCards
                blockId="orbitals-visual"
                intro="Pick how your students will meet orbitals and the two-electrons-per-orbital rule."
                cards={[
                    {
                        id: "orbital-boxes",
                        title: "Boxes for orbitals that students fill with arrows for electrons",
                        looks: "A row of empty boxes grouped by subshell, one box per orbital, with up and down arrows standing for the two electrons.",
                        manipulate: "Students place electrons into the boxes and the display refuses any third electron in a box.",
                        reveals: "An orbital takes two electrons and no more, which is why s holds 2, p holds 6 and d holds 10.",
                        recommended: true,
                    },
                    {
                        id: "orbital-shapes-3d",
                        title: "Rotatable 3D shapes of the s and p orbitals",
                        looks: "A sphere for the s orbital and three dumbbells at right angles for the p orbitals, floating around a central nucleus.",
                        manipulate: "Students rotate the view and switch each orbital on or off to see how the shapes fit together.",
                        reveals: "Orbitals are regions of space with real shapes and directions, not circular paths.",
                    },
                    {
                        id: "probability-cloud",
                        title: "A dot cloud showing where an electron is actually found",
                        looks: "Thousands of small dots scattered around the nucleus, dense where the electron is likely and sparse where it is not.",
                        manipulate: "Students add more and more measurements and watch the cloud build up into the orbital shape.",
                        reveals: "An orbital is a map of likelihood, built from where the electron turns up rather than from a fixed path.",
                    },
                ]}
            />
        </Block>
    </StackLayout>,
];
