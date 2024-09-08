function addRemoveButtons() {
  // Select all apartment listing elements
  const listings = document.querySelectorAll('article.placard');
  
  listings.forEach((listing, index) => {
    // Find the header element within the listing
    const header = listing.querySelector('header');

    // Check if button already exists
    if (header != null && header.querySelector('.extension-remove-button-wrapper')) {
      return;
    }
    else{
      propertyInfoTab = listing.querySelector('.price-wrapper');
      if(propertyInfoTab != null && propertyInfoTab.querySelector('.extension-remove-button-wrapper')){
        return;
      }
      else{
        propertyTitle = listing.querySelector('.property-title-wrapper');
        if(propertyTitle != null && propertyTitle.querySelector('.extension-remove-button-wrapper')){
          return;
        }
      }
    }

    // Create a wrapper div for the button
    const buttonWrapper = document.createElement('div');
    buttonWrapper.className = 'extension-remove-button-wrapper';
    buttonWrapper.style.cssText = `
      display: inline-block;
      margin-left: 10px;
      margin-right: 15px;
      vertical-align: middle;
      position: relative;
    `;

    // Create remove button
    const removeButton = document.createElement('button');
    removeButton.className = 'extension-remove-button';
    removeButton.style.cssText = `
      border: none;
      cursor: pointer;
      padding: 0;
      float: right;
      background-color: rgba(255,255,255,0);
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
      event.preventDefault();
      event.stopPropagation();

      let listingId = listing.getAttribute('data-listingid');
      let streetAddress = listing.getAttribute('data-streetaddress');
      let titleElement = listing.querySelector('.js-placardTitle.title');
      let title = titleElement ? titleElement.textContent.trim() : 'Unknown Title';

      // Object to store additional info about the listing
      const listingData = {
        id: listingId,
        streetAddress: streetAddress || 'Unknown Address',
        title: title
      };

      // Hide the listing
      listing.style.display = 'none';

      // Store the listing object in Chrome storage
      chrome.storage.sync.get({removedListings: []}, (data) => {
        const removedListings = data.removedListings;
        // Add the listingData object if it's not already in the storage
        if (!removedListings.some(item => item.id === listingId)) {
          removedListings.push(listingData);
          chrome.storage.sync.set({removedListings: removedListings}, () => {
            console.log(`Listing ${listingId} stored as removed with additional info`);
          });
        }
      });

      // Remove the display from the map
      const map = document.getElementById('map');
      if (map) {
        const mapPin = map.querySelector(`[data-id="${listingId}"]`);
        if (mapPin) {
          mapPin.style.display = 'none';
        }
      }
    });

    // Add the button to the wrapper, then add wrapper to the header
    buttonWrapper.appendChild(removeButton);

    if(header != null){
      header.appendChild(buttonWrapper);
    }
    else {
      // No header
      propertyInfoTab = listing.querySelector('.property-info');
      priceWrapper = listing.querySelector('.price-wrapper');

      if(priceWrapper != null){
        buttonWrapper.style.cssText = `
          display: inline-block;
          vertical-align: middle;
          position: relative;
          flex-grow: 1;
        `;
        priceWrapper.appendChild(buttonWrapper);

        // Move over save icon
        propertyInfoTabSaveIcon = propertyInfoTab.querySelector('.favoriteIcon');
        if(propertyInfoTabSaveIcon != null){
          propertyInfoTabSaveIcon.style.cssText = `
            top: 12px;
            right: 40px;
          `
        }
      }
      else{
        // Find property title wrapper
        propertyTitle = listing.querySelector('.property-title-wrapper');
        if(propertyTitle != null){
          buttonWrapper.style.cssText = `
            display: inline-block;
            vertical-align: middle;
            right: 20px;
            position: relative;
            flex-grow: 1;
          `;

          propertyTitle.style.cssText = `display: flex;`
          propertyTitle.appendChild(buttonWrapper);    
        }
      }
    }
  });
}

// remove the listings previously removed
function removeListingsFromStorage(){
  chrome.storage.sync.get({removedListings: []}, function(data) {
      if (data.removedListings.length !== 0) {
        data.removedListings.forEach(function(listingData) {
          const { id: listingId } = listingData;
          const listing = document.querySelector(`[data-listingid="${listingId}"]`);
          if (listing) {
            listing.style.display = 'none';
          }

          const map = document.getElementById('map');
          if (map) {
            const mapPin = map.querySelector(`[data-id="${listingId}"]`);
            if (mapPin) {
              mapPin.style.display = 'none';
            }
          }
        });
      }
    });
}

// Run the function when the page is fully loaded
window.addEventListener('load', () => {
  setTimeout(removeListingsFromStorage, 1000);
  setTimeout(addRemoveButtons, 1000);
});

// Add a MutationObserver to handle dynamically loaded content
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
      setTimeout(removeListingsFromStorage, 500);
      setTimeout(addRemoveButtons, 500);
    }
  });
});

// Start observing the document with the configured parameters
observer.observe(document.body, {
  childList: true,
  subtree: true
});

// Restore from popup
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