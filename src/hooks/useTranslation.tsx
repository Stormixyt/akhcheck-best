import { useState, createContext, useContext, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Languages } from 'lucide-react';

interface TranslationContextType {
  language: 'en' | 'nl';
  t: (key: string) => string;
  toggleLanguage: () => void;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

// Comprehensive Translation Dictionary
const translations = {
  en: {
    // General
    'welcome': 'Welcome',
    'loading': 'Loading...',
    'save': 'Save',
    'cancel': 'Cancel',
    'delete': 'Delete',
    'edit': 'Edit',
    'close': 'Close',
    'settings': 'Settings',
    'notifications': 'Notifications',
    'profile': 'Profile',
    'back': 'Back',
    'next': 'Next',
    'confirm': 'Confirm',
    'yes': 'Yes',
    'no': 'No',
    'error': 'Error',
    'success': 'Success',
    'warning': 'Warning',
    'info': 'Info',
    
    // Navigation & App
    'akhcheck': 'AkhCheck',
    'home': 'Home',
    'groups': 'Groups',
    'chat': 'Chat',
    'leaderboard': 'Leaderboard',
    'stats': 'Stats',
    'account': 'Account',
    'sign_out': 'Sign Out',
    'sign_in': 'Sign In',
    'sign_up': 'Sign Up',
    
    // Home Page & Status
    'daily_challenge': "Today's Challenge",
    'prayer_times': 'Prayer Times',
    'streak': 'day streak',
    'current_streak': 'Current Streak',
    'longest_streak': 'Longest Streak',
    'how_did_you_do': 'How did you do today?',
    'i_succeeded': 'I Succeeded',
    'i_stayed_disciplined': 'I stayed disciplined',
    'i_gooned': 'I gooned',
    'status_updated': 'Status updated for today!',
    'disciplined_today': 'Disciplined today',
    'struggled_today': 'Struggled today',
    'already_checked_in': 'Already checked in',
    'you': 'You',
    
    // Personal Stats
    'personal_stats': 'Personal Stats',
    'your_discipline_journey': 'Your discipline journey insights',
    'success_rate': 'Success Rate',
    'total_checkins': 'Total Check-ins',
    'this_week': 'This Week',
    'trends': 'Trends',
    'last_7_days': 'Last 7 days',
    'month_trend': '6-month trend',
    'achievements': 'Achievements',
    'export': 'Export',
    'export_data': 'Export Data',
    'week_warrior': '🔥 Week Warrior',
    'month_master': '💪 Month Master',
    'consistency_champion': '⭐ Consistency Champion',
    'discipline_legend': '🏆 Discipline Legend',
    'century_club': '🎯 Century Club',
    
    // Prayer Times & Islamic Features
    'next_prayer': 'Next',
    'fajr': 'Fajr',
    'dhuhr': 'Dhuhr',
    'asr': 'Asr',
    'maghrib': 'Maghrib',
    'isha': 'Isha',
    'fasting_tracker': 'Fasting Tracker',
    'mark_fasting': 'Mark Fasting',
    'fasting': 'Fasting',
    'fasting_recorded': 'Fasting recorded! 🌙',
    'may_allah_make_easy': 'May Allah make it easy for you',
    'suhoor_ends': 'Suhoor ends',
    'iftar_time': 'Iftar time',
    'ramadan': '🌙 Ramadan',
    'day_streak_fasting': 'day streak',
    
    // Groups
    'create_group': 'Create Group',
    'join_group': 'Join Group',
    'group_chat': 'Group Chat',
    'group_leaderboard': 'Group Leaderboard',
    'members': 'members',
    'days': 'days',
    'daily_checkin': 'Daily Check-in',
    'all_checked_in': 'Everyone has checked in today!',
    'streak_maintained': 'All members maintained their streak',
    'group_name': 'Group Name',
    'group_code': 'Group Code',
    'enter_group_code': 'Enter group code',
    'create': 'Create',
    'join': 'Join',
    'your_rank': 'Your rank',
    'today': 'Today',
    'this_month': 'This Month',
    'no_activity_yet': 'No activity yet this',
    'be_first_checkin': 'Be the first to check in!',
    'scoring_system': 'Scoring System',
    'disciplined_day_points': '✅ Disciplined day: +10 points',
    'failed_day_points': '❌ Failed day: -5 points',
    'rankings_update': '🏆 Rankings update every hour',
    
    // Challenges & Goals
    'mark_complete': 'Mark as Complete',
    'completed': 'Completed! 🎉',
    'easy': 'Easy',
    'medium': 'Medium',
    'hard': 'Hard',
    'daily_challenge_desc': 'Complete today\'s Islamic self-improvement challenge',
    'personal_goals': 'Personal Goals',
    'manage_daily_goals': 'Manage your daily discipline goals',
    'add_new_goal': 'Add a new goal...',
    'goal_created': 'Goal created! 🎯',
    'accountability_goal': 'Accountability Goal',
    'goal_title': 'Goal Title',
    'goal_description': 'Description (Optional)',
    'target_days': 'Target Days',
    'create_goal': 'Create Goal',
    'why_important': 'Why is this goal important to you?',
    'make_goal_public': 'Make this goal public',
    'goal_locked': 'Goal locked! 🔒',
    'cannot_modify_until_completion': 'This goal cannot be modified or deleted until completion',
    'lock_goal': 'Lock Goal',
    
    // Accountability Features
    'accountability_tools': 'Accountability Tools',
    'public_accountability': 'Public Accountability',
    'progress_visible': 'Your progress is visible to other group members',
    'progress_private': 'Your progress is private',
    'public': 'Public',
    'private': 'Private',
    'lock_in_mode': 'Lock-in Mode',
    'confirm_status': 'Confirm Your Status',
    'confirming_disciplined': 'Alhamdulillah! You\'re confirming that you stayed disciplined today. This will extend your streak.',
    'confirming_struggled': 'You\'re about to mark that you struggled today. This will reset your streak, but remember - every day is a new chance to grow stronger.',
    
    // Settings
    'general': 'General',
    'privacy': 'Privacy',
    'appearance': 'Theme',
    'data': 'Data',
    'display_name': 'Display Name',
    'contact_support_change': 'Contact support to change your display name',
    'edit_profile': 'Edit Profile',
    'daily_reminders': 'Daily Reminders',
    'get_daily_checkin_reminders': 'Get daily check-in reminders',
    'notification_sound': 'Notification Sound',
    'play_sound_notifications': 'Play sound for notifications',
    'reminder_time': 'Reminder Time',
    'quiet_mode': 'Quiet Mode',
    'only_essential_notifications': 'Only essential notifications',
    'privacy_security': 'Privacy & Security',
    'private_mode': 'Private Mode',
    'hide_stats_from_users': 'Hide your stats from other users',
    'anonymous_mode': 'Anonymous Mode',
    'show_as_anonymous': 'Show as "Anonymous User" in groups',
    'auto_logout': 'Auto-logout (minutes)',
    'minutes': 'minutes',
    'color_theme': 'Color Theme',
    'green': 'Green',
    'blue': 'Blue',
    'purple': 'Purple',
    'dark_mode': 'Dark Mode',
    'toggle_dark_light': 'Toggle dark/light theme',
    'blur_intensity': 'Blur Intensity',
    'font_size': 'Font Size',
    'small': 'Small',
    'large': 'Large',
    'animation_speed': 'Animation Speed',
    'slow': 'Slow',
    'normal': 'Normal',
    'fast': 'Fast',
    'data_management': 'Data Management',
    'export_my_data': 'Export My Data',
    'clear_local_data': 'Clear Local Data',
    'export_data_desc': 'Download all your AkhCheck data as JSON',
    'clear_data_desc': 'Remove all locally stored data (goals, preferences, etc.)',
    'danger_zone': 'Danger Zone',
    
    // Premium Features
    'premium': 'Premium',
    'premium_feature': 'Premium Feature',
    'unlock_feature': 'Unlock this feature and many more with AkhCheck Premium',
    'upgrade_to_premium': 'Upgrade to Premium',
    'money_back_guarantee': '30-day money-back guarantee',
    'welcome_to_premium': 'Welcome to Premium! 🎉',
    'premium_features_unlocked': 'All premium features are now unlocked',
    'upgrade_failed': 'Upgrade failed',
    'try_again_later': 'Please try again later',
    
    // Notifications & Toasts
    'total_notifications': 'Total notifications',
    'unread': 'Unread',
    'recent_activity': 'Recent Activity',
    'mark_all_read': 'Mark All as Read',
    'just_now': 'Just now',
    'hours_ago': 'hours ago',
    'days_ago': 'days ago',
    'data_exported': 'Data exported successfully',
    'data_downloaded': 'Your AkhCheck data has been downloaded',
    'export_failed': 'Export failed',
    'failed_export_data': 'Failed to export your data',
    'local_data_cleared': 'Local data cleared',
    'local_data_cleared_desc': 'All local application data has been cleared',
    'clear_failed': 'Clear failed',
    'failed_clear_data': 'Failed to clear local data',
    'public_accountability_enabled': 'Public accountability enabled',
    'stats_visible_members': 'Your stats are now visible to other members',
    'private_mode_enabled': 'Private mode enabled',
    'stats_now_private': 'Your stats are now private',
    'fasting_status_updated': 'Fasting status updated',
    'fast_not_observed': 'Your fast has been marked as not observed',
    'failed_update_fasting': 'Failed to update fasting status',
    'failed_update_settings': 'Failed to update settings',
    
    // Motivational & Islamic
    'alhamdulillah': 'Alhamdulillah! 🤲',
    'dont_give_up': "Don't give up 💚",
    'keep_going': 'Your discipline has been recorded!',
    'your_streak_continues': 'Your streak continues! Keep it up, akhi.',
    'tomorrow_new_chance': 'Tomorrow is a new chance. Make tawbah and restart.',
    'quran_verse': '"And whoever fears Allah - He will make for him a way out."',
    'quran_reference': '— Quran 65:2',
    'as_salamu_alaykum': 'As-salamu alaykum',
    
    // Common Actions
    'send': 'Send',
    'copy': 'Copy',
    'share': 'Share',
    'download': 'Download',
    'upload': 'Upload',
    'refresh': 'Refresh',
    'search': 'Search',
    'filter': 'Filter',
    'sort': 'Sort',
    'view': 'View',
    'hide': 'Hide',
    'show': 'Show',
    'expand': 'Expand',
    'collapse': 'Collapse',
    'maximize': 'Maximize',
    'minimize': 'Minimize',
    
    // Error Messages
    'something_went_wrong': 'Something went wrong',
    'try_again': 'Try again',
    'network_error': 'Network error',
    'check_connection': 'Check your internet connection',
    'server_error': 'Server error',
    'contact_support': 'Contact support if this persists',
    'invalid_input': 'Invalid input',
    'required_field': 'This field is required',
    'too_short': 'Too short',
    'too_long': 'Too long',
  },
  nl: {
    // General
    'welcome': 'Welkom',
    'loading': 'Laden...',
    'save': 'Opslaan',
    'cancel': 'Annuleren',
    'delete': 'Verwijderen',
    'edit': 'Bewerken',
    'close': 'Sluiten',
    'settings': 'Instellingen',
    'notifications': 'Meldingen',
    'profile': 'Profiel',
    'back': 'Terug',
    'next': 'Volgende',
    'confirm': 'Bevestigen',
    'yes': 'Ja',
    'no': 'Nee',
    'error': 'Fout',
    'success': 'Succes',
    'warning': 'Waarschuwing',
    'info': 'Info',
    
    // Navigation & App
    'akhcheck': 'AkhCheck',
    'home': 'Thuis',
    'groups': 'Groepen',
    'chat': 'Chat',
    'leaderboard': 'Ranglijst',
    'stats': 'Statistieken',
    'account': 'Account',
    'sign_out': 'Uitloggen',
    'sign_in': 'Inloggen',
    'sign_up': 'Registreren',
    
    // Home Page & Status
    'daily_challenge': 'Dagelijkse Uitdaging',
    'prayer_times': 'Gebedstijden',
    'streak': 'dagen streak',
    'current_streak': 'Huidige Streak',
    'longest_streak': 'Langste Streak',
    'how_did_you_do': 'Hoe ging het vandaag?',
    'i_succeeded': 'Gelukt',
    'i_stayed_disciplined': 'Ik bleef gedisciplineerd',
    'i_gooned': 'Ik gooned',
    'status_updated': 'Status bijgewerkt voor vandaag!',
    'disciplined_today': 'Gedisciplineerd vandaag',
    'struggled_today': 'Geworsteld vandaag',
    'already_checked_in': 'Al ingecheckt',
    'you': 'Jij',
    
    // Personal Stats
    'personal_stats': 'Persoonlijke Statistieken',
    'your_discipline_journey': 'Jouw discipline reis inzichten',
    'success_rate': 'Succespercentage',
    'total_checkins': 'Totaal Check-ins',
    'this_week': 'Deze Week',
    'trends': 'Trends',
    'last_7_days': 'Laatste 7 dagen',
    'month_trend': '6-maanden trend',
    'achievements': 'Prestaties',
    'export': 'Exporteren',
    'export_data': 'Data Exporteren',
    'week_warrior': '🔥 Week Krijger',
    'month_master': '💪 Maand Meester',
    'consistency_champion': '⭐ Consistentie Kampioen',
    'discipline_legend': '🏆 Discipline Legende',
    'century_club': '🎯 Eeuw Club',
    
    // Prayer Times & Islamic Features
    'next_prayer': 'Volgende',
    'fajr': 'Fajr',
    'dhuhr': 'Dhuhr',
    'asr': 'Asr',
    'maghrib': 'Maghrib',
    'isha': 'Isha',
    'fasting_tracker': 'Vasten Tracker',
    'mark_fasting': 'Markeer Vasten',
    'fasting': 'Vasten',
    'fasting_recorded': 'Vasten geregistreerd! 🌙',
    'may_allah_make_easy': 'Moge Allah het makkelijk voor je maken',
    'suhoor_ends': 'Suhoor eindigt',
    'iftar_time': 'Iftar tijd',
    'ramadan': '🌙 Ramadan',
    'day_streak_fasting': 'dagen streak',
    
    // Groups
    'create_group': 'Groep Maken',
    'join_group': 'Groep Joinen',
    'group_chat': 'Groep Chat',
    'group_leaderboard': 'Groep Ranglijst',
    'members': 'leden',
    'days': 'dagen',
    'daily_checkin': 'Dagelijkse Check-in',
    'all_checked_in': 'Iedereen heeft vandaag ingecheckt!',
    'streak_maintained': 'Alle leden behielden hun streak',
    'group_name': 'Groepsnaam',
    'group_code': 'Groepscode',
    'enter_group_code': 'Voer groepscode in',
    'create': 'Maken',
    'join': 'Joinen',
    'your_rank': 'Jouw rang',
    'today': 'Vandaag',
    'this_month': 'Deze Maand',
    'no_activity_yet': 'Nog geen activiteit deze',
    'be_first_checkin': 'Wees de eerste die incheckt!',
    'scoring_system': 'Punten Systeem',
    'disciplined_day_points': '✅ Gedisciplineerde dag: +10 punten',
    'failed_day_points': '❌ Gefaalde dag: -5 punten',
    'rankings_update': '🏆 Rankings updaten elk uur',
    
    // Challenges & Goals
    'mark_complete': 'Markeer als Voltooid',
    'completed': 'Voltooid! 🎉',
    'easy': 'Makkelijk',
    'medium': 'Gemiddeld',
    'hard': 'Moeilijk',
    'daily_challenge_desc': 'Voltooi vandaag\'s islamitische zelfverbetering uitdaging',
    'personal_goals': 'Persoonlijke Doelen',
    'manage_daily_goals': 'Beheer je dagelijkse discipline doelen',
    'add_new_goal': 'Voeg een nieuw doel toe...',
    'goal_created': 'Doel gemaakt! 🎯',
    'accountability_goal': 'Verantwoordelijkheid Doel',
    'goal_title': 'Doel Titel',
    'goal_description': 'Beschrijving (Optioneel)',
    'target_days': 'Doel Dagen',
    'create_goal': 'Doel Maken',
    'why_important': 'Waarom is dit doel belangrijk voor je?',
    'make_goal_public': 'Maak dit doel openbaar',
    'goal_locked': 'Doel vergrendeld! 🔒',
    'cannot_modify_until_completion': 'Dit doel kan niet worden gewijzigd of verwijderd tot voltooiing',
    'lock_goal': 'Vergrendel Doel',
    
    // Accountability Features
    'accountability_tools': 'Verantwoordelijkheid Tools',
    'public_accountability': 'Openbare Verantwoordelijkheid',
    'progress_visible': 'Je voortgang is zichtbaar voor andere groepsleden',
    'progress_private': 'Je voortgang is privé',
    'public': 'Openbaar',
    'private': 'Privé',
    'lock_in_mode': 'Vergrendel Modus',
    'confirm_status': 'Bevestig Je Status',
    'confirming_disciplined': 'Alhamdulillah! Je bevestigt dat je gedisciplineerd bleef vandaag. Dit zal je streak verlengen.',
    'confirming_struggled': 'Je staat op het punt te markeren dat je worstelde vandaag. Dit zal je streak resetten, maar onthoud - elke dag is een nieuwe kans om sterker te worden.',
    
    // Settings
    'general': 'Algemeen',
    'privacy': 'Privacy',
    'appearance': 'Thema',
    'data': 'Data',
    'display_name': 'Weergavenaam',
    'contact_support_change': 'Neem contact op met support om je weergavenaam te wijzigen',
    'edit_profile': 'Profiel Bewerken',
    'daily_reminders': 'Dagelijkse Herinneringen',
    'get_daily_checkin_reminders': 'Ontvang dagelijkse check-in herinneringen',
    'notification_sound': 'Meldingsgeluid',
    'play_sound_notifications': 'Speel geluid af voor meldingen',
    'reminder_time': 'Herinneringstijd',
    'quiet_mode': 'Stille Modus',
    'only_essential_notifications': 'Alleen essentiële meldingen',
    'privacy_security': 'Privacy & Beveiliging',
    'private_mode': 'Privé Modus',
    'hide_stats_from_users': 'Verberg je statistieken van andere gebruikers',
    'anonymous_mode': 'Anonieme Modus',
    'show_as_anonymous': 'Toon als "Anonieme Gebruiker" in groepen',
    'auto_logout': 'Auto-uitloggen (minuten)',
    'minutes': 'minuten',
    'color_theme': 'Kleur Thema',
    'green': 'Groen',
    'blue': 'Blauw',
    'purple': 'Paars',
    'dark_mode': 'Donkere Modus',
    'toggle_dark_light': 'Schakel donker/licht thema',
    'blur_intensity': 'Vervaging Intensiteit',
    'font_size': 'Lettergrootte',
    'small': 'Klein',
    'large': 'Groot',
    'animation_speed': 'Animatie Snelheid',
    'slow': 'Langzaam',
    'normal': 'Normaal',
    'fast': 'Snel',
    'data_management': 'Data Beheer',
    'export_my_data': 'Mijn Data Exporteren',
    'clear_local_data': 'Lokale Data Wissen',
    'export_data_desc': 'Download al je AkhCheck data als JSON',
    'clear_data_desc': 'Verwijder alle lokaal opgeslagen data (doelen, voorkeuren, etc.)',
    'danger_zone': 'Gevaar Zone',
    
    // Premium Features
    'premium': 'Premium',
    'premium_feature': 'Premium Functie',
    'unlock_feature': 'Ontgrendel deze functie en vele meer met AkhCheck Premium',
    'upgrade_to_premium': 'Upgrade naar Premium',
    'money_back_guarantee': '30-dagen geld-terug garantie',
    'welcome_to_premium': 'Welkom bij Premium! 🎉',
    'premium_features_unlocked': 'Alle premium functies zijn nu ontgrendeld',
    'upgrade_failed': 'Upgrade mislukt',
    'try_again_later': 'Probeer het later opnieuw',
    
    // Notifications & Toasts
    'total_notifications': 'Totaal meldingen',
    'unread': 'Ongelezen',
    'recent_activity': 'Recente Activiteit',
    'mark_all_read': 'Alle Markeren als Gelezen',
    'just_now': 'Zojuist',
    'hours_ago': 'uur geleden',
    'days_ago': 'dagen geleden',
    'data_exported': 'Data succesvol geëxporteerd',
    'data_downloaded': 'Je AkhCheck data is gedownload',
    'export_failed': 'Export mislukt',
    'failed_export_data': 'Kon data niet exporteren',
    'local_data_cleared': 'Lokale data gewist',
    'local_data_cleared_desc': 'Alle lokale applicatie data is gewist',
    'clear_failed': 'Wissen mislukt',
    'failed_clear_data': 'Kon lokale data niet wissen',
    'public_accountability_enabled': 'Openbare verantwoordelijkheid ingeschakeld',
    'stats_visible_members': 'Je statistieken zijn nu zichtbaar voor andere leden',
    'private_mode_enabled': 'Privé modus ingeschakeld',
    'stats_now_private': 'Je statistieken zijn nu privé',
    'fasting_status_updated': 'Vasten status bijgewerkt',
    'fast_not_observed': 'Je vasten is gemarkeerd als niet waargenomen',
    'failed_update_fasting': 'Kon vasten status niet bijwerken',
    'failed_update_settings': 'Kon instellingen niet bijwerken',
    
    // Motivational & Islamic
    'alhamdulillah': 'Alhamdulillah! 🤲',
    'dont_give_up': 'Geef niet op 💚',
    'keep_going': 'Je discipline is geregistreerd!',
    'your_streak_continues': 'Je streak gaat door! Blijf zo doorgaan, akhi.',
    'tomorrow_new_chance': 'Morgen is een nieuwe kans. Maak tawbah en begin opnieuw.',
    'quran_verse': '"En wie Allah vreest - Hij zal voor hem een uitweg maken."',
    'quran_reference': '— Koran 65:2',
    'as_salamu_alaykum': 'As-salamu alaykum',
    
    // Common Actions
    'send': 'Verzenden',
    'copy': 'Kopiëren',
    'share': 'Delen',
    'download': 'Downloaden',
    'upload': 'Uploaden',
    'refresh': 'Vernieuwen',
    'search': 'Zoeken',
    'filter': 'Filteren',
    'sort': 'Sorteren',
    'view': 'Bekijken',
    'hide': 'Verbergen',
    'show': 'Tonen',
    'expand': 'Uitklappen',
    'collapse': 'Inklappen',
    'maximize': 'Maximaliseren',
    'minimize': 'Minimaliseren',
    
    // Error Messages
    'something_went_wrong': 'Er is iets misgegaan',
    'try_again': 'Probeer opnieuw',
    'network_error': 'Netwerkfout',
    'check_connection': 'Controleer je internetverbinding',
    'server_error': 'Serverfout',
    'contact_support': 'Neem contact op met support als dit aanhoudt',
    'invalid_input': 'Ongeldige invoer',
    'required_field': 'Dit veld is verplicht',
    'too_short': 'Te kort',
    'too_long': 'Te lang',
  }
};

export const TranslationProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<'en' | 'nl'>(() => {
    return (localStorage.getItem('akhcheck-language') as 'en' | 'nl') || 'en';
  });

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['en']] || key;
  };

  const toggleLanguage = () => {
    const newLanguage = language === 'en' ? 'nl' : 'en';
    setLanguage(newLanguage);
    localStorage.setItem('akhcheck-language', newLanguage);
  };

  return (
    <TranslationContext.Provider value={{ language, t, toggleLanguage }}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
};

export const TranslateButton = () => {
  const { language, toggleLanguage } = useTranslation();
  
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleLanguage}
      className="h-8 px-3 relative z-10"
    >
      <Languages className="w-4 h-4 mr-1" />
      {language.toUpperCase()}
    </Button>
  );
};