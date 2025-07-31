import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertTriangle, CheckCircle2, Clock, Download, FileText, MessageSquare } from "lucide-react";
import { Document } from "@/hooks/useDocuments";
import { formatDistanceToNow } from "date-fns";

interface DocumentViewerProps {
  document: Document | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDownload: (document: Document) => void;
  onChat: (document: Document) => void;
}

export function DocumentViewer({ document, open, onOpenChange, onDownload, onChat }: DocumentViewerProps) {
  if (!document) return null;

  const getRiskColor = (level: string) => {
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
      case "analyzed": return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case "analyzing": return <Clock className="w-4 h-4 text-primary animate-pulse" />;
      default: return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            {document.filename}
          </DialogTitle>
          <DialogDescription>
            Uploaded {formatDistanceToNow(new Date(document.created_at), { addSuffix: true })}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6">
            {/* Document Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  {getStatusIcon(document.status)}
                  Document Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Status</p>
                    <p className="text-sm capitalize">{document.status}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">File Size</p>
                    <p className="text-sm">{(document.file_size / 1024).toFixed(1)} KB</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Type</p>
                    <p className="text-sm">{document.file_type}</p>
                  </div>
                  {document.risk_level && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Risk Level</p>
                      <Badge variant={getRiskColor(document.risk_level)}>
                        {document.risk_level}
                      </Badge>
                    </div>
                  )}
                </div>
                
                {document.risk_score && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Risk Score</p>
                    <p className="text-sm">{(document.risk_score * 100).toFixed(1)}%</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Analysis Results */}
            {document.analysis_results && document.status === "analyzed" && (
              <>
                {/* Summary */}
                {document.analysis_results.summary && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Analysis Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {document.analysis_results.summary}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Risk Areas */}
                {document.analysis_results.riskAreas && document.analysis_results.riskAreas.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5" />
                        Risk Areas
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {document.analysis_results.riskAreas.map((risk: any, index: number) => (
                        <div key={index} className="border border-border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{risk.category}</h4>
                            <Badge variant={getRiskColor(risk.severity)}>
                              {risk.severity}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {risk.description}
                          </p>
                          <p className="text-sm font-medium text-foreground">
                            Impact: {risk.impact}
                          </p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Findings */}
                {document.analysis_results.findings && document.analysis_results.findings.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Key Findings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {document.analysis_results.findings.map((finding: any, index: number) => (
                        <div key={index} className="border border-border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{finding.type}</h4>
                            {finding.section && (
                              <Badge variant="outline">{finding.section}</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {finding.description}
                          </p>
                          {finding.recommendation && (
                            <div className="bg-muted/50 rounded-md p-3 mt-2">
                              <p className="text-sm font-medium text-foreground mb-1">
                                Recommendation:
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {finding.recommendation}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Recommendations */}
                {document.analysis_results.recommendations && document.analysis_results.recommendations.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Recommendations</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {document.analysis_results.recommendations.map((rec: any, index: number) => (
                        <div key={index} className="border border-border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <Badge variant={rec.priority === 'high' ? 'destructive' : rec.priority === 'medium' ? 'secondary' : 'default'}>
                              {rec.priority} priority
                            </Badge>
                          </div>
                          <h4 className="font-medium mb-2">{rec.action}</h4>
                          <p className="text-sm text-muted-foreground">
                            {rec.rationale}
                          </p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-4">
              {document.status === "analyzed" && (
                <>
                  <Button onClick={() => onChat(document)} className="gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Chat with AI
                  </Button>
                  <Button variant="outline" onClick={() => onDownload(document)} className="gap-2">
                    <Download className="w-4 h-4" />
                    Download Report
                  </Button>
                </>
              )}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}