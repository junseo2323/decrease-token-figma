import React from 'react';
import { Wifi, Signal } from 'lucide-react';

export interface StatusProProps {
  className?: string;
  time?: string;
  showWifi?: boolean;
  showCellular?: boolean;
  batteryLevel?: 'full' | 'half' | 'low' | 'empty';
}

/**
 * StatusPro - iOS 스타일 상태바
 */
export function StatusPro({
  className,
  time = '9:41',
  showWifi = true,
  showCellular = true,
  batteryLevel = 'full'
}: StatusProProps) {
  const batteryFill = { full: '100%', half: '50%', low: '20%', empty: '0%' }[batteryLevel];
  
  return (
    <div className={`flex items-center justify-between pt-[16px] px-[16px] w-full ${className || ''}`}>
      {/* Time */}
      <div className="flex flex-col justify-center leading-[0] not-italic text-center whitespace-nowrap">
        <p
          className="font-['SF_Pro_Text:Semibold',sans-serif] text-[15px] text-black tracking-[-0.28px]"
          style={{ lineHeight: 'normal' }}
        >
          {time}
        </p>
      </div>
      
      {/* Status Icons */}
      <div className="relative h-[12px] w-[25px]">
        {/* Battery Border */}
        <div className="absolute inset-[0_9.36%_0_0]">
          <div className="w-full h-full border border-black border-solid rounded-sm" />
        </div>
        
        {/* Battery Cap */}
        <div className="absolute inset-[33.33%_0.01%_33.33%_94.68%] bg-black rounded-r-sm" />
        
        {/* Battery Capacity */}
        {batteryLevel !== 'empty' && (
          <div
            className="absolute inset-[16.67%_17.36%_16.67%_8%] bg-black rounded-[1.333px]"
            style={{ width: batteryFill }}
          />
        )}
        
        {/* WiFi */}
        {showWifi && (
          <div className="absolute inset-[12.5%_43.32%_12.5%_33.78%]">
            <Wifi className="w-full h-full text-black" />
          </div>
        )}
        
        {/* Cellular */}
        {showCellular && (
          <div className="absolute inset-[16.63%_73.52%_12.56%_3.19%]">
            <Signal className="w-full h-full text-black" />
          </div>
        )}
      </div>
    </div>
  );
}

export default StatusPro;
