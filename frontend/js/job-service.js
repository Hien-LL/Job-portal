        // Job page global variables
        let currentPage = 1;
        let totalPages = 1;
        let isLoading = false;
        let savedJobsMap = {}; // Track saved status for each job
        let currentFilters = {
            keyword: '',
            locations: [],
            skills: [],
            benefits: [],
            categories: [],
            companies: [],
            employmentTypes: [],
            salaryMin: null,
            salaryMinOp: 'gte', // gte, eq, ne, lt, lte, gt, in, like
            salaryMax: null,
            salaryMaxOp: 'lte', // gte, eq, ne, lt, lte, gt, in, like
            isRemote: null,
            sortBy: 'publishedAt,desc'
        };

        // API data cache
        let filtersData = {
            locations: [],
            skills: [],
            benefits: [],
            categories: [],
            companies: []
        };

        // Load filter data from APIs
        async function loadFiltersData() {
            try {
                // Load locations
                const locationsUrl = buildApiUrl(API_CONFIG.LOCATIONS.LIST);
                const locationsResponse = await fetch(locationsUrl);
                const locationsResult = await locationsResponse.json();
                if (locationsResult.success) {
                    filtersData.locations = locationsResult.data;
                    displayLocationFilters();
                    setupLocationAutocomplete(); // Setup autocomplete for location search
                }

                // Load skills
                const skillsUrl = buildApiUrl(API_CONFIG.SKILLS.LIST);
                const skillsResponse = await fetch(skillsUrl);
                const skillsResult = await skillsResponse.json();
                if (skillsResult.success) {
                    filtersData.skills = skillsResult.data;
                    displaySkillsFilters();
                }

                // Load benefits
                const benefitsUrl = buildApiUrl(API_CONFIG.BENEFITS.LIST);
                const benefitsResponse = await fetch(benefitsUrl);
                const benefitsResult = await benefitsResponse.json();
                if (benefitsResult.success) {
                    filtersData.benefits = benefitsResult.data;
                    displayBenefitsFilters();
                }
                
                // Load categories
                const categoriesUrl = buildApiUrl(API_CONFIG.CATEGORIES.LIST);
                const categoriesResponse = await fetch(categoriesUrl);
                const categoriesResult = await categoriesResponse.json();
                if (categoriesResult.success) {
                    filtersData.categories = categoriesResult.data;
                    displayCategoryFilters();
                }
                
                // Load companies (sorted by follower count)
                const companiesUrl = buildCompleteUrl(API_CONFIG.COMPANIES.LIST, {}, { sort: 'followerCount,desc' });
                const companiesResponse = await fetch(companiesUrl);
                const companiesResult = await companiesResponse.json();
                if (companiesResult.success) {
                    filtersData.companies = companiesResult.data.content || companiesResult.data;
                    displayCompanyFilters();
                }
                
                // Display employment type filters (no API needed - hardcoded)
                // Use setTimeout to ensure DOM is ready
                setTimeout(() => {
                    displayEmploymentTypeFilters();
                }, 100);
            } catch (error) {
                console.error('Error loading filters data:', error);
            }
        }

        // Display location filters
        function displayLocationFilters() {
            const container = document.getElementById('location-filters-dropdown');
            if (!container) return;
            
            const majorLocations = filtersData.locations.slice(0, 5);
            
            const html = `
                <label class="flex items-center text-sm text-gray-700">
                    <input type="checkbox" value="remote" class="mr-2 rounded location-filter"> Remote
                </label>
                ${majorLocations.map(location => `
                    <label class="flex items-center text-sm text-gray-700">
                        <input type="checkbox" value="${location.city}" class="mr-2 rounded location-filter"> 
                        ${location.displayName}
                    </label>
                `).join('')}
            `;
            container.innerHTML = html;

            // Add event listeners
            container.querySelectorAll('.location-filter').forEach(checkbox => {
                checkbox.addEventListener('change', updateLocationFilter);
            });
            
            // Add search functionality for locations
            addLocationSearch();
        }

        // Add search functionality for locations
        function addLocationSearch() {
            const container = document.getElementById('location-filters-dropdown');
            if (!container) return;
            
            // Create search input if not exists
            let searchInput = document.getElementById('location-search');
            if (!searchInput) {
                const searchHTML = `
                    <input 
                        type="text" 
                        id="location-search"
                        placeholder="Tìm địa điểm..."
                        class="w-full px-3 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 mb-2"
                    >
                `;
                container.insertAdjacentHTML('beforebegin', searchHTML);
                searchInput = document.getElementById('location-search');
            }
            
            if (searchInput) {
                searchInput.addEventListener('input', (e) => {
                    const searchTerm = e.target.value.toLowerCase();
                    const filteredLocations = filtersData.locations.filter(loc => 
                        loc.displayName.toLowerCase().includes(searchTerm)
                    );
                    displayFilteredLocations(filteredLocations.slice(0, 20));
                });
            }
        }

        // Display filtered locations
        function displayFilteredLocations(locations) {
            const container = document.getElementById('location-filters-dropdown');
            if (!container) return;
            
            const html = `
                <label class="flex items-center text-sm text-gray-700">
                    <input type="checkbox" value="remote" class="mr-2 rounded location-filter"> Remote
                </label>
                ${locations.map(location => `
                    <label class="flex items-center text-sm text-gray-700">
                        <input type="checkbox" value="${location.city}" class="mr-2 rounded location-filter"> 
                        ${location.displayName}
                    </label>
                `).join('')}
            `;
            container.innerHTML = html;

            // Add event listeners
            container.querySelectorAll('.location-filter').forEach(checkbox => {
                checkbox.addEventListener('change', updateLocationFilter);
            });
        }

        // Display skills filters with search
        function displaySkillsFilters() {
            const container = document.getElementById('skills-filters-dropdown');
            if (!container) {
                console.error('Skills container not found!');
                return;
            }
            
            // Check if already populated
            if (container.querySelector('.skill-filter')) {
                console.log('Skills filters already displayed');
                return;
            }
            
            const popularSkills = filtersData.skills.slice(0, 10);
            displayFilteredSkills(popularSkills);

            const searchInput = document.getElementById('skills-search');
            if (searchInput) {
                // Remove old listeners
                searchInput.removeEventListener('input', handleSkillsSearch);
                // Add new listener
                searchInput.addEventListener('input', handleSkillsSearch);
            }
            
            console.log('Skills filters displayed');
        }
        
        // Separate handler to avoid duplicate listeners
        function handleSkillsSearch(e) {
            const searchTerm = e.target.value.toLowerCase();
            const filteredSkills = filtersData.skills.filter(skill => 
                skill.name.toLowerCase().includes(searchTerm)
            );
            displayFilteredSkills(filteredSkills.slice(0, 20));
        }

        function displayFilteredSkills(skills) {
            const container = document.getElementById('skills-filters-dropdown');
            if (!container) return;
            
            const html = skills.map(skill => `
                <label class="flex items-center text-sm text-gray-700 cursor-pointer hover:bg-gray-50 px-2 py-1 rounded">
                    <input type="checkbox" value="${skill.slug}" class="mr-2 rounded skill-filter"> 
                    ${skill.name}
                </label>
            `).join('');
            container.innerHTML = html;

            container.querySelectorAll('.skill-filter').forEach(checkbox => {
                checkbox.addEventListener('change', updateSkillsFilter);
            });
        }

        // Display category filters
        function displayCategoryFilters() {
            const container = document.getElementById('category-filters-dropdown');
            if (!container) {
                console.error('Category container not found!');
                return;
            }
            
            // Check if already populated
            if (container.querySelector('.category-filter')) {
                console.log('Category filters already displayed');
                return;
            }
            
            const popularCategories = filtersData.categories.slice(0, 15);
            displayFilteredCategories(popularCategories);

            const searchInput = document.getElementById('category-search');
            if (searchInput) {
                // Remove old listeners
                searchInput.removeEventListener('input', handleCategorySearch);
                // Add new listener
                searchInput.addEventListener('input', handleCategorySearch);
            }
            
            console.log('Category filters displayed');
        }
        
        // Separate handler to avoid duplicate listeners
        function handleCategorySearch(e) {
            const searchTerm = e.target.value.toLowerCase();
            const filteredCategories = filtersData.categories.filter(category => 
                category.name.toLowerCase().includes(searchTerm)
            );
            displayFilteredCategories(filteredCategories.slice(0, 20));
        }

        function displayFilteredCategories(categories) {
            const container = document.getElementById('category-filters-dropdown');
            if (!container) return;
            
            const html = categories.map(category => `
                <label class="flex items-center text-sm text-gray-700 cursor-pointer hover:bg-gray-50 px-2 py-1 rounded">
                    <input type="checkbox" value="${category.slug}" class="mr-2 rounded category-filter"> 
                    ${category.name}
                </label>
            `).join('');
            container.innerHTML = html;

            container.querySelectorAll('.category-filter').forEach(checkbox => {
                checkbox.addEventListener('change', updateCategoryFilter);
            });
        }

        // Display company filters
        function displayCompanyFilters() {
            const container = document.getElementById('company-filters-dropdown');
            if (!container) {
                console.error('Company container not found!');
                return;
            }
            
            // Check if already populated
            if (container.querySelector('.company-filter')) {
                console.log('Company filters already displayed');
                return;
            }
            
            const popularCompanies = filtersData.companies.slice(0, 15);
            displayFilteredCompanies(popularCompanies);

            const searchInput = document.getElementById('company-search');
            if (searchInput) {
                // Remove old listeners
                searchInput.removeEventListener('input', handleCompanySearch);
                // Add new listener
                searchInput.addEventListener('input', handleCompanySearch);
            }
            
            console.log('Company filters displayed');
        }
        
        // Separate handler to avoid duplicate listeners
        function handleCompanySearch(e) {
            const searchTerm = e.target.value.toLowerCase();
            const filteredCompanies = filtersData.companies.filter(company => 
                company.name.toLowerCase().includes(searchTerm)
            );
            displayFilteredCompanies(filteredCompanies.slice(0, 20));
        }

        function displayFilteredCompanies(companies) {
            const container = document.getElementById('company-filters-dropdown');
            if (!container) return;
            
            const html = companies.map(company => `
                <label class="flex items-center text-sm text-gray-700 cursor-pointer hover:bg-gray-50 px-2 py-1 rounded">
                    <input type="checkbox" value="${company.name}" class="mr-2 rounded company-filter"> 
                    ${company.name}
                </label>
            `).join('');
            container.innerHTML = html;

            container.querySelectorAll('.company-filter').forEach(checkbox => {
                checkbox.addEventListener('change', updateCompanyFilter);
            });
        }

        // Display benefits filters
        function displayBenefitsFilters() {
            const container = document.getElementById('benefits-filters-dropdown');
            if (!container) {
                console.error('Benefits container not found!');
                return;
            }
            
            // Check if already populated (to avoid re-adding event listeners)
            if (container.querySelector('.benefit-filter')) {
                console.log('Benefits filters already displayed');
                return;
            }
            
            const popularBenefits = filtersData.benefits.slice(0, 15);
            displayFilteredBenefits(popularBenefits);

            const searchInput = document.getElementById('benefits-search');
            if (searchInput) {
                // Remove old listeners
                searchInput.removeEventListener('input', handleBenefitsSearch);
                // Add new listener
                searchInput.addEventListener('input', handleBenefitsSearch);
            }
            
            console.log('Benefits filters displayed:', popularBenefits.length);
        }
        
        // Separate handler to avoid duplicate listeners
        function handleBenefitsSearch(e) {
            const searchTerm = e.target.value.toLowerCase();
            const filteredBenefits = filtersData.benefits.filter(benefit => 
                benefit.name.toLowerCase().includes(searchTerm)
            );
            displayFilteredBenefits(filteredBenefits.slice(0, 20));
        }
        
        function displayFilteredBenefits(benefits) {
            const container = document.getElementById('benefits-filters-dropdown');
            if (!container) return;
            
            const html = benefits.map(benefit => `
                <label class="flex items-center text-sm text-gray-700 cursor-pointer hover:bg-gray-50 px-2 py-1 rounded">
                    <input type="checkbox" value="${benefit.id}" class="mr-2 rounded benefit-filter"> 
                    ${benefit.name}
                </label>
            `).join('');
            container.innerHTML = html;

            container.querySelectorAll('.benefit-filter').forEach(checkbox => {
                checkbox.addEventListener('change', updateBenefitsFilter);
            });
        }

        // Display employment type filters
        function displayEmploymentTypeFilters() {
            const employmentTypes = [
                { value: 'FullTime', label: 'Toàn thời gian' },
                { value: 'PartTime', label: 'Bán thời gian' },
                { value: 'Internship', label: 'Thực tập' },
                { value: 'Freelance', label: 'Freelance' }
            ];

            const container = document.getElementById('employment-type-filters-dropdown');
            if (!container) {
                console.error('Employment type container not found!');
                return;
            }

            // Check if already populated (to avoid re-adding event listeners)
            if (container.querySelector('.employment-filter')) {
                console.log('Employment filters already displayed');
                return;
            }

            const html = employmentTypes.map(type => `
                <label class="flex items-center text-sm text-gray-700 cursor-pointer hover:bg-gray-50 px-2 py-1 rounded">
                    <input type="checkbox" value="${type.value}" class="mr-2 rounded employment-filter"> 
                    ${type.label}
                </label>
            `).join('');
            container.innerHTML = html;

            // Add event listeners
            container.querySelectorAll('.employment-filter').forEach(checkbox => {
                checkbox.addEventListener('change', updateEmploymentTypeFilter);
            });
            
            console.log('Employment type filters displayed:', employmentTypes.length);
        }

        // Setup location autocomplete dropdown
        function setupLocationAutocomplete() {
            const locationInput = document.getElementById('location-search');
            const locationSuggestions = document.getElementById('location-suggestions');
            const locationList = document.getElementById('location-list');
            const filterInput = document.getElementById('location-filter-input');

            if (!locationInput || !locationSuggestions || !locationList) return;

            // Populate initial location list
            function populateLocationList(locations) {
                const html = locations.map(loc => `
                    <label class="flex items-center px-3 py-2 hover:bg-gray-50 rounded cursor-pointer">
                        <input type="radio" name="location-radio" value="${loc.city}" class="mr-3">
                        <span class="text-sm text-gray-700">${loc.displayName}</span>
                    </label>
                `).join('');
                locationList.innerHTML = html;

                // Add event listeners to radio buttons
                locationList.querySelectorAll('input[type="radio"]').forEach(radio => {
                    radio.addEventListener('change', (e) => {
                        locationInput.value = e.target.value;
                        locationSuggestions.classList.add('hidden');
                    });
                });
            }

            // Show dropdown on focus
            locationInput.addEventListener('focus', () => {
                locationSuggestions.classList.remove('hidden');
                populateLocationList(filtersData.locations);
                if (filterInput) filterInput.value = '';
            });

            // Filter locations when typing in filter input
            if (filterInput) {
                filterInput.addEventListener('input', (e) => {
                    const searchTerm = e.target.value.toLowerCase();
                    const filtered = filtersData.locations.filter(loc =>
                        loc.city.toLowerCase().includes(searchTerm) ||
                        loc.displayName.toLowerCase().includes(searchTerm)
                    );
                    populateLocationList(filtered);
                });
            }
        }

        // Filter update functions
        function updateSkillsFilter() {
            const selectedSkills = Array.from(document.querySelectorAll('.skill-filter:checked'))
                .map(cb => cb.value);
            currentFilters.skills = selectedSkills;
            searchJobs(1);
        }

        function updateCategoryFilter() {
            const selectedCategories = Array.from(document.querySelectorAll('.category-filter:checked'))
                .map(cb => cb.value);
            currentFilters.categories = selectedCategories;
            searchJobs(1);
        }

        function updateBenefitsFilter() {
            const selectedBenefits = Array.from(document.querySelectorAll('.benefit-filter:checked'))
                .map(cb => cb.value);
            currentFilters.benefits = selectedBenefits;
            searchJobs(1);
        }

        function updateEmploymentTypeFilter() {
            const selectedTypes = Array.from(document.querySelectorAll('.employment-filter:checked'))
                .map(cb => cb.value);
            currentFilters.employmentTypes = selectedTypes;
            searchJobs(1);
        }

        function updateRemoteFilter() {
            const remoteCheckbox = document.getElementById('remote-filter');
            currentFilters.isRemote = remoteCheckbox && remoteCheckbox.checked ? true : null;
            console.log('🏠 updateRemoteFilter called, isRemote:', currentFilters.isRemote);
            searchJobs(1);
        }

        function updateCompanyFilter() {
            const selectedCompanies = Array.from(document.querySelectorAll('.company-filter:checked'))
                .map(cb => cb.value);
            currentFilters.companies = selectedCompanies;
            searchJobs(1);
        }

        // Search jobs with filters
        async function searchJobs(page = 1, fromSearchBar = false) {
            if (isLoading) return;
            
            isLoading = true;
            currentPage = page;
            
            console.log('🔍 searchJobs called:', { page, fromSearchBar, currentLocations: currentFilters.locations });
            
            // Get keyword from search input
            const keywordInput = document.getElementById('keyword-search');
            if (keywordInput) {
                currentFilters.keyword = keywordInput.value.trim();
            }
            
            // Always get location from search bar input (not from checkboxes)
            const locationInput = document.getElementById('location-search');
            const remoteCheckbox = document.getElementById('remote-filter');
            
            // First, check Remote checkbox status
            if (remoteCheckbox?.checked) {
                currentFilters.isRemote = true;
            } else {
                currentFilters.isRemote = null;
            }
            
            // Then process location input
            if (locationInput && locationInput.value.trim()) {
                const locationValue = locationInput.value.trim();
                // Check if it's "remote"
                if (locationValue.toLowerCase().includes('remote')) {
                    currentFilters.isRemote = true;
                    currentFilters.locations = [];
                } else {
                    // Find matching location by city name or displayName
                    const matchedLocation = filtersData.locations.find(loc => 
                        loc.city.toLowerCase().includes(locationValue.toLowerCase()) ||
                        loc.displayName.toLowerCase().includes(locationValue.toLowerCase())
                    );
                    if (matchedLocation) {
                        currentFilters.locations = [matchedLocation.city];
                        // Don't override isRemote if checkbox is checked
                    } else {
                        // Use input value as is
                        currentFilters.locations = [locationValue];
                        // Don't override isRemote if checkbox is checked
                    }
                }
            } else {
                // No location input - just use checkbox status
                currentFilters.locations = [];
            }
            
            console.log('📍 Location processed:', { locations: currentFilters.locations, isRemote: currentFilters.isRemote });
            
            // Show loading state
            const jobsContainer = document.getElementById('job-listings');
            jobsContainer.innerHTML = `
                <div class="text-center py-8">
                    <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p class="text-gray-600 text-sm mt-2">Đang tìm kiếm...</p>
                </div>
            `;

            try {
                const apiParams = new URLSearchParams();
                apiParams.append('page', page);
                apiParams.append('perPage', 10);
                apiParams.append('published', 'true');
                apiParams.append('sort', currentFilters.sortBy);

                // Add filters
                if (currentFilters.keyword) {
                    apiParams.append('keyword', currentFilters.keyword);
                }

                // Add remote filter
                if (currentFilters.isRemote) {
                    apiParams.append('isRemote', 'true');
                }

                // Add location filter
                console.log('📍 Adding locations to API params:', currentFilters.locations);
                currentFilters.locations.forEach(loc => {
                    apiParams.append('location.city[in]', loc);
                    console.log('  ✓ Added location:', loc);
                });

                currentFilters.skills.forEach(skill => {
                    apiParams.append('skills.slug[in][]', skill);
                });

                currentFilters.categories.forEach(category => {
                    apiParams.append('category.slug', category);
                });

                currentFilters.benefits.forEach(benefit => {
                    apiParams.append('benefits.id[in][]', benefit);
                });

                currentFilters.employmentTypes.forEach(type => {
                    apiParams.append('employmentType[in][]', type);
                });

                currentFilters.companies.forEach(company => {
                    apiParams.append('company.name', company);
                });

                // Add salary filters with operators
                if (currentFilters.salaryMin) {
                    const salaryMinOp = currentFilters.salaryMinOp || 'gte';
                    apiParams.append(`salaryMin[${salaryMinOp}]`, currentFilters.salaryMin);
                }
                
                if (currentFilters.salaryMax) {
                    const salaryMaxOp = currentFilters.salaryMaxOp || 'lte';
                    apiParams.append(`salaryMax[${salaryMaxOp}]`, currentFilters.salaryMax);
                }

                const url = buildCompleteUrl(API_CONFIG.JOBS.LIST, {}, Object.fromEntries(apiParams));
                console.log('🌐 API URL:', url);
                console.log('📊 API Params:', Object.fromEntries(apiParams));
                
                const response = await fetch(url);
                const result = await response.json();

                if (result.success && result.data) {
                    displayJobs(result.data.content);
                    displayPagination(result.data);
                    updateJobCount(result.data.totalElements);
                    
                    // Update URL with filters (browser history)
                    updateUrlWithFilters(page);
                } else {
                    showNoJobsMessage();
                }
            } catch (error) {
                console.error('Error searching jobs:', error);
                showErrorMessage();
            } finally {
                isLoading = false;
            }
        }

        // Update URL with current filters
        function updateUrlWithFilters(page = 1) {
            const urlParams = new URLSearchParams();
            
            console.log('📝 Updating URL with filters:', {
                locations: currentFilters.locations,
                skills: currentFilters.skills,
                benefits: currentFilters.benefits
            });
            
            if (currentFilters.keyword) {
                urlParams.append('keyword', currentFilters.keyword);
            }
            
            if (page > 1) {
                urlParams.append('page', page);
            }
            
            console.log('🏠 isRemote value:', currentFilters.isRemote);
            if (currentFilters.isRemote) {
                urlParams.append('isRemote', 'true');
                console.log('  ✓ Appending isRemote to URL');
            } else {
                console.log('  ✗ isRemote is false/null, not appending');
            }
            
            if (currentFilters.locations.length > 0) {
                console.log('  ✓ Appending locations to URL:', currentFilters.locations);
                currentFilters.locations.forEach(loc => {
                    urlParams.append('location', loc);
                });
            } else {
                console.log('  ✗ No locations to append');
            }
            
            if (currentFilters.categories.length > 0) {
                currentFilters.categories.forEach(category => {
                    urlParams.append('category', category);
                });
            }
            
            if (currentFilters.skills.length > 0) {
                currentFilters.skills.forEach(skill => {
                    urlParams.append('skill', skill);
                });
            }
            
            if (currentFilters.benefits.length > 0) {
                currentFilters.benefits.forEach(benefit => {
                    urlParams.append('benefit', benefit);
                });
            }
            
            if (currentFilters.employmentTypes.length > 0) {
                currentFilters.employmentTypes.forEach(type => {
                    urlParams.append('employmentType', type);
                });
            }
            
            if (currentFilters.companies.length > 0) {
                currentFilters.companies.forEach(company => {
                    urlParams.append('company', company);
                });
            }
            
            if (currentFilters.salaryMin) {
                urlParams.append('salaryMin', currentFilters.salaryMin);
                if (currentFilters.salaryMinOp && currentFilters.salaryMinOp !== 'gte') {
                    urlParams.append('salaryMinOp', currentFilters.salaryMinOp);
                }
            }
            
            if (currentFilters.salaryMax) {
                urlParams.append('salaryMax', currentFilters.salaryMax);
                if (currentFilters.salaryMaxOp && currentFilters.salaryMaxOp !== 'lte') {
                    urlParams.append('salaryMaxOp', currentFilters.salaryMaxOp);
                }
            }
            
            if (currentFilters.sortBy !== 'publishedAt,desc') {
                urlParams.append('sort', currentFilters.sortBy);
            }
            
            const queryString = urlParams.toString();
            const newUrl = queryString 
                ? `${window.location.pathname}?${queryString}` 
                : window.location.pathname;
            
            window.history.pushState({}, '', newUrl);
        }

        // Get filters from URL
        function getFiltersFromUrl() {
            const urlParams = new URLSearchParams(window.location.search);
            
            console.log('🔍 Getting filters from URL:', window.location.search);
            
            // Get keyword
            if (urlParams.has('keyword')) {
                currentFilters.keyword = urlParams.get('keyword');
                console.log('  ✓ keyword:', currentFilters.keyword);
            }
            
            // Get page
            if (urlParams.has('page')) {
                currentPage = parseInt(urlParams.get('page'));
                console.log('  ✓ page:', currentPage);
            }
            
            // Get isRemote
            if (urlParams.has('isRemote')) {
                currentFilters.isRemote = urlParams.get('isRemote') === 'true';
                console.log('  ✓ isRemote:', currentFilters.isRemote);
            }
            
            // Get locations
            if (urlParams.has('location')) {
                currentFilters.locations = urlParams.getAll('location');
                console.log('  ✓ locations:', currentFilters.locations);
            }
            
            // Get categories
            if (urlParams.has('category')) {
                currentFilters.categories = urlParams.getAll('category');
            }
            
            // Get skills
            if (urlParams.has('skill')) {
                currentFilters.skills = urlParams.getAll('skill');
            }
            
            // Get benefits
            if (urlParams.has('benefit')) {
                currentFilters.benefits = urlParams.getAll('benefit');
            }
            
            // Get employment types
            if (urlParams.has('employmentType')) {
                currentFilters.employmentTypes = urlParams.getAll('employmentType');
            }
            
            // Get companies
            if (urlParams.has('company')) {
                currentFilters.companies = urlParams.getAll('company');
            }
            
            // Get salary min
            if (urlParams.has('salaryMin')) {
                currentFilters.salaryMin = urlParams.get('salaryMin');
            }
            
            // Get salary min operator
            if (urlParams.has('salaryMinOp')) {
                currentFilters.salaryMinOp = urlParams.get('salaryMinOp');
            }
            
            // Get salary max
            if (urlParams.has('salaryMax')) {
                currentFilters.salaryMax = urlParams.get('salaryMax');
            }
            
            // Get salary max operator
            if (urlParams.has('salaryMaxOp')) {
                currentFilters.salaryMaxOp = urlParams.get('salaryMaxOp');
            }
            
            // Get sort
            if (urlParams.has('sort')) {
                currentFilters.sortBy = urlParams.get('sort');
            }
        }

        // Update UI with filters from URL
        function updateUiWithFilters() {
            // Set keyword input
            const searchInputs = document.querySelectorAll('input[placeholder*="từ khóa"]');
            if (currentFilters.keyword && searchInputs.length > 0) {
                searchInputs.forEach(input => input.value = currentFilters.keyword);
            }
            
            // Set location input from search bar
            const locationInput = document.getElementById('location-search');
            if (locationInput && currentFilters.locations.length > 0) {
                // Set first location to input
                locationInput.value = currentFilters.locations[0];
            }
            
            // Set Remote checkbox
            const remoteCheckbox = document.getElementById('remote-filter');
            if (remoteCheckbox && currentFilters.isRemote) {
                remoteCheckbox.checked = true;
                // Also set "Remote" to location input if isRemote is true
                if (locationInput) {
                    locationInput.value = 'Remote';
                }
            }
            
            // Set category checkboxes
            if (currentFilters.categories.length > 0) {
                currentFilters.categories.forEach(categorySlug => {
                    // Try direct match first, fallback to iteration
                    const checkboxes = document.querySelectorAll('.category-filter');
                    checkboxes.forEach(cb => {
                        if (cb.value === categorySlug) cb.checked = true;
                    });
                });
            }
            
            // Set skill checkboxes
            if (currentFilters.skills.length > 0) {
                currentFilters.skills.forEach(skillSlug => {
                    // Find checkbox by slug value
                    const checkboxes = document.querySelectorAll('.skill-filter');
                    checkboxes.forEach(cb => {
                        if (cb.value === skillSlug) cb.checked = true;
                    });
                });
            }
            
            // Set benefit checkboxes
            if (currentFilters.benefits.length > 0) {
                currentFilters.benefits.forEach(benefitId => {
                    const checkboxes = document.querySelectorAll('.benefit-filter');
                    checkboxes.forEach(cb => {
                        if (cb.value === benefitId) cb.checked = true;
                    });
                });
            }
            
            // Set employment type checkboxes
            if (currentFilters.employmentTypes.length > 0) {
                currentFilters.employmentTypes.forEach(typeValue => {
                    const checkboxes = document.querySelectorAll('.employment-filter');
                    checkboxes.forEach(cb => {
                        if (cb.value === typeValue) cb.checked = true;
                    });
                });
            }
            
            // Set company checkboxes
            if (currentFilters.companies.length > 0) {
                currentFilters.companies.forEach(companyName => {
                    const checkboxes = document.querySelectorAll('.company-filter');
                    checkboxes.forEach(cb => {
                        if (cb.value === companyName) cb.checked = true;
                    });
                });
            }
            
            // Set salary inputs
            const salaryMinInput = document.getElementById('salary-min-input');
            const salaryMaxInput = document.getElementById('salary-max-input');
            const salaryMinOp = document.getElementById('salary-min-operator');
            const salaryMaxOp = document.getElementById('salary-max-operator');

            if (salaryMinInput && currentFilters.salaryMin) {
                salaryMinInput.value = currentFilters.salaryMin;
            }

            if (salaryMaxInput && currentFilters.salaryMax) {
                salaryMaxInput.value = currentFilters.salaryMax;
            }

            if (salaryMinOp && currentFilters.salaryMinOp) {
                salaryMinOp.value = currentFilters.salaryMinOp;
            }

            if (salaryMaxOp && currentFilters.salaryMaxOp) {
                salaryMaxOp.value = currentFilters.salaryMaxOp;
            }
            
            // Set sort dropdown
            if (currentFilters.sortBy && currentFilters.sortBy !== 'publishedAt,desc') {
                const sortSelect = document.querySelector('select');
                if (sortSelect) {
                    if (currentFilters.sortBy === 'salaryMax,desc') {
                        sortSelect.value = 'Lương cao đến thấp';
                    } else if (currentFilters.sortBy === 'salaryMin,asc') {
                        sortSelect.value = 'Lương thấp đến cao';
                    } else if (currentFilters.sortBy === 'title,asc') {
                        sortSelect.value = 'Phù hợp nhất';
                    }
                }
            }
        }

        // Display jobs
        function displayJobs(jobs) {
            const container = document.getElementById('job-listings');
            
            if (!jobs || jobs.length === 0) {
                showNoJobsMessage();
                return;
            }

            const html = jobs.map(job => {
                const salaryText = formatSalary(job.salaryMin, job.salaryMax);
                const locationText = job.isRemote ? 'Remote' : 
                    (job.location?.displayName || 'Không xác định');
                const companyLogo = job.company?.logoUrl;
                const publishedDate = formatPublishedDate(job.publishedAt);
                
                // Format description preview (first 200 chars)
                const descriptionPreview = job.description ? 
                    (job.description.length > 200 ? job.description.substring(0, 200) + '...' : job.description) : 
                    'Không có mô tả';

                return `
                    <div class="job-card-wrapper relative">
                        <!-- Main Card -->
                        <div class="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg hover:border-gray-300 transition relative">
                            <!-- Save Button (top right) -->
                            <button onclick="event.preventDefault(); event.stopPropagation(); toggleSaveJob('${job.slug}', this)" 
                                    class="absolute top-4 right-4 text-gray-300 hover:text-green-500 text-xl save-job-btn transition z-10" 
                                    data-slug="${job.slug}">
                                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                                </svg>
                            </button>

                            <div class="flex gap-3 mb-3">
                                <!-- Company Logo -->
                                <a href="job-detail.html?slug=${job.slug}">
                                    <div class="w-14 h-14 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden border border-gray-200">
                                        ${companyLogo ? 
                                            `<img src="${window.APP_CONFIG.API_BASE + companyLogo}" alt="${job.company?.name}" class="w-full h-full object-cover">` :
                                            `<svg class="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                                            </svg>`
                                        }
                                    </div>
                                </a>

                                <!-- Job Info -->
                                <div class="flex-1 min-w-0 pr-8">
                                    <!-- Title with hover trigger -->
                                    <div class="job-title-hover group/title relative">
                                        <h3 class="font-semibold text-gray-900 text-base mb-1 line-clamp-2 leading-tight cursor-pointer hover:text-blue-600">
                                            ${job.title}
                                        </h3>
                                        
                                        <!-- Hover Popup (triggered by title hover) -->
                                        <div class="job-hover-popup hidden group-hover/title:block absolute left-0 top-0 bg-white border-2 border-blue-500 rounded-lg shadow-2xl z-50 p-5" 
                                             style="min-width: 400px; margin-top: -10px;">
                                            <div class="flex gap-3 mb-4">
                                                <!-- Company Logo -->
                                                <div class="w-16 h-16 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden border border-gray-200">
                                                    ${companyLogo ? 
                                                        `<img src="${window.APP_CONFIG.API_BASE + companyLogo}" alt="${job.company?.name}" class="w-full h-full object-cover">` :
                                                        `<svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                                                        </svg>`
                                                    }
                                                </div>

                                                <div class="flex-1">
                                                    <a href="job-detail.html?slug=${job.slug}" class="font-bold text-gray-900 text-lg hover:text-blue-600 block mb-1">
                                                        ${job.title}
                                                    </a>
                                                    <div class="flex items-center gap-2 text-sm text-gray-600 mb-1">
                                                        <span>${job.company?.name || 'Công ty không xác định'}</span>
                                                        ${job.company?.verified ? 
                                                            `<svg class="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                                                            </svg>` : ''
                                                        }
                                                    </div>
                                                    <div class="flex items-center gap-2 text-xs text-gray-500">
                                                        <span class="font-semibold text-green-600">${salaryText}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <!-- Job Details -->
                                            <div class="space-y-3 mb-4 text-sm">
                                                <div class="flex items-start gap-2">
                                                    <svg class="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                                                    </svg>
                                                    <span class="text-gray-700">${locationText}</span>
                                                </div>
                                                
                                                ${job.employmentType ? `
                                                <div class="flex items-start gap-2">
                                                    <svg class="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                                                    </svg>
                                                    <span class="text-gray-700">${job.employmentType}</span>
                                                </div>` : ''}
                                                
                                                <div class="flex items-start gap-2">
                                                    <svg class="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                                    </svg>
                                                    <span class="text-gray-600">${publishedDate}</span>
                                                </div>
                                            </div>

                                            <!-- Description -->
                                            <div class="border-t pt-3 mb-4">
                                                <h4 class="font-semibold text-gray-900 text-sm mb-2">Mô tả công việc</h4>
                                                <p class="text-gray-600 text-sm leading-relaxed line-clamp-4">${descriptionPreview}</p>
                                            </div>

                                            <!-- Benefits -->
                                            ${job.benefits && job.benefits.length > 0 ? `
                                            <div class="flex flex-wrap gap-2 mb-4">
                                                ${job.benefits.slice(0, 3).map(benefit => 
                                                    `<span class="bg-green-50 text-green-700 px-2 py-1 rounded text-xs border border-green-200">✓ ${benefit.name}</span>`
                                                ).join('')}
                                            </div>` : ''}

                                            <!-- Action Buttons -->
                                            <div class="flex gap-2">
                                                <button onclick="event.preventDefault(); event.stopPropagation(); window.location.href='job-detail.html?slug=${job.slug}'" 
                                                        class="flex-1 bg-white text-blue-600 border border-blue-600 px-4 py-2 rounded-lg font-medium text-sm hover:bg-blue-50 transition">
                                                    Xem chi tiết
                                                </button>
                                                <button onclick="event.preventDefault(); event.stopPropagation(); applyToJob('${job.slug}', ${job.id})" 
                                                        class="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-green-700 transition">
                                                    Ứng tuyển
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div class="flex items-center gap-2 mb-2">
                                        <p class="text-gray-500 text-sm truncate">${job.company?.name || 'Công ty không xác định'}</p>
                                        ${job.company?.verified ? 
                                            `<svg class="w-4 h-4 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" title="Công ty đã xác thực">
                                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                                            </svg>` : 
                                            ''
                                        }
                                    </div>
                                </div>
                            </div>

                            <!-- Job Details (Salary & Location) -->
                            <a href="job-detail.html?slug=${job.slug}">
                                <div class="flex items-center gap-4 text-sm text-gray-600">
                                    <span class="flex items-center gap-1">
                                        <span class="font-medium text-gray-700">${salaryText}</span>
                                    </span>
                                    <span class="flex items-center gap-1">
                                        ${locationText}
                                    </span>
                                </div>
                            </a>
                        </div>
                    </div>
                `;
            }).join('');

            container.innerHTML = html;

            // Check saved status for each job if user is logged in
            if (authService.isAuthenticated()) {
                jobs.forEach(job => {
                    checkJobSavedStatus(job.slug);
                });
            }
        }

        // Utility functions (similar to index.html)
        function formatSalary(min, max) {
            if (!min && !max) return 'Thỏa thuận';
            
            const formatAmount = (amount) => {
                if (amount >= 1000000) {
                    return (amount / 1000000).toFixed(0) + ' triệu';
                }
                return amount.toLocaleString('vi-VN');
            };

            if (min && max) {
                return `${formatAmount(min)} - ${formatAmount(max)}`;
            } else if (min) {
                return `Từ ${formatAmount(min)}`;
            } else {
                return `Lên đến ${formatAmount(max)}`;
            }
        }

        function formatPublishedDate(dateString) {
            if (!dateString) return 'Không xác định';
            
            const publishedDate = new Date(dateString);
            const now = new Date();
            const diffTime = Math.abs(now - publishedDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays === 1) return 'Đăng hôm qua';
            if (diffDays < 7) return `Đăng ${diffDays} ngày trước`;
            if (diffDays < 30) return `Đăng ${Math.ceil(diffDays / 7)} tuần trước`;
            return `Đăng ${Math.ceil(diffDays / 30)} tháng trước`;
        }

        function getCategoryIcon(categoryName) {
            // Same as index.html - return appropriate emoji based on category
            const categoryIcons = {
                'Digital Marketing': '📊',
                'Marketing': '📊', 
                'IT': '💻',
                'Technology': '💻',
                'Software': '⚙️',
                'Design': '🎨',
                'Sales': '🚀',
                'HR': '👔',
                'Finance': '💰',
                'Education': '🎓'
            };
            
            return categoryIcons[categoryName] || '🏢';
        }

        function displayPagination(data) {
            const container = document.getElementById('pagination');
            totalPages = data.totalPages;
            
            if (totalPages <= 1) {
                container.style.display = 'none';
                return;
            }

            let html = '';
            
            // Previous button
            if (currentPage > 1) {
                html += `<button onclick="searchJobs(${currentPage - 1})" class="px-3 py-2 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50">Trước</button>`;
            }

            // Page numbers
            for (let i = Math.max(1, currentPage - 2); i <= Math.min(totalPages, currentPage + 2); i++) {
                if (i === currentPage) {
                    html += `<button class="px-3 py-2 bg-blue-600 text-white rounded text-sm">${i}</button>`;
                } else {
                    html += `<button onclick="searchJobs(${i})" class="px-3 py-2 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50">${i}</button>`;
                }
            }

            // Next button
            if (currentPage < totalPages) {
                html += `<button onclick="searchJobs(${currentPage + 1})" class="px-3 py-2 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50">Tiếp</button>`;
            }

            container.innerHTML = html;
            container.style.display = 'flex';
        }

        function updateJobCount(total) {
            const countElement = document.querySelector('.text-sm.text-gray-600 span');
            if (countElement) {
                countElement.textContent = `${total} việc làm được tìm thấy`;
            }
        }

        function showNoJobsMessage() {
            const container = document.getElementById('job-listings');
            container.innerHTML = `
                <div class="text-center py-8">
                    <p class="text-gray-600 text-sm">Không tìm thấy việc làm phù hợp</p>
                    <button onclick="clearAllFilters()" class="mt-2 text-blue-600 text-sm hover:underline">
                        Xóa bộ lọc
                    </button>
                </div>
            `;
        }

        function showErrorMessage() {
            const container = document.getElementById('job-listings');
            container.innerHTML = `
                <div class="text-center py-8">
                    <p class="text-red-600 text-sm">Lỗi khi tải dữ liệu. Vui lòng thử lại.</p>
                    <button onclick="searchJobs()" class="mt-2 text-blue-600 text-sm hover:underline">
                        Thử lại
                    </button>
                </div>
            `;
        }

        function viewJobDetail(slug, jobId) {
            console.log(`View job detail: ${slug} (ID: ${jobId})`);
            // TODO: Implement job detail page
            showErrorToast(`Tính năng xem chi tiết việc làm sẽ được triển khai sớm`, 3000);
        }

        function clearAllFilters() {
            // Reset all filters
            currentFilters = {
                keyword: '',
                locations: [],
                skills: [],
                benefits: [],
                categories: [],
                companies: [],
                employmentTypes: [],
                salaryMin: null,
                salaryMinOp: 'gte',
                salaryMax: null,
                salaryMaxOp: 'lte',
                isRemote: null,
                sortBy: 'publishedAt,desc'
            };

            // Clear all checkboxes
            document.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
            
            // Clear search inputs
            document.querySelectorAll('input[type="text"]').forEach(input => input.value = '');
            
            // Clear salary inputs
            const salaryMinInput = document.getElementById('salary-min-input');
            const salaryMaxInput = document.getElementById('salary-max-input');
            if (salaryMinInput) salaryMinInput.value = '';
            if (salaryMaxInput) salaryMaxInput.value = '';
            
            // Reset sort dropdown (safely)
            const sortSelect = document.querySelector('select');
            if (sortSelect) sortSelect.selectedIndex = 0;

            // Search again
            searchJobs(1);
        }

        // Salary preset helper
        function setSalaryPreset(min, max) {
            const salaryMinInput = document.getElementById('salary-min-input');
            const salaryMaxInput = document.getElementById('salary-max-input');
            const salaryMinOp = document.getElementById('salary-min-operator');
            const salaryMaxOp = document.getElementById('salary-max-operator');

            if (salaryMinInput) {
                salaryMinInput.value = min || '';
                currentFilters.salaryMin = min || null;
                if (salaryMinOp) currentFilters.salaryMinOp = 'gte';
            }

            if (salaryMaxInput) {
                salaryMaxInput.value = max || '';
                currentFilters.salaryMax = max || null;
                if (salaryMaxOp) currentFilters.salaryMaxOp = max ? 'lte' : null;
            }

            searchJobs(1);
        }

        // Toggle filter dropdown
        function toggleDropdown(name) {
            const dropdown = document.getElementById(`${name}-dropdown`);
            if (!dropdown) {
                console.error(`Dropdown not found: ${name}-dropdown`);
                return;
            }
            
            // Close all other dropdowns
            document.querySelectorAll('[id$="-dropdown"]').forEach(el => {
                if (el.id !== `${name}-dropdown`) {
                    el.classList.add('hidden');
                }
            });
            
            // Toggle current dropdown
            dropdown.classList.toggle('hidden');
            
            // If employment dropdown is opened, populate it
            if (name === 'employment' && !dropdown.classList.contains('hidden')) {
                const container = document.getElementById('employment-type-filters-dropdown');
                if (container) {
                    // Remove hidden class from container if any
                    container.classList.remove('hidden');
                    // Always repopulate to ensure it's displayed
                    displayEmploymentTypeFilters();
                }
            }
            
            // If benefits dropdown is opened, populate it
            if (name === 'benefits' && !dropdown.classList.contains('hidden')) {
                const container = document.getElementById('benefits-filters-dropdown');
                if (container) {
                    // Remove hidden class from container if any
                    container.classList.remove('hidden');
                    // Always repopulate to ensure it's displayed
                    displayBenefitsFilters();
                }
            }
            
            // If skills dropdown is opened, populate it
            if (name === 'skills' && !dropdown.classList.contains('hidden')) {
                const container = document.getElementById('skills-filters-dropdown');
                if (container) {
                    // Remove hidden class from container if any
                    container.classList.remove('hidden');
                    // Always repopulate to ensure it's displayed
                    displaySkillsFilters();
                }
            }
            
            // If category dropdown is opened, populate it
            if (name === 'category' && !dropdown.classList.contains('hidden')) {
                const container = document.getElementById('category-filters-dropdown');
                if (container) {
                    // Remove hidden class from container if any
                    container.classList.remove('hidden');
                    // Always repopulate to ensure it's displayed
                    displayCategoryFilters();
                }
            }
            
            // If company dropdown is opened, populate it
            if (name === 'company' && !dropdown.classList.contains('hidden')) {
                const container = document.getElementById('company-filters-dropdown');
                if (container) {
                    // Remove hidden class from container if any
                    container.classList.remove('hidden');
                    // Always repopulate to ensure it's displayed
                    displayCompanyFilters();
                }
            }
            
            // Published dropdown has static content, no need to populate
            // Just ensure it's visible when toggled
            
            // Prevent event bubbling so it doesn't immediately close
            if (window.event) {
                window.event.stopPropagation();
            }
        }

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            // Check if clicked element is inside a dropdown or button
            if (!e.target.closest('[id$="-dropdown"]') && 
                !e.target.closest('button') &&
                !e.target.closest('#location-suggestions') &&
                !e.target.closest('#location-search')) {
                document.querySelectorAll('[id$="-dropdown"]').forEach(el => {
                    el.classList.add('hidden');
                });
                // Also close location suggestions
                const locationSuggestions = document.getElementById('location-suggestions');
                if (locationSuggestions) {
                    locationSuggestions.classList.add('hidden');
                }
            }
        }, false);

        // Toggle filter section
        function toggleFilterSection(section) {
            const sectionEl = document.getElementById(`${section}-section`);
            const toggleEl = document.getElementById(`${section}-toggle`);
            
            if (!sectionEl) return;
            
            const isHidden = sectionEl.style.display === 'none';
            sectionEl.style.display = isHidden ? 'block' : 'none';
            toggleEl.textContent = isHidden ? '▼' : '▶';
        }

        // Save/Unsave job functionality
        async function toggleSaveJob(slug, buttonElement) {
            const token = getStoredToken();
            if (!token) {
                showErrorToast('Vui lòng đăng nhập để lưu việc làm', 3000);
                redirectToUrl('login.html', 1000);
                return;
            }

            try {
                const isSaved = buttonElement.classList.contains('text-red-500');
                const method = isSaved ? 'DELETE' : 'POST';
                const url = `${API_CONFIG.BASE_URL}/jobs/${slug}/${isSaved ? 'unsave' : 'save'}`;

                const response = await fetch(url, {
                    method: method,
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result?.message || 'Failed to save/unsave job');
                }

                if (result.success) {
                    // Update saved status
                    savedJobsMap[slug] = !isSaved;

                    // Toggle button state
                    if (isSaved) {
                        buttonElement.classList.remove('text-red-500');
                        buttonElement.classList.add('text-gray-400');
                        buttonElement.textContent = '♡';
                        buttonElement.title = 'Lưu việc làm';
                        showSuccessToast('Đã bỏ lưu việc làm ✓', 2000);
                    } else {
                        buttonElement.classList.remove('text-gray-400');
                        buttonElement.classList.add('text-red-500');
                        buttonElement.textContent = '♥';
                        buttonElement.title = 'Bỏ lưu việc làm';
                        showSuccessToast('Đã lưu việc làm ✓', 2000);
                    }
                } else {
                    throw new Error(result.message || 'Failed to save/unsave job');
                }
            } catch (error) {
                console.error('Error saving/unsaving job:', error);
                showErrorToast(error.message || 'Có lỗi xảy ra khi lưu việc làm', 3000);
            }
        }

        // Check if a job is saved
        async function checkJobSavedStatus(slug) {
            try {
                const token = getStoredToken();
                if (!token) return;

                const url = buildApiUrl(API_CONFIG.JOBS.CHECK_SAVED, { jobSlug: slug });
                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    const result = await response.json();
                    if (result.success) {
                        const isSaved = result.data === true;
                        savedJobsMap[slug] = isSaved;

                        // Update button UI if saved
                        if (isSaved) {
                            const button = document.querySelector(`[data-slug="${slug}"]`);
                            if (button) {
                                button.classList.remove('text-gray-400');
                                button.classList.add('text-red-500');
                                button.textContent = '♥';
                                button.title = 'Bỏ lưu việc làm';
                            }
                        }
                    }
                }
            } catch (error) {
                console.error('Error checking saved job status:', error);
            }
        }

        // Initialize page
        document.addEventListener('DOMContentLoaded', async () => {
            console.log('📄 Page loaded, initializing...');
            
            // Load filters data first
            await loadFiltersData();
            console.log('✓ Filters data loaded');
            
            // Get filters from URL
            getFiltersFromUrl();
            console.log('✓ Filters parsed from URL');
            
            // Wait for DOM to be fully ready
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Update UI to show selected filters BEFORE searching
            updateUiWithFilters();
            console.log('✓ UI updated with filters');
            
            // Wait a bit more to ensure checkboxes are checked
            await new Promise(resolve => setTimeout(resolve, 200));
            
            // Now search with current page (this will update URL)
            console.log('🔍 Starting search...');
            searchJobs(currentPage);

            // Add salary filter event listeners
            const salaryMinInput = document.getElementById('salary-min-input');
            const salaryMinOp = document.getElementById('salary-min-operator');
            const salaryMaxInput = document.getElementById('salary-max-input');
            const salaryMaxOp = document.getElementById('salary-max-operator');

            if (salaryMinInput) {
                salaryMinInput.addEventListener('change', () => {
                    currentFilters.salaryMin = salaryMinInput.value ? parseInt(salaryMinInput.value) : null;
                    searchJobs(1);
                });
            }

            if (salaryMinOp) {
                salaryMinOp.addEventListener('change', () => {
                    currentFilters.salaryMinOp = salaryMinOp.value;
                    if (currentFilters.salaryMin) searchJobs(1);
                });
            }

            if (salaryMaxInput) {
                salaryMaxInput.addEventListener('change', () => {
                    currentFilters.salaryMax = salaryMaxInput.value ? parseInt(salaryMaxInput.value) : null;
                    searchJobs(1);
                });
            }

            if (salaryMaxOp) {
                salaryMaxOp.addEventListener('change', () => {
                    currentFilters.salaryMaxOp = salaryMaxOp.value;
                    if (currentFilters.salaryMax) searchJobs(1);
                });
            }

            // Add search functionality
            const searchInputs = document.querySelectorAll('input[placeholder*="từ khóa"]');
            searchInputs.forEach(input => {
                input.addEventListener('input', (e) => {
                    currentFilters.keyword = e.target.value;
                });
                
                input.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        searchJobs(1, true); // fromSearchBar = true
                    }
                });
            });

            // Add location search functionality
            const locationSearchInput = document.querySelector('input[placeholder*="Tỉnh/thành"]');
            if (locationSearchInput) {
                locationSearchInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        searchJobs(1, true); // fromSearchBar = true
                    }
                });
            }

            // Add search button functionality
            document.querySelectorAll('button').forEach(btn => {
                if (btn.textContent.includes('TÌM VIỆC')) {
                    btn.addEventListener('click', () => searchJobs(1, true)); // fromSearchBar = true
                }
                if (btn.textContent.includes('Tìm kiếm')) {
                    btn.addEventListener('click', () => searchJobs(1, true)); // fromSearchBar = true
                }
                if (btn.textContent.includes('Áp dụng bộ lọc')) {
                    btn.addEventListener('click', () => searchJobs(1)); // Keep filters
                }
            });

            // Add sort functionality
            const sortSelect = document.querySelector('select');
            if (sortSelect) {
                sortSelect.addEventListener('change', (e) => {
                    const value = e.target.value;
                    if (value.includes('Mới nhất')) currentFilters.sortBy = 'publishedAt,desc';
                    else if (value.includes('Lương cao')) currentFilters.sortBy = 'salaryMax,desc';
                    else if (value.includes('Lương thấp')) currentFilters.sortBy = 'salaryMin,asc';
                    else if (value.includes('Phù hợp')) currentFilters.sortBy = 'title,asc';
                    
                    searchJobs(1);
                });
            }
        });

        // Make functions globally accessible
        window.searchJobs = searchJobs;
        window.setSalaryPreset = setSalaryPreset;
        window.toggleDropdown = toggleDropdown;
        window.updateRemoteFilter = updateRemoteFilter;

