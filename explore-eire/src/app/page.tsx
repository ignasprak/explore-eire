import 'mapbox-gl/dist/mapbox-gl.css';
import Navbar from '../components/navbar';
import ForYou from '../components/personal';
import Map from '../components/map';
import { createClient } from '@supabase/supabase-js';

// Log environment variables
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);

export default async function Home() {
  // Fetch data from Supabase
  console.log("Fetching data from Supabase...");
  const { data: locations, error } = await supabase
    .from('attractions')
    .select('Name, id, Url, Telephone, Latitude, Longitude, Address, County, Tags');

  if (error) {
    console.error("Error fetching data from Supabase:", error.message, error.details, error.hint);
  } else {
    console.log('Fetched locations:', locations);
  }

  return (
    <div className="bg-primary font-sans min-h-screen flex flex-col">

      {/* NavBar Section */}
      <Navbar />

      {/* Map Section */}
      <div className="bg-background p-6 w-11/12 rounded-lg mx-auto mb-4 mt-4">
        <Map locations={locations || []} />
      </div>

      {/* Popular Section */}
      <ForYou />

    </div>
  );
}
