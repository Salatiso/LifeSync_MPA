// --- js/shared.js ---

// Firebase SDK imports (Modular v11.x.x)
// These are imported directly in the HTML files that use this shared script.
// This file will assume firebase, auth, db, etc. are globally available after initialization.

// --- Global Variables & Configuration ---
let app;
let auth;
let db;
let storage;
let firebaseInitialized = false;
let currentUserId = null;
let isTempUser = false;
let currentUserData = null; // To cache current user's full data (coreProfile, etc.)

// These global variables __firebase_config and __initial_auth_token are expected to be injected by the Canvas environment.
const firebaseConfigFromGlobal = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : null;
const initialAuthTokenFromGlobal = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;
const appIdFromGlobal = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// --- Firebase Initialization ---
function initializeFirebase() {
    console.log("Attempting Firebase initialization...");
    try {
        if (firebaseConfigFromGlobal && window.firebase) { // Check if firebase global is available
            app = window.firebase.initializeApp(firebaseConfigFromGlobal);
            auth = window.firebase.auth();
            db = window.firebase.firestore();
            storage = window.firebase.storage();
            firebaseInitialized = true;
            console.log("Firebase initialized successfully with dynamic config in shared.js.");

            // Attempt initial sign-in
            attemptInitialSignIn();

            // Set up Auth State Listener
            auth.onAuthStateChanged(handleAuthStateChanged);

        } else {
            console.warn("Firebase configuration or SDK not found. Firebase features will be limited.");
            displayGlobalError("Service configuration missing. Some features may not be available.");
        }
    } catch (error) {
        console.error("Firebase initialization error in shared.js:", error);
        displayGlobalError("Error connecting to services. Some features may not be available.");
    }
}

async function attemptInitialSignIn() {
    if (!auth) return;
    try {
        if (initialAuthTokenFromGlobal) {
            await window.firebase.auth().signInWithCustomToken(auth, initialAuthTokenFromGlobal);
            console.log("Successfully signed in with custom token via shared.js.");
        } else {
            // Check if already signed in (e.g. from a previous session)
            if (!auth.currentUser) {
                 // No custom token and no existing session, consider anonymous or wait for user action
                console.log("No custom token and no active Firebase session. User needs to log in or use temporary profile.");
            } else {
                console.log("User already has an active Firebase session:", auth.currentUser.uid);
            }
        }
    } catch (error) {
        console.error("Error during initial sign-in (custom token or anonymous) in shared.js:", error);
        // If initial sign-in fails, onAuthStateChanged will handle the 'null' user state.
    }
}


function displayGlobalError(message) {
    const body = document.querySelector('body');
    if (!body) return;
    let errorDiv = document.getElementById('globalErrorDiv');
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.id = 'globalErrorDiv';
        errorDiv.style.cssText = "background-color: var(--accent-pink-vibrant); color: var(--text-primary-light); padding: 10px; text-align: center; position: fixed; bottom: 0; width: 100%; z-index: 5000;";
        body.appendChild(errorDiv);
    }
    errorDiv.textContent = message;
}


// --- i18next Internationalization ---
const translations = { // Basic structure, more translations will be in page-specific scripts or loaded externally
    en: {
        translation: {
            title: "LifeSync - Deepen Your Connections",
            nav: { brand: "LifeSync", home: "Home", assessments: "Assessments", tools: "Tools", resources: "Resources", profile: "My Profile", login: "Login", register: "Register", logout: "Logout" },
            footer: { privacy: "Privacy Policy", terms: "Terms of Service", built: "Built with <i class='fa-solid fa-heart' style='color: var(--accent-pink-vibrant)'></i> for LifeSync."},
            notifications: { title: "Notifications", welcome: "Welcome to LifeSync! Complete your profile to get started." },
            search: { button: "Search" },
            alerts: {
                loginSuccess: "Logged in successfully! Welcome back.",
                logoutSuccess: "Logged out successfully!",
                // Add other common alerts
            },
            profile: { // Common profile texts
                guestName: "Guest User",
                guestEmail: "Email: Not logged in",
                typePermanent: "Permanent Account",
                typeTemporary: "Temporary Profile",
                emailTemp: "Email: (Temporary Profile - Not Set)",
                expiresOn: "Expires on:",
                ugqTitleLong: "My Custom Questions"
            }
        }
    },
    // Add other languages as needed
    xh: { translation: { nav: { home: "Ikhaya" } } },
    zu: { translation: { nav: { home: "Ikhaya" } } }
};

if (window.i18next && window.i18nextBrowserLanguageDetector) {
    window.i18next
        .use(window.i18nextBrowserLanguageDetector)
        .init({
            resources: translations,
            fallbackLng: 'en',
            debug: true, // Enable for development
            interpolation: { escapeValue: false }
        }, (err, t) => {
            if (err) return console.error('i18next init error in shared.js:', err);
            console.log("i18next initialized successfully in shared.js.");
            updateUIWithTranslations();
            updateActiveNavLink(); // Update nav link after translations applied
        });
} else {
    console.error("i18next or i18nextBrowserLanguageDetector not loaded.");
}

function updateUIWithTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(elem => {
        const key = elem.getAttribute('data-i18n');
        if (elem.hasAttribute('data-i18n-placeholder')) {
            const placeholderKey = elem.getAttribute('data-i18n-placeholder');
            elem.setAttribute('placeholder', window.i18next.t(placeholderKey));
        }
        if (key) {
            const translation = window.i18next.t(key);
            if (elem.tagName === 'INPUT' && (elem.type === 'submit' || elem.type === 'button')) {
                elem.value = translation; 
            } else {
                elem.innerHTML = translation; 
            }
        }
    });
    const pageTitleElement = document.querySelector('title[data-i18n]');
    if (pageTitleElement) {
        pageTitleElement.textContent = window.i18next.t(pageTitleElement.getAttribute('data-i18n'));
    }
}

// --- DOM Elements (Common) ---
const loadingOverlay = document.getElementById('loadingOverlay');
const navLinksContainer = document.querySelector('nav .nav-links');
const loginBtnNavEl = document.getElementById('loginBtnNav');
const registerBtnNavEl = document.getElementById('registerBtnNav');
const logoutBtnNavEl = document.getElementById('logoutBtnNav');
const navProfileBtnEl = document.getElementById('navProfileBtn');
const languageSelectorEl = document.getElementById('languageSelector');
const globalSearchTriggerBtnEl = document.getElementById('globalSearchTriggerBtn');
const searchModalEl = document.getElementById('searchModal'); // Assuming search modal is common
const notificationsAreaEl = document.getElementById('notificationsArea');

// --- Utility Functions ---
function showLoading(show) {
    if (loadingOverlay) loadingOverlay.style.display = show ? 'flex' : 'none';
}

function sanitizeInput(input) { 
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
}

function showNotification(message, type = 'info', duration = 5000) {
    if (!notificationsAreaEl) { console.warn("Notifications area not found"); return; }
    
    // Clear "welcome" message if it's the only one
    const welcomeMsg = notificationsAreaEl.querySelector('.notification-item[data-i18n="notifications.welcome"]');
    if (welcomeMsg && notificationsAreaEl.children.length === 1) {
        welcomeMsg.remove();
    }

    const notification = document.createElement('div');
    notification.className = `notification-item ${type}`;
    notification.textContent = message;
    notificationsAreaEl.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutNotification 0.5s forwards'; 
        setTimeout(() => notification.remove(), 500);
    }, duration);
}

// --- Modal Management ---
function showModal(modalId) {
    console.log("Showing modal:", modalId);
    const modal = document.getElementById(modalId);
    if(modal) modal.classList.add('active');
}
function closeModal(modalId) {
    console.log("Closing modal:", modalId);
    const modal = document.getElementById(modalId);
    if(modal) modal.classList.remove('active');
}
function closeAllModals() {
    document.querySelectorAll('.modal.active').forEach(modal => modal.classList.remove('active'));
}

// Attach close listeners to all modal close buttons
document.querySelectorAll('.modal .close-button').forEach(button => {
    button.addEventListener('click', (e) => {
        const modal = e.target.closest('.modal');
        if(modal) closeModal(modal.id);
    });
});
// Close modal if clicked outside content
window.addEventListener('click', (event) => {
    document.querySelectorAll('.modal.active').forEach(modal => {
        if (event.target == modal) {
            closeModal(modal.id);
        }
    });
});

// --- Navigation Handling (MPA) ---
function getCurrentPageName() {
    const path = window.location.pathname;
    const page = path.split("/").pop();
    return page === "" ? "index.html" : page; // Default to index.html if path is just '/'
}

function updateActiveNavLink() {
    const currentPage = getCurrentPageName();
    const navLinks = document.querySelectorAll('nav .nav-links a[data-target]'); // Target <a> tags
    
    navLinks.forEach(link => {
        link.classList.remove('active-nav');
        // Match href with current page. For index.html, also match "about" target.
        if (link.getAttribute('href') === currentPage || (currentPage === "index.html" && link.dataset.target === "about")) {
            link.classList.add('active-nav');
        }
    });
    console.log("Active nav link updated for page:", currentPage);
}

// --- Authentication State & UI Update ---
function handleAuthStateChanged(user) {
    showLoading(true);
    console.log("Auth state changed in shared.js. Firebase User:", user ? user.uid : "null");
    const tempProfile = JSON.parse(localStorage.getItem('tempProfile')); 

    if (user && !user.isAnonymous) { // Regular Firebase authenticated user
        loginBtnNavEl.style.display = 'none';
        registerBtnNavEl.style.display = 'none';
        logoutBtnNavEl.style.display = 'inline-block';
        navProfileBtnEl.style.display = 'inline-block';
        navProfileBtnEl.innerHTML = `<i class="fa-solid fa-user-circle"></i> ${user.displayName || i18next.t('nav.profile')}`;
        localStorage.removeItem('tempProfile'); 
        currentUserId = user.uid;
        isTempUser = false;
        fetchAndCacheUserData(user.uid, 'users');
    } else if (tempProfile && tempProfile.id && tempProfile.expiresAt && new Date(tempProfile.expiresAt) > new Date()) { 
        // Active temporary profile
        loginBtnNavEl.style.display = 'none';
        registerBtnNavEl.style.display = 'none';
        logoutBtnNavEl.style.display = 'inline-block'; 
        navProfileBtnEl.style.display = 'inline-block';
        navProfileBtnEl.innerHTML = `<i class="fa-solid fa-user-clock"></i> ${tempProfile.username || i18next.t('nav.profile')}`;
        currentUserId = tempProfile.id;
        isTempUser = true;
        fetchAndCacheUserData(tempProfile.id, `artifacts/${appIdFromGlobal}/public/data/tempProfiles`);
    } else { 
        // Logged out or anonymous Firebase user without a temp profile
        loginBtnNavEl.style.display = 'inline-block';
        registerBtnNavEl.style.display = 'inline-block';
        logoutBtnNavEl.style.display = 'none';
        navProfileBtnEl.style.display = 'none';
        currentUserId = auth?.currentUser?.isAnonymous ? auth.currentUser.uid : null; // Store anonymous UID if applicable
        isTempUser = false;
        currentUserData = null;
        if (tempProfile) localStorage.removeItem('tempProfile'); 
    }
    // Call a function that might be defined on specific pages to update their content
    if (typeof updatePageSpecificContent === 'function') {
        updatePageSpecificContent();
    }
    showLoading(false);
}

async function fetchAndCacheUserData(userId, collectionPath) {
    if (!db || !userId) {
        currentUserData = null;
        if (typeof updatePageSpecificContent === 'function') updatePageSpecificContent();
        return;
    }
    const userDocRef = window.firebase.firestore().doc(db, collectionPath, userId);
    try {
        const docSnap = await window.firebase.firestore().getDoc(userDocRef);
        if (docSnap.exists()) {
            currentUserData = docSnap.data();
            console.log("User data cached:", currentUserData);
        } else {
            console.log("No such user document for caching!");
            currentUserData = null;
        }
    } catch (error) {
        console.error("Error fetching user data for cache:", error);
        currentUserData = null;
    }
    if (typeof updatePageSpecificContent === 'function') {
        updatePageSpecificContent();
    }
}


// --- Global Event Listeners ---
loginBtnNavEl?.addEventListener('click', () => showModal('loginModal'));
registerBtnNavEl?.addEventListener('click', () => showModal('registerModal'));
logoutBtnNavEl?.addEventListener('click', async () => {
    if (!firebaseInitialized || !auth) { showNotification("Service not available.", "error"); return; }
    showLoading(true);
    try {
        if (auth.currentUser && !isTempUser) { // Only sign out Firebase auth if it's not a temp profile session
            await window.firebase.auth().signOut(auth);
        }
        // Always clear temp profile from local storage on any logout action
        localStorage.removeItem('tempProfile');
        currentUserId = null;
        isTempUser = false;
        currentUserData = null; // Clear cached data
        showNotification(i18next.t('alerts.logoutSuccess'), 'info');
        // UI updates will be handled by onAuthStateChanged or manual call if needed
        handleAuthStateChanged(null); // Force UI update for logged out state
        if (getCurrentPageName() !== 'index.html') {
             window.location.href = 'index.html'; // Redirect to home
        } else {
            // If already on home, ensure content is for logged-out state
            if (typeof updatePageSpecificContent === 'function') {
                updatePageSpecificContent();
            }
        }
    } catch (error) {
        console.error("Sign out error", error);
        showNotification("Error signing out: " + error.message, "error");
    } finally {
        showLoading(false);
    }
});

languageSelectorEl?.addEventListener('change', function() {
    if (window.i18next) {
        window.i18next.changeLanguage(this.value, (err, t) => {
            if (err) return console.error('Error changing language in shared.js:', err);
            updateUIWithTranslations();
            // If specific pages need to re-render content based on new lang, they should handle it
            if (typeof initializePageSpecificDynamicContent === 'function') {
                initializePageSpecificDynamicContent();
            }
        });
    }
});

globalSearchTriggerBtnEl?.addEventListener('click', () => showModal('searchModal'));

// Call initializations on script load
document.addEventListener('DOMContentLoaded', () => {
    console.log("shared.js: DOMContentLoaded");
    initializeFirebase(); // Initialize Firebase first

    // The rest of the UI updates will be triggered by onAuthStateChanged or i18next.init callback
    if (window.i18next && !window.i18next.isInitialized) {
        // This is a fallback if i18next didn't init due to timing
        console.warn("i18next was not initialized, attempting now from DOMContentLoaded.");
        window.i18next.init({
            resources: translations, fallbackLng: 'en', debug: true, interpolation: { escapeValue: false }
        }, (err,t) => {
             if (err) return console.error('Fallback i18next init error:', err);
             updateUIWithTranslations();
             updateActiveNavLink();
        });
    } else if (window.i18next && window.i18next.isInitialized) {
        updateUIWithTranslations(); // Apply translations if i18next already loaded
        updateActiveNavLink();
    }

    // Set current year in footer if the element exists on the page
    const yearEl = document.getElementById('currentYearFooter');
    if(yearEl) yearEl.textContent = new Date().getFullYear();
});

// Expose functions that might be needed globally (e.g., by page-specific scripts)
window.LifeSyncShared = {
    showLoading,
    showNotification,
    sanitizeInput,
    showModal,
    closeModal,
    closeAllModals,
    getCurrentPageName,
    updateActiveNavLink,
    getProfileRef, // Make getProfileRef globally accessible
    currentUserId, // Expose for convenience, but manage through auth state
    isTempUser, // Expose for convenience
    appIdFromGlobal, // Expose app ID
    db, // Expose Firestore instance
    auth, // Expose Auth instance
    storage, // Expose Storage instance
    firebaseInitialized, // Expose init status
    currentUserData // Expose cached user data
};


