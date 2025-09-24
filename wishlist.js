// Initialize wishlist from localStorage
let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];

// Function to update wishlist count display
function updateWishlistCount() {
  const countElement = document.getElementById('wishlistCount');
  if (countElement) {
    countElement.textContent = wishlist.length;
  }
}

// Function to add/remove item from wishlist
function toggleWishlistItem(productId, productName, productPrice, productImage) {
  // Check if product is already in wishlist
  const existingIndex = wishlist.findIndex(item => item.id === productId);
  
  if (existingIndex >= 0) {
    // Remove from wishlist
    wishlist.splice(existingIndex, 1);
    showToast('Item removed from wishlist');
    return false; // Item was removed
  } else {
    // Add to wishlist
    wishlist.push({
      id: productId,
      name: productName,
      price: productPrice,
      image: productImage
    });
    showToast('Item added to wishlist');
    return true; // Item was added
  }
}

// Function to save wishlist to localStorage
function saveWishlist() {
  localStorage.setItem('wishlist', JSON.stringify(wishlist));
  updateWishlistCount();
}

// Function to show toast notifications
function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'position-fixed bottom-0 end-0 p-3';
  toast.style.zIndex = '1100';
  toast.innerHTML = `
    <div class="toast show" role="alert" aria-live="assertive" aria-atomic="true">
      <div class="toast-header">
        <strong class="me-auto">Wishlist</strong>
        <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
      <div class="toast-body">
        ${message}
      </div>
    </div>
  `;
  document.body.appendChild(toast);
  
  // Remove toast after 3 seconds
  setTimeout(() => {
    toast.remove();
  }, 3000);
}

// Function to update wishlist modal content
function updateWishlistModal() {
  const wishlistItemsContainer = document.getElementById('wishlistItems');
  
  if (wishlist.length === 0) {
    wishlistItemsContainer.innerHTML = `
      <div class="text-center py-5">
        <i class="far fa-heart fa-4x text-muted mb-3"></i>
        <h5>Your wishlist is empty</h5>
        <p>Start adding items you love!</p>
      </div>
    `;
    return;
  }
  
  let html = '<div class="row">';
  wishlist.forEach(item => {
    html += `
      <div class="col-md-6 mb-3">
        <div class="card">
          <div class="row g-0">
            <div class="col-md-4">
              <img src="${item.image}" class="img-fluid rounded-start" alt="${item.name}">
            </div>
            <div class="col-md-8">
              <div class="card-body">
                <h5 class="card-title">${item.name}</h5>
                <p class="card-text text-danger fw-bold">₹${item.price}</p>
                <button class="btn btn-outline-danger btn-sm remove-wishlist" data-product-id="${item.id}">
                  <i class="fas fa-trash-alt"></i> Remove
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  });
  html += '</div>';
  wishlistItemsContainer.innerHTML = html;
  
  // Add event listeners to remove buttons
  document.querySelectorAll('.remove-wishlist').forEach(button => {
    button.addEventListener('click', function() {
      const productId = this.getAttribute('data-product-id');
      wishlist = wishlist.filter(item => item.id !== productId);
      saveWishlist();
      updateWishlistModal();
      
      // Update heart icons on page
      document.querySelectorAll(`.heart-icon[data-product-id="${productId}"]`).forEach(icon => {
        icon.classList.remove('fas', 'active');
        icon.classList.add('far');
      });
      
      showToast('Item removed from wishlist');
    });
  });
}

// Initialize wishlist functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  updateWishlistCount();
  
  // Heart icon click handler
  document.querySelectorAll('.heart-icon').forEach(icon => {
    icon.addEventListener('click', function(e) {
      e.preventDefault();
      const productId = this.getAttribute('data-product-id');
      const productName = this.getAttribute('data-product-name');
      const productPrice = this.getAttribute('data-product-price');
      const productImage = this.getAttribute('data-product-image');
      
      const wasAdded = toggleWishlistItem(productId, productName, productPrice, productImage);
      
      // Update icon appearance
      if (wasAdded) {
        this.classList.remove('far');
        this.classList.add('fas', 'active');
      } else {
        this.classList.remove('fas', 'active');
        this.classList.add('far');
      }
      
      saveWishlist();
      
      // If modal is open, update it
      if (document.querySelector('.modal.show')) {
        updateWishlistModal();
      }
    });
    
    // Check if this product is in wishlist and update icon
    const productId = icon.getAttribute('data-product-id');
    if (wishlist.some(item => item.id === productId)) {
      icon.classList.remove('far');
      icon.classList.add('fas', 'active');
    }
  });
  
  // Wishlist button click handler
  const wishlistButton = document.getElementById('wishlistButton');
  if (wishlistButton) {
    wishlistButton.addEventListener('click', function() {
      const wishlistModal = new bootstrap.Modal(document.getElementById('wishlistModal'));
      updateWishlistModal();
      wishlistModal.show();
    });
  }
  
  // View Full Wishlist button
  const viewWishlistBtn = document.getElementById('viewWishlistPage');
  if (viewWishlistBtn) {
    viewWishlistBtn.addEventListener('click', function() {
      window.location.href = 'wishlist.html';
    });
  }
});