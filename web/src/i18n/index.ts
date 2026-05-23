import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import enCommon from './locales/en/common.json'
import enMenu from './locales/en/menu.json'
import enOrder from './locales/en/order.json'
import enStaff from './locales/en/staff.json'
import enReports from './locales/en/reports.json'

import myCommon from './locales/my/common.json'
import myMenu from './locales/my/menu.json'
import myOrder from './locales/my/order.json'
import myStaff from './locales/my/staff.json'
import myReports from './locales/my/reports.json'

i18n.use(initReactI18next).init({
  resources: {
    en: { common: enCommon, menu: enMenu, order: enOrder, staff: enStaff, reports: enReports },
    my: { common: myCommon, menu: myMenu, order: myOrder, staff: myStaff, reports: myReports },
  },
  lng: localStorage.getItem('lang') || 'en',
  fallbackLng: 'en',
  ns: ['common', 'menu', 'order', 'staff', 'reports'],
  defaultNS: 'common',
  interpolation: { escapeValue: false },
})

export default i18n
