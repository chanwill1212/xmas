import React, { useState } from 'react';
import { Experience } from './components/Experience';
import { Overlay } from './components/Overlay';
import { TreeState } from './types';

const App: React.FC = () => {
  const [treeState, setTreeState] = useState<TreeState>(TreeState.TREE_SHAPE);

  return (
    <div className="relative w-screen h-screen bg-arix-dark overflow-hidden">
      {/* 3D Scene Layer */}
      <div className="absolute inset-0 z-0">
        <Experience treeState={treeState} />
      </div>

      {/* UI Layer */}
      <Overlay treeState={treeState} setTreeState={setTreeState} />
      
      {/* Texture Overlay (Vignette/Grain simulation in CSS for extra grit) */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay z-20"
           style={{ backgroundImage: `url('https://grainy-gradients.vercel.app/noise.svg')` }}>
      </div>
    </div>
  );
};

export default App;