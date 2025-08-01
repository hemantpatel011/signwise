import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle, Clock, Download, FileText, MessageSquare, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Document } from "@/hooks/useDocuments";

interface DocumentViewerProps {
  document: Document | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDownload: (document: Document) => void;
  onChat: (document: Document) => void;
}

export function DocumentViewer({ document, open, onOpenChange, onDownload, onChat }: DocumentViewerProps) {
  if (!document) return null;

  const getRiskColor = (level?: string) => {
    switch (level) {
      case "high": return "destructive";
      case "medium": return "secondary";
      case "low": return "default";
      default: return "outline";
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high": return "text-destructive";
      case "medium": return "text-yellow-600";
      case "low": return "text-green-600";
      default: return "text-muted-foreground";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "analyzed": return <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />;
      case "analyzing": return <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-primary animate-pulse" />;
      default: return <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xs sm:max-w-2xl lg:max-w-4xl max-h-[90vh] mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
            <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="truncate">{document.filename}</span>
          </DialogTitle>
          <div className="text-xs sm:text-sm text-muted-foreground">
            Uploaded on {new Date(document.created_at).toLocaleDateString()}
          </div>
        </DialogHeader>
        
        <ScrollArea className="max-h-[70vh]">
          <div className="space-y-4 sm:space-y-6 pr-2 sm:pr-4">
            {/* Document Metadata */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
              <Card>
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(document.status)}
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm text-muted-foreground">Status</p>
                      <p className="text-xs sm:text-base font-medium capitalize truncate">{document.status}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-3 sm:p-4">
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">Size</p>
                    <p className="text-xs sm:text-base font-medium">{(document.file_size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-3 sm:p-4">
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">Type</p>
                    <p className="text-xs sm:text-base font-medium">{document.file_type.split('/')[1].toUpperCase()}</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center gap-2">
                    <Badge variant={getRiskColor(document.risk_level)} className="text-xs">
                      {document.risk_level || 'Unknown'}
                    </Badge>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm text-muted-foreground">Risk Score</p>
                      <p className="text-xs sm:text-base font-medium">{document.risk_score || 'N/A'}/100</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Analysis Results */}
            {document.status === 'analyzed' && document.analysis_results && (
              <div className="space-y-4 sm:space-y-6">
                <h3 className="text-base sm:text-lg font-semibold">Analysis Results</h3>
                
                {/* Summary */}
                {document.analysis_results.summary && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm sm:text-base">Executive Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                        {document.analysis_results.summary}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Risk Areas */}
                {document.analysis_results.riskAreas && document.analysis_results.riskAreas.length > 0 && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm sm:text-base">Risk Areas</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        {document.analysis_results.riskAreas.map((area: any, index: number) => (
                          <div key={index} className="border-l-4 border-primary pl-3 sm:pl-4">
                            <h4 className="text-sm sm:text-base font-medium">{area.category}</h4>
                            <p className="text-xs sm:text-sm text-muted-foreground">{area.description}</p>
                            {area.severity && (
                              <span className={`text-xs font-medium ${getSeverityColor(area.severity)}`}>
                                Severity: {area.severity}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Findings */}
                {document.analysis_results.findings && document.analysis_results.findings.length > 0 && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm sm:text-base">Key Findings</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <ul className="space-y-2">
                        {document.analysis_results.findings.map((finding: string, index: number) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 sm:mt-2 flex-shrink-0" />
                            <span className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{finding}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Recommendations */}
                {document.analysis_results.recommendations && document.analysis_results.recommendations.length > 0 && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm sm:text-base">Recommendations</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <ul className="space-y-2">
                        {document.analysis_results.recommendations.map((rec: string, index: number) => (
                          <li key={index} className="flex items-start gap-2">
                            <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 mt-1 sm:mt-0.5 flex-shrink-0" />
                            <span className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Action Buttons */}
        {document.status === 'analyzed' && (
          <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t">
            <Button onClick={() => onChat(document)} className="flex-1 h-9 text-sm">
              <MessageSquare className="h-4 w-4 mr-2" />
              Chat with AI
            </Button>
            <Button onClick={() => onDownload(document)} variant="outline" className="flex-1 h-9 text-sm">
              <Download className="h-4 w-4 mr-2" />
              Download Report
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}