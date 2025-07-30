import { CodeOutlined, ClearOutlined } from '@ant-design/icons'
import { Form, InputRef } from 'antd'
import { Terminal } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'
import { useAppContext } from 'src/context/AppContext'
import styled from 'styled-components'
import CustomButton from './custom/CustomButton'
import CustomCard from './custom/CustomCard'
import CustomFormItem from './custom/CustomFormItem'
import CustomForm from './custom/CustomFrom'
import CustomInput from './custom/CustomInput'
import { CustomParagraph, CustomText } from './custom/CustomParagraph'
import CustomSpace from './custom/CustomSpace'
import CustomTooltip from './custom/CustomTooltip'
import CustomTag from './custom/CustomTag'
import CustomRow from './custom/CustomRow'

type MessageTypes = 'stdout' | 'stderr' | 'done' | 'error'

const Card = styled(CustomCard)`
  position: relative;

  .clean-console {
    position: absolute;
    bottom: 0;
    right: 0;
    margin: 10px;
  }

  input,
  .ant-typography {
    font-family: 'Fira Code';
  }
`

interface ConsoleProps {
  cwd?: string
}

const Console: React.FC<ConsoleProps> = ({ cwd }) => {
  const [form] = Form.useForm()
  const command = Form.useWatch('COMMAND', form)
  const { socket, theme } = useAppContext()
  const [logs, setLogs] = useState<{ type: MessageTypes; text: string }[]>([])
  const logEndRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<InputRef>(null)

  const addLog = (entry: { type: MessageTypes; text: string }) => {
    setLogs((prev) => [...prev, entry])
  }

  useEffect(() => {
    const handleStdout = (data: string) => {
      addLog({ type: 'stdout', text: data })
    }

    const handleStderr = (data: string) => {
      addLog({ type: 'stderr', text: data })
    }

    const handleDone = (data: string) => {
      addLog({ type: 'done', text: data })
    }

    const handleError = (data: string) => {
      addLog({
        type: 'error',
        text: typeof data === 'string' ? data : JSON.stringify(data),
      })
    }

    socket.on('stdout', handleStdout)
    socket.on('stderr', handleStderr)
    socket.on('done', handleDone)
    socket.on('error', handleError)
    socket.on('success', handleDone)

    return () => {
      socket.off('stdout', handleStdout)
      socket.off('stderr', handleStderr)
      socket.off('done', handleDone)
      socket.off('error', handleError)
    }
  }, [socket])

  useEffect(() => {
    // Auto scroll al fondo cuando hay nuevos logs
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs])

  const clearLogs = () => {
    setLogs([])
  }

  const sendCommand = () => {
    try {
      if (['cls', 'clear'].includes(command)) {
        clearLogs()
        return
      }

      socket.send({
        type: 'command',
        data: { command, cwd },
      })
    } finally {
      inputRef.current.focus()
      form.resetFields(['COMMAND'])
    }
  }

  return (
    <Card
      title={
        <CustomSpace direction={'horizontal'}>
          <CodeOutlined /> Consola
        </CustomSpace>
      }
      styles={{
        body: {
          backgroundColor: theme === 'dark' ? '#1e1e1e' : '#f5f5f5',
          color: theme === 'dark' ? '#dcdcdc' : '#000',
          height: '400px',
          overflowY: 'auto',
          fontFamily: 'monospace',
          fontSize: '0.85rem',
          padding: '1rem',
        },
      }}
    >
      <CustomTooltip title={'Limpiar consola'}>
        <CustomButton
          className={'clean-console'}
          type={'text'}
          size={'large'}
          shape={'circle'}
          icon={<ClearOutlined />}
          onClick={clearLogs}
        />
      </CustomTooltip>

      {logs.map((log, index) => (
        <CustomParagraph style={{ fontFamily: 'JetBrainsMono' }}>
          <CustomSpace direction={'horizontal'} align={'baseline'}>
            {index + 1}
            <Terminal size={14} />
            <CustomText
              key={index}
              style={{
                display: 'block',
                whiteSpace: 'pre-wrap',
                color:
                  log.type === 'stderr'
                    ? '#ff4d4f'
                    : log.type === 'error'
                    ? '#d9363e'
                    : log.type === 'done'
                    ? '#52c41a'
                    : undefined,
              }}
            >
              {log.text}
            </CustomText>
          </CustomSpace>
        </CustomParagraph>
      ))}
      <div ref={logEndRef} />
      <CustomForm form={form}>
        <CustomFormItem name={'COMMAND'} noStyle>
          <CustomInput
            autoFocus
            onPressEnter={sendCommand}
            placeholder={'Escribir comando...'}
            prefix={
              <CustomRow gap={5} justify={'space-between'} align={'bottom'}>
                <CustomTag
                  style={{
                    display: 'flex',
                    alignContent: 'center',
                    height: '100%',
                  }}
                >
                  {cwd}
                </CustomTag>
                <CustomTag
                  style={{
                    display: 'flex',
                    alignContent: 'center',
                    height: '20px',
                    textAlign: 'center',
                    paddingTop: 2.5,
                  }}
                >
                  <Terminal size={14} />
                </CustomTag>
              </CustomRow>
            }
            ref={inputRef}
            variant={'borderless'}
          />
        </CustomFormItem>
      </CustomForm>
    </Card>
  )
}

export default Console
