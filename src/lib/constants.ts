// Volunteer Skills
export const VOLUNTEER_SKILLS = [
  'Teacher',
  'Engineer',
  'Electrician',
  'Plumber',
  'Carpenter',
  'Painter',
  'IT Professional',
  'Social Media Manager',
  'Event Organizer',
  'Cook',
  'Cleaner',
  'Gardener',
  'Driver',
  'Accountant',
  'Lawyer',
  'Doctor',
  'Nurse',
  'Childcare',
  'Translator',
  'Graphic Designer',
  'Web Developer',
  'Fundraiser',
  'Security',
  'Marketing',
  'Photography',
  'Videography',
] as const;

export type VolunteerSkill = typeof VOLUNTEER_SKILLS[number] | 'Other';

// Business Types
export const BUSINESS_TYPES = [
  'Restaurant',
  'Grocery Store',
  'Butcher',
  'Bakery',
  'Clothing Store',
  'Barber Shop',
  'Beauty Salon',
  'Book Store',
  'Electronics Store',
  'Pharmacy',
  'Travel Agency',
  'Real Estate',
  'Mechanic',
  'Construction',
  'Home Services',
  'Educational Services',
  'Legal Services',
  'Medical Services',
  'Accounting Services',
  'IT Services',
  'Delivery Services',
  'Transportation',
  'Event Planning',
  'Catering',
] as const;

export type BusinessType = typeof BUSINESS_TYPES[number] | 'Other';

// Event Categories
export const EVENT_CATEGORIES = [
  'fundraising',
  'class',
  'lecture',
  'community',
  'charity',
  'other',
] as const;

export type EventCategory = typeof EVENT_CATEGORIES[number];

// User Roles
export const USER_ROLES = ['admin', 'imam', 'business', 'user'] as const;

// Volunteer status is now a property, not a core role
export const VOLUNTEER_STATUS = ['not_volunteer', 'pending', 'active'] as const;

export type UserRole = typeof USER_ROLES[number];
export type VolunteerStatus = typeof VOLUNTEER_STATUS[number];

// Time Slots for availability
export const TIME_SLOTS = [
  'Morning (6am-12pm)',
  'Afternoon (12pm-5pm)',
  'Evening (5pm-10pm)',
  'Night (10pm-6am)',
] as const;

export type TimeSlot = typeof TIME_SLOTS[number];

// Days of the week
export const DAYS_OF_WEEK = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const;

export type DayOfWeek = typeof DAYS_OF_WEEK[number];
