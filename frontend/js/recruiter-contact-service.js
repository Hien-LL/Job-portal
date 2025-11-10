/**
 * Recruiter Contact Service
 * Handles contact form submission and communication with support team
 */

/**
 * Send contact form to support team
 * @param {Object} formData - Contact form data
 * @returns {Promise} Response from API
 * 
 * API Endpoint: POST /recruiters/contact/send
 * 
 * Request Body:
 * {
 *   "name": "string",
 *   "email": "string",
 *   "phone": "string" (optional),
 *   "company": "string" (optional),
 *   "subject": "enum: sales|technical|account|billing|feedback|other",
 *   "message": "string"
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "message": "Tin nhắn đã được gửi thành công",
 *   "ticketId": "string",
 *   "estimatedResponseTime": "24h"
 * }
 */
async function sendContactMessage(formData) {
    try {
        const url = buildApiUrl('/recruiters/contact/send');
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getStoredToken()}`
            },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Error sending contact message:', error);
        throw error;
    }
}

/**
 * Get contact information
 * @returns {Promise} Contact info data
 * 
 * API Endpoint: GET /recruiters/contact/info
 * 
 * Response:
 * {
 *   "phone": "0123 456 789",
 *   "email": "recruiter@jobportal.vn",
 *   "address": "123 Đường Nguyễn Hữu Cảnh, Quận 1, TP. Hồ Chí Minh",
 *   "businessHours": {
 *     "monday_friday": "8:30 - 17:30",
 *     "saturday": "9:00 - 12:00",
 *     "sunday": "Closed"
 *   },
 *   "departments": [
 *     {
 *       "name": "Bán hàng & Tư vấn",
 *       "email": "sales@jobportal.vn",
 *       "phone": "0123 456 789"
 *     },
 *     {
 *       "name": "Hỗ trợ kỹ thuật",
 *       "email": "tech@jobportal.vn",
 *       "phone": "0123 456 789"
 *     },
 *     {
 *       "name": "Quản lý tài khoản",
 *       "email": "account@jobportal.vn",
 *       "phone": "0123 456 789"
 *     }
 *   ]
 * }
 */
async function getContactInfo() {
    try {
        const url = buildApiUrl('/recruiters/contact/info');
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getStoredToken()}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Error fetching contact info:', error);
        throw error;
    }
}

/**
 * Get support tickets submitted by current recruiter
 * @param {Object} options - Query options
 * @param {number} options.limit - Number of tickets to return (default: 10)
 * @param {number} options.page - Page number (default: 1)
 * @returns {Promise} Support tickets list
 * 
 * API Endpoint: GET /recruiters/contact/tickets?limit=10&page=1
 * 
 * Response:
 * {
 *   "data": [
 *     {
 *       "id": "string",
 *       "subject": "string",
 *       "status": "open|in_progress|resolved|closed",
 *       "createdDate": "2025-01-10T12:30:00Z",
 *       "lastUpdatedDate": "2025-01-10T14:30:00Z",
 *       "priority": "low|medium|high",
 *       "description": "string"
 *     }
 *   ],
 *   "pagination": {
 *     "total": number,
 *     "page": number,
 *     "limit": number,
 *     "totalPages": number
 *   }
 * }
 */
async function getSupportTickets(options = {}) {
    try {
        const limit = options.limit || 10;
        const page = options.page || 1;
        const url = buildApiUrl(`/recruiters/contact/tickets?limit=${limit}&page=${page}`);
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getStoredToken()}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Error fetching support tickets:', error);
        throw error;
    }
}

/**
 * Get details of a specific support ticket
 * @param {string} ticketId - Support ticket ID
 * @returns {Promise} Ticket details with conversation history
 * 
 * API Endpoint: GET /recruiters/contact/tickets/{ticketId}
 * 
 * Response:
 * {
 *   "id": "string",
 *   "subject": "string",
 *   "status": "open|in_progress|resolved|closed",
 *   "priority": "low|medium|high",
 *   "createdDate": "2025-01-10T12:30:00Z",
 *   "lastUpdatedDate": "2025-01-10T14:30:00Z",
 *   "description": "string",
 *   "assignedTo": {
 *     "id": "string",
 *     "name": "string",
 *     "email": "string"
 *   },
 *   "messages": [
 *     {
 *       "id": "string",
 *       "sender": "recruiter|support",
 *       "content": "string",
 *       "createdDate": "2025-01-10T12:30:00Z",
 *       "attachments": []
 *     }
 *   ]
 * }
 */
async function getTicketDetails(ticketId) {
    try {
        const url = buildApiUrl(`/recruiters/contact/tickets/${ticketId}`);
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getStoredToken()}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Error fetching ticket details:', error);
        throw error;
    }
}

/**
 * Add reply to a support ticket
 * @param {string} ticketId - Support ticket ID
 * @param {string} message - Reply message content
 * @returns {Promise} Response from API
 * 
 * API Endpoint: POST /recruiters/contact/tickets/{ticketId}/reply
 * 
 * Request Body:
 * {
 *   "message": "string",
 *   "attachments": [] (optional)
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "message": "Phản hồi đã được gửi",
 *   "replyId": "string"
 * }
 */
async function replyToTicket(ticketId, message) {
    try {
        const url = buildApiUrl(`/recruiters/contact/tickets/${ticketId}/reply`);
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getStoredToken()}`
            },
            body: JSON.stringify({ message })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Error replying to ticket:', error);
        throw error;
    }
}

/**
 * Close a support ticket
 * @param {string} ticketId - Support ticket ID
 * @param {string} feedback - Optional feedback on support quality
 * @returns {Promise} Response from API
 * 
 * API Endpoint: POST /recruiters/contact/tickets/{ticketId}/close
 * 
 * Request Body:
 * {
 *   "feedback": "string" (optional),
 *   "rating": number (1-5, optional)
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "message": "Ticket đã được đóng"
 * }
 */
async function closeTicket(ticketId, feedback = null, rating = null) {
    try {
        const url = buildApiUrl(`/recruiters/contact/tickets/${ticketId}/close`);
        const body = {};
        if (feedback) body.feedback = feedback;
        if (rating) body.rating = rating;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getStoredToken()}`
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Error closing ticket:', error);
        throw error;
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contact-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            // Get form data
            const formData = {
                name: document.getElementById('name').value.trim(),
                email: document.getElementById('email').value.trim(),
                phone: document.getElementById('phone').value.trim(),
                company: document.getElementById('company').value.trim(),
                subject: document.getElementById('subject').value,
                message: document.getElementById('message').value.trim()
            };

            // Client-side validation
            if (!formData.name) {
                showErrorToast('Vui lòng nhập họ và tên', 3000);
                return;
            }
            if (!formData.email || !isValidEmail(formData.email)) {
                showErrorToast('Vui lòng nhập email hợp lệ', 3000);
                return;
            }
            if (!formData.subject) {
                showErrorToast('Vui lòng chọn chủ đề', 3000);
                return;
            }
            if (!formData.message || formData.message.length < 10) {
                showErrorToast('Nội dung tin nhắn phải có ít nhất 10 ký tự', 3000);
                return;
            }

            // Remove phone and company if empty
            if (!formData.phone) delete formData.phone;
            if (!formData.company) delete formData.company;

            try {
                // Show loading state
                const submitButton = contactForm.querySelector('button[type="submit"]');
                const originalText = submitButton.textContent;
                submitButton.disabled = true;
                submitButton.textContent = 'Đang gửi...';

                const result = await sendContactMessage(formData);

                if (result.success) {
                    showSuccessToast('Tin nhắn đã được gửi thành công! Chúng tôi sẽ liên hệ sớm.', 3000);
                    contactForm.reset();
                    
                    // Store ticket ID if provided
                    if (result.ticketId) {
                        localStorage.setItem('lastContactTicketId', result.ticketId);
                    }
                } else {
                    showErrorToast(result.message || 'Gửi tin nhắn thất bại', 3000);
                }
            } catch (error) {
                console.error('Error sending contact form:', error);
                showErrorToast('Có lỗi xảy ra khi gửi tin nhắn', 3000);
            } finally {
                // Restore button state
                const submitButton = contactForm.querySelector('button[type="submit"]');
                submitButton.disabled = false;
                submitButton.textContent = originalText;
            }
        });
    }
});

/**
 * Helper function to validate email
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
