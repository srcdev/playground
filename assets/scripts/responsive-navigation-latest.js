/*
 * This version contains the lates of everything from the variants
 */
var ResponsiveNavigation = function () {
  console.log('Thymo Responsive Navigation Script Loaded');

  // Configuration
  const gapForOverflowDetails = 12;
  const minDesktopWidth = 768;

  // Elements
  const mainNavigationElem = document.getElementById('mainNavigation');
  const mainNavElem = document.getElementById('mainNav');
  const secondNavListElem = document.getElementById('secondNavList');
  const overflowListElem = document.getElementById('overflowList');
  const secondaryNavElem = document.getElementById('secondaryNav');
  const overflowDetails = document.getElementById('overflowDetails');

  let navigationElementsPositionArray = {};
  let secondaryNavLeftEdge = 0;
  let mainNavBoundryEnd = 0;
  let useInsertBefore = true;
  let detailsConfig = [];
  let cleanupDetailsListeners = null;
  let overflowDropDownWidth = null;

  function isDesktop() {
    return window.innerWidth >= minDesktopWidth;
  }

  function applyDetailsMode() {
    const detailsElements = mainNavElem.querySelectorAll('details');

    if (!isDesktop()) {
      // Mobile/tablet view: force all open
      detailsElements.forEach((d) => {
        d.removeAttribute('name');
        d.setAttribute('open', '');
      });
      cleanupDetailsListeners?.();
      return;
    }

    // Desktop: use hover/focus events
    detailsElements.forEach((d) => d.removeAttribute('open'));
    cleanupDetailsListeners?.();
    cleanupDetailsListeners = setupDetailsHoverHandlers();
  }

  function setupDetailsHoverHandlers() {
    const listeners = [];
    const detailsElements = mainNavElem.querySelectorAll('details');

    const openOnlyThis = (target) => {
      if (navigator.maxTouchPoints > 0) return; // skip hover on touch devices
      detailsElements.forEach((d) => d !== target && d.removeAttribute('open'));
      target.setAttribute('open', '');
    };

    const closeAll = () => detailsElements.forEach((d) => d.removeAttribute('open'));

    detailsElements.forEach((details) => {
      const summary = details.querySelector('summary');
      if (!summary) return;

      summary.setAttribute('tabindex', '0');

      const onMouseOver = () => openOnlyThis(details);
      const onFocus = () => openOnlyThis(details);
      const onFocusOut = (e) => {
        if (!details.contains(e.relatedTarget)) details.removeAttribute('open');
      };
      const onKeyDown = (e) => {
        if (e.key === 'Escape') {
          details.removeAttribute('open');
          summary.focus();
        }
      };

      summary.addEventListener('mouseover', onMouseOver);
      summary.addEventListener('focus', onFocus);
      details.addEventListener('focusout', onFocusOut);
      details.addEventListener('keydown', onKeyDown);

      listeners.push([summary, 'mouseover', onMouseOver]);
      listeners.push([summary, 'focus', onFocus]);
      listeners.push([details, 'focusout', onFocusOut]);
      listeners.push([details, 'keydown', onKeyDown]);
    });

    const navLinks = Array.from(mainNavElem.querySelectorAll('.main-navigation-link')).filter(
      (link) => link.tagName.toLowerCase() !== 'summary',
    );

    navLinks.forEach((link) => {
      const handler = () => closeAll();
      link.addEventListener('mouseover', handler);
      link.addEventListener('focus', handler);
      listeners.push([link, 'mouseover', handler]);
      listeners.push([link, 'focus', handler]);
    });

    const outsideHandler = (e) => {
      requestAnimationFrame(() => {
        const openDetails = [...detailsElements].filter((d) => d.hasAttribute('open'));
        if (openDetails.length && !mainNavElem.contains(e.target)) {
          closeAll();
        }
      });
    };

    document.addEventListener('pointerup', outsideHandler);
    listeners.push([document, 'pointerup', outsideHandler]);

    return () => {
      listeners.forEach(([el, type, fn]) => el.removeEventListener(type, fn));
    };
  }

  function initializeDetailsElements() {
    const detailsElements = mainNavigationElem.querySelectorAll('details');

    detailsElements.forEach((details, index) => {
      details.setAttribute('data-details-id', index);
      detailsConfig.push({
        id: index,
        element: details,
        open: details.hasAttribute('open'),
      });

      details.addEventListener('toggle', () => {
        detailsConfig[index].open = details.open;
      });
    });

    document.getElementById('detailsConfig').innerHTML = JSON.stringify(detailsConfig, null, 2);
  }

  function initializeNavigationPositions() {
    const navLists = mainNavigationElem.querySelectorAll('.main-navigation-list');
    const positionsMap = {};

    navLists.forEach((list, listIndex) => {
      const listId = listIndex + 1;
      positionsMap[listId] = {};
      const items = list.querySelectorAll('.main-navigation-item');

      items.forEach((item, itemIndex) => {
        const itemId = itemIndex + 1;
        const rect = item.getBoundingClientRect();

        positionsMap[listId][itemId] = {
          left: Math.floor(rect.left),
          right: Math.floor(rect.right),
          width: Math.floor(rect.width),
          height: Math.floor(rect.height),
          top: Math.floor(rect.top),
          bottom: Math.floor(rect.bottom),
          id: itemId,
          visible: true,
        };
      });
    });

    return positionsMap;
  }

  function updateNavigationPositions(existingPositions) {
    const navLists = mainNavigationElem.querySelectorAll('.main-navigation-list');

    navLists.forEach((list, listIndex) => {
      const listId = listIndex + 1;
      const existingList = existingPositions[listId] || {};
      const items = list.querySelectorAll('.main-navigation-item');

      items.forEach((item, itemIndex) => {
        const itemId = itemIndex + 1;
        const rect = item.getBoundingClientRect();
        const visible = existingList[itemId]?.visible ?? true;

        if (!existingPositions[listId]) existingPositions[listId] = {};

        existingPositions[listId][itemId] = {
          left: Math.floor(rect.left),
          right: Math.floor(rect.right),
          visible,
        };
      });
    });
  }

  function updateListItemClass(outerIndex, innerIndex, isVisible) {
    const navLists = mainNavElem.querySelectorAll('.main-navigation-list');
    const list = navLists[outerIndex - 1];
    if (!list) return;

    const listItems = list.querySelectorAll('.main-navigation-item');
    const item = listItems[innerIndex - 1];
    if (!item) return;

    const overflowList = document.getElementById('overflowList');
    if (!overflowList) return;

    let overflowFirstList =
      overflowList.querySelector('.overflow-first-list') ||
      createList(overflowList, 'overflow-first-list');
    let overflowSecondList =
      overflowList.querySelector('.overflow-second-list') ||
      createList(overflowList, 'overflow-second-list');

    const itemId = `overflow-${outerIndex}-${innerIndex}`;

    requestAnimationFrame(() => {
      if (isVisible) {
        item.classList.remove('visually-hidden');
        const existing = overflowList.querySelector(`[data-id="${itemId}"]`);
        if (existing) existing.remove();
      } else {
        item.classList.add('visually-hidden');
        if (!overflowList.querySelector(`[data-id="${itemId}"]`)) {
          const clone = item.cloneNode(true);
          clone.setAttribute('data-id', itemId);
          clone.classList.remove('visually-hidden');

          const details = clone.querySelector('.main-navigation-details');
          if (details) details.classList.add('cloned');

          const targetList = list.id === 'firstNavList' ? overflowFirstList : overflowSecondList;
          useInsertBefore
            ? targetList.insertBefore(clone, targetList.firstChild)
            : targetList.appendChild(clone);

          requestAnimationFrame(() => clone.classList.add('fade-in-active'));
        }
      }

      const hasOverflow = overflowFirstList.children.length || overflowSecondList.children.length;
      overflowDetails.classList.toggle('visually-hidden', !hasOverflow);
    });
  }

  function createList(parent, className) {
    const ul = document.createElement('ul');
    ul.classList.add(className);
    parent.appendChild(ul);
    return ul;
  }

  function returnFinalRightPositionValue() {
    const data = navigationElementsPositionArray;
    const outerKeys = Object.keys(data);
    const lastOuter = data[outerKeys[outerKeys.length - 1]];
    const lastInnerKey = Object.keys(lastOuter).pop();
    return lastOuter[lastInnerKey].right;
  }

  function hideOverflowingItemsOnLoad() {
    const containerRightEdge = mainNavElem.getBoundingClientRect().right;
    const data = navigationElementsPositionArray;

    Object.keys(data)
      .sort((a, b) => b - a)
      .forEach((outerKey) => {
        Object.keys(data[outerKey])
          .sort((a, b) => b - a)
          .forEach((innerKey) => {
            const item = data[outerKey][innerKey];
            if (item.visible && item.right > containerRightEdge) {
              item.visible = false;
              updateListItemClass(outerKey, innerKey, false);
            }
          });
      });
  }

  function updateVisibilityBasedOnPosition() {
    const containerRightEdge = mainNavElem.getBoundingClientRect().right;
    secondaryNavLeftEdge =
      Math.floor(secondaryNavElem.getBoundingClientRect().left) - gapForOverflowDetails + 2;

    Object.entries(navigationElementsPositionArray).forEach(([outerKey, items]) => {
      Object.entries(items).forEach(([innerKey, item]) => {
        const isVisible = item.right <= containerRightEdge;
        if (item.visible !== isVisible) {
          item.visible = isVisible;
          updateListItemClass(outerKey, innerKey, isVisible);
        }
      });
    });
  }

  function handleCollapsedState() {
    mainNavBoundryEnd = returnFinalRightPositionValue();
    if (mainNavBoundryEnd >= secondaryNavLeftEdge) {
      mainNavElem.classList.add('collapsed');
    } else {
      mainNavElem.classList.remove('collapsed');
    }
  }

  function setInitialItems() {
    mainNavigationElem.style.setProperty(
      '--_gap-for-overflow-details',
      `${gapForOverflowDetails}px`,
    );
    navigationElementsPositionArray = initializeNavigationPositions();
    handleCollapsedState();
    hideOverflowingItemsOnLoad();

    // Set overflowDropDownWidth as the largest item width within navigationElementsPositionArray
    const widths = Object.values(navigationElementsPositionArray).flatMap((list) =>
      Object.values(list).map((item) => item.width),
    );
    overflowDropDownWidth = Math.max(...widths, 0);
    setOverflowDropDownWidth();

    document.getElementById('navigationElementsPositionArray').innerHTML = JSON.stringify(
      navigationElementsPositionArray,
      null,
      2,
    );
  }

  function setOverflowDropDownWidth() {
    overflowListElem.style.setProperty('--_overflow-drop-down-width', `${overflowDropDownWidth}px`);
  }

  function handleOverflow() {
    applyDetailsMode();
    updateNavigationPositions(navigationElementsPositionArray);
    updateVisibilityBasedOnPosition();

    const secondaryNavWidth = Math.floor(secondaryNavElem.getBoundingClientRect().width);
    mainNavElem.style.setProperty('--_secondary-nav-width', `${secondaryNavWidth}px`);

    secondaryNavLeftEdge =
      Math.floor(secondaryNavElem.getBoundingClientRect().left) - gapForOverflowDetails + 2;
    const secondNavListElemRightEdge = Math.floor(secondNavListElem.getBoundingClientRect().right);
    const overlap = secondaryNavLeftEdge - secondNavListElemRightEdge + gapForOverflowDetails;

    mainNavElem.classList.toggle('collapsed', overlap < 0);
  }

  if (overflowDetails) {
    overflowDetails.addEventListener('toggle', () => {
      const toggleListeners = ['click', 'keydown', 'focusin'];
      if (overflowDetails.open) {
        toggleListeners.forEach((evt) => document.addEventListener(evt, outsideNavHandler));
      } else {
        toggleListeners.forEach((evt) => document.removeEventListener(evt, outsideNavHandler));
      }
    });
  }

  function outsideNavHandler(e) {
    if (!overflowDetails.contains(e.target) || e.key === 'Escape') {
      overflowDetails.removeAttribute('open');
    }
  }

  // Initialization
  window.addEventListener('resize', () => requestAnimationFrame(handleOverflow));
  setInitialItems();
  handleOverflow();
  initializeDetailsElements();
};

window.addEventListener('load', ResponsiveNavigation);
