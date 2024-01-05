'use client'

import type { Question, Questionnaire } from '@prisma/client'
import { useCallback, useMemo, useState } from 'react'

import styles from './QuestionnaireView.module.scss'
import Image from 'next/image'
import classNames from 'classnames'
import { type UserAnswerCreateRequest } from '~/schemas/UserAnswerRequest'
import FormTextArea from '~/components/atoms/FormTextArea'
import AudioRecorder from '~/components/atoms/AudioRecorder'
import Button from '~/components/atoms/Button'

interface Props {
  questionnaire: Questionnaire & { Questions: Question[] }
  disabled?: boolean
}

interface Recording {
  [questionId: string]: Blob
}

export default function QuestionnaireView({ questionnaire, disabled }: Props) {
  const [answersState, setAnswersState] = useState<UserAnswerCreateRequest>([])
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

  const [recordings, setRecordings] = useState<Recording[]>([])
  const addRecording = useCallback(
    (questionId: string, blob: Blob) => {
      setRecordings((recordings) => {
        const recording = recordings.find((r) => r[questionId])
        if (recording) {
          recording[questionId] = blob
          return [...recordings]
        } else {
          return [...recordings, { [questionId]: blob }]
        }
      })
    },
    [setRecordings]
  )

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
              {!!question.videoUrl && (
                <iframe
                  src={`https://www.youtube.com/embed/${question.videoUrl}`}
                  title="YouTube video player"
                  allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              )}
              {!!question.imageFileId && (
                <div className={styles.imageContainer}>
                  <Image
                    fill
                    src={`/api/upload?id=${question.imageFileId}`}
                    alt={question.title}
                  />
                </div>
              )}
              {!!question.audioFileId && (
                <audio
                  controls
                  src={`/api/upload?id=${question.audioFileId}`}
                />
              )}
            </div>
            <h3>Answer:</h3>
            {question.answerType === 'OPTIONS' && (
              <div className={styles.optionsList}>
                {question.options.map((option) => {
                  const selected = answers.get(question.id)?.answer === option

                  return (
                    <label
                      className={classNames(
                        styles.option,
                        selected && styles.selected
                      )}
                      key={option}
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
              />
            )}

            {question.answerType === 'AUDIO' && (
              <AudioRecorder
                disabled={disabled}
                onRecordingComplete={(blob) => addRecording(question.id, blob)}
              />
            )}
          </div>
        ))}
        <div className={styles.endButtons}>
          <Button color="success">Submit Questionnaire</Button>
        </div>
      </div>
    </form>
  )
}
