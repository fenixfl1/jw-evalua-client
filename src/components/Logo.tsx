import React from 'react'

const Logo: React.FC<React.SVGProps<SVGSVGElement>> = ({
  fontSize = '32px',
  ...props
}) => {
  return (
    <svg
      width="300px"
      height="100px"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g transform="translate(10, 20)">
        <rect
          x={0}
          y={30}
          width={15}
          height={40}
          rx={4}
          ry={4}
          fill="#66a645"
        />
        <polyline
          points="0,50 5,55 15,40"
          fill="none"
          stroke="white"
          strokeWidth={2}
        />
        <rect
          x={20}
          y={20}
          width={15}
          height={50}
          rx={4}
          ry={4}
          fill="#0c8280"
        />
        <polyline
          points="20,50 25,55 35,40"
          fill="none"
          stroke="white"
          strokeWidth={2}
        />
        <rect
          x={40}
          y={10}
          width={15}
          height={60}
          rx={4}
          ry={4}
          fill="#f58121"
        />
        <polyline
          points="40,50 45,55 55,40"
          fill="none"
          stroke="white"
          strokeWidth={2}
        />
      </g>
      <text
        x={70}
        y={85}
        fill="#0c8280"
        fontSize={fontSize}
        fontFamily="Arial"
        fontWeight="bold"
      >
        {'JW Evalúe'}
      </text>
    </svg>
  )
}

export default Logo
