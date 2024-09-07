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

      // Store the removed listing ID in Chrome storage
      chrome.storage.sync.get({removedListingIds: []}, (data) => {
        const removedListingIds = data.removedListingIds;
        if (!removedListingIds.includes(listingId)) {
          removedListingIds.push(listingId);
          chrome.storage.sync.set({removedListingIds: removedListingIds}, () => {
            console.log(`Listing ID ${listingId} stored as removed`);
          });
        }
      });

      // Find and remove the corresponding map pin
      const map = document.getElementById('map');
      if (map) {
        // Look for the pin element with the matching listing ID
        const mapPin = map.querySelector(`[data-id="${listingId}"]`);
        if (mapPin) {
          mapPin.style.display = 'none'; // or mapPin.remove() if you want to completely remove it
          console.log(`Map pin for listing ${listingId} hidden`);
        } else {
          console.log(`Map pin for listing ${listingId} not found`);
        }
      } else {
        console.log('Map element not found');
      }
    });
    
    // Add the button to the wrapper, then add wrapper to the header
    buttonWrapper.appendChild(removeButton);
    header.appendChild(buttonWrapper);
  });
}

//
function removeListingsFromStorage(){
  console.log(`removing listings from storage`);

  chrome.storage.sync.get({removedListingIds: []}, function(data) {
    if (data.removedListingIds.length !== 0) {
        data.removedListingIds.forEach(function(listingId) {
          // remove from list
          const listing = document.querySelector(`[data-listingid="${listingId}"]`);
          listing.style.display = 'none';

          // Find and remove the corresponding map pin
          const map = document.getElementById('map');
          if (map) {
            // Look for the pin element with the matching listing ID
            const mapPin = map.querySelector(`[data-id="${listingId}"]`);
            if (mapPin) {
              mapPin.style.display = 'none'; // or mapPin.remove() if you want to completely remove it
              console.log(`Map pin for listing ${listingId} hidden`);
            } else {
              console.log(`Map pin for listing ${listingId} not found`);
            }
          } else {
            console.log('Map element not found');
          }
        });
    }
  });
}

// Run the function when the page is fully loaded
window.addEventListener('load', () => {
  setTimeout(removeListingsFromStorage, 1000);
  // setTimeout(addRemoveButtons, 1000);
});

// Add a MutationObserver to handle dynamically loaded content
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
      // setTimeout(addRemoveButtons, 500);
    }
  });
});

// Start observing the document with the configured parameters
observer.observe(document.body, {
  childList: true,
  subtree: true
});

// Popup thing
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "restore") {
      const listing = document.querySelector(`article[data-listingid="${request.listingId}"]`);
      if (listing) {
          listing.style.display = '';
          const map = document.getElementById('map');
          if (map) {
              const mapPin = map.querySelector(`[data-id="${request.listingId}"]`);
              if (mapPin) {
                  mapPin.style.display = '';
              }
          }
          sendResponse({success: true});
      } else {
          sendResponse({success: false});
      }
  }
  return true;
});