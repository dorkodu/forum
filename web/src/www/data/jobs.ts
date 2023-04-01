import { Dorkodu } from "../types/dorkodu";

export const roles: Record<string, Dorkodu.WorkRole> = {
  SoftwareEngineer: {
    title: "Software Engineer",
    domain: "Technology",
    tags: ["software", "engineering", "backend"],
    summary: `
    We need an experienced/passionate <b>Software Engineer</b>. Join us,
    Help build the next-generation technology behind Dorkodu's products,
    create web services & open protocols that can reach a billion people.
    `,
    location: "Remote/Istanbul",
    type: "Rookie",
    responsibility: [
      `<b>Design, develop and test dorkodu's software components.</b>
       Maintain our codebase, review contributuions and get them ready for production.`,
      `Code complex software using <b>modern web tech stack</b>.`,
      `<b>Data storage</b> — Use database, file system, cache; ensure high performance with efficiency. Implement security and data protection. `,
      `<b>Web API's</b> — Engineer our open web services for maximum performance, developer experience and scale.`,
      `Collaborate with people from Product and Business clans for internal IT needs.`,
    ],
    requirements: [
      "<b>Strong portfolio</b> featuring your open-source work or own ideas, knowledge mixed into projects.",
      `<b>2+</b> years of experience in building software using <i>modern tech-stack</i> & <i>engineering practices</i>.`,
      "<b>1+</b> years of experience in web platform.",
      `<b>High education</b> (≠ school) <b>or equivalent experience</b> in a technical field; with passion for <u>inventiveness</u>.`,
      `Experience with <b>git</b> and <b>*nix</b> environments.`,
      `You are good at <b>typescript</b>.`,
      `Experience with <b>more than one programming paradigm</b> <em>(functional, OOP, reactive etc.)</em>
       and <b>language</b> <em>(like C/C++, Go, Haskell, Rust, C#, Java, Python etc.)</em>`,
      `Understanding of <b>Computer Science</b> and the <b>philosophy</b> behind software engineering.
       You <b>digested theory</b> <em>(data structures & algorithms etc.)</em> and can apply them in your favorite language.`,
      `You enjoy technical challenges and <b>inventing new stuff.</b>`,
      `<b><u>BONUS</u>;</b> cloud, blockchain, crypto, decentralized web, edge-computing, data science, AI/ML.`,
    ],
  },
  WebDeveloper: {
    title: "Web Developer",
    domain: "Product",
    tags: ["product", "web", "frontend"],
    summary: `
    We need an experienced <b>Full-stack Web Developer</b> 
    who will bring new product ideas to life by developing progressive web apps.`,
    location: "Remote/Istanbul",
    type: "Rookie",
    responsibility: [
      `<b>Design, develop and test dorkodu's web software & components.</b>
       Maintain our web platform code, review contributuions and get them ready for production.`,
      `code complex frontends using <b>modern web tech stack</b>.`,
      `Take UI/UX designs and turn them into something alive, a prototype web app frontend.`,
      `Involve in development and prototyping of our cross-platform unique design system components using web stack.`,
      `Integrate frontend and backend code, ensuring design & function integrity.`,
      `Work closely with creative people from 'art' clan.`,
    ],
    requirements: [
      `With either a <b>solid work background</b> or a <b>strong portfolio</b> featuring your open-source work/self-started projects.`,
      `<b>1+</b> years of experience in building software using <i>modern tech-stack</i> & <i>engineering practices</i>.`,
      `<b>2+</b> years of experience in web platform.`,
      `Are you fluent in acronyms? <b>HTML, CSS, JS/TS, SPA, PWA, SSR...</b> Can you make them work together with your eyes closed?`,
      `This role is focused on frontend, but a little backend experience is needed.`,
      `Experience with <b>Git</b> and <b>*nix</b> environments.`,
      `You are good at <b>TypeScript</b> and <b>CSS</b>.`,
      `Experience with <b>React, Vite, Next.js, Zustand/Redux</b> and a <b>CSS methodology</b> <em>(Emotion, Tailwind, SCSS, Styled-Components etc.)</em>`,
      `Knowledge of <b>a major programming language</b>
      <em>(like C/C++, Go, Haskell, Rust, C#, Java, Python etc.)</em>`,
      `Understanding of <b>software engineering philosophies</b>.`,
      `You enjoy <b>tinkering with challenges</b>, e.g. implementing sophisticated user interfaces.`,
      `<b><u>BONUS</u>;</b> UI/UX design, graphics, new user platforms like VR/AR, advanced web technologies, open-source etc.`,
    ],
  },
  ProductDesigner: {
    title: "Product Designer",
    domain: "Product",
    tags: ["product", "web", "app", "game"],
    summary: `
    We need an experienced, creative and passionate <b>Product Designer</b>
    to play a key role in our product clan,
    and you should be able to write a little code to prototype what you design.`,
    location: "Remote/Istanbul",
    type: "Rookie",
    responsibility: [
      `Be at the intersection of <b>art</b> and <b>technology</b> to design and prototype new features for our products.`,
      `Take broad, conceptual ideas and turn them into something valuable for our users.`,
      `<b>Design and ship products</b> of the highest quality with the clean, simple and awesome style for which Dorkodu should be known.`,
      `Work closely with creative people from <b>Art</b> and <b>Engineering</b> clans, especially UI/UX designers and developers.`,
    ],
    requirements: [
      `With either a <b>solid work background</b> or a <b>strong portfolio</b> featuring your design samples/self-started products.`,
      `<b>1+</b> years of experience in web platform.`,
      `<b>2+</b> years of experience working on web, mobile, desktop apps or games.
       We prefer social/productivity market.`,
      `Knowledge of <b>gamification, game design</b> etc.`,
      `Design skills with proficiency in <b>typography, UI, color, layout, iconography, aesthetic sense</b>
       and how these elements impact user experience.`,
      `A little experience in <strong>HTML, CSS, JavaScript</strong>.`,
      `Interest in related fields <i>(like computer science, industrial design, visual arts, cognitive science, psychology, economics etc.)</i>`,
    ],
  },
  GraphicsArtist: {
    title: "Graphics Artist",
    domain: "Art",
    tags: ["art", "graphics", "designer", "illustrator", "visual artist"],
    summary: `
    We're a small startup and we have big graphic design needs.
    So we are looking for an exceptional & enthusiastic <b>Graphics Artist</b>.
    `,
    location: "Remote/Istanbul",
    type: "Rookie",
    responsibility: [
      `<b>Design</b> <i>high-impact, result-oriented, polished, pixel-perfect</i> illustrations, presentations, ads, materials, web pages for Product and Business clans.`,
      `<b>Collaborate</b> with experience designers on new ideas and features for our awesome products.`,
      `Help us create a <b>unique design language/system.</b>`,
      `<b>Define, craft and evolve designs</b> within our existing graphics art collection and/or standards.`,
    ],
    requirements: [
      `Must have at least <b>2+</b> years experience, with either a <b>work background</b> or a <b>killer design portfolio</b>.`,
      `Ability to work in a chaotic, unstructured environment while delivering successful results.`,
      `Should enjoy doing a little scripting with <b>HTML + CSS</b>, <b>JavaScript/Python</b>  or <b>no-code</b> tools to make the job faster and easier.`,
      `Knowledge of <b>gamification, game design</b> etc.`,
      `Design skills with proficiency in <b>typography, UI, color, layout, iconography, aesthetic sense</b>
       and how these elements impact user experience.`,
      `Advanced skills in a variety of design tools, <b>screen</b> and <b>print</b>, <b>illustration</b> to <b>video-editing</b> 
      <i>(like Photoshop/GIMP, Illustrator/Inkscape, Figma, Sketch etc.)</i>`,
      `Ability to <b>create great designs from concept to final deliverables</b>
      with all of the excitement and pressure of a startup environment.`,
      `Interest in related fields <i>(like software, industrial design, visual arts, cognitive science, psychology etc.)</i>`,
    ],
  },
  ExperienceDesigner: {
    title: "Experience Designer (UI/UX)",
    domain: "Product",
    tags: ["product", "ui", "ux", "experience", "designer"],
    summary: `
     We need an <b>Experience Designer</b> for defining and building
     the complete user experience and user interface of our products.`,
    location: "Remote/Istanbul",
    type: "Rookie",
    responsibility: [
      `Be a key member in a small, very talented group of software product developers.`,
      `<b>Define, design and help build</b> the complete user interface & experience of Dorkodu's products.`,
      `Work very closely with the product designers and engineers to <i>define and build detailed product specs</i>.`,
      `Maintain and advance product style guidelines.`,
      `Build conceptual models, process flows, navigational maps, and wireframes.`,
      `Work across a wide set of technologies in small teams to deliver products over short development cycles.`,
      `<b>Collaborate</b> with experience designers on new ideas and features for our awesome products.`,
      `Help us create a <b>unique design language/system.</b>`,
      `<b>Define, craft and evolve designs</b> within our existing graphics art collection and/or standards.`,
    ],
    requirements: [
      `Must have at least <b>2+</b> years experience, with either a <b>work background</b> or a <b>killer design portfolio</b>.`,
      `Should enjoy prototyping with code using <b>HTML + CSS + JavaScript</b>, and <b>no-code</b> tools.`,
      `Knowledge of <b>gamification</b> and <b>game design</b>.`,
      `Design and build the interface architecture. Define use cases and information architecture.`,
      `Design skills with proficiency in <b>typography, UI, color, layout, iconography, aesthetic sense</b>
       and how these elements impact user experience.`,
      `
      <i>(like Photoshop/GIMP, Illustrator/Inkscape, Figma, Sketch etc.)</i>`,
      `Ability to <b>create great designs from concept to final deliverables</b>
      with all of the excitement and pressure of a startup environment.`,
      `Experience designing and implementing user interfaces for scalable web products.`,
      `Expertise in HTML, CSS, JavaScript, and just a little backend development.`,
      `Proficiency in Graphic Design and Prototyping; with experience in a variety of design tools.`,
      `Interest in related fields <i>(like software, industrial design, visual arts, cognitive science, psychology etc.)</i>`,
    ],
  },
};

export const contactInfo: Dorkodu.ContactInfo[] = [
  {
    icon: "tabler:brand-twitter",
    link: "https://twitter.com/dorkodu",
    type: "twitter",
    address: "@dorkodu",
    description: "(news)",
  },
  {
    icon: "tabler:brand-github",
    link: "https://github.com/dorkodu",
    type: "github",
    address: "@dorkodu",
    description: "(open source)",
  },
  {
    icon: "tabler:brand-instagram",
    link: "https://instagram.com/dorkodu",
    type: "instagram",
    address: "@dorkodu",
    description: "(social)",
  },
  {
    icon: "tabler:mail-opened",
    link: "mailto:hey@dorkodu.com",
    type: "email",
    address: "hey@dorkodu.com",
    description: "(formal)",
  },
];
