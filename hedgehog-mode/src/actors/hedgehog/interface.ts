import { sample } from "lodash";
import type { HedgehogActor } from "../Hedgehog";
import { HedgehogModeInterface, GameUIProps } from "../../types";

const cheatSheetMessages: GameUIProps["messages"] = [
  {
    words: [
      {
        text: "omg you found me!",
        style: { fontWeight: "bold", color: "purple" },
      },
      "i know all the easter eggs...",
    ],
  },
  {
    words: [
      "type",
      { text: "chaos", style: { color: "red" } },
      "for mayhem,",
      { text: "spawn", style: { color: "blue" } },
      "or",
      { text: "hedgehog", style: { color: "green" } },
      "for friends",
    ],
  },
  {
    words: [
      "try",
      { text: "fff", style: { color: "orange" } },
      "or",
      { text: "fire", style: { color: "orange" } },
      "to heat things up.",
      { text: "hello", style: { fontWeight: "bold" } },
      "to wave or",
      { text: "heatmaps", style: { color: "red" } },
      "to be cruel",
    ],
  },
  {
    words: [
      "become",
      { text: "spiderhog", style: { color: "red" } },
      "or go",
      { text: "rainbow", style: { color: "purple" } },
    ],
  },
  {
    words: [
      "feel",
      { text: "giant", style: { fontWeight: "bold", fontSize: "1.2em" } },
      "or get",
      { text: "tiny.", style: { fontSize: "0.8em" } },
      "go",
      { text: "slow", style: { fontStyle: "italic" } },
      "or",
      { text: "fast", style: { fontWeight: "bold" } },
      "- it's up to you!",
    ],
  },
  {
    words: [
      {
        text: "have fun!",
        style: { fontStyle: "bold", fontSize: "1.4em" },
      },
      {
        text: "please don't tell anyone you found me.",
        style: { fontStyle: "italic", fontSize: "0.8em" },
      },
      {
        text: "tim will not be happy.",
        style: { fontStyle: "italic", fontSize: "0.7em" },
      },
      {
        text: "he might fire ben, or worse me...",
        style: { fontStyle: "italic", fontSize: "0.7em" },
      },
    ],
  },
];

export class HedgehogActorInterface {
  private messages: (
    | GameUIProps["messages"]
    | {
        onStart?: () => void;
        messages: GameUIProps["messages"];
      }
  )[] = [
    [
      {
        words: [
          "ah yes, another",
          { text: "brilliant", style: { fontWeight: "bold" } },
          "idea at 2am",
        ],
      },
      {
        words: [
          "have you considered pivoting to",
          { text: "AI", style: { color: "blue", fontWeight: "bold" } },
          "yet?",
        ],
      },
    ],
    [
      {
        words: [
          "growth hacking? more like ",
          { text: "hope hacking", style: { fontStyle: "italic" } },
        ],
      },
    ],
    [{ words: ["vcs love hedgehogs... trust me, i'm a hedgehog"] }],
    [
      {
        words: [
          "which job is more ridiculous - the designer who's sole purpose is to draw me...",
        ],
      },
      {
        words: ["...or the engineer who's sole purpose is to make me..."],
      },
      {
        words: [".    .    ."],
      },
      {
        words: ["i mean... it's both"],
      },
    ],
    [
      {
        words: [
          "clicking me doesn't increase",
          { text: "retention", style: { fontWeight: "bold" } },
        ],
      },
    ],
    [
      {
        words: [
          "not everything needs analytics. just let me",
          { text: "vibe", style: { fontStyle: "italic" } },
        ],
      },
    ],
    [
      {
        words: [
          "another day, another click. living the",
          { text: "dream", style: { fontStyle: "italic" } },
        ],
      },
    ],
    [{ words: ["i have no idea what i'm doing"] }],
    [
      {
        words: [
          "can we ship it?",
          { text: "no", style: { fontWeight: "bold", color: "red" } },
          ". will we ship it? also",
          { text: "no", style: { fontWeight: "bold", color: "red" } },
        ],
      },
    ],
    [{ words: ["ben wrote 85% of this code..."] }],
    [{ words: ["we should probably a/b test this click"] }],
    [
      {
        words: [
          "no, the feature isn't broken. it's an",
          { text: "experiment", style: { fontStyle: "italic" } },
        ],
      },
    ],
    [{ words: ["works on my machine"] }],
    [
      {
        words: [
          "the pr is just",
          { text: "fix", style: { fontStyle: "italic" } },
          "with no description",
        ],
      },
    ],
    [
      {
        words: [
          "deploying on friday?",
          { text: "brave", style: { fontWeight: "bold" } },
        ],
      },
    ],
    [{ words: ["backend's on fire, but hey, frontend looks great"] }],
    [
      {
        words: [
          "numbers look good -",
          { text: "i love posthog...", style: { fontWeight: "bold" } },
        ],
      },
      {
        words: [
          "numbers look bad -",
          {
            text: "no, it must be the app that is broken",
            style: { fontWeight: "bold" },
          },
        ],
      },
    ],
    [
      {
        words: [
          "disrupting the hedgehog industry with",
          { text: "web3", style: { color: "purple" } },
        ],
      },
    ],
    [
      {
        words: [
          "go-to-market strategy:",
          { text: "hope", style: { fontWeight: "bold", fontStyle: "italic" } },
        ],
      },
    ],
    [{ words: ["it's a startup. shut the fudge up. do the work"] }],
    [{ words: ["more dashboards! that'll solve it"] }],
    [
      {
        words: [
          "users love your product. all",
          { text: "5", style: { fontWeight: "bold", color: "red" } },
          "of them",
        ],
      },
    ],
    [{ words: ["correlation ≠ causation. but let's ignore that"] }],
    [
      {
        words: [
          "retention is just a fancy word for",
          { text: "please stay", style: { fontStyle: "italic" } },
        ],
      },
    ],
    [
      {
        words: [
          "growth hacking = making a button",
          { text: "red", style: { color: "red", fontWeight: "bold" } },
        ],
      },
    ],
    [
      {
        words: [
          "seo tip: just add",
          { text: "AI", style: { fontWeight: "bold" } },
          "everywhere",
        ],
      },
    ],
    [
      {
        words: [
          "brand voice? it's just",
          { text: "sarcasm", style: { fontStyle: "italic" } },
          "and hope",
        ],
      },
    ],
    [{ words: ["if it works, ship it. if it doesn't, call it beta"] }],
    [{ words: ["for the last time - yes, we did call it posthog"] }],
    [{ words: ["we track everything. even this click"] }],
    [
      {
        words: ["ai is mid. clippy was the real MVP"],
      },
    ],
    [
      {
        words: [
          "posthog: because",
          { text: "GA", style: { fontWeight: "bold" } },
          "is a dumpster fire",
        ],
      },
    ],
    {
      onStart: () => {
        this.actor.setOnFire();
      },
      messages: [
        {
          words: ["ouch! ouch! ouch!"],
        },
      ],
    },
    cheatSheetMessages,
  ];

  constructor(
    private game: HedgehogModeInterface,
    private actor: HedgehogActor
  ) {}

  onClick(): void {
    const selectedMessages = sample(this.messages);

    if (selectedMessages) {
      const messages = Array.isArray(selectedMessages)
        ? selectedMessages
        : selectedMessages.messages;

      if (!Array.isArray(selectedMessages)) {
        selectedMessages.onStart?.();
      }

      this.game.gameUI?.show({
        screen: "dialog",
        actor: this.actor,
        messages,
      });
    }
  }

  triggerCheatSheet(): void {
    this.game.gameUI?.show({
      screen: "dialog",
      actor: this.actor,
      messages: cheatSheetMessages,
    });
  }

  triggerMessages(messages: GameUIProps["messages"]): void {
    this.game.gameUI?.show({
      screen: "dialog",
      actor: this.actor,
      messages,
    });
  }
}
