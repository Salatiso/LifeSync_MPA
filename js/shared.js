// --- js/shared.js ---

// Firebase SDK imports are now done in each HTML file via <script type="module">
// This shared script will define functions and variables that assume Firebase is available.

// --- Global Variables & Configuration ---
let app;
let auth;
let db;
let storage;
let firebaseInitialized = false;
let currentUserId = null;
let isTempUser = false;
let currentUserData = null; // To cache current user's full data

const firebaseConfigFromGlobal = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : null;
const initialAuthTokenFromGlobal = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;
const appIdFromGlobal = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// --- Firebase Initialization (to be called from each page) ---
async function initializeFirebaseAndAuth() {
    console.log("shared.js: Attempting Firebase initialization...");
    if (firebaseInitialized) {
        console.log("shared.js: Firebase already initialized.");
        return;
    }
    try {
        if (firebaseConfigFromGlobal && window.firebase && typeof window.firebase.initializeApp === 'function') {
            app = window.firebase.initializeApp(firebaseConfigFromGlobal);
            auth = window.firebase.auth();
            db = window.firebase.firestore();
            storage = window.firebase.storage();
            firebaseInitialized = true;
            console.log("shared.js: Firebase initialized successfully with dynamic config.");

            // Set up Auth State Listener
            auth.onAuthStateChanged(handleAuthStateChanged); // This will trigger initial user state check

            // Attempt initial sign-in AFTER onAuthStateChanged is set up
            if (initialAuthTokenFromGlobal) {
                try {
                    await window.firebase.auth().signInWithCustomToken(auth, initialAuthTokenFromGlobal);
                    console.log("shared.js: Successfully signed in with custom token.");
                } catch (customTokenError) {
                    console.error("shared.js: Error signing in with custom token:", customTokenError);
                    // If custom token fails, and no other user is signed in, try anonymous
                    if (!auth.currentUser) {
                        try {
                            await window.firebase.auth().signInAnonymously(auth);
                            console.log("shared.js: Signed in anonymously as custom token failed.");
                        } catch (anonError) {
                            console.error("shared.js: Anonymous sign-in failed:", anonError);
                        }
                    }
                }
            } else if (!auth.currentUser) { // No custom token and no user currently signed in
                try {
                    await window.firebase.auth().signInAnonymously(auth);
                    console.log("shared.js: Signed in anonymously as no custom token was available and no user was signed in.");
                } catch (anonError) {
                    console.error("shared.js: Anonymous sign-in failed:", anonError);
                }
            }


        } else {
            console.warn("shared.js: Firebase configuration or SDK not found. Firebase features will be limited.");
            displayGlobalError("Service configuration missing. Some features may not be available.");
        }
    } catch (error) {
        console.error("shared.js: Firebase initialization error:", error);
        displayGlobalError("Error connecting to services. Some features may not be available.");
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
const translations = {
    en: {
        translation: {
            title: "LifeSync - Deepen Your Connections",
            nav: { brand: "LifeSync", home: "Home", assessments: "Assessments", tools: "Tools", resources: "Resources", profile: "My Profile", login: "Login", register: "Register", logout: "Logout", ugq: "My Q's" },
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
                        "profileBuilder.q_household_responsibilities": "How do you envision division of household responsibilities in a cohabiting relationship?",
                        "profileBuilder.q_communication_frequency": "How often do you prefer to communicate with a partner throughout the day (e.g., texting, calls)?",
                        "profileBuilder.q_quality_time_definition": "What does 'quality time' mean to you in a relationship?",
                        "profileBuilder.q_career_ambition_partner": "How important is it for your partner to be career-ambitious?",
                        "profileBuilder.q_hobbies_shared": "How important is it to share hobbies with a partner?",
                        "profileBuilder.q_hobbies_personal": "How important is it for you and a partner to have separate hobbies and interests?",
                        "profileBuilder.q_political_alignment": "How important is political alignment with a partner?",
                        "profileBuilder.q_social_style": "Are you more of an introvert, extrovert, or ambivert?",
                        "profileBuilder.q_travel_style": "What's your preferred travel style (e.g., luxury, budget, adventure, cultural)?",
                        "profileBuilder.q_conflict_approach": "When a conflict arises, are you more likely to address it immediately or need time to process?",
                        "profileBuilder.q_physical_affection": "How important is physical affection (beyond sex) to you (e.g., cuddling, hand-holding)?",
                        "profileBuilder.q_intellectual_stimulation": "How important is intellectual stimulation from a partner?",
                        "profileBuilder.q_humor_style": "What's your sense of humor like (e.g., sarcastic, witty, slapstick)?",
                        "profileBuilder.q_pet_lover": "Are you a pet lover? If so, what kind?",
                        "profileBuilder.q_living_environment": "What's your ideal living environment (e.g., city, suburbs, rural)?",
                        "profileBuilder.q_financial_goals_joint": "Do you believe in fully joint finances, separate, or a mix?"
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
                        strictly_50_50: "Strictly 50/50", based_on_time_skill: "Based on who has more time/skill", flexible_circumstances: "Flexible, depends on circumstances", outsource_some: "Prefer to outsource some tasks",
                        very_often: "Very often", moderately_often: "Moderately often", occasionally: "Occasionally", rarely: "Rarely",
                        focused_conv: "Focused conversation", shared_activity: "Shared activity", physical_presence: "Just being together", all_above: "All of the above",
                        introvert: "Introvert", extrovert: "Extrovert", ambivert: "Ambivert",
                        luxury: "Luxury", budget: "Budget-conscious", adventure_travel: "Adventure/Backpacking", cultural_immersion: "Cultural Immersion",
                        address_immediately: "Address immediately", need_time_process: "Need time to process first",
                        yes_dogs: "Yes, dogs", yes_cats: "Yes, cats", yes_other: "Yes, other", no_pets: "No, not a pet person",
                        city_apartment: "City apartment/condo", suburban_house: "Suburban house", rural_countryside: "Rural/Countryside",
                        fully_joint: "Fully joint", mostly_separate: "Mostly separate with shared expenses", completely_separate: "Completely separate"
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
                    personalityAssessments: "Personality & Compatibility Assessments",
                    communication_guides: "Communication Guides & Resources", 
                    conflict_resolution_aids: "Conflict Resolution Aids", 
                    relationship_closure_tools: "Relationship Closure Tools", 
                    counseling: "Relationship Counseling & Therapy",
                    legal: "Legal Services & Marriage Laws",
                    preMarriage: "Pre-Marriage Services",
                    marriageEnhancement: "Marriage Enhancement",
                    familyPlanning: "Family Planning & Parenting",
                    crisisSupport: "Crisis & Support Services",
                    separationDivorce: "Separation & Divorce Services",
                    postDivorce: "Post-Divorce Support",
                    lgbtq: "LGBTQ+ Specific Services",
                    culturalTraditional: "Cultural & Traditional Services",
                    additionalGov: "Government & Educational Resources",
                    emergency: "Emergency Contacts Summary"
                },
                datingDesc: {
                    tinder: "Most popular swipe-based dating app globally. Free with premium options. Available in SA.",
                    bumble: "Women make the first move. For dating, friendship, and business networking. Available in SA.",
                    hinge: "App 'designed to be deleted,' uses profile prompts for deeper connections. Available in SA.",
                    okcupid: "Extensive questionnaire matching. Free with premium features. Available in SA.",
                    matchCom: "Established dating platform, subscription-based. Available in SA.",
                    pof: "Plenty of Fish. Free messaging, large user base. Available in SA.",
                    saDating: "Local South African dating site.",
                    meetSouthAfricans: "Community-focused platform for South Africans.",
                    afroRomance: "Interracial dating focus. Available in SA.",
                    singleMuslimsSA: "Islamic community dating for South Africans.",
                    eHarmony: "Scientific compatibility matching, premium service. Available in SA.",
                    christianMingle: "Faith-based dating for Christians. Available in SA.",
                    jdate: "Jewish community dating. Available in SA.",
                    eliteSingles: "Professional/educated focus for dating. Available in SA."
                },
                personalityAssessmentsDesc: {
                    "16personalities": "Myers-Briggs Type Indicator (MBTI) based. Comprehensive personality analysis. Free.",
                    bigFive: "Scientific personality assessment (OpenPsychometrics). Multiple versions available. Free.",
                    enneagramInstitute: "Free basic Enneagram test available. Nine personality types.",
                    loveLanguageQuiz: "Gary Chapman's Five Love Languages. Relationship communication styles. Free.",
                    attachmentStyleQuiz: "Various providers. Understand secure, anxious, avoidant, disorganized relationship patterns. Free.",
                    cliftonStrengths: "Strengths-based personality assessment by Gallup. Relationship applications. Paid.",
                    discAssessment: "Behavioral style assessment. Communication preferences. Multiple providers. Paid.",
                    jungTypology: "Professional MBTI assessment (HumanMetrics). Career and relationship insights. Paid.",
                    gottmanCheckup: "Evidence-based relationship assessment by Gottman Institute. Professional counselor developed.",
                    prepareEnrich: "Pre-marital and marital assessment. Used by counselors and therapists."
                },
                communication_guidesDesc: { 
                    gottmanCardDecks: "The Gottman Institute's card decks offer prompts for couples to deepen connection and manage conflict.",
                    fiveLoveLanguagesBook: "Gary Chapman's book helps understand how partners give and receive love.",
                    nonviolentCommunication: "Resources on Marshall Rosenberg's Nonviolent Communication (NVC) for empathetic dialogue."
                },
                conflict_resolution_aidsDesc: {
                    crucialConversationsBook: "Book offering skills for creating alignment and agreement when stakes are high.",
                    eftResources: "Emotionally Focused Therapy (EFT) resources for couples to understand and change negative interaction patterns.",
                    mediationServicesOnline: "Online directories for finding relationship mediators."
                },
                relationship_closure_toolsDesc: {
                    consciousUncouplingBook: "Book by Katherine Woodward Thomas on navigating breakups with grace.",
                    divorceSupportGroups: "Online and local support groups for individuals going through separation or divorce.",
                    griefCounseling: "Resources for finding counselors specializing in grief and loss related to relationships."
                },
                counselingDesc: {
                    saamft: "South African Association for Marriage and Family Therapy - Professional body.",
                    psyssa: "Psychological Society of South Africa - Professional body.",
                    sacssp: "South African Council for Social Service Professions - Regulatory body.",
                    lifeLineSA: "Crisis counseling and support. Multiple locations nationwide. 24/7 helpline.",
                    famsa: "Family and Marriage Society of SA. Marriage and family counseling. National coverage.",
                    akesoClinics: "Mental health and relationship therapy. Private healthcare.",
                    betterHelp: "International online therapy platform, available in South Africa.",
                    talkspace: "Text-based therapy, relationship counseling available. International, accessible in SA.",
                    saOnlineTherapy: "Local online counseling services for South Africans."
                },
                emergencyDesc: { 
                    lifeLineSAEmergency: "LifeLine SA: 0861 322 322 (24/7 emotional support).",
                    sadagSuicideHelpline: "SADAG Suicide Helpline: 0800 567 567.",
                    tearsFoundationEmergency: "Tears Foundation (Domestic Violence): 010 590 5920.",
                    gbvCommandCentreEmergency: "Gender-Based Violence Command Centre: 0800 428 428.",
                    policeEmergency: "Police Emergency: 10111.",
                    legalAidSAEmergency: "Legal Aid SA: 0800 110 110."
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
    xh: { translation: { nav: { home: "Ikhaya" } } },
    zu: { translation: { nav: { home: "Ikhaya" } } }
};

if (window.i18next && window.i18nextBrowserLanguageDetector) {
    window.i18next
        .use(window.i18nextBrowserLanguageDetector)
        .init({
            resources: translations,
            fallbackLng: 'en',
            debug: true, 
            interpolation: { escapeValue: false }
        }, (err, t) => {
            if (err) return console.error('i18next init error in shared.js:', err);
            console.log("i18next initialized successfully in shared.js.");
            updateUIWithTranslations();
            updateActiveNavLink(); 
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
const searchModalEl = document.getElementById('searchModal'); 
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
    
    const welcomeMsg = notificationsAreaEl.querySelector('.notification-item[data-i18n="notifications.welcome"]');
    if (welcomeMsg && notificationsAreaEl.children.length === 1 && message !== window.i18next.t('notifications.welcome')) {
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

document.querySelectorAll('.modal .close-button').forEach(button => {
    button.addEventListener('click', (e) => {
        const modal = e.target.closest('.modal');
        if(modal) closeModal(modal.id);
    });
});
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
    return page === "" ? "index.html" : page; 
}

function updateActiveNavLink() {
    const currentPage = getCurrentPageName();
    const navLinks = document.querySelectorAll('nav .nav-links a'); // Target <a> tags for MPA
    
    navLinks.forEach(link => {
        link.classList.remove('active-nav');
        const linkPage = link.getAttribute('href').split("/").pop();
        if (linkPage === currentPage || (currentPage === "index.html" && linkPage === "index.html")) { // Simpler check for MPA
            link.classList.add('active-nav');
        }
    });
    console.log("Active nav link updated for page:", currentPage);
}

// --- Authentication State & UI Update ---
async function handleAuthStateChanged(user) {
    showLoading(true);
    console.log("shared.js: Auth state changed. Firebase User:", user ? user.uid : "null");
    const tempProfile = JSON.parse(localStorage.getItem('tempProfile')); 

    if (user && !user.isAnonymous) { 
        loginBtnNavEl.style.display = 'none';
        registerBtnNavEl.style.display = 'none';
        logoutBtnNavEl.style.display = 'inline-block';
        navProfileBtnEl.style.display = 'inline-block';
        navProfileBtnEl.innerHTML = `<i class="fa-solid fa-user-circle"></i> ${user.displayName || i18next.t('nav.profile')}`;
        localStorage.removeItem('tempProfile'); 
        currentUserId = user.uid;
        isTempUser = false;
        await fetchAndCacheUserData(user.uid, `artifacts/${appIdFromGlobal}/users`);
    } else if (tempProfile && tempProfile.id && tempProfile.expiresAt && new Date(tempProfile.expiresAt) > new Date()) { 
        loginBtnNavEl.style.display = 'none';
        registerBtnNavEl.style.display = 'none';
        logoutBtnNavEl.style.display = 'inline-block'; 
        navProfileBtnEl.style.display = 'inline-block';
        navProfileBtnEl.innerHTML = `<i class="fa-solid fa-user-clock"></i> ${tempProfile.username || i18next.t('nav.profile')}`;
        currentUserId = tempProfile.id;
        isTempUser = true;
        await fetchAndCacheUserData(tempProfile.id, `artifacts/${appIdFromGlobal}/public/data/tempProfiles`);
    } else { 
        loginBtnNavEl.style.display = 'inline-block';
        registerBtnNavEl.style.display = 'inline-block';
        logoutBtnNavEl.style.display = 'none';
        navProfileBtnEl.style.display = 'none';
        currentUserId = auth?.currentUser?.isAnonymous ? auth.currentUser.uid : null;
        isTempUser = false;
        currentUserData = null;
        if (tempProfile) localStorage.removeItem('tempProfile'); 
    }
    if (typeof updatePageSpecificOnAuthStateChange === 'function') {
        updatePageSpecificOnAuthStateChange(user, tempProfile);
    }
    showLoading(false);
}

async function fetchAndCacheUserData(userId, collectionPath) {
    if (!db || !userId) {
        currentUserData = null;
        if (typeof updatePageSpecificOnUserData === 'function') updatePageSpecificOnUserData(currentUserData);
        return;
    }
    const userDocRef = window.firebase.firestore().doc(db, collectionPath, userId);
    try {
        const docSnap = await window.firebase.firestore().getDoc(userDocRef);
        if (docSnap.exists()) {
            currentUserData = docSnap.data();
            console.log("User data cached:", currentUserData);
        } else {
            console.log("No such user document for caching! User ID:", userId, "Path:", collectionPath);
            currentUserData = null;
        }
    } catch (error) {
        console.error("Error fetching user data for cache:", error);
        currentUserData = null;
    }
    if (typeof updatePageSpecificOnUserData === 'function') {
        updatePageSpecificOnUserData(currentUserData);
    }
}

// --- Global Event Listeners ---
loginBtnNavEl?.addEventListener('click', () => showModal('loginModal'));
registerBtnNavEl?.addEventListener('click', () => showModal('registerModal'));
logoutBtnNavEl?.addEventListener('click', async () => { /* ... (same as before, ensure it calls handleAuthStateChanged(null) or similar to reset UI) ... */ });

languageSelectorEl?.addEventListener('change', function() { /* ... (same as before) ... */ });
globalSearchTriggerBtnEl?.addEventListener('click', () => showModal('searchModal'));

// --- Helper to get profile reference ---
function getProfileRef() {
    if (!firebaseInitialized || !db) {
        console.error("getProfileRef: Firebase not initialized or DB not available.");
        return null;
    }
    if (currentUserId) {
        const collectionPath = isTempUser ? 
            `artifacts/${appIdFromGlobal}/public/data/tempProfiles` : 
            `artifacts/${appIdFromGlobal}/users`;
        return window.firebase.firestore().doc(db, collectionPath, currentUserId);
    }
    console.warn("getProfileRef: No currentUserId available.");
    return null;
}


// --- DOMContentLoaded ---
// Call initializations on script load, after specific page scripts might have defined their functions
document.addEventListener('DOMContentLoaded', () => {
    console.log("shared.js: DOMContentLoaded");
    initializeFirebaseAndAuth(); // This will also set up onAuthStateChanged

    if (window.i18next && !window.i18next.isInitialized) {
        console.warn("i18next was not initialized, attempting now from DOMContentLoaded.");
        window.i18next.init({
            resources: translations, fallbackLng: 'en', debug: true, interpolation: { escapeValue: false }
        }, (err,t) => {
             if (err) return console.error('Fallback i18next init error:', err);
             updateUIWithTranslations();
             updateActiveNavLink();
        });
    } else if (window.i18next && window.i18next.isInitialized) {
        updateUIWithTranslations(); 
        updateActiveNavLink();
    }

    const yearEl = document.getElementById('currentYearFooter');
    if(yearEl) yearEl.textContent = new Date().getFullYear();

    // Attach modal open/close listeners (ensure these are generic enough)
    document.querySelectorAll('[data-modal-target]').forEach(trigger => {
        trigger.addEventListener('click', () => {
            const modalId = trigger.dataset.modalTarget;
            showModal(modalId);
        });
    });
     document.querySelectorAll('[data-modal-id]').forEach(modal => {
        modal.querySelectorAll('.close-button, [data-modal-close]').forEach(closeBtn => {
            closeBtn.addEventListener('click', () => closeModal(modal.id));
        });
    });
});

// Expose functions that might be needed globally
window.LifeSyncShared = {
    showLoading,
    showNotification,
    sanitizeInput,
    showModal,
    closeModal,
    closeAllModals,
    getCurrentPageName,
    updateActiveNavLink,
    getProfileRef,
    currentUserId: () => currentUserId, // Getter for reactive updates
    isTempUser: () => isTempUser,     // Getter
    appIdFromGlobal,
    db: () => db,                     // Getter
    auth: () => auth,                   // Getter
    storage: () => storage,             // Getter
    firebaseInitialized: () => firebaseInitialized,
    currentUserData: () => currentUserData, // Getter
    translations, // Expose translations for page-specific needs if any
    updateUIWithTranslations, // Expose for manual re-trigger if needed
    handleAuthStateChanged, // Expose if needed for manual trigger
    fetchAndCacheUserData // Expose for manual trigger
};

console.log("shared.js loaded and executed.");

