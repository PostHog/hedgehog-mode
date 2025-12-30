import React, { useMemo, useState } from "react";
import {
  getRandomAccessoryCombo,
  HedgehogActorAccessories,
  HedgehogActorAccessoryOption,
  HedgehogActorAccessoryOptions,
  HedgehogActorColorOptions,
  HedgehogActorOptions,
  HedgehogActorSkinOptions,
  HedgeHogMode,
} from "../..";
import { HedgehogProfileImage } from "../HedgehogStatic";
import { Button, IconX } from "./Button";
import { sample } from "lodash";
import { v4 as uuid } from "uuid";

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

export function HedgehogCustomization({
  game,
  config,
  setConfig,
  defaultFriend,
}: HedgehogOptionsProps & {
  game: HedgeHogMode;
  defaultFriend?: HedgehogActorOptions | null;
}): JSX.Element {
  const [selectedFriendId, setSelectedFriendId] = useState<
    HedgehogActorOptions["id"] | null
  >(defaultFriend?.id ?? null);

  const updateCustomization = (
    customization: Pick<HedgehogActorOptions, "accessories" | "color" | "skin">
  ) => {
    if (selectedFriendId) {
      setConfig({
        ...config,
        friends: config.friends?.map((friend) =>
          friend.id === selectedFriendId
            ? { ...friend, ...customization }
            : friend
        ),
      });
    } else {
      setConfig({ ...config, ...customization });
    }
  };

  const selectedFriend: HedgehogActorOptions | null = useMemo(() => {
    return selectedFriendId
      ? (config.friends?.find((f) => f.id === selectedFriendId) ?? null)
      : null;
  }, [selectedFriendId]);

  const selectedConfig = selectedFriend ?? config;

  return (
    <div className="Customization">
      <div className="CustomizationContainer">
        <HedgehogProfileImage
          {...config}
          size={100}
          assetsUrl={game.options.assetsUrl}
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
            ) : config.skin === "robohog" ? (
              <>
                RoboHog reporting for duty. dead or alive, you're coding with
                me!
                <br />
                my AI is superior but if you must, you can move me around by
                clicking and dragging or control me with WASD / arrow keys.
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
        <HedgehogOptions game={game} config={config} setConfig={setConfig} />
        <HedgehogFriends
          game={game}
          config={config}
          setConfig={setConfig}
          setSelectedFriend={(f) => setSelectedFriendId(f?.id ?? null)}
          selectedFriend={selectedFriend}
        />
        <HedgehogColor
          game={game}
          color={selectedConfig?.color}
          setColor={(color) => updateCustomization({ color })}
        />
        <HedgehogAccessories
          game={game}
          accessories={selectedConfig?.accessories ?? []}
          setAccessories={(accessories) => updateCustomization({ accessories })}
        />
        <HedgehogSkins
          game={game}
          skin={selectedConfig?.skin}
          setSkin={(skin) => updateCustomization({ skin })}
        />
      </div>
    </div>
  );
}

function HedgehogOptions({
  config,
  setConfig,
}: HedgehogOptionsProps): JSX.Element {
  return (
    <div className="CustomizationSection">
      <h4 className="CustomizationSectionTitle">options</h4>
      <Switch
        checked={config.ai_enabled ?? true}
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
    </div>
  );
}

function HedgehogFriends({
  config,
  setConfig,
  game,
  setSelectedFriend,
  selectedFriend,
}: HedgehogOptionsProps & {
  setSelectedFriend: (friend: HedgehogActorOptions | null) => void;
  selectedFriend: HedgehogActorOptions | null;
}): JSX.Element {
  const friends = useMemo(() => config.friends ?? [], [config.friends]);

  const addFriend = () => {
    const newFriend = {
      id: "friend-" + uuid(),
      player: false,
      accessories: getRandomAccessoryCombo(),
      color: sample(HedgehogActorColorOptions),
    };
    setConfig({ ...config, friends: [...friends, newFriend] });
  };

  const removeFriend = (friend: HedgehogActorOptions) => {
    setConfig({
      ...config,
      friends: friends.filter((f) => f.id !== friend.id),
    });
    if (selectedFriend?.id === friend.id) {
      setSelectedFriend(null);
    }
  };

  const removeAllFriends = () => {
    setConfig({ ...config, friends: [] });
  };

  return (
    <>
      <div className="CustomizationSection">
        <h4 className="CustomizationSectionTitle">friends</h4>
        <div className="CustomizationGrid">
          <Button onClick={addFriend}>Add friend</Button>

          {friends.length > 0 && (
            <Button onClick={removeAllFriends}>Remove all friends</Button>
          )}
        </div>
        <div className="CustomizationGrid">
          {friends.map((friend) => (
            <div key={friend.id} className="CustomizationFriend">
              <IconX
                onClick={() => removeFriend(friend)}
                className="CustomizationFriendRemove"
              />
              <Button
                active={selectedFriend?.id === friend.id}
                onClick={() =>
                  setSelectedFriend(
                    selectedFriend?.id === friend.id ? null : friend
                  )
                }
                title={friend.id}
              >
                <HedgehogProfileImage
                  key={friend.id}
                  {...friend}
                  size={64}
                  assetsUrl={game.options.assetsUrl}
                />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function HedgehogAccessories({
  game,
  accessories,
  setAccessories,
}: {
  game: HedgeHogMode;
  accessories: HedgehogActorAccessoryOption[];
  setAccessories: (accessories: HedgehogActorAccessoryOption[]) => void;
}): JSX.Element {
  accessories =
    accessories?.filter((acc) => !!HedgehogActorAccessories[acc]) ?? [];

  const onClick = (accessory: HedgehogActorAccessoryOption): void => {
    if (accessories.includes(accessory)) {
      setAccessories(accessories.filter((acc) => acc !== accessory));
    } else {
      setAccessories(
        accessories
          .filter(
            (acc) =>
              HedgehogActorAccessories[acc].group !==
              HedgehogActorAccessories[accessory].group
          )
          .concat(accessory)
      );
    }
  };

  return (
    <>
      {ACCESSORY_GROUPS.map((group) => (
        <div className="CustomizationSection" key={group}>
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
                  assetsUrl={game.options.assetsUrl}
                />
              </Button>
            ))}
          </div>
        </div>
      ))}
    </>
  );
}

function HedgehogSkins({
  game,
  skin,
  setSkin,
}: {
  game: HedgeHogMode;
  skin: HedgehogActorOptions["skin"];
  setSkin: (skin: HedgehogActorOptions["skin"]) => void;
}): JSX.Element | null {
  return (
    <div className="CustomizationSection">
      <h4 className="CustomizationSectionTitle">skins</h4>
      <div className="CustomizationGrid">
        {HedgehogActorSkinOptions.map((option) => (
          <Button
            key={option}
            active={(skin ?? "default") === option}
            onClick={() => setSkin(option as HedgehogActorOptions["skin"])}
            title={option.split("-").join(" ")}
          >
            <HedgehogProfileImage
              size={64}
              skin={option as HedgehogActorOptions["skin"]}
              assetsUrl={game.options.assetsUrl}
            />
          </Button>
        ))}
      </div>
    </div>
  );
}

function HedgehogColor({
  game,
  color,
  setColor,
}: {
  game: HedgeHogMode;
  color: HedgehogActorOptions["color"];
  setColor: (color: HedgehogActorOptions["color"]) => void;
}): JSX.Element {
  return (
    <div className="CustomizationSection">
      <h4 className="CustomizationSectionTitle">colors</h4>
      <div className="CustomizationGrid">
        {["none", ...HedgehogActorColorOptions].map((option) => (
          <Button
            key={option}
            active={color === (option === "none" ? null : option)}
            onClick={() =>
              setColor(
                option === "none"
                  ? null
                  : (option as HedgehogActorOptions["color"])
              )
            }
            title={option.split("-").join(" ")}
          >
            <HedgehogProfileImage
              size={64}
              color={option as HedgehogActorOptions["color"]}
              assetsUrl={game.options.assetsUrl}
            />
          </Button>
        ))}
      </div>
    </div>
  );
}
