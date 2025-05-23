document.addEventListener('DOMContentLoaded', function () {
  // User congifuration
  const navItemsGap = 12;

  // Get all required elements by ID
  const mainNavigationElem = document.getElementById('mainNavigation');
  const mainNavElem = document.getElementById('mainNav');
  const firstNavListElem = document.getElementById('firstNavList');
  const secondNavListElem = document.getElementById('secondNavList');
  const secondaryNavElem = document.getElementById('secondaryNav');

  const navigationElementsPositionArray = {
    1: {
      1: {
        left: 0,
        right: 0,
        visible: true,
      },
      2: {
        left: 0,
        right: 0,
        visible: true,
      },
      3: {
        left: 0,
        right: 0,
        visible: true,
      },
    },
    2: {
      1: {
        left: 0,
        right: 0,
        visible: true,
      },
      2: {
        left: 0,
        right: 0,
        visible: true,
      },
    },
  };

  let previousSecondNavListElemRightEdge = Math.floor(
    secondNavListElem.getBoundingClientRect().right,
  );

  let isShrinking = false;
  let isExpanding = false;

  let firstNavInOverflow = false;
  let secondNavInOverflow = false;

  // Exit if required elements don't exist
  if (
    // !mainNavigation ||
    !mainNavElem ||
    // !firstNavList ||
    // !secondNavList ||
    // !overflowList ||
    !secondaryNavElem
    // !overflowDetails
  ) {
    console.error('Required navigation elements not found');
    return;
  }

  // Store original navigation items from both lists
  const originalFirstListItems = Array.from(firstNavListElem.children).map((item) =>
    item.cloneNode(true),
  );

  const originalSecondListItems = Array.from(secondNavListElem.children).map((item) =>
    item.cloneNode(true),
  );

  function setInitialItems() {
    mainNavigationElem.style.setProperty('--_nav-items-gap', `${navItemsGap}px`);
  }

  // Move last item from originalSecondListItems to first item in overflowList
  function moveLastItemToOverflow() {
    console.log('moveLastItemToOverflow()');

    const lastItem = originalSecondListItems.pop();
    if (lastItem) {
      const overflowListElem = document.getElementById('overflowList');
      overflowListElem.appendChild(lastItem.cloneNode(true));

      // now delete the last item from the secondNavListElem
      const lastItemInSecondNavList = secondNavListElem.lastElementChild;
      if (lastItemInSecondNavList) {
        secondNavListElem.removeChild(lastItemInSecondNavList);
      }
    }
  }

  function handleOverflow() {
    console.clear();

    console.log('originalFirstListItems');
    console.log(originalFirstListItems);
    console.log('- - - - - - - - - - - -');
    console.log('originalSecondListItems');
    console.log(originalSecondListItems);
    console.log('- - - - - - - - - - - -');
    console.log('previousSecondNavListElemRightEdge');
    console.log(previousSecondNavListElemRightEdge);

    // Set width of secondary nav
    const secondaryNavWidth = Math.floor(secondaryNavElem.getBoundingClientRect().width);
    mainNavElem.style.setProperty('--_secondary-nav-width', `${secondaryNavWidth}px`);

    // Get position of secondaryNav left edge
    const secondaryNavLeftEdge = Math.floor(secondaryNavElem.getBoundingClientRect().left);
    console.log('secondaryNavLeftEdge', secondaryNavLeftEdge);

    // Get position of mainNav right edge
    const mainNavRectRightEdge = Math.floor(mainNavElem.getBoundingClientRect().right);
    // console.log('mainNavRectRightEdge', mainNavRectRightEdge);

    // Get position of firstNavListElem right edge
    const firstNavListElemRightEdge = Math.floor(firstNavListElem.getBoundingClientRect().right);
    console.log('firstNavListElemRightEdge', firstNavListElemRightEdge);

    // Get position of secondNavListElem right edge
    const secondNavListElemRightEdge = Math.floor(secondNavListElem.getBoundingClientRect().right);
    console.log('secondNavListElemRightEdge', secondNavListElemRightEdge);

    // Set position when secondaryNav overlaps mainNav
    const overlapPosition = secondaryNavLeftEdge - secondNavListElemRightEdge + navItemsGap;
    console.log('overlapPosition', overlapPosition);

    isShrinking = secondNavListElemRightEdge < previousSecondNavListElemRightEdge;
    isExpanding = !isShrinking;
    console.log(`isShrinking: ${isShrinking} | isExpanding: ${isExpanding}`);

    firstNavInOverflow = firstNavListElemRightEdge + (navItemsGap - 2) > secondaryNavLeftEdge;
    secondNavInOverflow = secondNavListElemRightEdge + (navItemsGap - 2) > secondaryNavLeftEdge;
    console.log(
      `firstNavInOverflow: ${firstNavInOverflow} | secondNavInOverflow: ${secondNavInOverflow}`,
    );

    if (overlapPosition < Math.floor(navItemsGap * 2 - 1)) {
      console.log('secondaryNavElem overlaps mainNavElem');

      if (isShrinking && secondNavInOverflow) {
        moveLastItemToOverflow();
      }
    } else {
      console.log('secondaryNavElem does not overlap mainNavElem');
    }

    previousSecondNavListElemRightEdge = secondNavListElemRightEdge;
  }

  // Run on initial load and resize
  window.addEventListener('load', handleOverflow);

  // Handle window resize with requestAnimationFrame for performance
  window.addEventListener('resize', () => {
    // requestAnimationFrame(() => {
    handleOverflow();
    // });
  });

  // Run once on DOMContentLoaded too
  setInitialItems();
  handleOverflow();
});
