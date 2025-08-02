import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Upload, 
  FileText, 
  MessageSquare, 
  Download, 
  Clock, 
  CheckCircle2, 
  Trash2, 
  Eye,
  Zap,
  Loader2
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useDocuments } from "@/hooks/useDocuments";
import { Document } from "@/hooks/useDocuments";
import { DocumentViewer } from "@/components/DocumentViewer";
import { AIChat } from "@/components/AIChat";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const { currentUser } = useAuth();
  const { 
    documents, 
    currentDocument, 
    recentActivity, 
    loading, 
    uploading, 
    uploadProgress, 
    uploadDocument, 
    deleteDocument, 
    downloadDocument, 
    downloadReport 
  } = useDocuments();
  const { toast } = useToast();
  
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatDocument, setChatDocument] = useState<Document | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await uploadDocument(file);
    event.target.value = '';
  }, [uploadDocument]);

  const handleDrop = useCallback(async (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
    const file = event.dataTransfer.files?.[0];
    if (!file) return;
    await uploadDocument(file);
  }, [uploadDocument]);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleViewDocument = useCallback((document: Document) => {
    setSelectedDocument(document);
    setViewerOpen(true);
  }, []);

  const handleChatWithAI = useCallback((document: Document) => {
    setChatDocument(document);
    setChatOpen(true);
  }, []);

  const handleDeleteDocument = useCallback(async (id: string, filePath: string) => {
    await deleteDocument(id, filePath);
  }, [deleteDocument]);

  const getRiskVariant = (level?: string) => {
    switch (level) {
      case "high": return "destructive";
      case "medium": return "secondary";
      case "low": return "default";
      default: return "outline";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "analyzed": return <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />;
      case "analyzing": return <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-primary animate-pulse" />;
      default: return <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Made in India Dashboard Header */}
      <div className="border-b bg-gradient-card backdrop-blur-sm sticky top-0 z-40 india-pride shadow-heritage">
        <div className="container mx-auto px-3 sm:px-6">
          <div className="flex items-center justify-between py-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground font-heading">Dashboard</h1>
                <span className="text-sm bg-gradient-primary bg-clip-text text-transparent font-semibold animate-shimmer">🇮🇳 Made in India</span>
              </div>
              <p className="text-sm sm:text-base text-muted-foreground font-body">
                Analyze and manage your legal documents with AI-powered insights
              </p>
            </div>
            <div className="text-right space-y-1">
              <p className="text-sm text-muted-foreground font-body">Welcome back,</p>
              <p className="font-medium text-foreground font-heading">{currentUser?.email}</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto p-3 sm:p-6">
        <div className="flex flex-col xl:flex-row gap-4 sm:gap-6">
          {/* Main Content */}
          <div className="xl:w-2/3">
            {/* Current Document */}
            <Card className="mb-4 sm:mb-6">
              <CardHeader className="pb-3 sm:pb-6">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
                  Current Document
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {currentDocument ? (
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-medium text-sm sm:text-base truncate">{currentDocument.filename}</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          Uploaded {new Date(currentDocument.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant={getRiskVariant(currentDocument.risk_level)} className="text-xs">
                          {currentDocument.risk_level || 'Pending'}
                        </Badge>
                        {getStatusIcon(currentDocument.status)}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-xs sm:text-sm">
                      <div>
                        <p className="text-muted-foreground">Size</p>
                        <p className="font-medium">{(currentDocument.file_size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Type</p>
                        <p className="font-medium">{currentDocument.file_type.split('/')[1].toUpperCase()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Status</p>
                        <p className="font-medium capitalize">{currentDocument.status}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Risk Score</p>
                        <p className="font-medium">{currentDocument.risk_score || 'N/A'}/100</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDocument(currentDocument)}
                        className="flex items-center gap-1 text-xs sm:text-sm h-8 sm:h-9"
                      >
                        <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="hidden sm:inline">View</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadDocument(currentDocument)}
                        className="flex items-center gap-1 text-xs sm:text-sm h-8 sm:h-9"
                      >
                        <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="hidden sm:inline">Download</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteDocument(currentDocument.id, currentDocument.file_path)}
                        className="flex items-center gap-1 text-xs sm:text-sm h-8 sm:h-9"
                      >
                        <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="hidden sm:inline">Delete</span>
                      </Button>
                      {currentDocument.status === 'analyzed' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleChatWithAI(currentDocument)}
                            className="flex items-center gap-1 text-xs sm:text-sm h-8 sm:h-9"
                          >
                            <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="hidden sm:inline">AI Chat</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => downloadReport(currentDocument)}
                            className="flex items-center gap-1 text-xs sm:text-sm h-8 sm:h-9"
                          >
                            <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="hidden sm:inline">Report</span>
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 sm:py-8">
                    <FileText className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-3 sm:mb-4" />
                    <p className="text-muted-foreground text-sm sm:text-base">No documents uploaded yet</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Upload Zone */}
            <Card>
              <CardHeader className="pb-3 sm:pb-6">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <Upload className="h-4 w-4 sm:h-5 sm:w-5" />
                  Upload New Document
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div
                  className={`border-2 border-dashed rounded-lg p-4 sm:p-8 text-center transition-colors ${
                    isDragOver
                      ? 'border-primary bg-primary/10'
                      : 'border-muted-foreground/25 hover:border-primary/50'
                  }`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                >
                  {uploading ? (
                    <div className="space-y-3 sm:space-y-4">
                      <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin mx-auto" />
                      <div className="space-y-2">
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          Uploading... {uploadProgress}%
                        </p>
                        <div className="w-full bg-muted rounded-full h-1.5 sm:h-2">
                          <div
                            className="bg-primary h-1.5 sm:h-2 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3 sm:space-y-4">
                      <Upload className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground mx-auto" />
                      <div>
                        <p className="text-base sm:text-lg font-medium">Drop your document here</p>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          or click to browse files
                        </p>
                      </div>
                      <Button onClick={() => fileInputRef.current?.click()} size="sm" className="h-8 sm:h-9">
                        Choose File
                      </Button>
                      <p className="text-xs text-muted-foreground">
                        Supports PDF, DOCX, and TXT files up to 10MB
                      </p>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept=".pdf,.docx,.txt"
                  onChange={handleFileSelect}
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="xl:w-1/3 space-y-4 sm:space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader className="pb-3 sm:pb-6">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <Zap className="h-4 w-4 sm:h-5 sm:w-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-2 sm:space-y-3">
                <Button 
                  className="w-full justify-start text-sm h-9" 
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Document
                </Button>
                {currentDocument && currentDocument.status === 'analyzed' && (
                  <>
                    <Button 
                      className="w-full justify-start text-sm h-9" 
                      variant="outline"
                      onClick={() => downloadReport(currentDocument)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Report
                    </Button>
                    <Button 
                      className="w-full justify-start text-sm h-9" 
                      variant="outline"
                      onClick={() => handleChatWithAI(currentDocument)}
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Chat with AI
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader className="pb-3 sm:pb-6">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {recentActivity.length > 0 ? (
                  <div className="space-y-2 sm:space-y-3">
                    {recentActivity.slice(0, 5).map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-2 sm:p-3 border rounded-lg">
                        <div className="flex-1 min-w-0 pr-2">
                          <p className="text-xs sm:text-sm font-medium truncate">{doc.filename}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(doc.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                          <Badge variant={getRiskVariant(doc.risk_level)} className="text-xs hidden sm:inline-flex">
                            {doc.risk_level || 'Pending'}
                          </Badge>
                          <div className="flex gap-0.5 sm:gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewDocument(doc)}
                              className="h-6 w-6 p-0"
                              title="View"
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => downloadDocument(doc)}
                              className="h-6 w-6 p-0"
                              title="Download"
                            >
                              <Download className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteDocument(doc.id, doc.file_path)}
                              className="h-6 w-6 p-0"
                              title="Delete"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                            {doc.status === 'analyzed' && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleChatWithAI(doc)}
                                  className="h-6 w-6 p-0"
                                  title="AI Chat"
                                >
                                  <MessageSquare className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => downloadReport(doc)}
                                  className="h-6 w-6 p-0"
                                  title="Download Report"
                                >
                                  <FileText className="h-3 w-3" />
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 sm:py-6">
                    <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-xs sm:text-sm text-muted-foreground">No recent activity</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Usage Stats for Production Scale */}
            <Card>
              <CardHeader className="pb-3 sm:pb-6">
                <CardTitle className="text-base sm:text-lg">Usage Stats</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                <div>
                  <div className="flex justify-between text-xs sm:text-sm mb-1">
                    <span>Documents Analyzed</span>
                    <span>{documents.filter(d => d.status === 'analyzed').length}</span>
                  </div>
                  <Progress value={(documents.filter(d => d.status === 'analyzed').length / Math.max(documents.filter(d => d.status === 'analyzed').length, 1)) * 100} className="h-1.5 sm:h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-xs sm:text-sm mb-1">
                    <span>Total Documents</span>
                    <span>{documents.length}</span>
                  </div>
                  <Progress value={Math.min((documents.length / 100) * 100, 100)} className="h-1.5 sm:h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Document Viewer Dialog */}
      <DocumentViewer
        document={selectedDocument}
        open={viewerOpen}
        onOpenChange={setViewerOpen}
        onDownload={downloadReport}
        onChat={handleChatWithAI}
      />

      {/* AI Chat Dialog */}
      <AIChat
        document={chatDocument}
        open={chatOpen}
        onOpenChange={setChatOpen}
      />
    </div>
  );
}