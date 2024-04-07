'use client'

import type { AnswerType } from '@prisma/client'
import { useCallback, useMemo, useState } from 'react'

import styles from './QuestionnaireView.module.scss'
import Image from 'next/image'
import classNames from 'classnames'
import { type UserAnswerCreateRequest } from '~/schemas/UserAnswerRequest'
import FormTextArea from '~/components/atoms/FormTextArea'
import AudioRecorder from '~/components/atoms/AudioRecorder'
import Button from '~/components/atoms/Button'
import { useModal } from '~/contexts/ModalContext'
import api from '~/utils/api'
import { useRouter } from 'next/navigation'
import FormInput from '~/components/atoms/FormInput'
import { type GradeRequest, GradeRequestZod } from '~/schemas/GradeRequest'
import convertWebmToMp3 from '~/utils/convertWebmToMp3'
import { uploadDocument } from '~/utils/uploadDocument'

interface Props {
  disabled?: boolean
  showSubmit?: boolean
  showMaterialControls?: boolean
  showInstructorControls?: boolean
  questionnaire: {
    id: string
    title: string
    lessonId?: string
    Questions: {
      id: string
      title: string
      description?: string | null
      videoId?: string | null
      answerType: AnswerType
      options?: string[]
      imageFileUrl?: string | null
      audioFileUrl?: string | null
      UserAnswer?: {
        id: string
        answer?: string | null
        grade?: number | null
        audioFileId?: string | null
        instructorComment?: string | null
      }[]
    }[]
  }
}

interface Recording {
  [questionId: string]: Blob
}

export default function QuestionnaireView({
  questionnaire,
  disabled: disabledProp,
  showSubmit,
  showMaterialControls,
  showInstructorControls,
}: Props) {
  const disabled = disabledProp || showInstructorControls
  const { displayModal, hideModal } = useModal()
  const router = useRouter()

  const answersDb = useMemo(
    () =>
      questionnaire.Questions.reduce((acc, question) => {
        if (question.UserAnswer) {
          acc.push({
            questionId: question.id,
            answer: question.UserAnswer[0]?.answer ?? undefined,
            audioFileId: question.UserAnswer[0]?.audioFileId ?? undefined,
          })
        }
        return acc
      }, [] as UserAnswerCreateRequest),
    [questionnaire.Questions]
  )

  const [answersState, setAnswersState] =
    useState<UserAnswerCreateRequest>(answersDb)
  const answers = useMemo(
    () =>
      new Map<string, UserAnswerCreateRequest[1]>(
        answersState.map((a) => [a.questionId, a])
      ),
    [answersState]
  )
  const setAnswers = useCallback(
    (questionId: string, data: { answer?: string; audioFileId?: string }) => {
      if (!!data.answer && !!data.audioFileId)
        throw new Error('Cannot set both answer and audioFileId')
      if (data.answer === undefined && !data.audioFileId)
        throw new Error('Must set either answer or audioFileId')

      answers.set(questionId, { questionId, ...data })

      setAnswersState(Array.from(answers.values()))
    },
    [answers]
  )

  const [recordings, setRecordings] = useState<Recording>({})
  const addRecording = useCallback((questionId: string, blob: Blob) => {
    setRecordings((recordings) => {
      const newRecordings = { ...recordings }
      newRecordings[questionId] = blob
      return newRecordings
    })
  }, [])
  const recordingsUrlsMap = useMemo(
    () =>
      new Map(
        Object.entries(recordings).map(([k, v]) => [k, URL.createObjectURL(v)])
      ),
    [recordings]
  )

  const handleSubmitAnswers = useCallback(() => {
    if (
      !questionnaire.Questions.every(
        (q) =>
          answers.get(q.id)?.answer ||
          answers.get(q.id)?.audioFileId ||
          recordingsUrlsMap.get(q.id)
      )
    ) {
      displayModal({
        title: 'Error',
        body: 'Cannot submit questionnaire with unanswered questions.',
        buttons: [
          {
            text: 'Close',
            onClick: hideModal,
          },
        ],
      })
      return
    }

    async function submitAnswers() {
      try {
        const blobPromises = Object.entries(recordings).map(
          async ([questionId, blob]) => {
            const blobMp3 = await convertWebmToMp3(blob)
            const promise = uploadDocument(new File([blobMp3], 'audio.mp3'))

            return {
              promise,
              questionId,
              id: '',
            }
          }
        )

        const recordingsPromisesObj = await Promise.all(blobPromises)

        const recordingPromises = recordingsPromisesObj.map(
          (obj) => obj.promise
        )
        const recordingsIds = await Promise.all(recordingPromises)

        recordingsPromisesObj.forEach((obj, index) => {
          obj.id = recordingsIds[index] as string
        })

        const recordingsMap = new Map(
          recordingsPromisesObj.map((obj) => [obj.questionId, obj.id])
        )

        const answersWithFiles = answersState.map((answer) => {
          const audioFileId = recordingsMap.get(answer.questionId)
          return { ...answer, audioFileId }
        })

        await api.post('/api/answer', answersWithFiles)

        location.reload()
        hideModal()
      } catch (error) {
        console.error(error)
        displayModal({
          title: 'Error',
          body: 'There was an error submitting the answers.',
          buttons: [
            {
              text: 'Close',
              color: 'primary',
              onClick: hideModal,
            },
          ],
        })
      }
    }

    displayModal({
      title: 'Submit Answers',
      body: 'Are you sure you want to submit these answers? You will not be able to change them later',
      buttons: [
        {
          text: 'Cancel',
          color: 'primary',
          onClick: hideModal,
        },
        {
          text: 'Submit',
          color: 'success',
          onClick: submitAnswers,
        },
      ],
    })
  }, [
    answersState,
    answers,
    questionnaire.Questions,
    displayModal,
    hideModal,
    recordings,
    recordingsUrlsMap,
  ])

  const gradesDb = useMemo(
    () =>
      questionnaire.Questions.reduce((acc, question) => {
        if (question.UserAnswer?.[0]) {
          acc.push({
            questionId: question.id,
            grade: {
              answerId: question.UserAnswer[0]?.id ?? '',
              grade: question.UserAnswer[0]?.grade || 0,
              instructorComment:
                question.UserAnswer[0]?.instructorComment ?? '',
            },
          })
        }
        return acc
      }, [] as { questionId: string; grade: GradeRequest[1] }[]),
    [questionnaire.Questions]
  )
  const [gradesState, setGradesState] = useState(gradesDb)
  const grades = useMemo(
    () => new Map(gradesState.map((g) => [g.questionId, g.grade])),
    [gradesState]
  )
  console.error(questionnaire.Questions)

  const setGrades = useCallback(
    (questionId: string) =>
      (e: { target: { name: string; value: string } }) => {
        const { name, value } = e.target
        let parsedValue: string | number = value
        if (name === 'grade') {
          parsedValue = parseInt(value)

          if (isNaN(parsedValue)) parsedValue = ''
          else if (parsedValue.toString() !== value) parsedValue = ''
          else if (parsedValue < 0) parsedValue = 0
          else if (parsedValue > 10) parsedValue = 10
        }
        console.error(parsedValue)

        setGradesState((grades) =>
          grades.map((g) => {
            if (g.questionId === questionId) {
              return {
                ...g,
                grade: {
                  ...g.grade,
                  [name]: parsedValue,
                },
              }
            } else {
              return g
            }
          })
        )
      },
    []
  )
  const gradesErrors = useMemo(() => {
    const result = GradeRequestZod.safeParse(gradesState.map((g) => g.grade))

    if (result.success) return null
    return result.error.format()
  }, [gradesState])

  const handleSubmitGrade = useCallback(() => {
    if (!questionnaire.Questions.every((q) => q.UserAnswer?.[0]?.id)) {
      displayModal({
        title: 'Error',
        body: 'Cannot submit grades for questionnaires with unanswered questions.',
        buttons: [
          {
            text: 'Close',
            onClick: hideModal,
          },
        ],
      })
      return
    }

    async function submitGrade() {
      try {
        await api.post(
          '/api/grade',
          gradesState.map((g) => g.grade)
        )

        location.reload()
      } catch (error) {
        console.error(error)
        displayModal({
          title: 'Error',
          body: 'There was an error submitting the grades.',
          buttons: [
            {
              text: 'Close',
              color: 'primary',
              onClick: hideModal,
            },
          ],
        })
      }
    }

    displayModal({
      title: 'Submit Grades',
      body: 'Are you sure you want to submit these grades?',
      buttons: [
        {
          text: 'Cancel',
          color: 'primary',
          onClick: hideModal,
        },
        {
          text: 'Submit',
          color: 'success',
          onClick: submitGrade,
        },
      ],
    })
  }, [displayModal, hideModal, gradesState, questionnaire.Questions])

  const handleDeleteQuestionnaire = useCallback(() => {
    async function deleteQuestionnaire() {
      try {
        await api.delete('/api/questionnaire/', {
          data: { id: questionnaire.id },
        })
        router.push(
          questionnaire.lessonId
            ? `/auth/material/lessons/${questionnaire.lessonId}`
            : '/auth/material/collections'
        )
        router.refresh()
        hideModal()
      } catch (error) {
        console.error(error)
        displayModal({
          title: 'Error',
          body: 'There was an error deleting the questionnaire.',
          buttons: [
            {
              text: 'Close',
              color: 'primary',
              onClick: hideModal,
            },
          ],
        })
      }
    }

    displayModal({
      title: 'Delete Questionnaire',
      body: 'Are you sure you want to delete this questionnaire? This will also delete any questions and answers associated with it.',
      buttons: [
        {
          text: 'Cancel',
          color: 'primary',
          onClick: hideModal,
        },
        {
          text: 'Delete',
          color: 'danger',
          onClick: deleteQuestionnaire,
        },
      ],
    })
  }, [displayModal, hideModal, questionnaire, router])

  return (
    <form className={styles.container}>
      <h1 className={styles.title}>{questionnaire.title}</h1>
      <div className={styles.body}>
        {questionnaire.Questions.map((question, index) => (
          <div key={index} className={styles.question}>
            <h2>
              {index + 1}- {question.title}
            </h2>
            {!!question.description && <p>{question.description}</p>}
            <div className={styles.mediaContainer}>
              {!!question.videoId && (
                <iframe
                  src={`https://www.youtube.com/embed/${question.videoId}`}
                  title="YouTube video player"
                  allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              )}
              {!!question.imageFileUrl && (
                <div className={styles.imageContainer}>
                  <Image
                    fill
                    src={question.imageFileUrl}
                    alt={question.title}
                  />
                </div>
              )}
              {!!question.audioFileUrl && (
                <audio
                  controls
                  className={styles.audio}
                  src={question.audioFileUrl}
                />
              )}
            </div>
            <h3>Answer:</h3>
            {question.answerType === 'OPTIONS' && (
              <div className={styles.optionsList}>
                {question.options?.map((option, index) => {
                  const selected = answers.get(question.id)?.answer === option

                  return (
                    <label
                      className={classNames(
                        styles.option,
                        selected && styles.selected
                      )}
                      key={`${index}-${option}`}
                    >
                      {option}
                      <input
                        className={styles.optionInput}
                        type="radio"
                        name={`options${index}`}
                        value={option}
                        onChange={() =>
                          setAnswers(question.id, { answer: option })
                        }
                        checked={selected}
                        disabled={disabled}
                      />
                    </label>
                  )
                })}
              </div>
            )}

            {question.answerType === 'TEXT' && (
              <FormTextArea
                label=""
                value={answers.get(question.id)?.answer}
                onChange={(e) =>
                  setAnswers(question.id, { answer: e.target.value })
                }
                disabled={disabled}
              />
            )}

            {question.answerType === 'AUDIO' && (
              <AudioRecorder
                disabled={disabled}
                onRecordingComplete={(blob) => addRecording(question.id, blob)}
                recordingUrl={
                  recordingsUrlsMap.get(question.id) ||
                  (answers.get(question.id)?.audioFileId &&
                    `/api/upload?id=${
                      answers.get(question.id)?.audioFileId ?? ''
                    }`)
                }
              />
            )}

            {grades.get(question.id) && (
              <>
                <h3>Grade:</h3>
                <div className={styles.gradeFields}>
                  <FormInput
                    label="Points 0-10:"
                    inputMode="numeric"
                    min="0"
                    max="10"
                    value={grades.get(question.id)?.grade ?? ''}
                    name="grade"
                    onChange={setGrades(question.id)}
                    errors={gradesErrors?.[index]?.grade?._errors}
                    disabled={!showInstructorControls}
                  />
                  <FormTextArea
                    label="Comments:"
                    value={grades.get(question.id)?.instructorComment}
                    name="instructorComment"
                    onChange={setGrades(question.id)}
                    errors={gradesErrors?.[index]?.instructorComment?._errors}
                    disabled={!showInstructorControls}
                  />
                </div>
              </>
            )}
          </div>
        ))}

        <div className={styles.endButtons}>
          {showSubmit && (
            <Button
              type="button"
              disabled={disabled}
              color="success"
              onClick={handleSubmitAnswers}
            >
              Submit
            </Button>
          )}
          {showMaterialControls && (
            <Button
              type="button"
              onClick={handleDeleteQuestionnaire}
              disabled={disabled}
              color="danger"
            >
              Delete Questionnaire
            </Button>
          )}
          {showInstructorControls && (
            <Button type="button" color="success" onClick={handleSubmitGrade}>
              Submit Grades
            </Button>
          )}
        </div>
      </div>
    </form>
  )
}
