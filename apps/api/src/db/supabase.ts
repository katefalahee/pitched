import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

// The service key lets the API read and write freely on the server side.
export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)