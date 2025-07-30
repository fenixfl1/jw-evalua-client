import { notification, NotificationArgsProps } from 'antd'
import ConditionalComponent from '../ConditionalComponent'
import { CustomParagraph } from './CustomParagraph'

export const customNotification = ({
  message,
  description,
  type = 'info',
  duration = 10,
  onClick,
  ...props
}: NotificationArgsProps): void => {
  notification[type]({
    ...props,
    message,
    onClick: onClick,
    duration,
    description: (
      <ConditionalComponent
        condition={typeof description === 'string'}
        fallback={description}
      >
        <CustomParagraph>
          <div dangerouslySetInnerHTML={{ __html: `${description}` }} />
        </CustomParagraph>
      </ConditionalComponent>
    ),
  })
}
