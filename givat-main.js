// Register GSAP plugins only if they're available
if (typeof gsap !== 'undefined' && typeof SplitText !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
gsap.registerPlugin(SplitText, ScrollTrigger);
} else {
console.error('GSAP plugins not loaded. Make sure GSAP, ScrollTrigger, and SplitText are loaded before app.js');
}
// ============================================================
// INITIAL SCROLL SETUP
// ============================================================

function initScrollRestoration() {
window.history.scrollRestoration = 'manual';
window.scrollTo(0, 0);
document.documentElement.scrollTop = 0;
document.body.scrollTop = 0;
}
// ============================================================
// SPLIT TEXT ANIMATIONS
// ============================================================

function initSplitTextAnimations() {
// Kill all existing ScrollTrigger instances first
if (gsap.ScrollTrigger) {
gsap.ScrollTrigger.getAll().forEach(trigger => trigger.kill());
}

// Force a full page reflow to ensure all heights are calculated
document.body.offsetHeight;

const elements = Array.from(document.querySelectorAll(
"h1, h2, h3, h4, h5, h6, p, .btn, .nav, .footer a, .name, .role, .link-box, .link, .header-left-menu .menu-title"
)).filter(el => !el.matches(".about-page section:nth-of-type(12) .center h1"));

elements.forEach((element) => {
// First hide the original element
gsap.set(element, { visibility: "hidden" });

const split = new SplitText(element, { type: "lines", linesClass: "line" });

split.lines.forEach((line) => {
	line.style.display = "inline-block";
	line.style.width = "100%";
	line.style.lineHeight = "unset";
	line.style.visibility = "hidden";
	line.style.opacity = "0";
});

// Force a reflow for this specific element
element.offsetHeight;
split.lines.forEach((line) => line.offsetHeight);

// Set initial state
gsap.set(split.lines, {
	visibility: "visible",
	yPercent: 100,
	clipPath: "inset(0% 0% 100% 0%)",
	opacity: 0,
});

// Create the animation
const tl = gsap.timeline({
	scrollTrigger: {
		trigger: element,
		start: "top 90%",
		end: "bottom top",
		once: true,
		onEnter: () => {
			// Force a reflow
			element.offsetHeight;
			// Show the original element
			gsap.set(element, { visibility: "visible" });
		},
		onRefresh: () => {
			// Recalculate heights when ScrollTrigger refreshes
			element.offsetHeight;
			split.lines.forEach((line) => line.offsetHeight);
		},
		onUpdate: (self) => {
			// Recalculate during scroll
			element.offsetHeight;
			split.lines.forEach((line) => line.offsetHeight);
		},
		onScrubComplete: () => {
			// Final recalculation after scroll
			element.offsetHeight;
			split.lines.forEach((line) => line.offsetHeight);
		}
	}
});

const isHeroHeading = element.closest(".hero") && /^H[1-6]$/.test(element.tagName);
const animationConfig = {
	yPercent: 0,
	clipPath: "inset(-20% -10% -30% 0%)",
	opacity: 1,
	stagger: 0.12,
	duration: 1.5,
	ease: "power4.out"
};

if (isHeroHeading) {
	animationConfig.delay = 0.7;
}

tl.to(split.lines, animationConfig);
});

// Force ScrollTrigger to recalculate all measurements
ScrollTrigger.refresh(true);
}

// ============================================================
// SPLIT TEXT EVENT LISTENERS SETUP
// ============================================================

function setupSplitTextEventListeners() {
// Add event listener for page transitions
document.addEventListener('DOMContentLoaded', () => {
// Initial load
initializeAfterTransition();

// Listen for page transitions
window.addEventListener('popstate', handlePopState);

// Listen for window resize to recalculate heights
window.addEventListener('resize', () => {
	ScrollTrigger.refresh(true);
});

// Add scroll event listener for continuous height updates
let scrollTimeout;
window.addEventListener('scroll', () => {
	// Clear the previous timeout
	clearTimeout(scrollTimeout);

	// Set a new timeout to refresh after scrolling stops
	scrollTimeout = setTimeout(() => {
		ScrollTrigger.refresh(true);
	}, 100);
}, { passive: true });
});
}

// ============================================================
// SCROLL DELAY - PREVENT SCROLLING FOR 2 SECONDS
// ============================================================

function initScrollDelay() {
let scrollDisabled = true;

// Prevent all scroll events for 2 seconds
const preventScroll = (e) => {
if (scrollDisabled) {
	e.preventDefault();
	e.stopPropagation();
	return false;
}
};

// Add scroll prevention to multiple event types
window.addEventListener('wheel', preventScroll, { passive: false });
window.addEventListener('touchmove', preventScroll, { passive: false });
window.addEventListener('keydown', (e) => {
if (scrollDisabled && (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'PageDown' || e.key === 'PageUp' || e.key === 'Home' || e.key === 'End' || e.key === ' ')) {
	e.preventDefault();
}
});

// Enable scrolling after 2 seconds
setTimeout(() => {
scrollDisabled = false;
window.removeEventListener('wheel', preventScroll);
window.removeEventListener('touchmove', preventScroll);
}, 2000);
}

// ============================================================
// MASTER INITIALIZATION - SINGLE ENTRY POINT
// ============================================================

function initializeApplication() {
// Disable scroll for 2 seconds to allow galleries and videos to load
initScrollDelay();
//initGsapAnimations();
setupSplitTextEventListeners();
//initScrollRestoration();
//initCustomSmoothScrolling();
initSplitTextAnimations();
initImageParallax();
//initSvgAnimations();
//initImageTrail();

}

// Wait for DOM and dependencies to be ready
if (document.readyState === 'loading') {
document.addEventListener('DOMContentLoaded', () => {
// Also wait for GSAP to be available
if (typeof gsap !== 'undefined') {
	initializeApplication();
} else {
	// Wait a bit for GSAP to load
	setTimeout(() => {
		if (typeof gsap !== 'undefined') {
			initializeApplication();
		} else {
			console.error('GSAP not loaded. Cannot initialize application.');
		}
	}, 100);
}
});
} else {
// DOM already loaded
if (typeof gsap !== 'undefined') {
initializeApplication();
} else {
// Wait for GSAP
setTimeout(() => {
	if (typeof gsap !== 'undefined') {
		initializeApplication();
	} else {
		console.error('GSAP not loaded. Cannot initialize application.');
	}
}, 100);
}
}

function initCustomSmoothScrolling() {
const lerp = (start, end, t) => start * (1 - t) + end * t;
const clamp = (value, min, max) => Math.max(min, Math.min(value, max));
let isSliderDragging = false;

class CustomSmoothScroll {
constructor() {
	const isMobile = window.innerWidth < 750;

	// Core settings
	this.wrapper = window;
	this.content = document.documentElement;
	this.lerp = isMobile ? 0.1 : 0.06; // Faster lerp for mobile
	this.duration = isMobile ? 1.5 : 1.2; // Shorter duration for mobile
	this.easing = (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)); // Lenis easing function
	this.wheelMultiplier = 0.8; // Reduced wheel multiplier for gentler scrolling
	this.touchMultiplier = isMobile ? 3 : 1.5; // Reduced touch multiplier
	this.dragMultiplier = isMobile ? 3 : 1.8; // Reduced drag multiplier

	// Internal values
	this.targetScroll = 0;
	this.currentScroll = 0;
	this.scrollEnabled = false;
	this.isDragging = false; // Always false for mouse drag disabled
	this.startX = 0;
	this.startY = 0;
	this.lastFrameTime = performance.now();
	this.velocity = 0;
	this.direction = 0;
	this.currentTime = 0;
	this.isRunning = false;
	this.isRightClick = false;

	// Initialize
	this.init();
}

init() {
	this.applyStyles();
	this.updateDimensions();
	this.bindEvents();

	// Enable scrolling after a small delay
	setTimeout(() => {
		this.scrollEnabled = true;
		this.forceScrollUpdate();
		this.smoothScrollLoop();
	}, 10);
}

applyStyles() {
	document.body.style.overflow = "hidden";
	document.documentElement.style.scrollBehavior = "auto";
	document.documentElement.style.touchAction = "manipulation";
}

updateDimensions() {
	const wrapper = this.wrapper === window ? document.documentElement : this.wrapper;
	const content = this.content;

	this.dimensions = {
		width: wrapper.clientWidth,
		height: wrapper.clientHeight,
		scrollWidth: content.scrollWidth,
		scrollHeight: content.scrollHeight
	};

	// Update body height
	const scrollableContent = document.querySelector(".wrapper");
	if (scrollableContent) {
		document.body.style.height = `${scrollableContent.clientHeight}px`;
	}
}

bindEvents() {
	// Mouse Wheel Scroll
	window.addEventListener("wheel", (e) => {
		if (!this.scrollEnabled || isSliderDragging) return;
		const delta = e.deltaY * this.wheelMultiplier;
		this.onScroll(delta);
		e.preventDefault();
	}, { passive: false });

	// Touch Dragging
	window.addEventListener("touchstart", (e) => this.startTouchDrag(e), { passive: true });
	window.addEventListener("touchmove", (e) => this.onTouchDrag(e), { passive: false });
	window.addEventListener("touchend", () => this.endTouchDrag());

	// Completely disable mouse dragging by preventing any mouse events from affecting scroll
	window.addEventListener("mousedown", (e) => {
		if (e.target.closest('input, textarea, select, button, [contenteditable], .w-input, .w-select, .w-checkbox-input, .w-radio-input')) {
			return;
		}
		e.preventDefault();
		return false;
	}, { passive: false });

	window.addEventListener("mousemove", (e) => {
		if (e.target.closest('input, textarea, select, button, [contenteditable], .w-input, .w-select, .w-checkbox-input, .w-radio-input')) {
			return;
		}
		// Prevent any mouse movement from affecting scroll
		return false;
	}, { passive: false });

	// Mouse Dragging - DISABLED
	// window.addEventListener("mousedown", (e) => {
	//     // Track right click state
	//     if (e.button === 2) {
	//         this.isRightClick = true;
	//         return;
	//     }
	//     // Only start drag if not right click
	//     if (!this.isRightClick) {
	//         this.startMouseDrag(e);
	//     }
	// });
	// window.addEventListener("mousemove", (e) => this.onMouseDrag(e));
	// window.addEventListener("mouseup", () => {
	//     this.endMouseDrag();
	//     // Reset right click state after a short delay
	//     setTimeout(() => {
	//         this.isRightClick = false;
	//     }, 100);
	// });

	// Resize Event
	window.addEventListener("resize", () => {
		requestAnimationFrame(() => this.updateDimensions());
	});

	// Slider detection
	if (window.innerWidth < 767) {
		document.querySelectorAll(".slider").forEach((slider) => {
			slider.addEventListener("touchstart", (e) => this.startSliderDrag(e), { passive: true });
			slider.addEventListener("touchmove", (e) => this.detectSliderDrag(e), { passive: false });
			slider.addEventListener("touchend", () => this.endSliderDrag());
			slider.addEventListener("touchcancel", () => this.endSliderDrag());
		});
	}
}

onScroll(delta) {
	if (!this.scrollEnabled || isSliderDragging) return;

	// Reset animation time when new scroll starts
	this.currentTime = 0;

	// Calculate velocity and direction
	this.velocity = delta;
	this.direction = Math.sign(delta);

	// Get the actual scroll limit
	const scrollLimit = document.documentElement.scrollHeight - window.innerHeight;

	// Update target scroll with proper limit
	this.targetScroll = clamp(
		this.targetScroll + delta,
		0,
		scrollLimit
	);
}

startTouchDrag(e) {
	if (!this.scrollEnabled || isSliderDragging) return;
	// Only allow touch drag, not mouse drag
	this.isDragging = true;
	this.startY = e.touches[0].clientY;
}

onTouchDrag(e) {
	if (!this.isDragging || !this.scrollEnabled) return;

	const currentY = e.touches[0].clientY;
	const delta = (this.startY - currentY) * this.touchMultiplier;

	const atTop = Math.round(this.currentScroll) <= 0;
	const pullingDown = delta < 0;

	if (atTop && pullingDown) return;

	this.onScroll(delta);
	this.startY = currentY;
	e.preventDefault();
}

endTouchDrag() {
	this.isDragging = false;
}

startMouseDrag(e) {
	// Mouse drag disabled - do nothing
	return;
}

onMouseDrag(e) {
	// Mouse drag disabled - do nothing
	return;
}

endMouseDrag() {
	// Mouse drag disabled - do nothing
	return;
}

startSliderDrag(e) {
	this.startX = e.touches[0].clientX;
	this.startY = e.touches[0].clientY;
	isSliderDragging = false;
}

detectSliderDrag(e) {
	const deltaX = Math.abs(e.touches[0].clientX - this.startX);
	const deltaY = Math.abs(e.touches[0].clientY - this.startY);

	if (deltaX > deltaY && deltaX > 10) {
		isSliderDragging = true;
		e.preventDefault();
	}
}

endSliderDrag() {
	isSliderDragging = false;
}

forceScrollUpdate() {
	// Get current scroll position instead of resetting to 0
	const currentScrollY = window.scrollY || window.pageYOffset || 0;
	this.targetScroll = currentScrollY;
	this.currentScroll = currentScrollY;
}

smoothScrollLoop() {
	const now = performance.now();
	const deltaTime = Math.min((now - this.lastFrameTime) / 1000, 0.1);
	this.lastFrameTime = now;

	if (this.scrollEnabled) {
		// Calculate progress
		const progress = clamp(this.currentTime / this.duration, 0, 1);
		const completed = progress >= 1;

		// Calculate easing
		const easing = completed ? 1 : this.easing(progress);

		// Apply smooth scrolling with Lenis-style easing
		this.currentScroll = lerp(this.currentScroll, this.targetScroll, this.lerp);

		// Update time
		if (!completed) {
			this.currentTime += deltaTime;
		}

		// Apply scroll
		window.scrollTo(0, this.currentScroll);

		// Reset if completed
		if (completed) {
			this.currentTime = 0;
		}
	}

	requestAnimationFrame(() => this.smoothScrollLoop());
}

setEnableScroll(value) {
	this.scrollEnabled = value;
}

restart() {
	// Preserve current scroll position
	const currentScrollY = window.scrollY || window.pageYOffset;
	this.targetScroll = currentScrollY;
	this.currentScroll = currentScrollY;
	this.velocity = 0;
}

destroy() {
	this.scrollEnabled = false;
	document.body.style.overflow = "";
	document.body.style.height = "";
	document.documentElement.style.scrollBehavior = "";
	document.documentElement.style.touchAction = "";
	window.removeEventListener("wheel", this.onScroll);
	window.removeEventListener("touchstart", this.startTouchDrag);
	window.removeEventListener("touchmove", this.onTouchDrag);
	window.removeEventListener("touchend", this.endTouchDrag);
	window.removeEventListener("mousedown", this.startMouseDrag);
	window.removeEventListener("mousemove", this.onMouseDrag);
	window.removeEventListener("mouseup", this.endMouseDrag);
	window.removeEventListener("resize", this.updateDimensions);
}
}

// Store instance globally so it can be restarted without resetting scroll
if (window.customSmoothScroll && window.customSmoothScroll.destroy) {
window.customSmoothScroll.destroy();
}
window.customSmoothScroll = new CustomSmoothScroll();
}

// custom animations
document.addEventListener("DOMContentLoaded", function() {
gsap.registerPlugin(ScrollTrigger);
const projectBoxes = document.querySelectorAll('.animate-image-box');

projectBoxes.forEach((box) => {
const img = box.querySelector('.animate-image-box img');

gsap.from(img, {
	scale: 1.1,
	ease: "power1.out",
	scrollTrigger: {
		trigger: box,
		start: "top 100%",
		end: "bottom 0%",
		scrub: 1
	}
});
});

const projectBoxImages = document.querySelectorAll('.animate-image-box img');

projectBoxImages.forEach((element, index) => {
const tl = gsap.timeline({ paused: true })
.from(element, {
	clipPath: 'inset(0 0 0 100%)',
	ease: "power4.inOut",
	duration: 1.6
});

ScrollTrigger.create({
	trigger: element.closest('.animate-image-box'),
	start: "top 100%",
	end: "bottom 0%",
	onEnter: () => {
		tl.play();
	},
});
});


gsap.fromTo(".givat-herobanner-video",
					{
clipPath: "inset(0 50% 0 50%)"
},
					{
clipPath: "inset(0 0% 0 0%)",
duration: 1.75,
ease: "power4.out"
}
);
});


 document.addEventListener("DOMContentLoaded", function () {

    const countries = [
      "Afghanistan","Albania","Algeria","Andorra","Angola","Antigua and Barbuda","Argentina","Armenia","Australia","Austria",
      "Azerbaijan","Bahamas","Bahrain","Bangladesh","Barbados","Belarus","Belgium","Belize","Benin","Bhutan",
      "Bolivia","Bosnia and Herzegovina","Botswana","Brazil","Brunei","Bulgaria","Burkina Faso","Burundi","Cabo Verde","Cambodia",
      "Cameroon","Canada","Central African Republic","Chad","Chile","China","Colombia","Comoros","Congo (Congo-Brazzaville)","Costa Rica",
      "Côte d'Ivoire","Croatia","Cuba","Cyprus","Czechia (Czech Republic)","Democratic Republic of the Congo","Denmark","Djibouti","Dominica","Dominican Republic",
      "Ecuador","Egypt","El Salvador","Equatorial Guinea","Eritrea","Estonia","Eswatini (fmr. Swaziland)","Ethiopia","Fiji","Finland",
      "France","Gabon","Gambia","Georgia","Germany","Ghana","Greece","Grenada","Guatemala","Guinea",
      "Guinea-Bissau","Guyana","Haiti","Holy See","Honduras","Hungary","Iceland","India","Indonesia","Iran",
      "Iraq","Ireland","Israel","Italy","Jamaica","Japan","Jordan","Kazakhstan","Kenya","Kiribati",
      "Kuwait","Kyrgyzstan","Laos","Latvia","Lebanon","Lesotho","Liberia","Libya","Liechtenstein","Lithuania",
      "Luxembourg","Madagascar","Malawi","Malaysia","Maldives","Mali","Malta","Marshall Islands","Mauritania","Mauritius",
      "Mexico","Micronesia","Moldova","Monaco","Mongolia","Montenegro","Morocco","Mozambique","Myanmar (formerly Burma)","Namibia",
      "Nauru","Nepal","Netherlands","New Zealand","Nicaragua","Niger","Nigeria","North Korea","North Macedonia","Norway",
      "Oman","Pakistan","Palau","Palestine State","Panama","Papua New Guinea","Paraguay","Peru","Philippines","Poland",
      "Portugal","Qatar","Romania","Russia","Rwanda","Saint Kitts and Nevis","Saint Lucia","Saint Vincent and the Grenadines","Samoa","San Marino",
      "Sao Tome and Principe","Saudi Arabia","Senegal","Serbia","Seychelles","Sierra Leone","Singapore","Slovakia","Slovenia","Solomon Islands",
      "Somalia","South Africa","South Korea","South Sudan","Spain","Sri Lanka","Sudan","Suriname","Sweden","Switzerland",
      "Syria","Tajikistan","Tanzania","Thailand","Timor-Leste","Togo","Tonga","Trinidad and Tobago","Tunisia","Turkey",
      "Turkmenistan","Tuvalu","Uganda","Ukraine","United Arab Emirates","United Kingdom","United States of America","Uruguay","Uzbekistan","Vanuatu",
      "Venezuela","Vietnam","Yemen","Zambia","Zimbabwe",
      "Åland Islands","Bermuda","Bouvet Island","British Indian Ocean Territory","Cayman Islands","Christmas Island","Cocos (Keeling) Islands","Cook Islands","Falkland Islands","Faroe Islands",
      "French Guiana","French Polynesia","French Southern Territories","Greenland","Guadeloupe","Guam","Guernsey","Hong Kong","Isle of Man","Jersey",
      "Macau","Martinique","Mayotte","Montserrat","New Caledonia","Niue","Norfolk Island","Northern Mariana Islands","Pitcairn Islands","Puerto Rico",
      "Réunion","Saba","Saint Barthélemy","Saint Helena, Ascension and Tristan da Cunha","Saint Martin (French part)","Saint Pierre and Miquelon","Sark","Sint Eustatius","Sint Maarten (Dutch part)","South Georgia and the South Sandwich Islands",
      "Svalbard and Jan Mayen","Tokelau","Turks and Caicos Islands","United States Minor Outlying Islands","Virgin Islands (British)","Virgin Islands (U.S.)"
    ];

    const select = document.getElementById("givat-form-select-countries");
    if (!select) return;

    countries.forEach(country => {
      const option = document.createElement("option");
      option.value = country;
      option.textContent = country;
      select.appendChild(option);
    });

    new Choices(select, {
      searchEnabled: true,
      shouldSort: false,
      placeholder: true,
      placeholderValue: "Country",
    });
  });
  
  gsap.registerPlugin(ScrollTrigger);
  document.querySelectorAll(".animate-inner-imgs-icon img").forEach((img, i) => {
    gsap.fromTo(img,
                {
      clipPath: 'circle(0% at 50% 50%)',
    },
                {
      clipPath: 'circle(70.7% at 50% 50%)',
      ease: "power1.out",
      stagger: 0.2,
      duration: 2,
      scrollTrigger: {
        trigger: img,
        start: "top 100%",
        end: "bottom 100%",
        scrub: 5
      }
    }
               );
  });
  gsap.fromTo(".animate-header-imgs-icon img",
              {
    clipPath: 'circle(0% at 50% 50%)',
  },
              {
    clipPath: 'circle(70.7% at 50% 50%)',
    ease: "power1.out",
    stagger: 0.2,
    duration: 2,
  }
             );
             
// Footer scroling effect
// ============================================================
// IMAGE PARALLAX
// ============================================================

  function initImageParallax() {
    /*if (window.innerWidth > 650) {
      const footer = document.querySelector(".footer");
      if (!footer) return;

      const footerHeight = footer.offsetHeight;

      gsap.fromTo(footer,
                  { yPercent: -30 },
                  {
        yPercent: 0,
        ease: "none",
        scrollTrigger: {
          trigger: footer,
          start: "top 102%",
          end: `+=${footerHeight}`,
          scrub: true,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            if (self.progress === 1 || self.progress === 0) {
              gsap.set(footer, { clearProps: "transform" });
            }
          }
        }
      }
                 );
    }*/
  }
  
  
 	// Card Carousel
  document.addEventListener("DOMContentLoaded", function() {
	document.querySelectorAll(".givat-card-carousel-wrapper").forEach(function (carousel) {
		new Flickity(carousel, {
		  cellAlign: 'left',
		  contain: true,
		  autoPlay:5000,
		  pauseAutoPlayOnHover: false,
		  contain: true,
		  dragThreshold: 5,
		  draggable: true,      // allow drag/swipe
		  wrapAround: true,     // infinite loop
		  pageDots: false,      // remove bullets
		  prevNextButtons: false, // remove arrows
		});
	});
  });
