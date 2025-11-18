// Simple i18n setup for the app.
// Centralizes all translation strings so they can be reused by multiple screens.

export const LOCALES = {
  EN: 'en',
  AR: 'ar',
}

export const TRANSLATIONS = {
  en: {
    headerTitle: 'Welcome to Your Clinic Management System',
    headerSubtitle: 'Register your clinic and get started in minutes',
    clinicInfoTitle: 'Clinic Information',
    clinicNameLabel: 'Clinic Name',
    clinicNamePlaceholder: 'Enter your clinic name',
    emailLabel: 'Email Address',
    emailPlaceholder: 'admin@clinic.com',
    phoneLabel: 'Phone Number',
    phonePlaceholder: '+1 (555) 123-4567',
    subscriptionTitle: 'Choose Your Subscription Plan',
    plans: {
      basic: {
        name: 'Basic',
        price: '$29/month',
        features: ['Up to 5 doctors', 'Basic scheduling', 'Email support'],
      },
      professional: {
        name: 'Professional',
        price: '$79/month',
        features: ['Up to 20 doctors', 'Advanced scheduling', 'Priority support', 'Analytics'],
      },
      enterprise: {
        name: 'Enterprise',
        price: '$199/month',
        features: ['Unlimited doctors', 'Full features', '24/7 support', 'Custom integrations'],
      },
    },
    registerButton: 'Register & Continue',
    registering: 'Registering…',
    success: 'Clinic registered successfully.',
    fallbackError: 'Registration failed. Please try again.',
    loginTitle: 'Sign in to your account',
    loginButton: 'Sign in',
    loginSubmitting: 'Signing in…',
    passwordLabel: 'Password',
    passwordPlaceholder: 'Enter your password',
  },
  ar: {
    headerTitle: 'مرحباً بك في نظام إدارة العيادة',
    headerSubtitle: 'سجّل عيادتك وابدأ خلال دقائق',
    clinicInfoTitle: 'معلومات العيادة',
    clinicNameLabel: 'اسم العيادة',
    clinicNamePlaceholder: 'أدخل اسم العيادة',
    emailLabel: 'البريد الإلكتروني',
    emailPlaceholder: 'admin@clinic.com',
    phoneLabel: 'رقم الهاتف',
    phonePlaceholder: '+1 (555) 123-4567',
    subscriptionTitle: 'اختر خطة الاشتراك',
    plans: {
      basic: {
        name: 'الأساسية',
        price: '$29 / شهرياً',
        features: ['حتى 5 أطباء', 'جدولة أساسية', 'دعم عبر البريد الإلكتروني'],
      },
      professional: {
        name: 'المحترفة',
        price: '$79 / شهرياً',
        features: ['حتى 20 طبيباً', 'جدولة متقدمة', 'دعم أولوية', 'تحليلات'],
      },
      enterprise: {
        name: 'الشركات',
        price: '$199 / شهرياً',
        features: ['عدد غير محدود من الأطباء', 'كل المميزات', 'دعم 24/7', 'تكاملات مخصصة'],
      },
    },
    registerButton: 'تسجيل ومتابعة',
    registering: 'جاري التسجيل…',
    success: 'تم تسجيل العيادة بنجاح.',
    fallbackError: 'فشل تسجيل العيادة. حاول مرة أخرى.',
    loginTitle: 'تسجيل الدخول إلى حسابك',
    loginButton: 'تسجيل الدخول',
    loginSubmitting: 'جاري تسجيل الدخول…',
    passwordLabel: 'كلمة المرور',
    passwordPlaceholder: 'أدخل كلمة المرور',
  },
}

export function getTranslations(locale) {
  return TRANSLATIONS[locale] || TRANSLATIONS[LOCALES.EN]
}


