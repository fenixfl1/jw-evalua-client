import { Layout, LayoutProps } from "antd"

const CustomLayout: React.FC<LayoutProps> = ({ children }) => {
  return <Layout>{children}</Layout>
}

export default CustomLayout
