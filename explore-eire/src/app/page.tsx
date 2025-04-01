// import navbar component
import Navbar from '../components/navbar';
// import map component
import Map from '../components/map';
// import supabase client
import { createClient } from '@supabase/supabase-js';

// log environment variables
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

// initialise supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);

export default async function CollectionsPage() {

  // what the user sees
  return (
    <div className="flex h-screen">
      {/* Sidebar - Always full height */}
      <div className="bg-white shadow-lg md:flex flex-col hidden">
        <Navbar />
      </div>

      {/* Main Content (Map & UI) */}
      <div className="flex-1 w-full">
        <Map />
      </div>
    </div>
  );
}