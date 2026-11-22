<script>
  import { SvelteSet } from "svelte/reactivity";
  import NotificationCard from "../components/NotificationCard.svelte";
  import { createKeyboardNav } from "../lib/useKeyboardNav.svelte";

  let { notificationService, defaultExpanded = $bindable(true) } = $props();

  let toggledGroups = new SvelteSet();

  function toggleGroup(groupKey) {
    if (toggledGroups.has(groupKey)) {
      toggledGroups.delete(groupKey);
    } else {
      toggledGroups.add(groupKey);
    }
  }

  function setDefaultMode(expanded) {
    defaultExpanded = expanded;
    toggledGroups.clear();
  }

  let visibleEntries = $derived.by(() => {
    const list = notificationService.sortedNotifications;
    const entries = [];
    let i = 0;

    while (i < list.length) {
      let j = i + 1;
      while (j < list.length && list[j].packageName === list[i].packageName) {
        j++;
      }

      const batchSize = j - i;
      const groupKey = list[i].id;

      const isToggled = toggledGroups.has(groupKey);
      const isExpanded = defaultExpanded ? !isToggled : isToggled;

      entries.push({
        item: list[i],
        groupKey,
        isGrouped: false,
        groupCount: batchSize,
        isExpanded,
        onToggleGroup: batchSize > 1 ? () => toggleGroup(groupKey) : undefined,
      });

      if (isExpanded) {
        for (let k = i + 1; k < j; k++) {
          entries.push({
            item: list[k],
            groupKey,
            isGrouped: true,
            groupCount: batchSize,
            isExpanded: true,
            onToggleGroup: undefined,
          });
        }
      }

      i = j;
    }

    return entries;
  });

  let visibleItems = $derived(visibleEntries.map((e) => e.item));

  const nav = createKeyboardNav(
    () => visibleItems,
    (id) => notificationService.deleteNotification(id),
  );

  function handleKeyDown(event) {
    const tag = event.target?.tagName;
    if (
      tag === "INPUT" ||
      tag === "TEXTAREA" ||
      event.target?.isContentEditable
    ) {
      return;
    }

    const activeEntry = visibleEntries.find((e) => e.item.id === nav.activeId);

    if (activeEntry && activeEntry.groupCount > 1) {
      const isToggleKey = event.key === " " || event.key === "Enter";
      const isExpandKey = event.key === "ArrowRight" && !activeEntry.isExpanded;
      const isCollapseKey = event.key === "ArrowLeft" && activeEntry.isExpanded;

      if (isToggleKey || isExpandKey || isCollapseKey) {
        event.preventDefault();
        toggleGroup(activeEntry.groupKey);

        if (activeEntry.isGrouped) {
          nav.activeId = activeEntry.groupKey;
          nav.focusActiveCard();
        }
        return;
      }
    }

    nav.handleKeyDown(event);
  }
</script>

<svelte:window onkeydown={handleKeyDown} />

<h2>Android Notifications Stream</h2>

<div class="logs" bind:this={nav.container}>
  {#each visibleEntries as entry (entry.item.id)}
    <NotificationCard
      item={entry.item}
      isGrouped={entry.isGrouped}
      groupCount={entry.groupCount}
      isExpanded={entry.isExpanded}
      onToggleGroup={entry.onToggleGroup}
      isActive={entry.item.id === nav.activeId}
      onclick={() => {
        nav.activeId = entry.item.id;
        nav.focusActiveCard();
      }}
    />
  {:else}
    <p class="empty">There is no notifications yet...</p>
  {/each}
</div>

<style>
  h2 {
    font-family: sans-serif;
    color: #333;
    margin-bottom: 15px;
    text-align: center;
  }

  .logs {
    width: 100%;
    max-width: 675px;
    box-sizing: border-box;
  }

  .empty {
    text-align: center;
    color: #888;
    font-style: italic;
    font-family: sans-serif;
  }
</style>
