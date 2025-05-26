document.addEventListener('DOMContentLoaded', function () {
  // User congifuration
  const navItemsGap = 12;

  // Get all required elements by ID
  const mainNavigationElem = document.getElementById('mainNavigation');
  const mainNavElem = document.getElementById('mainNav');
  const secondNavListElem = document.getElementById('secondNavList');
  const secondaryNavElem = document.getElementById('secondaryNav');
  const overflowDetails = document.getElementById('overflowDetails');

  // Array to track all details elements and their states
  let detailsConfig = [];

  // Where to add overflow items
  let useInsertBefore = true; // Set to false to use appendChild instead

  // Initialize with empty structure that will be populated
  let navigationElementsPositionArray = {};
  let mainNavBoundryEnd = 0;

  // Variables to track positions
  let secondaryNavLeftEdge = 0;

  /**
   * Initializes tracking for all details elements within mainNavigation
   * Adds data-details-id attribute to each one and tracks open state
   */
  function initializeDetailsElements() {
    const detailsElements = mainNavigationElem.querySelectorAll('details');

    detailsElements.forEach((details, index) => {
      // Add data-details-id attribute
      details.setAttribute('data-details-id', index);

      // Add to tracking array with initial state
      detailsConfig.push({
        id: index,
        element: details,
        open: details.hasAttribute('open'),
      });

      // Add event listener to track state changes
      details.addEventListener('toggle', () => {
        detailsConfig[index].open = details.open;
        console.log(`Details #${index} state changed to ${details.open ? 'open' : 'closed'}`);

        document.getElementById('detailsConfig').innerHTML = JSON.stringify(detailsConfig, null, 2);
      });
    });
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
    const navLists = mainNavigationElem.querySelectorAll('.main-navigation-list');

    navLists.forEach((list, listIndex) => {
      const listId = listIndex + 1;
      const existingList = existingPositions[listId] || {};

      const items = list.querySelectorAll('.main-navigation-item');

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

  function updateListItemClass(outerIndex, innerIndex, isVisible) {
    const navLists = mainNavElem.querySelectorAll('.main-navigation-list');
    const list = navLists[outerIndex - 1];
    if (!list) return;

    const listItems = list.querySelectorAll('.main-navigation-item');
    const item = listItems[innerIndex - 1];
    if (!item) return;

    const overflowList = document.getElementById('overflowList');
    if (!overflowList) return;

    // Ensure overflowList contains two ul elements
    let overflowFirstList = overflowList.querySelector('.overflow-first-list');
    let overflowSecondList = overflowList.querySelector('.overflow-second-list');

    if (!overflowFirstList) {
      overflowFirstList = document.createElement('ul');
      overflowFirstList.classList.add('overflow-first-list');
      overflowList.appendChild(overflowFirstList);
    }

    if (!overflowSecondList) {
      overflowSecondList = document.createElement('ul');
      overflowSecondList.classList.add('overflow-second-list');
      overflowList.appendChild(overflowSecondList);
    }

    const itemId = `overflow-${outerIndex}-${innerIndex}`;

    requestAnimationFrame(() => {
      if (isVisible) {
        item.classList.remove('hidden');

        const existing = overflowList.querySelector(`[data-id="${itemId}"]`);
        if (existing) {
          existing.parentElement.removeChild(existing);
        }
      } else {
        item.classList.add('hidden');

        if (!overflowList.querySelector(`[data-id="${itemId}"]`)) {
          const clone = item.cloneNode(true);
          clone.setAttribute('data-id', itemId);
          clone.classList.remove('hidden');

          // Append to the correct ul based on the original parent
          if (list.id === 'firstNavList') {
            if (useInsertBefore) {
              overflowFirstList.insertBefore(clone, overflowFirstList.firstChild);
            } else {
              overflowFirstList.appendChild(clone);
            }
          } else if (list.id === 'secondNavList') {
            if (useInsertBefore) {
              overflowSecondList.insertBefore(clone, overflowSecondList.firstChild);
            } else {
              overflowSecondList.appendChild(clone);
            }
          }

          requestAnimationFrame(() => {
            clone.classList.add('fade-in-active');
          });
        }
      }

      // If both ul elements in overflowList are empty, add class hidden to overflowDetails
      if (!overflowFirstList.children.length && !overflowSecondList.children.length) {
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

  function setInitialItems() {
    mainNavigationElem.style.setProperty('--_nav-items-gap', `${navItemsGap}px`);

    // Initialize the navigation positions array
    navigationElementsPositionArray = initializeNavigationPositions();

    document.getElementById('navigationElementsPositionArray').innerHTML = JSON.stringify(navigationElementsPositionArray, null, 2);

    handleCollapsedState();
    hideOverflowingItemsOnLoad();
  }

  // Consolidate visibility logic into a single function
  function updateVisibilityBasedOnPosition() {
    const containerRightEdge = mainNavElem.getBoundingClientRect().right;
    const data = navigationElementsPositionArray;

    secondaryNavLeftEdge = Math.floor(secondaryNavElem.getBoundingClientRect().left) - navItemsGap + 2;

    Object.keys(data).forEach((outerKey) => {
      const innerItems = data[outerKey];
      Object.keys(innerItems).forEach((innerKey) => {
        const item = innerItems[innerKey];
        const isVisible = item.right <= containerRightEdge;
        if (item.visible !== isVisible) {
          item.visible = isVisible;
          updateListItemClass(outerKey, innerKey, isVisible);
        }
      });
    });
  }

  // Optimize handleOverflow to reduce redundant calculations
  function handleOverflow() {
    updateNavigationPositions(navigationElementsPositionArray);
    updateVisibilityBasedOnPosition();

    const secondaryNavWidth = Math.floor(secondaryNavElem.getBoundingClientRect().width);
    mainNavElem.style.setProperty('--_secondary-nav-width', `${secondaryNavWidth}px`);

    secondaryNavLeftEdge = Math.floor(secondaryNavElem.getBoundingClientRect().left) - navItemsGap + 2;
    const secondNavListElemRightEdge = Math.floor(secondNavListElem.getBoundingClientRect().right);
    const overlapPosition = secondaryNavLeftEdge - secondNavListElemRightEdge + navItemsGap;

    if (overlapPosition < 0) {
      mainNavElem.classList.add('collapsed');
    } else {
      mainNavElem.classList.remove('collapsed');
    }
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

  // Run once on DOMContentLoaded too
  setInitialItems();
  handleOverflow();

  // Initialize details elements tracking
  initializeDetailsElements();
});
