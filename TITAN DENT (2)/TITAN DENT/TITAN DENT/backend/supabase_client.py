import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

# Initialize Supabase client
SUPABASE_URL = os.environ.get("SUPABASE_URL", "https://xrqaioekczapvoehftiz.supabase.co")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", 
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhycWFpb2VrY3phcHZvZWhmdGl6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDY1OTE5NiwiZXhwIjoyMDkwMjM1MTk2fQ.bJcX57Dq5u5ePa8VXGpP5FZ3SOZ6aMkVXJOKZ6-UGQI")

def get_supabase_client() -> Client:
    """Get or create Supabase client"""
    return create_client(SUPABASE_URL, SUPABASE_KEY)

# Initialize on module load
supabase: Client = get_supabase_client()
