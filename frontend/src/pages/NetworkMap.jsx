import React, { useState, useEffect, useCallback, useMemo } from 'react';
import ReactFlow, { MiniMap, Controls, Background, useNodesState, useEdgesState, addEdge } from 'reactflow';
import 'reactflow/dist/style.css';
import { Network, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import CustomDeviceNode from '../components/CustomDeviceNode';
import { getTopologyNodesApi, getTopologyLinksApi, saveNodePositionApi, getRecentAlertsApi, getDevicesApi } from '../services/api';

export default function NetworkMap() {
  const nodeTypes = useMemo(() => ({ customDevice: CustomDeviceNode }), []);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [alerts, setAlerts] = useState([]);
  

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [topologyNodes, devices, recentAlerts] = await Promise.all([
          getTopologyNodesApi(),
          getDevicesApi(), // We will use all devices dynamically if topology tracking is empty
          getRecentAlertsApi()
        ]);
        
        setAlerts(recentAlerts);
        const alertDeviceIds = new Set(recentAlerts.map(a => a.device_id));

        let formattedNodes = [];
        
        // If the database has tracked topology position physics, use them
        if (topologyNodes && topologyNodes.length > 0) {
            formattedNodes = topologyNodes.map(tn => ({
                id: tn.device_id.toString(),
                type: 'customDevice',
                position: { x: tn.position_x, y: tn.position_y },
                data: {
                   device_name: tn.device_name,
                   status: tn.status,
                   isAlert: alertDeviceIds.has(tn.device_id)
                }
            }));
        } else {
            // Auto-layout devices horizontally if they exist but no topology plotted mathematically yet
            formattedNodes = devices.map((d, index) => ({
                id: d.id.toString(),
                type: 'customDevice',
                position: { x: 250 + (index * 250), y: 200 },
                data: {
                   device_name: d.device_name,
                   status: d.status,
                   isAlert: alertDeviceIds.has(d.id)
                }
            }));
        }
        
        setNodes(formattedNodes);

        // Fetch physical networking paths (edges)
        const topologyLinks = await getTopologyLinksApi();
        if (topologyLinks && topologyLinks.length > 0) {
            const formattedEdges = topologyLinks.map(tl => ({
                id: `e${tl.source_node}-${tl.target_node}`,
                source: tl.source_node.toString(),
                target: tl.target_node.toString(),
                animated: true,
                style: { stroke: 'rgba(6,182,212,0.5)', strokeWidth: 2 }
            }));
            setEdges(formattedEdges);
        } else {
            // Auto star topology fallback mapping Node 1 to everything visually if no paths inserted
            if (devices.length > 1) {
                const coreId = devices[0].id.toString();
                const defaultEdges = devices.slice(1).map(d => ({
                     id: `e${coreId}-${d.id}`,
                     source: coreId,
                     target: d.id.toString(),
                     animated: true,
                     style: { stroke: 'rgba(139,92,246,0.6)', strokeWidth: 2 }
                }));
                setEdges(defaultEdges);
            }
        }
      } catch (err) {
        toast.error("Failed to load mapping coordinates.");
      }
    };
    
    // Fire setup once
    fetchData();
    // Maintain live colors mapping
    const interval = setInterval(fetchData, 10000); 
    return () => clearInterval(interval);
  }, [setNodes, setEdges]);

  // Execute database transaction updating MySQL (x, y) coordinates
  const onSaveLayout = async () => {
     try {
         for (let node of nodes) {
              await saveNodePositionApi({
                  device_id: parseInt(node.id),
                  position_x: Number(node.position.x),
                  position_y: Number(node.position.y)
              });
         }
         toast.success("Topology Interface Layout Set");
     } catch(e) {
         toast.error("Coordinate Sync Failed");
     }
  };

  const onConnect = useCallback((params) => setEdges((eds) => addEdge({...params, animated: true, style: { stroke: '#06b6d4', strokeWidth: 2 } }, eds)), [setEdges]);

  return (
    <div className="h-full flex flex-col space-y-4 pb-12">
      <div className="flex justify-between items-end mb-4">
        <div>
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400 flex items-center gap-3">
            <Network size={32} className="text-cyan-500" /> Infrastructure Map
          </h2>
          <p className="text-gray-400 mt-1">Interactive network diagram mapping physical and virtual data connections</p>
        </div>
        <button 
           onClick={onSaveLayout}
           className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white px-5 py-2.5 rounded-xl shadow-[0_0_20px_rgba(34,211,238,0.4)] transition-all font-semibold"
        >
           <Save size={18} /> Save Layout
        </button>
      </div>

      <div className="flex-1 glass-panel rounded-2xl overflow-hidden border-white/10 shadow-2xl relative min-h-[700px]">
         <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen"></div>
         <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          className="bg-black/20"
        >
          <Background color="rgba(255,255,255,0.08)" gap={24} size={1.5} />
          <Controls className="bg-gray-900 border border-white/5 rounded-xl fill-white mx-4 my-8" />
          <MiniMap 
            nodeColor={(n) => {
               if(n.data?.isAlert || n.data?.status === 'warning') return '#f97316';
               if(n.data?.status === 'offline') return '#ef4444';
               return '#06b6d4';
            }}
            maskColor="rgba(0,0,0,0.8)"
            style={{ backgroundColor: 'rgba(15,23,42,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
          />
        </ReactFlow>
      </div>
    </div>
  );
}
