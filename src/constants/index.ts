export const APP_NAME = "BetterME";
export const APP_TAGLINE = "Your AI-Powered Body Transformation Buddy";
export const APP_DESCRIPTION =
  "Transform your body with AI-powered workouts, nutrition tracking, meal plans, and a 24/7 personal coach.";

// Subscription Plans
export const PLANS = {
  pro_monthly: {
    id: "pro_monthly",
    name: "Pro Monthly",
    price: 9.99,
    priceCurrency: "USD",
    priceNGN: 2999,
    interval: "monthly",
    features: [
      "AI Food Photo Analyzer",
      "AI Personalized Meal Plans",
      "AI Workout Generator",
      "24/7 AI Coach Chat",
      "Full Progress Tracking",
      "Community Access",
      "No Ads",
    ],
  },
  pro_annual: {
    id: "pro_annual",
    name: "Pro Annual",
    price: 79.99,
    priceCurrency: "USD",
    priceNGN: 29999,
    interval: "annual",
    savings: "Save 33%!",
    features: [
      "Everything in Pro Monthly",
      "Save $40/year",
    ],
  },
  premium_monthly: {
    id: "premium_monthly",
    name: "Premium Monthly",
    price: 24.99,
    priceCurrency: "USD",
    priceNGN: 7999,
    interval: "monthly",
    features: [
      "Everything in Pro",
      "Advanced Analytics & Insights",
      "Family Mode",
      "Priority AI Responses",
      "Custom Programs",
      "Export Reports",
      "Early Access Features",
    ],
  },
  premium_annual: {
    id: "premium_annual",
    name: "Premium Annual",
    price: 199.99,
    priceCurrency: "USD",
    priceNGN: 79999,
    interval: "annual",
    savings: "Save 33%!",
    features: [
      "Everything in Premium Monthly",
      "Save $100/year",
    ],
  },
};

// Trial Duration
export const TRIAL_DURATION_HOURS = 24;

// Goals
export const GOALS = [
  {
    id: "fat_loss",
    label: "Lose Fat",
    icon: "🔥",
    description: "Burn fat while keeping muscle",
  },
  {
    id: "muscle_gain",
    label: "Build Muscle",
    icon: "💪",
    description: "Get bigger and stronger",
  },
  {
    id: "get_lean",
    label: "Get Lean",
    icon: "🏃",
    description: "Slim down and tone up",
  },
  {
    id: "body_recomp",
    label: "Body Recomp",
    icon: "⚖️",
    description: "Lose fat + gain muscle",
  },
  {
    id: "strength",
    label: "Get Stronger",
    icon: "🏋️",
    description: "Increase strength & power",
  },
  {
    id: "general_fitness",
    label: "General Fitness",
    icon: "🧘",
    description: "Feel better overall",
  },
];

// Activity Levels
export const ACTIVITY_LEVELS = [
  {
    id: "sedentary",
    label: "Sedentary",
    description: "Desk job, no exercise",
  },
  {
    id: "lightly_active",
    label: "Lightly Active",
    description: "1-2 workouts/week",
  },
  {
    id: "moderately_active",
    label: "Moderately Active",
    description: "3-4 workouts/week",
  },
  {
    id: "very_active",
    label: "Very Active",
    description: "5-6 workouts/week",
  },
  {
    id: "extremely_active",
    label: "Extremely Active",
    description: "Athlete / physical job",
  },
];

// Equipment Options
export const EQUIPMENT_OPTIONS = [
  { id: "none", label: "No Equipment", icon: "🤸" },
  { id: "dumbbells", label: "Dumbbells", icon: "🏋️" },
  { id: "barbell", label: "Barbell & Rack", icon: "🏋️‍♂️" },
  { id: "resistance_bands", label: "Resistance Bands", icon: "🔗" },
  { id: "pullup_bar", label: "Pull-up Bar", icon: "🔩" },
  { id: "kettlebell", label: "Kettlebell", icon: "🔔" },
  { id: "cardio_machines", label: "Treadmill / Bike", icon: "🚴" },
  { id: "full_gym", label: "Full Gym Access", icon: "🏢" },
];

// Workout Locations
export const WORKOUT_LOCATIONS = [
  { id: "home", label: "Home", icon: "🏠" },
  { id: "gym", label: "Gym", icon: "🏋️" },
  { id: "outdoor", label: "Outdoors", icon: "🏃" },
  { id: "office", label: "Office", icon: "🏢" },
];

// Experience Levels
export const EXPERIENCE_LEVELS = [
  { id: "beginner", label: "Complete Beginner", icon: "🌱" },
  { id: "some_experience", label: "Some Experience", icon: "📈", description: "< 1 year" },
  { id: "intermediate", label: "Intermediate", icon: "💪", description: "1-3 years" },
  { id: "advanced", label: "Advanced", icon: "🏆", description: "3+ years" },
];

// Dietary Preferences
export const DIETARY_PREFERENCES = [
  { id: "none", label: "No Restrictions", icon: "🍖" },
  { id: "vegetarian", label: "Vegetarian", icon: "🥗" },
  { id: "vegan", label: "Vegan", icon: "🌱" },
  { id: "keto", label: "Keto / Low Carb", icon: "🥩" },
  { id: "pescatarian", label: "Pescatarian", icon: "🐟" },
  { id: "halal", label: "Halal", icon: "🕌" },
  { id: "kosher", label: "Kosher", icon: "✡️" },
  { id: "other", label: "Other", icon: "📝" },
];

// Allergies
export const ALLERGY_OPTIONS = [
  { id: "none", label: "None" },
  { id: "nuts", label: "🥜 Nuts" },
  { id: "dairy", label: "🥛 Dairy / Lactose" },
  { id: "gluten", label: "🌾 Gluten" },
  { id: "eggs", label: "🥚 Eggs" },
  { id: "shellfish", label: "🐟 Shellfish" },
  { id: "soy", label: "🫘 Soy" },
];

// Meals Per Day
export const MEALS_PER_DAY_OPTIONS = [
  { id: "3_meals", label: "3 meals" },
  { id: "3_meals_1_snack", label: "3 meals + 1 snack" },
  { id: "3_meals_2_snacks", label: "3 meals + 2 snacks" },
  { id: "2_meals_if", label: "2 meals (IF)" },
  { id: "flexible", label: "Whatever you suggest" },
];

// Cooking Skills
export const COOKING_SKILLS = [
  { id: "beginner", label: "Can barely boil water", icon: "🔥" },
  { id: "basic", label: "Basic cooking", icon: "🍳" },
  { id: "good", label: "Good cook", icon: "👨‍🍳" },
  { id: "chef", label: "Chef level", icon: "🧑‍🍳" },
];

// Workout Durations
export const WORKOUT_DURATIONS = [
  { id: "15", label: "15-20 min" },
  { id: "30", label: "30 min" },
  { id: "45", label: "45 min" },
  { id: "60", label: "60 min" },
  { id: "90", label: "90+ min" },
];

// Workout Times
export const WORKOUT_TIMES = [
  { id: "morning", label: "Morning", icon: "🌅", description: "6am-12pm" },
  { id: "afternoon", label: "Afternoon", icon: "☀️", description: "12pm-5pm" },
  { id: "evening", label: "Evening", icon: "🌙", description: "5pm-10pm" },
  { id: "varies", label: "Varies", icon: "🔄", description: "Different each day" },
];

// Days of Week
export const DAYS_OF_WEEK = [
  { id: "mon", label: "Mon", full: "Monday" },
  { id: "tue", label: "Tue", full: "Tuesday" },
  { id: "wed", label: "Wed", full: "Wednesday" },
  { id: "thu", label: "Thu", full: "Thursday" },
  { id: "fri", label: "Fri", full: "Friday" },
  { id: "sat", label: "Sat", full: "Saturday" },
  { id: "sun", label: "Sun", full: "Sunday" },
];

// Navigation Items
export const NAV_ITEMS = [
  { id: "dashboard", label: "Home", icon: "Home", path: "/dashboard" },
  { id: "nutrition", label: "Nutrition", icon: "UtensilsCrossed", path: "/nutrition" },
  { id: "workout", label: "Workout", icon: "Dumbbell", path: "/workout" },
  { id: "progress", label: "Progress", icon: "TrendingUp", path: "/progress" },
  { id: "coach", label: "Coach", icon: "Bot", path: "/coach" },
];