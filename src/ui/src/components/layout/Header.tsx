import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../../assets/logo.svg';
import {QuestionMarkCircledIcon} from "@radix-ui/react-icons";

const Header: React.FC = () => {
    return (
        <header className="bg-[hsl(222,47%,18%)] border-b-0 px-8 py-4">
            <div className="flex items-center justify-between">

                {/* Logo and Title */}
                <div className="flex items-center gap-3 ">
                    <img src={logo} alt="PDR Logo" className="brightness-0 invert w-10 h-10" />
                    <div>
                        <h1 className="text-lg font-bold text-white">
                            Pedagogical Tool for Defeasible Reasoning
                        </h1>

                        <p className="text-sm text-blue-200">
                            Learn by exploring how defeasible reasoning algorithms work.
                        </p>
                    </div>
                </div>

                {/* Navigation Links */}
                <nav className="flex items-center gap-8">
                    <Link to="/" className="text-white font-medium border-b-2 border-white pb-1">
                        Home
                    </Link>

                    <a href="/examples" className="text-blue-200 hover:text-white transition-colors">
                        Examples
                    </a>

                    <a href="/about" className="text-blue-200 hover:text-white transition-colors">
                        About
                    </a>

                    <a href="/help" className="text-blue-200 hover:text-white transition-colors flex items-center gap-1">
                        <span className="rounded-full w-5 h-6 flex items-center justify-center text-s">
                            <QuestionMarkCircledIcon />
                        </span>
                        Help
                    </a>

                </nav>
            </div>
        </header>
    );
};
export default Header;