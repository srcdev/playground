import debounceFunction from './debounceFunction.js';

document.addEventListener('DOMContentLoaded', function () {
  // User congifuration
  const navItemsGap = 12;

  // Get all required elements by ID
  const mainNavigationElem = document.getElementById('mainNavigation');
  const mainNavElem = document.getElementById('mainNav');
  const secondNavListElem = document.getElementById('secondNavList');
  const secondaryNavElem = document.getElementById('secondaryNav');
  const overflowDetails = document.getElementById('overflowDetails');

  // Initialize with empty structure that will be populated
  let navigationElementsPositionArray = {};
  let mainNavBoundryEnd = 0;

  // Variables to track positions
  let secondaryNavLeftEdge = 0;

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

  function updateListItemClass(outerIndex, innerIndex, isVisible) {
    const navLists = mainNavElem.querySelectorAll('ul[id$="NavList"]');
    const list = navLists[outerIndex - 1];
    if (!list) return;

    const listItems = list.querySelectorAll('li.main-navigation__item'); // Target only li elements with the specific class
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
          const clone = item.cloneNode(true); // Clone the entire li element, including nested content
          clone.setAttribute('data-id', itemId);
          clone.classList.remove('hidden');

          // Ensure nested details elements are properly initialized
          const nestedDetails = clone.querySelectorAll('details');
          nestedDetails.forEach((details, index) => {
            details.open = false; // Reset the open state of cloned details
            details.setAttribute('data-details-id', `details-${index}`); // Assign unique data attribute
          });

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

  function setInitialItems() {
    mainNavigationElem.style.setProperty('--_nav-items-gap', `${navItemsGap}px`);

    // Initialize the navigation positions array
    navigationElementsPositionArray = initializeNavigationPositions();

    handleCollapsedState();
    hideOverflowingItemsOnLoad();
  }

  // Consolidate visibility logic into a single function
  function updateVisibilityBasedOnPosition() {
    const containerRightEdge = mainNavElem.getBoundingClientRect().right;
    const data = navigationElementsPositionArray;

    secondaryNavLeftEdge =
      Math.floor(secondaryNavElem.getBoundingClientRect().left) - navItemsGap + 2;

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

    secondaryNavLeftEdge =
      Math.floor(secondaryNavElem.getBoundingClientRect().left) - navItemsGap + 2;
    const secondNavListElemRightEdge = Math.floor(secondNavListElem.getBoundingClientRect().right);
    const overlapPosition = secondaryNavLeftEdge - secondNavListElemRightEdge + navItemsGap;

    if (overlapPosition < 0) {
      mainNavElem.classList.add('collapsed');
    } else {
      mainNavElem.classList.remove('collapsed');
    }
  }

  // Update overflowDetails toggle handler
  if (overflowDetails) {
    overflowDetails.addEventListener('toggle', (event) => {
      const activeDetails = event.target;

      // Update data-details-active attributes for all details elements, including nested ones
      const allDetails = document.querySelectorAll(
        '#mainNavigation details, #mainNavigation details details',
      );
      allDetails.forEach((details) => {
        if (details === activeDetails) {
          details.setAttribute('data-details-active', 'true');
        } else {
          details.setAttribute('data-details-active', 'false');
        }
      });

      if (activeDetails.open) {
        document.addEventListener('click', (e) => onClickOutside(e, activeDetails));
        document.addEventListener('keydown', (e) => onEscapePress(e, activeDetails));
        document.addEventListener('focusin', (e) => onFocusOutside(e, activeDetails));
      } else {
        removeAllListeners();
      }
    });
  }

  // Add toggle event listeners to all details elements, including nested ones
  function initializeDetailsToggleListeners() {
    const allDetails = document.querySelectorAll(
      '#mainNavigation details, #mainNavigation details details',
    );
    allDetails.forEach((details) => {
      details.addEventListener('toggle', (event) => {
        const activeDetails = event.target;

        // Update data-details-active attributes
        allDetails.forEach((details) => {
          if (details === activeDetails) {
            details.setAttribute('data-details-active', 'true');
          } else {
            details.setAttribute('data-details-active', 'false');
          }
        });
      });
    });
  }

  // Update toggle event listeners to handle child and parent details elements
  function initializeSecondaryNavDetailsListeners() {
    const secondaryNavDetails = document.querySelectorAll('#secondaryNav details');

    secondaryNavDetails.forEach((details) => {
      details.addEventListener('toggle', () => {
        // Set all details elements within #secondaryNav to data-details-active="false"
        secondaryNavDetails.forEach((otherDetails) => {
          otherDetails.setAttribute('data-details-active', 'false');
        });

        // Set the active details element to data-details-active="true" if it is open
        if (details.open) {
          details.setAttribute('data-details-active', 'true');

          // If the active details is a child, set #overflowDetails to false
          if (details.closest('#overflowDetails')) {
            document.getElementById('overflowDetails').setAttribute('data-details-active', 'false');
          }
        }
      });
    });
  }

  // Assign unique data-details-id and manage state for details elements
  function initializeDetailsManagement() {
    const allDetails = document.querySelectorAll('#mainNavigation details');
    const stateArray = [];

    // Assign unique data-details-id to each details element
    allDetails.forEach((details, index) => {
      const uniqueId = `details-${index}`;
      details.setAttribute('data-details-id', uniqueId);
      stateArray.push({ id: uniqueId, open: false });

      // Add toggle event listener
      details.addEventListener('toggle', () => {
        const isOpen = details.open;

        // Update state array
        stateArray.forEach((state) => {
          if (state.id === uniqueId) {
            state.open = isOpen;
          } else {
            state.open = false;
          }
        });

        // Close all other details elements
        allDetails.forEach((otherDetails) => {
          if (otherDetails.getAttribute('data-details-id') !== uniqueId) {
            otherDetails.removeAttribute('open');
          }
        });

        // Remove event listeners from all other details elements
        document.removeEventListener('click', onClickOutside);
        document.removeEventListener('keydown', onEscapePress);
        document.removeEventListener('focusin', onFocusOutside);

        // Add event listeners to the active details element
        if (isOpen) {
          document.addEventListener('click', (e) => onClickOutside(e, details));
          document.addEventListener('keydown', (e) => onEscapePress(e, details));
          document.addEventListener('focusin', (e) => onFocusOutside(e, details));
        }
      });
    });
  }

  function onClickOutside(event, activeDetails) {
    if (!activeDetails.contains(event.target)) {
      activeDetails.removeAttribute('open');
    }
  }

  function onEscapePress(event, activeDetails) {
    if (event.key === 'Escape' && activeDetails.getAttribute('data-details-active') === 'true') {
      activeDetails.removeAttribute('open');
    }
  }

  function onFocusOutside(event, activeDetails) {
    if (!activeDetails.contains(event.target)) {
      activeDetails.removeAttribute('open');
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
  initializeDetailsToggleListeners();
  initializeSecondaryNavDetailsListeners();
  initializeDetailsManagement();
});
