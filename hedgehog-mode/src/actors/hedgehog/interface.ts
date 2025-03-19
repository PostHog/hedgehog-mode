import { sample } from "lodash";
import type { HedgehogActor } from "../Hedgehog";
import { Game } from "../../types";

export class HedgehogActorInterface {
  private messages = [
    [
      {
        words: [
          "Ah yes, another ",
          { text: "brilliant", style: { fontWeight: "bold" } },
          " idea at 2 AM.",
        ],
      },
      {
        words: [
          "Have you considered pivoting to ",
          { text: "AI", style: { color: "blue", fontWeight: "bold" } },
          " yet?",
        ],
      },
    ],
    [
      {
        words: [
          "Growth hacking? More like ",
          { text: "hope hacking", style: { fontStyle: "italic" } },
          ".",
        ],
      },
    ],
    [{ words: ["VCs love hedgehogs. Trust me, I’m a hedgehog."] }],
    [{ words: ["I was supposed to be a logo. Now I have a job."] }],
    [
      {
        words: [
          "Clicking me doesn’t increase ",
          { text: "retention", style: { fontWeight: "bold" } },
          ".",
        ],
      },
    ],
    [
      {
        words: [
          "Not everything needs analytics. Just let me ",
          { text: "vibe", style: { fontStyle: "italic" } },
          ".",
        ],
      },
    ],
    [
      {
        words: [
          "Another day, another click. Living the ",
          { text: "dream", style: { fontStyle: "italic" } },
          ".",
        ],
      },
    ],
    [{ words: ["I have no idea what I’m doing."] }],
    [
      {
        words: [
          "Can we ship it? ",
          { text: "No", style: { fontWeight: "bold", color: "red" } },
          ". Will we ship it? Also ",
          { text: "no", style: { fontWeight: "bold", color: "red" } },
          ".",
        ],
      },
    ],
    [{ words: ["Ben wrote 85% of this code.."] }],
    [{ words: ["We should probably A/B test this click."] }],
    [
      {
        words: [
          "No, the feature isn’t broken. It’s an ",
          { text: "experiment", style: { fontStyle: "italic" } },
          ".",
        ],
      },
    ],
    [
      { words: ["Works on my machine."] },
      {
        words: [
          "The PR is just ‘",
          { text: "fix", style: { fontStyle: "italic" } },
          "’ with no description.",
        ],
      },
      {
        words: [
          "Deploying on Friday? ",
          { text: "Brave", style: { fontWeight: "bold" } },
          ".",
        ],
      },
      { words: ["Backend’s on fire, but hey, frontend looks great."] },
    ],
    [
      {
        words: [
          "Disrupting the hedgehog industry with ",
          { text: "Web3", style: { color: "purple" } },
          ".",
        ],
      },
    ],
    [
      {
        words: [
          "Go-to-market strategy: ",
          { text: "Hope", style: { fontWeight: "bold", fontStyle: "italic" } },
          ".",
        ],
      },
    ],
    [{ words: ["It's a startup. Shut the fudge up. Do the work."] }],
    [
      { words: ["More dashboards! That’ll solve it."] },
      {
        words: [
          "Users love your product. All ",
          { text: "5", style: { fontWeight: "bold", color: "red" } },
          " of them.",
        ],
      },
      { words: ["Correlation ≠ causation. But let’s ignore that."] },
      {
        words: [
          "Retention is just a fancy word for ‘",
          { text: "please stay", style: { fontStyle: "italic" } },
          ".’",
        ],
      },
    ],
    [
      {
        words: [
          "Growth hacking = making a button ",
          { text: "red", style: { color: "red", fontWeight: "bold" } },
          ".",
        ],
      },
    ],
    [{ words: ["Yes, we have a newsletter. No, you won’t read it."] }],
    [
      {
        words: [
          "SEO tip: Just add ‘",
          { text: "AI", style: { fontWeight: "bold" } },
          "’ everywhere.",
        ],
      },
    ],
    [
      {
        words: [
          "Brand voice? It’s just ",
          { text: "sarcasm", style: { fontStyle: "italic" } },
          " and hope.",
        ],
      },
    ],
    [{ words: ["If it works, ship it. If it doesn’t, call it beta."] }],
    [{ words: ["For the last time - yes, we did call it PostHog."] }],
    [{ words: ["We track everything. Even this click."] }],
    [
      {
        words: [
          "PostHog: Because ",
          { text: "Google Analytics", style: { fontWeight: "bold" } },
          " is a dumpster fire.",
        ],
      },
    ],
  ];

  constructor(
    private game: Game,
    private actor: HedgehogActor
  ) {
    setTimeout(() => {
      if (actor.options.player) {
        this.game.gameUI?.showDialogBox({
          actor: this.actor,
          messages: [
            {
              words: [
                "Hedgehog",
                "Mode",
                { text: "is", style: { fontStyle: "italic" } },
                {
                  text: "coming soon",
                  style: { color: "orange", fontWeight: "bold" },
                },
              ],
            },
            {
              words: ["Ben is very excited for this..."],
            },
            {
              words: [
                "...I'm worried he is losing sight of the big picture...",
              ],
            },
            {
              words: ["...it's like a cry for help or something."],
            },
          ],
        });
      }
    }, 1000);
  }

  onClick(): void {
    const selectedMessages = sample(this.messages);

    if (selectedMessages) {
      this.game.gameUI?.showDialogBox({
        actor: this.actor,
        messages: selectedMessages,
        onEnd: () => {
          console.log("Dialog box ended");
        },
      });
    }
  }
}
