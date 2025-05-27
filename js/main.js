import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-analytics.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, signOut, updateProfile } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, addDoc, deleteDoc, getDocs, collection, query, where, serverTimestamp, Timestamp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-storage.js";

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyAW0SakPbUUfpK-gD4SHMIQzlEhpMLzUbI",
  authDomain: "lifesyncapp-391ab.firebaseapp.com",
  projectId: "lifesyncapp-391ab",
  storageBucket: "lifesyncapp-391ab.firebasestorage.app",
  messagingSenderId: "617714109567",
  appId: "1:617714109567:web:b7f3cf016d6f7348b1434a",
  measurementId: "G-7XKHR48S14"
};

// Initialize Firebase
let firebaseInitialized = false;
let app, auth, db, storage, analytics;
try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    analytics = getAnalytics(app);
    firebaseInitialized = true;
    console.log("Firebase initialized successfully");
} catch (error) {
    console.error("Firebase initialization error:", error);
}

// i18next Initialization
const resources = {
    en: {
        translation: {
            title: "LifeSync - Deepen Your Connections",
            nav: {
                brand: "LifeSync",
                home: "Home",
                assessments: "Assessments",
                tools: "Tools",
                resources: "Resources",
                ugq: "My Questions",
                profile: "My Profile",
                sync: "Couple Sync",
                login: "Login",
                register: "Register",
                logout: "Logout"
            },
            landing: {
                heroTitle: "Beyond the Swipe: Discover True Compatibility",
                heroSubtitle: "LifeSync empowers you to understand yourself and what you truly need in any significant relationship...",
                heroCta: "Explore Assessments",
                benefitsTitle: "Why LifeSync? The Path to Deeper Understanding.",
                benefitsSubtitle: "LifeSync is more than an app; it's your companion for relationship clarity and growth.",
                benefit1: {
                    title: "Build Your Lifelong Profile",
                    description: "Create a rich, evolving profile that captures your values..."
                },
                benefit2: {
                    title: "Understand Yourself Deeper",
                    description: "Engage with 150+ culturally aware questions..."
                },
                benefit3: {
                    title: "Ready to 'Sync Up'?",
                    description: "Connect with a partner on a new level..."
                },
                benefitImport: {
                    title: "Seamless Profile Building",
                    description: "Easily import data from existing social/dating profiles..."
                },
                learnMoreClose: "Close",
                getStartedTitle: "Ready to Begin Your Journey?",
                getStartedSubtitle: "Create your free LifeSync profile today...",
                registerNow: "Register Your Profile",
                loginExisting: "Login"
            },
            login: {
                title: "Login to LifeSync",
                subtitle: "Access your profile, assessments, and synced data.",
                emailLabel: "Email:",
                emailPlaceholder: "Enter your email",
                passwordLabel: "Password:",
                passwordPlaceholder: "Enter your password",
                submit: "Login",
                google: "Login with Google",
                tempProfilePrompt: "Don't want to sign in? Try LifeSync with a temporary profile:",
                tempProfileBtn: "Create Temporary Profile",
                loginTempProfileBtn: "Login with Temporary Code"
            },
            register: {
                title: "Create Your LifeSync Account",
                subtitle: "Start building your insightful relationship profile.",
                nameLabel: "Name:",
                namePlaceholder: "Enter your name",
                emailLabel: "Email:",
                emailPlaceholder: "Enter your email",
                passwordLabel: "Password:",
                passwordPlaceholder: "Create a password",
                submit: "Register",
                google: "Register with Google"
            },
            tempProfile: {
                title: "Create Temporary Profile",
                subtitle: "Create a temporary profile to explore LifeSync for 90 days.",
                usernameLabel: "Username:",
                usernamePlaceholder: "Choose a username",
                createBtn: "Create Profile",
                codeInstructions: "Your temporary profile has been created! Use this code to log in:",
                expiryNote: "This profile will expire in 90 days. Save your username and code securely!",
                gotItBtn: "I've Saved It!"
            },
            tempProfileLogin: {
                title: "Login with Temporary Profile",
                usernameLabel: "Username:",
                usernamePlaceholder: "Enter your username",
                codeLabel: "Code:",
                codePlaceholder: "Enter your code",
                submit: "Login"
            },
            search: {
                title: "Search LifeSync",
                placeholder: "Search assessments, resources, or profiles...",
                submit: "Search"
            },
            assessments: {
                title: "Discover Your Compatibility",
                subtitle: "Engage with our assessments to gain valuable insights...",
                note: "More in-depth assessments on finances, cultural values...",
                quickCompat: {
                    title: "Quick Compatibility Check",
                    description: "A fast way to see how well you might align with a partner.",
                    basicBtn: "Basic (5 Qs)",
                    intermediateBtn: "Intermediate (10 Qs)",
                    advancedBtn: "Advanced (15 Qs)",
                    progressQuestion: "Question",
                    progressOf: "of",
                    importanceLabel: "How important is this to you? (1-5)",
                    nextBtn: "Next",
                    resultsTitle: "Your Quick Compatibility Results",
                    results: {
                        completed: "You completed the",
                        checkWith: "check with",
                        answers: "answers."
                    },
                    retryBtn: "Try Again",
                    questions: {
                        q_financial_stability: "How important is financial stability to you?",
                        q_indoors_outdoors: "Do you prefer indoors or outdoors activities?",
                        q_personal_space: "How often do you need personal space?",
                        q_spontaneity_planning: "Do you prefer spontaneity or planning?",
                        q_family_involvement: "How important is family involvement to you?",
                        q_comm_style: "What is your communication style?",
                        q_conflict_resolution: "How do you handle conflict?",
                        q_social_circle: "What kind of social circle do you prefer?",
                        q_travel_preference: "What is your travel preference?",
                        q_dietary_habits: "What are your dietary habits?",
                        q_long_term_goals: "What are your long-term goals?",
                        q_parenting_style: "What parenting style do you prefer?",
                        q_spirituality: "How spiritual are you?",
                        q_political_views: "How important are similar political views?",
                        q_cultural_background_match: "How important is a cultural background match?"
                    },
                    options: {
                        opt_not_important: "Not Important",
                        opt_somewhat_important: "Somewhat Important",
                        opt_very_important: "Very Important",
                        opt_indoors: "Indoors",
                        opt_outdoors: "Outdoors",
                        opt_both: "Both",
                        opt_rarely: "Rarely",
                        opt_sometimes: "Sometimes",
                        opt_often: "Often",
                        opt_spontaneity: "Spontaneity",
                        opt_planning: "Planning",
                        opt_direct: "Direct",
                        opt_indirect: "Indirect",
                        opt_discuss_now: "Discuss Immediately",
                        opt_cool_off: "Cool Off First",
                        opt_small_circle: "Small Circle",
                        opt_large_network: "Large Network",
                        opt_relaxing: "Relaxing",
                        opt_adventure: "Adventure",
                        opt_anything: "I Eat Anything",
                        opt_specific_diet: "Specific Diet",
                        opt_career_focus: "Career Focus",
                        opt_family_focus: "Family Focus",
                        opt_balance_both: "Balance Both",
                        opt_strict: "Strict",
                        opt_lenient: "Lenient",
                        opt_authoritative: "Authoritative",
                        opt_very_spiritual: "Very Spiritual",
                        opt_somewhat_spiritual: "Somewhat Spiritual",
                        opt_not_spiritual: "Not Spiritual",
                        opt_similar_views: "Similar Views Important",
                        opt_differences_ok: "Differences Are Okay",
                        opt_important_match: "Important to Match",
                        opt_not_important_match: "Not Important to Match"
                    }
                },
                profileBuilder: {
                    title: "Profile Builder",
                    description: "Answer questions to build a detailed relationship profile.",
                    start: "Start Profile Builder",
                    progressQuestion: "Question",
                    progressOf: "of",
                    importanceLabel: "How important is this to you? (1-5)",
                    nextBtn: "Next",
                    resultsTitle: "Your Profile Builder Results",
                    results: {
                        completedWith: "You completed the Profile Builder with",
                        answers: "answers."
                    },
                    reviewBtn: "Review Answers",
                    viewProfileBtn: "View My Profile",
                    questions: {
                        "profileBuilder.q_love_language_give": "What is your primary love language when giving love?",
                        "profileBuilder.q_love_language_receive": "What love language do you prefer to receive?",
                        "profileBuilder.q_financial_transparency_scale": "How transparent are you about finances? (1-5)",
                        "profileBuilder.q_stress_handling": "How do you handle stress?",
                        "profileBuilder.q_family_involvement_expectations": "What are your expectations for family involvement?",
                        "profileBuilder.q_spiritual_beliefs_match_importance": "How important is it that your spiritual beliefs match?",
                        "profileBuilder.q_children_stance": "What is your stance on having children?",
                        "profileBuilder.q_past_relationships_discussion": "How open are you about discussing past relationships?",
                        "profileBuilder.q_lobola_view": "What is your view on lobola/dowry?",
                        "profileBuilder.q_household_responsibilities": "How do you prefer to handle household responsibilities?"
                    },
                    options: {
                        words: "Words of Affirmation",
                        acts: "Acts of Service",
                        gifts: "Receiving Gifts",
                        quality_time: "Quality Time",
                        touch: "Physical Touch",
                        "1": "1 (Not Transparent)",
                        "2": "2",
                        "3": "3 (Neutral)",
                        "4": "4",
                        "5": "5 (Very Transparent)",
                        talk_it_out: "Talk It Out",
                        alone_time: "Need Alone Time",
                        distract_myself: "Distract Myself",
                        exercise: "Exercise",
                        very_involved: "Very Involved",
                        moderately_involved: "Moderately Involved",
                        minimal_involvement: "Minimal Involvement",
                        very_important: "Very Important",
                        somewhat_important: "Somewhat Important",
                        not_important: "Not Important",
                        definitely_want: "Definitely Want",
                        open_to_discussion: "Open to Discussion",
                        prefer_not: "Prefer Not",
                        undecided: "Undecided",
                        open_book: "Open Book",
                        some_details_ok: "Some Details Okay",
                        prefer_not_much: "Prefer Not to Share Much",
                        essential_tradition: "Essential Tradition",
                        important_cultural: "Important but Cultural",
                        open_to_modern: "Open to Modern Takes",
                        not_applicable: "Not Applicable",
                        strictly_50_50: "Strictly 50/50",
                        based_on_time_skill: "Based on Time/Skill",
                        flexible_circumstances: "Flexible by Circumstances",
                        outsource_some: "Outsource Some Tasks"
                    }
                }
            },
            tools: {
                title: "Relationship Enhancement Tools",
                subtitle: "Access a suite of tools designed to foster communication...",
                communication: {
                    title: "Communication Guides",
                    description: "Structured prompts and guides for discussing sensitive topics..."
                },
                milestone: {
                    title: "Milestone & Date Tracker",
                    description: "Log important dates, anniversaries, and relationship milestones..."
                },
                monitoring: {
                    title: "Parameter Monitoring",
                    description: "Track changes in key relationship aspects..."
                },
                conflict: {
                    title: "Conflict Resolution Aids",
                    description: "Tools to help navigate disagreements constructively..."
                },
                goals: {
                    title: "Shared Goals & Dreams",
                    description: "Define and track progress towards shared aspirations..."
                },
                closure: {
                    title: "Relationship Closure (If Needed)",
                    description: "Tools to facilitate a respectful and clear process..."
                },
                comingSoon: "Coming Soon",
                explore: "Explore Resources"
            },
            resources: {
                pageTitle: "Relationship Resources Hub",
                pageSubtitle: "Explore a curated list of tools, services, and information...",
                wizard: {
                    title: "Resource Discovery Wizard",
                    introTitle: "How to Use This Section",
                    introText: "Use the search bar below to find specific resources...",
                    automatedIntro: "Based on your profile, we might have some suggestions...",
                    customizeBtn: "Customize Suggestions (Coming Soon)",
                    searchLabel: "Search All Resources:",
                    searchPlaceholder: "Enter keywords (e.g., communication, finance)",
                    searchBtn: "Search",
                    browseCategories: "Or Browse Categories:"
                },
                noItemsInCategory: "No items found matching your search.",
                visitSite: "Visit Site",
                category: {
                    communication: "Communication & Connection",
                    finance: "Finance & Planning",
                    cultural: "Cultural & Family Dynamics",
                    health: "Health & Wellness",
                    legal: "Legal & Mediation",
                    closure: "Closure & Moving Forward"
                },
                communicationDesc: {
                    comm1: "Tool for Better Conversations",
                    comm2: "Active Listening Guide",
                    comm3: "Conflict Resolution App"
                },
                financeDesc: {
                    fin1: "Shared Budget Planner",
                    fin2: "Financial Transparency Guide",
                    fin3: "Investment Compatibility Quiz"
                },
                culturalDesc: {
                    cult1: "Cultural Values Assessment",
                    cult2: "Family Tradition Planner",
                    cult3: "Intercultural Relationship Guide"
                },
                healthDesc: {
                    health1: "Mental Wellness Tracker",
                    health2: "Stress Management Techniques",
                    health3: "Couples Therapy Finder"
                },
                legalDesc: {
                    legal1: "Prenup Guide",
                    legal2: "Mediation Services",
                    legal3: "Legal Advice for Couples"
                },
                closureDesc: {
                    closure1: "Breakup Recovery Plan",
                    closure2: "Respectful Closure Guide",
                    closure3: "Post-Relationship Counseling"
                }
            },
            ugq: {
                title: "My Questions",
                subtitle: "Create your own questions to explore specific areas of compatibility...",
                yourQuestionsTitle: "Your Created Questions",
                privateLabel: "Keep this question private (visible only to you and synced partners)"
            },
            profile: {
                title: "My LifeSync Profile",
                subtitle: "This is your personal space. Manage your details, track your progress, and control your sharing preferences.",
                completionTitle: "Profile Completion",
                completionHint: "Complete more assessments and add details to increase your profile score!",
                basicInfoTitle: "Basic Information",
                type: "Profile Type",
                typePermanent: "Permanent",
                typeTemporary: "Temporary",
                name: "Name",
                email: "Email",
                emailTemp: "Not available for temporary profiles",
                expiresOn: "Expires on",
                guestName: "Guest User",
                guestEmail: "No email (Guest Mode)",
                uploadPicture: "Upload Picture",
                avatarComingSoon: "(Avatars coming soon)",
                makePublic: "Make Profile Public (to registered users)",
                dobLabel: "Date of Birth:",
                genderLabel: "Gender:",
                selectOption: "Select...",
                genderMale: "Male",
                genderFemale: "Female",
                genderNonBinary: "Non-binary",
                genderOther: "Other",
                genderPreferNot: "Prefer not to say",
                locationLabel: "Location (City, Country):",
                locationPlaceholder: "e.g., Cape Town, South Africa",
                lifestyleTitle: "Lifestyle & Interests",
                hobbiesLabel: "Hobbies & Interests (comma-separated):",
                hobbiesPlaceholder: "e.g., hiking, reading, cooking",
                educationLabel: "Education Level:",
                educationPlaceholder: "e.g., Bachelor's Degree",
                occupationLabel: "Occupation/Profession:",
                occupationPlaceholder: "e.g., Software Engineer",
                aboutMeLabel: "About Me (Short Bio):",
                aboutMePlaceholder: "Tell us about yourself...",
                saveProfileBtn: "Save Profile Details",
                importTitle: "Import Your Data:",
                importInstructionsSocial: "Upload your data file (e.g., LinkedIn ZIP, Facebook JSON) to enhance your profile.",
                importBtnSocial: "Import Social/Dating Data",
                importInstructionsAI: "Use AI to extract info from documents (e.g., CV). Process externally, then upload the generated JSON.",
                aiUploadLabel: "Upload AI-Processed JSON:",
                importBtnAI: "Import AI Processed Data",
                aiToolNote: "Note: Use tools like Gemini, Grok, etc., to process your documents into a structured JSON first.",
                assessmentsTitle: "Completed Assessments:",
                noAssessmentsYet: "You haven't completed any assessments yet.",
                noAssessmentsLoggedIn: "Log in to see your completed assessments.",
                partnersTitle: "Synced Partners:",
                noPartners: "No partner synced yet.",
                connectBtn: "Connect with Partner",
                dataTitle: "Assessment Profile Data & Preferences:",
                dataNote: "This section shows data from your completed assessments.",
                ugqTitleLong: "My Questions",
                ugqCreateTitle: "Create a New Question",
                ugqQuestionLabel: "Your Question:",
                ugqQuestionPlaceholder: "e.g., What's your favorite way to spend a weekend?",
                ugqAnswerLabel: "Your Answer:",
                ugqAnswerPlaceholder: "e.g., I love to go hiking and then relax with a good book.",
                ugqCategoryLabel: "Category (Optional):",
                ugqCategoryPlaceholder: "e.g., Lifestyle",
                ugqSaveBtn: "Save Question",
                ugqNone: "You haven't created any questions yet."
            },
            sync: {
                title: "Couple Sync",
                subtitle: "Connect with your partner to share insights and grow together. All sharing requires mutual consent.",
                connectTitle: "Connect with Partner",
                partnerUsernameLabel: "Partner's Username:",
                partnerUsernamePlaceholder: "Enter your partner's username",
                sendRequest: "Send Sync Request",
                pendingTitle: "Pending Requests",
                noPending: "No pending requests.",
                syncedTitle: "Synced Partners",
                noSynced: "You are not synced with any partners yet."
            },
            alerts: {
                loginSuccess: "Logged in successfully!",
                loginFailed: "Login failed. Please check your credentials.",
                registerSuccess: "Account created successfully!",
                registerFailed: "Registration failed. Please try again.",
                tempProfileCreated: "Temporary profile created successfully!",
                tempProfileFailed: "Failed to create temporary profile.",
                tempProfileLoginSuccess: "Logged in with temporary profile!",
                tempProfileLoginFailed: "Temporary profile login failed. Check your username and code.",
                tempProfileExpired: "This temporary profile has expired.",
                selectionNeeded: "Please select an option to proceed.",
                profileDetailsSaved: "Profile details saved successfully!",
                profileDetailsError: "Error saving profile details.",
                imageUploadSuccess: "Profile image uploaded successfully!",
                imageUploadError: "Error uploading image.",
                selectFileFirst: "Please select a file to import.",
                loginToImport: "Please log in to import data.",
                processingFile: "Processing your file...",
                zipParsingNotImplemented: "ZIP file parsing is not yet implemented.",
                importSuccess: "Data imported successfully!",
                importFailed: "Failed to import data.",
                aiImportSuccess: "AI-processed data imported successfully!",
                aiImportFailed: "Failed to import AI-processed data.",
                fileReadError: "Error reading the file.",
                unsupportedFileFormat: "Unsupported file format. Please upload a JSON file.",
                ugqFieldsMissing: "Please fill in both the question and answer.",
                ugqSaved: "Question saved successfully!",
                ugqError: "Error saving question."
            },
            notifications: {
                welcome: "Welcome to LifeSync! Start by exploring assessments or building your profile."
            },
            footer: {
                privacy: "Privacy Policy",
                terms: "Terms of Service",
                built: "Built with <3 for LifeSync."
            }
        }
    },
    xh: {
        translation: {
            title: "LifeSync - Yandisa Uqhagamshelwano Lwakho",
            nav: {
                brand: "LifeSync",
                home: "Ekhaya",
                assessments: "Ukuvavanya",
                tools: "Izixhobo",
                resources: "Izixhobo",
                ugq: "Imibuzo Yam",
                profile: "Iprofayile Yam",
                sync: "Ukuvumelanisa Kwesibini",
                login: "Ngena",
                register: "Bhalisa",
                logout: "Phuma"
            },
            landing: {
                heroTitle: "Ngaphaya kwe-Swipe: Fumanisa Ukuhambelana Okwenyani",
                heroSubtitle: "I-LifeSync ikunika amandla okuziqonda kunye noko ukudingayo ngokwenene kulwalamano olubalulekileyo..."
            }
        }
    },
    zu: {
        translation: {
            title: "LifeSync - Julisa Ukuxhumana Kwakho",
            nav: {
                brand: "LifeSync",
                home: "Ekhaya",
                assessments: "Ukuhlola",
                tools: "Amathuluzi",
                resources: "Izinsiza",
                ugq: "Imibuzo Yami",
                profile: "Iphrofayili Yami",
                sync: "Ukuvumelanisa Kwababili",
                login: "Ngena",
                register: "Bhalisa",
                logout: "Phuma"
            }
        }
    },
    af: {
        translation: {
            title: "LifeSync - Verdiep Jou Verbindings",
            nav: {
                brand: "LifeSync",
                home: "Tuis",
                assessments: "Assesserings",
                tools: "Gereedskap",
                resources: "Hulpbronne",
                ugq: "My Vrae",
                profile: "My Profiel",
                sync: "Paar Sinchronisasie",
                login: "Meld Aan",
                register: "Registreer",
                logout: "Meld Af"
            }
        }
    }
};

i18next.use(i18nextBrowserLanguageDetector).init({
    resources,
    fallbackLng: 'en',
    debug: true,
    detection: {
        order: ['localStorage', 'navigator'],
        caches: ['localStorage']
    }
}, (err, t) => {
    if (err) return console.error("i18next error:", err);
    updateContent();
});

function updateContent() {
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        element.textContent = i18next.t(key);
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
        const key = element.getAttribute('data-i18n-placeholder');
        element.placeholder = i18next.t(key);
    });
}

document.getElementById('languageSelector')?.addEventListener('change', (e) => {
    i18next.changeLanguage(e.target.value, () => {
        updateContent();
    });
});

// DOM Elements
const loginBtnNavEl = document.getElementById('loginBtnNav');
const registerBtnNavEl = document.getElementById('registerBtnNav');
const logoutBtnNavEl = document.getElementById('logoutBtnNav');
const navProfileBtnEl = document.getElementById('navProfileBtn');
const loginBtnCtaEl = document.getElementById('loginBtnCta');
const registerBtnCtaEl = document.getElementById('registerBtnCta');
const createTempProfileFromLoginModalBtnEl = document.getElementById('createTempProfileFromLoginModalBtn');
const loginWithTempProfileModalBtnEl = document.getElementById('loginWithTempProfileModalBtn');
const tempProfileGotItBtnEl = document.getElementById('tempProfileGotItBtn');
const globalSearchTriggerBtnEl = document.getElementById('globalSearchTriggerBtn');
const benefitModalCloseBtnEl = document.getElementById('benefitModalCloseBtn');
const benefitModalTitleEl = document.getElementById('benefitModalTitle');
const benefitModalDescriptionEl = document.getElementById('benefitModalDescription');
document.getElementById('currentYearFooter').textContent = new Date().getFullYear();

// Authentication State
let currentUserId = null;
let isTempUser = false;
const appIdFromGlobal = 'lifesync-' + Math.random().toString(36).substring(2, 15);

if (firebaseInitialized) {
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            currentUserId = user.uid;
            isTempUser = false;
            updateUIForLoggedInUser(user);
            await updateProfileDisplay();
        } else {
            const tempProfile = JSON.parse(localStorage.getItem('tempProfile'));
            if (tempProfile) {
                currentUserId = tempProfile.id;
                isTempUser = true;
                updateUIForTempUser(tempProfile);
                await updateProfileDisplay();
            } else {
                updateUIForLoggedOutUser();
            }
        }
    });
}

function updateUIForLoggedInUser(user) {
    loginBtnNavEl.style.display = 'none';
    registerBtnNavEl.style.display = 'none';
    logoutBtnNavEl.style.display = 'inline-block';
    navProfileBtnEl.style.display = 'inline-block';
}

function updateUIForTempUser(tempProfile) {
    loginBtnNavEl.style.display = 'none';
    registerBtnNavEl.style.display = 'none';
    logoutBtnNavEl.style.display = 'inline-block';
    navProfileBtnEl.style.display = 'inline-block';
}

function updateUIForLoggedOutUser() {
    loginBtnNavEl.style.display = 'inline-block';
    registerBtnNavEl.style.display = 'inline-block';
    logoutBtnNavEl.style.display = 'none';
    navProfileBtnEl.style.display = 'none';
    currentUserId = null;
    isTempUser = false;
}

// Utility Functions
function sanitizeInput(input) {
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
}

function showModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

function showLoading(show) {
    document.getElementById('loadingOverlay').style.display = show ? 'flex' : 'none';
}

function showNotification(message, type = 'info') {
    const notificationsArea = document.getElementById('notificationsArea');
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notificationsArea.appendChild(notification);
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => notification.remove(), 500);
    }, 3000);
}

function highlightActiveNavLink() {
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.classList.remove('active-nav');
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('active-nav');
        }
    });
}

// Modal Event Listeners
loginBtnNavEl?.addEventListener('click', () => showModal('loginModal'));
registerBtnNavEl?.addEventListener('click', () => showModal('registerModal'));
loginBtnCtaEl?.addEventListener('click', () => showModal('loginModal'));
registerBtnCtaEl?.addEventListener('click', () => showModal('registerModal'));
createTempProfileFromLoginModalBtnEl?.addEventListener('click', () => {
    closeModal('loginModal');
    showModal('tempProfileModal');
});
loginWithTempProfileModalBtnEl?.addEventListener('click', () => {
    closeModal('loginModal');
    showModal('tempProfileLoginModal');
});
tempProfileGotItBtnEl?.addEventListener('click', () => closeModal('tempProfileModal'));
globalSearchTriggerBtnEl?.addEventListener('click', () => showModal('searchModal'));
benefitModalCloseBtnEl?.addEventListener('click', () => closeModal('benefitModal'));
document.querySelectorAll('.modal .close-button').forEach(button => {
    button.addEventListener('click', () => {
        const modal = button.closest('.modal');
        modal.style.display = 'none';
    });
});

// Form Submissions
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
    const searchInput = document.getElementById('searchInput').value.toLowerCase();
    const searchResults = document.getElementById('searchResults');
    if (!searchResults) return;

    // Simple search implementation - extend this based on your data
    const searchablePages = [
        { name: i18next.t('nav.assessments'), url: 'assessments.html', keywords: ['assessments', 'compatibility', 'questions'] },
        { name: i18next.t('nav.resources'), url: 'resources.html', keywords: ['resources', 'tools', 'support'] },
        { name: i18next.t('nav.ugq'), url: 'ugq.html', keywords: ['my questions', 'custom questions', 'ugq'] },
        { name: i18next.t('nav.profile'), url: 'profile.html', keywords: ['profile', 'my profile', 'account'] },
        { name: i18next.t('nav.sync'), url: 'sync.html', keywords: ['couple sync', 'partner', 'sync'] }
    ];

    const results = searchablePages.filter(page =>
        page.name.toLowerCase().includes(searchInput) ||
        page.keywords.some(keyword => keyword.includes(searchInput))
    );

    searchResults.innerHTML = results.length > 0
        ? results.map(result => `
            <div class="search-result">
                <a href="${result.url}">${result.name}</a>
            </div>
        `).join('')
        : `<p>No results found for "${searchInput}".</p>`;
});

// Initialize Page-Specific Content
document.addEventListener('DOMContentLoaded', () => {
    highlightActiveNavLink();
    if (document.getElementById('profile')) updateProfileDisplay();
    if (document.getElementById('resourceCategoriesGrid')) displayResources();
    if (document.getElementById('pendingSyncRequests')) displaySyncRequests();
    showNotification(i18next.t('notifications.welcome'), 'info');
});
