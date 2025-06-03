import React, { useEffect, useState } from "react";
import {
  getRandomAccessoryCombo,
  HedgehogActorAccessories,
  HedgehogActorAccessoryOption,
  HedgehogActorAccessoryOptions,
  HedgehogActorColorOptions,
  HedgehogActorOptions,
  HedgeHogMode,
} from "../..";
import { HedgehogProfileImage, HedgehogImage } from "../HedgehogStatic";
import { Button } from "./Button";
import { sample, uniqueId } from "lodash";

const ACCESSORY_GROUPS = ["headwear", "eyewear", "other"] as const;

type HedgehogOptionsProps = {
  config: HedgehogActorOptions;
  setConfig: (config: HedgehogActorOptions) => void;
  game: HedgeHogMode;
};

function Switch({
  checked,
  onChange,
  children,
  ...props
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
} & Pick<
  React.HTMLAttributes<HTMLDivElement>,
  "title" | "children"
>): JSX.Element {
  return (
    <span className="Switch" {...props}>
      <label className="SwitchLabel">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span className="SwitchLabelText">{children}</span>
      </label>
    </span>
  );
}

export function HedgehogCustomization(
  props: HedgehogOptionsProps & { game: HedgeHogMode }
): JSX.Element {
  const { config, setConfig, game } = props;

  return (
    <div className="Customization">
      <div className="CustomizationContainer">
        <HedgehogProfileImage
          {...config}
          size={100}
          renderer={game.staticHedgehogRenderer}
        />
        <div className="CustomizationContent">
          <h3 className="CustomizationTitle">
            {config.player ? "hi, i'm Max!" : "hi, i'm Max's buddy!"}
          </h3>
          <p className="CustomizationDescription">
            {config.skin === "spiderhog" ? (
              <>
                well, it's not every day you meet a hedgehog with spider powers.
                yep, that's me - spiderhog. i wasn't always this way. just your
                average, speedy little guy until a radioactive spider bit me.
                with great power comes great responsibility, so buckle up,
                because this hedgehog's got a whole data warehouse to protect...
                <br />
                you can move me around by clicking and dragging or control me
                with WASD / arrow keys and I'll use your mouse as a web slinging
                target.
              </>
            ) : (
              <>
                don't mind me. i'm just here to keep you company.
                <br />
                you can move me around by clicking and dragging or control me
                with WASD / arrow keys.
              </>
            )}
          </p>
        </div>
      </div>

      <div className="CustomizationOptions">
        <HedgehogOptions {...props} />
        <HedgehogColor {...props} />
        <HedgehogAccessories {...props} />
        <HedgehogSkins {...props} />
      </div>
    </div>
  );
}

function HedgehogOptions({
  config,
  setConfig,
  game,
}: HedgehogOptionsProps): JSX.Element {
  const [hedgehogsCount, setHedgehogsCount] = useState(0);

  useEffect(() => {
    setHedgehogsCount(game.stateManager?.getNumberOfHedgehogs() ?? 0);
  }, [game.stateManager]);

  const addFriend = () => {
    game.stateManager?.setHedgehog({
      id: uniqueId("friend-"),
      player: false,
      accessories: getRandomAccessoryCombo(),
      color: sample(HedgehogActorColorOptions),
    });
    setHedgehogsCount(game.stateManager?.getNumberOfHedgehogs() ?? 0);
  };

  const removeFriend = () => {
    const nonPlayerHedgehog = Object.values(
      game.stateManager?.getState().hedgehogsById ?? {}
    ).find((h) => !h.player);
    if (nonPlayerHedgehog) {
      game.stateManager?.removeHedgehog(nonPlayerHedgehog.id);
    }
    setHedgehogsCount(game.stateManager?.getNumberOfHedgehogs() ?? 0);
  };

  const removeAllFriends = () => {
    Object.values(game.stateManager?.getState().hedgehogsById ?? {}).forEach(
      (h) => {
        if (!h.player) {
          game.stateManager?.removeHedgehog(h.id);
        }
      }
    );

    setHedgehogsCount(game.stateManager?.getNumberOfHedgehogs() ?? 0);
  };

  return (
    <>
      <h4 className="CustomizationSectionTitle">options</h4>
      <Switch
        checked={config.ai_enabled ?? false}
        onChange={(val) =>
          setConfig({
            ...config,
            ai_enabled: val,
          })
        }
        title="If enabled the Hedgehog will walk around the screen, otherwise they will stay in one place. You can still move them around by dragging them."
      >
        Free to roam
      </Switch>
      <Switch
        checked={config.controls_enabled ?? false}
        onChange={(val) =>
          setConfig({
            ...config,
            controls_enabled: val,
          })
        }
        title="If enabled you can use the WASD or arrow key + space to move around and jump."
      >
        Keyboard controls (WASD / arrow keys)
      </Switch>
      <Switch
        checked={hedgehogsCount > 1}
        onChange={() => {
          if (hedgehogsCount > 1) {
            removeAllFriends();
          } else {
            // The most tragic line of code I've ever written
            addFriend();
          }
        }}
        title={`If enabled then ${hedgehogsCount - 1} friends will appear in your browser as hedgehogs as well!`}
      >
        Friends
      </Switch>
      {hedgehogsCount > 1 && (
        <>
          <Button onClick={addFriend}>Add</Button> /
          <Button onClick={removeFriend}>Remove</Button>
        </>
      )}
    </>
  );
}

function HedgehogAccessories({
  config,
  setConfig,
  game,
}: HedgehogOptionsProps): JSX.Element {
  const accessories =
    config.accessories?.filter((acc) => !!HedgehogActorAccessories[acc]) ?? [];

  const onClick = (accessory: HedgehogActorAccessoryOption): void => {
    if (accessories.includes(accessory)) {
      setConfig({
        ...config,
        accessories: accessories.filter((acc) => acc !== accessory),
      });
    } else {
      setConfig({
        ...config,
        accessories: accessories
          .filter(
            (acc) =>
              HedgehogActorAccessories[acc].group !==
              HedgehogActorAccessories[accessory].group
          )
          .concat(accessory),
      });
    }
  };

  return (
    <>
      {ACCESSORY_GROUPS.map((group) => (
        <React.Fragment key={group}>
          <h4 className="CustomizationSectionTitle">{group}</h4>
          <div className="CustomizationGrid">
            {HedgehogActorAccessoryOptions.filter(
              (acc) => HedgehogActorAccessories[acc].group === group
            ).map((acc) => (
              <Button
                key={acc}
                active={accessories.includes(acc)}
                onClick={() => onClick(acc)}
                title={acc.split("-").join(" ")}
              >
                <HedgehogProfileImage
                  size={64}
                  accessories={[acc]}
                  renderer={game.staticHedgehogRenderer}
                />
              </Button>
            ))}
          </div>
        </React.Fragment>
      ))}
    </>
  );
}

function HedgehogSkins({
  config,
  setConfig,
  game,
}: HedgehogOptionsProps): JSX.Element | null {
  const skins = ["default", "spiderhog", "robohog"];

  return (
    <div className="CustomizationSection">
      <h4 className="CustomizationSectionTitle">skins</h4>
      <div className="CustomizationGrid">
        {skins.map((option) => (
          <Button
            key={option}
            active={(config.skin ?? "default") === option}
            onClick={() =>
              setConfig({
                ...config,
                skin: option as HedgehogActorOptions["skin"],
              })
            }
            title={option.split("-").join(" ")}
          >
            <HedgehogProfileImage
              size={64}
              skin={option as HedgehogActorOptions["skin"]}
              renderer={game.staticHedgehogRenderer}
            />
          </Button>
        ))}
      </div>
    </div>
  );
}

function HedgehogColor({
  config,
  setConfig,
  game,
}: HedgehogOptionsProps): JSX.Element {
  return (
    <div className="CustomizationSection">
      <h4 className="CustomizationSectionTitle">colors</h4>
      <div className="CustomizationGrid">
        {["none", ...HedgehogActorColorOptions].map((option) => (
          <Button
            key={option}
            active={config.color === (option === "none" ? null : option)}
            onClick={() =>
              setConfig({
                ...config,
                color:
                  option === "none"
                    ? null
                    : (option as HedgehogActorOptions["color"]),
              })
            }
            title={option.split("-").join(" ")}
          >
            <HedgehogProfileImage
              size={64}
              color={option as HedgehogActorOptions["color"]}
              renderer={game.staticHedgehogRenderer}
            />
          </Button>
        ))}
      </div>
    </div>
  );
}
