"use client"

import Image from 'next/image';
import logo from '../../public/images/logo.png';

function NavLink({ to, children }: { to: string, children: React.ReactNode }) {
    return <a href={to} className={`mx-4`}>
        {children}
    </a>
}

export default function Navbar() {
    return (
        <nav className="flex filter drop-shadow-md bg-white px-4 py-4 h-28 items-center">
            <div className="w-3/12 flex items-center">
                <Image src={logo} alt="The Explore Eire Logo" layout="fixed" className='m-0 max-w-32' />
                {/* <Image src={img1} alt="Cliffs of Moher" layout="fixed" className='object-contain max-w-full rounded-lg' /> */}
            </div>
            <div className="w-6/12 flex justify-center items-center">
                <p className="text-xl font-semibold mr-4 ">
                    <a className="underline decoration-pink-500 text-left">AI</a> <a className="underline decoration-indigo-500">SEARCH</a>
                </p>
                <input
                    type="text"
                    placeholder="Search..."
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                />
            </div>
            <div className="w-3/12 flex justify-end items-center">
                <NavLink to="/login">
                    Login
                </NavLink>
                <NavLink to="/register">
                    Register
                </NavLink>
            </div>
        </nav>
    )
}
