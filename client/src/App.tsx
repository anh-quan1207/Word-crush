import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import RoomPage from './pages/RoomPage';
import GamePage from './pages/GamePage';
import { SocketProvider } from './contexts/SocketContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';

const VSCodeSidebar = () => {
  return (
    <div className="w-14 bg-[#252526] border-r border-[#1E1E1E] flex flex-col items-center py-2">
      <div className="w-8 h-8 mb-4 rounded-md bg-[#2D2D2D] flex items-center justify-center text-white/70 hover:text-white/90 hover:bg-[#37373D] cursor-pointer">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
          <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM2 2a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1H2z"/>
          <path d="M2.5 4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5H3a.5.5 0 0 1-.5-.5V4z"/>
        </svg>
      </div>
      <div className="w-8 h-8 my-1 rounded-md bg-[#37373D] flex items-center justify-center text-white cursor-pointer border-l-2 border-[#0078D4]">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
          <path d="M1 2.828c.885-.37 2.154-.769 3.388-.893 1.33-.134 2.458.063 3.112.752v9.746c-.935-.53-2.12-.603-3.213-.493-1.18.12-2.37.461-3.287.811V2.828zm7.5-.141c.654-.689 1.782-.886 3.112-.752 1.234.124 2.503.523 3.388.893v9.923c-.918-.35-2.107-.692-3.287-.81-1.094-.111-2.278-.039-3.213.492V2.687zM8 1.783C7.015.936 5.587.81 4.287.94c-1.514.153-3.042.672-3.994 1.105A.5.5 0 0 0 0 2.5v11a.5.5 0 0 0 .707.455c.882-.4 2.303-.881 3.68-1.02 1.409-.142 2.59.087 3.223.877a.5.5 0 0 0 .78 0c.633-.79 1.814-1.019 3.222-.877 1.378.139 2.8.62 3.681 1.02A.5.5 0 0 0 16 13.5v-11a.5.5 0 0 0-.293-.455c-.952-.433-2.48-.952-3.994-1.105C10.413.809 8.985.936 8 1.783z"/>
        </svg>
      </div>
      <div className="w-8 h-8 my-1 rounded-md bg-[#2D2D2D] flex items-center justify-center text-white/70 hover:text-white/90 hover:bg-[#37373D] cursor-pointer">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
          <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
        </svg>
      </div>
      <div className="w-8 h-8 my-1 rounded-md bg-[#2D2D2D] flex items-center justify-center text-white/70 hover:text-white/90 hover:bg-[#37373D] cursor-pointer">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
          <path d="M5 0a.5.5 0 0 1 .5.5V2h9a.5.5 0 0 1 .5.5v10a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5V.5a.5.5 0 0 1 .5-.5zM9.5 3h-8a.5.5 0 0 0-.5.5v9a.5.5 0 0 0 .5.5h8a.5.5 0 0 0 .5-.5v-9a.5.5 0 0 0-.5-.5z"/>
        </svg>
      </div>
      <div className="w-8 h-8 my-1 rounded-md bg-[#2D2D2D] flex items-center justify-center text-white/70 hover:text-white/90 hover:bg-[#37373D] cursor-pointer">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
          <path d="M4.715 6.542 3.343 7.914a3 3 0 1 0 4.243 4.243l1.828-1.829A3 3 0 0 0 8.586 5.5L8 6.086a1 1 0 0 0-.154.199 2 2 0 0 1 .861 3.337L6.88 11.45a2 2 0 1 1-2.83-2.83l.793-.792a4 4 0 0 1-.128-1.287z"/>
          <path d="M6.586 4.672A3 3 0 0 0 7.414 9.5l.775-.776a2 2 0 0 1-.896-3.346L9.12 3.55a2 2 0 1 1 2.83 2.83l-.793.792c.112.42.155.855.128 1.287l1.372-1.372a3 3 0 1 0-4.243-4.243L6.586 4.672z"/>
        </svg>
      </div>
      <div className="mt-auto w-8 h-8 rounded-md bg-[#2D2D2D] flex items-center justify-center text-white/70 hover:text-white/90 hover:bg-[#37373D] cursor-pointer">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
          <path d="M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 0 1-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311c.446.82.023 1.841-.872 2.105l-.34.1c-1.4.413-1.4 2.397 0 2.81l.34.1a1.464 1.464 0 0 1 .872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 0 1 2.105.872l.1.34c.413 1.4 2.397 1.4 2.81 0l.1-.34a1.464 1.464 0 0 1 2.105-.872l.31.17c1.283.698 2.686-.705 1.987-1.987l-.169-.311a1.464 1.464 0 0 1 .872-2.105l.34-.1c1.4-.413 1.4-2.397 0-2.81l-.34-.1a1.464 1.464 0 0 1-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 0 1-2.105-.872l-.1-.34zM8 10.93a2.929 2.929 0 1 1 0-5.86 2.929 2.929 0 0 1 0 5.858z"/>
        </svg>
      </div>
    </div>
  );
};

const VSCodeExplorer = () => {
  return (
    <div className="w-64 bg-[#252526] text-white/80 overflow-y-auto border-r border-[#1E1E1E]">
      <div className="p-3 uppercase text-xs font-semibold tracking-wide flex justify-between items-center">
        <span>Explorer</span>
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16" className="cursor-pointer">
          <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
        </svg>
      </div>
      <div className="px-2 pb-4">
        {/* Project folder */}
        <div className="flex items-center p-1 cursor-pointer hover:bg-[#2A2D2E] rounded">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" className="mr-1 transform rotate-90" viewBox="0 0 16 16">
            <path d="m12.14 8.753-5.482 4.796c-.646.566-1.658.106-1.658-.753V3.204a1 1 0 0 1 1.659-.753l5.48 4.796a1 1 0 0 1 0 1.506z"/>
          </svg>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="mr-1 text-[#DCAD56]" viewBox="0 0 16 16">
            <path d="M1 3.5A1.5 1.5 0 0 1 2.5 2h2.764c.958 0 1.76.56 2.311 1.184C7.985 3.648 8.48 4 9 4h4.5A1.5 1.5 0 0 1 15 5.5v.64c.57.265.94.876.856 1.546l-.64 5.124A2.5 2.5 0 0 1 12.733 15H3.266a2.5 2.5 0 0 1-2.481-2.19l-.64-5.124A1.5 1.5 0 0 1 1 6.14V3.5zM2 6h12v-.5a.5.5 0 0 0-.5-.5H9c-.964 0-1.71-.629-2.174-1.154C6.374 3.334 5.82 3 5.264 3H2.5a.5.5 0 0 0-.5.5V6zm-.367 1a.5.5 0 0 0-.496.562l.64 5.124A1.5 1.5 0 0 0 3.266 14h9.468a1.5 1.5 0 0 0 1.489-1.314l.64-5.124A.5.5 0 0 0 14.367 7H1.633z"/>
          </svg>
          <span className="font-semibold">WORD-CRUSH</span>
        </div>
        
        {/* Source folder */}
        <div className="ml-4">
          <div className="flex items-center p-1 cursor-pointer hover:bg-[#2A2D2E] rounded">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" className="mr-1 transform rotate-90" viewBox="0 0 16 16">
              <path d="m12.14 8.753-5.482 4.796c-.646.566-1.658.106-1.658-.753V3.204a1 1 0 0 1 1.659-.753l5.48 4.796a1 1 0 0 1 0 1.506z"/>
            </svg>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="mr-1 text-[#5a9dd6]" viewBox="0 0 16 16">
              <path d="M1 3.5A1.5 1.5 0 0 1 2.5 2h2.764c.958 0 1.76.56 2.311 1.184C7.985 3.648 8.48 4 9 4h4.5A1.5 1.5 0 0 1 15 5.5v.64c.57.265.94.876.856 1.546l-.64 5.124A2.5 2.5 0 0 1 12.733 15H3.266a2.5 2.5 0 0 1-2.481-2.19l-.64-5.124A1.5 1.5 0 0 1 1 6.14V3.5zM2 6h12v-.5a.5.5 0 0 0-.5-.5H9c-.964 0-1.71-.629-2.174-1.154C6.374 3.334 5.82 3 5.264 3H2.5a.5.5 0 0 0-.5.5V6zm-.367 1a.5.5 0 0 0-.496.562l.64 5.124A1.5 1.5 0 0 0 3.266 14h9.468a1.5 1.5 0 0 0 1.489-1.314l.64-5.124A.5.5 0 0 0 14.367 7H1.633z"/>
            </svg>
            <span>src</span>
          </div>
          
          {/* Components folder */}
          <div className="ml-4">
            <div className="flex items-center p-1 cursor-pointer hover:bg-[#2A2D2E] rounded">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" className="mr-1 transform rotate-90" viewBox="0 0 16 16">
                <path d="m12.14 8.753-5.482 4.796c-.646.566-1.658.106-1.658-.753V3.204a1 1 0 0 1 1.659-.753l5.48 4.796a1 1 0 0 1 0 1.506z"/>
              </svg>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="mr-1 text-[#5a9dd6]" viewBox="0 0 16 16">
                <path d="M1 3.5A1.5 1.5 0 0 1 2.5 2h2.764c.958 0 1.76.56 2.311 1.184C7.985 3.648 8.48 4 9 4h4.5A1.5 1.5 0 0 1 15 5.5v.64c.57.265.94.876.856 1.546l-.64 5.124A2.5 2.5 0 0 1 12.733 15H3.266a2.5 2.5 0 0 1-2.481-2.19l-.64-5.124A1.5 1.5 0 0 1 1 6.14V3.5zM2 6h12v-.5a.5.5 0 0 0-.5-.5H9c-.964 0-1.71-.629-2.174-1.154C6.374 3.334 5.82 3 5.264 3H2.5a.5.5 0 0 0-.5.5V6zm-.367 1a.5.5 0 0 0-.496.562l.64 5.124A1.5 1.5 0 0 0 3.266 14h9.468a1.5 1.5 0 0 0 1.489-1.314l.64-5.124A.5.5 0 0 0 14.367 7H1.633z"/>
              </svg>
              <span>components</span>
            </div>
            
            <div className="ml-4">
              <div className="flex items-center p-1 cursor-pointer hover:bg-[#2A2D2E] rounded">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" className="mr-1 text-[#3CA55C]" viewBox="0 0 16 16">
                  <path d="M14 4.5V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h5.5L14 4.5zm-3 0A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V4.5h-2z"/>
                </svg>
                <span>ThemeToggleButton.tsx</span>
              </div>
              <div className="flex items-center p-1 cursor-pointer hover:bg-[#2A2D2E] rounded">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" className="mr-1 text-[#3CA55C]" viewBox="0 0 16 16">
                  <path d="M14 4.5V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h5.5L14 4.5zm-3 0A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V4.5h-2z"/>
                </svg>
                <span>Timer.tsx</span>
              </div>
            </div>
          </div>
          
          {/* Pages folder */}
          <div className="ml-4">
            <div className="flex items-center p-1 cursor-pointer hover:bg-[#2A2D2E] rounded">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" className="mr-1 transform rotate-90" viewBox="0 0 16 16">
                <path d="m12.14 8.753-5.482 4.796c-.646.566-1.658.106-1.658-.753V3.204a1 1 0 0 1 1.659-.753l5.48 4.796a1 1 0 0 1 0 1.506z"/>
              </svg>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="mr-1 text-[#5a9dd6]" viewBox="0 0 16 16">
                <path d="M1 3.5A1.5 1.5 0 0 1 2.5 2h2.764c.958 0 1.76.56 2.311 1.184C7.985 3.648 8.48 4 9 4h4.5A1.5 1.5 0 0 1 15 5.5v.64c.57.265.94.876.856 1.546l-.64 5.124A2.5 2.5 0 0 1 12.733 15H3.266a2.5 2.5 0 0 1-2.481-2.19l-.64-5.124A1.5 1.5 0 0 1 1 6.14V3.5zM2 6h12v-.5a.5.5 0 0 0-.5-.5H9c-.964 0-1.71-.629-2.174-1.154C6.374 3.334 5.82 3 5.264 3H2.5a.5.5 0 0 0-.5.5V6zm-.367 1a.5.5 0 0 0-.496.562l.64 5.124A1.5 1.5 0 0 0 3.266 14h9.468a1.5 1.5 0 0 0 1.489-1.314l.64-5.124A.5.5 0 0 0 14.367 7H1.633z"/>
              </svg>
              <span>pages</span>
            </div>
            
            <div className="ml-4">
              <div className="flex items-center p-1 cursor-pointer hover:bg-[#2A2D2E] rounded bg-[#37373D]">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" className="mr-1 text-[#3CA55C]" viewBox="0 0 16 16">
                  <path d="M14 4.5V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h5.5L14 4.5zm-3 0A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V4.5h-2z"/>
                </svg>
                <span>HomePage.tsx</span>
              </div>
              <div className="flex items-center p-1 cursor-pointer hover:bg-[#2A2D2E] rounded">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" className="mr-1 text-[#3CA55C]" viewBox="0 0 16 16">
                  <path d="M14 4.5V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h5.5L14 4.5zm-3 0A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V4.5h-2z"/>
                </svg>
                <span>RoomPage.tsx</span>
              </div>
              <div className="flex items-center p-1 cursor-pointer hover:bg-[#2A2D2E] rounded">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" className="mr-1 text-[#3CA55C]" viewBox="0 0 16 16">
                  <path d="M14 4.5V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h5.5L14 4.5zm-3 0A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V4.5h-2z"/>
                </svg>
                <span>GamePage.tsx</span>
              </div>
            </div>
          </div>
          
          {/* Contexts folder */}
          <div className="ml-4">
            <div className="flex items-center p-1 cursor-pointer hover:bg-[#2A2D2E] rounded">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" className="mr-1 transform rotate-90" viewBox="0 0 16 16">
                <path d="m12.14 8.753-5.482 4.796c-.646.566-1.658.106-1.658-.753V3.204a1 1 0 0 1 1.659-.753l5.48 4.796a1 1 0 0 1 0 1.506z"/>
              </svg>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="mr-1 text-[#5a9dd6]" viewBox="0 0 16 16">
                <path d="M1 3.5A1.5 1.5 0 0 1 2.5 2h2.764c.958 0 1.76.56 2.311 1.184C7.985 3.648 8.48 4 9 4h4.5A1.5 1.5 0 0 1 15 5.5v.64c.57.265.94.876.856 1.546l-.64 5.124A2.5 2.5 0 0 1 12.733 15H3.266a2.5 2.5 0 0 1-2.481-2.19l-.64-5.124A1.5 1.5 0 0 1 1 6.14V3.5zM2 6h12v-.5a.5.5 0 0 0-.5-.5H9c-.964 0-1.71-.629-2.174-1.154C6.374 3.334 5.82 3 5.264 3H2.5a.5.5 0 0 0-.5.5V6zm-.367 1a.5.5 0 0 0-.496.562l.64 5.124A1.5 1.5 0 0 0 3.266 14h9.468a1.5 1.5 0 0 0 1.489-1.314l.64-5.124A.5.5 0 0 0 14.367 7H1.633z"/>
              </svg>
              <span>contexts</span>
            </div>
            
            <div className="ml-4">
              <div className="flex items-center p-1 cursor-pointer hover:bg-[#2A2D2E] rounded">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" className="mr-1 text-[#3CA55C]" viewBox="0 0 16 16">
                  <path d="M14 4.5V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h5.5L14 4.5zm-3 0A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V4.5h-2z"/>
                </svg>
                <span>ThemeContext.tsx</span>
              </div>
              <div className="flex items-center p-1 cursor-pointer hover:bg-[#2A2D2E] rounded">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" className="mr-1 text-[#3CA55C]" viewBox="0 0 16 16">
                  <path d="M14 4.5V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h5.5L14 4.5zm-3 0A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V4.5h-2z"/>
                </svg>
                <span>SocketContext.tsx</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Public folder */}
        <div className="ml-4 mt-1">
          <div className="flex items-center p-1 cursor-pointer hover:bg-[#2A2D2E] rounded">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" className="mr-1" viewBox="0 0 16 16">
              <path d="m12.14 8.753-5.482 4.796c-.646.566-1.658.106-1.658-.753V3.204a1 1 0 0 1 1.659-.753l5.48 4.796a1 1 0 0 1 0 1.506z"/>
            </svg>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="mr-1 text-[#5a9dd6]" viewBox="0 0 16 16">
              <path d="M1 3.5A1.5 1.5 0 0 1 2.5 2h2.764c.958 0 1.76.56 2.311 1.184C7.985 3.648 8.48 4 9 4h4.5A1.5 1.5 0 0 1 15 5.5v.64c.57.265.94.876.856 1.546l-.64 5.124A2.5 2.5 0 0 1 12.733 15H3.266a2.5 2.5 0 0 1-2.481-2.19l-.64-5.124A1.5 1.5 0 0 1 1 6.14V3.5zM2 6h12v-.5a.5.5 0 0 0-.5-.5H9c-.964 0-1.71-.629-2.174-1.154C6.374 3.334 5.82 3 5.264 3H2.5a.5.5 0 0 0-.5.5V6zm-.367 1a.5.5 0 0 0-.496.562l.64 5.124A1.5 1.5 0 0 0 3.266 14h9.468a1.5 1.5 0 0 0 1.489-1.314l.64-5.124A.5.5 0 0 0 14.367 7H1.633z"/>
            </svg>
            <span>public</span>
          </div>
        </div>
        
        {/* Root files */}
        <div className="ml-4 mt-2">
          <div className="flex items-center p-1 cursor-pointer hover:bg-[#2A2D2E] rounded">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" className="mr-1 text-[#e8e8e8]" viewBox="0 0 16 16">
              <path d="M14 4.5V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h5.5L14 4.5zm-3 0A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V4.5h-2z"/>
            </svg>
            <span>App.tsx</span>
          </div>
          <div className="flex items-center p-1 cursor-pointer hover:bg-[#2A2D2E] rounded">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" className="mr-1 text-[#CD3131]" viewBox="0 0 16 16">
              <path d="M14 4.5V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h5.5L14 4.5zm-3 0A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V4.5h-2z"/>
            </svg>
            <span>index.tsx</span>
          </div>
          <div className="flex items-center p-1 cursor-pointer hover:bg-[#2A2D2E] rounded">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" className="mr-1 text-[#3CA55C]" viewBox="0 0 16 16">
              <path d="M14 4.5V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h5.5L14 4.5zm-3 0A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V4.5h-2z"/>
            </svg>
            <span>package.json</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const AppContent = () => {
  const { theme } = useTheme();
  
  let backgroundClass = '';
  if (theme === 'pink') {
    backgroundClass = 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500';
  } else if (theme === 'dark') {
    backgroundClass = 'bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700';
  } else {
    // VS Code theme
    backgroundClass = 'bg-[#1E1E1E]';
  }
  
  // Xác định màu nền cho khung game dựa trên theme
  const gameContainerClass = theme === 'vscode' 
    ? 'bg-[#2D2D2D] text-white border border-[#3C3C3C]' 
    : 'bg-white';
  
  return (
    <Router>
      <div className={`min-h-screen ${backgroundClass} flex flex-col relative`}>
        {theme === 'vscode' ? (
          <div className="flex flex-1">
            <VSCodeSidebar />
            <VSCodeExplorer />
            <div className="flex-1 overflow-auto bg-[#1E1E1E]">
              <div className="flex items-center border-b border-[#2D2D2D] bg-[#252526]">
                <div className="px-4 py-2 bg-[#1E1E1E] text-white/80 border-r border-[#2D2D2D] flex items-center">
                  <span>HomePage.tsx</span>
                  <span className="ml-2 text-xs px-1.5 py-0.5 rounded-full bg-[#2D2D2D]">×</span>
                </div>
              </div>
              <div className="p-6">
                <div className="max-w-4xl mx-auto bg-[#2D2D2D] rounded-lg shadow-2xl overflow-hidden border border-[#3C3C3C]">
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/room/:roomId" element={<RoomPage />} />
                    <Route path="/game/:roomId" element={<GamePage />} />
                  </Routes>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="container mx-auto py-8 px-4 flex-grow">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/room/:roomId" element={<RoomPage />} />
              <Route path="/game/:roomId" element={<GamePage />} />
            </Routes>
          </div>
        )}
        <div className="py-5 text-center">
          <p className={`text-xs ${theme === 'vscode' ? 'text-white/70' : 'text-white'}`}>© 2025 Made by PAQ</p>
        </div>
      </div>
    </Router>
  );
};

function App() {
  return (
    <SocketProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </SocketProvider>
  );
}

export default App; 