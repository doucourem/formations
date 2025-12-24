// Responsive design testing utilities

export interface ResponsiveTestResult {
  viewport: string;
  width: number;
  height: number;
  issues: string[];
  passed: boolean;
}

export const RESPONSIVE_BREAKPOINTS = {
  xs: { min: 0, max: 575 },
  sm: { min: 576, max: 767 },
  md: { min: 768, max: 991 },
  lg: { min: 992, max: 1199 },
  xl: { min: 1200, max: Infinity }
};

export function testResponsiveElements(): ResponsiveTestResult[] {
  const results: ResponsiveTestResult[] = [];
  
  Object.entries(RESPONSIVE_BREAKPOINTS).forEach(([breakpoint, { min, max }]) => {
    const testWidth = min === 0 ? 320 : min + 50; // Test with slightly above minimum
    const testHeight = Math.floor(testWidth * 1.77); // 16:9 aspect ratio
    
    const issues: string[] = [];
    
    // Test critical elements
    const criticalSelectors = [
      '.mobile-header',
      '.mobile-nav',
      'button',
      'input',
      '.card',
      'table'
    ];
    
    criticalSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach((element) => {
        const rect = element.getBoundingClientRect();
        
        // Check if element is too wide for viewport
        if (rect.width > testWidth) {
          issues.push(`${selector} exceeds viewport width at ${breakpoint}`);
        }
        
        // Check touch target size for interactive elements
        if (element.matches('button, input, a, [role="button"]')) {
          if (rect.height < 44 || rect.width < 44) {
            issues.push(`${selector} touch target too small at ${breakpoint}`);
          }
        }
        
        // Check text readability
        const computedStyle = window.getComputedStyle(element);
        const fontSize = parseFloat(computedStyle.fontSize);
        if (fontSize < 14 && testWidth <= 768) {
          issues.push(`${selector} text too small for mobile at ${breakpoint}`);
        }
      });
    });
    
    results.push({
      viewport: breakpoint,
      width: testWidth,
      height: testHeight,
      issues,
      passed: issues.length === 0
    });
  });
  
  return results;
}

export function validateCSSGrid(): boolean {
  return CSS.supports('display', 'grid');
}

export function validateFlexbox(): boolean {
  return CSS.supports('display', 'flex');
}

export function validateViewportUnits(): boolean {
  return CSS.supports('height', '100vh');
}

export function runResponsiveTests(): void {
  console.group('📱 Responsive Design Tests');
  
  const results = testResponsiveElements();
  results.forEach(result => {
    console.log(
      `${result.viewport.toUpperCase()} (${result.width}px):`,
      result.passed ? '✅ PASS' : '❌ FAIL'
    );
    if (!result.passed) {
      result.issues.forEach(issue => console.warn(`  - ${issue}`));
    }
  });
  
  console.log('CSS Grid Support:', validateCSSGrid() ? '✅' : '❌');
  console.log('Flexbox Support:', validateFlexbox() ? '✅' : '❌');
  console.log('Viewport Units Support:', validateViewportUnits() ? '✅' : '❌');
  
  console.groupEnd();
}