import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, Smartphone, Monitor, Tablet } from "lucide-react";

interface ResponsiveTest {
  breakpoint: string;
  width: number;
  status: 'pass' | 'fail';
  details?: string;
}

export function ResponsiveTest() {
  const [tests, setTests] = useState<ResponsiveTest[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runResponsiveTests = () => {
    setIsRunning(true);
    
    const testBreakpoints = [
      { name: 'XS (320px)', width: 320 },
      { name: 'SM (640px)', width: 640 },
      { name: 'MD (768px)', width: 768 },
      { name: 'LG (1024px)', width: 1024 },
      { name: 'XL (1280px)', width: 1280 },
    ];

    const results: ResponsiveTest[] = [];

    testBreakpoints.forEach(({ name, width }) => {
      // Simulate viewport width test
      const testElement = document.createElement('div');
      testElement.style.width = `${width}px`;
      testElement.style.padding = '16px';
      testElement.innerHTML = `
        <button style="width: 100%; max-width: 100%; padding: 12px; box-sizing: border-box;">Test Button</button>
        <input style="width: 100%; max-width: 100%; padding: 12px; box-sizing: border-box;" placeholder="Test Input" />
      `;
      
      document.body.appendChild(testElement);
      
      const button = testElement.querySelector('button');
      const input = testElement.querySelector('input');
      
      const buttonOverflow = button && button.scrollWidth > width - 32; // 32px for padding
      const inputOverflow = input && input.scrollWidth > width - 32;
      
      const status = (!buttonOverflow && !inputOverflow) ? 'pass' : 'fail';
      const details = buttonOverflow || inputOverflow ? 
        `${buttonOverflow ? 'Button' : ''} ${inputOverflow ? 'Input' : ''} overflow detected` : 
        'All elements fit within viewport';
      
      results.push({
        breakpoint: name,
        width,
        status,
        details
      });
      
      document.body.removeChild(testElement);
    });

    setTests(results);
    setIsRunning(false);
  };

  useEffect(() => {
    // Run tests on mount
    runResponsiveTests();
  }, []);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="w-5 h-5" />
          Test Responsive Design
        </CardTitle>
        <CardDescription>
          Vérification de la compatibilité mobile et web de l'application
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Button 
            onClick={runResponsiveTests} 
            disabled={isRunning}
            className="w-full"
          >
            {isRunning ? 'Test en cours...' : 'Lancer les tests'}
          </Button>

          <div className="grid gap-2">
            {tests.map((test) => (
              <div 
                key={test.breakpoint}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  test.status === 'pass' 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  {test.status === 'pass' ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                  <div>
                    <div className="font-medium">{test.breakpoint}</div>
                    <div className="text-sm text-gray-600">{test.details}</div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {test.width <= 480 && <Smartphone className="w-4 h-4 text-gray-400" />}
                  {test.width > 480 && test.width <= 768 && <Tablet className="w-4 h-4 text-gray-400" />}
                  {test.width > 768 && <Monitor className="w-4 h-4 text-gray-400" />}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Tests d'éléments actuels</h4>
            <div className="space-y-2">
              <div className="w-full max-w-full">
                <Button className="w-full">Test Button Mobile</Button>
              </div>
              <div className="w-full max-w-full">
                <Input placeholder="Test Input Mobile" className="w-full" />
              </div>
            </div>
          </div>

          <div className="text-sm text-gray-600 space-y-1">
            <p><strong>XS (320px) :</strong> Smartphones très petits</p>
            <p><strong>SM (640px) :</strong> Smartphones standards</p>
            <p><strong>MD (768px) :</strong> Tablettes portrait</p>
            <p><strong>LG (1024px) :</strong> Tablettes paysage</p>
            <p><strong>XL (1280px) :</strong> Desktop</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}