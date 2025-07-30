import { Menu, MenuProps } from "antd"

const CustomMenu: React.FC<MenuProps> = ({ theme = "light", ...props }) => {
  return <Menu theme={theme} {...props} />
}

export default CustomMenu
