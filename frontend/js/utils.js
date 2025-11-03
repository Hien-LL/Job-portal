// DOM helpers
showElement(id)
hideElement(id)
toggleElement(id)

// Modal helpers  
openModal(id)
closeModal(id)

// Form helpers
getElementValue(id)
setElementValue(id, value)
setTextContent(id, text)

// Notification helpers
showSuccessToast(message, duration)
showErrorToast(message, duration)
showSuccessNotificationBanner(message, duration)
showErrorNotification(message, duration)

// URL helpers
buildApiUrl(endpoint, params)
buildCompleteUrl(endpoint, params, queryParams)
parseLocalDatetimeToISO(localDatetimeStr)