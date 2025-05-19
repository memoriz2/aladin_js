import { createClient } from '@supabase/supabase-js'

// Supabase 클라이언트 설정
const supabaseUrl = 'https://fhjpwyvnxguvkialjyah.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZoanB3eXZueGd1dmtpYWxqeWFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc2NDMxMjEsImV4cCI6MjA2MzIxOTEyMX0.aArdHeZlwdUSJ5gLeG3xMtdfg1e5TatSZo1FeFv6Vms'

export const supabase = createClient(supabaseUrl, supabaseAnonKey) 