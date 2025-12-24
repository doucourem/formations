/**
 * VALIDATION FIREFOX RESPONSIVE - GesFinance
 * Test automatique de compatibilité Firefox
 * Date: 9 janvier 2025
 */

const puppeteer = require('puppeteer');
const fs = require('fs');

async function validateFirefoxResponsive() {
  console.log('🦊 VALIDATION FIREFOX RESPONSIVE - GesFinance');
  console.log('===============================================');

  // Configuration des breakpoints
  const breakpoints = {
    'mobile': { width: 375, height: 667 },
    'tablet': { width: 768, height: 1024 },
    'desktop': { width: 1920, height: 1080 }
  };

  // Lancer le serveur pour les tests
  const puppeteerArgs = [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-accelerated-2d-canvas',
    '--disable-gpu',
    '--window-size=1920,1080'
  ];

  console.log('🚀 Lancement du navigateur pour tests...');
  const browser = await puppeteer.launch({
    headless: true,
    args: puppeteerArgs
  });

  const results = {
    timestamp: new Date().toISOString(),
    tests: {},
    summary: {
      passed: 0,
      failed: 0,
      total: 0
    }
  };

  try {
    // Test pour chaque breakpoint
    for (const [name, dimensions] of Object.entries(breakpoints)) {
      console.log(`\n📱 Test ${name.toUpperCase()} (${dimensions.width}x${dimensions.height})`);
      
      const page = await browser.newPage();
      await page.setViewport(dimensions);
      
      // Émuler Firefox
      await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/115.0');
      
      const testResult = {
        breakpoint: name,
        dimensions,
        issues: [],
        passed: false,
        screenshot: null
      };
      
      try {
        // Naviguer vers l'application
        await page.goto('http://localhost:5000', { 
          waitUntil: 'networkidle2',
          timeout: 30000 
        });
        
        // Attendre que l'application soit chargée
        await page.waitForSelector('body', { timeout: 10000 });
        
        console.log(`  ✅ Page chargée sur ${name}`);
        
        // Test des éléments critiques
        const criticalElements = [
          'button',
          'input[type="text"]',
          'input[type="email"]',
          'input[type="password"]',
          '.grid',
          '.flex'
        ];
        
        for (const selector of criticalElements) {
          try {
            const elements = await page.$$(selector);
            
            for (const element of elements) {
              const box = await element.boundingBox();
              
              if (box) {
                // Vérifier si l'élément dépasse la largeur de la viewport
                if (box.width > dimensions.width) {
                  testResult.issues.push(`${selector} dépasse la largeur (${box.width}px > ${dimensions.width}px)`);
                }
                
                // Vérifier la taille minimale des éléments interactifs
                if (selector.includes('button') || selector.includes('input')) {
                  if (box.height < 44) {
                    testResult.issues.push(`${selector} trop petit pour le touch (${box.height}px < 44px)`);
                  }
                }
              }
            }
          } catch (error) {
            testResult.issues.push(`Erreur lors du test ${selector}: ${error.message}`);
          }
        }
        
        // Test des fonctionnalités CSS
        const cssSupport = await page.evaluate(() => {
          return {
            grid: CSS.supports('display', 'grid'),
            flexbox: CSS.supports('display', 'flex'),
            mozGrid: CSS.supports('display', '-moz-grid'),
            mozFlex: CSS.supports('display', '-moz-flex'),
            mozAppearance: CSS.supports('-moz-appearance', 'none')
          };
        });
        
        console.log(`  🔧 Support CSS:`, cssSupport);
        
        if (!cssSupport.grid && !cssSupport.mozGrid) {
          testResult.issues.push('Grid CSS non supporté');
        }
        
        if (!cssSupport.flexbox && !cssSupport.mozFlex) {
          testResult.issues.push('Flexbox CSS non supporté');
        }
        
        // Test du responsive design
        const responsiveTest = await page.evaluate((viewportWidth) => {
          const issues = [];
          
          // Test des éléments qui dépassent
          const allElements = document.querySelectorAll('*');
          allElements.forEach(element => {
            const rect = element.getBoundingClientRect();
            if (rect.width > viewportWidth) {
              issues.push(`Élément dépasse la largeur: ${element.tagName} (${rect.width}px)`);
            }
          });
          
          // Test des polices
          const computedStyles = window.getComputedStyle(document.body);
          const fontSize = parseFloat(computedStyles.fontSize);
          
          if (viewportWidth <= 480 && fontSize < 14) {
            issues.push(`Police trop petite sur mobile: ${fontSize}px`);
          }
          
          return issues;
        }, dimensions.width);
        
        testResult.issues.push(...responsiveTest);
        
        // Prendre une capture d'écran
        const screenshotPath = `firefox-test-${name}.png`;
        await page.screenshot({ 
          path: screenshotPath,
          fullPage: true 
        });
        testResult.screenshot = screenshotPath;
        
        console.log(`  📸 Capture d'écran sauvée: ${screenshotPath}`);
        
        // Déterminer si le test a réussi
        testResult.passed = testResult.issues.length === 0;
        
        if (testResult.passed) {
          console.log(`  ✅ Test ${name} RÉUSSI`);
        } else {
          console.log(`  ❌ Test ${name} ÉCHOUÉ (${testResult.issues.length} problèmes)`);
          testResult.issues.forEach(issue => console.log(`    - ${issue}`));
        }
        
      } catch (error) {
        testResult.issues.push(`Erreur générale: ${error.message}`);
        testResult.passed = false;
        console.log(`  ❌ Erreur lors du test ${name}: ${error.message}`);
      }
      
      await page.close();
      results.tests[name] = testResult;
      
      // Mettre à jour le résumé
      results.summary.total++;
      if (testResult.passed) {
        results.summary.passed++;
      } else {
        results.summary.failed++;
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur générale:', error);
  } finally {
    await browser.close();
  }
  
  // Sauvegarder les résultats
  const reportPath = 'firefox-responsive-report.json';
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  
  console.log('\n===============================================');
  console.log('📊 RÉSUMÉ DES TESTS');
  console.log('===============================================');
  console.log(`Total des tests: ${results.summary.total}`);
  console.log(`Réussis: ${results.summary.passed}`);
  console.log(`Échoués: ${results.summary.failed}`);
  console.log(`Rapport sauvé: ${reportPath}`);
  
  // Recommandations basées sur les résultats
  if (results.summary.failed > 0) {
    console.log('\n🔧 RECOMMANDATIONS:');
    console.log('1. Vérifiez les préfixes CSS -moz- dans firefox-responsive.css');
    console.log('2. Testez manuellement avec Firefox');
    console.log('3. Ajustez les media queries pour les éléments qui dépassent');
    console.log('4. Vérifiez la compatibilité CSS Grid et Flexbox');
  } else {
    console.log('\n✅ TOUS LES TESTS FIREFOX RÉUSSIS!');
    console.log('L\'application est compatible avec Firefox sur tous les breakpoints.');
  }
  
  return results;
}

// Exécuter les tests
if (require.main === module) {
  validateFirefoxResponsive().catch(console.error);
}

module.exports = { validateFirefoxResponsive };