// LGFX Image Comparison slider extension for Fancybox 
// specifications by Daniel Nagy
// code bulk by Cl.ai
// draft 29-03-2025

(function() {
    // Custom image comparison for Fancybox
    Fancybox.bind('[data-comparison-image]', {
      on: {
        done: (fancybox, slide) => {
          // Only process slides with comparison images
          if (!slide.triggerEl || !slide.triggerEl.dataset.comparisonImage) return;
          
          // Get the comparison image URL
          const comparisonUrl = slide.triggerEl.dataset.comparisonImage;
          
          // Get custom labels (with empty string fallbacks)
          const labelA = slide.triggerEl.dataset.labelA || '';
          const labelB = slide.triggerEl.dataset.labelB || '';
          
          // Find the content container and image
          const content = slide.el.querySelector('.fancybox__content');
          const mainImg = slide.el.querySelector('.fancybox-image');
          
          if (!content || !mainImg) return;
          
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
          
          // Create the slider handle
          const handle = document.createElement('div');
          handle.className = 'comparison-handle';
          

          // Create line using a div instead of an image
          const line = document.createElement('div');
          line.className = 'comparison-handle-line';
          
          // Create circle handle using an image
          const circle = document.createElement('img');
          circle.className = 'comparison-handle-circle';
          circle.src = '/graphics/compare-slider.svg';
          circle.alt = '';
          
          // Append elements to handle
          handle.appendChild(line);
          handle.appendChild(circle);
          
          // Only create labels section if at least one label is provided
          if (labelA || labelB) {
            const labelsContainer = document.createElement('div');
            labelsContainer.className = 'comparison-labels-container';
            
            // Create label container A (left side - right-aligned)
            const labelContainerA = document.createElement('div');
            labelContainerA.className = 'comparison-label-container-A';
            
            // Create label container B (right side - left-aligned)
            const labelContainerB = document.createElement('div');
            labelContainerB.className = 'comparison-label-container-B';
            
            if (labelA) {
              const aLabel = document.createElement('div');
              aLabel.className = 'comparison-label comparison-label-A';
              aLabel.textContent = labelA;
              labelContainerA.appendChild(aLabel);
            }
            
            if (labelB) {
              const bLabel = document.createElement('div');
              bLabel.className = 'comparison-label comparison-label-B';
              bLabel.textContent = labelB;
              labelContainerB.appendChild(bLabel);
            }
            
            labelsContainer.appendChild(labelContainerA);
            labelsContainer.appendChild(labelContainerB);
            handle.appendChild(labelsContainer);
          }
          
          wrapper.appendChild(imgB);
          wrapper.appendChild(handle);
          
          // Add invisible slider input for interaction
          const input = document.createElement('input');
          input.type = 'range';
          input.min = '0';
          input.max = '100';
          input.step = '0.1'; // More precise values for smoother movement
          input.value = '50';
          input.className = 'comparison-range';

          
          // Add event listener for slider interaction
          input.addEventListener('input', function() {
            const value = this.value + '%';
            imgB.style.clipPath = `polygon(${value} 0, 100% 0, 100% 100%, ${value} 100%)`;
            handle.style.left = value;
          });
          
          wrapper.appendChild(input);
          
          // Add wrapper to content container
          content.style.position = 'relative';
          content.appendChild(wrapper);
          
          // Preload the "B" image and fade it in when loaded
          imgB.onload = () => {
            setTimeout(() => {
              imgB.style.transition = 'opacity 0.3s ease';
              imgB.style.opacity = '1';
            }, 100);
          };
        }
      }
    });
  })();