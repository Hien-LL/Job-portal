// ==================== Markdown Service ====================
// Centralized markdown parser and formatter
// Converts markdown text to HTML with proper styling

/**
 * Escape HTML special characters
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, char => map[char]);
}

/**
 * Apply inline formatting (bold, italic, code, links)
 * @param {string} text - Text to format
 * @returns {string} Formatted text
 */
function applyInlineFormatting(text) {
    if (!text) return '';

    return text
        // Code inline first (to prevent other replacements inside code)
        .replace(/`([^`]+)`/g, '<code class="bg-gray-100 border border-gray-300 px-2 py-1 rounded text-sm font-mono text-red-600">$1</code>')
        
        // Bold text
        .replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold text-gray-900">$1</strong>')
        .replace(/__(.+?)__/g, '<strong class="font-bold text-gray-900">$1</strong>')
        
        // Italic text
        .replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '<em class="italic text-gray-800">$1</em>')
        .replace(/(?<!_)_(?!_)(.+?)(?<!_)_(?!_)/g, '<em class="italic text-gray-800">$1</em>')
        
        // Underline text (handle both <u> tags and __underline syntax)
        .replace(/<u>(.+?)<\/u>/g, '<u class="underline text-gray-900">$1</u>')
        .replace(/~~(.+?)~~/g, '<u class="underline text-gray-900">$1</u>')
        
        // Links
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 hover:text-blue-800 hover:underline" target="_blank" rel="noopener noreferrer">$1</a>');
}

/**
 * Parse markdown to HTML with proper list handling
 * @param {string} markdown - Markdown text to parse
 * @returns {string} HTML string
 */
function parseMarkdown(markdown) {
    if (!markdown) return '';

    let lines = markdown.split('\n');
    let html = '';
    let inList = false;
    let listType = null; // 'ul' or 'ol'
    let buffer = [];

    const flushList = () => {
        if (buffer.length > 0) {
            const items = buffer.join('');
            if (listType === 'ol') {
                html += `<ol class="list-decimal pl-6 my-2">${items}</ol>`;
            } else if (listType === 'ul') {
                html += `<ul class="list-disc pl-6 my-2">${items}</ul>`;
            }
            buffer = [];
        }
        inList = false;
        listType = null;
    };

    lines.forEach((line) => {
        // Check for ordered list
        const orderedMatch = line.match(/^\s*\d+\.\s+(.+)$/);
        if (orderedMatch) {
            if (listType !== 'ol') {
                if (inList) flushList();
                listType = 'ol';
                inList = true;
            }
            let itemContent = orderedMatch[1];
            itemContent = applyInlineFormatting(itemContent);
            buffer.push(`<li class="ml-4 text-gray-800">${itemContent}</li>`);
            return;
        }

        // Check for unordered list
        const unorderedMatch = line.match(/^\s*[-*+]\s+(.+)$/);
        if (unorderedMatch) {
            if (listType !== 'ul') {
                if (inList) flushList();
                listType = 'ul';
                inList = true;
            }
            let itemContent = unorderedMatch[1];
            itemContent = applyInlineFormatting(itemContent);
            buffer.push(`<li class="ml-4 text-gray-800">${itemContent}</li>`);
            return;
        }

        // Not a list item - flush current list if any
        if (inList) {
            flushList();
        }

        // Skip empty lines
        if (line.trim() === '') {
            if (html && !html.endsWith('</p>')) {
                html += '</p>';
            }
            return;
        }

        // Check for headers (before escaping HTML)
        const headerMatch = line.match(/^(#{1,6})\s+(.+)$/);
        if (headerMatch) {
            const level = headerMatch[1].length;
            const content = applyInlineFormatting(headerMatch[2]);
            const sizes = ['text-5xl', 'text-4xl', 'text-3xl', 'text-2xl', 'text-xl', 'text-lg'];
            const mt = ['mt-8', 'mt-6', 'mt-4', 'mt-4', 'mt-4', 'mt-4'];
            html += `<h${level} class="${sizes[level-1]} font-bold text-gray-900 ${mt[level-1]} mb-2">${content}</h${level}>`;
            return;
        }

        // Check for horizontal rules (before escaping HTML)
        if (line.match(/^(---|___|\*\*\*)$/)) {
            html += '<hr class="my-4 border-t-2 border-gray-300">';
            return;
        }

        // Check for blockquote (before escaping HTML)
        const blockquoteMatch = line.match(/^>\s+(.+)$/);
        if (blockquoteMatch) {
            const quote = blockquoteMatch[1];
            const quoteCon = applyInlineFormatting(quote);
            html += `<blockquote class="border-l-4 border-blue-500 pl-4 italic text-gray-700 my-2">${quoteCon}</blockquote>`;
            return;
        }

        // Regular paragraph - escape HTML then apply formatting
        let processedLine = escapeHtml(line);
        if (html && !html.endsWith('</p>')) {
            html += '<br>' + applyInlineFormatting(processedLine);
        } else if (processedLine.trim()) {
            const content = applyInlineFormatting(processedLine);
            html = (html.trim() ? html + '</p>' : html) + '<p>' + content;
        }
    });

    // Flush remaining list if any
    if (inList) {
        flushList();
    }

    // Close any open paragraph
    if (html && !html.endsWith('</p>') && !html.endsWith('</ul>') && !html.endsWith('</ol>') && 
        !html.endsWith('>')) {
        html += '</p>';
    }
    
    return html;
}

/**
 * Format description - simple version that just escapes HTML
 * @param {string} description - Description text
 * @returns {string} HTML string with escaped content and line breaks
 */
function formatDescription(description) {
    if (!description) return '';
    
    return description
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\n/g, '<br>');
}

/**
 * Format salary range
 * @param {number} min - Minimum salary
 * @param {number} max - Maximum salary
 * @returns {string} Formatted salary string
 */
function formatSalaryRange(min, max) {
    if (!min && !max) return 'Thương lượng';
    
    const formatAmount = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    if (min && max) {
        return `${formatAmount(min)} - ${formatAmount(max)}`;
    } else if (min) {
        return `Từ ${formatAmount(min)}`;
    } else {
        return `Đến ${formatAmount(max)}`;
    }
}

/**
 * Format date
 * @param {string} dateString - Date string to format
 * @returns {string} Formatted date
 */
function formatDateDisplay(dateString) {
    if (!dateString) return 'Không xác định';
    
    try {
        let date = new Date(dateString);
        
        if (isNaN(date.getTime())) {
            const cleanDate = dateString.replace(/\.\d+/, '');
            date = new Date(cleanDate);
        }
        
        if (isNaN(date.getTime())) {
            return dateString;
        }
        
        return date.toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (e) {
        console.error('Date format error:', e, dateString);
        return dateString || 'Không xác định';
    }
}

/**
 * Format published date (relative time)
 * @param {string} dateString - Date string
 * @returns {string} Relative time string
 */
function formatPublishedDateRelative(dateString) {
    if (!dateString) return 'Không xác định';

    const publishedDate = new Date(dateString);
    const now = new Date();

    publishedDate.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);

    const diffTime = now - publishedDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hôm nay';
    if (diffDays === 1) return 'Hôm qua';
    if (diffDays < 7) return `${diffDays} ngày trước`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} tuần trước`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} tháng trước`;
    return `${Math.floor(diffDays / 365)} năm trước`;
}

/**
 * Format company size
 * @param {number} sizeMin - Minimum size
 * @param {number} sizeMax - Maximum size
 * @returns {string} Formatted company size
 */
function formatCompanySizeDisplay(sizeMin, sizeMax) {
    if (!sizeMin && !sizeMax) return 'Không xác định';
    if (sizeMin === 0 && sizeMax === 0) return 'Không xác định';
    
    if (sizeMin && sizeMax) {
        return `${sizeMin.toLocaleString('vi-VN')} - ${sizeMax.toLocaleString('vi-VN')} nhân viên`;
    } else if (sizeMin) {
        return `Từ ${sizeMin.toLocaleString('vi-VN')} nhân viên`;
    } else {
        return `Đến ${sizeMax.toLocaleString('vi-VN')} nhân viên`;
    }
}

/**
 * Sanitize and parse markdown with strict rules
 * @param {string} markdown - Markdown text
 * @returns {string} Safe HTML string
 */
function parseSafeMarkdown(markdown) {
    // First parse markdown
    let html = parseMarkdown(markdown);
    
    // Additional sanitization if DOMPurify is available
    if (typeof DOMPurify !== 'undefined') {
        return DOMPurify.sanitize(html);
    }
    
    return html;
}

// Make functions available globally
if (typeof window !== 'undefined') {
    window.parseMarkdown = parseMarkdown;
    window.formatDescription = formatDescription;
    window.formatSalaryRange = formatSalaryRange;
    window.formatDateDisplay = formatDateDisplay;
    window.formatPublishedDateRelative = formatPublishedDateRelative;
    window.formatCompanySizeDisplay = formatCompanySizeDisplay;
    window.parseSafeMarkdown = parseSafeMarkdown;
}
