   // Ensure preloader is visible as soon as possible
   document.addEventListener('DOMContentLoaded', function() {
    const preloader = document.querySelector('.preloaders');
    
    // Ensure preloader is visible immediately
    preloader.style.display = 'flex';
    
    // Hide preloader after full page load
    window.addEventListener('load', function() {
      // Short timeout to ensure smooth transition
      setTimeout(() => {
        preloader.classList.add('hide');
        
        // Re-enable scrolling
        document.body.style.overflow = 'auto';
      }, 500);
    });
  });