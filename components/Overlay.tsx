import React from 'react';
import { TreeState } from '../types';

interface OverlayProps {
  treeState: TreeState;
  setTreeState: (state: TreeState) => void;
}

export const Overlay: React.FC<OverlayProps> = ({ treeState, setTreeState }) => {
  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-8 z-10">
      
      {/* Header */}
      <header className="flex flex-col items-center mt-8 opacity-90 transition-opacity duration-1000">
        <h1 className="text-5xl md:text-8xl text-white font-serif tracking-widest text-center" style={{ textShadow: '0 0 30px rgba(212,175,55,0.6)' }}>
          <span className="block text-arix-gold mb-2 font-bold" style={{ fontFamily: '"Cinzel", serif' }}>MERRY</span>
          CHRISTMAS
        </h1>
      </header>

      {/* Controls */}
      <div className="flex flex-col items-center pointer-events-auto gap-6 mb-12">
        <div className="flex gap-4">
            <button
                onClick={() => setTreeState(TreeState.SCATTERED)}
                className={`
                    px-8 py-3 border border-arix-gold transition-all duration-500 font-serif tracking-widest text-sm rounded-sm
                    ${treeState === TreeState.SCATTERED 
                        ? 'bg-arix-gold text-arix-dark shadow-[0_0_20px_rgba(212,175,55,0.6)] scale-105' 
                        : 'bg-black/30 backdrop-blur-md text-arix-gold hover:bg-arix-gold/20'
                    }
                `}
            >
                SCATTER
            </button>
            <button
                onClick={() => setTreeState(TreeState.TREE_SHAPE)}
                className={`
                    px-8 py-3 border border-arix-gold transition-all duration-500 font-serif tracking-widest text-sm rounded-sm
                    ${treeState === TreeState.TREE_SHAPE 
                        ? 'bg-arix-gold text-arix-dark shadow-[0_0_20px_rgba(212,175,55,0.6)] scale-105' 
                        : 'bg-black/30 backdrop-blur-md text-arix-gold hover:bg-arix-gold/20'
                    }
                `}
            >
                ASSEMBLE
            </button>
        </div>
      </div>
    </div>
  );
};