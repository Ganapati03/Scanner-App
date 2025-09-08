# Supabase Setup Guide

## Prerequisites
- A Supabase account (sign up at https://supabase.com)
- Node.js and npm installed

## Step 1: Create a Supabase Project
1. Go to https://supabase.com and sign in
2. Click "New Project"
3. Fill in your project details:
   - Name: scanner-app
   - Database Password: Choose a strong password
   - Region: Select the closest region to you
4. Click "Create new project"

## Step 2: Get Your Project Credentials
1. Once your project is created, go to Settings → API
2. Copy the following values:
   - Project URL
   - anon public key

## Step 3: Configure Environment Variables
1. Create a `.env` file in the root of your project (Scanner-App-main/)
2. Add the following environment variables:

```env
REACT_APP_SUPABASE_URL=your_project_url_here
REACT_APP_SUPABASE_ANON_KEY=your_anon_key_here
```

Replace `your_project_url_here` and `your_anon_key_here` with the values from Step 2.

## Step 4: Set Up Database Table
1. In your Supabase dashboard, go to the SQL Editor
2. Run the following SQL to create the documents table:

```sql
CREATE TABLE documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  original_file_name TEXT NOT NULL,
  original_file_url TEXT NOT NULL,
  processed_file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to only see their own documents
CREATE POLICY "Users can only see their own documents" ON documents
  FOR ALL USING (auth.uid() = user_id);

-- Create policy to allow users to insert their own documents
CREATE POLICY "Users can insert their own documents" ON documents
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

## Step 5: Set Up Storage Bucket
1. In your Supabase dashboard, go to Storage
2. Click "Create bucket"
3. Name it: `documents`
4. Make it public (uncheck "Private")
5. Click "Create bucket"

## Step 6: Configure Storage Policies
1. In the Storage section, click on your `documents` bucket
2. Go to Policies
3. Create the following policies:

**Policy 1: Allow users to upload files**
```sql
-- Allow authenticated users to upload files
CREATE POLICY "Users can upload files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'documents'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow users to view their own files
CREATE POLICY "Users can view their own files" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'documents'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow users to delete their own files
CREATE POLICY "Users can delete their own files" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'documents'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
```

## Step 7: Enable Email Confirmation (Optional)
1. In your Supabase dashboard, go to Authentication → Settings
2. Under "User Signups", you can:
   - Enable "Enable email confirmations" if you want users to confirm their email
   - Configure SMTP settings if you have a custom email service

## Step 8: Test the Application
1. Make sure your `.env` file is properly configured
2. Run the application:

```bash
npm start
```

3. The app should now be running on http://localhost:3000
4. Try signing up a new user and uploading a document

## Troubleshooting

### Common Issues:

1. **"Invalid API key" error**
   - Check that your `.env` file has the correct Supabase URL and anon key
   - Make sure there are no extra spaces or characters

2. **"Table 'documents' does not exist" error**
   - Make sure you ran the SQL script in Step 4 to create the table

3. **"Bucket 'documents' does not exist" error**
   - Make sure you created the storage bucket in Step 5

4. **Upload fails**
   - Check the browser console for detailed error messages
   - Verify that the storage policies are correctly configured

5. **Authentication issues**
   - Make sure your Supabase project has authentication enabled
   - Check that the user is properly authenticated before uploading

### Getting Help:
- Check the Supabase documentation: https://supabase.com/docs
- Check the browser console for detailed error messages
- Make sure all environment variables are correctly set

## Features Implemented

✅ **Authentication**: Sign up, sign in, sign out with Supabase Auth
✅ **File Upload**: Upload PDF and image files to Supabase Storage
✅ **Document Processing**: Convert PDFs to images and process them
✅ **Database Storage**: Save document metadata to Supabase Database
✅ **Gallery View**: Display uploaded documents in a grid
✅ **Before/After View**: Side-by-side comparison with zoom/pan functionality
✅ **Zoom Controls**: Zoom in/out, pan, and reset functionality
✅ **Responsive Design**: Works on desktop and mobile devices

The application is now fully migrated from Firebase to Supabase!
