import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

# Initialize Supabase client
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

def get_supabase_client() -> Client:
    """Get or create Supabase client"""
    return create_client(SUPABASE_URL, SUPABASE_KEY)

# Initialize on module load
supabase: Client = get_supabase_client()
