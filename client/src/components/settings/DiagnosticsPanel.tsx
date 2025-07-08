import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  runSystemHealthCheck, 
  testAPIConnectivity, 
  generateDiagnosticReport,
  type SystemHealthReport 
} from "@/lib/utils/testing";
import { useSettingsStore } from "@/lib/stores/useSettingsStore";
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  RefreshCw, 
  Download,
  Activity
} from "lucide-react";

export default function DiagnosticsPanel() {
  const [healthReport, setHealthReport] = useState<SystemHealthReport | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const { settings } = useSettingsStore();

  const runHealthCheck = async () => {
    setIsRunning(true);
    try {
      const report = await runSystemHealthCheck(settings);
      setHealthReport(report);
    } catch (error) {
      console.error('Health check failed:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const testAPI = async () => {
    if (!settings.apiKey) {
      alert('Please set your API key first');
      return;
    }
    
    setIsRunning(true);
    try {
      const result = await testAPIConnectivity(settings);
      setHealthReport(prev => prev ? {
        ...prev,
        checks: [...prev.checks, result]
      } : {
        overall: result.status === 'healthy' ? 'healthy' : 'error',
        checks: [result],
        timestamp: new Date()
      });
    } catch (error) {
      console.error('API test failed:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const downloadDiagnostics = () => {
    const report = generateDiagnosticReport();
    const blob = new Blob([JSON.stringify(report, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `beskriva-diagnostics-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      healthy: 'bg-green-100 text-green-800',
      warning: 'bg-yellow-100 text-yellow-800',
      error: 'bg-red-100 text-red-800'
    };
    
    return (
      <Badge className={variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800'}>
        {status}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            System Diagnostics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            <Button 
              onClick={runHealthCheck} 
              disabled={isRunning}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isRunning ? 'animate-spin' : ''}`} />
              Run Health Check
            </Button>
            <Button 
              onClick={testAPI} 
              disabled={isRunning || !settings.apiKey}
              variant="outline"
            >
              Test API Connection
            </Button>
            <Button 
              onClick={downloadDiagnostics}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {healthReport && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>System Health Report</span>
              <div className="flex items-center gap-2">
                {getStatusIcon(healthReport.overall)}
                {getStatusBadge(healthReport.overall)}
              </div>
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Generated on {healthReport.timestamp.toLocaleString()}
            </p>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              <div className="space-y-4">
                {healthReport.checks.map((check, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(check.status)}
                        <span className="font-medium">{check.component}</span>
                      </div>
                      {getStatusBadge(check.status)}
                    </div>
                    <p className="text-sm text-muted-foreground pl-6">
                      {check.message}
                    </p>
                    {check.details && (
                      <details className="pl-6">
                        <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                          Show details
                        </summary>
                        <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-auto">
                          {JSON.stringify(check.details, null, 2)}
                        </pre>
                      </details>
                    )}
                    {index < healthReport.checks.length - 1 && <Separator />}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>System Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">Browser</h4>
              <p className="text-muted-foreground break-all">
                {navigator.userAgent}
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Viewport</h4>
              <p className="text-muted-foreground">
                {window.innerWidth} × {window.innerHeight}
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Screen</h4>
              <p className="text-muted-foreground">
                {screen.width} × {screen.height} ({screen.colorDepth}-bit)
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Features</h4>
              <div className="flex flex-wrap gap-1">
                {[
                  { name: 'Service Worker', available: 'serviceWorker' in navigator },
                  { name: 'IndexedDB', available: 'indexedDB' in window },
                  { name: 'File System', available: 'showOpenFilePicker' in window },
                  { name: 'Web Audio', available: 'AudioContext' in window },
                  { name: 'Media Recorder', available: 'MediaRecorder' in window }
                ].map(feature => (
                  <Badge 
                    key={feature.name}
                    className={feature.available ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}
                  >
                    {feature.name}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}