document.addEventListener('DOMContentLoaded', function () {
  // Get all required elements by ID
  const mainNavigation = document.getElementById('mainNavigation');
  const mainNav = document.getElementById('mainNav');
  const firstNavList = document.getElementById('firstNavList');
  const secondNavList = document.getElementById('secondNavList');
  const overflowList = document.getElementById('overflowList');
  const secondaryNav = document.getElementById('secondaryNav');
  const overflowDetails = document.getElementById('overflowDetails');

  // Exit if required elements don't exist
  if (
    !mainNavigation ||
    !mainNav ||
    !firstNavList ||
    !secondNavList ||
    !overflowList ||
    !secondaryNav ||
    !overflowDetails
  ) {
    console.error('Required navigation elements not found');
    return;
  }

  // Store original navigation items from both lists
  const originalFirstListItems = Array.from(firstNavList.children).map((item) =>
    item.cloneNode(true),
  );
  const originalSecondListItems = Array.from(secondNavList.children).map((item) =>
    item.cloneNode(true),
  );

  function handleOverflow() {
    console.clear();
    return;

    // Always restore all items first
    overflowList.innerHTML = '';
    firstNavList.innerHTML = '';
    secondNavList.innerHTML = '';
    overflowDetails.style.display = 'none';

    originalFirstListItems.forEach((item) => firstNavList.appendChild(item.cloneNode(true)));
    originalSecondListItems.forEach((item) => secondNavList.appendChild(item.cloneNode(true)));

    // Force reflow
    void mainNavigation.offsetWidth;

    const GAP = 12;
    const containerRect = mainNavigation.getBoundingClientRect();
    const secondaryRect = secondaryNav.getBoundingClientRect();
    const firstListRect = firstNavList.getBoundingClientRect();
    const secondListRect = secondNavList.getBoundingClientRect();
    const mainNavRect = mainNav.getBoundingClientRect();

    console.log('containerRect:', containerRect);
    console.log('mainNavRect:', mainNavRect);
    console.log('firstListRect:', firstListRect);
    console.log('secondListRect:', secondListRect);
    console.log('secondaryRect:', secondaryRect);

    // Helper: get the rightmost nav item (last in #secondNavList, else last in #firstNavList)
    function getRightmostNavItem() {
      if (secondNavList.children.length > 0) {
        return secondNavList.lastElementChild;
      } else {
        return firstNavList.lastElementChild;
      }
    }

    // Helper: check if secondaryNav is too close to the rightmost nav item
    function needsToOverflow() {
      const rightmost = getRightmostNavItem();
      if (!rightmost) return false;
      const rightRect = rightmost.getBoundingClientRect();
      const secondaryRectNow = secondaryNav.getBoundingClientRect();
      const gap = secondaryRectNow.left - rightRect.right;
      console.log('rightmost:', rightmost, 'rightRect:', rightRect);
      console.log('secondaryRectNow:', secondaryRectNow);
      console.log('gap between rightmost and secondaryNav:', gap);
      return gap < GAP;
    }

    // Remove items to overflow until the gap is respected
    const overflowItems = [];
    let loopCount = 0;
    while (needsToOverflow()) {
      loopCount++;
      if (secondNavList.children.length > 0) {
        const last = secondNavList.lastElementChild;
        console.log(`[${loopCount}] Moving to overflow (secondNavList):`, last.textContent);
        overflowItems.unshift(last.cloneNode(true));
        last.remove();
      } else if (firstNavList.children.length > 1) {
        const last = firstNavList.lastElementChild;
        console.log(`[${loopCount}] Moving to overflow (firstNavList):`, last.textContent);
        overflowItems.unshift(last.cloneNode(true));
        last.remove();
      } else {
        console.log(`[${loopCount}] Cannot remove any more items.`);
        break;
      }
      void mainNavigation.offsetWidth;
    }

    // Try to restore from overflow if there's space
    let changed = true;
    while (changed && overflowItems.length > 0) {
      changed = false;
      const item = overflowItems[0];
      const text = item.textContent;
      const inFirst = originalFirstListItems.some((orig) => orig.textContent === text);
      const inSecond = originalSecondListItems.some((orig) => orig.textContent === text);
      if (inSecond) {
        secondNavList.appendChild(item.cloneNode(true));
        void mainNavigation.offsetWidth;
        if (!needsToOverflow()) {
          console.log('Restoring to secondNavList:', text);
          overflowItems.shift();
          changed = true;
        } else {
          secondNavList.removeChild(secondNavList.lastElementChild);
        }
      } else if (inFirst) {
        firstNavList.appendChild(item.cloneNode(true));
        void mainNavigation.offsetWidth;
        if (!needsToOverflow()) {
          console.log('Restoring to firstNavList:', text);
          overflowItems.shift();
          changed = true;
        } else {
          firstNavList.removeChild(firstNavList.lastElementChild);
        }
      }
    }

    // Add remaining overflow items to overflowList (top of list)
    overflowItems.forEach((item) => overflowList.appendChild(item));
    if (overflowList.children.length > 0) {
      overflowDetails.style.display = 'inline-block';
      console.log('Overflow menu enabled with', overflowList.children.length, 'items');
    } else {
      overflowDetails.style.display = 'none';
      console.log('Overflow menu hidden');
    }
  }

  // Run on initial load and resize
  window.addEventListener('load', handleOverflow);

  // Handle window resize with debounce for performance
  let resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(handleOverflow, 100);
  });

  // Run once on DOMContentLoaded too
  handleOverflow();
});
