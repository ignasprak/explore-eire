// import mapbox css
import 'mapbox-gl/dist/mapbox-gl.css';
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

export default async function Home() {
  // fetch data from supabase
  console.log("fetching data from supabase...");
  const { data: locations, error } = await supabase
    .from('attractions')
    .select('Name, id, Url, Telephone, Latitude, Longitude, Address, County, Tags');

  if (error) {
    // log error if fetching data fails
    console.error("error fetching data from supabase:", error.message, error.details, error.hint);
  } else {
    // log fetched locations
    console.log('fetched locations:', locations);
  }

  // what the user sees
  return (
    <div className="bg-primary font-sans min-h-screen flex flex-col">

      {/* navbar component */}
      <Navbar />

      {/* map component */}
      <div className="bg-background p-6 w-11/12 rounded-lg mx-auto mb-4 mt-4">
        <Map locations={locations || []} />
      </div>

    </div>
  );
}
