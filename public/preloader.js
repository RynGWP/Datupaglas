document.addEventListener('DOMContentLoaded', function() {
    // Initialize content as hidden
    const content = document.getElementById('content');
    const preloader = document.getElementById('preloader');

    // Function to hide preloader and show content
    function hidePreloader() {
        preloader.classList.add('fade-out');
        content.style.opacity = '1';
        
        // Remove preloader from DOM after animation
        setTimeout(() => {
            preloader.style.display = 'none';
        }, 1000); // Match this with the CSS transition duration
    }

    // Hide preloader when window is fully loaded
    if (document.readyState === 'complete') {
        hidePreloader();
    } else {
        window.addEventListener('load', hidePreloader);
    }

    // Fallback: Hide preloader after 5 seconds even if load event doesn't fire
    setTimeout(hidePreloader, 5000);
});