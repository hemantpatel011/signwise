import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Upload, FileText, Brain, MessageSquare, Download, AlertTriangle, Clock, CheckCircle2, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useDocuments } from "@/hooks/useDocuments";
import { formatDistanceToNow } from "date-fns";

export default function Dashboard() {
  const { currentUser } = useAuth();
  const { documents, loading, uploading, uploadProgress, uploadDocument, deleteDocument } = useDocuments();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    await uploadDocument(file);
    // Reset input
    event.target.value = '';
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case "high": return "text-destructive";
      case "medium": return "text-yellow-600";
      case "low": return "text-green-600";
      default: return "text-muted-foreground";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "analyzed": return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case "analyzing": return <Brain className="w-4 h-4 text-primary animate-pulse" />;
      default: return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-card">
      {/* Header */}
      <div className="border-b border-border bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
              <p className="text-muted-foreground mt-1">
                Analyze legal documents with AI-powered insights
              </p>
            </div>
            <Button variant="hero" className="gap-2">
              <Upload className="w-4 h-4" />
              Upload Document
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Upload Area */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Upload Document
                </CardTitle>
                <CardDescription>
                  Drag and drop your legal document or click to browse
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-smooth">
                  <input
                    type="file"
                    accept=".pdf,.docx,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg font-medium text-foreground mb-2">
                      Choose a file to upload
                    </p>
                    <p className="text-muted-foreground mb-4">
                      Supports PDF, DOCX, TXT files up to 10MB
                    </p>
                    <Button variant="outline">Browse Files</Button>
                  </label>
                </div>
                
                {uploading && (
                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span>Uploading...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} className="w-full" />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Documents */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Recent Documents</CardTitle>
                <CardDescription>
                  Your recently uploaded and analyzed documents
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-16 bg-muted rounded-lg"></div>
                      </div>
                    ))}
                  </div>
                ) : documents.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No documents uploaded yet</p>
                    <p className="text-sm text-muted-foreground">Upload your first document to get started</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-4 border border-border rounded-lg hover:shadow-card transition-smooth"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-gradient-card rounded-lg flex items-center justify-center">
                            <FileText className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-medium text-foreground">{doc.filename}</h4>
                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                              {getStatusIcon(doc.status)}
                              <span>Uploaded {formatDistanceToNow(new Date(doc.created_at), { addSuffix: true })}</span>
                              {doc.risk_level && (
                                <>
                                  <span>•</span>
                                  <span className={getRiskColor(doc.risk_level)}>
                                    {doc.risk_level} risk
                                  </span>
                                </>
                              )}
                            </div>
                            {doc.analysis_results?.summary && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {doc.analysis_results.summary}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {doc.status === "analyzed" && (
                            <>
                              <Button variant="ghost" size="sm" title="Chat with AI">
                                <MessageSquare className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm" title="Download Report">
                                <Download className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => deleteDocument(doc.id, doc.file_path)}
                            title="Delete Document"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Usage Stats */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-lg">Usage This Month</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                 <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Documents Analyzed</span>
                      <span>{documents.filter(d => d.status === 'analyzed').length} / 50</span>
                    </div>
                    <Progress value={(documents.filter(d => d.status === 'analyzed').length / 50) * 100} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Total Documents</span>
                      <span>{documents.length}</span>
                    </div>
                    <Progress value={(documents.length / 50) * 100} />
                  </div>
                  <Button variant="premium" className="w-full text-sm">
                    Upgrade Plan
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Brain className="w-4 h-4" />
                  Ask AI Assistant
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Download className="w-4 h-4" />
                  Export Reports
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Risk Alerts
                </Button>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-lg">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                    <div>
                      <p className="text-foreground">Document analyzed</p>
                      <p className="text-muted-foreground">Employment_Agreement_2024.pdf</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-foreground">Report exported</p>
                      <p className="text-muted-foreground">Service_Agreement.pdf</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-foreground">Risk flag detected</p>
                      <p className="text-muted-foreground">High penalty clause found</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}