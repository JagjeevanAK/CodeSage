export const reviewPrompt ={
  "task": "code_review",
  "language": "auto-detect",
  "code": "${request.code}",
  "review_settings": {
    "max_suggestions": 5,
    "severity_levels": ["critical", "major", "minor"],
    "focus_areas": [
      "BUGS", 
      "PERFORMANCE", 
      "SECURITY", 
      "MAINTAINABILITY", 
      "STYLE", 
      "DOCS", 
      "LOGIC", 
      "NAMING", 
      "BEST_PRACTICES"
    ],
    "include_positive_feedback": true,
    "experience_level": "intermediate"
  },
  "output_format": {
    "structure": "categorized_list",
    "include_line_numbers": true,
    "include_severity": true,
    "include_explanation": true,
    "include_fix_suggestion": false
  },
  "context": {
    "project_type": "general",
    "framework": null,
    "custom_rules": []
  },
  "instructions": "Review the provided code in the specified language. Focus on the areas listed in focus_areas. Provide suggestions only if there are genuine issues. Use this exact format for each issue: [SEVERITY] Line X: CATEGORY → Brief issue → Why it matters → [Fix if requested]. Severity levels: 🔴 CRITICAL (security, crashes, data loss), 🟡 MAJOR (performance, maintainability), 🟢 MINOR (style, conventions). If no issues found, respond with '✅ EXCELLENT CODE! [brief positive comment about what's good]'. Limit suggestions to max_suggestions count. Tailor language-specific advice appropriately."
};