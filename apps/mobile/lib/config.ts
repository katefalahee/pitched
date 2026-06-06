// The one place to change when your laptop's network IP changes.
// Find it by running `ipconfig` and reading the IPv4 Address.
export const LAPTOP_IP = '192.168.0.29'

export const API_URL = `http://${LAPTOP_IP}:4000`
export const SUPABASE_URL = `http://${LAPTOP_IP}:54321`