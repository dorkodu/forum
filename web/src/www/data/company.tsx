import {
  Baby,
  Blossom,
  Clipboard,
  Confetti,
  FirstPlaceMedal,
  Handshake,
  MountainSnowy,
  Package,
  People,
  Programmer,
  School,
} from "@/styles/twemoji";
import { Text } from "@mantine/core";

export const people = {
  theRing: [
    {
      name: "Doruk Eray",
      title: "Founder & Chief",
      about: "Craftsman, Polymath, Cult Leader.",
      tags: ["Product", "Business", "Software", "Design", "Art"],
      avatar: "/images/people/doruk.png",
    },
    {
      name: "Berk Cambaz",
      title: "Technologist",
      about: "Co-Founder, Engineer, Swiss-Knife, Jack of All Trades.",
      tags: ["Technology", "Software", "Infrastructure"],
      avatar: "/images/people/berk.png",
    },
  ],
  members: [
    {
      name: "Furkan G. Yıldırım",
      title: "Rookie",
      about: "Hustler.",
      tags: ["Marketing", "Social Media"],
      avatar: "/images/people/furkan.png",
    },
    {
      name: "Aziz Xcmaz",
      title: "Rookie",
      about: "Gnome Chieftain.",
      tags: ["Art", "Graphics Design"],
      avatar: "/images/people/aziz.png",
    },
  ],
};

export const story: { icon: React.ReactNode; text: React.ReactNode }[] = [
  {
    icon: Baby,
    text: (
      <>
        <Text>
          Our founders, <b>Doruk</b> and <b>Berk</b> are born in <b>2004.</b>
        </Text>
        <Text color="dimmed">
          Both always wanted to be <i>inventors</i>, Doruk was more of an <i>artistic</i> kid. Berk was a child{" "}
          <i>chess prodigy</i>.
        </Text>
      </>
    ),
  },
  {
    icon: Programmer,
    text: (
      <>
        <Text>
          <i>Doruk</i> and <i>Berk</i> learn to code at <b>10-11</b> years old.
        </Text>
        <Text color="dimmed">Finally found their passions. Computers!</Text>
      </>
    ),
  },

  {
    icon: School,
    text: (
      <>
        <Text>
          <em>Doruk</em> and <em>Berk</em> entered <b>Vefa Lisesi</b> in <em>2018</em>. When they met, instant best
          friends!
        </Text>
        <Text color="dimmed">
          <em>Vefa</em> is a historical high school in Istanbul.
        </Text>
      </>
    ),
  },
  {
    icon: Handshake,
    text: (
      <>
        <Text>
          <em>Doruk</em> and <em>Berk</em> starts working together.
        </Text>
        <Text color="dimmed">
          <em>Berk</em> starts building games, after being an <b>international e-sports wonderkid</b>.
        </Text>
      </>
    ),
  },
  {
    icon: Clipboard,
    text: (
      <>
        <Text>
          <b>Dorkodu</b>&apos;s seeds are planted during <em>2019</em>, when the <b>duo</b> brand their all software
          under one name.
        </Text>
        <Text color="dimmed">
          &quot;<b>Dorkodu</b>&quot; = <i>Doruk</i> + <i>Berk</i> + <i>Code</i>.
        </Text>
      </>
    ),
  },
  {
    icon: Blossom,
    text: (
      <>
        <Text>
          <em>Doruk</em> realizes how they can mix his <em>design ideals</em> with their{" "}
          <em>revolutionary technology</em> to{" "}
          <u>
            <b>make the dream of utopian human life possible.</b>
          </u>
        </Text>
        <Text color="dimmed">
          Now they found their <b>purpose</b>.
        </Text>
      </>
    ),
  },
  {
    icon: Confetti,
    text: (
      <>
        <Text>
          <b>Dorkodu</b> becomes their full-time hustle.
        </Text>
        <Text color="dimmed">
          Now school is <i>the</i> <b>hobby</b>.
        </Text>
      </>
    ),
  },
  {
    icon: FirstPlaceMedal,
    text: (
      <>
        <em>Dorkodu</em> wins{" "}
        <b>
          1<sup>st</sup>
        </b>{" "}
        place in a <em>national software contest</em> in <b>2020</b>.
        <Text color="dimmed">
          <b>Dorkodia</b>, an experimental social app for meditation & productivity.
        </Text>
      </>
    ),
  },
  {
    icon: Package,
    text: (
      <>
        <Text>
          <em>Doruk</em> and <em>Berk</em> publish many <b>open source</b> projects.
          <Text<"span"> color="dimmed">
            Complex <b>software libraries, protocols</b> and <b>frameworks</b>; even <em>pixelart.</em>
          </Text>
        </Text>
      </>
    ),
  },
  {
    icon: People,
    text: (
      <Text>
        <b>Aziz</b> and <b>Furkan</b> join <em>the Dorkodu revolution</em> as our first rookies.
        <Text<"span"> color="dimmed">
          First <i>greenpill</i>s escaped the Matrix.
        </Text>
      </Text>
    ),
  },
];
