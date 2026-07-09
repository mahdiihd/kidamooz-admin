import { AudienceSegment, AudienceUser } from '../models/story-access.model';

export const MOCK_AUDIENCE_SEGMENTS: AudienceSegment[] = [
  {
    id: 'premium',
    label: 'اشتراک ویژه',
    description: 'کاربران با اشتراک پریمیوم',
  },
  {
    id: 'family',
    label: 'پلن خانوادگی',
    description: 'خانواده‌های با چند پروفایل کودک',
  },
  {
    id: 'beta',
    label: 'تسترهای بتا',
    description: 'گروه تست داخلی و کاربران انتخابی',
  },
  {
    id: 'school',
    label: 'مدارس همکار',
    description: 'مدارس و مهدکودک‌های طرف قرارداد',
  },
];

export const MOCK_AUDIENCE_USERS: AudienceUser[] = [
  { id: 'u-1001', label: 'سارا احمدی', email: 'sara@example.com' },
  { id: 'u-1002', label: 'علی رضایی', email: 'ali@example.com' },
  { id: 'u-1003', label: 'مریم کریمی', email: 'maryam@example.com' },
  { id: 'u-1004', label: 'رضا محمدی', email: 'reza@example.com' },
];
