import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: {
          "Dark Mode": "Dark Mode",
          "Language": "Language",
          "Mobile App": "Mobile App",
          "Download App": "Download App",
          "Switch between light and dark themes": "Switch between light and dark themes",
          "Choose your preferred language": "Choose your preferred language",
          "Download our mobile app for the best experience": "Download our mobile app for the best experience",
          "Preferences": "Preferences",
          "Notifications": "Notifications",
          "Portfolio Updates": "Portfolio Updates",
          "Rebalance Alerts": "Rebalance Alerts",
          "Market News": "Market News",
          "Security Alerts": "Security Alerts",
          "Get notified about portfolio performance": "Get notified about portfolio performance",
          "Notifications when rebalancing is recommended": "Notifications when rebalancing is recommended",
          "Important market updates and analysis": "Important market updates and analysis",
          "Critical security notifications": "Critical security notifications",
          "Turn All On": "Turn All On",
          "Turn All Off": "Turn All Off"
        }
      },
      ar: {
        translation: {
          "Dark Mode": "الوضع الليلي",
          "Language": "اللغة",
          "Mobile App": "تطبيق الجوال",
          "Download App": "تحميل التطبيق",
          "Switch between light and dark themes": "تبديل بين الوضع الفاتح والداكن",
          "Choose your preferred language": "اختر لغتك المفضلة",
          "Download our mobile app for the best experience": "حمّل تطبيقنا لأفضل تجربة",
          "Preferences": "التفضيلات",
          "Notifications": "الإشعارات",
          "Portfolio Updates": "تحديثات المحفظة",
          "Rebalance Alerts": "تنبيهات إعادة التوازن",
          "Market News": "أخبار السوق",
          "Security Alerts": "تنبيهات الأمان",
          "Get notified about portfolio performance": "تلقي إشعارات عن أداء المحفظة",
          "Notifications when rebalancing is recommended": "تنبيهات عند التوصية بإعادة التوازن",
          "Important market updates and analysis": "تحديثات وتحليلات السوق الهامة",
          "Critical security notifications": "تنبيهات أمان حرجة",
          "Turn All On": "تفعيل الكل",
          "Turn All Off": "إيقاف الكل"
        }
      }
    },
    lng: localStorage.getItem('language') || 'en',
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  });

export default i18n; 