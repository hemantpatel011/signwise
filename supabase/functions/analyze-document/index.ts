import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { documentId } = await req.json();
    
    if (!documentId) {
      return new Response(
        JSON.stringify({ error: 'Document ID is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log(`Starting analysis for document ${documentId}`);

    // Get document from database
    const { data: document, error: docError } = await supabaseClient
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single();

    if (docError || !document) {
      console.error('Document not found:', docError);
      return new Response(
        JSON.stringify({ error: 'Document not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    // Update status to analyzing
    await supabaseClient
      .from('documents')
      .update({ status: 'analyzing' })
      .eq('id', documentId);

    // Download document from storage with larger timeout for 10MB files
    const { data: fileData, error: fileError } = await supabaseClient.storage
      .from('documents')
      .download(document.file_path);

    if (fileError || !fileData) {
      console.error('Error downloading file:', fileError);
      await supabaseClient
        .from('documents')
        .update({ status: 'error' })
        .eq('id', documentId);
      
      return new Response(
        JSON.stringify({ error: 'Failed to download document' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Check file size (max 10MB)
    const fileSizeInMB = fileData.size / (1024 * 1024);
    if (fileSizeInMB > 10) {
      console.error('File too large:', fileSizeInMB, 'MB');
      await supabaseClient
        .from('documents')
        .update({ status: 'error' })
        .eq('id', documentId);
      
      return new Response(
        JSON.stringify({ error: 'File size exceeds 10MB limit' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Convert file to base64 for Gemini API with optimized chunk processing
    const arrayBuffer = await fileData.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    let base64Data = '';
    
    // Process in chunks to avoid memory issues with large files
    const chunkSize = 3 * 1024; // 3KB chunks for optimal base64 encoding
    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.slice(i, i + chunkSize);
      base64Data += btoa(String.fromCharCode(...chunk));
    }

    // Analyze document with Gemini AI
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    const prompt = `
Analyze this legal document for potential risks and compliance issues. Provide:

1. **Risk Assessment** (0-1 scale where 1 is highest risk):
   - Overall risk score
   - Risk level classification (low/medium/high)

2. **Key Risk Areas**:
   - Contractual risks
   - Compliance issues
   - Legal liabilities
   - Financial exposures

3. **Specific Findings**:
   - Problematic clauses or sections
   - Missing standard protections
   - Unusual terms or conditions

4. **Recommendations**:
   - Actions to mitigate risks
   - Suggested modifications
   - Additional reviews needed

Please provide a comprehensive analysis in JSON format with the following structure:
{
  "riskScore": <number between 0 and 1>,
  "riskLevel": "<low|medium|high>",
  "summary": "<brief summary of document and overall assessment>",
  "riskAreas": [
    {
      "category": "<risk category>",
      "severity": "<low|medium|high>",
      "description": "<detailed description>",
      "impact": "<potential impact>"
    }
  ],
  "findings": [
    {
      "type": "<finding type>",
      "section": "<document section if applicable>",
      "description": "<detailed finding>",
      "recommendation": "<suggested action>"
    }
  ],
  "recommendations": [
    {
      "priority": "<high|medium|low>",
      "action": "<recommended action>",
      "rationale": "<reason for recommendation>"
    }
  ]
}
`;

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt },
                {
                  inline_data: {
                    mime_type: document.file_type,
                    data: base64Data
                  }
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 1,
            topK: 1,
            topP: 1,
            maxOutputTokens: 4096,
          }
        })
      }
    );

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error('Gemini API error:', errorText);
      throw new Error(`Gemini API error: ${geminiResponse.status}`);
    }

    const geminiResult = await geminiResponse.json();
    const analysisText = geminiResult.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!analysisText) {
      throw new Error('No analysis text received from Gemini');
    }

    console.log('Raw Gemini response:', analysisText);

    // Parse the JSON response from Gemini
    let analysisResults;
    try {
      // Extract JSON from the response (remove any markdown formatting)
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : analysisText;
      analysisResults = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('Failed to parse Gemini response as JSON:', parseError);
      // Fallback: create a structured response from the text
      analysisResults = {
        riskScore: 0.5,
        riskLevel: 'medium',
        summary: analysisText.substring(0, 500) + '...',
        riskAreas: [],
        findings: [],
        recommendations: []
      };
    }

    // Determine risk level based on score
    let riskLevel = 'low';
    if (analysisResults.riskScore >= 0.7) riskLevel = 'high';
    else if (analysisResults.riskScore >= 0.4) riskLevel = 'medium';

    // Update document with analysis results
    const { error: updateError } = await supabaseClient
      .from('documents')
      .update({
        status: 'analyzed',
        risk_level: riskLevel,
        risk_score: analysisResults.riskScore,
        analysis_results: analysisResults
      })
      .eq('id', documentId);

    if (updateError) {
      console.error('Error updating document:', updateError);
      throw new Error('Failed to save analysis results');
    }

    console.log(`Analysis completed for document ${documentId}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        documentId,
        riskScore: analysisResults.riskScore,
        riskLevel,
        analysisResults 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-document function:', error);
    
    // Try to update document status to error if we have the documentId
    const body = await req.text();
    try {
      const { documentId } = JSON.parse(body);
      if (documentId) {
        const supabaseClient = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_ANON_KEY') ?? '',
          {
            global: {
              headers: { Authorization: req.headers.get('Authorization')! },
            },
          }
        );
        
        await supabaseClient
          .from('documents')
          .update({ status: 'error' })
          .eq('id', documentId);
      }
    } catch (e) {
      console.error('Failed to update document status to error:', e);
    }

    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});