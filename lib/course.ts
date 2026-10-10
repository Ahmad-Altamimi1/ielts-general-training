/**
 * The standing facts about this course: who teaches it, who it is for, and
 * what the site claims to do. Kept in one place so the landing page, the
 * sidebar and the page metadata cannot disagree.
 *
 * The teacher's name is the one piece of this that is not in the book —
 * it was given directly. Change the spelling here and it changes
 * everywhere.
 */
export const COURSE = {
  title: "IELTS Training",
  level: "Grade 12 · Student Book",
  tagline:
    "The method, marked practice, and an explanation for every answer — right ones included.",

  teacherName: "Qasem Bawa'neh",
  teacherRole: "Taught by",

  /**
   * The school's own letterhead, copied from the header of its printed
   * worksheets. It is written here in Arabic because that is how the
   * school writes it, and it is shown exactly as given — this is an
   * institution's name, not copy to be improved.
   */
  school: {
    council: "مجلس تعليمي: مكتب الفجيرة والشارقة الشرقية",
    zone: "نطاق: DNE.8.3",
    name: "مدرسة: عبد الله بن الزبير الحلقة الثالثة بنين",
    principal: "مدير المدرسة: الأستاذ راشد الخديم",
  },

  promises: [
    {
      title: "Marked the moment you answer",
      body: "One Check button marks the whole set and tells you where you stand, without waiting for a lesson.",
    },
    {
      title: "Every answer explained",
      body: "The reason is shown for right answers too, because it names the trap you happened to avoid.",
    },
    {
      title: "Practice against a clock",
      body: "Timed exercises run on, rather than cutting you off, so you can see how far over you ran.",
    },
    {
      title: "Progress that stays",
      body: "Your answers and scores are kept in this browser, so you can close the page and come back.",
    },
  ],
} as const;
