/**
 * Universal Form Handler
 * A reusable JavaScript library for handling form submissions with Google Sheets integration
 * Can be used on any page with any form structure
 */

;(() => {
  // Configuration object - can be overridden
  const CONFIG = {
    formSelector: ".gform",
    loadingClass: "form-loading",
    errorClass: "form-error",
    successClass: "form-success",
    disabledClass: "form-disabled",
    requiredFields: ["email"], // Fields that must be validated
    emailRegex: /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i,
    phoneRegex: /^[+]?[1-9][\d\s\-$$$$]{7,15}$/,
    urlRegex: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
    messages: {
      success: "Form submitted successfully!",
      error: "Please correct the errors and try again.",
      networkError: "Network error. Please check your connection and try again.",
      processing: "Processing...",
      required: "This field is required.",
      invalidEmail: "Please enter a valid email address.",
      invalidPhone: "Please enter a valid phone number.",
      invalidUrl: "Please enter a valid URL.",
      minLength: "This field must be at least {min} characters long.",
      maxLength: "This field must be no more than {max} characters long.",
    },
  }

  // Utility Functions
  const Utils = {
    // Email validation
    isValidEmail(email) {
      return CONFIG.emailRegex.test(email)
    },

    // Phone validation
    isValidPhone(phone) {
      return CONFIG.phoneRegex.test(phone.replace(/\s/g, ""))
    },

    // URL validation
    isValidUrl(url) {
      return CONFIG.urlRegex.test(url)
    },

    // Get element by selector with fallback
    getElement(selector, context = document) {
      return context.querySelector(selector)
    },

    // Get all elements by selector
    getElements(selector, context = document) {
      return context.querySelectorAll(selector)
    },

    // Show/hide element
    toggleElement(element, show) {
      if (element) {
        element.style.display = show ? "block" : "none"
      }
    },

    // Add/remove class
    toggleClass(element, className, add) {
      if (element) {
        if (add) {
          element.classList.add(className)
        } else {
          element.classList.remove(className)
        }
      }
    },

    // Debounce function
    debounce(func, wait) {
      let timeout
      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout)
          func(...args)
        }
        clearTimeout(timeout)
        timeout = setTimeout(later, wait)
      }
    },

    // Format message with placeholders
    formatMessage(message, params = {}) {
      return message.replace(/\{(\w+)\}/g, (match, key) => params[key] || match)
    },
  }

  // Form Data Handler
  const FormData = {
    // Extract form data
    extract(form) {
      const elements = form.elements
      const data = {}
      const fields = []

      // Get all form fields
      for (let i = 0; i < elements.length; i++) {
        const element = elements[i]
        const name = element.name
        const type = element.type

        if (!name || name === "honeypot") continue

        fields.push(name)

        // Handle different input types
        switch (type) {
          case "checkbox":
            if (element.checked) {
              data[name] = data[name] ? data[name] + ", " + element.value : element.value
            }
            break
          case "radio":
            if (element.checked) {
              data[name] = element.value
            }
            break
          case "select-multiple":
            const selectedOptions = Array.from(element.selectedOptions).map((option) => option.value)
            data[name] = selectedOptions.join(", ")
            break
          default:
            data[name] = element.value
        }
      }

      // Add metadata
      data.formDataNameOrder = JSON.stringify([...new Set(fields)])
      data.formGoogleSheetName = form.dataset.sheet || "Sheet1"
      data.formGoogleSendEmail = form.dataset.email || ""
      data.timestamp = new Date().toISOString()
      data.userAgent = navigator.userAgent
      data.pageUrl = window.location.href

      return data
    },

    // Encode data for submission
    encode(data) {
      return Object.keys(data)
        .map((key) => encodeURIComponent(key) + "=" + encodeURIComponent(data[key] || ""))
        .join("&")
    },
  }

  // Validation Handler
  const Validator = {
    // Validate single field
    validateField(field) {
      const name = field.name
      const value = field.value.trim()
      const type = field.type
      const required = field.required || field.hasAttribute("required")
      const minLength = field.getAttribute("minlength")
      const maxLength = field.getAttribute("maxlength")
      const pattern = field.getAttribute("pattern")
      const errors = []

      // Required field validation
      if (required && !value) {
        errors.push(CONFIG.messages.required)
      }

      if (value) {
        // Type-specific validation
        switch (type) {
          case "email":
            if (!Utils.isValidEmail(value)) {
              errors.push(CONFIG.messages.invalidEmail)
            }
            break
          case "tel":
            if (!Utils.isValidPhone(value)) {
              errors.push(CONFIG.messages.invalidPhone)
            }
            break
          case "url":
            if (!Utils.isValidUrl(value)) {
              errors.push(CONFIG.messages.invalidUrl)
            }
            break
        }

        // Length validation
        if (minLength && value.length < Number.parseInt(minLength)) {
          errors.push(Utils.formatMessage(CONFIG.messages.minLength, { min: minLength }))
        }

        if (maxLength && value.length > Number.parseInt(maxLength)) {
          errors.push(Utils.formatMessage(CONFIG.messages.maxLength, { max: maxLength }))
        }

        // Pattern validation
        if (pattern && !new RegExp(pattern).test(value)) {
          const customMessage = field.getAttribute("data-error-message")
          errors.push(customMessage || "Invalid format")
        }
      }

      return errors
    },

    // Validate entire form
    validateForm(form) {
      const errors = {}
      const fields = form.querySelectorAll("input, textarea, select")

      fields.forEach((field) => {
        const fieldErrors = this.validateField(field)
        if (fieldErrors.length > 0) {
          errors[field.name] = fieldErrors
        }
      })

      return errors
    },

    // Show field error
    showFieldError(field, errors) {
      const container = field.closest(".input-group, .form-group, .field-group") || field.parentElement
      let errorElement = container.querySelector(".field-error")

      // Remove existing error styling
      Utils.toggleClass(field, "error", false)
      Utils.toggleClass(container, "has-error", false)

      if (errors.length > 0) {
        // Add error styling
        Utils.toggleClass(field, "error", true)
        Utils.toggleClass(container, "has-error", true)

        // Create or update error element
        if (!errorElement) {
          errorElement = document.createElement("div")
          errorElement.className = "field-error"
          container.appendChild(errorElement)
        }

        errorElement.innerHTML = errors.join("<br>")
        errorElement.style.display = "block"
      } else if (errorElement) {
        errorElement.style.display = "none"
      }
    },

    // Clear all errors
    clearErrors(form) {
      const errorElements = form.querySelectorAll(".field-error")
      const errorFields = form.querySelectorAll(".error")
      const errorContainers = form.querySelectorAll(".has-error")

      errorElements.forEach((el) => (el.style.display = "none"))
      errorFields.forEach((el) => Utils.toggleClass(el, "error", false))
      errorContainers.forEach((el) => Utils.toggleClass(el, "has-error", false))
    },
  }

  // UI Handler
  const UI = {
    // Show loading state
    showLoading(form) {
      const submitBtn = form.querySelector('[type="submit"]')
      const loadingOverlay = Utils.getElement(".loading-overlay, #loadingOverlay")
      const loadingText = form.dataset.loadingText || CONFIG.messages.processing

      // Disable form
      Utils.toggleClass(form, CONFIG.loadingClass, true)

      // Disable submit button
      if (submitBtn) {
        submitBtn.disabled = true
        submitBtn.dataset.originalText = submitBtn.textContent
        submitBtn.innerHTML = `<i class="fa fa-spinner fa-spin"></i> ${loadingText}`
      }

      // Show loading overlay if exists
      if (loadingOverlay) {
        loadingOverlay.style.display = "flex"
      }

      // Disable all form fields
      const fields = form.querySelectorAll("input, textarea, select, button")
      fields.forEach((field) => {
        field.disabled = true
        Utils.toggleClass(field, CONFIG.disabledClass, true)
      })
    },

    // Hide loading state
    hideLoading(form) {
      const submitBtn = form.querySelector('[type="submit"]')
      const loadingOverlay = Utils.getElement(".loading-overlay, #loadingOverlay")

      // Enable form
      Utils.toggleClass(form, CONFIG.loadingClass, false)

      // Enable submit button
      if (submitBtn) {
        submitBtn.disabled = false
        if (submitBtn.dataset.originalText) {
          submitBtn.textContent = submitBtn.dataset.originalText
        }
      }

      // Hide loading overlay
      if (loadingOverlay) {
        loadingOverlay.style.display = "none"
      }

      // Enable all form fields
      const fields = form.querySelectorAll("input, textarea, select, button")
      fields.forEach((field) => {
        field.disabled = false
        Utils.toggleClass(field, CONFIG.disabledClass, false)
      })
    },

    // Show success message
    showSuccess(form, message) {
      const successElement = Utils.getElement(".success-message, .thankyou_message, [data-success]", form.parentElement)
      const formElements = Utils.getElement(".form-elements, .form-fields, [data-form-content]", form)

      // Hide form content
      if (formElements) {
        formElements.style.display = "none"
      } else {
        form.style.display = "none"
      }

      // Show success message
      if (successElement) {
        if (message && successElement.querySelector("p, .message")) {
          const messageEl = successElement.querySelector("p, .message")
          messageEl.textContent = message
        }
        successElement.style.display = "block"
        successElement.scrollIntoView({ behavior: "smooth", block: "center" })
      } else {
        alert(message || CONFIG.messages.success)
      }

      Utils.toggleClass(form, CONFIG.successClass, true)
    },

    // Show error message
    showError(form, message) {
      const errorElement = Utils.getElement(".error-message, [data-error]", form.parentElement)

      if (errorElement) {
        errorElement.textContent = message
        errorElement.style.display = "block"
      } else {
        alert(message)
      }

      Utils.toggleClass(form, CONFIG.errorClass, true)
    },

    // Reset form display
    resetForm(form) {
      const formElements = Utils.getElement(".form-elements, .form-fields, [data-form-content]", form)
      const successElement = Utils.getElement(".success-message, .thankyou_message, [data-success]", form.parentElement)
      const errorElement = Utils.getElement(".error-message, [data-error]", form.parentElement)

      // Show form content
      if (formElements) {
        formElements.style.display = "block"
      } else {
        form.style.display = "block"
      }

      // Hide messages
      Utils.toggleElement(successElement, false)
      Utils.toggleElement(errorElement, false)

      // Clear form
      form.reset()
      Validator.clearErrors(form)

      // Remove state classes
      Utils.toggleClass(form, CONFIG.successClass, false)
      Utils.toggleClass(form, CONFIG.errorClass, false)
      Utils.toggleClass(form, CONFIG.loadingClass, false)
    },
  }

  // Submission Handler
  const Submission = {
    // Submit form data
    async submit(form, data) {
      return new Promise((resolve, reject) => {
        const url = form.action
        const xhr = new XMLHttpRequest()

        xhr.open("POST", url)
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded")

        xhr.onreadystatechange = () => {
          if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
              resolve(xhr.responseText)
            } else {
              reject(new Error(`HTTP ${xhr.status}: ${xhr.statusText}`))
            }
          }
        }

        xhr.onerror = () => {
          reject(new Error("Network error"))
        }

        xhr.ontimeout = () => {
          reject(new Error("Request timeout"))
        }

        // Set timeout (30 seconds)
        xhr.timeout = 30000

        // Send data
        xhr.send(FormData.encode(data))
      })
    },
  }

  // Analytics Handler
  const Analytics = {
    // Track form submission
    track(form, data) {
      const formName = form.dataset.formName || form.name || "Unknown Form"
      const gtag = window.gtag || (() => {})
      const ga = window.ga || (() => {})
      const fbq = window.fbq || (() => {})

      // Google Analytics 4
      gtag("event", "form_submit", {
        form_name: formName,
        form_id: form.id,
        page_url: window.location.href,
      })

      // Google Analytics Universal
      ga("send", "event", "Form", "Submit", formName)

      // Facebook Pixel
      fbq("track", "Lead", {
        content_name: formName,
      })

      // Custom tracking
      if (typeof window.customFormTracking === "function") {
        window.customFormTracking(form, data)
      }

      console.log("Form submission tracked:", formName)
    },
  }

  // Main Form Handler
  const FormHandler = {
    // Initialize form handler
    init() {
      const forms = Utils.getElements(CONFIG.formSelector)

      forms.forEach((form) => {
        this.setupForm(form)
      })

      console.log(`Universal Form Handler initialized for ${forms.length} form(s)`)
    },

    // Setup individual form
    setupForm(form) {
      // Add submit event listener
      form.addEventListener("submit", (e) => this.handleSubmit(e))

      // Add real-time validation
      this.setupRealTimeValidation(form)

      // Add reset functionality
      this.setupReset(form)
    },

    // Setup real-time validation
    setupRealTimeValidation(form) {
      const fields = form.querySelectorAll("input, textarea, select")

      fields.forEach((field) => {
        const validateField = Utils.debounce(() => {
          const errors = Validator.validateField(field)
          Validator.showFieldError(field, errors)
        }, 300)

        field.addEventListener("blur", validateField)

        if (field.type === "email" || field.type === "tel") {
          field.addEventListener("input", validateField)
        }
      })
    },

    // Setup reset functionality
    setupReset(form) {
      const resetButtons = Utils.getElements("[data-reset-form]", form.parentElement)

      resetButtons.forEach((button) => {
        button.addEventListener("click", () => {
          UI.resetForm(form)
        })
      })
    },

    // Handle form submission
    async handleSubmit(event) {
      event.preventDefault()

      const form = event.target
      const data = FormData.extract(form)

      // Clear previous errors
      Validator.clearErrors(form)

      // Validate form
      const errors = Validator.validateForm(form)

      if (Object.keys(errors).length > 0) {
        // Show validation errors
        Object.keys(errors).forEach((fieldName) => {
          const field = form.querySelector(`[name="${fieldName}"]`)
          if (field) {
            Validator.showFieldError(field, errors[fieldName])
          }
        })

        UI.showError(form, CONFIG.messages.error)
        return
      }

      // Show loading state
      UI.showLoading(form)

      try {
        // Submit form
        const response = await Submission.submit(form, data)

        // Handle success
        const successMessage = form.dataset.successMessage || CONFIG.messages.success
        UI.showSuccess(form, successMessage)

        // Track submission
        Analytics.track(form, data)

        // Custom success callback
        if (typeof window.onFormSuccess === "function") {
          window.onFormSuccess(form, data, response)
        }

        console.log("Form submitted successfully:", response)
      } catch (error) {
        // Handle error
        console.error("Form submission error:", error)

        const errorMessage = error.message.includes("Network")
          ? CONFIG.messages.networkError
          : form.dataset.errorMessage || CONFIG.messages.error

        UI.showError(form, errorMessage)

        // Custom error callback
        if (typeof window.onFormError === "function") {
          window.onFormError(form, data, error)
        }
      } finally {
        // Hide loading state
        UI.hideLoading(form)
      }
    },
  }

  // Global functions
  window.FormHandler = FormHandler
  window.resetForm = (formSelector) => {
    const form = Utils.getElement(formSelector || CONFIG.formSelector)
    if (form) {
      UI.resetForm(form)
    }
  }

  // Auto-initialize when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => FormHandler.init())
  } else {
    FormHandler.init()
  }
})()
