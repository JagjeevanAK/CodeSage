const debugPrompt = {
    "language": "python",
    "task_type": "debug",
    "code": "def factorial(n):\n    return n * factorial(n-1)",
    "error_message": "RecursionError: maximum recursion depth exceeded",
    "context": "learning recursion",
    "help_level": "beginner"
};

export default debugPrompt;