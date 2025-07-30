import React from 'react'
import { Typography } from 'antd'
import { TextProps } from 'antd/es/typography/Text'
import { ParagraphProps } from 'antd/es/typography/Paragraph'
import { LinkProps } from 'antd/es/typography/Link'
import Linkify from 'react-linkify'
import { TitleProps } from 'antd/lib/typography/Title'
import { Link } from 'react-router'

const { Paragraph, Text, Link: AntLink, Title } = Typography

interface CustomTextProps extends TextProps {
  align?:
    | 'start'
    | 'end'
    | 'left'
    | 'right'
    | 'center'
    | 'justify'
    | 'match-parent'
}

export const CustomText = React.forwardRef<HTMLSpanElement, CustomTextProps>(
  ({ align, ...props }, ref) => {
    return (
      <Text style={{ ...props.style, textAlign: align }} ref={ref} {...props}>
        {props.children}
      </Text>
    )
  }
)

export const CustomLink = React.forwardRef<HTMLElement, LinkProps>(
  ({ target = '_blank', ...props }, ref) => {
    return (
      <AntLink target={target} {...props} ref={ref}>
        {props.children}
      </AntLink>
    )
  }
)

export const CustomParagraph = React.forwardRef<HTMLElement, ParagraphProps>(
  (props, ref) => {
    return (
      <Paragraph {...props} ref={ref}>
        <Linkify
          children={''}
          componentDecorator={(decoratedHref, decoratedText, key) => (
            <Link key={key} to={decoratedHref}>
              <a target="_blank" rel="noopener noreferrer">
                {decoratedText}
              </a>
            </Link>
          )}
        />
        {props.children}
      </Paragraph>
    )
  }
)

export const CustomTitle = React.forwardRef<HTMLElement, TitleProps>(
  ({ level = 3, editable = false, ...props }, ref) => {
    return <Title level={level} editable={editable} {...props} ref={ref} />
  }
)
