import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Document {
  id: string;
  user_id: string;
  filename: string;
  file_path: string;
  file_size: number;
  file_type: string;
  status: 'pending' | 'analyzing' | 'analyzed' | 'error';
  risk_level?: 'low' | 'medium' | 'high';
  risk_score?: number;
  analysis_results?: any;
  created_at: string;
  updated_at: string;
}

export function useDocuments() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [analysisTimeouts, setAnalysisTimeouts] = useState<Set<string>>(new Set());
  const { currentUser } = useAuth();
  const { toast } = useToast();

  // Fetch documents
  const fetchDocuments = async () => {
    if (!currentUser) return;

    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments((data || []) as Document[]);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast({
        title: "Error",
        description: "Failed to load documents",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Upload document
  const uploadDocument = async (file: File) => {
    if (!currentUser) {
      toast({
        title: "Authentication Required",
        description: "Please log in to upload documents",
        variant: "destructive",
      });
      return;
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload PDF, DOCX, or TXT files only",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please upload files smaller than 10MB",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // Create file path with user ID
      const timestamp = Date.now();
      const fileExtension = file.name.split('.').pop();
      const filePath = `${currentUser.id}/${timestamp}-${file.name}`;

      // Upload to Supabase Storage with progress simulation
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);
      
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      clearInterval(progressInterval);
      setUploadProgress(100);
      
      if (uploadError) throw uploadError;

      // Create document record in database
      const { data: documentData, error: dbError } = await supabase
        .from('documents')
        .insert({
          user_id: currentUser.id,
          filename: file.name,
          file_path: filePath,
          file_size: file.size,
          file_type: file.type,
          status: 'pending'
        })
        .select()
        .single();

      if (dbError) throw dbError;

      // Start AI analysis with timeout
      const analysisTimeout = setTimeout(() => {
        setAnalysisTimeouts(prev => new Set([...prev, documentData.id]));
        
        // Update document status to show timeout
        supabase
          .from('documents')
          .update({ 
            status: 'error',
            analysis_results: { 
              error: 'Analysis timeout - document may be too complex or corrupted',
              summary: 'Document analysis failed due to timeout (3 minutes)',
              riskLevel: 'unknown'
            }
          })
          .eq('id', documentData.id);
          
        toast({
          title: "Analysis Timeout",
          description: "Document analysis took too long. The document may be too complex or corrupted.",
          variant: "destructive"
        });
      }, 180000); // 3 minutes timeout

      // Start analysis and handle response
      supabase.functions.invoke('analyze-document', {
        body: { documentId: documentData.id }
      }).then(({ error: analysisError }) => {
        clearTimeout(analysisTimeout);
        if (analysisError) {
          console.error('Analysis failed:', analysisError);
          toast({
            title: "Analysis Failed", 
            description: "Document uploaded but analysis failed",
            variant: "destructive"
          });
        }
        // Note: Success toast will be handled by real-time updates
      });

      // Refresh documents list
      await fetchDocuments();

      toast({
        title: "Document Uploaded",
        description: "Your document is being analyzed by AI...",
      });

    } catch (error) {
      console.error('Error uploading document:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload document. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // Analyze document with AI
  const analyzeDocument = async (documentId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('analyze-document', {
        body: { documentId }
      });

      if (error) throw error;

      console.log('Analysis started for document:', documentId);
      
      // Refresh documents to show updated status
      setTimeout(() => {
        fetchDocuments();
      }, 1000);

    } catch (error) {
      console.error('Error starting document analysis:', error);
      toast({
        title: "Analysis Failed",
        description: "Failed to start document analysis",
        variant: "destructive",
      });
    }
  };

  // Delete document
  const deleteDocument = async (documentId: string, filePath: string) => {
    try {
      // Security check: ensure user can only delete their own documents
      const documentToDelete = documents.find(doc => doc.id === documentId);
      if (!documentToDelete || documentToDelete.user_id !== currentUser?.id) {
        toast({
          title: "Access denied",
          description: "You can only delete your own documents",
          variant: "destructive",
        });
        return;
      }

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([filePath]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentId);

      if (dbError) throw dbError;

      // Refresh documents list
      await fetchDocuments();

      toast({
        title: "Document Deleted",
        description: "Document has been successfully deleted",
      });

    } catch (error) {
      console.error('Error deleting document:', error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete document",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchDocuments();
      
      // Set up real-time subscription for document updates
      const channel = supabase
        .channel('documents-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'documents',
            filter: `user_id=eq.${currentUser.id}`
          },
          (payload) => {
            console.log('Document updated:', payload);
            // Refresh documents when any document changes
            fetchDocuments();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [currentUser]);

  // Download document file as PDF by default
  const downloadDocument = async (doc: Document) => {
    try {
      // Security check: ensure user can only download their own documents
      if (doc.user_id !== currentUser?.id) {
        toast({
          title: "Access denied",
          description: "You can only download your own documents",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase.storage
        .from('documents')
        .download(doc.file_path);

      if (error) throw error;

      // Always download as PDF by default
      const blob = new Blob([data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = window.document.createElement('a');
      link.href = url;
      link.download = doc.filename.replace(/\.[^/.]+$/, '.pdf'); // Change extension to .pdf
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Download Started",
        description: "Document is being downloaded as PDF",
      });

    } catch (error) {
      console.error('Error downloading document:', error);
      toast({
        title: "Download Failed",
        description: "Failed to download document",
        variant: "destructive",
      });
    }
  };

  // Download analysis report as PDF
  const downloadReport = async (doc: Document) => {
    // Security check: ensure user can only download reports for their own documents
    if (doc.user_id !== currentUser?.id) {
      toast({
        title: "Access denied",
        description: "You can only download reports for your own documents",
        variant: "destructive",
      });
      return;
    }

    if (!doc.analysis_results) {
      toast({
        title: "No Report Available",
        description: "This document hasn't been analyzed yet",
        variant: "destructive",
      });
      return;
    }

    try {
      // Dynamic import for jsPDF to reduce bundle size
      const { jsPDF } = await import('jspdf');
      const pdf = new jsPDF();
      
      let yPosition = 20;
      const pageWidth = pdf.internal.pageSize.width;
      const margin = 20;
      const maxWidth = pageWidth - (margin * 2);

      // Helper function to add text with line breaks
      const addText = (text: string, fontSize = 12, isBold = false) => {
        pdf.setFontSize(fontSize);
        if (isBold) pdf.setFont('helvetica', 'bold');
        else pdf.setFont('helvetica', 'normal');
        
        const lines = pdf.splitTextToSize(text, maxWidth);
        pdf.text(lines, margin, yPosition);
        yPosition += lines.length * (fontSize * 0.4) + 5;
        
        // Add new page if needed
        if (yPosition > 270) {
          pdf.addPage();
          yPosition = 20;
        }
      };

      // Title
      addText('Document Analysis Report', 20, true);
      yPosition += 10;

      // Document Information
      addText('Document Information', 16, true);
      addText(`Filename: ${doc.filename}`);
      addText(`Upload Date: ${new Date(doc.created_at).toLocaleDateString()}`);
      addText(`Risk Level: ${doc.risk_level?.toUpperCase() || 'N/A'}`);
      addText(`Risk Score: ${doc.risk_score || 'N/A'}/100`);
      yPosition += 10;

      // Analysis Results
      if (doc.analysis_results.summary) {
        addText('Executive Summary', 16, true);
        addText(doc.analysis_results.summary);
        yPosition += 10;
      }

      if (doc.analysis_results.riskAreas?.length > 0) {
        addText('Risk Areas', 16, true);
        doc.analysis_results.riskAreas.forEach((area: any, index: number) => {
          addText(`${index + 1}. ${area.category}: ${area.description}`);
          if (area.severity) addText(`   Severity: ${area.severity}`);
        });
        yPosition += 10;
      }

      if (doc.analysis_results.findings?.length > 0) {
        addText('Key Findings', 16, true);
        doc.analysis_results.findings.forEach((finding: string, index: number) => {
          addText(`${index + 1}. ${finding}`);
        });
        yPosition += 10;
      }

      if (doc.analysis_results.recommendations?.length > 0) {
        addText('Recommendations', 16, true);
        doc.analysis_results.recommendations.forEach((rec: string, index: number) => {
          addText(`${index + 1}. ${rec}`);
        });
      }

      // Footer
      const pageCount = (pdf as any).internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Generated on ${new Date().toLocaleDateString()} - Page ${i} of ${pageCount}`, 
          margin, pdf.internal.pageSize.height - 10);
      }

      // Save the PDF
      pdf.save(`${doc.filename.split('.')[0]}_analysis_report.pdf`);

      toast({
        title: "Report Downloaded",
        description: "Analysis report has been downloaded as PDF",
      });

    } catch (error) {
      console.error('Error downloading report:', error);
      toast({
        title: "Download Failed",
        description: "Failed to download analysis report",
        variant: "destructive",
      });
    }
  };

  // Get current document (latest uploaded)
  const currentDocument = documents.length > 0 ? documents[0] : null;
  
  // Get recent activity (all documents except the current one)
  const recentActivity = documents.slice(1);

  return {
    documents,
    currentDocument,
    recentActivity,
    loading,
    uploading,
    uploadProgress,
    uploadDocument,
    deleteDocument,
    analyzeDocument,
    downloadDocument,
    downloadReport,
    analysisTimeouts,
    refreshDocuments: fetchDocuments
  };
}