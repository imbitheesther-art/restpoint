const fs = require('fs');
const file = 'd:\\restpoint\\FrontendClient\\client\\src\\modules\\onboarding\\OnboardingFlow.jsx';
let content = fs.readFileSync(file, 'utf8');

// Fix goNext to remove errors from dependency array and fix stale closure
const oldGoNext = `const goNext = useCallback(() => {
    if (currentStep === 0 && !validateStep1()) return;
    if (currentStep === 1 && !validateStep2()) return;
    setErrors({});
    setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep, validateStep1, validateStep2, errors]);`;

const newGoNext = `const goNext = useCallback(() => {
    if (currentStep === 0) {
      const valid = validateStep1();
      if (!valid) return;
    }
    if (currentStep === 1) {
      const valid = validateStep2();
      if (!valid) return;
    }
    setErrors({});
    setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep, validateStep1, validateStep2]);`;

content = content.replace(oldGoNext, newGoNext);

// Add branches error display
const oldBranchesError = `{errors.branches && <span style={{ display: 'block', color: THEME.colors.red, fontSize: '0.7rem', marginTop: THEME.spacing.xs }}>{errors.branches}</span>}`;
const newBranchesError = `{errors.branches && <span style={{ display: 'block', color: THEME.colors.red, fontSize: '0.7rem', marginBottom: THEME.spacing.sm, padding: '0.5rem', background: THEME.colors.redBg, borderRadius: '4px' }}>{errors.branches}</span>}`;

content = content.replace(oldBranchesError, newBranchesError);

fs.writeFileSync(file, content);
console.log('Fixed onboarding flow');