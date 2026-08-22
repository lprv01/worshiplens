import { redirect } from 'next/navigation'

// The songwriter analyzer moved to /analyze. This route stays behind as a
// permanent redirect so any link already shared keeps working.
export default function GuestRedirect() {
  redirect('/analyze')
}
