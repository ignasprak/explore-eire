import Image from 'next/image';
// import img1 from '../../../public/images/blarney.jpg';
// import img2 from '../../../public/images/causeway.jpg';
import img1 from '../../../public/images/cliffs_moher.jpg';
import img2 from '../../../public/images/causeway.jpg';
const PopularSection = () => (
    <>
        <div className="grid grid-rows-3 grid-cols-2 gap-1 border-2 border-red-500">
            {/* the image represents half of the parent div on the left*/}
            <div className="row-span-3 col-span-1 border-2 border-green-500 mt-2 mb-2">
                <Image src={img1} alt="Cliffs of Moher" layout="fixed" className='object-contain max-w-full rounded-lg' />
            </div>

            {/* the upper text box on the right of the div, represents half of the width of the parent div, and half the height of the parent div */}
            <div className="row-span-1 col-span-1 border-2 border-green-500 rounded-lg w-full mt-2">
                Cliffs of Moher
            </div>

            {/* the lower text box on the right of the div, represents half of the width of the parent div, and half the height of the parent div */}
            <div className="row-span-2 col-span-1 border-2 border-green-500 rounded-lg max-w-full mb-2">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque at diam in massa bibendum pretium a eget erat.
                Vivamus nunc velit, ornare quis lorem sed, imperdiet venenatis elit. Nam ac consequat nibh, non mattis justo.
                Nullam ornare convallis congue. Aliquam dapibus fermentum condimentum. Curabitur quis mollis tellus.
                Aenean at nisi nec diam egestas posuere. Morbi mollis, enim in luctus iaculis, augue lectus mollis nisl,
                egestas fermentum lorem massa a sapien. Ut accumsan enim metus, a ullamcorper nisl porttitor ut.
            </div>
        </div>

        <div className="grid grid-rows-3 grid-flow-col gap-1 border-2 border-red-500">
            {/* the image represents half of the parent div */}
            <div className="row-span-3 border-2 border-green-500 w-1/2">
                <Image src={img2} alt="Giant's Causeway" layout="fixed" className='object-contain max-w-full rounded-lg' />
            </div>
            {/* the upper text box represents half of the width of the parent div, and half the height of the parent div */}
            <div className="row-span-1 col-span-1 border-2 border-green-500 rounded-lg w-full">Giant's Causeway</div>
            {/* the lower text box represents half of the width of the parent div, and half the height of the parent div */}
            <div className="row-span-2 col-span-1 border-2 border-green-500 rounded-lg max-w-full">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque at diam in massa bibendum pretium a eget erat.
                Vivamus nunc velit, ornare quis lorem sed, imperdiet venenatis elit. Nam ac consequat nibh, non mattis justo.
                Nullam ornare convallis congue. Aliquam dapibus fermentum condimentum. Curabitur quis mollis tellus.
                Aenean at nisi nec diam egestas posuere. Morbi mollis, enim in luctus iaculis, augue lectus mollis nisl,
                egestas fermentum lorem massa a sapien. Ut accumsan enim metus, a ullamcorper nisl porttitor ut.
            </div>
        </div>


    </>
);

export default PopularSection;