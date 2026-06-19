/** Rotating daily wellness tips shown once per day on the patient dashboard. */
export const DAILY_HEALTH_TIPS = [
  {
    title: "Stay hydrated",
    body: "Aim for 6–8 glasses of water today. Proper hydration supports energy, focus, and healthy skin.",
  },
  {
    title: "Move for 30 minutes",
    body: "A brisk walk, stretching, or light exercise can improve mood and heart health. Small steps add up.",
  },
  {
    title: "Prioritize sleep",
    body: "Try to keep a consistent bedtime. Quality sleep helps your immune system and recovery.",
  },
  {
    title: "Eat the rainbow",
    body: "Include fruits and vegetables of different colours in your meals for a wider range of nutrients.",
  },
  {
    title: "Take screen breaks",
    body: "Every hour, look away from your screen for 20 seconds. It reduces eye strain and mental fatigue.",
  },
  {
    title: "Check in with yourself",
    body: "Notice how you feel today — physically and emotionally. Reach out for support if something feels off.",
  },
  {
    title: "Limit added sugar",
    body: "Swap sugary drinks for water or unsweetened options. Your energy levels will thank you later.",
  },
  {
    title: "Practice deep breathing",
    body: "Slow, deep breaths for 2 minutes can lower stress and help you feel more centred.",
  },
];

export function getTipForToday(date = new Date()) {
  const dayOfYear = Math.floor(
    (date - new Date(date.getFullYear(), 0, 0)) / 86_400_000
  );
  return DAILY_HEALTH_TIPS[dayOfYear % DAILY_HEALTH_TIPS.length];
}
