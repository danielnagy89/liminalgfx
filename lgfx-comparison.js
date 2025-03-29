// LGFX Image Comparison slider extension for Fancybox 
// specifications by Daniel Nagy
// code bulk by Cl.ai
// rev.7 30-03-2025 - gallery functionality with slider-anchored labels

(function() {
    // Track active comparison slides to avoid duplicate initialization
    const activeComparisons = new Map();
  
    // Helper function to set up a comparison slide
    function setupComparisonSlide(fancybox, slide) {
      // Skip if already processed or no comparison image
      if (activeComparisons.has(slide.index) || !slide.triggerEl || !slide.triggerEl.dataset.comparisonImage) {
        return false;
      }
      
      // Get the comparison image URL
      const comparisonUrl = slide.triggerEl.dataset.comparisonImage;
      
      // Get custom labels (with empty string fallbacks)
      const labelA = slide.triggerEl.dataset.labelA || '';
      const labelB = slide.triggerEl.dataset.labelB || '';
      
      // Find the content container and image
      const content = slide.el.querySelector('.fancybox__content');
      const mainImg = slide.el.querySelector('.fancybox-image');
      
      if (!content || !mainImg) {
        return false;
      }
      
      // Create a wrapper that will contain our comparison UI
      const wrapper = document.createElement('div');
      wrapper.className = 'comparison-wrapper';
      
      // Create the "B" image that will be clipped
      const imgB = document.createElement('img');
      imgB.className = 'comparison-imgB';
      imgB.src = comparisonUrl;
      imgB.alt = labelB || 'Image B';
      imgB.style.clipPath = 'polygon(50% 0, 100% 0, 100% 100%, 50% 100%)';
      imgB.style.opacity = '0'; // Start hidden
      
      wrapper.appendChild(imgB);
      
      // Create the slider handle with visible labels
      const handle = document.createElement('div');
      handle.className = 'comparison-handle';
      
      // Create line using a div
      const line = document.createElement('div');
      line.className = 'comparison-handle-line';
      
      // Create circle handle using an image
      const circle = document.createElement('img');
      circle.className = 'comparison-handle-circle';
      circle.src = '/graphics/compare-slider.svg';
      circle.alt = '';
      
      handle.appendChild(line);
      handle.appendChild(circle);
      
      // Create label containers that will follow the handle
      let labelContainerA = null;
      let labelContainerB = null;
      
      // Only create labels if at least one label is provided
      if (labelA || labelB) {
        // Create labels wrapper attached to handle
        const labelsWrapper = document.createElement('div');
        labelsWrapper.className = 'comparison-labels-wrapper';
        
        if (labelA) {
          labelContainerA = document.createElement('div');
          labelContainerA.className = 'comparison-label-container-A';
          labelContainerA.textContent = labelA;
          labelsWrapper.appendChild(labelContainerA);
        }
        
        if (labelB) {
          labelContainerB = document.createElement('div');
          labelContainerB.className = 'comparison-label-container-B';
          labelContainerB.textContent = labelB;
          labelsWrapper.appendChild(labelContainerB);
        }
        
        handle.appendChild(labelsWrapper);
      }
      
      wrapper.appendChild(handle);
      
      // Add invisible slider input for interaction
      const input = document.createElement('input');
      input.type = 'range';
      input.min = '0';
      input.max = '100';
      input.step = '0.1'; // More precise values for smoother movement
      input.value = '50';
      input.className = 'comparison-range';
      
      // Add event listener for slider interaction with enhanced label visibility
      input.addEventListener('input', function() {
        const value = this.value + '%';
        const percent = parseFloat(this.value);
        
        // Update image clip path
        imgB.style.clipPath = `polygon(${value} 0, 100% 0, 100% 100%, ${value} 100%)`;
        handle.style.left = value;
        
        // Smart label visibility - fade out when approaching edges
        if (labelContainerA) {
          // Fade out label A when approaching the left edge of the image
          const distanceFromLeft = percent;
          const opacityA = distanceFromLeft < 15 ? (distanceFromLeft / 15) : 1;
          labelContainerA.style.opacity = opacityA;
        }
        
        if (labelContainerB) {
          // Fade out label B when approaching the right edge of the image
          const distanceFromRight = 100 - percent;
          const opacityB = distanceFromRight < 15 ? (distanceFromRight / 15) : 1;
          labelContainerB.style.opacity = opacityB;
        }
      });
      
      wrapper.appendChild(input);
      
      // Add wrapper to content container
      content.style.position = 'relative';
      content.appendChild(wrapper);
      
      // Mark this slide as having a comparison active
      activeComparisons.set(slide.index, {
        wrapper: wrapper,
        dispose: () => {
          if (wrapper && wrapper.parentNode) {
            wrapper.parentNode.removeChild(wrapper);
          }
          activeComparisons.delete(slide.index);
        }
      });
      
      // Preload the "B" image and fade it in when loaded
      imgB.onload = () => {
        setTimeout(() => {
          imgB.style.transition = 'opacity 0.3s ease';
          imgB.style.opacity = '1';
          
          // Trigger the input event to initialize label visibility
          input.dispatchEvent(new Event('input'));
        }, 100);
      };
      
      return true;
    }
  
    // Register the Fancybox plugin
    Fancybox.Plugins.Comparison = class {
      constructor(fancybox) {
        this.fancybox = fancybox;
        this.onReady = this.onReady.bind(this);
        this.onChange = this.onChange.bind(this);
        this.onClose = this.onClose.bind(this);
      }
  
      attach() {
        // Listen to Fancybox events
        this.fancybox.on('Carousel.ready', this.onReady);
        this.fancybox.on('Carousel.change', this.onChange);
        this.fancybox.on('done', this.onChange); // Handle direct loading of comparison slides
        this.fancybox.on('close', this.onClose);
      }
  
      detach() {
        // Remove all event listeners
        this.fancybox.off('Carousel.ready', this.onReady);
        this.fancybox.off('Carousel.change', this.onChange);
        this.fancybox.off('done', this.onChange);
        this.fancybox.off('close', this.onClose);
        
        // Clean up any active comparisons
        this.cleanupAll();
      }
  
      onReady() {
        // Initial setup for the first visible slide
        const slide = this.fancybox.getSlide();
        if (slide) {
          setupComparisonSlide(this.fancybox, slide);
        }
      }
  
      onChange() {
        // Set up the comparison for the current slide
        const slide = this.fancybox.getSlide();
        if (slide) {
          setupComparisonSlide(this.fancybox, slide);
        }
      }
  
      onClose() {
        // Clean up when fancybox closes
        this.cleanupAll();
      }
  
      cleanupAll() {
        // Clean up all active comparisons
        for (const [index, comparison] of activeComparisons.entries()) {
          if (comparison && typeof comparison.dispose === 'function') {
            comparison.dispose();
          }
        }
        
        // Clear the map
        activeComparisons.clear();
      }
    };
  
    // Register the plugin with Fancybox
    Fancybox.Plugins.Comparison.defaults = {};
  
    // Get original bind method
    const originalBind = Fancybox.bind;
    
    // Override the bind method to inject our plugin
    Fancybox.bind = function(selector, userOptions = {}) {
      // Create a new options object with our plugin enabled
      const options = {
        ...userOptions,
        Comparison: true
      };
      
      // Call the original bind method
      return originalBind.call(this, selector, options);
    };
    
    // If Fancybox is already initialized, add our plugin to all instances
    document.addEventListener('DOMContentLoaded', () => {
      const instances = Fancybox.getInstance();
      if (instances) {
        for (const instance of Array.isArray(instances) ? instances : [instances]) {
          if (!instance.plugins.Comparison) {
            instance.plugins.Comparison = new Fancybox.Plugins.Comparison(instance);
            instance.plugins.Comparison.attach();
          }
        }
      }
    });
  })();