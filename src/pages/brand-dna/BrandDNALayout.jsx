import React from 'react';
import { Outlet } from 'react-router-dom';
import { Dna } from 'lucide-react';

function BrandDNALayout() {
  return (
    <div className="flex flex-col min-h-screen bg-[#f8f9fc]">
      {/* Sub Header */}
      <div className="bg-white border-b border-slate-100 px-6 py-4 md:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2.5">
              <Dna className="w-6 h-6 text-purple-600 animate-pulse" />
              Brand DNA Suite
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Cohesive suite to analyze brands, brainstorm campaign concepts, build creatives, and analyze competitors.
            </p>
          </div>
        </div>
      </div>

      {/* Render sub-route components */}
      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  );
}

export default BrandDNALayout;
