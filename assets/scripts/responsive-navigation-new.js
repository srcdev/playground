document.addEventListener('DOMContentLoaded', function () {
  // User congifuration
  const navItemsGap = 12;

  // Get all required elements by ID
  const mainNavigationElem = document.getElementById('mainNavigation');
  const mainNavElem = document.getElementById('mainNav');
  const firstNavListElem = document.getElementById('firstNavList');
  const secondNavListElem = document.getElementById('secondNavList');
  const secondaryNavElem = document.getElementById('secondaryNav');

  // Initialize with empty structure that will be populated
  let navigationElementsPositionArray = {};
  let mainNavBoundryEnd = 0;
  let mainNavAtMinWidthThreshold = false;

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

    console.log('Navigation positions initialized:', positionsMap);
    return positionsMap;
  }

  function returnFinalRightPositionValue() {
    console.log('initializeNavigationPositions', navigationElementsPositionArray);
    const data = navigationElementsPositionArray;
    // Get the last top-level key
    const outerKeys = Object.keys(data);
    const lastOuterKey = outerKeys[outerKeys.length - 1];

    // Get the last nested key inside the last top-level key
    const innerKeys = Object.keys(data[lastOuterKey]);
    const lastInnerKey = innerKeys[innerKeys.length - 1];

    // Get the 'right' value
    const lastRight = data[lastOuterKey][lastInnerKey].right;
    console.log('lastRight', data[lastOuterKey]);
    return data[lastOuterKey][lastInnerKey].right;
  }

  function handleCollapsedState() {
    console.log('handleCollapsedState');
    mainNavBoundryEnd = returnFinalRightPositionValue();

    if (mainNavBoundryEnd >= secondaryNavLeftEdge) {
      // Add collapsed class to mainNavElem
      mainNavElem.classList.add('collapsed');
    } else {
      // Remove collapsed class from mainNavElem
      mainNavElem.classList.remove('collapsed');
    }

    // Var to get right value of last item in initializeNavigationPositions
  }

  function setPreviousSecondaryNavLeftEdge() {
    // Set previous value with debounce
    previousSecondaryNavLeftEdge = secondaryNavLeftEdge;
  }

  setPreviousSecondaryNavLeftEdge();

  const debouncedPrevMeasurement = debounceFunction(() => {
    setPreviousSecondaryNavLeftEdge();
    console.log('Function executed after delay');
  }, 50);

  let isShrinking = false;
  let isExpanding = false;

  let firstNavInOverflow = false;
  let secondNavInOverflow = false;

  // Store original navigation items from both lists
  const originalFirstListItems = Array.from(firstNavListElem.children).map((item) =>
    item.cloneNode(true),
  );

  const originalSecondListItems = Array.from(secondNavListElem.children).map((item) =>
    item.cloneNode(true),
  );

  function setInitialItems() {
    mainNavigationElem.style.setProperty('--_nav-items-gap', `${navItemsGap}px`);

    // Initialize the navigation positions array
    navigationElementsPositionArray = initializeNavigationPositions();

    handleCollapsedState();
  }

  // Add last item represented by navigationElementsPositionArray marked as visible to first position in overflowList
  function addLastVisibleNavItemToOverflowList() {
    // Get the last non hidden item in the second navigation list
    const lastVisibleItem = Array.from(secondNavListElem.children)
      .reverse()
      .find((item) => {
        const itemId = Array.from(secondNavListElem.children).indexOf(item) + 1;
        const listId = 2; // Assuming secondNavListElem is the second list
        return (
          navigationElementsPositionArray[listId][itemId] &&
          navigationElementsPositionArray[listId][itemId].visible
        );
      });
    console.log('lastVisibleItem', lastVisibleItem);
    if (lastVisibleItem) {
      // Clone the last visible item
      const clonedItem = lastVisibleItem.cloneNode(true);
      // Remove the last visible item from the second navigation list
      // lastVisibleItem.remove();
      lastVisibleItem.classList.add('hidden');
      // Append the cloned item to the overflow list
      const overflowListElem = document.getElementById('overflowList');
      overflowListElem.appendChild(clonedItem);
      // Update the navigationElementsPositionArray to mark this item as not visible
      const itemId = Array.from(secondNavListElem.children).indexOf(lastVisibleItem) + 1;
      const listId = 2; // Assuming secondNavListElem is the second list
      navigationElementsPositionArray[listId][itemId].visible = false;
      console.log('Updated navigationElementsPositionArray:', navigationElementsPositionArray);
    } else {
      console.log('No last visible item found in the second navigation list');
    }
  }

  function handleOverflow() {
    console.clear();
    // Update navigation positions to current state
    handleCollapsedState();
    navigationElementsPositionArray = initializeNavigationPositions();

    console.log('Navigation Positions Array:');
    console.log(navigationElementsPositionArray);
    console.log('- - - - - - - - - - - -');

    console.log('originalFirstListItems');
    console.log(originalFirstListItems);
    console.log('- - - - - - - - - - - -');
    console.log('originalSecondListItems');
    console.log(originalSecondListItems);

    // Set width of secondary nav
    const secondaryNavWidth = Math.floor(secondaryNavElem.getBoundingClientRect().width);
    mainNavElem.style.setProperty('--_secondary-nav-width', `${secondaryNavWidth}px`);

    // Get position of secondaryNav left edge
    secondaryNavLeftEdge =
      Math.floor(secondaryNavElem.getBoundingClientRect().left) - navItemsGap + 2;
    // console.log('secondaryNavLeftEdge', secondaryNavLeftEdge);

    // Get position of firstNavListElem right edge
    const firstNavListElemRightEdge = Math.floor(firstNavListElem.getBoundingClientRect().right);
    // console.log('firstNavListElemRightEdge', firstNavListElemRightEdge);

    // Get position of secondNavListElem right edge
    const secondNavListElemRightEdge = Math.floor(secondNavListElem.getBoundingClientRect().right);
    // console.log('secondNavListElemRightEdge', secondNavListElemRightEdge);

    // Set position when secondaryNav overlaps mainNav
    const overlapPosition = secondaryNavLeftEdge - secondNavListElemRightEdge + navItemsGap;
    // console.log('overlapPosition', overlapPosition);

    isShrinking = secondaryNavLeftEdge < previousSecondaryNavLeftEdge;
    isExpanding = !isShrinking;
    // console.log(`isShrinking: ${isShrinking} | isExpanding: ${isExpanding}`);

    firstNavInOverflow = firstNavListElemRightEdge + (navItemsGap - 2) > secondaryNavLeftEdge;
    secondNavInOverflow = secondNavListElemRightEdge + (navItemsGap - 2) > secondaryNavLeftEdge;
    // console.log(
    //   `firstNavInOverflow: ${firstNavInOverflow} | secondNavInOverflow: ${secondNavInOverflow}`,
    // );

    if (overlapPosition < Math.floor(navItemsGap * 2 - 1)) {
      console.log('secondaryNavElem overlaps mainNavElem');

      if (isShrinking && secondNavInOverflow) {
        // addLastVisibleNavItemToOverflowList();
      }
    } else {
      console.log('secondaryNavElem does not overlap mainNavElem');
    }

    debouncedPrevMeasurement();
    displayConfiguration();
  }

  function displayConfiguration() {
    // Format JSON with 2 spaces indentation for better readability
    document.getElementById('mainNavArray').innerHTML = JSON.stringify(
      navigationElementsPositionArray,
      null,
      2,
    );

    document.getElementById('isShrinking').innerHTML = isShrinking;
    document.getElementById('isExpanding').innerHTML = isExpanding;
    document.getElementById('mainNavBoundryEnd').innerHTML = mainNavBoundryEnd;
    document.getElementById('secondaryNavLeftEdge').innerHTML = secondaryNavLeftEdge;
    document.getElementById('previousSecondaryNavLeftEdge').innerHTML =
      previousSecondaryNavLeftEdge;
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
});
