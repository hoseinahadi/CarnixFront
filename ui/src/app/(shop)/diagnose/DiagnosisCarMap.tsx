'use client';

import type { KeyboardEvent, ReactNode } from 'react';
import styles from './Diagnose.module.scss';

type SystemOption = readonly [string, string];

type DiagnosisCarMapProps = {
  selectedSystem: string;
  systems: SystemOption[];
  onSelect: (systemKey: string) => void;
};

type HotspotProps = DiagnosisCarMapProps & {
  systemKey: string;
  label: string;
  children: ReactNode;
};

const hasSystem = (systems: SystemOption[], key: string) =>
  systems.some(([systemKey]) => systemKey === key);

function Hotspot({ systemKey, label, selectedSystem, systems, onSelect, children }: HotspotProps) {
  const enabled = hasSystem(systems, systemKey);
  const selected = selectedSystem === systemKey;
  const activate = () => enabled && onSelect(systemKey);

  const handleKeyDown = (event: KeyboardEvent<SVGGElement>) => {
    if (enabled && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      activate();
    }
  };

  return (
    <g
      className={`${styles.hotspot} ${selected ? styles.hotspotSelected : ''} ${!enabled ? styles.hotspotDisabled : ''}`}
      role="button"
      tabIndex={enabled ? 0 : -1}
      aria-label={label}
      aria-pressed={selected}
      onClick={activate}
      onKeyDown={handleKeyDown}
    >
      {children}
    </g>
  );
}

function Wheel({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g>
      <rect x={cx - 25} y={cy - 52} width="50" height="104" rx="20" className={styles.wheelOuter} />
      <rect x={cx - 17} y={cy - 39} width="34" height="78" rx="14" className={styles.wheelInner} />
      <path d={`M${cx - 11} ${cy - 22}h22M${cx - 11} ${cy}h22M${cx - 11} ${cy + 22}h22`} className={styles.wheelTread} />
    </g>
  );
}

export default function DiagnosisCarMap({ selectedSystem, systems, onSelect }: DiagnosisCarMapProps) {
  return (
    <div className={styles.carMap}>
      <div className={styles.carMapGlow} aria-hidden="true" />
      <svg viewBox="0 0 460 620" role="img" aria-labelledby="diagnosis-car-title diagnosis-car-description">
        <title id="diagnosis-car-title">نمای بالای خودرو با بخش‌های قابل انتخاب</title>
        <desc id="diagnosis-car-description">چراغ‌های جلو، موتور، رادیاتور، چرخ‌ها و چراغ‌های عقب قابل انتخاب هستند.</desc>

        <defs>
          <linearGradient id="carPaint" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#f9fcff" />
            <stop offset="0.46" stopColor="#dceafb" />
            <stop offset="1" stopColor="#9ebcde" />
          </linearGradient>
          <linearGradient id="glass" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#1d4d7c" />
            <stop offset="1" stopColor="#8fc1ed" />
          </linearGradient>
          <linearGradient id="hood" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#f8fbff" />
            <stop offset="1" stopColor="#c8dcf1" />
          </linearGradient>
          <filter id="vehicleShadow" x="-35%" y="-20%" width="170%" height="160%">
            <feDropShadow dx="0" dy="15" stdDeviation="15" floodColor="#163b66" floodOpacity="0.23" />
          </filter>
        </defs>

        <ellipse cx="230" cy="316" rx="166" ry="273" className={styles.roadShadow} />
        <path d="M230 28C174 28 143 58 126 116l-22 77c-11 38-15 77-11 116l10 129c5 75 48 142 127 154 79-12 122-79 127-154l10-129c4-39 0-78-11-116l-22-77C317 58 286 28 230 28Z" className={styles.carBody} filter="url(#vehicleShadow)" />
        <path d="M145 71c21-22 47-32 85-32s64 10 85 32l20 46H125l20-46Z" className={styles.frontBumper} />
        <path d="M137 118h186l15 82H122l15-82Z" fill="url(#hood)" className={styles.carHood} />
        <path d="M143 212h174l16 78H127l16-78Z" fill="url(#glass)" className={styles.windshield} />
        <path d="M124 299h212l13 120H111l13-120Z" className={styles.carRoof} />
        <path d="M128 431h204l-15 70H143l-15-70Z" fill="url(#glass)" className={styles.rearGlass} />
        <path d="M143 511h174l-12 42H155l-12-42Z" className={styles.rearBumper} />

        <path d="M128 299h102v120H114l14-120ZM230 299h102l14 120H230V299Z" className={styles.sideWindows} />
        <path d="M230 306v106M122 358h216M145 432h170" className={styles.doorLines} />
        <path d="M110 290l-28-12 8-23 30 12M350 290l28-12-8-23-30 12" className={styles.mirrors} />
        <path d="M105 214c-18 3-28 22-28 49M355 214c18 3 28 22 28 49M109 407c-18 6-26 27-24 50M351 407c18 6 26 27 24 50" className={styles.wheelArches} />
        <path d="M151 123h158M137 510h186" className={styles.bodyTrim} />

        <Hotspot systemKey="engine" label="موتور و عملکرد" selectedSystem={selectedSystem} systems={systems} onSelect={onSelect}>
          <path d="M158 130h144l12 59H146l12-59Z" className={styles.engineArea} />
          <path d="M179 147h102v24h16v12h-16v-9h-102v9h-16v-12h16v-24ZM197 138v9M230 138v9M263 138v9" className={styles.engineDetail} />
        </Hotspot>

        <Hotspot systemKey="cooling" label="سیستم خنک‌کننده" selectedSystem={selectedSystem} systems={systems} onSelect={onSelect}>
          <path d="M174 185h112l8 25H166l8-25Z" className={styles.radiatorArea} />
          <path d="M180 193h100M176 200h108M174 207h112" className={styles.radiatorLines} />
        </Hotspot>

        <Hotspot systemKey="electric" label="چراغ‌های جلو و برق خودرو" selectedSystem={selectedSystem} systems={systems} onSelect={onSelect}>
          <g className={styles.headlight}>
            <path d="M117 84c11-14 29-20 51-19l-7 39c-17 0-31-4-44-12V84Z" />
            <path d="M128 84c8-7 17-10 28-10l-4 21c-10 0-18-3-24-7V84Z" />
          </g>
          <g className={styles.headlight}>
            <path d="M343 84c-11-14-29-20-51-19l7 39c17 0 31-4 44-12V84Z" />
            <path d="M332 84c-8-7-17-10-28-10l4 21c10 0 18-3 24-7V84Z" />
          </g>
        </Hotspot>

        <Hotspot systemKey="suspension" label="جلوبندی و تعلیق" selectedSystem={selectedSystem} systems={systems} onSelect={onSelect}>
          <Wheel cx={78} cy={255} />
          <Wheel cx={382} cy={255} />
          <Wheel cx={78} cy={445} />
          <Wheel cx={382} cy={445} />
        </Hotspot>

        <Hotspot systemKey="brake" label="ترمز و چراغ‌های عقب" selectedSystem={selectedSystem} systems={systems} onSelect={onSelect}>
          <g className={styles.tailLight}>
            <path d="M128 530h45l7 26c-20 1-37-4-52-14v-12Z" />
            <path d="M139 535h27l4 13c-12 0-22-3-31-8v-5Z" />
          </g>
          <g className={styles.tailLight}>
            <path d="M332 530h-45l-7 26c20 1 37-4 52-14v-12Z" />
            <path d="M321 535h-27l-4 13c12 0 22-3 31-8v-5Z" />
          </g>
        </Hotspot>

        <path d="M230 48v15M230 558v15" className={styles.centerMark} />
      </svg>
      <div className={styles.carMapHint}>روی چراغ‌ها، کاپوت، رادیاتور یا چرخ‌ها بزنید</div>
      <div className={styles.carMapLegend} aria-hidden="true">
        <span><i className={styles.legendBlue} />بخش قابل انتخاب</span>
        <span><i className={styles.legendRed} />چراغ فعال</span>
      </div>
    </div>
  );
}
