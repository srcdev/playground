document.addEventListener('DOMContentLoaded', function () {
  // User congifuration
  const navItemsGap = 12;

  // Get all required elements by ID
  const mainNavigationElem = document.getElementById('mainNavigation');
  const mainNavElem = document.getElementById('mainNav');
  const firstNavListElem = document.getElementById('firstNavList');
  const secondNavListElem = document.getElementById('secondNavList');
  const secondaryNavElem = document.getElementById('secondaryNav');

  let isShrinking = false;
  let isExpanding = false;

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

  console.log('originalFirstListItems');
  console.log(originalFirstListItems);

  const originalSecondListItems = Array.from(secondNavListElem.children).map((item) =>
    item.cloneNode(true),
  );

  console.log('originalSecondListItems');
  console.log(originalSecondListItems);

  function setInitialItems() {
    mainNavigationElem.style.setProperty('--_nav-items-gap', `${navItemsGap}px`);
  }

  function handleOverflow() {
    console.clear();

    // Set width of secondary nav
    const secondaryNavWidth = Math.floor(secondaryNavElem.getBoundingClientRect().width);
    mainNavElem.style.setProperty('--_secondary-nav-width', `${secondaryNavWidth}px`);

    // Get position of secondaryNav left edge
    const secondaryNavLeftEdge = Math.floor(secondaryNavElem.getBoundingClientRect().left);
    console.log('secondaryNavLeftEdge', secondaryNavLeftEdge);

    // Get position of mainNav right edge
    const mainNavRectRightEdge = Math.floor(mainNavElem.getBoundingClientRect().right);
    // console.log('mainNavRectRightEdge', mainNavRectRightEdge);

    // Get position of secondNavListElem right edge
    const secondNavListElemRightEdge = Math.floor(secondNavListElem.getBoundingClientRect().right);
    console.log('secondNavListElemRightEdge', secondNavListElemRightEdge);

    // Set position when secondaryNav overlaps mainNav
    const overlapPosition = secondaryNavLeftEdge - secondNavListElemRightEdge + navItemsGap;
    console.log('overlapPosition', overlapPosition);

    if (overlapPosition < Math.floor(navItemsGap * 2 - 1)) {
      console.log('secondaryNavElem overlaps mainNavElem');
    } else {
      console.log('secondaryNavElem does not overlap mainNavElem');
    }
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
