import 'mapbox-gl/dist/mapbox-gl.css';
import Navbar from '../components/navbar'
import ForYou from '../components/personal'
import Map from '../components/map';

export default function Home() {
  return (
    <div className="bg-primary font-sans min-h-screen flex flex-col">
      <Navbar />

      {/* Map Section */}
      <div className="bg-background p-6 w-11/12 rounded-lg mx-auto mb-4 mt-4">
        <Map />
      </div>

      {/* Popular Section */}
      <ForYou />

    </div>
  );
}
