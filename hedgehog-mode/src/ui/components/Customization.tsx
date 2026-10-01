import React, { useEffect, useId, useMemo, useRef, useState } from "react";
// Import config values/types directly (not via the package index) so consumers that only
// want this customization UI — e.g. the browser extension's popup — don't drag the whole
// pixi/matter engine into their bundle just to render some sprite grids.
import {
  getRandomAccessoryCombo,
  HedgehogActorAccessories,
  HedgehogActorAccessoryOption,
  HedgehogActorAccessoryOptions,
  HedgehogActorColorOptions,
  HedgehogActorOptions,
  HedgehogActorFlagOption,
  HedgehogActorFlagOptions,
  HedgehogActorFlags,
  HedgehogActorSkinOptions,
  searchFlags,
} from "../../actors/hedgehog/config";
import type { HedgeHogMode } from "../../hedgehog-mode";
import { HedgehogProfileImage } from "../HedgehogStatic";
import {
  getSpriteSize,
  StaticSprite,
} from "../../static-renderer/StaticHedgehog";
import { Button, IconX } from "./Button";
import { sample } from "../../misc/utils";
import { v4 as uuid } from "uuid";

const ACCESSORY_GROUPS = ["headwear", "eyewear", "other"] as const;

type HedgehogOptionsProps = {
  config: HedgehogActorOptions;
  setConfig: (config: HedgehogActorOptions) => void;
  assetsUrl: string;
};

function Switch({
  checked,
  onChange,
  children,
  ...props
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
} & Pick<React.HTMLAttributes<HTMLDivElement>, "title" | "children">) {
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
  assetsUrl,
  game,
  config,
  setConfig,
  defaultFriend,
}: {
  config: HedgehogActorOptions;
  setConfig: (config: HedgehogActorOptions) => void;
  // Where the sprite sheet lives. Pass this directly — a running engine isn't needed to
  // render the customization UI.
  assetsUrl?: string;
  /**
   * @deprecated Pass `assetsUrl` instead. Only `game.options.assetsUrl` was ever read,
   * and requiring a full engine instance stopped this UI being reused outside the game
   * (e.g. in the extension popup). Still accepted so existing callers keep working.
   */
  game?: HedgeHogMode;
  defaultFriend?: HedgehogActorOptions | null;
}) {
  const resolvedAssetsUrl = assetsUrl ?? game?.options.assetsUrl ?? "";

  const [selectedFriendId, setSelectedFriendId] = useState<
    HedgehogActorOptions["id"] | null
  >(defaultFriend?.id ?? null);

  const updateCustomization = (
    customization: Pick<
      HedgehogActorOptions,
      "accessories" | "color" | "skin" | "flag"
    >
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
    // Depend on config.friends too: editing the selected friend's skin/color/accessories
    // replaces its entry, and without this the controls keep showing the old values until
    // another friend is selected.
  }, [selectedFriendId, config.friends]);

  const selectedConfig = selectedFriend ?? config;

  return (
    <div className="Customization">
      <div className="CustomizationContainer">
        <HedgehogProfileImage
          {...config}
          size={100}
          assetsUrl={resolvedAssetsUrl}
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
                with WASD / arrow keys, and i'll use your mouse as a
                web-slinging target. hold the web and press W / S to climb up
                and down it.
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
        <HedgehogOptions
          assetsUrl={resolvedAssetsUrl}
          config={config}
          setConfig={setConfig}
        />
        <HedgehogFriends
          assetsUrl={resolvedAssetsUrl}
          config={config}
          setConfig={setConfig}
          setSelectedFriend={(f) => setSelectedFriendId(f?.id ?? null)}
          selectedFriend={selectedFriend}
        />
        <HedgehogColor
          assetsUrl={resolvedAssetsUrl}
          color={selectedConfig?.color}
          setColor={(color) => updateCustomization({ color })}
        />
        <HedgehogAccessories
          assetsUrl={resolvedAssetsUrl}
          accessories={selectedConfig?.accessories ?? []}
          setAccessories={(accessories) => updateCustomization({ accessories })}
        />
        <HedgehogSkins
          assetsUrl={resolvedAssetsUrl}
          skin={selectedConfig?.skin}
          setSkin={(skin) => updateCustomization({ skin })}
        />
        <HedgehogFlags
          assetsUrl={resolvedAssetsUrl}
          flag={selectedConfig?.flag}
          setFlag={(flag) => updateCustomization({ flag })}
        />
      </div>
    </div>
  );
}

function HedgehogOptions({ config, setConfig }: HedgehogOptionsProps) {
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
  assetsUrl,
  setSelectedFriend,
  selectedFriend,
}: HedgehogOptionsProps & {
  setSelectedFriend: (friend: HedgehogActorOptions | null) => void;
  selectedFriend: HedgehogActorOptions | null;
}) {
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
                  assetsUrl={assetsUrl}
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
  assetsUrl,
  accessories,
  setAccessories,
}: {
  assetsUrl: string;
  accessories: HedgehogActorAccessoryOption[];
  setAccessories: (accessories: HedgehogActorAccessoryOption[]) => void;
}) {
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
                  assetsUrl={assetsUrl}
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
  assetsUrl,
  skin,
  setSkin,
}: {
  assetsUrl: string;
  skin: HedgehogActorOptions["skin"];
  setSkin: (skin: HedgehogActorOptions["skin"]) => void;
}) {
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
              assetsUrl={assetsUrl}
            />
          </Button>
        ))}
      </div>
    </div>
  );
}

/** A flag's cloth (or the globe), scaled up crisply to `width` pixels. */
function FlagThumbnail({
  flag,
  assetsUrl,
  width,
}: {
  flag: HedgehogActorFlagOption;
  assetsUrl: string;
  width: number;
}) {
  const name =
    HedgehogActorFlags[flag].kind === "globe"
      ? `icons/${flag}.png`
      : `flags/${flag}.png`;
  const size = getSpriteSize(name) ?? { w: 1, h: 1 };
  return (
    <div
      className="FlagThumbnail"
      style={{ width, height: (width * size.h) / size.w }}
    >
      <StaticSprite name={name} assetsUrl={assetsUrl} />
    </div>
  );
}

// Memoised with only primitive props, so moving the keyboard highlight
// re-renders the two rows it moved between rather than all ~240.
const FlagPickerRow = React.memo(function FlagPickerRow({
  flag,
  id,
  highlighted,
  selected,
  assetsUrl,
}: {
  flag: HedgehogActorFlagOption;
  id: string;
  highlighted: boolean;
  selected: boolean;
  assetsUrl: string;
}) {
  return (
    <li
      id={id}
      role="option"
      aria-selected={selected}
      data-flag={flag}
      className={`FlagPickerResult ${
        highlighted ? "FlagPickerResult--highlighted" : ""
      } ${selected ? "FlagPickerResult--selected" : ""}`}
    >
      <FlagThumbnail flag={flag} assetsUrl={assetsUrl} width={30} />
      <span>{HedgehogActorFlags[flag].name}</span>
    </li>
  );
});

/**
 * There are ~240 flags, so rather than a grid of all of them this is a
 * search box (names, aliases and ISO codes — "us", "holland", "ivory coast")
 * over a short scrolling list.
 */
function HedgehogFlags({
  assetsUrl,
  flag,
  setFlag,
}: {
  assetsUrl: string;
  flag: HedgehogActorOptions["flag"];
  setFlag: (flag: HedgehogActorFlagOption | null) => void;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const listRef = useRef<HTMLUListElement>(null);
  const id = useId();
  const results = useMemo(() => searchFlags(query), [query]);
  const selected = flag && HedgehogActorFlags[flag] ? flag : null;

  // Keep the keyboard-highlighted row in view. Scroll the list itself:
  // scrollIntoView would also scroll the panel and page around it.
  useEffect(() => {
    const list = listRef.current;
    const item = list?.children[highlighted] as HTMLElement | undefined;
    if (!list || !item) {
      return;
    }
    if (item.offsetTop < list.scrollTop) {
      list.scrollTop = item.offsetTop;
    } else if (
      item.offsetTop + item.offsetHeight >
      list.scrollTop + list.clientHeight
    ) {
      list.scrollTop = item.offsetTop + item.offsetHeight - list.clientHeight;
    }
  }, [highlighted]);

  const openList = () => {
    setHighlighted(0);
    setOpen(true);
  };

  const choose = (option: HedgehogActorFlagOption) => {
    setFlag(option);
    setQuery("");
    setOpen(false);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape" && !open) {
      // Nothing to dismiss here, so let Escape close the customization panel.
      return;
    }
    // Typing a search is not typing a cheat code: without this, searching for
    // "spain" would also wave the Spanish flag.
    e.stopPropagation();
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!open) {
        openList();
        return;
      }
      const step = e.key === "ArrowDown" ? 1 : -1;
      setHighlighted((i) =>
        Math.min(Math.max(i + step, 0), Math.max(results.length - 1, 0))
      );
    } else if (e.key === "Enter" && open && results[highlighted]) {
      e.preventDefault();
      choose(results[highlighted]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div className="CustomizationSection">
      <h4 className="CustomizationSectionTitle">flags</h4>
      {selected && (
        <div className="FlagPickerCurrent">
          <FlagThumbnail flag={selected} assetsUrl={assetsUrl} width={45} />
          <span>{HedgehogActorFlags[selected].name}</span>
          <Button onClick={() => setFlag(null)}>put it down</Button>
        </div>
      )}
      <input
        className="FlagPickerSearch"
        type="search"
        role="combobox"
        aria-label="search flags"
        aria-expanded={open}
        aria-controls={`${id}-results`}
        aria-autocomplete="list"
        aria-activedescendant={
          open && results[highlighted]
            ? `${id}-${results[highlighted]}`
            : undefined
        }
        placeholder={`search ${HedgehogActorFlagOptions.length} flags (try "us" or "holland")`}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          openList();
        }}
        onFocus={openList}
        onBlur={() => setOpen(false)}
        onKeyDown={onKeyDown}
      />
      {open && (
        <ul
          className="FlagPickerResults"
          id={`${id}-results`}
          role="listbox"
          ref={listRef}
          // Keep focus in the search box for any press on the list — a row,
          // the padding, or the scrollbar — so its blur doesn't close it.
          onMouseDown={(e) => e.preventDefault()}
          // One handler for every row (see FlagPickerRow).
          onClick={(e) => {
            const row = (e.target as HTMLElement).closest<HTMLElement>(
              "[data-flag]"
            );
            if (row) {
              choose(row.dataset.flag as HedgehogActorFlagOption);
            }
          }}
        >
          {results.length === 0 ? (
            <li className="FlagPickerEmpty">
              no flag for that one. the hedgehog is lobbying the UN.
            </li>
          ) : (
            results.map((option, i) => (
              <FlagPickerRow
                key={option}
                flag={option}
                id={`${id}-${option}`}
                highlighted={i === highlighted}
                selected={option === selected}
                assetsUrl={assetsUrl}
              />
            ))
          )}
        </ul>
      )}
    </div>
  );
}

function HedgehogColor({
  assetsUrl,
  color,
  setColor,
}: {
  assetsUrl: string;
  color: HedgehogActorOptions["color"];
  setColor: (color: HedgehogActorOptions["color"]) => void;
}) {
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
              assetsUrl={assetsUrl}
            />
          </Button>
        ))}
      </div>
    </div>
  );
}
