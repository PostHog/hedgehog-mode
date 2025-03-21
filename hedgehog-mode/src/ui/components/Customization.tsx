import React from "react";
import {
  HedgehogActorAccessories,
  HedgehogActorAccessoryOption,
  HedgehogActorAccessoryOptions,
  HedgehogActorColorOptions,
  HedgehogActorOptions,
  HedgeHogMode,
} from "../..";
import { HedgehogProfileImage, HedgehogImage } from "../HedgehogStatic";
import { Button } from "./Button";

const ACCESSORY_GROUPS = ["headwear", "eyewear", "other"] as const;

type HedgehogOptionsProps = {
  config: HedgehogActorOptions;
  setConfig: (config: HedgehogActorOptions) => void;
  game: HedgeHogMode;
};

function Switch({
  label,
  checked,
  onChange,
  ...props
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
} & Pick<React.HTMLAttributes<HTMLDivElement>, "title">): JSX.Element {
  return (
    <div className="Switch" {...props}>
      <label className="SwitchLabel">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span className="SwitchLabelText">{label}</span>
      </label>
    </div>
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
          <h3 className="CustomizationTitle">Hi, I'm Max!</h3>
          <p className="CustomizationDescription">
            {config.skin === "spiderhog" ? (
              <>
                Well, it's not every day you meet a hedgehog with spider powers.
                Yep, that's me - SpiderHog. I wasn't always this way. Just your
                average, speedy little guy until a radioactive spider bit me.
                With great power comes great responsibility, so buckle up,
                because this hedgehog's got a whole data warehouse to protect...
                <br />
                You can move me around by clicking and dragging or control me
                with WASD / arrow keys and I'll use your mouse as a web slinging
                target.
              </>
            ) : (
              <>
                Don't mind me. I'm just here to keep you company.
                <br />
                You can move me around by clicking and dragging or control me
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
  return (
    <>
      <h4 className="CustomizationSectionTitle">options</h4>

      <Switch
        label="Free to roam"
        checked={config.ai_enabled ?? false}
        onChange={(val) =>
          setConfig({
            ...config,
            ai_enabled: val,
          })
        }
        title="If enabled the Hedgehog will walk around the screen, otherwise they will stay in one place. You can still move them around by dragging them."
      />
      <Switch
        label="Keyboard controls (WASD / arrow keys)"
        checked={config.controls_enabled ?? false}
        onChange={(val) =>
          setConfig({
            ...config,
            controls_enabled: val,
          })
        }
        title="If enabled you can use the WASD or arrow key + space to move around and jump."
      />
      {/* <Switch
        label="Party mode"
        checked={config.party_mode_enabled ?? false}
        onChange={(val) =>
          setConfig({
            ...config,
            party_mode_enabled: val,
          })
        }
        title="If enabled then all of your organization members will appear in your browser as hedgehogs as well!"
      /> */}
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
              >
                <HedgehogImage
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
  const skins = ["default", "spiderhog"];

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
          >
            <HedgehogImage
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
          >
            <HedgehogImage
              color={option as HedgehogActorOptions["color"]}
              renderer={game.staticHedgehogRenderer}
            />
          </Button>
        ))}
      </div>
    </div>
  );
}
