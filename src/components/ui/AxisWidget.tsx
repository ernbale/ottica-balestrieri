'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { clsx } from 'clsx'

interface AxisLine {
  value: number | null
  color: string
  label: string
  shortLabel: string
}

interface AxisWidgetProps {
  // Asse principale (editabile)
  value: number | null
  onChange: (value: number | null) => void
  cylinder: number | null
  // Assi aggiuntivi (solo visualizzazione)
  additionalAxes?: AxisLine[]
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  label?: string
  eye?: 'OD' | 'OS'
  // Colore e label personalizzati per la linea principale
  mainColor?: string
  mainLabel?: string
}

/**
 * Widget grafico per la selezione dell'asse (AXIS) dell'astigmatismo
 * - Semicerchio graduato da 0° a 180°
 * - Supporta più linee colorate per diversi tipi di prescrizione
 * - Linea principale editabile + linee aggiuntive di sola visualizzazione
 */
export function AxisWidget({
  value,
  onChange,
  cylinder,
  additionalAxes = [],
  disabled = false,
  size = 'md',
  label,
  eye,
  mainColor,
  mainLabel,
}: AxisWidgetProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [inputValue, setInputValue] = useState(value?.toString() ?? '')

  const isDisabled = disabled || !cylinder || cylinder === 0

  const dimensions = {
    sm: { width: 180, height: 100, radius: 70, labelOffset: 15 },
    md: { width: 240, height: 130, radius: 95, labelOffset: 18 },
    lg: { width: 300, height: 160, radius: 120, labelOffset: 22 },
  }

  const { width, height, radius, labelOffset } = dimensions[size]
  const centerX = width / 2
  const centerY = height - 10

  const angleToCoords = useCallback((angle: number) => {
    const radians = ((180 - angle) * Math.PI) / 180
    return {
      x: centerX + radius * Math.cos(radians),
      y: centerY - radius * Math.sin(radians),
    }
  }, [centerX, centerY, radius])

  const coordsToAngle = useCallback((x: number, y: number) => {
    const dx = x - centerX
    const dy = centerY - y
    let angle = Math.atan2(dy, dx) * (180 / Math.PI)
    angle = 180 - angle
    return Math.max(0, Math.min(180, Math.round(angle)))
  }, [centerX, centerY])

  const handleClick = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (isDisabled) return
    const svg = svgRef.current
    if (!svg) return
    const rect = svg.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const angle = coordsToAngle(x, y)
    onChange(angle)
    setInputValue(angle.toString())
  }, [isDisabled, coordsToAngle, onChange])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (isDisabled) return
    setIsDragging(true)
    e.preventDefault()
  }, [isDisabled])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || isDisabled) return
    const svg = svgRef.current
    if (!svg) return
    const rect = svg.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const angle = coordsToAngle(x, y)
    onChange(angle)
    setInputValue(angle.toString())
  }, [isDragging, isDisabled, coordsToAngle, onChange])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      return () => {
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  useEffect(() => {
    setInputValue(value?.toString() ?? '')
  }, [value])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setInputValue(val)
    if (val === '') {
      onChange(null)
      return
    }
    const num = parseInt(val, 10)
    if (!isNaN(num) && num >= 0 && num <= 180) {
      onChange(num)
    }
  }

  const handleInputBlur = () => {
    if (inputValue === '') {
      onChange(null)
      return
    }
    let num = parseInt(inputValue, 10)
    if (isNaN(num)) {
      setInputValue(value?.toString() ?? '')
      return
    }
    num = Math.max(0, Math.min(180, num))
    onChange(num)
    setInputValue(num.toString())
  }

  // Genera le tacche
  const ticks = []
  for (let angle = 0; angle <= 180; angle += 10) {
    const isMajor = angle % 30 === 0
    const outerCoords = angleToCoords(angle)
    const tickLength = isMajor ? 10 : 5
    const innerRadius = radius - tickLength
    const innerCoords = {
      x: centerX + innerRadius * Math.cos(((180 - angle) * Math.PI) / 180),
      y: centerY - innerRadius * Math.sin(((180 - angle) * Math.PI) / 180),
    }

    ticks.push(
      <line
        key={`tick-${angle}`}
        x1={innerCoords.x}
        y1={innerCoords.y}
        x2={outerCoords.x}
        y2={outerCoords.y}
        stroke={isDisabled ? 'var(--stone-300)' : 'var(--stone-400)'}
        strokeWidth={isMajor ? 2 : 1}
      />
    )

    if (isMajor) {
      const labelRadius = radius + labelOffset
      const labelCoords = {
        x: centerX + labelRadius * Math.cos(((180 - angle) * Math.PI) / 180),
        y: centerY - labelRadius * Math.sin(((180 - angle) * Math.PI) / 180),
      }
      ticks.push(
        <text
          key={`label-${angle}`}
          x={labelCoords.x}
          y={labelCoords.y}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={size === 'sm' ? 10 : size === 'md' ? 11 : 13}
          fill={isDisabled ? 'var(--stone-300)' : 'var(--stone-500)'}
          fontWeight={500}
        >
          {angle}°
        </text>
      )
    }
  }

  // Colori per la linea principale
  const lineColor = mainColor || '#3B82F6' // default blue-500
  const lineLabel = mainLabel ?? 'L' // default "L" per Lontano

  // Coordinate linea principale
  const mainIndicatorCoords = value !== null ? angleToCoords(value) : null

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Label */}
      {(label || eye) && (
        <div className="flex items-center gap-2">
          {eye && (
            <span
              className={clsx(
                'px-2 py-0.5 rounded text-xs font-bold',
                eye === 'OD' ? 'bg-primary/20 text-primary' : 'bg-secondary/20 text-secondary'
              )}
            >
              {eye}
            </span>
          )}
          {label && (
            <span className="text-sm font-medium text-foreground">{label}</span>
          )}
        </div>
      )}

      {/* SVG Widget */}
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className={clsx(
          'select-none',
          isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-crosshair'
        )}
        onClick={handleClick}
      >
        {/* Arco del semicerchio */}
        <path
          d={`M ${centerX - radius} ${centerY} A ${radius} ${radius} 0 0 1 ${centerX + radius} ${centerY}`}
          fill="none"
          stroke={isDisabled ? 'var(--stone-200)' : 'var(--stone-300)'}
          strokeWidth={2}
        />

        {/* Area cliccabile */}
        <path
          d={`M ${centerX - radius} ${centerY} A ${radius} ${radius} 0 0 1 ${centerX + radius} ${centerY} L ${centerX} ${centerY} Z`}
          fill={isDisabled ? 'var(--stone-100)' : 'var(--stone-50)'}
          opacity={0.5}
        />

        {/* Tacche */}
        {ticks}

        {/* Linee assi aggiuntivi (altri tipi: P, I, V) */}
        {!isDisabled && additionalAxes.map((axis, idx) => {
          if (axis.value === null) return null
          const coords = angleToCoords(axis.value)
          return (
            <g key={`additional-${idx}`}>
              <line
                x1={centerX}
                y1={centerY}
                x2={coords.x}
                y2={coords.y}
                stroke={axis.color}
                strokeWidth={2}
                strokeLinecap="round"
                opacity={0.7}
              />
              {/* Etichetta sulla linea */}
              <circle
                cx={centerX + (radius * 0.6) * Math.cos(((180 - axis.value) * Math.PI) / 180)}
                cy={centerY - (radius * 0.6) * Math.sin(((180 - axis.value) * Math.PI) / 180)}
                r={10}
                fill={axis.color}
              />
              <text
                x={centerX + (radius * 0.6) * Math.cos(((180 - axis.value) * Math.PI) / 180)}
                y={centerY - (radius * 0.6) * Math.sin(((180 - axis.value) * Math.PI) / 180)}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={9}
                fill="white"
                fontWeight="bold"
              >
                {axis.shortLabel}
              </text>
            </g>
          )
        })}

        {/* Linea principale (Lontano - editabile) */}
        {mainIndicatorCoords && !isDisabled && (
          <>
            <line
              x1={centerX}
              y1={centerY}
              x2={mainIndicatorCoords.x}
              y2={mainIndicatorCoords.y}
              stroke={lineColor}
              strokeWidth={3}
              strokeLinecap="round"
            />
            {/* Punto centrale */}
            <circle
              cx={centerX}
              cy={centerY}
              r={4}
              fill={lineColor}
            />
            {/* Etichetta sulla linea principale */}
            <circle
              cx={centerX + (radius * 0.75) * Math.cos(((180 - value!) * Math.PI) / 180)}
              cy={centerY - (radius * 0.75) * Math.sin(((180 - value!) * Math.PI) / 180)}
              r={12}
              fill={lineColor}
            />
            <text
              x={centerX + (radius * 0.75) * Math.cos(((180 - value!) * Math.PI) / 180)}
              y={centerY - (radius * 0.75) * Math.sin(((180 - value!) * Math.PI) / 180)}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={10}
              fill="white"
              fontWeight="bold"
            >
              {lineLabel}
            </text>
            {/* Handle draggabile */}
            <circle
              cx={mainIndicatorCoords.x}
              cy={mainIndicatorCoords.y}
              r={8}
              fill={lineColor}
              stroke="white"
              strokeWidth={2}
              className={clsx(
                'cursor-grab transition-transform',
                isDragging && 'cursor-grabbing'
              )}
              onMouseDown={handleMouseDown}
            />
          </>
        )}

        {/* Centro quando disabilitato */}
        {isDisabled && (
          <circle
            cx={centerX}
            cy={centerY}
            r={3}
            fill="var(--stone-300)"
          />
        )}
      </svg>

      {/* Legenda colori */}
      {!isDisabled && additionalAxes.some(a => a.value !== null) && (
        <div className="flex flex-wrap gap-2 justify-center text-xs">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: lineColor }}></span>
            <span>{lineLabel}</span>
          </span>
          {additionalAxes.map((axis, idx) => (
            axis.value !== null && (
              <span key={idx} className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: axis.color }}></span>
                <span>{axis.shortLabel}</span>
              </span>
            )
          ))}
        </div>
      )}

      {/* Campo numerico */}
      <div className="flex items-center gap-2">
        <label className="text-xs text-foreground-muted">AXIS:</label>
        <div className="relative">
          <input
            type="number"
            min={0}
            max={180}
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            disabled={isDisabled}
            className={clsx(
              'w-20 px-3 py-1.5 text-center font-mono text-sm border rounded-lg',
              'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
              isDisabled
                ? 'bg-background-secondary text-foreground-muted cursor-not-allowed'
                : 'bg-surface border-border text-foreground'
            )}
            placeholder="-"
          />
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-foreground-muted">
            °
          </span>
        </div>
      </div>

      {/* Messaggio se disabilitato */}
      {isDisabled && (
        <p className="text-xs text-foreground-muted italic">
          {!cylinder || cylinder === 0 ? 'CYL = 0: AXIS non richiesto' : 'Widget disabilitato'}
        </p>
      )}
    </div>
  )
}

export default AxisWidget
