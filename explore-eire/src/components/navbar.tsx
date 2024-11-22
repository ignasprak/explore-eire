"use client"

import { useState } from 'react'
// import Image from 'next/image'

function NavLink({ to, children }: { to: string, children: React.ReactNode }) {
    return <a href={to} className={`mx-4`}>
        {children}
    </a>
}

function MobileNav({ open, setOpen }: { open: boolean, setOpen: React.Dispatch<React.SetStateAction<boolean>> }) {
    return (
        <div className={`absolute top-0 left-0 h-screen w-screen bg-white transform ${open ? "-translate-x-0" : "-translate-x-full"} transition-transform duration-300 ease-in-out filter drop-shadow-md `}>
            <div className="flex items-center justify-center filter drop-shadow-md bg-white h-20"> {/*logo container*/}
                <a className="text-xl font-semibold" href="/">Explore Eire</a>
            </div>
            <div className="flex flex-col ml-4">
                <a className="text-xl font-medium my-4 " href="/login" onClick={() => setTimeout(() => { setOpen(!open) }, 100)}>
                    Login
                </a>
                <a className="text-xl font-normal my-4" href="/register" onClick={() => setTimeout(() => { setOpen(!open) }, 100)}>
                    Register
                </a>
            </div>
        </div>
    )
}

export default function Navbar() {

    const [open, setOpen] = useState(false)
    return (
        <nav className="flex filter drop-shadow-md bg-white px-4 py-4 h-24 items-center">
            <MobileNav open={open} setOpen={setOpen} />
            <div className="w-3/12 flex items-center">
                <a className="text-4xl font-semibold" href="/">Explore Eire</a>
                {/* <a className="text-2xl font-semibold absolute top-0 left-0 mt-4 ml-4" href="/">Explore Eire</a> */}
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

                <div className="z-50 flex relative w-8 h-8 flex-col justify-between items-center md:hidden" onClick={() => {
                    setOpen(!open)
                }}>
                    {/* hamburger button */}
                    <span className={`h-1 w-full bg-black rounded-lg transform transition duration-300 ease-in-out ${open ? "rotate-45 translate-y-3.5" : ""}`} />
                    <span className={`h-1 w-full bg-black rounded-lg transition-all duration-300 ease-in-out ${open ? "w-0" : "w-full"}`} />
                    <span className={`h-1 w-full bg-black rounded-lg transform transition duration-300 ease-in-out ${open ? "-rotate-45 -translate-y-3.5" : ""}`} />
                </div>

                <div className="hidden md:flex">
                    <NavLink to="/login">
                        Login
                    </NavLink>
                    <NavLink to="/register">
                        Register
                    </NavLink>
                </div>
            </div>
        </nav>
    )
}