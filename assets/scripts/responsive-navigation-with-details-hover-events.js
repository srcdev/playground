document.addEventListener('DOMContentLoaded', function () {
  // User congifuration
  const gapForOverflowDetails = 12;

  // Get all required elements by ID
  const mainNavigationElem = document.getElementById('mainNavigation');
  const mainNavElem = document.getElementById('mainNav');
  const secondNavListElem = document.getElementById('secondNavList');
  const secondaryNavElem = document.getElementById('secondaryNav');
  const overflowDetails = document.getElementById('overflowDetails');

  // Array to track all details elements and their states
  let detailsConfig = [];
  const trackDetailsHoverEvents = true; // Set to false to disable hover events on details elements

  // Where to add overflow items
  let useInsertBefore = true; // Set to false to use appendChild instead

  // Initialize with empty structure that will be populated
  let navigationElementsPositionArray = {};
  let mainNavBoundryEnd = 0;

  // Variables to track positions
  let secondaryNavLeftEdge = 0;

  // Sleep function to delay execution
  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function useDetailsHoverEvents() {
    const nav = document.querySelector('.main-navigation');
    const allDetails = Array.from(nav.querySelectorAll("details[name='navigation-group']"));
    const listeners = [];

    // Combined handler for details actions
    function handleDetailsAction(action, targetDetails) {
      switch (action) {
        case 'openOnlyThis':
          allDetails.forEach((d) => {
            if (d !== targetDetails) {
              d.removeAttribute('open');
            }
          });
          targetDetails.setAttribute('open', '');
          break;
        case 'closeAll':
          allDetails.forEach((d) => d.removeAttribute('open'));
          break;
        case 'closeIfFocusOut':
          targetDetails.removeAttribute('open');
          break;
        case 'escape': {
          targetDetails.removeAttribute('open');
          const summary = targetDetails.querySelector('summary');
          if (summary) summary.focus();
          break;
        }
        default:
          break;
      }
    }

    allDetails.forEach((details) => {
      const summary = details.querySelector('summary');

      if (!summary.hasAttribute('tabindex')) {
        summary.setAttribute('tabindex', '0');
      }

      const onMouseOver = () => handleDetailsAction('openOnlyThis', details);
      const onFocus = () => handleDetailsAction('openOnlyThis', details);
      const onFocusOut = (e) => {
        if (!details.contains(e.relatedTarget)) {
          handleDetailsAction('closeIfFocusOut', details);
        }
      };
      const onKeyDown = (e) => {
        if (e.key === 'Escape') {
          handleDetailsAction('escape', details);
        }
      };

      summary.addEventListener('mouseover', onMouseOver);
      summary.addEventListener('focus', onFocus);
      details.addEventListener('focusout', onFocusOut);
      details.addEventListener('keydown', onKeyDown);

      listeners.push(
        {
          element: summary,
          events: [
            { type: 'mouseover', handler: onMouseOver },
            { type: 'focus', handler: onFocus },
          ],
        },
        {
          element: details,
          events: [
            { type: 'focusout', handler: onFocusOut },
            { type: 'keydown', handler: onKeyDown },
          ],
        },
      );
    });

    // Handle regular nav links (not summary)
    const navLinks = Array.from(nav.querySelectorAll('.main-navigation-link')).filter((link) => link.tagName.toLowerCase() !== 'summary');

    navLinks.forEach((link) => {
      const onHoverOrFocus = () => handleDetailsAction('closeAll');

      link.addEventListener('mouseover', onHoverOrFocus);
      link.addEventListener('focus', onHoverOrFocus);

      listeners.push({
        element: link,
        events: [
          { type: 'mouseover', handler: onHoverOrFocus },
          { type: 'focus', handler: onHoverOrFocus },
        ],
      });
    });

    // Close when clicking or touching outside the entire nav
    const onClickOrTouchOutside = (event) => {
      if (!nav.contains(event.target)) {
        handleDetailsAction('closeAll');
      }
    };

    document.addEventListener('click', onClickOrTouchOutside);
    document.addEventListener('touchstart', onClickOrTouchOutside);

    listeners.push({
      element: document,
      events: [
        { type: 'click', handler: onClickOrTouchOutside },
        { type: 'touchstart', handler: onClickOrTouchOutside },
      ],
    });

    // Return cleanup function
    return () => {
      listeners.forEach(({ element, events }) => {
        events.forEach(({ type, handler }) => {
          element.removeEventListener(type, handler);
        });
      });
    };
  }

  // Call this to cleanup navigation details listeners
  // This will remove all event listeners added by useDetailsHoverEvents
  // const cleanupNavigation = useDetailsHoverEvents();

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
    const navLists = mainNavigationElem.querySelectorAll('.main-navigation-list');
    const positionsMap = {};

    // Loop through each navigation list
    navLists.forEach((list, listIndex) => {
      // Create an entry for this list using 1-based indexing to match existing structure
      const listId = listIndex + 1;
      positionsMap[listId] = {};

      // Get all list items
      const items = list.querySelectorAll('.main-navigation-item');

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

    const outerKeys = Object.keys(data).sort((a, b) => Number(b) - Number(a)); // Sort in descending order

    for (let o = 0; o < outerKeys.length; o++) {
      const outerKey = outerKeys[o];
      const innerItems = data[outerKey];
      const innerKeys = Object.keys(innerItems).sort((a, b) => Number(b) - Number(a)); // Sort in descending order

      // sleep(10);

      for (let i = 0; i < innerKeys.length; i++) {
        const innerKey = innerKeys[i];
        const item = innerItems[innerKey];

        if (item.visible && item.right > containerRightEdge) {
          item.visible = false;
          updateListItemClass(outerKey, innerKey, false);

          // sleep(10);
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
        item.classList.remove('visually-hidden');

        const existing = overflowList.querySelector(`[data-id="${itemId}"]`);
        if (existing) {
          existing.parentElement.removeChild(existing);
        }
      } else {
        item.classList.add('visually-hidden');

        if (!overflowList.querySelector(`[data-id="${itemId}"]`)) {
          const clone = item.cloneNode(true);
          clone.setAttribute('data-id', itemId);
          clone.classList.remove('visually-hidden');

          // If clone has .main-navigation-details as a child addClass 'cloned'
          const details = clone.querySelector('.main-navigation-details');
          if (details) {
            details.classList.add('cloned');
          }

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

      // If both ul elements in overflowList are empty, add class visually-hidden to overflowDetails
      if (!overflowFirstList.children.length && !overflowSecondList.children.length) {
        overflowDetails.classList.add('visually-hidden');
      } else {
        overflowDetails.classList.remove('visually-hidden');
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
    mainNavigationElem.style.setProperty('--_gap-for-overflow-details', `${gapForOverflowDetails}px`);

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

    secondaryNavLeftEdge = Math.floor(secondaryNavElem.getBoundingClientRect().left) - gapForOverflowDetails + 2;

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
    // console.clear();
    // console.log('navigationElementsPositionArray');
    // console.log(navigationElementsPositionArray);

    updateNavigationPositions(navigationElementsPositionArray);
    updateVisibilityBasedOnPosition();

    const secondaryNavWidth = Math.floor(secondaryNavElem.getBoundingClientRect().width);
    mainNavElem.style.setProperty('--_secondary-nav-width', `${secondaryNavWidth}px`);

    secondaryNavLeftEdge = Math.floor(secondaryNavElem.getBoundingClientRect().left) - gapForOverflowDetails + 2;
    const secondNavListElemRightEdge = Math.floor(secondNavListElem.getBoundingClientRect().right);
    const overlapPosition = secondaryNavLeftEdge - secondNavListElemRightEdge + gapForOverflowDetails;

    // console.log(`overlapPosition: ${overlapPosition}`);
    // console.log(`secondaryNavLeftEdge: ${secondaryNavLeftEdge}`);
    // console.log(`secondNavListElemRightEdge: ${secondNavListElemRightEdge}`);
    // console.log(`mainNavBoundryEnd: ${mainNavBoundryEnd}`);

    // console.log(`secondaryNavWidth: ${secondaryNavWidth}`);

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
  // window.addEventListener('load', handleOverflow);
  window.addEventListener('load', () => {
    requestAnimationFrame(() => {
      handleOverflow();

      if (trackDetailsHoverEvents) useDetailsHoverEvents();
    });
  });

  // Example: initialize on DOM ready
  // document.addEventListener('DOMContentLoaded', () => {
  // const cleanupNavigation = useDetailsHoverEvents();

  // Optional: clean up later
  // cleanupNavigation();
  // });

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
