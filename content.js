function addRemoveButtons() {
  console.log('Adding remove buttons');
  // Select all apartment listing elements
  const listings = document.querySelectorAll('article.placard');
  
  listings.forEach((listing, index) => {
    // Find the header element within the listing
    const header = listing.querySelector('header');
    if (!header) {
      console.log(`Header not found for listing ${index}`);
      return;
    }

    // Check if button already exists
    if (header.querySelector('.extension-remove-button-wrapper')) {
      return;
    }

    // Create a wrapper div for the button
    const buttonWrapper = document.createElement('div');
    buttonWrapper.className = 'extension-remove-button-wrapper';
    buttonWrapper.style.cssText = `
      display: inline-block;
      margin-left: 10px;
      margin-right: 15px;
      vertical-align: middle;
    `;

    // Create remove button
    const removeButton = document.createElement('button');
    removeButton.className = 'extension-remove-button';
    removeButton.style.cssText = `
    border: none;
    cursor: pointer;
    padding: 0;
    `;

    // Create an image element
    const img = document.createElement('img');
    img.src = chrome.runtime.getURL('icons/trashIcon.png');
    img.alt = 'Remove';
    img.style.cssText = `
    width: 24px;
    height: 24px;
    `;

    // Append the image to the button
    removeButton.appendChild(img);
    
    // Add click event listener to remove the listing
    removeButton.addEventListener('click', (event) => {
      let listingId = listing.getAttribute('data-listingid');
      event.preventDefault();
      event.stopPropagation();
      listing.style.display = 'none';
      console.log(`Listing ${listingId} hidden`);
    });
    
    // Add the button to the wrapper, then add wrapper to the header
    buttonWrapper.appendChild(removeButton);
    header.appendChild(buttonWrapper);
  });
}

// Run the function when the page is fully loaded
window.addEventListener('load', () => {
  setTimeout(addRemoveButtons, 1000);
});

// Add a MutationObserver to handle dynamically loaded content
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
      setTimeout(addRemoveButtons, 500);
    }
  });
});

// Start observing the document with the configured parameters
observer.observe(document.body, {
  childList: true,
  subtree: true
});