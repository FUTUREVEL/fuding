const { createClient } = supabase;

// 아래 YOUR_SUPABASE_URL과 YOUR_SUPABASE_ANON_KEY를
// 본인의 Supabase 프로젝트 URL과 anon 키로 변경해주세요.
const SUPABASE_URL = 'https://pyjjstonxfnbrruerrdm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5ampzdG9ueGZuYnJydWVycmRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5NDg5NjQsImV4cCI6MjA2OTUyNDk2NH0.4EP_1x99NfRD20v1RRuWGTS24owDdyAFFud_Rwa8kxQ';

const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 다른 파일에서 supabaseClient를 사용할 수 있도록 내보냅니다.
window.supabaseClient = supabaseClient;
