document.addEventListener('DOMContentLoaded', function() {
    const removedListings = document.getElementById('removedList');

    // Pull the list of removed listing for display in the popupr
    function updateList() {
      chrome.storage.sync.get({removedListings: []}, function(data) {
        removedListings.innerHTML = '';
        if (data.removedListings.length === 0) {
          removedListings.innerHTML = '<li>No removed apartments</li>';
        } else {
          // Listing data
          data.removedListings.forEach(function(listing) {
            const li = document.createElement('li');
            li.textContent = `Listing: ${listing.title} - ${listing.streetAddress}`;
  
            // Button to restore a listing back into the search
            const restoreButton = document.createElement('button');
            restoreButton.textContent = 'Restore';
            restoreButton.addEventListener('click', function() {
              chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                chrome.tabs.sendMessage(tabs[0].id, {action: "restore", listingId: listing.id}, function(response) {
                  if (response && response.success) {
                    chrome.storage.sync.get({removedListings: []}, function(data) {
                      const updatedListings = data.removedListings.filter(item => item.id !== listing.id);
                      chrome.storage.sync.set({removedListings: updatedListings}, function() {
                        li.remove();
                        if (removedListings.children.length === 0) {
                          removedListings.innerHTML = '<li>No removed apartments</li>';
                        }
                      });
                    });
                  }
                });
              });
            });
  
            li.appendChild(restoreButton);
            removedListings.appendChild(li);
          });
        }
      });
    }
  
    updateList();
  });
  