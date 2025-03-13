
import React from 'react';
import { useOBS } from '@/context/OBSContext';
import { Activity, Cpu, HardDrive, Clock } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

const StatItem = ({ label, value, icon: Icon, unit, warning = false, critical = false }: {
  label: string;
  value: string | number;
  icon: React.ComponentType<any>;
  unit?: string;
  warning?: boolean;
  critical?: boolean;
}) => (
  <div className="flex items-center gap-3">
    <div className={cn("p-2 rounded-md", {
      "bg-primary/10 text-primary": !warning && !critical,
      "bg-yellow-100 text-yellow-700": warning,
      "bg-red-100 text-red-700": critical,
    })}>
      <Icon className="w-4 h-4" />
    </div>
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={cn("font-medium", {
        "text-yellow-700": warning,
        "text-red-700": critical,
      })}>
        {value}{unit && ` ${unit}`}
      </div>
    </div>
  </div>
);

const StatsMonitor = () => {
  const { isConnected, stats } = useOBS();

  if (!isConnected) {
    return null;
  }

  const cpuWarning = stats.cpuUsage && stats.cpuUsage > 70;
  const cpuCritical = stats.cpuUsage && stats.cpuUsage > 90;
  
  const memWarning = stats.memoryUsage && stats.memoryUsage > 70;
  const memCritical = stats.memoryUsage && stats.memoryUsage > 90;
  
  const renderWarning = stats.renderTime && stats.renderTime > 30;
  const renderCritical = stats.renderTime && stats.renderTime > 50;

  return (
    <div className="glass-card p-5 animate-scale-in">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-medium">Performance</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <StatItem 
            label="CPU Usage" 
            value={stats.cpuUsage ? stats.cpuUsage.toFixed(1) : 'N/A'} 
            icon={Cpu}
            unit="%"
            warning={cpuWarning}
            critical={cpuCritical}
          />
          
          {stats.cpuUsage && (
            <Progress 
              value={stats.cpuUsage} 
              className={cn({
                "text-yellow-500": cpuWarning,
                "text-red-500": cpuCritical,
              })}
            />
          )}
        </div>
        
        <div className="space-y-2">
          <StatItem 
            label="Memory Usage" 
            value={stats.memoryUsage ? stats.memoryUsage.toFixed(1) : 'N/A'} 
            icon={HardDrive}
            unit="%"
            warning={memWarning}
            critical={memCritical}
          />
          
          {stats.memoryUsage && (
            <Progress 
              value={stats.memoryUsage} 
              className={cn({
                "text-yellow-500": memWarning,
                "text-red-500": memCritical,
              })}
            />
          )}
        </div>
        
        <StatItem 
          label="FPS" 
          value={stats.fps ? stats.fps.toFixed(1) : 'N/A'} 
          icon={Activity}
        />
        
        <StatItem 
          label="Frame Render Time" 
          value={stats.renderTime ? stats.renderTime.toFixed(2) : 'N/A'} 
          icon={Clock}
          unit="ms"
          warning={renderWarning}
          critical={renderCritical}
        />
      </div>
    </div>
  );
};

export default StatsMonitor;
