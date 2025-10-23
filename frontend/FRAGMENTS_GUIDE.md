# Job Portal Frontend - Fragment Architecture

## 📁 Cấu trúc thư mục

```
frontend/
├── index.html                 # Homepage
├── job.html                   # Job Listing
├── login.html                 # Login/Register
├── template.html              # Template mẫu
├── styles.css                 # Main styles
│
├── fragments/                 # Reusable HTML fragments
│   ├── header.html           # Navigation header
│   └── footer.html           # Footer
│
├── js/                        # JavaScript files
│   ├── fragments-loader.js   # Fragment loading system
│   └── main.js               # Main JS (to create)
│
└── css/                       # CSS files
    ├── components.css        # Reusable component styles
    └── variables.css         # CSS variables (to create)
```

## 🔧 Cách sử dụng Fragments

### 1. **Using Fragments in HTML Files**

Để sử dụng một fragment, thêm thuộc tính `data-fragment` vào một `<div>`:

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>My Page</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body>
    <!-- Load Header Fragment -->
    <div data-fragment="fragments/header.html"></div>

    <!-- Main Content -->
    <main>
        <section class="py-12">
            <h1>Your Content Here</h1>
        </section>
    </main>

    <!-- Load Footer Fragment -->
    <div data-fragment="fragments/footer.html"></div>

    <!-- Fragment Loader Script -->
    <script src="js/fragments-loader.js"></script>
</body>
</html>
```

### 2. **Available Fragments**

#### **header.html**
- Navigation bar
- Logo
- Menu items
- Auth buttons
- Mobile menu trigger

#### **footer.html**
- Company info
- Links (Candidates, Employers, Info)
- Social media links
- Copyright info

## 🎨 Using Component Classes

### Buttons
```html
<!-- Primary Button -->
<button class="btn-primary">Submit</button>

<!-- Secondary Button -->
<button class="btn-secondary">Cancel</button>

<!-- Outline Button -->
<button class="btn-outline">Learn More</button>
```

### Cards
```html
<!-- Basic Card -->
<div class="card">Card content</div>

<!-- Job Card -->
<div class="job-card">Job content</div>

<!-- Border Card -->
<div class="card-border">Content</div>
```

### Badges
```html
<!-- Blue Badge -->
<span class="badge">New</span>

<!-- Green Badge -->
<span class="badge-success">Active</span>

<!-- Red Badge -->
<span class="badge-danger">Urgent</span>
```

### Forms
```html
<!-- Form Input -->
<input type="text" class="form-input" placeholder="Enter text">

<!-- Form Label -->
<label class="form-label">Label Text</label>
```

### Responsive Grids
```html
<!-- 3-column grid (responsive) -->
<div class="grid-responsive">
    <div>Item 1</div>
    <div>Item 2</div>
    <div>Item 3</div>
</div>

<!-- 4-column grid (responsive) -->
<div class="grid-responsive-4">
    <div>Item 1</div>
    <div>Item 2</div>
    <div>Item 3</div>
    <div>Item 4</div>
</div>
```

## 📝 Creating New Pages

Mẫu để tạo trang mới:

```html
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Page Title - jobPortal</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Poppins:wght@600;700;800&display=swap" rel="stylesheet">
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="styles.css">
    <link rel="stylesheet" href="css/components.css">
</head>
<body class="bg-white">
    <!-- Load Header -->
    <div data-fragment="fragments/header.html"></div>

    <!-- Main Content -->
    <main class="min-h-screen">
        <section class="py-12 px-4 sm:px-6 lg:px-8">
            <div class="max-w-7xl mx-auto">
                <!-- Your content -->
            </div>
        </section>
    </main>

    <!-- Load Footer -->
    <div data-fragment="fragments/footer.html"></div>

    <!-- Fragment Loader -->
    <script src="js/fragments-loader.js"></script>
</body>
</html>
```

## 🚀 Adding Interactive Features

### Event Listeners (in fragments-loader.js)

Mobile menu toggle:
```javascript
document.addEventListener('click', function(e) {
    if (e.target.closest('.mobile-menu-trigger')) {
        console.log('Mobile menu clicked');
    }
});
```

Favorite toggle:
```javascript
document.addEventListener('click', function(e) {
    if (e.target.closest('.favorite-btn')) {
        const btn = e.target.closest('.favorite-btn');
        btn.classList.toggle('text-red-500');
    }
});
```

## 🔗 Navigation Links

Update links in `fragments/header.html`:
- `index.html` - Homepage
- `job.html` - Job Listing
- `login.html` - Login Page

## 📦 Best Practices

1. **Keep fragments small** - Each fragment should have a single responsibility
2. **Use data attributes** - Use `data-*` for JavaScript selectors
3. **Consistent naming** - Follow naming conventions in CSS classes
4. **Mobile first** - Always use responsive classes (sm:, md:, lg:)
5. **Semantic HTML** - Use proper HTML elements
6. **Accessibility** - Include alt text, labels, and ARIA attributes

## ⚡ Performance Tips

1. Load fragments asynchronously - already handled by fragments-loader.js
2. Minimize CSS - Tailwind CDN is already cached
3. Lazy load images - Use `loading="lazy"` attribute
4. Cache fragments - Browser cache handles this

## 🐛 Troubleshooting

### Fragments not loading?
1. Check browser console for errors
2. Verify file paths are correct
3. Ensure `fragments-loader.js` is loaded at end of body
4. Check CORS if running locally

### Styling not applied?
1. Ensure Tailwind CDN is loaded
2. Check if CSS files are linked
3. Verify class names are correct
4. Check browser DevTools for specificity issues

## 📞 Support

For issues or questions, check:
- Browser console for error messages
- Network tab for failed requests
- Verify all file paths match your directory structure
