        import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
        import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
        import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

        // Firebase Initialization
        const appId = typeof __app_id !== 'undefined' ? __app_id : 'fitapp-pwa-default';
        const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
        
        let db, auth;
        if (Object.keys(firebaseConfig).length > 0) {
            const app = initializeApp(firebaseConfig);
            db = getFirestore(app);
            auth = getAuth(app);
            signInAnonymously(auth).catch((error) => console.error("Anonymous sign-in failed: ", error));
        } else {
            console.warn("Firebase config not available. Lead generation functionality will be disabled.");
        }

        // State and DOM elements
        const state = {
            currentPage: 'home'
        };

        const pages = {};

        function renderPage() {
            
            //Hide all pages 
            Object.values(pages).forEach(page => {
                if (page) { 
                    page.classList.add('hidden');
                }
            })

            //Show current page
            if (pages[state.currentPage]) {
                pages[state.currentPage].classList.remove('hidden');
            }
            
            // Update button styles
            document.querySelectorAll('.nav-button').forEach(button => {
                if (button.dataset.page === state.currentPage) {
                    button.classList.remove('hover:bg-gray-100', 'text-purple-600', 'hover:text-purple-600', 'bg-purple-600', 'hover:bg-purple-50');
                    button.classList.add('hover:bg-gray-900', 'bg-gray-900', 'text-white', 'shadow-md');
                } else {
                    button.classList.add('hover:bg-gray-100', 'text-gray-600', 'bg-gray-100');
                    button.classList.remove('hover:bg-gray-900', 'bg-gray-900', 'text-white', 'bg-gray-100', 'text-gray-600', 'bg-purple-600', 'text-purple-600', 'shadow-md');
                }
            });
        }

        function handleNavigation(e) {
            const page = e.currentTarget.dataset.page;
            if (page) {
                state.currentPage = page;
                renderPage();
                // Optionally update URL hash for deep linking (e.g., #notify)
                window.location.hash = page; 
            }
        }

        async function handleLeadSubmission(e) {
            e.preventDefault();
            
            if (!db) {
                 document.getElementById('status-message').textContent = "Database not initialized. Cannot save data.";
                 return;
            }

            const nameInput = document.getElementById('name');
            const emailInput = document.getElementById('email');
            
            const statusMessage = document.getElementById('status-message');

            //Get checkbox input
            const marketingOptInInput = document.getElementById('marketing-opt-in');

            const name = nameInput.value.trim();
            const email = emailInput.value.trim();

            //Selected radio button
            const userTypeElement = document.querySelector('input[name="userType"]:checked');
            const userType = userTypeElement ? userTypeElement.value : null;

            //Checkbox input
            const acceptsMarketing = marketingOptInInput ? marketingOptInInput.checked : false;

            statusMessage.textContent = "Submitting...";
            statusMessage.classList.remove('text-red-500', 'text-green-500');
            
            if (!name || !email || !userType) {
                statusMessage.textContent = "Please fill out missing fields.";
                statusMessage.classList.remove('text-green-500');
                statusMessage.classList.add('text-red-500');
                return;
            }

            try {
                // Public collection for lead generation
                const leadsCollectionRef = collection(db, `artifacts/${appId}/public/data/leads`);
                await addDoc(leadsCollectionRef, {
                    name: name,
                    email: email,
                    userType: userType,
                    acceptsMarketing: acceptsMarketing, 
                    timestamp: new Date()
                });
                
                // Display success message
                statusMessage.textContent = "Success! You've taken the first step to fortify your local wellness network. Get ready! The launch and your exclusive access details are just around the corner.";
                statusMessage.classList.remove('text-red-500');
                statusMessage.classList.add('text-green-500');
                document.getElementById('intake-form').reset();
            } catch (error) {
                console.error("Error adding document: ", error);
                statusMessage.textContent = "Error: Could not submit data. Check connection and try again.";
                statusMessage.classList.remove('text-green-500');
                statusMessage.classList.add('text-red-500');
            }
        }

        // Initial setup on DOM load
document.addEventListener("DOMContentLoaded", function() {
    
    // 1. Hide loading screen (Only if element is found)
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.classList.add('hidden');
    }

    // 2. Map page elements
    pages.home = document.getElementById('home-page');
    pages.notify = document.getElementById('notify-page');
    pages.community = document.getElementById('community-page');

    // 3. Setup form listener (Only if element is found)
    const intakeForm = document.getElementById('intake-form');
    if (intakeForm) {
        // You should check your HTML for the client input ID
        // const clientInput = document.getElementById('client'); 
        // if (!clientInput) console.warn("Missing 'client' input element.");
        
        intakeForm.addEventListener('submit', handleLeadSubmission);
    }
    
    // 4. Setup navigation listeners, check for page element existence, and render
    const tabButtons = document.querySelectorAll('.nav-button');
    
    // Check if ALL core elements are present before proceeding
    const allPagesFound = pages.home && pages.notify && pages.community;

    if (allPagesFound && tabButtons.length > 0) {
        
        tabButtons.forEach(button => {
            button.addEventListener('click', handleNavigation);
        });

        // Check URL hash for initial page state
        const hash = window.location.hash.replace('#', '');
        if (hash && pages[hash]) {
            state.currentPage = hash;
        } else {
            // Set the default to 'notify' as it's the primary lead form
            state.currentPage = 'notify'; 
        }

        // Render the initial page
        renderPage();
    } else {
        console.error("Critical Error: Tab system failed to initialize. Check HTML IDs and classes.");
    }
    
});