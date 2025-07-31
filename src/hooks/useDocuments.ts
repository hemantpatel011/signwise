import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Document {
  id: string;
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

      // Start AI analysis
      await analyzeDocument(documentData.id);

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
    }
  }, [currentUser]);

  return {
    documents,
    loading,
    uploading,
    uploadProgress,
    uploadDocument,
    deleteDocument,
    analyzeDocument,
    refreshDocuments: fetchDocuments
  };
}