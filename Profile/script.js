// Mobile Navigation Toggle
const hamburger = document.getElementById("hamburger")
const navMenu = document.getElementById("nav-menu")

hamburger.addEventListener("click", () => {
  hamburger.classList.toggle("active")
  navMenu.classList.toggle("active")

  // Prevent body scroll when menu is open
  if (navMenu.classList.contains("active")) {
    document.body.style.overflow = "hidden"
  } else {
    document.body.style.overflow = "auto"
  }
})

// Close mobile menu when clicking on a link
document.querySelectorAll(".nav-link").forEach((link) => {
  link.addEventListener("click", () => {
    hamburger.classList.remove("active")
    navMenu.classList.remove("active")
    document.body.style.overflow = "auto"
  })
})

// Close mobile menu when clicking outside
document.addEventListener("click", (e) => {
  if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
    hamburger.classList.remove("active")
    navMenu.classList.remove("active")
    document.body.style.overflow = "auto"
  }
})

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault()
    const target = document.querySelector(this.getAttribute("href"))
    if (target) {
      const offsetTop = target.offsetTop - 70 // Account for fixed navbar
      window.scrollTo({
        top: offsetTop,
        behavior: "smooth",
      })
    }
  })
})

// Navbar background change on scroll
window.addEventListener("scroll", () => {
  const navbar = document.querySelector(".navbar")
  if (window.scrollY > 100) {
    navbar.style.background = "rgba(255, 255, 255, 0.98)"
    navbar.style.boxShadow = "0 2px 20px rgba(0, 0, 0, 0.1)"
  } else {
    navbar.style.background = "rgba(255, 255, 255, 0.95)"
    navbar.style.boxShadow = "none"
  }
})

// Intersection Observer for fade-in animations
const observerOptions = {
  threshold: 0.1,
  rootMargin: "0px 0px -50px 0px",
}

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible")
    }
  })
}, observerOptions)

// Add fade-in class to elements and observe them
document.addEventListener("DOMContentLoaded", () => {
  const elementsToAnimate = document.querySelectorAll(".project-card, .detail-item, .skill-category")
  elementsToAnimate.forEach((el) => {
    el.classList.add("fade-in")
    observer.observe(el)
  })
})

// Contact form handling
const contactForm = document.getElementById("contact-form")
if (contactForm) {
  contactForm.addEventListener("submit", (e) => {
    e.preventDefault()

    // Get form data
    const formData = new FormData(contactForm)
    const name = formData.get("name")
    const email = formData.get("email")
    const subject = formData.get("subject")
    const message = formData.get("message")

    // Simple validation
    if (!name || !email || !subject || !message) {
      alert("Please fill in all fields.")
      return
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      alert("Please enter a valid email address.")
      return
    }

    // Simulate form submission
    const submitBtn = contactForm.querySelector('button[type="submit"]')
    const originalText = submitBtn.textContent
    submitBtn.textContent = "Sending..."
    submitBtn.disabled = true

    // Simulate API call
    setTimeout(() => {
      alert("Thank you for your message! I'll get back to you soon.")
      contactForm.reset()
      submitBtn.textContent = originalText
      submitBtn.disabled = false
    }, 2000)
  })
}

// Add typing effect to hero title (only on desktop for performance)
function typeWriter(element, text, speed = 100) {
  if (window.innerWidth < 768) return // Skip on mobile

  let i = 0
  const originalText = element.innerHTML
  element.innerHTML = ""

  function type() {
    if (i < text.length) {
      if (text.charAt(i) === "<") {
        // Handle HTML tags
        const tagEnd = text.indexOf(">", i)
        element.innerHTML += text.substring(i, tagEnd + 1)
        i = tagEnd + 1
      } else {
        element.innerHTML += text.charAt(i)
        i++
      }
      setTimeout(type, speed)
    }
  }

  type()
}

// Initialize typing effect when page loads (desktop only)
window.addEventListener("load", () => {
  if (window.innerWidth >= 768) {
    const heroTitle = document.querySelector(".hero-title")
    if (heroTitle) {
      const originalText = heroTitle.innerHTML
      typeWriter(heroTitle, originalText, 50)
    }
  }
})

// Add parallax effect to hero section (desktop only)
let ticking = false

function updateParallax() {
  const scrolled = window.pageYOffset
  const hero = document.querySelector(".hero")
  const heroContent = document.querySelector(".hero-content")

  if (hero && heroContent && window.innerWidth >= 768) {
    heroContent.style.transform = `translateY(${scrolled * 0.3}px)`
  }

  ticking = false
}

window.addEventListener("scroll", () => {
  if (!ticking && window.innerWidth >= 768) {
    requestAnimationFrame(updateParallax)
    ticking = true
  }
})

// Add hover effects to project cards (desktop only)
if (window.innerWidth >= 768) {
  document.querySelectorAll(".project-card").forEach((card) => {
    card.addEventListener("mouseenter", () => {
      card.style.transform = "translateY(-10px) scale(1.02)"
    })

    card.addEventListener("mouseleave", () => {
      card.style.transform = "translateY(0) scale(1)"
    })
  })
}

// Add click effect to buttons
document.querySelectorAll(".btn").forEach((btn) => {
  btn.addEventListener("click", function (e) {
    // Create ripple effect
    const ripple = document.createElement("span")
    ripple.classList.add("ripple")
    this.appendChild(ripple)

    const x = e.clientX - e.target.offsetLeft
    const y = e.clientY - e.target.offsetTop

    ripple.style.left = `${x}px`
    ripple.style.top = `${y}px`

    setTimeout(() => {
      ripple.remove()
    }, 600)
  })
})

// Add CSS for ripple effect
const style = document.createElement("style")
style.textContent = `
    .btn {
        position: relative;
        overflow: hidden;
    }
    
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.6);
        transform: scale(0);
        animation: ripple-animation 0.6s linear;
        pointer-events: none;
        width: 20px;
        height: 20px;
        margin-left: -10px;
        margin-top: -10px;
    }
    
    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`
document.head.appendChild(style)

// Add active navigation highlighting
window.addEventListener("scroll", () => {
  const sections = document.querySelectorAll("section[id]")
  const navLinks = document.querySelectorAll(".nav-link")

  let current = ""
  sections.forEach((section) => {
    const sectionTop = section.offsetTop - 100
    const sectionHeight = section.clientHeight
    if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
      current = section.getAttribute("id")
    }
  })

  navLinks.forEach((link) => {
    link.classList.remove("active")
    if (link.getAttribute("href") === `#${current}`) {
      link.classList.add("active")
    }
  })
})

// Handle orientation change on mobile
window.addEventListener("orientationchange", () => {
  setTimeout(() => {
    // Close mobile menu on orientation change
    hamburger.classList.remove("active")
    navMenu.classList.remove("active")
    document.body.style.overflow = "auto"

    // Recalculate viewport height
    const vh = window.innerHeight * 0.01
    document.documentElement.style.setProperty("--vh", `${vh}px`)
  }, 100)
})

// Set initial viewport height for mobile
const vh = window.innerHeight * 0.01
document.documentElement.style.setProperty("--vh", `${vh}px`)

// Handle resize events
let resizeTimer
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer)
  resizeTimer = setTimeout(() => {
    const vh = window.innerHeight * 0.01
    document.documentElement.style.setProperty("--vh", `${vh}px`)

    // Close mobile menu on resize
    if (window.innerWidth >= 768) {
      hamburger.classList.remove("active")
      navMenu.classList.remove("active")
      document.body.style.overflow = "auto"
    }
  }, 250)
})

// Improve touch interactions on mobile
if ("ontouchstart" in window) {
  document.querySelectorAll(".btn, .project-card, .detail-item, .skill-category").forEach((element) => {
    element.addEventListener("touchstart", function () {
      this.style.transform = "scale(0.98)"
    })

    element.addEventListener("touchend", function () {
      setTimeout(() => {
        this.style.transform = "scale(1)"
      }, 150)
    })
  })
}

// Prevent zoom on double tap for iOS
let lastTouchEnd = 0
document.addEventListener(
  "touchend",
  (event) => {
    const now = new Date().getTime()
    if (now - lastTouchEnd <= 300) {
      event.preventDefault()
    }
    lastTouchEnd = now
  },
  false,
)

// Add loading animation
window.addEventListener("load", () => {
  document.body.classList.add("loaded")
})

// Add CSS for loading state
const loadingStyle = document.createElement("style")
loadingStyle.textContent = `
    body {
        opacity: 0;
        transition: opacity 0.3s ease;
    }
    
    body.loaded {
        opacity: 1;
    }
`
document.head.appendChild(loadingStyle)
