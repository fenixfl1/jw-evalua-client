import React from 'react'

interface SVGReaderProps extends React.SVGProps<SVGSVGElement> {
  svg: string
}

/**
 * @description This component is used to read svg and render it.
 * @param {SVGReaderProps} props
 */
const SVGReader: React.FC<SVGReaderProps> = ({ svg: _svg }) => {
  const ref = React.useRef<HTMLDivElement>(null)

  return (
    <div
      ref={ref}
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: '10px',
      }}
      dangerouslySetInnerHTML={{ __html: _svg }}
    />
  )
}

export default SVGReader
