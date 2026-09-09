/*
 * File: Header.tsx
 * Author: Nikita Martin (2026 Honours Project, University of Cape Town)
 * Status: Original work.
 * Context: React component for displaying a header.
 * Purpose: Educational use only.
 */
import React from 'react';
import { NavLink } from 'react-router-dom';
import logo from '../../assets/logo.svg';
import {QuestionMarkCircledIcon} from "@radix-ui/react-icons";
 
const ACTIVE_LINK_CLASS = 'text-white font-medium border-b-2 border-white pb-1';
const INACTIVE_LINK_CLASS = 'text-blue-200 hover:text-white transition-colors pb-1 border-b-2 border-transparent';
 
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
                    <NavLink to="/" end className={({ isActive }) => isActive ? ACTIVE_LINK_CLASS : INACTIVE_LINK_CLASS}>
                        Home
                    </NavLink>
 
                    <NavLink to="/info" className={({ isActive }) => isActive ? ACTIVE_LINK_CLASS : INACTIVE_LINK_CLASS}>
                        Info
                    </NavLink>
 
                    <NavLink to="/help" className={({ isActive }) => `flex items-center gap-1 ${isActive ? ACTIVE_LINK_CLASS : INACTIVE_LINK_CLASS}`}>
                        <span className="rounded-full w-5 h-6 flex items-center justify-center text-s">
                            <QuestionMarkCircledIcon />
                        </span>
                        Help
                    </NavLink>
                </nav>
            </div>
        </header>
    );
};
export default Header;