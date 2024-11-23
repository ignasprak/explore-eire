import Navbar from '../components/navbar'
import ForYou from '../components/foryou'

export default function Home() {
  return (
    <div className="bg-green-600 font-sans min-h-screen">
      <Navbar />

      {/* Map Section */}
      <div className="bg-white p-6 w-11/12 rounded-lg mx-auto mb-4 mt-4">
        <div className="w-full h-[48rem] bg-gray-200 mb-2 flex justify-center items-center">
          <span>MAP SECTION</span>
        </div>
      </div>

      {/* Popular Section */}
      <ForYou />

      {/* About Section */}
      <div className="bg-white mt-4 p-6 w-11/12 rounded-lg mx-auto">
        <h2 className="text-lg font-bold mb-2">ABOUT THIS PROJECT</h2>
        <p className="text-gray-600 text-sm">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce at erat sed ligula placerat tincidunt id et libero. Nam sed pharetra felis, id sollicitudin neque. Etiam sed mauris id nisi elementum cursus ut ac arcu. Nulla consequat, est eget bibendum commodo, ligula massa tincidunt nisl, sed ornare nunc arcu nec ligula. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Nullam dapibus hendrerit turpis in semper. Sed mollis, sem vitae faucibus semper, lacus libero volutpat velit, non semper sapien nisl sed metus. Vivamus sit amet eleifend mauris. Curabitur ut cursus odio. Proin nisl mi, ornare et dapibus a, luctus eu ante.

          Etiam tincidunt arcu eget ligula vulputate ultrices id sed metus. Maecenas luctus diam in gravida faucibus. Nam sed fermentum magna. Pellentesque scelerisque faucibus hendrerit. Aenean malesuada, felis a accumsan lacinia, velit sem pulvinar elit, quis venenatis sapien nisi a felis. In at pharetra nulla. Etiam vel eros euismod, lacinia ex commodo, interdum mauris. Curabitur nec pharetra tortor, in sagittis lorem. Donec tristique justo eu urna vulputate hendrerit. Maecenas mattis tincidunt blandit. Donec euismod, sapien eget volutpat lacinia, augue ipsum accumsan lorem, in viverra lacus lectus sed mi. Praesent bibendum lacus eget arcu scelerisque bibendum. Aenean sed leo et elit venenatis lobortis nec id diam.

          Praesent pretium purus et lacus mattis, ut condimentum metus facilisis. Pellentesque viverra nisl eu mauris imperdiet sodales. Proin at sapien ut nunc tincidunt rhoncus. Duis tempus metus dapibus libero egestas dapibus. Vivamus vel efficitur justo. Praesent posuere ex eget ipsum maximus, sit amet condimentum enim viverra. Vivamus porta sagittis ultricies. Nam sit amet feugiat eros. Maecenas et mauris eu urna elementum molestie eget nec tellus. Quisque lacinia mauris eu sagittis luctus. Proin eget lorem ac lacus lacinia luctus sed eu libero. Aliquam euismod ante tempor velit elementum, in aliquet massa malesuada.

          In in dapibus diam, ultricies viverra ipsum. Duis egestas felis at nunc venenatis, sed rutrum dolor vulputate. Fusce maximus, tellus sed maximus feugiat, sapien odio egestas massa, ac sagittis dolor mi vel est. Aliquam eu mollis ligula, vitae ultrices magna. Vivamus id mi vitae lectus vestibulum varius id vitae urna. Etiam sagittis et velit in finibus. Mauris at tellus vitae nisi molestie varius. In facilisis nisl elit, eget eleifend dolor varius vel. Aenean lacinia porttitor consequat. Vivamus sit amet velit in enim sagittis finibus bibendum non dui.

          Nullam pulvinar tellus sed hendrerit mollis. Maecenas volutpat luctus elit, non laoreet lectus sagittis non. Integer finibus sapien elementum nisi molestie tincidunt. Donec consequat eleifend dolor. Aliquam id felis pharetra, euismod tortor eget, elementum libero. Integer commodo euismod est et eleifend. Quisque sit amet sollicitudin mi. Ut laoreet maximus tincidunt. Phasellus finibus, enim eu luctus congue, nisi dui porttitor mauris, vel efficitur mi arcu lobortis erat.
        </p>
      </div>
    </div>
  );
}
