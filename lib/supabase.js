// Supabase 클라이언트 라이브러리 로드
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.0/+esm'

// Supabase 클라이언트 설정
const supabaseUrl = 'https://fhjpwyvnxguvkialjyah.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZoanB3eXZueGd1dmtpYWxqeWFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc2NDMxMjEsImV4cCI6MjA2MzIxOTEyMX0.aArdHeZlwdUSJ5gLeG3xMtdfg1e5TatSZo1FeFv6Vms'

// Supabase 클라이언트 생성
export const supabase = createClient(supabaseUrl, supabaseAnonKey); 