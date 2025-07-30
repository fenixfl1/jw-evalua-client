import { Tooltip, TooltipProps } from "antd"

const CustomTooltip: React.FC<TooltipProps> = ({ title, ...props }) => {
  return <Tooltip {...props} title={title} />
}

export default CustomTooltip
