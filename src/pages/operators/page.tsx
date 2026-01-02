import React, { useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import CustomCard from 'src/components/custom/CustomCard'
import CustomSelect from 'src/components/custom/CustomSelect'
import CustomSpace from 'src/components/custom/CustomSpace'
import CustomStatistic from 'src/components/custom/CustomStatistic'
import CustomProgress from 'src/components/custom/CustomProgress'
import CustomTimeline from 'src/components/custom/CustomTimeline'
import CustomDivider from 'src/components/custom/CustomDivider'
import { CustomText, CustomTitle } from 'src/components/custom/CustomParagraph'
import CustomButton from 'src/components/custom/CustomButton'
import CustomSpin from 'src/components/custom/CustomSpin'
import dayjs from 'dayjs'
import { App, Empty } from 'antd'
import { useGetOperatorDashboardQuery } from 'src/services/operators/useGetOperatorDashboardQuery'
import { useRegisterOperatorCompletionMutation } from 'src/services/operators/useRegisterOperatorCompletionMutation'
import { useResetOperatorTaskMutation } from 'src/services/operators/useResetOperatorTaskMutation'
import {
  usePauseTaskSessionMutation,
  useResumeTaskSessionMutation,
  useStartTaskSessionMutation,
  useStopTaskSessionMutation,
} from 'src/services/operators/useTaskSessionMutations'
import { OperatorHistoryEntry } from 'src/services/operators/operators.types'
import { useErrorHandler } from 'src/hooks/use-error-handler'
import ConditionalComponent from 'src/components/ConditionalComponent'
import CustomFormItem from 'src/components/custom/CustomFormItem'
import { StopOutlined } from '@ant-design/icons'

const PROGRESS_STORAGE_KEY = 'operator-task-progress'
const HISTORY_STORAGE_KEY = 'operator-task-history'
const SELECTED_TASK_STORAGE_KEY = 'operator-task-selected'
const SESSION_STORAGE_KEY = 'operator-task-sessions'
const MAX_HISTORY = 40

type SessionState = {
  sessionId: number
  accumulatedSeconds: number
  lastStartedAt: string | null
  isActive: boolean
}

const readFromStorage = <T,>(key: string, fallback: T): T => {
  if (typeof window === 'undefined') return fallback

  try {
    const rawValue = window.localStorage.getItem(key)
    return rawValue ? (JSON.parse(rawValue) as T) : fallback
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log({ error })
    return fallback
  }
}

const writeToStorage = (key: string, value: unknown) => {
  if (typeof window === 'undefined') return

  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log({ error })
  }
}

const OperatorsPage: React.FC = () => {
  const todayDate = dayjs().format('YYYY-MM-DD')
  const { message } = App.useApp()
  const [handleError] = useErrorHandler()

  const [selectedTaskId, setSelectedTaskId] = useState<string>(
    () => readFromStorage<string | null>(SELECTED_TASK_STORAGE_KEY, null) ?? ''
  )
  const [progressByTask, setProgressByTask] = useState<Record<string, number>>(
    () => readFromStorage<Record<string, number>>(PROGRESS_STORAGE_KEY, {})
  )
  const [sessionByTask, setSessionByTask] = useState<
    Record<string, SessionState>
  >(() =>
    readFromStorage<Record<string, SessionState>>(SESSION_STORAGE_KEY, {})
  )
  const [now, setNow] = useState(() => Date.now())
  const [history, setHistory] = useState<OperatorHistoryEntry[]>(() => {
    const stored = readFromStorage<OperatorHistoryEntry[]>(
      HISTORY_STORAGE_KEY,
      []
    )
    return Array.isArray(stored) ? stored.slice(0, MAX_HISTORY) : []
  })

  const {
    data: dashboardData,
    isPending: isLoadingDashboard,
    isFetching: isRefreshingDashboard,
  } = useGetOperatorDashboardQuery(todayDate)
  const { mutateAsync: registerCompletion, isPending: isRegistering } =
    useRegisterOperatorCompletionMutation()
  const { mutateAsync: resetTask, isPending: isResetting } =
    useResetOperatorTaskMutation(todayDate)
  const { mutateAsync: startSession, isPending: isStartingSession } =
    useStartTaskSessionMutation()
  const { mutateAsync: pauseSession, isPending: isPausingSession } =
    usePauseTaskSessionMutation()
  const { mutateAsync: resumeSession, isPending: isResumingSession } =
    useResumeTaskSessionMutation()
  const { mutateAsync: stopSession, isPending: isStoppingSession } =
    useStopTaskSessionMutation()

  const tasks = dashboardData?.tasks ?? []

  useEffect(() => {
    if (!dashboardData) return

    const syncedTotals = dashboardData.totals ?? {}
    setProgressByTask(syncedTotals)
    writeToStorage(PROGRESS_STORAGE_KEY, syncedTotals)

    const syncedHistory = dashboardData.history ?? []
    setHistory(syncedHistory)
    writeToStorage(HISTORY_STORAGE_KEY, syncedHistory)

    if (
      tasks.length &&
      (!selectedTaskId ||
        !tasks.some((task) => String(task.id) === selectedTaskId))
    ) {
      const fallbackTaskId = tasks[0]?.id
      if (fallbackTaskId !== undefined) {
        const normalizedId = String(fallbackTaskId)
        setSelectedTaskId(normalizedId)
        writeToStorage(SELECTED_TASK_STORAGE_KEY, normalizedId)
      }
    }
  }, [dashboardData, selectedTaskId, tasks])

  const selectedTask = useMemo(
    () => tasks.find((task) => String(task.id) === selectedTaskId) ?? null,
    [tasks, selectedTaskId]
  )

  const updateSessionForTask = (
    taskId: number,
    nextState: SessionState | null,
    clearOtherActives = false
  ) => {
    setSessionByTask((prev) => {
      const next = { ...prev }
      const key = String(taskId)

      if (clearOtherActives) {
        Object.keys(next).forEach((sessionKey) => {
          if (sessionKey !== key && next[sessionKey]?.isActive) {
            next[sessionKey] = {
              ...next[sessionKey],
              isActive: false,
              lastStartedAt: null,
            }
          }
        })
      }

      if (nextState) {
        next[key] = nextState
      } else {
        delete next[key]
      }
      writeToStorage(SESSION_STORAGE_KEY, next)
      return next
    })
  }

  const taskKey = selectedTask ? String(selectedTask.id) : null
  const taskCount =
    selectedTask && taskKey !== null ? progressByTask[taskKey] ?? 0 : undefined
  const currentSession =
    selectedTask && taskKey ? sessionByTask[taskKey] : undefined

  const progressPercent =
    selectedTask?.goalPerHour &&
    selectedTask.goalPerHour > 0 &&
    taskCount !== undefined
      ? Math.min(
          100,
          Number(((taskCount / selectedTask.goalPerHour) * 100).toFixed(0))
        )
      : null

  const historyByTask = useMemo(() => {
    if (!selectedTask) return []
    const key = String(selectedTask.id)
    return history.filter((entry) => String(entry.taskId) === key).slice(0, 8)
  }, [history, selectedTask])

  const summaryByTask = useMemo(
    () =>
      tasks.map((task) => ({
        ...task,
        total: progressByTask[String(task.id)] ?? 0,
      })),
    [tasks, progressByTask]
  )

  useEffect(() => setNow(Date.now()), [selectedTaskId])

  useEffect(() => {
    if (!currentSession?.isActive || !currentSession.lastStartedAt) return
    const interval = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(interval)
  }, [currentSession?.isActive, currentSession?.lastStartedAt])

  const elapsedSeconds = useMemo(() => {
    if (!currentSession) return 0
    let total = Number(currentSession.accumulatedSeconds ?? 0)

    if (currentSession.isActive && currentSession.lastStartedAt) {
      const diff = dayjs(now).diff(
        dayjs(currentSession.lastStartedAt),
        'second'
      )
      total += Math.max(diff, 0)
    }

    return total
  }, [currentSession, now])

  const formattedElapsed = useMemo(() => {
    const hours = Math.floor(elapsedSeconds / 3600)
    const minutes = Math.floor((elapsedSeconds % 3600) / 60)
    const seconds = Math.floor(elapsedSeconds % 60)
    const pad = (value: number) => String(value).padStart(2, '0')
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
  }, [elapsedSeconds])

  const handleSelectTask = (value: string) => {
    setSelectedTaskId(value)
    writeToStorage(SELECTED_TASK_STORAGE_KEY, value)
  }

  const handleRegisterUnit = async () => {
    if (!selectedTask) return
    try {
      const response = await registerCompletion({
        taskId: selectedTask.id,
        timestamp: new Date().toISOString(),
        units: 1,
      })

      setProgressByTask((prev) => {
        const next = {
          ...prev,
          [String(selectedTask.id)]: response.totalForTask,
        }
        writeToStorage(PROGRESS_STORAGE_KEY, next)
        return next
      })

      setHistory((prev) => {
        const filtered = prev.filter(
          (entry) => entry.id !== response.completion.id
        )
        const nextHistory = [response.completion, ...filtered].slice(
          0,
          MAX_HISTORY
        )
        writeToStorage(HISTORY_STORAGE_KEY, nextHistory)
        return nextHistory
      })
    } catch (error) {
      handleError(error)
    }
  }

  const handleResetCurrentTask = async () => {
    if (!selectedTask) return
    try {
      const response = await resetTask({ taskId: selectedTask.id })

      setProgressByTask((prev) => {
        const next = {
          ...prev,
          [String(selectedTask.id)]: response.totalForTask,
        }
        writeToStorage(PROGRESS_STORAGE_KEY, next)
        return next
      })

      if (response.removedEntryIds?.length) {
        const removalSet = new Set(response.removedEntryIds)
        setHistory((prev) => {
          const nextHistory = prev.filter((entry) => !removalSet.has(entry.id))
          writeToStorage(HISTORY_STORAGE_KEY, nextHistory)
          return nextHistory
        })
      }

      message.success('Conteo reiniciado')
    } catch (error) {
      handleError(error)
    }
  }

  const handleStartOrResumeTimer = async () => {
    if (!selectedTask) return

    try {
      const timestamp = new Date().toISOString()
      const response =
        currentSession && !currentSession.isActive
          ? await resumeSession({ taskId: selectedTask.id, timestamp })
          : await startSession({ taskId: selectedTask.id, timestamp })

      updateSessionForTask(
        selectedTask.id,
        {
          sessionId: response.sessionId,
          accumulatedSeconds: Number(response.accumulatedSeconds ?? 0),
          lastStartedAt: response.isActive ? timestamp : null,
          isActive: response.isActive,
        },
        true
      )

      message.success(
        currentSession && !currentSession.isActive
          ? 'Timer reanudado'
          : 'Timer iniciado'
      )
    } catch (error) {
      handleError(error)
    }
  }

  const handlePauseTimer = async () => {
    if (!selectedTask || !currentSession?.isActive) return

    try {
      const response = await pauseSession({
        taskId: selectedTask.id,
        timestamp: new Date().toISOString(),
      })

      updateSessionForTask(selectedTask.id, {
        sessionId: response.sessionId,
        accumulatedSeconds: Number(response.accumulatedSeconds ?? 0),
        lastStartedAt: null,
        isActive: false,
      })

      message.info('Timer en pausa')
    } catch (error) {
      handleError(error)
    }
  }

  const handleStopTimer = async () => {
    if (!selectedTask || !currentSession?.isActive) return

    try {
      const response = await stopSession({
        taskId: selectedTask.id,
        timestamp: new Date().toISOString(),
      })

      updateSessionForTask(selectedTask.id, {
        sessionId: response.sessionId,
        accumulatedSeconds: Number(response.accumulatedSeconds ?? 0),
        lastStartedAt: null,
        isActive: false,
      })

      message.success('Timer guardado')
    } catch (error) {
      handleError(error)
    }
  }

  const unitLabel = selectedTask?.unitLabel ?? 'unidad'
  const buttonLabel = selectedTask
    ? `Registrar ${unitLabel}`
    : 'Selecciona una tarea'
  const isCounterDisabled = !selectedTask || isRegistering || isLoadingDashboard
  const isTimerBusy =
    isStartingSession ||
    isPausingSession ||
    isResumingSession ||
    isStoppingSession
  const startButtonLabel = selectedTask
    ? currentSession?.isActive
      ? 'En marcha'
      : currentSession
      ? 'Reanudar timer'
      : 'Iniciar timer'
    : 'Selecciona una tarea'

  return (
    <PageContainer>
      <CustomTitle level={2}>Panel del operador</CustomTitle>
      <CustomText style={{ maxWidth: 640 }}>
        Selecciona la tarea en la que estás trabajando y presiona el botón rojo
        cada vez que completes una unidad. No necesitas abrir menús complejos,
        sólo toca, registra y continúa.
      </CustomText>

      <TopSection>
        <TaskCard shadow>
          <CustomDivider>
            <CustomTitle level={5}>Selecciona la tarea</CustomTitle>
          </CustomDivider>
          <CustomSpin spinning={isLoadingDashboard}>
            <CustomSpace size="large">
              <div>
                {/* <CustomText type="secondary">Estoy trabajando en</CustomText> */}
                <CustomFormItem label={'Estoy trabajando en'}>
                  <CustomSelect
                    placeholder="Selecciona una tarea"
                    value={selectedTask ? String(selectedTask.id) : undefined}
                    onChange={handleSelectTask}
                    options={tasks.map((task) => ({
                      label: task.name,
                      value: String(task.id),
                    }))}
                    disabled={!tasks.length}
                    loading={isLoadingDashboard}
                  />
                </CustomFormItem>
              </div>

              <ConditionalComponent
                condition={!!selectedTask?.moduleId}
                fallback={<Empty description="Sin tareas asignadas" />}
              >
                <div>
                  <TaskDescription>
                    {selectedTask?.description || 'Sin descripción'}
                  </TaskDescription>
                  <StatsGrid>
                    <CustomStatistic
                      title="Meta por hora"
                      value={selectedTask?.goalPerHour ?? '—'}
                      suffix={unitLabel}
                    />
                    <CustomStatistic
                      title="Registrados hoy"
                      value={taskCount ?? 0}
                      suffix={unitLabel}
                    />
                  </StatsGrid>
                  <ConditionalComponent condition={progressPercent !== null}>
                    <CustomProgress
                      percent={progressPercent}
                      status="active"
                      format={(percent) =>
                        `${percent}% Meta ${selectedTask.goalPerHour ?? ''}`
                      }
                    />
                  </ConditionalComponent>
                  <ConditionalComponent condition={false}>
                    <CustomButton
                      type="link"
                      danger
                      onClick={handleResetCurrentTask}
                      disabled={
                        !selectedTask || isResetting || isLoadingDashboard
                      }
                      loading={isResetting}
                    >
                      Reiniciar conteo de esta tarea
                    </CustomButton>
                  </ConditionalComponent>
                </div>
              </ConditionalComponent>
            </CustomSpace>
          </CustomSpin>
        </TaskCard>

        <CounterCard shadow>
          <CustomSpin spinning={isLoadingDashboard}>
            <CustomTitle level={4}>
              {selectedTask
                ? selectedTask.name
                : 'Selecciona una tarea para comenzar'}
            </CustomTitle>

            <CounterButton
              type="button"
              onClick={handleRegisterUnit}
              disabled={
                isCounterDisabled ||
                !currentSession?.isActive ||
                isTimerBusy ||
                isLoadingDashboard
              }
            >
              <CounterValue $highlight={selectedTask?.color}>
                {taskCount ?? 0}
              </CounterValue>
              <CounterButtonLabel>{buttonLabel}</CounterButtonLabel>
            </CounterButton>

            <CounterHint>
              Cada toque suma 1 {selectedTask ? unitLabel : 'unidad'}
            </CounterHint>

            <TimerContainer>
              <CustomTitle level={5}>Tiempo de la sesión</CustomTitle>
              <TimerDisplay $active={currentSession?.isActive}>
                {formattedElapsed}
              </TimerDisplay>
              <TimerActions>
                <CustomButton
                  type="primary"
                  onClick={handleStartOrResumeTimer}
                  loading={isStartingSession || isResumingSession}
                  disabled={
                    !selectedTask ||
                    currentSession?.isActive ||
                    isTimerBusy ||
                    isLoadingDashboard
                  }
                >
                  {startButtonLabel}
                </CustomButton>
                <CustomButton
                  onClick={handlePauseTimer}
                  loading={isPausingSession}
                  disabled={
                    !currentSession?.isActive ||
                    isTimerBusy ||
                    isLoadingDashboard
                  }
                >
                  Pausar
                </CustomButton>
                <CustomButton
                  danger
                  icon={<StopOutlined />}
                  onClick={handleStopTimer}
                  loading={isStoppingSession}
                  disabled={
                    !currentSession?.isActive ||
                    isTimerBusy ||
                    isLoadingDashboard
                  }
                >
                  Detener
                </CustomButton>
              </TimerActions>
            </TimerContainer>
          </CustomSpin>
        </CounterCard>
      </TopSection>

      <BottomSection>
        <BottomCard shadow>
          <CustomDivider>
            <CustomTitle level={5}>Últimas unidades</CustomTitle>
          </CustomDivider>
          <CustomSpin spinning={isLoadingDashboard || isRefreshingDashboard}>
            <ConditionalComponent
              condition={!!historyByTask.length}
              fallback={
                <Empty description="Sin registros recientes para esta tarea" />
              }
            >
              <CustomTimeline
                mode="left"
                items={historyByTask.map((entry) => ({
                  key: entry.id,
                  color: selectedTask?.color ?? 'red',
                  children: (
                    <TimelineText>
                      +{entry.units ?? 1} {selectedTask ? unitLabel : ''}
                      <span>
                        {dayjs(entry.timestamp).format('HH:mm:ss · DD MMM')}
                      </span>
                    </TimelineText>
                  ),
                }))}
              />
            </ConditionalComponent>
          </CustomSpin>
        </BottomCard>

        <BottomCard shadow>
          <CustomDivider>
            <CustomTitle level={5}>Resumen del turno</CustomTitle>
          </CustomDivider>
          <CustomSpin spinning={isLoadingDashboard || isRefreshingDashboard}>
            <ConditionalComponent
              condition={!!summaryByTask.length}
              fallback={
                <Empty description="Aún no tienes tareas disponibles" />
              }
            >
              <CustomSpace size="large">
                {summaryByTask.map((task) => (
                  <TaskSummaryRow
                    key={task.id}
                    $active={task.id === selectedTask?.id}
                  >
                    <div>
                      <strong>{task.name}</strong>
                      <SummaryDescription>
                        {task.description ?? 'Sin descripción'}
                      </SummaryDescription>
                    </div>
                    <strong>
                      {task.total}{' '}
                      <span style={{ fontWeight: 400 }}>
                        {task.unitLabel ?? 'unidad'}
                      </span>
                    </strong>
                  </TaskSummaryRow>
                ))}
              </CustomSpace>
            </ConditionalComponent>
            <CustomDivider />
            <CustomText type="secondary">
              Sincronizamos tu progreso con el servidor para que puedas
              continuar desde cualquier dispositivo. Guardamos una copia local
              como respaldo por si pierdes conexión.
            </CustomText>
          </CustomSpin>
        </BottomCard>
      </BottomSection>
    </PageContainer>
  )
}

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`

const CounterCard = styled(CustomCard)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  text-align: center;
  min-height: clamp(360px, 45vh, 520px);
  padding: clamp(16px, 4vw, 32px);

  @media (max-width: 1024px) {
    min-height: 320px;
  }
`

const TopSection = styled.section`
  display: grid;
  grid-template-columns: minmax(280px, 380px) minmax(320px, 1fr);
  gap: 24px;
  align-items: stretch;

  @media (max-width: 1400px) {
    grid-template-columns: minmax(280px, 1fr) minmax(320px, 1fr);
  }

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    row-gap: 32px;

    ${CounterCard} {
      order: -1;
    }
  }
`

const BottomSection = styled.section`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 24px;

  @media (max-width: 768px) {
    gap: 20px;
  }
`

const TaskCard = styled(CustomCard)`
  height: 100%;
`

const BottomCard = styled(CustomCard)`
  height: 100%;
`

const TaskDescription = styled.p`
  margin: 0;
  color: ${({ theme }) => (theme?.isDark ? '#f0f0f0' : '#5c5c5c')};
`

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 16px;
`

const CounterValue = styled.div<{ $highlight?: string }>`
  font-size: clamp(3rem, 6vw, 5rem);
  font-weight: 700;
  color: ${({ theme }) => (theme?.isDark ? '#fff' : '#111')};
  text-shadow: ${({ $highlight }) =>
    $highlight ? `0 8px 25px ${$highlight}33` : 'none'};
`

const CounterHint = styled.span`
  font-size: 1rem;
  color: ${({ theme }) => (theme?.isDark ? '#d9d9d9' : '#666')};
  text-align: center;
  display: block;
  margin-top: 12px;
`

const CounterButton = styled.button`
  width: min(360px, 75vw);
  max-width: 420px;
  min-width: 220px;
  aspect-ratio: 1;
  border-radius: 50%;
  border: none;
  background: radial-gradient(circle at 30% 20%, #ff9c9c, #d30000 70%);
  color: #fff;
  font-size: 1.4rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  cursor: pointer;
  box-shadow: 0 18px 35px rgba(211, 0, 0, 0.45);
  transition: transform 0.08s ease, box-shadow 0.08s ease;
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 0.4rem;
  text-align: center;

  &:active:enabled {
    transform: scale(0.96);
    box-shadow: 0 10px 20px rgba(211, 0, 0, 0.5);
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
    box-shadow: none;
  }

  @media (max-width: 768px) {
    font-size: 1.2rem;
  }
`

const CounterButtonLabel = styled.span`
  font-size: clamp(1rem, 2vw, 1.35rem);
  font-weight: 600;
`

const TimerContainer = styled.div`
  width: 100%;
  border: 1px dashed ${({ theme }) => (theme?.isDark ? '#444' : '#e8e8e8')};
  border-radius: 12px;
  padding: 14px 18px;
  background: ${({ theme }) => (theme?.isDark ? '#1f1f1f' : '#fafafa')};
  margin-top: 8px;
`

const TimerDisplay = styled.div<{ $active?: boolean }>`
  font-family: 'SF Mono', 'Roboto Mono', Menlo, monospace;
  font-size: clamp(1.8rem, 3vw, 2.4rem);
  font-weight: 700;
  text-align: center;
  padding: 10px 12px;
  border-radius: 10px;
  background: ${({ theme }) => (theme?.isDark ? '#111' : '#fff')};
  color: ${({ $active }) => ($active ? '#1677ff' : '#595959')};
  box-shadow: ${({ theme }) =>
    theme?.isDark
      ? '0 4px 12px rgba(0,0,0,0.3)'
      : '0 4px 12px rgba(0,0,0,0.08)'};
`

const TimerActions = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
  margin-top: 12px;
`

const TaskSummaryRow = styled.div<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px dashed
    ${({ theme }) => (theme?.isDark ? '#333' : 'rgba(0,0,0,0.08)')};

  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }

  strong:first-child {
    color: ${({ $active }) => ($active ? '#1677ff' : 'inherit')};
  }
`

const SummaryDescription = styled.span`
  display: block;
  font-size: 0.85rem;
  color: ${({ theme }) => (theme?.isDark ? '#bfbfbf' : '#7a7a7a')};
`

const TimelineText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-weight: 500;

  span {
    font-size: 0.85rem;
    color: ${({ theme }) => (theme?.isDark ? '#d9d9d9' : '#8c8c8c')};
  }
`

export default OperatorsPage
