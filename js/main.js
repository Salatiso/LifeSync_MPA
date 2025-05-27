// Firebase SDK imports (Modular v11.x.x)
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { 
    getAuth, 
    onAuthStateChanged, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    GoogleAuthProvider, 
    signInWithPopup, 
    signOut,
    updateProfile,
    signInAnonymously,
    signInWithCustomToken
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { 
    getFirestore, 
    doc, 
    setDoc, 
    getDoc, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    collection, 
    query, 
    where, 
    getDocs,
    serverTimestamp,
    Timestamp,
    arrayUnion,
    arrayRemove 
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-storage.js";

// Firebase Configuration & Initialization
const firebaseConfigFromGlobal = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : null;
const initialAuthTokenFromGlobal = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;
const appIdFromGlobal = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

let app;
let auth;
let db;
let storage;
let firebaseInitialized = false;
let currentUserId = null;
let isTempUser = false;

try {
    if (firebaseConfigFromGlobal) {
        app = initializeApp(firebaseConfigFromGlobal);
        auth = getAuth(app);
        db = getFirestore(app);
        storage = getStorage(app);
        firebaseInitialized = true;
        console.log("Firebase initialized successfully with dynamic config.");
    } else {
        console.warn("Firebase configuration not found. Firebase features will be limited.");
        const body = document.querySelector('body');
        const errorDiv = document.createElement('div');
        errorDiv.textContent = "Service configuration missing. Some features may not be available.";
        errorDiv.style.cssText = "background-color: var(--accent-pink-vibrant); color: var(--text-primary-light); padding: 10px; text-align: center; position: fixed; bottom: 0; width: 100%; z-index: 5000;";
        if(body) body.appendChild(errorDiv);
    }
} catch (error) {
    console.error("Firebase initialization error:", error);
    const body = document.querySelector('body');
    const errorDiv = document.createElement('div');
    errorDiv.textContent = "Error connecting to services. Some features may not be available.";
    errorDiv.style.cssText = "background-color: var(--accent-pink-vibrant); color: var(--text-primary-light); padding: 10px; text-align: center; position: fixed; bottom: 0; width: 100%; z-index: 5000;";
    if(body) body.appendChild(errorDiv);
}

// i18next Internationalization
const translations = { 
    en: {
        translation: {
            title: "LifeSync - Deepen Your Connections",
            nav: { brand: "LifeSync", home: "Home", assessments: "Assessments", tools: "Tools", resources: "Resources", profile: "My Profile", login: "Login", register: "Register", logout: "Logout" },
            landing: {
                heroTitle: "Beyond the Swipe: Discover True Compatibility",
                heroSubtitle: "LifeSync empowers you to understand yourself and what you truly need in any significant relationship. Build your dynamic, lifelong profile, 'Sync Up' for profound connections, and always be ready for your best relationship journey.",
                heroCta: "Explore Assessments",
                takeAssessmentCta: "Take an Assessment",
                benefitsTitle: "Why LifeSync? The Path to Deeper Understanding.",
                benefitsSubtitle: "LifeSync is more than an app; it's your companion for relationship clarity and growth.",
                benefit1: { title: "Build Your Lifelong Profile", description: "Create a rich, evolving profile that captures your values, preferences, and experiences – your personal relationship blueprint." },
                benefit2: { title: "Understand Yourself Deeper", description: "Engage with 150+ culturally aware questions. Gain personalized insights into your needs and compatibility factors." },
                benefit3: { title: "Ready to 'Sync Up'?", description: "Connect with a partner on a new level. Securely share and compare what truly matters, with full, granular consent." },
                benefitImport: { title: "Seamless Profile Building", description: "Easily import data from existing social/dating profiles or use AI assistance to extract info from documents like your CV. Spend less time typing, more time connecting." },
                getStartedTitle: "Ready to Begin Your Journey?",
                getStartedSubtitle: "Create your free LifeSync profile today and take the first step towards more meaningful connections.",
                registerNow: "Register Your Profile",
                loginExisting: "Login",
                learnMoreClose: "Close"
            },
            assessments: { 
                title: "Discover Your Compatibility",
                subtitle: "Engage with our assessments to gain valuable insights into your relationship dynamics. Assign weights to what matters most to you!",
                quickCompat: { 
                    title: "Quick Compatibility Check",
                    description: "A fast way for you and a potential partner to get an initial feel for alignment. Choose your depth!",
                    basicBtn: "Quick Sync (5 Q's)",
                    intermediateBtn: "Deeper Dive (10 Q's)",
                    advancedBtn: "Full Spectrum (15 Q's)",
                    importanceLabel: "Importance (1-5):",
                    progressQuestion: "Question",
                    progressOf: "of",
                    nextBtn: "Next",
                    resultsTitle: "Quick Sync Results!",
                    retryBtn: "Try Another Level",
                    questions: { 
                        q_financial_stability: "How important is financial stability to you?",
                        q_indoors_outdoors: "Do you prefer spending time indoors or outdoors?",
                        q_personal_space: "How often do you need personal space?",
                        q_spontaneity_planning: "Do you value spontaneity or planning more?",
                        q_family_involvement: "How important is family involvement in your relationship?",
                        q_comm_style: "What's your preferred communication style in disagreements?",
                        q_conflict_resolution: "How do you typically approach conflict resolution?",
                        q_social_circle: "Do you prefer a small, close-knit social circle or a large network?",
                        q_travel_preference: "What's your ideal type of vacation?",
                        q_dietary_habits: "Are you adventurous with food or prefer familiar options?",
                        q_long_term_goals: "What are your primary long-term life goals?",
                        q_parenting_style: "If applicable, what's your general view on parenting styles?",
                        q_spirituality: "How important is spirituality or religion in your life?",
                        q_political_views: "How do you approach differing political views in a partner?",
                        q_cultural_background_match: "How important is a similar cultural background in a partner?"
                    },
                    options: { 
                        opt_not_important: "Not important", opt_somewhat_important: "Somewhat important", opt_very_important: "Very important",
                        opt_indoors: "Indoors", opt_outdoors: "Outdoors", opt_both: "Both equally",
                        opt_rarely: "Rarely", opt_sometimes: "Sometimes", opt_often: "Often",
                        opt_spontaneity: "Spontaneity", opt_planning: "Planning",
                        opt_direct: "Direct & Open", opt_indirect: "Indirect & Cautious",
                        opt_discuss_now: "Discuss immediately", opt_cool_off: "Cool off first",
                        opt_small_circle: "Small circle", opt_large_network: "Large network",
                        opt_relaxing: "Relaxing (beach, spa)", opt_adventure: "Adventure (hiking, exploring)",
                        opt_anything: "Eat anything", opt_specific_diet: "Specific diet/preferences",
                        opt_career_focus: "Career focused", opt_family_focus: "Family focused", opt_balance_both: "Balance both",
                        opt_strict: "Strict", opt_lenient: "Lenient", opt_authoritative: "Authoritative (balanced)",
                        opt_very_spiritual: "Very spiritual/religious", opt_somewhat_spiritual: "Somewhat spiritual/religious", opt_not_spiritual: "Not spiritual/religious",
                        opt_similar_views: "Prefer similar views", opt_differences_ok: "Differences are okay/enriching",
                        opt_important_match: "Important match", opt_not_important_match: "Not an important match"
                    },
                    results: { 
                        completed: "You completed the",
                        checkWith: "compatibility check with",
                        answers: "answers"
                    }
                },
                profileBuilder: { 
                    title: "My Relationship Profile Builder",
                    description: "Build your detailed LifeSync profile by answering these questions about your views, preferences, lifestyle, and more. This forms the basis for future syncs and deeper insights.",
                    q1: "What is your primary love language for GIVING affection?", 
                    questions: { 
                        "profileBuilder.q_love_language_give": "What is your primary love language for GIVING affection?",
                        "profileBuilder.q_love_language_receive": "What is your primary love language for RECEIVING affection?",
                        "profileBuilder.q_financial_transparency_scale": "On a scale of 1 (not at all) to 5 (very), how important is financial transparency to you in a serious relationship?",
                        "profileBuilder.q_stress_handling": "How do you typically handle stress or difficult emotions?",
                        "profileBuilder.q_family_involvement_expectations": "What are your expectations regarding family involvement (e.g., holidays, major decisions)?",
                        "profileBuilder.q_spiritual_beliefs_match_importance": "How important is it for your partner to share your spiritual or religious beliefs?",
                        "profileBuilder.q_children_stance": "What is your stance on having children?",
                        "profileBuilder.q_past_relationships_discussion": "How do you feel about discussing past relationships with a new partner?",
                        "profileBuilder.q_lobola_view": "What role does 'Lobola' (or similar cultural marriage customs) play in your view of marriage, if any?",
                        "profileBuilder.q_household_responsibilities": "How do you envision division of household responsibilities in a cohabiting relationship?"
                    },
                    options: { 
                        words: "Words of Affirmation", acts: "Acts of Service", gifts: "Receiving Gifts", quality_time: "Quality Time", touch: "Physical Touch",
                        "1": "1 (Not at all)", "2": "2", "3": "3 (Moderately)", "4": "4", "5": "5 (Very)",
                        talk_it_out: "Talk it out", alone_time: "Need alone time", distract_myself: "Distract myself", exercise: "Exercise/Activity",
                        very_involved: "Very involved", moderately_involved: "Moderately involved", minimal_involvement: "Minimal involvement",
                        very_important: "Very important", somewhat_important: "Somewhat important", not_important: "Not important",
                        definitely_want: "Definitely want them", open_to_discussion: "Open to discussion", prefer_not: "Prefer not to have children", undecided: "Undecided",
                        open_book: "Open book, happy to share", some_details_ok: "Some details are okay, if relevant", prefer_not_much: "Prefer not to discuss much",
                        essential_tradition: "Essential tradition", important_cultural: "Important cultural aspect", open_to_modern: "Open to modern interpretations/discussion", not_applicable: "Not applicable/relevant to me",
                        strictly_50_50: "Strictly 50/50", based_on_time_skill: "Based on who has more time/skill", flexible_circumstances: "Flexible, depends on circumstances", outsource_some: "Prefer to outsource some tasks"
                    },
                    importanceLabel: "How crucial is this for you? (1-5):",
                    progressQuestion: "Question", progressOf: "of", nextBtn: "Next Question",
                    resultsTitle: "Profile Section Complete!", results: { 
                        completedWith: "You completed your profile builder with",
                        answers: "answers"
                    },
                    reviewBtn: "Review Answers", viewProfileBtn: "View My Profile"
                },
                note: "More in-depth assessments on finances, cultural values (e.g., lobola discussions, family roles), lifestyle, and long-term goals are available once you create your profile and connect with a partner."
            },
            tools: { 
                title: "Relationship Enhancement Tools", 
                subtitle: "Access a suite of tools designed to foster communication, track progress, and navigate challenges together.",
                explore: "Explore Resources",
                communication: {title: "Communication Guides", description: "Structured prompts and guides for discussing sensitive topics like finances, family expectations, and future plans."},
                milestone: { title: "Milestone & Date Tracker", description: "Log important dates, anniversaries, and relationship milestones. Get reminders and celebrate together." },
                monitoring: { title: "Parameter Monitoring", description: "Track changes in key relationship aspects (e.g., frequency of affirming words, shared activities) and get gentle nudges." },
                conflict: { title: "Conflict Resolution Aids", description: "Tools to help navigate disagreements constructively, including structured feedback exchange." },
                goals: { title: "Shared Goals & Dreams", description: "Define and track progress towards shared aspirations as a couple." },
                closure: { title: "Relationship Closure (If Needed)", description: "Tools to facilitate a respectful and clear process if a relationship ends." },
                comingSoon: "Coming Soon" 
            },
            resources: { 
                pageTitle: "Relationship Resources Hub",
                pageSubtitle: "Explore a curated list of tools, services, and information to support your relationship journey.",
                wizard: {
                    title: "Resource Discovery Wizard",
                    introTitle: "How to Use This Section",
                    introText: "Use the search bar below to find specific resources, or browse through the categories. Click on a category to see available items. Automated suggestions based on your profile will be available soon!",
                    automatedIntro: "Based on your profile, we might have some suggestions for you (Feature Coming Soon!).",
                    customizeBtn: "Customize Suggestions (Coming Soon)",
                    searchLabel: "Search All Resources:",
                    searchPlaceholder: "e.g., counseling, dating apps...",
                    searchBtn: "Search",
                    browseCategories: "Or Browse Categories:"
                },
                backToCategories: "Back to Categories",
                visitSite: "Visit Site",
                noItemsInCategory: "No items listed in this category yet.",
                category: { 
                    dating: "Dating & Meeting Platforms",
                    counseling: "Relationship Counseling & Therapy",
                    communication_guides: "Communication Guides",
                    conflict_resolution_aids: "Conflict Resolution Aids",
                    relationship_closure_tools: "Relationship Closure Tools",
                    emergency: "Emergency Contacts Summary"
                },
                datingDesc: { 
                    tinder: "Popular swipe-based dating app for meeting new people.",
                    bumble: "Dating app where women make the first move."
                },
                counselingDesc: {
                    famsa: "Family and Marriage Society of SA - Offers counseling and support."
                },
                emergencyDesc: {
                    lifeLineSAEmergency: "LifeLine SA: 0861 322 322 (24/7 emotional support and crisis intervention)."
                }
            },
            profile: { 
                title: "My LifeSync Profile", 
                subtitle: "This is your personal space. Manage your details, track your progress, and control your sharing preferences.",
                completionTitle: "Profile Completion",
                completionHint: "Complete your profile to unlock more insights and features!",
                uploadPicture: "Upload Picture",
                avatarComingSoon: "(Avatars coming soon)",
                makePublic: "Make Profile Public (to registered users)",
                basicInfoTitle: "Basic Information",
                dobLabel: "Date of Birth:",
                genderLabel: "Gender:",
                selectOption: "Select...",
                genderMale: "Male", genderFemale: "Female", genderNonBinary: "Non-binary", genderOther: "Other", genderPreferNot: "Prefer not to say",
                locationLabel: "Location (City, Country):",
                locationPlaceholder: "e.g., Johannesburg, South Africa",
                lifestyleTitle: "Lifestyle & Interests",
                hobbiesLabel: "Hobbies & Interests (comma-separated):",
                hobbiesPlaceholder: "e.g., hiking, reading, coding",
                educationLabel: "Education Level:",
                educationPlaceholder: "e.g., Bachelor's Degree in CS",
                occupationLabel: "Occupation/Profession:",
                occupationPlaceholder: "e.g., Software Developer",
                aboutMeLabel: "About Me (Short Bio):",
                aboutMePlaceholder: "Tell us a bit about yourself...",
                saveProfileBtn: "Save Profile Details",
                assessmentsTitle: "Completed Assessments:", 
                partnersTitle: "Synced Partners:", 
                noPartners: "No partner synced yet.", 
                connectBtn: "Connect with Partner", 
                dataTitle: "Assessment Profile Data & Preferences:", 
                dataNote: "This section shows data from your completed assessments.",
                importTitle: "Import Your Data:", 
                importInstructionsSocial: "Upload your data file (e.g., LinkedIn ZIP, Facebook JSON) to enhance your profile.", 
                importBtnSocial: "Import Social/Dating Data",
                importInstructionsAI: "Use AI to extract info from documents (e.g., CV). Process externally, then upload the generated JSON.",
                aiUploadLabel: "Upload AI-Processed JSON:",
                importBtnAI: "Import AI Processed Data",
                aiToolNote: "Note: Use tools like Gemini, Grok, etc., to process your documents into a structured JSON first.",
                loadingAssessments: "Loading assessments...", 
                loadingData: "Loading data...",
                typePermanent: "Permanent Account", 
                typeTemporary: "Temporary Profile",
                emailTemp: "Email: (Temporary Profile - Not Set)",
                expiresOn: "Expires on:",
                guestName: "Guest User",
                guestEmail: "Email: Not logged in",
                noAssessmentsLoggedIn: "Log in or create a profile to see completed assessments.",
                noDataLoggedIn: "Log in or create a profile to see your data.",
                noAssessmentsYet: "No assessments completed yet. Explore the Assessments tab!",
                noProfileDataYet: "No profile data added yet. Complete assessments or import data.",
                completedOn: "Completed on",
                ugqTitle: "My Custom Questions", 
                ugqTitleLong: "My Questions", 
                ugqCreateTitle: "Create a New Question",
                ugqQuestionLabel: "Your Question:",
                ugqQuestionPlaceholder: "e.g., What's your ideal Sunday?",
                ugqAnswerLabel: "Your Answer:",
                ugqAnswerPlaceholder: "e.g., A mix of adventure and relaxation.",
                ugqCategoryLabel: "Category (Optional):",
                ugqCategoryPlaceholder: "e.g., Lifestyle, Values",
                ugqSaveBtn: "Save Question",
                ugqNone: "You haven't added any custom questions yet."
            },
            ugq: { 
                subtitle: "Create your own questions to explore specific areas of compatibility that matter most to you and your partner.",
                privateLabel: "Keep this question private (only visible to you and synced partners you share with)",
                yourQuestionsTitle: "Your Created Questions"
            },
            sync: { 
                title: "Couple Sync",
                subtitle: "Connect with your partner to share insights and grow together. All sharing requires mutual consent.",
                connectTitle: "Connect with Partner",
                partnerUsernameLabel: "Partner's Username:",
                partnerUsernamePlaceholder: "Enter your partner's LifeSync username",
                sendRequest: "Send Sync Request",
                pendingTitle: "Pending Requests",
                noPending: "No pending requests.",
                syncedTitle: "Synced Partners",
                noSynced: "You are not synced with any partners yet."
            },
            notifications: { title: "Notifications", welcome: "Welcome to LifeSync! Complete your profile to get started." },
            footer: { privacy: "Privacy Policy", terms: "Terms of Service", built: "Built with <i class='fa-solid fa-heart' style='color: var(--accent-pink-vibrant)'></i> for LifeSync."},
            login: { 
                title: "Login to LifeSync", 
                subtitle: "Access your profile, assessments, and synced data.",
                emailLabel: "Email:", emailPlaceholder: "your@email.com",
                passwordLabel: "Password:", passwordPlaceholder: "Your password",
                submit: "Login", google: "Login with Google",
                tempProfilePrompt: "Don't want to sign in? Try LifeSync with a temporary profile:",
                tempProfileBtn: "Create Temporary Profile", loginTempProfileBtn: "Login with Temporary Code"
            },
            register: { 
                title: "Create Your LifeSync Account",
                subtitle: "Start building your insightful relationship profile.",
                nameLabel: "Name:", namePlaceholder: "Your Name",
                emailLabel: "Email:", emailPlaceholder: "your@email.com",
                passwordLabel: "Password:", passwordPlaceholder: "Create a password (min. 6 characters)",
                submit: "Register", google: "Register with Google"
            },
            tempProfile: { 
                title: "Create Temporary Profile",
                subtitle: "Create a temporary profile to explore LifeSync for 90 days.",
                usernameLabel: "Username:", usernamePlaceholder: "Choose a username",
                createBtn: "Create Profile & Get Code",
                codeInstructions: "Your temporary profile has been created! Use this code to log in:",
                expiryNote: "This profile will expire in 90 days. Save your username and code securely!",
                gotItBtn: "I've Saved It!"
            },
            tempProfileLogin: { 
                title: "Login with Temporary Profile",
                usernameLabel: "Username:", usernamePlaceholder: "Your username",
                codeLabel: "Code:", codePlaceholder: "Your access code",
                submit: "Login"
            },
            search: { 
                title: "Search LifeSync",
                placeholder: "Search profiles, assessments, resources...",
                submit: "Search",
                button: "Search" 
            },
            alerts: { 
                selectionNeeded: "Please select an answer to proceed.",
                loginSuccess: "Logged in successfully! Welcome back.",
                loginFailed: "Login failed. Please check your email and password.",
                registerSuccess: "Registered successfully! Please log in to continue.",
                registerFailed: "Registration failed. The email might already be in use or an error occurred.",
                tempProfileCreated: "Temporary profile created! Your access code is displayed below. Please save it securely.",
                tempProfileLoginSuccess: "Logged in with temporary profile successfully!",
                tempProfileLoginFailed: "Invalid username or code. Please check and try again.",
                tempProfileExpired: "This temporary profile has expired. Please register for a permanent account.",
                importSuccess: "Social media data imported successfully! Check your profile.",
                importFailed: "Failed to import data. Please ensure the file format is correct or try again.",
                aiImportSuccess: "AI processed data imported successfully!",
                aiImportFailed: "Failed to import AI processed data. Ensure it's valid JSON from LifeSync AI processing.",
                logoutSuccess: "Logged out successfully!",
                selectFileFirst: "Please select a file first before importing.",
                processingFile: "Processing file...",
                zipParsingNotImplemented: "ZIP file processing is not fully implemented in this example. Please try a JSON file if available.",
                unsupportedFileFormat: "Unsupported file format. Please upload a JSON file.",
                fileReadError: "Error reading the selected file.",
                noActiveProfileForImport: "No active profile to import data to. Please log in or create a temporary profile first.",
                loginToImport: "Please log in or create a temporary profile to import data.",
                ugqSaved: "Your custom question has been saved!",
                ugqError: "Error saving custom question. Please try again.",
                ugqFieldsMissing: "Please fill in both the question and your answer.",
                profileDetailsSaved: "Profile details saved successfully!",
                profileDetailsError: "Error saving profile details.",
                imageUploadSuccess: "Profile image uploaded successfully!",
                imageUploadError: "Error uploading profile image."
            }
        }
    },
    xh: { /* ... Xhosa translations ... */ },
    zu: { /* ... Zulu translations ... */ },
    af: { /* ... Afrikaans translations ... */ }
};

i18next
    .use(i18nextBrowserLanguageDetector)
    .init({
        resources: translations,
        fallbackLng: 'en',
        debug: true,
        interpolation: { escapeValue: false }
    }, (err, t) => {
        if (err) return console.error('i18next init error:', err);
        updateUIWithTranslations();
        initializeDynamicContent();
    });

function updateUIWithTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(elem => {
        const key = elem.getAttribute('data-i18n');
        if (elem.hasAttribute('data-i18n-placeholder')) {
            const placeholderKey = elem.getAttribute('data-i18n-placeholder');
            elem.setAttribute('placeholder', i18next.t(placeholderKey));
        }
        if (key) {
            const translation = i18next.t(key);
            if (elem.tagName === 'INPUT' && (elem.type === 'submit' || elem.type === 'button')) {
                elem.value = translation;
            } else {
                elem.innerHTML = translation;
            }
        }
    });
    const pageTitleElement = document.querySelector('title[data-i18n]');
    if (pageTitleElement) {
        pageTitleElement.textContent = i18next.t(pageTitleElement.getAttribute('data-i18n'));
    }
}

document.getElementById('languageSelector')?.addEventListener('change', function() {
    i18next.changeLanguage(this.value, (err, t) => {
        if (err) return console.error('Error changing language:', err);
        updateUIWithTranslations();
        initializeDynamicContent();
    });
});

// Global Variables & DOM Elements
const loginBtnNavEl = document.getElementById('loginBtnNav');
const registerBtnNavEl = document.getElementById('registerBtnNav');
const logoutBtnNavEl = document.getElementById('logoutBtnNav');
const navProfileBtnEl = document.getElementById('navProfileBtn');
const loginModalEl = document.getElementById('loginModal');
const registerModalEl = document.getElementById('registerModal');
const tempProfileModalEl = document.getElementById('tempProfileModal');
const tempProfileLoginModalEl = document.getElementById('tempProfileLoginModal');
const searchModalEl = document.getElementById('searchModal');
const benefitModalEl = document.getElementById('benefitModal');
const benefitModalTitleEl = document.getElementById('benefitModalTitle');
const benefitModalDescriptionEl = document.getElementById('benefitModalDescription');
const currentYearFooterEl = document.getElementById('currentYearFooter');
const loadingOverlay = document.getElementById('loadingOverlay');

if(currentYearFooterEl) currentYearFooterEl.textContent = new Date().getFullYear();

// Utility Functions
function showLoading(show) {
    if (loadingOverlay) loadingOverlay.style.display = show ? 'flex' : 'none';
}

function sanitizeInput(input) {
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
}

// Highlight Active Nav Link
function highlightActiveNavLink() {
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('nav .nav-links a');
    navLinks.forEach(link => {
        const href = link.getAttribute('href').split('/').pop();
        if (href === currentPath) {
            link.classList.add('active-nav');
        } else {
            link.classList.remove('active-nav');
        }
    });
}

// Modal Management
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if(modal) modal.classList.add('active');
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if(modal) modal.classList.remove('active');
}

function closeAllModals() {
    document.querySelectorAll('.modal.active').forEach(modal => modal.classList.remove('active'));
}

document.querySelectorAll('.modal .close-button').forEach(button => {
    button.addEventListener('click', (e) => {
        const modal = e.target.closest('.modal');
        if(modal) closeModal(modal.id);
    });
});

document.getElementById('benefitModalCloseBtn')?.addEventListener('click', () => closeModal('benefitModal'));

window.addEventListener('click', (event) => {
    document.querySelectorAll('.modal.active').forEach(modal => {
        if (event.target == modal) {
            closeModal(modal.id);
        }
    });
});

loginBtnNavEl?.addEventListener('click', () => showModal('loginModal'));
registerBtnNavEl?.addEventListener('click', () => showModal('registerModal'));
document.getElementById('createTempProfileFromLoginModalBtn')?.addEventListener('click', () => { closeModal('loginModal'); showModal('tempProfileModal'); });
document.getElementById('loginWithTempProfileModalBtn')?.addEventListener('click', () => { closeModal('loginModal'); showModal('tempProfileLoginModal'); });
document.getElementById('globalSearchTriggerBtn')?.addEventListener('click', () => showModal('searchModal'));
document.getElementById('tempProfileGotItBtn')?.addEventListener('click', () => closeModal('tempProfileModal'));

// Notifications
const notificationsAreaEl = document.getElementById('notificationsArea');
function showNotification(message, type = 'info', duration = 5000) {
    if (!notificationsAreaEl) { console.warn("Notifications area not found"); return; }
    const notification = document.createElement('div');
    notification.className = `notification-item ${type}`;
    notification.textContent = message;
    notificationsAreaEl.appendChild(notification);
    setTimeout(() => {
        notification.style.animation = 'slideOutNotification 0.5s forwards';
        setTimeout(() => notification.remove(), 500);
    }, duration);
}

// Authentication Logic
function updateUIForLoggedOutUser() {
    if(loginBtnNavEl) loginBtnNavEl.style.display = 'inline-block';
    if(registerBtnNavEl) registerBtnNavEl.style.display = 'inline-block';
    if(logoutBtnNavEl) logoutBtnNavEl.style.display = 'none';
    if(navProfileBtnEl) navProfileBtnEl.style.display = 'none';
    if(navProfileBtnEl) navProfileBtnEl.innerHTML = `<i class="fa-solid fa-user-edit"></i> <span data-i18n="nav.profile">${i18next.t('nav.profile')}</span>`;
    currentUserId = null;
    isTempUser = false;
    updateProfileDisplay();
}

function updateUIForTempUser(tempProfile) {
    if(loginBtnNavEl) loginBtnNavEl.style.display = 'none';
    if(registerBtnNavEl) registerBtnNavEl.style.display = 'none';
    if(logoutBtnNavEl) logoutBtnNavEl.style.display = 'inline-block';
    if(navProfileBtnEl) navProfileBtnEl.style.display = 'inline-block';
    if(navProfileBtnEl) navProfileBtnEl.innerHTML = `<i class="fa-solid fa-user-clock"></i> ${tempProfile.username || i18next.t('nav.profile')}`;
    currentUserId = tempProfile.id;
    isTempUser = true;
    updateProfileDisplay();
}

if (firebaseInitialized && auth) {
    (async () => {
        try {
            if (initialAuthTokenFromGlobal) {
                await signInWithCustomToken(auth, initialAuthTokenFromGlobal);
                console.log("Successfully signed in with custom token.");
            } else {
                await signInAnonymously(auth);
                console.log("Signed in anonymously as __initial_auth_token was not available.");
            }
        } catch (error) {
            console.error("Error during initial sign-in (custom token or anonymous):", error);
        }
    })();

    onAuthStateChanged(auth, user => {
        showLoading(true);
        console.log("Auth state changed. Firebase User:", user ? user.uid : "null");
        const tempProfile = JSON.parse(localStorage.getItem('tempProfile'));

        if (user) {
            if(loginBtnNavEl) loginBtnNavEl.style.display = 'none';
            if(registerBtnNavEl) registerBtnNavEl.style.display = 'none';
            if(logoutBtnNavEl) logoutBtnNavEl.style.display = 'inline-block';
            if(navProfileBtnEl) navProfileBtnEl.style.display = 'inline-block';
            if(navProfileBtnEl) navProfileBtnEl.innerHTML = `<i class="fa-solid fa-user-circle"></i> ${user.displayName || i18next.t('nav.profile')}`;
            localStorage.removeItem('tempProfile');
            currentUserId = user.uid;
            isTempUser = false;
            closeAllModals();
        } else if (tempProfile && tempProfile.id && tempProfile.expiresAt && new Date(tempProfile.expiresAt) > new Date()) {
            updateUIForTempUser(tempProfile);
        } else {
            updateUIForLoggedOutUser();
            if (tempProfile) localStorage.removeItem('tempProfile');
        }
        updateProfileDisplay();
        initializeDynamicContent();
        showLoading(false);
    });
} else {
    console.warn("Firebase Auth not initialized. Auth features will be limited.");
    updateUIForLoggedOutUser();
    showLoading(false);
}

document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!firebaseInitialized) {
        showNotification(i18next.t('alerts.loginFailed'), 'error');
        return;
    }
    showLoading(true);
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    try {
        await signInWithEmailAndPassword(auth, email, password);
        showNotification(i18next.t('alerts.loginSuccess'), 'success');
        closeModal('loginModal');
    } catch (error) {
        console.error("Login error:", error);
        showNotification(i18next.t('alerts.loginFailed'), 'error');
    } finally {
        showLoading(false);
    }
});

document.getElementById('loginWithGoogleBtn')?.addEventListener('click', async () => {
    if (!firebaseInitialized) {
        showNotification(i18next.t('alerts.loginFailed'), 'error');
        return;
    }
    showLoading(true);
    const provider = new GoogleAuthProvider();
    try {
        await signInWithPopup(auth, provider);
        showNotification(i18next.t('alerts.loginSuccess'), 'success');
        closeModal('loginModal');
    } catch (error) {
        console.error("Google login error:", error);
        showNotification(i18next.t('alerts.loginFailed'), 'error');
    } finally {
        showLoading(false);
    }
});

document.getElementById('registerForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!firebaseInitialized) {
        showNotification(i18next.t('alerts.registerFailed'), 'error');
        return;
    }
    showLoading(true);
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
        await setDoc(doc(db, 'users', userCredential.user.uid), {
            name: name,
            email: email,
            createdAt: serverTimestamp(),
            profileCompletion: 0
        });
        showNotification(i18next.t('alerts.registerSuccess'), 'success');
        closeModal('registerModal');
    } catch (error) {
        console.error("Register error:", error);
        showNotification(i18next.t('alerts.registerFailed'), 'error');
    } finally {
        showLoading(false);
    }
});

document.getElementById('registerWithGoogleBtn')?.addEventListener('click', async () => {
    if (!firebaseInitialized) {
        showNotification(i18next.t('alerts.registerFailed'), 'error');
        return;
    }
    showLoading(true);
    const provider = new GoogleAuthProvider();
    try {
        const userCredential = await signInWithPopup(auth, provider);
        await setDoc(doc(db, 'users', userCredential.user.uid), {
            name: userCredential.user.displayName,
            email: userCredential.user.email,
            createdAt: serverTimestamp(),
            profileCompletion: 0
        }, { merge: true });
        showNotification(i18next.t('alerts.registerSuccess'), 'success');
        closeModal('registerModal');
    } catch (error) {
        console.error("Google register error:", error);
        showNotification(i18next.t('alerts.registerFailed'), 'error');
    } finally {
        showLoading(false);
    }
});

document.getElementById('tempProfileForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    showLoading(true);
    const username = sanitizeInput(document.getElementById('tempUsername').value);
    if (!username) {
        showNotification('Please enter a username.', 'error');
        showLoading(false);
        return;
    }
    try {
        const tempProfileRef = doc(collection(db, 'tempProfiles'));
        const code = Math.random().toString(36).substring(2, 8).toUpperCase();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 90);
        const tempProfile = {
            id: tempProfileRef.id,
            username: username,
            code: code,
            createdAt: serverTimestamp(),
            expiresAt: Timestamp.fromDate(expiresAt),
            appId: appIdFromGlobal
        };
        await setDoc(tempProfileRef, tempProfile);
        localStorage.setItem('tempProfile', JSON.stringify(tempProfile));
        currentUserId = tempProfile.id;
        isTempUser = true;
        updateUIForTempUser(tempProfile);
        document.getElementById('tempProfileCode').textContent = code;
        document.getElementById('tempProfileCodeSection').style.display = 'block';
        showNotification(i18next.t('alerts.tempProfileCreated'), 'success');
    } catch (error) {
        console.error("Temp profile creation error:", error);
        showNotification(i18next.t('alerts.tempProfileFailed'), 'error');
    } finally {
        showLoading(false);
    }
});

document.getElementById('tempProfileLoginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    showLoading(true);
    const username = sanitizeInput(document.getElementById('tempLoginUsername').value);
    const code = document.getElementById('tempLoginCode').value;
    try {
        const q = query(collection(db, 'tempProfiles'), where('username', '==', username), where('code', '==', code));
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
            showNotification(i18next.t('alerts.tempProfileLoginFailed'), 'error');
            showLoading(false);
            return;
        }
        const tempProfile = querySnapshot.docs[0].data();
        if (new Date(tempProfile.expiresAt.toDate()) < new Date()) {
            showNotification(i18next.t('alerts.tempProfileExpired'), 'error');
            await deleteDoc(doc(db, 'tempProfiles', querySnapshot.docs[0].id));
            showLoading(false);
            return;
        }
        localStorage.setItem('tempProfile', JSON.stringify(tempProfile));
        currentUserId = tempProfile.id;
        isTempUser = true;
        updateUIForTempUser(tempProfile);
        showNotification(i18next.t('alerts.tempProfileLoginSuccess'), 'success');
        closeModal('tempProfileLoginModal');
    } catch (error) {
        console.error("Temp profile login error:", error);
        showNotification(i18next.t('alerts.tempProfileLoginFailed'), 'error');
    } finally {
        showLoading(false);
    }
});

logoutBtnNavEl?.addEventListener('click', async () => {
    showLoading(true);
    try {
        if (firebaseInitialized && auth.currentUser) {
            await signOut(auth);
        }
        localStorage.removeItem('tempProfile');
        updateUIForLoggedOutUser();
        showNotification(i18next.t('alerts.logoutSuccess'), 'success');
    } catch (error) {
        console.error("Logout error:", error);
        showNotification('Error logging out.', 'error');
    } finally {
        showLoading(false);
    }
});

// Assessments Logic
let currentAssessment = null;
let currentQuestionIndex = 0;
let userAnswers = [];

function startQuickCompat(level) {
    const questionCounts = { basic: 5, intermediate: 10, advanced: 15 };
    const questionKeys = Object.keys(i18next.t('assessments.quickCompat.questions', { returnObjects: true }));
    const selectedQuestions = questionKeys.sort(() => Math.random() - 0.5).slice(0, questionCounts[level]);
    currentAssessment = {
        type: 'quickCompat',
        level: level,
        questions: selectedQuestions,
        answers: []
    };
    currentQuestionIndex = 0;
    userAnswers = [];
    displayQuickCompatQuestion();
}

function displayQuickCompatQuestion() {
    if (!currentAssessment || currentQuestionIndex >= currentAssessment.questions.length) {
        showQuickCompatResults();
        return;
    }
    const questionKey = currentAssessment.questions[currentQuestionIndex];
    const questionText = i18next.t(`assessments.quickCompat.questions.${questionKey}`);
    const options = getQuickCompatOptions(questionKey);
    const container = document.getElementById('quickCompatAssessmentArea');
    if (!container) return;
    container.innerHTML = `
        <div class="assessment-container">
            <h3 data-i18n="assessments.quickCompat.title">${i18next.t('assessments.quickCompat.title')}</h3>
            <div class="progress-bar-container">
                <span class="progress-bar-fill" style="width: ${(currentQuestionIndex / currentAssessment.questions.length) * 100}%">
                    ${i18next.t('assessments.quickCompat.progressQuestion')} ${currentQuestionIndex + 1} ${i18next.t('assessments.quickCompat.progressOf')} ${currentAssessment.questions.length}
                </span>
            </div>
            <div class="assessment-question">
                <p>${questionText}</p>
                <div class="assessment-options"></div>
                <div class="weight-slider">
                    <label>${i18next.t('assessments.quickCompat.importanceLabel')}</label>
                    <input type="range" min="1" max="5" value="3" class="weight-input">
                    <span class="weight-value">3</span>
                </div>
                <div class="assessment-feedback"></div>
                <button class="btn btn-primary mt-3" onclick="submitQuickCompatAnswer()">${i18next.t('assessments.quickCompat.nextBtn')}</button>
            </div>
        </div>
    `;
    const optionsContainer = container.querySelector('.assessment-options');
    options.forEach(option => {
        const button = document.createElement('button');
        button.textContent = option.text;
        button.dataset.value = option.value;
        button.addEventListener('click', () => {
            optionsContainer.querySelectorAll('button').forEach(btn => btn.classList.remove('selected'));
            button.classList.add('selected');
        });
        optionsContainer.appendChild(button);
    });
    container.querySelector('.weight-input').addEventListener('input', (e) => {
        container.querySelector('.weight-value').textContent = e.target.value;
    });
}

function getQuickCompatOptions(questionKey) {
    const optionsMap = {
        q_financial_stability: ['opt_not_important', 'opt_somewhat_important', 'opt_very_important'],
        q_indoors_outdoors: ['opt_indoors', 'opt_outdoors', 'opt_both'],
        q_personal_space: ['opt_rarely', 'opt_sometimes', 'opt_often'],
        q_spontaneity_planning: ['opt_spontaneity', 'opt_planning'],
        q_family_involvement: ['opt_not_important', 'opt_somewhat_important', 'opt_very_important'],
        q_comm_style: ['opt_direct', 'opt_indirect'],
        q_conflict_resolution: ['opt_discuss_now', 'opt_cool_off'],
        q_social_circle: ['opt_small_circle', 'opt_large_network'],
        q_travel_preference: ['opt_relaxing', 'opt_adventure'],
        q_dietary_habits: ['opt_anything', 'opt_specific_diet'],
        q_long_term_goals: ['opt_career_focus', 'opt_family_focus', 'opt_balance_both'],
        q_parenting_style: ['opt_strict', 'opt_lenient', 'opt_authoritative'],
        q_spirituality: ['opt_very_spiritual', 'opt_somewhat_spiritual', 'opt_not_spiritual'],
        q_political_views: ['opt_similar_views', 'opt_differences_ok'],
        q_cultural_background_match: ['opt_important_match', 'opt_not_important_match']
    };
    return optionsMap[questionKey].map(key => ({
        value: key,
        text: i18next.t(`assessments.quickCompat.options.${key}`)
    }));
}

window.submitQuickCompatAnswer = function() {
    const container = document.getElementById('quickCompatAssessmentArea');
    const selectedOption = container.querySelector('.assessment-options button.selected');
    const weight = parseInt(container.querySelector('.weight-input').value);
    if (!selectedOption) {
        showNotification(i18next.t('alerts.selectionNeeded'), 'error');
        return;
    }
    userAnswers.push({
        question: currentAssessment.questions[currentQuestionIndex],
        answer: selectedOption.dataset.value,
        weight: weight
    });
    currentQuestionIndex++;
    displayQuickCompatQuestion();
};

function showQuickCompatResults() {
    const container = document.getElementById('quickCompatAssessmentArea');
    if (!container) return;
    container.innerHTML = `
        <div class="assessment-container">
            <h3 data-i18n="assessments.quickCompat.resultsTitle">${i18next.t('assessments.quickCompat.resultsTitle')}</h3>
            <p>${i18next.t('assessments.quickCompat.results.completed')} ${currentAssessment.level} ${i18next.t('assessments.quickCompat.results.checkWith')} ${userAnswers.length} ${i18next.t('assessments.quickCompat.results.answers')}</p>
            <ul>
                ${userAnswers.map(a => `
                    <li>
                        <strong>${i18next.t(`assessments.quickCompat.questions.${a.question}`)}</strong>: 
                        ${i18next.t(`assessments.quickCompat.options.${a.answer}`)} (Weight: ${a.weight})
                    </li>
                `).join('')}
            </ul>
            <button class="btn btn-primary mt-3" onclick="startQuickCompat('${currentAssessment.level}')">${i18next.t('assessments.quickCompat.retryBtn')}</button>
        </div>
    `;
    if (firebaseInitialized && currentUserId) {
        saveAssessmentResults('quickCompat', currentAssessment.level, userAnswers);
    }
}

async function saveAssessmentResults(type, level, answers) {
    if (!firebaseInitialized || !currentUserId) return;
    try {
        const collectionName = isTempUser ? 'tempProfiles' : 'users';
        const assessmentData = {
            type: type,
            level: level,
            answers: answers,
            completedAt: serverTimestamp()
        };
        await addDoc(collection(db, collectionName, currentUserId, 'assessments'), assessmentData);
    } catch (error) {
        console.error("Error saving assessment:", error);
    }
}

document.getElementById('quickCompatBasicBtn')?.addEventListener('click', () => startQuickCompat('basic'));
document.getElementById('quickCompatIntermediateBtn')?.addEventListener('click', () => startQuickCompat('intermediate'));
document.getElementById('quickCompatAdvancedBtn')?.addEventListener('click', () => startQuickCompat('advanced'));

// Profile Builder
function startProfileBuilder() {
    const questionKeys = Object.keys(i18next.t('assessments.profileBuilder.questions', { returnObjects: true }));
    currentAssessment = {
        type: 'profileBuilder',
        questions: questionKeys,
        answers: []
    };
    currentQuestionIndex = 0;
    userAnswers = [];
    displayProfileBuilderQuestion();
}

function displayProfileBuilderQuestion() {
    if (!currentAssessment || currentQuestionIndex >= currentAssessment.questions.length) {
        showProfileBuilderResults();
        return;
    }
    const questionKey = currentAssessment.questions[currentQuestionIndex];
    const questionText = i18next.t(`assessments.profileBuilder.questions.${questionKey}`);
    const options = getProfileBuilderOptions(questionKey);
    const container = document.getElementById('profileBuilderAssessmentArea');
    if (!container) return;
    container.innerHTML = `
        <div class="assessment-container">
            <h3 data-i18n="assessments.profileBuilder.title">${i18next.t('assessments.profileBuilder.title')}</h3>
            <div class="progress-bar-container">
                <span class="progress-bar-fill" style="width: ${(currentQuestionIndex / currentAssessment.questions.length) * 100}%">
                    ${i18next.t('assessments.profileBuilder.progressQuestion')} ${currentQuestionIndex + 1} ${i18next.t('assessments.profileBuilder.progressOf')} ${currentAssessment.questions.length}
                </span>
            </div>
            <div class="assessment-question">
                <p>${questionText}</p>
                <div class="assessment-options"></div>
                <div class="weight-slider">
                    <label>${i18next.t('assessments.profileBuilder.importanceLabel')}</label>
                    <input type="range" min="1" max="5" value="3" class="weight-input">
                    <span class="weight-value">3</span>
                </div>
                <div class="assessment-feedback"></div>
                <button class="btn btn-primary mt-3" onclick="submitProfileBuilderAnswer()">${i18next.t('assessments.profileBuilder.nextBtn')}</button>
            </div>
        </div>
    `;
    const optionsContainer = container.querySelector('.assessment-options');
    options.forEach(option => {
        const button = document.createElement('button');
        button.textContent = option.text;
        button.dataset.value = option.value;
        button.addEventListener('click', () => {
            optionsContainer.querySelectorAll('button').forEach(btn => btn.classList.remove('selected'));
            button.classList.add('selected');
        });
        optionsContainer.appendChild(button);
    });
    container.querySelector('.weight-input').addEventListener('input', (e) => {
        container.querySelector('.weight-value').textContent = e.target.value;
    });
}

function getProfileBuilderOptions(questionKey) {
    const optionsMap = {
        'profileBuilder.q_love_language_give': ['words', 'acts', 'gifts', 'quality_time', 'touch'],
        'profileBuilder.q_love_language_receive': ['words', 'acts', 'gifts', 'quality_time', 'touch'],
        'profileBuilder.q_financial_transparency_scale': ['1', '2', '3', '4', '5'],
        'profileBuilder.q_stress_handling': ['talk_it_out', 'alone_time', 'distract_myself', 'exercise'],
        'profileBuilder.q_family_involvement_expectations': ['very_involved', 'moderately_involved', 'minimal_involvement'],
        'profileBuilder.q_spiritual_beliefs_match_importance': ['very_important', 'somewhat_important', 'not_important'],
        'profileBuilder.q_children_stance': ['definitely_want', 'open_to_discussion', 'prefer_not', 'undecided'],
        'profileBuilder.q_past_relationships_discussion': ['open_book', 'some_details_ok', 'prefer_not_much'],
        'profileBuilder.q_lobola_view': ['essential_tradition', 'important_cultural', 'open_to_modern', 'not_applicable'],
        'profileBuilder.q_household_responsibilities': ['strictly_50_50', 'based_on_time_skill', 'flexible_circumstances', 'outsource_some']
    };
    return optionsMap[questionKey].map(key => ({
        value: key,
        text: i18next.t(`assessments.profileBuilder.options.${key}`)
    }));
}

window.submitProfileBuilderAnswer = function() {
    const container = document.getElementById('profileBuilderAssessmentArea');
    const selectedOption = container.querySelector('.assessment-options button.selected');
    const weight = parseInt(container.querySelector('.weight-input').value);
    if (!selectedOption) {
        showNotification(i18next.t('alerts.selectionNeeded'), 'error');
        return;
    }
    userAnswers.push({
        question: currentAssessment.questions[currentQuestionIndex],
        answer: selectedOption.dataset.value,
        weight: weight
    });
    currentQuestionIndex++;
    displayProfileBuilderQuestion();
};

function showProfileBuilderResults() {
    const container = document.getElementById('profileBuilderAssessmentArea');
    if (!container) return;
    container.innerHTML = `
        <div class="assessment-container">
            <h3 data-i18n="assessments.profileBuilder.resultsTitle">${i18next.t('assessments.profileBuilder.resultsTitle')}</h3>
            <p>${i18next.t('assessments.profileBuilder.results.completedWith')} ${userAnswers.length} ${i18next.t('assessments.profileBuilder.results.answers')}</p>
            <ul>
                ${userAnswers.map(a => `
                    <li>
                        <strong>${i18next.t(`assessments.profileBuilder.questions.${a.question}`)}</strong>: 
                        ${i18next.t(`assessments.profileBuilder.options.${a.answer}`)} (Weight: ${a.weight})
                    </li>
                `).join('')}
            </ul>
            <button class="btn btn-primary mt-3" onclick="startProfileBuilder()">${i18next.t('assessments.profileBuilder.reviewBtn')}</button>
            <a href="profile.html" class="btn btn-secondary mt-3">${i18next.t('assessments.profileBuilder.viewProfileBtn')}</a>
        </div>
    `;
    if (firebaseInitialized && currentUserId) {
        saveAssessmentResults('profileBuilder', 'standard', userAnswers);
        updateProfileCompletion();
    }
}

document.getElementById('startProfileBuilderBtn')?.addEventListener('click', startProfileBuilder);

// Profile Management
async function updateProfileDisplay() {
    const profileSection = document.getElementById('profile');
    if (!profileSection) return;
    showLoading(true);
    try {
        let userData = null;
        let assessments = [];
        let ugqs = [];
        if (firebaseInitialized && currentUserId) {
            const collectionName = isTempUser ? 'tempProfiles' : 'users';
            const userDoc = await getDoc(doc(db, collectionName, currentUserId));
            if (userDoc.exists()) {
                userData = userDoc.data();
            }
            const assessmentsQuery = query(collection(db, collectionName, currentUserId, 'assessments'));
            const assessmentsSnapshot = await getDocs(assessmentsQuery);
            assessments = assessmentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            const ugqsQuery = query(collection(db, collectionName, currentUserId, 'ugqs'));
            const ugqsSnapshot = await getDocs(ugqsQuery);
            ugqs = ugqsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        }
        const profileInfo = document.getElementById('profileInfo');
        const assessmentsList = document.getElementById('profileAssessmentsList');
        const ugqList = document.getElementById('profileUgqList');
        const completionBar = document.getElementById('profileCompletionBar');
        const completionText = document.getElementById('profileCompletionPercentageText');
        const completionHint = document.getElementById('profileCompletionHint');

        if (currentUserId && userData) {
            const isPermanent = !isTempUser;
            const profileType = isPermanent ? i18next.t('profile.typePermanent') : i18next.t('profile.typeTemporary');
            const emailDisplay = isPermanent ? userData.email : i18next.t('profile.emailTemp');
            const expiresDisplay = isTempUser && userData.expiresAt ? `${i18next.t('profile.expiresOn')} ${new Date(userData.expiresAt.toDate()).toLocaleDateString()}` : '';
            profileInfo.innerHTML = `
                <p><strong>${i18next.t('profile.type')}:</strong> ${profileType}</p>
                <p><strong>${i18next.t('profile.name')}:</strong> ${sanitizeInput(userData.name || userData.username || 'N/A')}</p>
                <p><strong>${i18next.t('profile.email')}:</strong> ${sanitizeInput(emailDisplay)}</p>
                ${expiresDisplay ? `<p>${expiresDisplay}</p>` : ''}
            `;
            if (userData.photoURL) {
                document.getElementById('profileImagePreview').src = userData.photoURL;
            }
            const completionPercentage = userData.profileCompletion || 0;
            if (completionBar) completionBar.style.width = `${completionPercentage}%`;
            if (completionText) completionText.textContent = `${completionPercentage}%`;
            if (completionHint) completionHint.textContent = i18next.t('profile.completionHint');
        } else {
            profileInfo.innerHTML = `
                <p><strong>${i18next.t('profile.guestName')}</strong></p>
                <p>${i18next.t('profile.guestEmail')}</p>
            `;
            if (completionBar) completionBar.style.width = '0%';
            if (completionText) completionText.textContent = '0%';
            if (completionHint) completionHint.textContent = i18next.t('profile.completionHint');
        }

        if (assessments.length > 0) {
            assessmentsList.innerHTML = assessments.map(a => `
                <li>
                    <strong>${a.type} (${a.level})</strong> - ${i18next.t('profile.completedOn')} ${new Date(a.completedAt.toDate()).toLocaleDateString()}
                </li>
            `).join('');
        } else {
            assessmentsList.innerHTML = currentUserId ? `<p>${i18next.t('profile.noAssessmentsYet')}</p>` : `<p>${i18next.t('profile.noAssessmentsLoggedIn')}</p>`;
        }

        if (ugqs.length > 0) {
            ugqList.innerHTML = ugqs.map(q => `
                <li>
                    <strong>${sanitizeInput(q.question)}</strong>: ${sanitizeInput(q.answer)} (${q.category || 'No category'})
                    <button class="btn btn-sm btn-secondary" onclick="deleteUgq('${q.id}')">Delete</button>
                </li>
            `).join('');
        } else {
            ugqList.innerHTML = `<p>${i18next.t('profile.ugqNone')}</p>`;
        }
    } catch (error) {
        console.error("Error updating profile display:", error);
    } finally {
        showLoading(false);
    }
}

async function updateProfileCompletion() {
    if (!firebaseInitialized || !currentUserId) return;
    try {
        const collectionName = isTempUser ? 'tempProfiles' : 'users';
        const assessmentsQuery = query(collection(db, collectionName, currentUserId, 'assessments'));
        const assessmentsSnapshot = await getDocs(assessmentsQuery);
        const profileDoc = await getDoc(doc(db, collectionName, currentUserId));
        let completion = 0;
        if (profileDoc.exists()) {
            const data = profileDoc.data();
            completion += data.name ? 10 : 0;
            completion += data.dob ? 10 : 0;
            completion += data.gender ? 10 : 0;
            completion += data.location ? 10 : 0;
            completion += data.hobbies ? 10 : 0;
            completion += data.education ? 10 : 0;
            completion += data.occupation ? 10 : 0;
            completion += data.aboutMe ? 10 : 0;
            completion += data.photoURL ? 10 : 0;
        }
        completion += assessmentsSnapshot.size * 5;
        completion = Math.min(completion, 100);
        await updateDoc(doc(db, collectionName, currentUserId), { profileCompletion: completion });
    } catch (error) {
        console.error("Error updating profile completion:", error);
    }
}

document.getElementById('profileForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!firebaseInitialized || !currentUserId) {
        showNotification('Please log in to save profile details.', 'error');
        return;
    }
    showLoading(true);
    try {
        const collectionName = isTempUser ? 'tempProfiles' : 'users';
        const profileData = {
            dob: document.getElementById('dob').value,
            gender: document.getElementById('gender').value,
            location: sanitizeInput(document.getElementById('location').value),
            hobbies: sanitizeInput(document.getElementById('hobbies').value),
            education: sanitizeInput(document.getElementById('education').value),
            occupation: sanitizeInput(document.getElementById('occupation').value),
            aboutMe: sanitizeInput(document.getElementById('aboutMe').value),
            isPublic: document.getElementById('makePublic').checked
        };
        await updateDoc(doc(db, collectionName, currentUserId), profileData);
        showNotification(i18next.t('alerts.profileDetailsSaved'), 'success');
        updateProfileCompletion();
        updateProfileDisplay();
    } catch (error) {
        console.error("Error saving profile:", error);
        showNotification(i18next.t('alerts.profileDetailsError'), 'error');
    } finally {
        showLoading(false);
    }
});

document.getElementById('profileImageUpload')?.addEventListener('change', async (e) => {
    if (!firebaseInitialized || !currentUserId) {
        showNotification('Please log in to upload a profile image.', 'error');
        return;
    }
    const file = e.target.files[0];
    if (!file) return;
    showLoading(true);
    try {
        const storageRef = ref(storage, `profileImages/${currentUserId}/${file.name}`);
        await uploadBytes(storageRef, file);
        const photoURL = await getDownloadURL(storageRef);
        const collectionName = isTempUser ? 'tempProfiles' : 'users';
        await updateDoc(doc(db, collectionName, currentUserId), { photoURL });
        document.getElementById('profileImagePreview').src = photoURL;
        showNotification(i18next.t('alerts.imageUploadSuccess'), 'success');
        updateProfileCompletion();
    } catch (error) {
        console.error("Error uploading image:", error);
        showNotification(i18next.t('alerts.imageUploadError'), 'error');
    } finally {
        showLoading(false);
    }
});

document.getElementById('profileImagePreview')?.addEventListener('click', () => {
    document.getElementById('profileImageUpload').click();
});

document.getElementById('importSocialDataBtn')?.addEventListener('click', async () => {
    const fileInput = document.getElementById('socialDataImport');
    if (!fileInput.files[0]) {
        showNotification(i18next.t('alerts.selectFileFirst'), 'error');
        return;
    }
    if (!firebaseInitialized || !currentUserId) {
        showNotification(i18next.t('alerts.loginToImport'), 'error');
        return;
    }
    showLoading(true);
    try {
        const file = fileInput.files[0];
        showNotification(i18next.t('alerts.processingFile'), 'info');
        if (file.name.endsWith('.zip')) {
            showNotification(i18next.t('alerts.zipParsingNotImplemented'), 'error');
        } else if (file.name.endsWith('.json')) {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    const collectionName = isTempUser ? 'tempProfiles' : 'users';
                    await updateDoc(doc(db, collectionName, currentUserId), {
                        importedSocialData: data
                    });
                    showNotification(i18next.t('alerts.importSuccess'), 'success');
                    updateProfileCompletion();
                    updateProfileDisplay();
                } catch (error) {
                    console.error("Error processing JSON:", error);
                    showNotification(i18next.t('alerts.importFailed'), 'error');
                }
            };
            reader.onerror = () => {
                showNotification(i18next.t('alerts.fileReadError'), 'error');
                showLoading(false);
            };
            reader.readAsText(file);
        } else {
            showNotification(i18next.t('alerts.unsupportedFileFormat'), 'error');
        }
    } catch (error) {
        console.error("Import error:", error);
        showNotification(i18next.t('alerts.importFailed'), 'error');
    } finally {
        showLoading(false);
    }
});

document.getElementById('importAIDataBtn')?.addEventListener('click', async () => {
    const fileInput = document.getElementById('aiDataImport');
    if (!fileInput.files[0]) {
        showNotification(i18next.t('alerts.selectFileFirst'), 'error');
        return;
    }
    if (!firebaseInitialized || !currentUserId) {
        showNotification(i18next.t('alerts.loginToImport'), 'error');
        return;
    }
    showLoading(true);
    try {
        const file = fileInput.files[0];
        if (file.name.endsWith('.json')) {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    const collectionName = isTempUser ? 'tempProfiles' : 'users';
                    await updateDoc(doc(db, collectionName, currentUserId), {
                        importedAIData: data
                    });
                    showNotification(i18next.t('alerts.aiImportSuccess'), 'success');
                    updateProfileCompletion();
                    updateProfileDisplay();
                } catch (error) {
                    console.error("Error processing AI JSON:", error);
                    showNotification(i18next.t('alerts.aiImportFailed'), 'error');
                }
            };
            reader.onerror = () => {
                showNotification(i18next.t('alerts.fileReadError'), 'error');
                showLoading(false);
            };
            reader.readAsText(file);
        } else {
            showNotification(i18next.t('alerts.unsupportedFileFormat'), 'error');
        }
    } catch (error) {
        console.error("AI import error:", error);
        showNotification(i18next.t('alerts.aiImportFailed'), 'error');
    } finally {
        showLoading(false);
    }
});

// UGQ Management
document.getElementById('ugqCreationForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!firebaseInitialized || !currentUserId) {
        showNotification('Please log in to create a question.', 'error');
        return;
    }
    const question = sanitizeInput(document.getElementById('ugqQuestion').value);
    const answer = sanitizeInput(document.getElementById('ugqAnswer').value);
    const category = sanitizeInput(document.getElementById('ugqCategory').value);
    const isPrivate = document.getElementById('ugqPrivate').checked;
    if (!question || !answer) {
        showNotification(i18next.t('alerts.ugqFieldsMissing'), 'error');
        return;
    }
    showLoading(true);
    try {
        const collectionName = isTempUser ? 'tempProfiles' : 'users';
        await addDoc(collection(db, collectionName, currentUserId, 'ugqs'), {
            question,
            answer,
            category: category || null,
            isPrivate,
            createdAt: serverTimestamp()
        });
        showNotification(i18next.t('alerts.ugqSaved'), 'success');
        document.getElementById('ugqCreationForm').reset();
        updateProfileDisplay();
    } catch (error) {
        console.error("Error saving UGQ:", error);
        showNotification(i18next.t('alerts.ugqError'), 'error');
    } finally {
        showLoading(false);
    }
});

window.deleteUgq = async function(ugqId) {
    if (!firebaseInitialized || !currentUserId) return;
    showLoading(true);
    try {
        const collectionName = isTempUser ? 'tempProfiles' : 'users';
        await deleteDoc(doc(db, collectionName, currentUserId, 'ugqs', ugqId));
        showNotification('Question deleted successfully.', 'success');
        updateProfileDisplay();
    } catch (error) {
        console.error("Error deleting UGQ:", error);
        showNotification('Error deleting question.', 'error');
    } finally {
        showLoading(false);
    }
};

// Resource Management
function displayResources() {
    const categoriesGrid = document.getElementById('resourceCategoriesGrid');
    const itemList = document.getElementById('resourceItemList');
    if (!categoriesGrid || !itemList) return;
    const categories = i18next.t('resources.category', { returnObjects: true });
    categoriesGrid.innerHTML = Object.keys(categories).map(catKey => `
        <details>
            <summary>${categories[catKey]}</summary>
            <ul>
                ${Object.keys(i18next.t(`resources.${catKey}Desc`, { returnObjects: true }))
                    .map(itemKey => `<li data-item="${catKey}.${itemKey}">${i18next.t(`resources.${catKey}Desc.${itemKey}`)}</li>`)
                    .join('')}
            </ul>
        </details>
    `).join('');
    categoriesGrid.querySelectorAll('li').forEach(li => {
        li.addEventListener('click', () => {
            const itemKey = li.dataset.item;
            const [category, item] = itemKey.split('.');
            itemList.innerHTML = `
                <div class="value-prop-card">
                    <h5>${i18next.t(`resources.${category}Desc.${item}`)}</h5>
                    <p>${i18next.t(`resources.${category}Desc.${item}`)}</p>
                    <a href="#" class="btn btn-primary btn-sm">${i18next.t('resources.visitSite')}</a>
                </div>
            `;
        });
    });
}

document.getElementById('resourceSearchBtn')?.addEventListener('click', () => {
    const searchInput = document.getElementById('resourceSearchInput').value.toLowerCase();
    const itemList = document.getElementById('resourceItemList');
    if (!itemList) return;
    const allItems = [];
    Object.keys(i18next.t('resources.category', { returnObjects: true })).forEach(catKey => {
        Object.keys(i18next.t(`resources.${catKey}Desc`, { returnObjects: true })).forEach(itemKey => {
            allItems.push({ category: catKey, item: itemKey, text: i18next.t(`resources.${catKey}Desc.${itemKey}`).toLowerCase() });
        });
    });
    const filteredItems = allItems.filter(item => item.text.includes(searchInput));
    itemList.innerHTML = filteredItems.length > 0 ? filteredItems.map(item => `
        <div class="value-prop-card">
            <h5>${i18next.t(`resources.${item.category}Desc.${item.item}`)}</h5>
            <p>${i18next.t(`resources.${item.category}Desc.${item.item}`)}</p>
            <a href="#" class="btn btn-primary btn-sm">${i18next.t('resources.visitSite')}</a>
        </div>
    `).join('') : `<p>${i18next.t('resources.noItemsInCategory')}</p>`;
});

// Sync Management
document.getElementById('syncRequestForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!firebaseInitialized || !currentUserId) {
        showNotification('Please log in to send a sync request.', 'error');
        return;
    }
    const partnerUsername = sanitizeInput(document.getElementById('partnerUsername').value);
    showLoading(true);
    try {
        const q = query(collection(db, 'users'), where('username', '==', partnerUsername));
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
            showNotification('User not found.', 'error');
            showLoading(false);
            return;
        }
        const partnerId = querySnapshot.docs[0].id;
        await addDoc(collection(db, 'users', currentUserId, 'syncRequests'), {
            to: partnerId,
            status: 'pending',
            sentAt: serverTimestamp()
        });
        showNotification('Sync request sent!', 'success');
        displaySyncRequests();
    } catch (error) {
        console.error("Error sending sync request:", error);
        showNotification('Error sending sync request.', 'error');
    } finally {
        showLoading(false);
    }
});

async function displaySyncRequests() {
    const pendingList = document.getElementById('pendingSyncRequests');
    const syncedList = document.getElementById('syncedPartners');
    if (!pendingList || !syncedList || !firebaseInitialized || !currentUserId) return;
    showLoading(true);
    try {
        const requestsQuery = query(collection(db, 'users', currentUserId, 'syncRequests'), where('status', '==', 'pending'));
        const requestsSnapshot = await getDocs(requestsQuery);
        pendingList.innerHTML = requestsSnapshot.empty ? `<p>${i18next.t('sync.noPending')}</p>` : requestsSnapshot.docs.map(doc => `
            <li>Request to ${doc.data().to} (Sent: ${new Date(doc.data().sentAt.toDate()).toLocaleDateString()})</li>
        `).join('');
        const syncedQuery = query(collection(db, 'users', currentUserId, 'syncRequests'), where('status', '==', 'accepted'));
        const syncedSnapshot = await getDocs(syncedQuery);
        syncedList.innerHTML = syncedSnapshot.empty ? `<p>${i18next.t('sync.noSynced')}</p>` : syncedSnapshot.docs.map(doc => `
            <li>Synced with ${doc.data().to}</li>
        `).join('');
    } catch (error) {
        console.error("Error displaying sync requests:", error);
    } finally {
        showLoading(false);
    }
}

// Search Functionality
document.getElementById('searchForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = document.getElementById('searchInput').value;
    showNotification(`Searching for: ${sanitizeInput(query)} (Feature coming soon)`, 'info');
});

// Benefit Modal
document.querySelectorAll('.benefit-card')?.forEach(card => {
    card.addEventListener('click', () => {
        const benefitKey = card.dataset.benefit;
        benefitModalTitleEl.textContent = i18next.t(`landing.${benefitKey}.title`);
        benefitModalDescriptionEl.textContent = i18next.t(`landing.${benefitKey}.description`);
        showModal('benefitModal');
    });
});

// Initialize Dynamic Content
function initializeDynamicContent() {
    highlightActiveNavLink();
    updateProfileDisplay();
    displayResources();
    displaySyncRequests();
    if (document.getElementById('quickCompatAssessmentArea')) {
        document.getElementById('quickCompatAssessmentArea').innerHTML = `
            <div class="assessment-container">
                <h3 data-i18n="assessments.quickCompat.title">${i18next.t('assessments.quickCompat.title')}</h3>
                <p data-i18n="assessments.quickCompat.description">${i18next.t('assessments.quickCompat.description')}</p>
                <div id="quickCompatLevelSelector">
                    <button id="quickCompatBasicBtn" class="btn btn-primary">${i18next.t('assessments.quickCompat.basicBtn')}</button>
                    <button id="quickCompatIntermediateBtn" class="btn btn-primary">${i18next.t('assessments.quickCompat.intermediateBtn')}</button>
                    <button id="quickCompatAdvancedBtn" class="btn btn-primary">${i18next.t('assessments.quickCompat.advancedBtn')}</button>
                </div>
            </div>
        `;
        document.getElementById('quickCompatBasicBtn').addEventListener('click', () => startQuickCompat('basic'));
        document.getElementById('quickCompatIntermediateBtn').addEventListener('click', () => startQuickCompat('intermediate'));
        document.getElementById('quickCompatAdvancedBtn').addEventListener('click', () => startQuickCompat('advanced'));
    }
    if (document.getElementById('profileBuilderAssessmentArea')) {
        document.getElementById('profileBuilderAssessmentArea').innerHTML = `
            <div class="assessment-container">
                <h3 data-i18n="assessments.profileBuilder.title">${i18next.t('assessments.profileBuilder.title')}</h3>
                <p data-i18n="assessments.profileBuilder.description">${i18next.t('assessments.profileBuilder.description')}</p>
                <button id="startProfileBuilderBtn" class="btn btn-primary">${i18next.t('assessments.profileBuilder.start')}</button>
            </div>
        `;
        document.getElementById('startProfileBuilderBtn').addEventListener('click', startProfileBuilder);
    }
    showNotification(i18next.t('notifications.welcome'), 'info');
}

document.addEventListener('DOMContentLoaded', initializeDynamicContent);
