// Content moderation utilities

const BAD_WORDS = [
  // Add offensive words list - keeping minimal for code purposes
  'fuck', 'shit', 'ass', 'damn', 'bitch', 'dick', 'pussy',
  'nigger', 'faggot', 'retard', 'cunt', 'whore', 'slut',
];

const SPAM_PATTERNS = [
  /buy now/i,
  /click here/i,
  /free money/i,
  /bit\.ly/i,
  /t\.co/i,
  /earn \$\d+/i,
  /make money/i,
  /subscribe to my/i,
  /follow me at/i,
  /check out my link/i,
  /dm me for/i,
];

export function containsBadWords(text: string): boolean {
  const lowerText = text.toLowerCase();
  // Simple word boundary check
  return BAD_WORDS.some((word) => {
    const regex = new RegExp(`\\b${word}\\b`, 'i');
    return regex.test(lowerText);
  });
}

export function censorBadWords(text: string): string {
  let censored = text;
  BAD_WORDS.forEach((word) => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    censored = censored.replace(regex, '*'.repeat(word.length));
  });
  return censored;
}

export function isSpam(text: string): boolean {
  return SPAM_PATTERNS.some((pattern) => pattern.test(text));
}

export function isExcessivePosting(
  postTimes: Date[],
  maxPerDay: number = 10
): boolean {
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const recentPosts = postTimes.filter((time) => time > oneDayAgo);
  return recentPosts.length >= maxPerDay;
}

export function validatePostContent(content: string): {
  valid: boolean;
  reason?: string;
  censoredContent?: string;
} {
  // Check length
  if (content.trim().length < 3) {
    return { valid: false, reason: 'Post is too short' };
  }

  if (content.length > 1000) {
    return { valid: false, reason: 'Post is too long (max 1000 characters)' };
  }

  // Check for bad words
  if (containsBadWords(content)) {
    return {
      valid: true,
      reason: 'Content was automatically censored',
      censoredContent: censorBadWords(content),
    };
  }

  // Check for spam
  if (isSpam(content)) {
    return { valid: false, reason: 'This looks like spam. Please post genuine content.' };
  }

  // Check for excessive caps (shouting)
  const capsRatio = (content.match(/[A-Z]/g) || []).length / content.length;
  if (capsRatio > 0.7 && content.length > 20) {
    return {
      valid: true,
      reason: 'Please avoid excessive caps',
      censoredContent: content.charAt(0).toUpperCase() + content.slice(1).toLowerCase(),
    };
  }

  return { valid: true };
}

export async function moderateImage(imageBase64: string): Promise<{
  safe: boolean;
  reason?: string;
}> {
  // In production, use Gemini Vision API or a dedicated moderation API
  // For now, we'll do basic checks and assume images are safe
  try {
    // Check file size (base64 string length)
    if (imageBase64.length > 10 * 1024 * 1024) {
      return { safe: false, reason: 'Image is too large' };
    }

    // Would call Gemini or a moderation API here
    // const model = getGeminiModel();
    // const result = await model.generateContent([
    //   "Is this image appropriate for a fitness community? Answer SAFE or UNSAFE and why.",
    //   { inlineData: { data: imageBase64, mimeType: "image/jpeg" } }
    // ]);

    return { safe: true };
  } catch (error) {
    console.error('Image moderation error:', error);
    return { safe: true }; // Fail open, let admin moderate
  }
}

export function generateReportId(): string {
  return `report_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export const REPORT_REASONS = [
  'spam',
  'offensive_language',
  'harassment',
  'inappropriate_image',
  'misinformation',
  'self_harm',
  'other',
] as const;

export type ReportReason = (typeof REPORT_REASONS)[number];

export const REPORT_REASON_LABELS: Record<ReportReason, string> = {
  spam: 'Spam or repetitive content',
  offensive_language: 'Offensive language',
  harassment: 'Harassment or bullying',
  inappropriate_image: 'Inappropriate image',
  misinformation: 'Health misinformation',
  self_harm: 'Promotes self-harm or dangerous behavior',
  other: 'Other',
};

export const MODERATION_ACTIONS = {
  APPROVE: 'approve',
  REMOVE: 'remove',
  WARN: 'warn',
  BAN: 'ban',
} as const;