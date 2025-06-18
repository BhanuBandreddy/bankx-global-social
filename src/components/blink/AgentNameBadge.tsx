
interface AgentNameBadgeProps {
  agentName: string;
}

const getAgentStyles = (agentName: string) => {
  switch (agentName) {
    case 'TrustPay':
      return 'bg-black text-white';
    case 'GlobeGuides':
      return 'bg-blue-600 text-white';
    case 'LocaleLens':
      return 'bg-green-600 text-white';
    case 'PathSync':
      return 'bg-purple-600 text-white';
    default:
      return 'bg-gray-600 text-white';
  }
};

export const AgentNameBadge = ({ agentName }: AgentNameBadgeProps) => {
  const styles = getAgentStyles(agentName);
  
  return (
    <span className={`inline-block px-2 py-1 text-xs font-bold uppercase tracking-wide border-2 border-black ${styles} mb-2`}>
      {agentName} Agent
    </span>
  );
};
