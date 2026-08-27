import { type ReactElement } from "react";
import { Block } from "@/components/templates";
import { StackLayout } from "@/components/layouts";
import { EditableH1, EditableH2, EditableParagraph } from "@/components/atoms";
import { VisualOptionCards } from "@/components/organisms";

export const whereElectronsLiveBlocks: ReactElement[] = [
    <StackLayout key="layout-electrons-live-title" maxWidth="xl">
        <Block id="electrons-live-title" padding="md">
            <EditableH1 id="h1-electrons-live-title" blockId="electrons-live-title">
                Introduction to Electron Configurations
            </EditableH1>
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
                Every atom has a tiny, heavy centre called the nucleus, and around it sit the
                electrons. The nucleus is packed into an incredibly small space, while the
                electrons take up almost all the room. Almost everything an atom does in
                chemistry — what it bonds with, how it reacts — depends on where those electrons
                are.
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

    <StackLayout key="layout-electrons-live-addresses" maxWidth="xl">
        <Block id="electrons-live-addresses" padding="sm">
            <EditableParagraph id="para-electrons-live-addresses" blockId="electrons-live-addresses">
                Over the next few sections we will build up the full address of an electron, one
                level of detail at a time: first the floor it lives on (the shell), then the room
                on that floor (the subshell), then the exact desk in that room (the orbital).
                Once you can read that address, writing an electron configuration is just writing
                the addresses down in order.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-electrons-live-visual" maxWidth="xl">
        <Block id="electrons-live-visual" padding="sm">
            <VisualOptionCards
                blockId="electrons-live-visual"
                intro="Pick how your students will first meet the inside of an atom."
                cards={[
                    {
                        id: "zoom-into-atom",
                        title: "A zoom control that travels from the whole atom in to the nucleus",
                        looks: "A single atom fills the screen with a faint cloud of electrons around a dot at the centre. A scale bar shows how big the picture currently is.",
                        manipulate: "Students drag a zoom slider to move from the size of the whole atom right down to the size of the nucleus.",
                        reveals: "The nucleus is thousands of times smaller than the atom, so nearly all of the atom is electron space.",
                        recommended: true,
                    },
                    {
                        id: "atom-as-building",
                        title: "An atom drawn as an apartment building with electrons moving in",
                        looks: "A side-on building with the nucleus on the ground floor and empty floors above it, each floor labelled with its number.",
                        manipulate: "Students click a button to add one electron at a time and watch it take the lowest free place.",
                        reveals: "Electrons fill the lowest floors first, and each floor only has room for a set number of them.",
                    },
                    {
                        id: "compare-elements",
                        title: "Two atoms side by side with a control to change which elements they are",
                        looks: "Two labelled atoms next to each other showing their electrons arranged in rings around the nucleus.",
                        manipulate: "Students choose an element for each side and compare the two pictures.",
                        reveals: "Different elements differ only in how many electrons they have and where those electrons sit.",
                    },
                ]}
            />
        </Block>
    </StackLayout>,
];
