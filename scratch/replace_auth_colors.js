const fs = require('fs');

const filepath = "C:\\Users\\ebike\\Marcusina\\Medgram\\frontend\\screens\\AuthScreens.js";
let content = fs.readFileSync(filepath, 'utf8');

const replacements = [
  ["backgroundColor: '#FFFFFF',", "backgroundColor: theme.background,"],
  ["color: '#000000',", "color: theme.text,"],
  ["color: '#000000'", "color: theme.text"],
  ["color: '#111827',", "color: theme.text,"],
  ["color: '#6B7280',", "color: theme.textSecondary,"],
  ["color: '#6B7280'", "color: theme.textSecondary"],
  ["borderColor: '#E5E7EB',", "borderColor: theme.border,"],
  ["borderColor: '#E5E7EB'", "borderColor: theme.border"],
  ["backgroundColor: '#FFFFFF'", "backgroundColor: theme.surface"],
  ["backgroundColor: '#FFFFFF',", "backgroundColor: theme.surface,"],
  ["backgroundColor: '#F9FAFB',", "backgroundColor: theme.surfaceSubtle,"],
  ["backgroundColor: '#F3F4F6',", "backgroundColor: theme.surfaceSubtle,"],
  ["backgroundColor: '#F3F4F6'", "backgroundColor: theme.surfaceSubtle"],
  ["backgroundColor: '#F9FAFB'", "backgroundColor: theme.surfaceSubtle"],
  ["backgroundColor: '#000000',", "backgroundColor: theme.primary,"],
  ["backgroundColor: '#000000'", "backgroundColor: theme.primary"],
  ["borderColor: '#000000',", "borderColor: theme.primary,"],
  ["borderColor: '#000000'", "borderColor: theme.primary"],
  ["color: '#FFFFFF',", "color: theme.mode === 'dark' ? '#000000' : '#FFFFFF',"],
  ["color: '#FFFFFF'", "color: theme.mode === 'dark' ? '#000000' : '#FFFFFF'"],
  ["color: '#374151',", "color: theme.textSecondary,"],
  ["color: '#9CA3AF',", "color: theme.textMuted,"],
  ["color: '#9CA3AF'", "color: theme.textMuted"],
  ["backgroundColor: '#D1D5DB',", "backgroundColor: theme.border,"],
  ["backgroundColor: '#E5E7EB',", "backgroundColor: theme.border,"],
  ["backgroundColor: '#E5E7EB'", "backgroundColor: theme.border"],
  ["borderColor: '#EF4444',", "borderColor: theme.error,"],
  ["color: '#EF4444',", "color: theme.error,"],
  ["backgroundColor: '#EEF2FF',", "backgroundColor: theme.mode === 'dark' ? '#1E1B4B' : '#EEF2FF',"],
  ["backgroundColor: '#FEF3C7',", "backgroundColor: theme.mode === 'dark' ? '#78350F' : '#FEF3C7',"],
  ["borderLeftColor: '#000000',", "borderLeftColor: theme.primary,"],
  ["color: '#4B5563',", "color: theme.textSecondary,"],
  ["color: '#D1D5DB',", "color: theme.border,"],
];

// Apply replacements sequentially
for (const [target, replacement] of replacements) {
  content = content.split(target).join(replacement);
}

fs.writeFileSync(filepath, content, 'utf8');
console.log("Successfully replaced hardcoded colors with theme variables in AuthScreens.js!");
