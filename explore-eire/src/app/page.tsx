import Navbar from '../components/navbar'
import ForYou from '../components/foryou'

export default function Home() {
  return (
    <div className="bg-green-600 font-sans min-h-screen flex flex-col">
      <Navbar />

      {/* Map Section */}
      <div className="bg-white p-6 w-11/12 rounded-lg mx-auto mb-4 mt-4">
        <div className="w-full h-[56.5rem] bg-gray-200 mb-2 flex justify-center items-center">
          <span>MAP SECTION</span>
        </div>
      </div>

      {/* Popular Section */}
      <ForYou />

    </div>
  );
}
