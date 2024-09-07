// Should have a list of the removed items with an option to re-add them
console.log('Popup script is running');
document.addEventListener('DOMContentLoaded', function() {
    const removedListings = document.getElementById('removedList');
    console.log("Loading removed listings");

    function updateList() {
        chrome.storage.sync.get({removedListingIds: []}, function(data) {
            removedListings.innerHTML = '';
            if (data.removedListingIds.length === 0) {
                removedListings.innerHTML = '<li>No removed apartments</li>';
            } else {
                data.removedListingIds.forEach(function(id) {
                    const li = document.createElement('li');
                    li.textContent = `Listing ID: ${id}`;
                    
                    const restoreButton = document.createElement('button');
                    restoreButton.textContent = 'Restore';
                    restoreButton.addEventListener('click', function() {
                        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                            chrome.tabs.sendMessage(tabs[0].id, {action: "restore", listingId: id}, function(response) {
                                if (response && response.success) {
                                    chrome.storage.sync.get({removedListingIds: []}, function(data) {
                                        const updatedIds = data.removedListingIds.filter(item => item !== id);
                                        chrome.storage.sync.set({removedListingIds: updatedIds}, function() {
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