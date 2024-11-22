
import Navbar from '../components/navbar'

export default function Home() {
  return (


    <div className="bg-green-600 font-sans min-h-screen">
      <Navbar />

      {/* Map Section */}
      <div className="bg-white p-6 w-11/12 rounded-lg mx-auto mb-4 mt-4">
        <div className="w-full h-[50rem] bg-gray-200 mb-2 flex justify-center items-center">
          <span>MAP SECTION</span>
        </div>
      </div>

      {/* Popular Section */}
      <div className="bg-white p-6 w-11/12 rounded-lg mx-auto">
        <div className="flex items-center justify-between mb-4">
          <button className="text-gray-600">Weather</button>
          <h2 className="text-lg font-bold text-black">POPULAR</h2>
          <button className="text-gray-600">For You</button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="flex flex-col items-center">
              <div className="w-full h-24 bg-gray-200 mb-2 flex justify-center items-center">
                <span>LOCATION IMAGE</span>
              </div>
              <span className="text-center">Sample Text</span>
            </div>
          ))}
        </div>
      </div>

      {/* About Section */}
      <div className="bg-white mt-4 p-6 w-11/12 rounded-lg mx-auto">
        <h2 className="text-lg font-bold mb-2">ABOUT THIS PROJECT</h2>
        <p className="text-gray-600 text-sm">
          EXAMPLE TEXT EXAMPLE TEXT EXAMPLE TEXT EXAMPLE TEXT EXAMPLE TEXT EXAMPLE TEXT EXAMPLE TEXT EXAMPLE TEXT EXAMPLE
          TEXT EXAMPLE TEXT EXAMPLE TEXT EXAMPLE TEXT EXAMPLE TEXT EXAMPLE TEXT EXAMPLE TEXT EXAMPLE TEXT EXAMPLE TEXT
          EXAMPLE TEXT EXAMPLE TEXT EXAMPLE TEXT EXAMPLE TEXT EXAMPLE TEXT EXAMPLE TEXT EXAMPLE TEXT EXAMPLE TEXT EXAMPLE
          TEXT.
        </p>
      </div>
    </div>
  );
}
