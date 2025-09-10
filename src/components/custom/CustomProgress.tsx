import { Progress, ProgressProps } from 'antd'

const CustomProgress: React.FC<ProgressProps> = ({ ...props }) => {
  return <Progress {...props} />
}

export default CustomProgress
