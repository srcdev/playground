document.addEventListener('DOMContentLoaded', function () {
  // User congifuration
  const navItemsGap = 12;

  // Get all required elements by ID
  const mainNavigationElem = document.getElementById('mainNavigation');
  const mainNavElem = document.getElementById('mainNav');
  const firstNavListElem = document.getElementById('firstNavList');
  const secondNavListElem = document.getElementById('secondNavList');
  const secondaryNavElem = document.getElementById('secondaryNav');
  const overflowDetails = document.getElementById('overflowDetails');

  // Initialize with empty structure that will be populated
  let navigationElementsPositionArray = {};
  let mainNavBoundryEnd = 0;

  // Variables to track positions
  let secondaryNavLeftEdge = 0;
  // let previousSecondNavListElemRightEdge = 0;
  let previousSecondaryNavLeftEdge = 0;

  function debounceFunction(func, delay) {
    let timeoutId;

    // Return a new function that will be debounced
    return function (...args) {
      // Clear the previous timeout if it exists
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      // Set a new timeout to call the original function after the specified delay
      timeoutId = setTimeout(() => {
        func.apply(this, args);
      }, delay);
    };
  }

  /**
   * Initializes the navigationElementsPositionArray with the current positions of all list items
   * @returns {Object} Updated navigationElementsPositionArray with current positions
   */
  function initializeNavigationPositions() {
    // Get all navigation lists in the main navigation
    const navLists = mainNavigationElem.querySelectorAll('ul[id$="NavList"]');
    const positionsMap = {};

    // Loop through each navigation list
    navLists.forEach((list, listIndex) => {
      // Create an entry for this list using 1-based indexing to match existing structure
      const listId = listIndex + 1;
      positionsMap[listId] = {};

      // Get all list items
      const items = list.querySelectorAll('li');

      // Loop through each item in the list
      items.forEach((item, itemIndex) => {
        // Use 1-based indexing to match existing structure
        const itemId = itemIndex + 1;

        // Get the bounding rectangle for position information
        const rect = item.getBoundingClientRect();

        // Store the position data
        positionsMap[listId][itemId] = {
          left: Math.floor(rect.left),
          right: Math.floor(rect.right),
          visible: true,
        };
      });
    });

    return positionsMap;
  }

  /**
   * Updates the left/right positions in navigationElementsPositionArray while preserving visibility
   * @param {Object} existingPositions The current navigationElementsPositionArray with visibility flags
   */
  function updateNavigationPositions(existingPositions) {
    const navLists = mainNavigationElem.querySelectorAll('ul[id$="NavList"]');

    navLists.forEach((list, listIndex) => {
      const listId = listIndex + 1;
      const existingList = existingPositions[listId] || {};

      const items = list.querySelectorAll('li');

      items.forEach((item, itemIndex) => {
        const itemId = itemIndex + 1;
        const rect = item.getBoundingClientRect();

        if (!existingPositions[listId]) {
          existingPositions[listId] = {};
        }

        // Preserve visibility if it already exists, otherwise default to true
        const existingItem = existingList[itemId];
        const visible = existingItem?.visible ?? true;

        existingPositions[listId][itemId] = {
          left: Math.floor(rect.left),
          right: Math.floor(rect.right),
          visible: visible,
        };
      });
    });
  }

  function returnFinalRightPositionValue() {
    const data = navigationElementsPositionArray;
    // Get the last top-level key
    const outerKeys = Object.keys(data);
    const lastOuterKey = outerKeys[outerKeys.length - 1];

    // Get the last nested key inside the last top-level key
    const innerKeys = Object.keys(data[lastOuterKey]);
    const lastInnerKey = innerKeys[innerKeys.length - 1];

    // Get the 'right' value
    return data[lastOuterKey][lastInnerKey].right;
  }

  function hideOverflowingItemsOnLoad() {
    const containerRightEdge = mainNavElem.getBoundingClientRect().right;
    const data = navigationElementsPositionArray;

    const outerKeys = Object.keys(data).sort((a, b) => Number(a) - Number(b));

    for (let o = 0; o < outerKeys.length; o++) {
      const outerKey = outerKeys[o];
      const innerItems = data[outerKey];
      const innerKeys = Object.keys(innerItems).sort((a, b) => Number(a) - Number(b));

      for (let i = 0; i < innerKeys.length; i++) {
        const innerKey = innerKeys[i];
        const item = innerItems[innerKey];

        if (item.visible && item.right > containerRightEdge) {
          item.visible = false;
          updateListItemClass(outerKey, innerKey, false);
        }
      }
    }
  }

  function isInLastVisibleRange(number) {
    const data = navigationElementsPositionArray;
    const outerKeys = Object.keys(data).sort((a, b) => Number(a) - Number(b));

    for (let o = outerKeys.length - 1; o >= 0; o--) {
      const outerKey = outerKeys[o];
      const innerItems = data[outerKey];
      const innerKeys = Object.keys(innerItems).sort((a, b) => Number(a) - Number(b));

      for (let i = innerKeys.length - 1; i >= 0; i--) {
        const innerKey = innerKeys[i];
        const item = innerItems[innerKey];

        if (item.visible) {
          if (number >= item.left && number <= item.right) {
            item.visible = false;
            updateListItemClass(outerKey, innerKey, false);
            return true;
          }
          return false;
        }
      }
    }

    return false;
  }

  function showIfBeyondFirstHiddenRange(number) {
    const data = navigationElementsPositionArray;
    const outerKeys = Object.keys(data).sort((a, b) => Number(a) - Number(b));

    for (let o = 0; o < outerKeys.length; o++) {
      const outerKey = outerKeys[o];
      const innerItems = data[outerKey];
      const innerKeys = Object.keys(innerItems).sort((a, b) => Number(a) - Number(b));

      for (let i = 0; i < innerKeys.length; i++) {
        const innerKey = innerKeys[i];
        const item = innerItems[innerKey];

        if (!item.visible) {
          if (number > item.right) {
            item.visible = true;
            updateListItemClass(outerKey, innerKey, true);
            return true;
          }
          return false;
        }
      }
    }

    return false;
  }

  function updateListItemClass(outerIndex, innerIndex, isVisible) {
    const navLists = mainNavElem.querySelectorAll('ul[id$="NavList"]');
    const list = navLists[outerIndex - 1];
    if (!list) return;

    const listItems = list.querySelectorAll('li');
    const item = listItems[innerIndex - 1];
    if (!item) return;

    const overflowList = document.getElementById('overflowList');
    if (!overflowList) return;

    const itemId = `overflow-${outerIndex}-${innerIndex}`;

    requestAnimationFrame(() => {
      if (isVisible) {
        item.classList.remove('hidden');

        const existing = overflowList.querySelector(`[data-id="${itemId}"]`);
        if (existing) {
          overflowList.removeChild(existing);
        }
      } else {
        item.classList.add('hidden');

        if (!overflowList.querySelector(`[data-id="${itemId}"]`)) {
          const clone = item.cloneNode(true);
          clone.setAttribute('data-id', itemId);
          clone.classList.remove('hidden');

          // Optional: add a fade-in class or similar
          // clone.classList.add('fade-in');

          overflowList.insertBefore(clone, overflowList.firstChild);
          requestAnimationFrame(() => {
            clone.classList.add('fade-in-active');
          });
        }
      }
      // If overflowList has no children, add class hidden to overflowDetails (parent element)
      if (overflowList.children.length === 0) {
        overflowDetails.classList.add('hidden');
      } else {
        overflowDetails.classList.remove('hidden');
      }
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

  function setPreviousSecondaryNavLeftEdge() {
    // Set previous value with debounce
    previousSecondaryNavLeftEdge = secondaryNavLeftEdge;
  }

  setPreviousSecondaryNavLeftEdge();

  const debouncedPrevMeasurement = debounceFunction(() => {
    setPreviousSecondaryNavLeftEdge();
  }, 50);

  let isCollapsing = false;

  function setInitialItems() {
    mainNavigationElem.style.setProperty('--_nav-items-gap', `${navItemsGap}px`);

    // Initialize the navigation positions array
    navigationElementsPositionArray = initializeNavigationPositions();

    handleCollapsedState();
    hideOverflowingItemsOnLoad();
  }

  function handleOverflow() {
    // Update navigation positions to current state
    handleCollapsedState();
    // navigationElementsPositionArray = initializeNavigationPositions();
    updateNavigationPositions(navigationElementsPositionArray);

    // Set width of secondary nav
    const secondaryNavWidth = Math.floor(secondaryNavElem.getBoundingClientRect().width);
    mainNavElem.style.setProperty('--_secondary-nav-width', `${secondaryNavWidth}px`);

    // Get position of secondaryNav left edge
    secondaryNavLeftEdge =
      Math.floor(secondaryNavElem.getBoundingClientRect().left) - navItemsGap + 2;

    // Get position of secondNavListElem right edge
    const secondNavListElemRightEdge = Math.floor(secondNavListElem.getBoundingClientRect().right);

    // Set position when secondaryNav overlaps mainNav
    const overlapPosition = secondaryNavLeftEdge - secondNavListElemRightEdge + navItemsGap;

    isCollapsing = secondaryNavLeftEdge < previousSecondaryNavLeftEdge;

    if (overlapPosition < Math.floor(navItemsGap * 2 - 1)) {
      if (isCollapsing) {
        isInLastVisibleRange(secondaryNavLeftEdge);
      } else {
        showIfBeyondFirstHiddenRange(secondaryNavLeftEdge);
      }
    }

    debouncedPrevMeasurement();
  }

  // Handle overflow nav details toggle
  if (overflowDetails) {
    overflowDetails.addEventListener('toggle', () => {
      if (overflowDetails.open) {
        document.addEventListener('click', onClickOutside);
        document.addEventListener('keydown', onEscapePress);
        document.addEventListener('focusin', onFocusOutside);
      } else {
        removeAllListeners();
      }
    });
  }

  function onClickOutside(event) {
    if (!overflowDetails.contains(event.target)) {
      overflowDetails.removeAttribute('open');
    }
  }

  function onEscapePress(event) {
    if (event.key === 'Escape') {
      overflowDetails.removeAttribute('open');
    }
  }

  function onFocusOutside(event) {
    if (!overflowDetails.contains(event.target)) {
      overflowDetails.removeAttribute('open');
    }
  }

  function removeAllListeners() {
    document.removeEventListener('click', onClickOutside);
    document.removeEventListener('keydown', onEscapePress);
    document.removeEventListener('focusin', onFocusOutside);
  }

  // Run on initial load and resize
  window.addEventListener('load', handleOverflow);

  // Handle window resize with requestAnimationFrame for performance
  window.addEventListener('resize', () => {
    requestAnimationFrame(() => {
      handleOverflow();
    });
  });

  // let resizeTimeout;

  // window.addEventListener('resize', () => {
  //   clearTimeout(resizeTimeout);
  //   resizeTimeout = setTimeout(() => {
  //     navigationElementsPositionArray = initializeNavigationPositions();
  //     hideOverflowingItemsOnLoad();
  //   }, 100); // debounce to avoid layout thrashing
  // });

  // Run once on DOMContentLoaded too
  setInitialItems();
  handleOverflow();
});
